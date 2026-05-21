import { db } from "../db/index.js";
import { distanceCache } from "../db/schema/agent.js";
import { and, eq, gt } from "drizzle-orm";

const DISTANCE_TTL_DAYS = 7;

export interface CachedDistance {
  distanceM: number;
  durationS: number;
}

export async function getCachedDistance(
  originLat: number,
  originLng: number,
  destPlaceId: string,
  mode: string,
): Promise<CachedDistance | null> {
  try {
    const [row] = await db
      .select()
      .from(distanceCache)
      .where(
        and(
          eq(distanceCache.originLat, originLat),
          eq(distanceCache.originLng, originLng),
          eq(distanceCache.destPlaceId, destPlaceId),
          eq(distanceCache.mode, mode),
          gt(distanceCache.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!row) return null;
    return { distanceM: row.distanceM, durationS: row.durationS };
  } catch (err) {
    console.error("[distance-cache] Read error:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

export async function setCachedDistance(
  originLat: number,
  originLng: number,
  destPlaceId: string,
  mode: string,
  distanceM: number,
  durationS: number,
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + DISTANCE_TTL_DAYS);

  try {
    await db
      .delete(distanceCache)
      .where(
        and(
          eq(distanceCache.originLat, originLat),
          eq(distanceCache.originLng, originLng),
          eq(distanceCache.destPlaceId, destPlaceId),
          eq(distanceCache.mode, mode),
        ),
      );

    await db.insert(distanceCache).values({
      originLat,
      originLng,
      destPlaceId,
      mode,
      distanceM,
      durationS,
      expiresAt,
    });
  } catch (err) {
    console.error("[distance-cache] Write error:", err instanceof Error ? err.message : String(err));
  }
}
