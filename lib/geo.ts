const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Distância aproximada em metros entre dois pontos (fórmula de
 * Haversine). Determinística — usada na deduplicação de empresas por
 * proximidade geográfica (seção 5).
 */
export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Converte um raio em metros para um delta aproximado em graus de
 * latitude/longitude, com margem de segurança, para uso em filtros de
 * bounding box antes do cálculo exato de distância.
 */
export function metersToDegreeDelta(meters: number): number {
  const METERS_PER_DEGREE_LAT = 111_000;
  return (meters / METERS_PER_DEGREE_LAT) * 1.5;
}
