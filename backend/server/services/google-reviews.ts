/**
 * Google Reviews service — fetches and caches Google reviews for the agency.
 *
 * Uses Google Places API (New) Place Details with 'reviews' field mask.
 * In-memory cache with 24-hour TTL (reviews change rarely, max 5 returned).
 *
 * Cost: Place Details (Advanced — reviews field): ~$0.025/call (~€0.023)
 * Ref: https://developers.google.com/maps/documentation/places/web-service/usage-and-billing
 */

import { db } from "../db/index.js";
import { apiUsageLog } from "../db/schema/agent.js";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? "";
const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID ?? "";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const COST_PLACE_DETAILS_ADVANCED_USD = 0.025;
const REVIEWS_FIELD_MASK = "rating,userRatingCount,reviews";

// ─── Types ──────────────────────────────────────────────────

export interface GoogleReview {
  authorName: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
  time: number;
  profilePhotoUrl: string;
  authorUrl: string;
}

export interface GoogleReviewsResult {
  reviews: GoogleReview[];
  cachedAt: string;
  placeRating: number;
  totalReviews: number;
}

// ─── In-Memory Cache ────────────────────────────────────────

interface CacheEntry {
  data: GoogleReviewsResult;
  expiresAt: number;
}

let cache: CacheEntry | null = null;

// ─── Structured Logging ─────────────────────────────────────

function log(level: "info" | "warn" | "error", event: string, data?: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), level, module: "google-reviews", event, ...data };
  if (level === "error") console.error(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

// ─── Cost Tracking ──────────────────────────────────────────

async function logApiUsage(endpoint: string, costUsd: number): Promise<void> {
  try {
    await db.insert(apiUsageLog).values({
      service: "google_maps",
      endpoint,
      tokensOrUnits: 1,
      estimatedCostEur: costUsd.toFixed(6),
      userSessionId: null,
      propertyId: null,
    });
  } catch (err) {
    log("error", "usage_log_failed", { error: err instanceof Error ? err.message : String(err) });
  }
}

// ─── Fetch Google Reviews ───────────────────────────────────

export async function fetchGoogleReviews(placeId?: string): Promise<GoogleReviewsResult> {
  const targetPlaceId = placeId ?? GOOGLE_PLACE_ID;

  if (!targetPlaceId) {
    log("warn", "place_id_not_configured");
    return { reviews: [], cachedAt: new Date().toISOString(), placeRating: 0, totalReviews: 0 };
  }

  if (cache && Date.now() < cache.expiresAt) {
    log("info", "cache_hit", { placeId: targetPlaceId, cachedAt: cache.data.cachedAt });
    return cache.data;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    log("error", "api_key_missing");
    if (cache) {
      log("warn", "returning_stale_cache");
      return cache.data;
    }
    return { reviews: [], cachedAt: new Date().toISOString(), placeRating: 0, totalReviews: 0 };
  }

  log("info", "api_call", { placeId: targetPlaceId });

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(targetPlaceId)}`,
      {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": REVIEWS_FIELD_MASK,
        },
      },
    );

    if (!response.ok) {
      const text = await response.text();
      log("error", "api_error", { status: response.status, body: text });
      if (cache) {
        log("warn", "returning_stale_cache_on_error");
        return cache.data;
      }
      throw new Error(`Google Places API hiba: ${response.status}`);
    }

    const data = await response.json() as {
      rating?: number;
      userRatingCount?: number;
      reviews?: Array<{
        name?: string;
        originalText?: { text?: string };
        rating?: number;
        relativePublishTimeDescription?: string;
        publishTime?: string;
        authorAttribution?: {
          displayName?: string;
          uri?: string;
          photoUri?: string;
        };
      }>;
    };

    const reviews: GoogleReview[] = (data.reviews ?? []).slice(0, 5).map((r) => ({
      authorName: r.authorAttribution?.displayName ?? "",
      rating: r.rating ?? 0,
      text: r.originalText?.text ?? "",
      relativeTimeDescription: r.relativePublishTimeDescription ?? "",
      time: r.publishTime ? new Date(r.publishTime).getTime() / 1000 : 0,
      profilePhotoUrl: r.authorAttribution?.photoUri ?? "",
      authorUrl: r.authorAttribution?.uri ?? "",
    }));

    const result: GoogleReviewsResult = {
      reviews,
      cachedAt: new Date().toISOString(),
      placeRating: data.rating ?? 0,
      totalReviews: data.userRatingCount ?? 0,
    };

    cache = {
      data: result,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };

    await logApiUsage("places:details:reviews", COST_PLACE_DETAILS_ADVANCED_USD);

    log("info", "api_result", {
      reviewCount: reviews.length,
      placeRating: result.placeRating,
      totalReviews: result.totalReviews,
    });

    return result;
  } catch (err) {
    log("error", "fetch_failed", { error: err instanceof Error ? err.message : String(err) });
    if (cache) {
      log("warn", "returning_stale_cache_on_exception");
      return cache.data;
    }
    return { reviews: [], cachedAt: new Date().toISOString(), placeRating: 0, totalReviews: 0 };
  }
}
