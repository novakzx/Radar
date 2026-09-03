import "server-only";
import type { IncomingBusiness } from "@/types/ingestion";

/**
 * Integração opcional/complementar com a Google Places API. Só é usada
 * se GOOGLE_PLACES_API_KEY estiver configurada nas configurações do
 * usuário/ambiente — nunca chamada do client, chave estritamente
 * server-only.
 *
 * ATENÇÃO (seção 4 do briefing): os Termos de Uso do Google Maps
 * Platform permitem reter o Place ID indefinidamente, mas os demais
 * campos (nome, telefone, rating, website, etc.) têm TTL limitado.
 * `GOOGLE_PLACES_CACHE_TTL_DAYS` expressa esse limite — dados mais
 * antigos que isso devem ser tratados como desatualizados e
 * revalidados, nunca reutilizados indefinidamente. Antes de mudar este
 * valor em produção, reconfirme os Termos vigentes do Google Maps
 * Platform.
 */
export const GOOGLE_PLACES_CACHE_TTL_DAYS = 30;

export function isGooglePlacesDataStale(fetchedAt: Date, now: Date = new Date()): boolean {
  const ttlMs = GOOGLE_PLACES_CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
  return now.getTime() - fetchedAt.getTime() > ttlMs;
}

export function isGooglePlacesConfigured(): boolean {
  return !!process.env.GOOGLE_PLACES_API_KEY;
}

interface NearbySearchResult {
  place_id: string;
  name: string;
  geometry: { location: { lat: number; lng: number } };
  vicinity?: string;
}

interface PlaceDetailsResult {
  place_id: string;
  name: string;
  website?: string;
  formatted_phone_number?: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
}

export interface GooglePlacesSearchParams {
  lat: number;
  lng: number;
  radiusMeters: number;
  keyword: string;
}

/**
 * Busca estabelecimentos via Google Places (Nearby Search + Place
 * Details para obter o campo `website`, ausente na busca por
 * proximidade). Retorna `[]` sem erro se não houver chave configurada
 * — é uma fonte complementar/opcional, nunca obrigatória.
 */
export async function fetchBusinessesFromGooglePlaces(
  params: GooglePlacesSearchParams,
): Promise<IncomingBusiness[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  const nearbyUrl = new URL(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
  );
  nearbyUrl.searchParams.set("location", `${params.lat},${params.lng}`);
  nearbyUrl.searchParams.set("radius", String(Math.round(params.radiusMeters)));
  nearbyUrl.searchParams.set("keyword", params.keyword);
  nearbyUrl.searchParams.set("key", apiKey);

  const nearbyResponse = await fetch(nearbyUrl, { cache: "no-store" });
  if (!nearbyResponse.ok) {
    throw new Error(`Google Places (Nearby Search) respondeu ${nearbyResponse.status}`);
  }

  const nearbyData = (await nearbyResponse.json()) as {
    status: string;
    results?: NearbySearchResult[];
  };

  if (nearbyData.status !== "OK" && nearbyData.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places (Nearby Search) status: ${nearbyData.status}`);
  }

  const results = nearbyData.results ?? [];
  const incoming: IncomingBusiness[] = [];

  for (const place of results) {
    const details = await fetchPlaceDetails(place.place_id, apiKey);
    incoming.push({
      source: "google_places",
      sourceId: place.place_id,
      name: details?.name ?? place.name,
      category: null,
      address: details?.formatted_address ?? place.vicinity ?? null,
      city: null,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      phone: details?.formatted_phone_number ?? null,
      website: details?.website ?? null,
      socialMediaUrl: null,
      rating: details?.rating ?? null,
      reviewCount: details?.user_ratings_total ?? null,
      isIndependent: null,
      rawPayload: { nearby: place, details } as unknown,
    });
  }

  return incoming;
}

async function fetchPlaceDetails(
  placeId: string,
  apiKey: string,
): Promise<PlaceDetailsResult | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set(
    "fields",
    "place_id,name,website,formatted_phone_number,formatted_address,rating,user_ratings_total",
  );
  url.searchParams.set("key", apiKey);

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;

  const data = (await response.json()) as { status: string; result?: PlaceDetailsResult };
  if (data.status !== "OK" || !data.result) return null;

  return data.result;
}
