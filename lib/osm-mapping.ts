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

/** Tags do OSM que costumam trazer um handle/URL de rede social — checadas em ordem. */
const SOCIAL_TAG_DOMAINS: { key: string; domain: string }[] = [
  { key: "contact:instagram", domain: "instagram.com" },
  { key: "instagram", domain: "instagram.com" },
  { key: "contact:facebook", domain: "facebook.com" },
  { key: "facebook", domain: "facebook.com" },
  { key: "contact:twitter", domain: "twitter.com" },
  { key: "twitter", domain: "twitter.com" },
  { key: "contact:x", domain: "x.com" },
  { key: "contact:linkedin", domain: "linkedin.com" },
  { key: "linkedin", domain: "linkedin.com" },
  { key: "contact:youtube", domain: "youtube.com" },
  { key: "youtube", domain: "youtube.com" },
  { key: "contact:tiktok", domain: "tiktok.com" },
  { key: "tiktok", domain: "tiktok.com" },
];

// Domínios que, mesmo aparecendo no campo "website", não são um site
// próprio da empresa — são um perfil de rede social.
const SOCIAL_MEDIA_HOSTS = [
  "instagram.com",
  "facebook.com",
  "fb.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "threads.net",
  "pinterest.com",
  "wa.me",
  "whatsapp.com",
];

/** Função pura — verdadeiro se a URL aponta para um domínio de rede social conhecido. */
export function isSocialMediaUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return SOCIAL_MEDIA_HOSTS.some((social) => host === social || host.endsWith(`.${social}`));
  } catch {
    return false;
  }
}

/**
 * Lê website e rede social das tags do OSM de forma unificada — usada
 * tanto na ingestão (lib/osm-mapping.ts) quanto ao reler fontes já
 * persistidas (services/BusinessService.ts), pra nunca divergir.
 *
 * Cobre mais tags de rede social do que só `contact:instagram`/
 * `contact:facebook` (Twitter/X, LinkedIn, YouTube, TikTok, com e sem
 * o prefixo `contact:`) e corrige um caso comum: quando alguém
 * preenche o campo `website` com um link de rede social em vez de um
 * site próprio, ele é reclassificado como `socialMediaUrl` — nunca
 * conta como "website encontrado".
 */
export function extractOsmContactInfo(
  tags: Record<string, string>,
): { website: string | null; socialMediaUrl: string | null } {
  const rawWebsite = tags.website?.trim() ?? tags["contact:website"]?.trim() ?? null;
  const websiteIsSocial = !!rawWebsite && isSocialMediaUrl(rawWebsite);

  const socialMediaUrl =
    SOCIAL_TAG_DOMAINS.reduce<string | null>(
      (found, { key, domain }) => found ?? buildSocialUrl(tags[key], domain),
      null,
    ) ?? (websiteIsSocial ? rawWebsite : null);

  return {
    website: websiteIsSocial ? null : rawWebsite,
    socialMediaUrl,
  };
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

  const { website, socialMediaUrl } = extractOsmContactInfo(tags);
  const phone = tags.phone ?? tags["contact:phone"] ?? null;

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
