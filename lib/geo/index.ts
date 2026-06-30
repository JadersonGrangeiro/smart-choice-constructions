// Geolocation utilities — works today with ZIP/city lookups and is ready for
// lat/lon proximity search once migration_006 columns are populated.

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeoSearchParams {
  coordinates?: Coordinates;
  zipCode?: string;
  radiusMiles?: number;
  city?: string;
  stateCode?: string;
}

// ── Haversine great-circle distance (miles) ──────────────────────────────────
export function distanceMiles(a: Coordinates, b: Coordinates): number {
  const R = 3958.8;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLon * sinLon;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// ── Bounding box for fast DB pre-filter before precise haversine ─────────────
// Use in SQL: WHERE latitude BETWEEN minLat AND maxLat AND longitude BETWEEN minLon AND maxLon
export function boundingBox(
  center: Coordinates,
  radiusMiles: number,
): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
  const latDelta = radiusMiles / 69.0;
  const lonDelta = radiusMiles / (69.0 * Math.cos(toRad(center.latitude)));
  return {
    minLat: center.latitude - latDelta,
    maxLat: center.latitude + latDelta,
    minLon: center.longitude - lonDelta,
    maxLon: center.longitude + lonDelta,
  };
}

// ── Sort an array of entities by distance from a point ──────────────────────
export function sortByDistance<T extends { latitude?: number | null; longitude?: number | null }>(
  items: T[],
  from: Coordinates,
): (T & { distanceMiles: number })[] {
  return items
    .map(item => ({
      ...item,
      distanceMiles:
        item.latitude != null && item.longitude != null
          ? distanceMiles(from, { latitude: item.latitude, longitude: item.longitude })
          : Infinity,
    }))
    .sort((a, b) => a.distanceMiles - b.distanceMiles);
}

// ── Format coordinates for display / logging ─────────────────────────────────
export function formatCoordinates(coords: Coordinates): string {
  return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
}

// ── Validate that a coordinate pair is within Earth bounds ───────────────────
export function isValidCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}
