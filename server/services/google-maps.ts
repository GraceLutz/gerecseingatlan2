/**
 * Google Maps API client with aggressive caching and cost tracking.
 *
 * Uses Google Maps Places API (New) for Nearby Search and Place Details,
 * and the legacy Distance Matrix API. All calls are cached in PostgreSQL
 * and every request is logged to api_usage_log with cost estimates.
 *
 * Cost estimates (Google Maps Platform, May 2025):
 * - Nearby Search (Basic): $0.032/call (~€0.029)
 * - Place Details (Basic): $0.017/call (~€0.016)
 * - Distance Matrix: $0.005/element (~€0.0046)
 */

import { db } from "../db/index.js";
import { apiUsageLog } from "../db/schema/agent.js";
import { computeQueryHash, getCachedPlaces, setCachedPlaces } from "./places-cache.js";
import { getCachedDistance, setCachedDistance } from "./distance-cache.js";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? "";

const DEFAULT_RADIUS = 1500;
const MAX_RADIUS = 3000;
const MAX_RESULTS = 10;

// Cost per API call in EUR (approximate, based on May 2025 pricing)
const COST_NEARBY_SEARCH_EUR = 0.029;
const COST_PLACE_DETAILS_EUR = 0.016;
const COST_DISTANCE_MATRIX_EUR = 0.0046;

// ─── Types ──────────────────────────────────────────────────

export interface NearbyPlace {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  types: string[];
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  types: string[];
  phone: string | null;
  website: string | null;
  openingHours: string[] | null;
}

export interface DistanceResult {
  distanceM: number;
  durationS: number;
  distanceText: string;
  durationText: string;
}

// ─── Structured Logging ─────────────────────────────────────

function log(level: "info" | "warn" | "error", event: string, data?: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), level, module: "google-maps", event, ...data };
  if (level === "error") console.error(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

// ─── Cost Tracking ──────────────────────────────────────────

async function logApiUsage(
  endpoint: string,
  costEur: number,
  sessionId?: string,
  propertyId?: string,
): Promise<void> {
  try {
    await db.insert(apiUsageLog).values({
      service: "google_maps",
      endpoint,
      tokensOrUnits: 1,
      estimatedCostEur: costEur.toFixed(6),
      userSessionId: sessionId ?? null,
      propertyId: propertyId ?? null,
    });
  } catch (err) {
    log("error", "usage_log_failed", { error: err instanceof Error ? err.message : String(err) });
  }
}

// ─── Validation ─────────────────────────────────────────────

function assertApiKey(): void {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("GOOGLE_MAPS_API_KEY nincs beállítva.");
  }
}

// ─── Nearby Search (Places API New) ─────────────────────────

const NEARBY_FIELD_MASK = "places.id,places.displayName,places.location,places.rating,places.types,places.formattedAddress";

export async function searchNearbyPlaces(
  lat: number,
  lng: number,
  type: string,
  radius?: number,
  sessionId?: string,
  propertyId?: string,
): Promise<NearbyPlace[]> {
  const clampedRadius = Math.min(radius ?? DEFAULT_RADIUS, MAX_RADIUS);
  const queryHash = computeQueryHash(lat, lng, type, clampedRadius);

  const cached = await getCachedPlaces(queryHash);
  if (cached) {
    log("info", "nearby_cache_hit", { lat, lng, type, radius: clampedRadius });
    return cached as NearbyPlace[];
  }

  assertApiKey();

  const body = {
    includedTypes: [type],
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: clampedRadius,
      },
    },
    maxResultCount: MAX_RESULTS,
    languageCode: "hu",
  };

  log("info", "nearby_api_call", { lat, lng, type, radius: clampedRadius });

  const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": NEARBY_FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    log("error", "nearby_api_error", { status: response.status, body: text });
    throw new Error(`Google Places API hiba: ${response.status}`);
  }

  const data = await response.json() as {
    places?: Array<{
      id: string;
      displayName?: { text: string };
      location?: { latitude: number; longitude: number };
      rating?: number;
      types?: string[];
      formattedAddress?: string;
    }>;
  };

  const places: NearbyPlace[] = (data.places ?? []).map((p) => ({
    placeId: p.id,
    name: p.displayName?.text ?? "",
    address: p.formattedAddress ?? "",
    lat: p.location?.latitude ?? 0,
    lng: p.location?.longitude ?? 0,
    rating: p.rating ?? null,
    types: p.types ?? [],
  }));

  await setCachedPlaces(queryHash, places);
  await logApiUsage("places:searchNearby", COST_NEARBY_SEARCH_EUR, sessionId, propertyId);

  log("info", "nearby_api_result", { count: places.length });
  return places;
}

