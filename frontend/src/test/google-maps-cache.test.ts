import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { z } from "zod";

/**
 * Unit tests for Google Maps caching layer (T4).
 * Tests pure functions (hash computation, validation schemas) without DB.
 */

// ─── computeQueryHash ─────────────────────────────────────

function computeQueryHash(lat: number, lng: number, type: string, radius: number): string {
  const raw = `${lat.toFixed(5)}|${lng.toFixed(5)}|${type}|${radius}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

describe("computeQueryHash", () => {
  it("returns a 64-character hex string", () => {
    const hash = computeQueryHash(47.73, 18.73, "school", 1500);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("produces identical hashes for identical inputs", () => {
    const a = computeQueryHash(47.73, 18.73, "school", 1500);
    const b = computeQueryHash(47.73, 18.73, "school", 1500);
    expect(a).toBe(b);
  });

  it("produces different hashes when lat differs", () => {
    const a = computeQueryHash(47.73, 18.73, "school", 1500);
    const b = computeQueryHash(47.74, 18.73, "school", 1500);
    expect(a).not.toBe(b);
  });

  it("produces different hashes when lng differs", () => {
    const a = computeQueryHash(47.73, 18.73, "school", 1500);
    const b = computeQueryHash(47.73, 18.74, "school", 1500);
    expect(a).not.toBe(b);
  });

  it("produces different hashes when type differs", () => {
    const a = computeQueryHash(47.73, 18.73, "school", 1500);
    const b = computeQueryHash(47.73, 18.73, "pharmacy", 1500);
    expect(a).not.toBe(b);
  });

  it("produces different hashes when radius differs", () => {
    const a = computeQueryHash(47.73, 18.73, "school", 1500);
    const b = computeQueryHash(47.73, 18.73, "school", 3000);
    expect(a).not.toBe(b);
  });

  it("rounds coords to 5 decimal places so minor float drift is ignored", () => {
    const a = computeQueryHash(47.730001, 18.730001, "school", 1500);
    const b = computeQueryHash(47.730002, 18.730002, "school", 1500);
    expect(a).toBe(b);
  });

  it("distinguishes place details from nearby search via type prefix", () => {
    const nearby = computeQueryHash(0, 0, "school", 1500);
    const details = computeQueryHash(0, 0, "details:ChIJ123", 0);
    expect(nearby).not.toBe(details);
  });
});

// ─── Validation schemas ─────────────────────────────────────

const nearbyPlaceSchema = z.object({
  placeId: z.string(),
  name: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  rating: z.number().nullable(),
  types: z.array(z.string()),
});

const placeDetailsSchema = nearbyPlaceSchema.extend({
  phone: z.string().nullable(),
  website: z.string().nullable(),
  openingHours: z.array(z.string()).nullable(),
});

const cachedDistanceSchema = z.object({
  distanceM: z.number().int().nonnegative(),
  durationS: z.number().int().nonnegative(),
});

describe("cache validation schemas", () => {
  describe("nearbyPlaceSchema", () => {
    it("accepts a valid nearby place", () => {
      const result = nearbyPlaceSchema.safeParse({
        placeId: "ChIJ123",
        name: "Tesco",
        address: "Dorog, Fő utca 1",
        lat: 47.73,
        lng: 18.73,
        rating: 4.2,
        types: ["supermarket", "store"],
      });
      expect(result.success).toBe(true);
    });

    it("accepts null rating", () => {
      const result = nearbyPlaceSchema.safeParse({
        placeId: "ChIJ123",
        name: "Tesco",
        address: "Dorog",
        lat: 47.73,
        lng: 18.73,
        rating: null,
        types: [],
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing placeId", () => {
      const result = nearbyPlaceSchema.safeParse({
        name: "Tesco",
        address: "Dorog",
        lat: 47.73,
        lng: 18.73,
        rating: null,
        types: [],
      });
      expect(result.success).toBe(false);
    });

    it("rejects non-array types", () => {
      const result = nearbyPlaceSchema.safeParse({
        placeId: "ChIJ123",
        name: "Tesco",
        address: "Dorog",
        lat: 47.73,
        lng: 18.73,
        rating: null,
        types: "supermarket",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("placeDetailsSchema", () => {
    it("accepts a full place details object", () => {
      const result = placeDetailsSchema.safeParse({
        placeId: "ChIJ123",
        name: "Tesco",
        address: "Dorog, Fő utca 1",
        lat: 47.73,
        lng: 18.73,
        rating: 4.2,
        types: ["supermarket"],
        phone: "+36 1 234 5678",
        website: "https://tesco.hu",
        openingHours: ["Hétfő: 7:00–21:00"],
      });
      expect(result.success).toBe(true);
    });

    it("accepts null phone, website, and openingHours", () => {
      const result = placeDetailsSchema.safeParse({
        placeId: "ChIJ123",
        name: "Unknown",
        address: "",
        lat: 0,
        lng: 0,
        rating: null,
        types: [],
        phone: null,
        website: null,
        openingHours: null,
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing phone field", () => {
      const result = placeDetailsSchema.safeParse({
        placeId: "ChIJ123",
        name: "Tesco",
        address: "Dorog",
        lat: 47.73,
        lng: 18.73,
        rating: null,
        types: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("cachedDistanceSchema", () => {
    it("accepts valid distance data", () => {
      const result = cachedDistanceSchema.safeParse({ distanceM: 1200, durationS: 900 });
      expect(result.success).toBe(true);
    });

    it("accepts zero values", () => {
      const result = cachedDistanceSchema.safeParse({ distanceM: 0, durationS: 0 });
      expect(result.success).toBe(true);
    });

    it("rejects negative distance", () => {
      const result = cachedDistanceSchema.safeParse({ distanceM: -100, durationS: 900 });
      expect(result.success).toBe(false);
    });

    it("rejects non-integer distance", () => {
      const result = cachedDistanceSchema.safeParse({ distanceM: 1200.5, durationS: 900 });
      expect(result.success).toBe(false);
    });

    it("rejects missing fields", () => {
      const result = cachedDistanceSchema.safeParse({ distanceM: 1200 });
      expect(result.success).toBe(false);
    });

    it("rejects string values", () => {
      const result = cachedDistanceSchema.safeParse({ distanceM: "1200", durationS: "900" });
      expect(result.success).toBe(false);
    });
  });
});

// ─── Formatting helpers ─────────────────────────────────────

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

describe("formatting helpers", () => {
  it("formats short distances in meters", () => {
    expect(formatDistance(450)).toBe("450 m");
    expect(formatDistance(0)).toBe("0 m");
    expect(formatDistance(999)).toBe("999 m");
  });

  it("formats long distances in kilometers", () => {
    expect(formatDistance(1000)).toBe("1.0 km");
    expect(formatDistance(1500)).toBe("1.5 km");
    expect(formatDistance(12345)).toBe("12.3 km");
  });

  it("formats short durations in minutes", () => {
    expect(formatDuration(60)).toBe("1 perc");
    expect(formatDuration(300)).toBe("5 perc");
    expect(formatDuration(3540)).toBe("59 perc");
  });

  it("formats durations of exactly N hours", () => {
    expect(formatDuration(3600)).toBe("1 óra");
    expect(formatDuration(7200)).toBe("2 óra");
  });

  it("formats mixed hour+minute durations", () => {
    expect(formatDuration(3900)).toBe("1 óra 5 perc");
    expect(formatDuration(5400)).toBe("1 óra 30 perc");
  });
});
