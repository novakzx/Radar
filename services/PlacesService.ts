import "server-only";
import { resolveOsmTagFilters } from "@/lib/osm-categories";
import type { IncomingBusiness } from "@/types/ingestion";

export interface RawOverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface OverpassSearchParams {
  lat: number;
  lng: number;
  radiusMeters: number;
  category?: string | null;
  keyword?: string | null;
}

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
// Limite defensivo para a Fase 1: evita respostas gigantes / timeout da
// função serverless. Fases seguintes podem paginar em lotes reais.
const MAX_RESULTS = 80;
// A Overpass API exige um User-Agent identificável (e pode responder
// 406 sem um Accept explícito) — mesma cortesia de uso do Nominatim.
const USER_AGENT = "CodeVisionRadar/0.1 (prospeccao comercial; contato via app)";

/**
 * Busca estabelecimentos via Overpass API (OpenStreetMap) — fonte
 * primária/default, sem custo e sem necessidade de chave.
 */
export async function fetchBusinessesFromOverpass(
  params: OverpassSearchParams,
): Promise<RawOverpassElement[]> {
  const query = buildOverpassQuery(params);

  const response = await fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    body: `data=${encodeURIComponent(query)}`,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Overpass API respondeu com status ${response.status}`);
  }

  const data = (await response.json()) as { elements?: RawOverpassElement[] };
  const elements = data.elements ?? [];

  return elements.filter((element) => !!element.tags?.name).slice(0, MAX_RESULTS);
}

function buildOverpassQuery(params: OverpassSearchParams): string {
  const { lat, lng, radiusMeters, category, keyword } = params;
  const around = `(around:${Math.round(radiusMeters)},${lat},${lng})`;
  const tagFilters = resolveOsmTagFilters(category);

  const clauses: string[] = [];

  if (tagFilters && tagFilters.length > 0) {
    for (const filter of tagFilters) {
      const tagExpr = `["${filter.key}"="${filter.value}"]`;
      clauses.push(`node${tagExpr}${around};`);
      clauses.push(`way${tagExpr}${around};`);
    }
  } else {
    const term = escapeOverpassRegexTerm(keyword ?? category ?? "");
    if (!term) {
      throw new Error(
        "Informe uma categoria reconhecida ou uma palavra-chave para a busca.",
      );
    }
    clauses.push(`node["name"~"${term}",i]${around};`);
    clauses.push(`way["name"~"${term}",i]${around};`);
  }

  return `[out:json][timeout:25];(${clauses.join("")});out center tags;`;
}

function escapeOverpassRegexTerm(value: string): string {
  // Remove aspas e barras invertidas para não quebrar a query Overpass.
  return value.trim().replace(/["\\]/g, "");
}

/** Converte um elemento bruto do Overpass no formato comum de ingestão. */
export function mapOverpassElementToIncomingBusiness(
  element: RawOverpassElement,
): IncomingBusiness | null {
  const tags = element.tags ?? {};
  const name = tags.name?.trim();
  if (!name) return null;

  const lat = element.lat ?? element.center?.lat ?? null;
  const lng = element.lon ?? element.center?.lon ?? null;

  const website = tags.website ?? tags["contact:website"] ?? null;
  const phone = tags.phone ?? tags["contact:phone"] ?? null;
  const socialMediaUrl =
    buildSocialUrl(tags["contact:instagram"], "instagram.com") ??
    buildSocialUrl(tags["contact:facebook"], "facebook.com") ??
    null;

  const category = tags.shop ?? tags.amenity ?? tags.office ?? tags.leisure ?? null;

  const addressParts = [tags["addr:street"], tags["addr:housenumber"]].filter(
    (part): part is string => !!part,
  );
  const address = addressParts.length > 0 ? addressParts.join(", ") : null;
  const city = tags["addr:city"] ?? null;

  // Heurística determinística: presença de `brand`/`operator` indica
  // rede ou franquia; ausência sugere negócio local independente.
  const isIndependent = !(tags.brand || tags.operator);

  return {
    source: "osm",
    sourceId: `${element.type}/${element.id}`,
    name,
    category,
    address,
    city,
    lat,
    lng,
    phone: phone ?? null,
    website: website ?? null,
    socialMediaUrl,
    rating: null,
    reviewCount: null,
    isIndependent,
    rawPayload: element as unknown,
  };
}

export function buildSocialUrl(handleOrUrl: string | undefined, domain: string): string | null {
  if (!handleOrUrl) return null;
  const trimmed = handleOrUrl.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${domain}/${trimmed.replace(/^@/, "")}`;
}