// ─── Place Details (Places API New) ─────────────────────────

const DETAILS_FIELD_MASK = "id,displayName,location,rating,formattedAddress,types,regularOpeningHours,internationalPhoneNumber,websiteUri";

export async function getPlaceDetails(
  placeId: string,
  sessionId?: string,
  propertyId?: string,
): Promise<PlaceDetails | null> {
  // Cache place details using a synthetic hash
  const queryHash = computeQueryHash(0, 0, `details:${placeId}`, 0);

  const cached = await getCachedPlaces(queryHash);
  if (cached) {
    log("info", "details_cache_hit", { placeId });
    return cached as PlaceDetails;
  }

  assertApiKey();

  log("info", "details_api_call", { placeId });

  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": DETAILS_FIELD_MASK,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    log("error", "details_api_error", { status: response.status, body: text });
    throw new Error(`Google Place Details API hiba: ${response.status}`);
  }

  const p = await response.json() as {
    id: string;
    displayName?: { text: string };
    location?: { latitude: number; longitude: number };
    rating?: number;
    formattedAddress?: string;
    types?: string[];
    regularOpeningHours?: { weekdayDescriptions?: string[] };
    internationalPhoneNumber?: string;
    websiteUri?: string;
  };

  const details: PlaceDetails = {
    placeId: p.id,
    name: p.displayName?.text ?? "",
    address: p.formattedAddress ?? "",
    lat: p.location?.latitude ?? 0,
    lng: p.location?.longitude ?? 0,
    rating: p.rating ?? null,
    types: p.types ?? [],
    phone: p.internationalPhoneNumber ?? null,
    website: p.websiteUri ?? null,
    openingHours: p.regularOpeningHours?.weekdayDescriptions ?? null,
  };

  await setCachedPlaces(queryHash, details);
  await logApiUsage("places:details", COST_PLACE_DETAILS_EUR, sessionId, propertyId);

  log("info", "details_api_result", { name: details.name });
  return details;
}

// ─── Distance Matrix (Legacy API) ───────────────────────────

export async function calculateDistance(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  mode: "driving" | "walking" | "transit",
  sessionId?: string,
  propertyId?: string,
): Promise<DistanceResult | null> {
  // For distance cache we need a place ID, but we receive coords.
  // Use a synthetic place ID from dest coords for caching.
  const destPlaceId = `coords:${destLat.toFixed(5)},${destLng.toFixed(5)}`;

  const cached = await getCachedDistance(originLat, originLng, destPlaceId, mode);
  if (cached) {
    log("info", "distance_cache_hit", { originLat, originLng, destLat, destLng, mode });
    return {
      distanceM: cached.distanceM,
      durationS: cached.durationS,
      distanceText: formatDistance(cached.distanceM),
      durationText: formatDuration(cached.durationS),
    };
  }

  assertApiKey();

  const params = new URLSearchParams({
    origins: `${originLat},${originLng}`,
    destinations: `${destLat},${destLng}`,
    mode,
    language: "hu",
    key: GOOGLE_MAPS_API_KEY,
  });

  log("info", "distance_api_call", { originLat, originLng, destLat, destLng, mode });

  const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`);

  if (!response.ok) {
    const text = await response.text();
    log("error", "distance_api_error", { status: response.status, body: text });
    throw new Error(`Google Distance Matrix API hiba: ${response.status}`);
  }

  const data = await response.json() as {
    status: string;
    rows?: Array<{
      elements?: Array<{
        status: string;
        distance?: { value: number; text: string };
        duration?: { value: number; text: string };
      }>;
    }>;
  };

  if (data.status !== "OK") {
    log("error", "distance_api_status", { status: data.status });
    throw new Error(`Distance Matrix válasz hiba: ${data.status}`);
  }

  const element = data.rows?.[0]?.elements?.[0];
  if (!element || element.status !== "OK" || !element.distance || !element.duration) {
    log("warn", "distance_no_result", { elementStatus: element?.status });
    return null;
  }

  const result: DistanceResult = {
    distanceM: element.distance.value,
    durationS: element.duration.value,
    distanceText: element.distance.text,
    durationText: element.duration.text,
  };

  await setCachedDistance(originLat, originLng, destPlaceId, mode, result.distanceM, result.durationS);
  await logApiUsage("distancematrix", COST_DISTANCE_MATRIX_EUR, sessionId, propertyId);

  log("info", "distance_api_result", { distanceM: result.distanceM, durationS: result.durationS });
  return result;
}

// ─── Formatting Helpers ─────────────────────────────────────

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} perc`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return `${hours} óra`;
  return `${hours} óra ${remaining} perc`;
}
