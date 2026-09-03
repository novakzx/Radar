import "server-only";

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

// Nominatim exige um User-Agent identificável e pede uso moderado
// (no máx. ~1 requisição/segundo). Não há chave — é a mesma "fonte"
// OpenStreetMap usada pela Overpass API para os dados de negócios.
const USER_AGENT = "CodeVisionRadar/0.1 (prospeccao comercial; contato via app)";

/**
 * Geocodifica uma localização em texto livre (ex.: "Almada, Portugal")
 * para coordenadas. Não faz suposições de região — aceita qualquer
 * localização pesquisável no OpenStreetMap.
 */
export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Nominatim respondeu com status ${response.status}`);
  }

  const data = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const [first] = data;
  return {
    lat: Number.parseFloat(first.lat),
    lng: Number.parseFloat(first.lon),
    displayName: first.display_name,
  };
}
