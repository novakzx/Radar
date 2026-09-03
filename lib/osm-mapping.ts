import type { IncomingBusiness } from "@/types/ingestion";

export interface RawOverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const WIKIMEDIA_COMMONS_FILE_PATH = "https://commons.wikimedia.org/wiki/Special:FilePath/";

/**
 * Extrai uma URL de foto a partir das tags OSM, sem depender de
 * nenhuma API paga: `image` quando já é uma URL direta, ou
 * `image`/`wikimedia_commons` quando referenciam um arquivo do
 * Wikimedia Commons (`File:Nome.jpg`), resolvido via o endpoint
 * público `Special:FilePath` (redireciona para o arquivo real).
 * Função pura — mesma entrada, mesma saída.
 */
export function extractOsmPhotoUrl(tags: Record<string, string>): string | null {
  const image = tags.image?.trim();
  if (image && /^https?:\/\//i.test(image)) {
    return image;
  }

  const commonsRef = image?.startsWith("File:") ? image : tags.wikimedia_commons?.trim();
  if (commonsRef?.startsWith("File:")) {
    return `${WIKIMEDIA_COMMONS_FILE_PATH}${encodeURIComponent(commonsRef.slice("File:".length))}?width=480`;
  }

  return null;
}

/** Função pura — converte um handle ou URL de rede social numa URL completa. */
export function buildSocialUrl(handleOrUrl: string | undefined, domain: string): string | null {
  if (!handleOrUrl) return null;
  const trimmed = handleOrUrl.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${domain}/${trimmed.replace(/^@/, "")}`;
}

/** Converte um elemento bruto do Overpass no formato comum de ingestão. Função pura. */
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
  const photoUrl = extractOsmPhotoUrl(tags);

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
    photoUrl,
    rating: null,
    reviewCount: null,
    isIndependent,
    rawPayload: element as unknown,
  };
}
