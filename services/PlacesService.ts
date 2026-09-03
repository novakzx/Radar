import "server-only";
import { resolveOsmTagFilters } from "@/lib/osm-categories";
import type { RawOverpassElement } from "@/lib/osm-mapping";

export type { RawOverpassElement } from "@/lib/osm-mapping";
export {
  buildSocialUrl,
  extractOsmContactInfo,
  extractOsmPhotoUrl,
  isSocialMediaUrl,
  mapOverpassElementToIncomingBusiness,
} from "@/lib/osm-mapping";

export interface OverpassSearchParams {
  lat: number;
  lng: number;
  radiusMeters: number;
  category?: string | null;
  keyword?: string | null;
}

// A Overpass API pública (overpass-api.de) é um serviço gratuito e
// compartilhado, sem SLA — trava com 504/502 sob carga. Para não
// derrubar a busca inteira por isso, tentamos alguns espelhos públicos
// em sequência antes de desistir.
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];
// Timeout do nosso lado por tentativa — um pouco acima do [timeout:N]
// embutido na query, para dar tempo do próprio Overpass responder com
// um erro claro antes de simplesmente abortarmos a conexão.
const FETCH_TIMEOUT_MS = 12_000;
const QUERY_TIMEOUT_SECONDS = 10;
// Limite defensivo para a Fase 1: evita respostas gigantes / timeout da
// função serverless. Fases seguintes podem paginar em lotes reais.
const MAX_RESULTS = 80;
// A Overpass API exige um User-Agent identificável (e pode responder
// 406 sem um Accept explícito) — mesma cortesia de uso do Nominatim.
const USER_AGENT = "AreaVon/0.1 (prospeccao comercial; contato via app)";

/**
 * Busca estabelecimentos via Overpass API (OpenStreetMap) — fonte
 * primária/default, sem custo e sem necessidade de chave. Tenta vários
 * espelhos públicos em sequência (a Overpass API é notoriamente
 * instável sob carga) antes de reportar falha.
 */
export async function fetchBusinessesFromOverpass(
  params: OverpassSearchParams,
): Promise<RawOverpassElement[]> {
  const query = buildOverpassQuery(params);

  let lastError: unknown = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const elements = await fetchFromEndpoint(endpoint, query);
      return elements.filter((element) => !!element.tags?.name).slice(0, MAX_RESULTS);
    } catch (error) {
      lastError = error;
      console.error(`[PlacesService] Overpass (${endpoint}) falhou, tentando próximo espelho`, error);
    }
  }

  throw new Error(
    `Overpass API indisponível em todos os espelhos tentados: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

async function fetchFromEndpoint(
  endpoint: string,
  query: string,
): Promise<RawOverpassElement[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      body: `data=${encodeURIComponent(query)}`,
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }

    const data = (await response.json()) as {
      elements?: RawOverpassElement[];
      remark?: string;
    };

    // A Overpass às vezes responde 200 OK mas com um "remark" avisando
    // que estourou o timeout internamente (elements vem vazio nesse
    // caso) — isso não é "nenhum resultado encontrado", é uma falha
    // disfarçada. Tratamos como erro para tentar o próximo espelho.
    if (data.remark?.toLowerCase().includes("timed out")) {
      throw new Error(`Overpass timeout interno: ${data.remark}`);
    }

    return data.elements ?? [];
  } finally {
    clearTimeout(timeoutId);
  }
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
    // Sem categoria mapeada, busca por nome — mas restringe a
    // elementos que já tenham algum tipo de tag comercial (shop,
    // amenity, office, craft ou leisure). Sem essa restrição, o
    // Overpass varre TODOS os nós do planeta por nome e costuma
    // estourar o timeout (504) — foi exatamente esse o bug relatado.
    const commercialKey = '["~"^(shop|amenity|office|craft|leisure)$"~"."]';
    clauses.push(`node["name"~"${term}",i]${commercialKey}${around};`);
    clauses.push(`way["name"~"${term}",i]${commercialKey}${around};`);
  }

  return `[out:json][timeout:${QUERY_TIMEOUT_SECONDS}];(${clauses.join("")});out center tags;`;
}

function escapeOverpassRegexTerm(value: string): string {
  // Remove aspas e barras invertidas para não quebrar a query Overpass.
  return value.trim().replace(/["\\]/g, "");
}
