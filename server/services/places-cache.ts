import crypto from "crypto";
import { db } from "../db/index.js";
import { placesCache } from "../db/schema/agent.js";
import { eq, sql } from "drizzle-orm";

const PLACES_TTL_DAYS = 30;

export function computeQueryHash(lat: number, lng: number, type: string, radius: number): string {
  const raw = `${lat.toFixed(5)}|${lng.toFixed(5)}|${type}|${radius}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function getCachedPlaces(queryHash: string): Promise<unknown | null> {
  try {
    const [row] = await db
      .select()
      .from(placesCache)
      .where(eq(placesCache.queryHash, queryHash))
      .limit(1);

    if (!row || new Date(row.expiresAt) < new Date()) {
      return null;
    }

    await db
      .update(placesCache)
      .set({ hitCount: sql`${placesCache.hitCount} + 1` })
      .where(eq(placesCache.id, row.id));

    return row.result;
  } catch (err) {
    console.error("[places-cache] Read error:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

export async function setCachedPlaces(queryHash: string, result: unknown): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + PLACES_TTL_DAYS);

  try {
    await db
      .insert(placesCache)
      .values({ queryHash, result, expiresAt })
      .onConflictDoUpdate({
        target: placesCache.queryHash,
        set: { result, expiresAt, hitCount: 0 },
      });
  } catch (err) {
    console.error("[places-cache] Write error:", err instanceof Error ? err.message : String(err));
  }
}
