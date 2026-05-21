/**
 * AI Agent tool definitions for Gemini function calling.
 *
 * Defines 5 tools the LLM can invoke:
 * - search_nearby_places: Google Places Nearby Search (via T4 google-maps service)
 * - get_place_details: Google Place Details (via T4 google-maps service)
 * - calculate_distance: Google Distance Matrix (via T4 google-maps service)
 * - search_properties: local XML feed property search (no API cost)
 * - get_property_details: single property from cached feed (no API cost)
 */

import { SchemaType, type FunctionDeclaration } from "@google/generative-ai";
import { z } from "zod";
import { fetchFeed } from "../ingatlan-feed";
import type { NormalizedProperty } from "../../shared/types/property";

// ─── Types ──────────────────────────────────────────────────

export interface ToolCallResult {
  name: string;
  result: unknown;
}

export interface Citation {
  name: string;
  placeId: string;
  googleMapsUrl: string;
}

// ─── Structured Logging ─────────────────────────────────────

function log(level: "info" | "warn" | "error", event: string, data?: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), level, module: "agent-tools", event, ...data };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

// ─── Gemini Function Declarations ───────────────────────────

export const AGENT_TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "search_nearby_places",
    description:
      "Közeli helyek keresése egy adott koordináta körül (bolt, iskola, orvos, gyógyszertár, buszmegálló, étterem, stb.). Google Maps Nearby Search.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        lat: { type: SchemaType.NUMBER, description: "Szélességi fok (latitude)" },
        lng: { type: SchemaType.NUMBER, description: "Hosszúsági fok (longitude)" },
        type: {
          type: SchemaType.STRING,
          description:
            "Hely típusa (Google Maps type). Pl: grocery_store, school, kindergarten, doctor, pharmacy, bus_station, train_station, gym, restaurant, park, playground, hospital, bank, post_office, supermarket",
        },
        radius: {
          type: SchemaType.INTEGER,
          description: "Keresési sugár méterben (alapértelmezett: 1500, max: 3000)",
        },
      },
      required: ["lat", "lng", "type"],
    },
  },
  {
    name: "get_place_details",
    description:
      "Egy adott Google Maps hely részletes adatai (név, cím, nyitvatartás, értékelés, telefonszám). Place ID alapján.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        placeId: {
          type: SchemaType.STRING,
          description: "Google Maps Place ID (pl. ChIJ...)",
        },
      },
      required: ["placeId"],
    },
  },
  {
    name: "calculate_distance",
    description:
      "Távolság és útvonal idő számítás két pont között. Google Distance Matrix API.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        originLat: { type: SchemaType.NUMBER, description: "Kiindulási pont szélességi fok" },
        originLng: { type: SchemaType.NUMBER, description: "Kiindulási pont hosszúsági fok" },
        destLat: { type: SchemaType.NUMBER, description: "Célpont szélességi fok" },
        destLng: { type: SchemaType.NUMBER, description: "Célpont hosszúsági fok" },
        mode: {
          type: SchemaType.STRING,
          format: "enum",
          description: "Közlekedési mód: driving (autó), walking (gyalog), transit (tömegközlekedés)",
          enum: ["driving", "walking", "transit"],
        },
      },
      required: ["originLat", "originLng", "destLat", "destLng", "mode"],
    },
  },
  {
    name: "search_properties",
    description:
      "Ingatlanok keresése a Gerecse Ingatlan kínálatában szűrők alapján (ár, szobaszám, település, típus, eladó/kiadó). Helyi adatbázisból, nem Google-ból.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        city: { type: SchemaType.STRING, description: "Település neve (pl. Dorog, Esztergom, Tát)" },
        minPrice: { type: SchemaType.NUMBER, description: "Minimális ár (Ft)" },
        maxPrice: { type: SchemaType.NUMBER, description: "Maximális ár (Ft)" },
        minRooms: { type: SchemaType.INTEGER, description: "Minimum szobaszám" },
        maxRooms: { type: SchemaType.INTEGER, description: "Maximum szobaszám" },
        category: {
          type: SchemaType.STRING,
          description: "Ingatlan kategória: lakas, haz, telek, garazs, nyaralo, iroda, uzlethelyiseg, ipari, mezogazdasagi",
        },
        listingType: {
          type: SchemaType.STRING,
          format: "enum",
          description: "Hirdetés típusa: elado (eladó) vagy kiado (kiadó)",
          enum: ["elado", "kiado"],
        },
      },
      required: [],
    },
  },
  {
    name: "get_property_details",
    description:
      "Egy konkrét ingatlan részletes adatai (ár, méret, szobák, jellemzők, képek, leírás) a Gerecse Ingatlan kínálatából.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        propertyId: {
          type: SchemaType.STRING,
          description: "Az ingatlan egyedi azonosítója",
        },
      },
      required: ["propertyId"],
    },
  },
];

// ─── Tool Argument Schemas (Zod validation) ────────────────

const SearchNearbySchema = z.object({
  lat: z.number(),
  lng: z.number(),
  type: z.string(),
  radius: z.number().int().optional(),
});

const PlaceDetailsSchema = z.object({
  placeId: z.string(),
});

const DistanceSchema = z.object({
  originLat: z.number(),
  originLng: z.number(),
  destLat: z.number(),
  destLng: z.number(),
  mode: z.enum(["driving", "walking", "transit"]),
});

const SearchPropertiesSchema = z.object({
  city: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minRooms: z.number().int().optional(),
  maxRooms: z.number().int().optional(),
  category: z.string().optional(),
  listingType: z.enum(["elado", "kiado"]).optional(),
});

const PropertyDetailsSchema = z.object({
  propertyId: z.string(),
});

type SearchNearbyParams = z.infer<typeof SearchNearbySchema>;
type PlaceDetailsParams = z.infer<typeof PlaceDetailsSchema>;
type DistanceParams = z.infer<typeof DistanceSchema>;
type SearchPropertiesParams = z.infer<typeof SearchPropertiesSchema>;
type PropertyDetailsParams = z.infer<typeof PropertyDetailsSchema>;

// ─── Tool Execution ─────────────────────────────────────────

const TOOL_SCHEMAS: Record<string, z.ZodSchema> = {
  search_nearby_places: SearchNearbySchema,
  get_place_details: PlaceDetailsSchema,
  calculate_distance: DistanceSchema,
  search_properties: SearchPropertiesSchema,
  get_property_details: PropertyDetailsSchema,
};

/**
 * Executes a tool call by dispatching to the appropriate service.
 * Validates args with Zod before dispatch.
 * Google Maps tools delegate to server/services/google-maps.ts (Builder 4).
 * Property tools query the in-memory XML feed cache.
 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<{ result: unknown; citations: Citation[] }> {
  log("info", "tool_execute", { tool: name, args });

  const schema = TOOL_SCHEMAS[name];
  if (!schema) {
    log("warn", "unknown_tool", { tool: name });
    return { result: { error: `Ismeretlen eszköz: ${name}` }, citations: [] };
  }

  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    log("warn", "invalid_tool_args", { tool: name, errors: parsed.error.issues });
    return { result: { error: "Érvénytelen paraméterek." }, citations: [] };
  }

  switch (name) {
    case "search_nearby_places":
      return executeSearchNearbyPlaces(parsed.data as SearchNearbyParams);
    case "get_place_details":
      return executeGetPlaceDetails(parsed.data as PlaceDetailsParams);
    case "calculate_distance":
      return executeCalculateDistance(parsed.data as DistanceParams);
    case "search_properties":
      return executeSearchProperties(parsed.data as SearchPropertiesParams);
    case "get_property_details":
      return executeGetPropertyDetails(parsed.data as PropertyDetailsParams);
    default:
      return { result: { error: `Ismeretlen eszköz: ${name}` }, citations: [] };
  }
}

// ─── Google Maps Tool Implementations ───────────────────────
// These delegate to Builder 4's google-maps.ts service.
// Using dynamic import to avoid build-time dependency on a file that may not exist yet.

async function getGoogleMapsService() {
  try {
    return await import("./google-maps");
  } catch {
    log("warn", "google_maps_service_not_available");
    return null;
  }
}

async function executeSearchNearbyPlaces(
  params: SearchNearbyParams,
): Promise<{ result: unknown; citations: Citation[] }> {
  const clampedRadius = Math.min(params.radius ?? 1500, 3000);
  const gmaps = await getGoogleMapsService();

  if (!gmaps?.searchNearbyPlaces) {
    return {
      result: { error: "A Google Maps szolgáltatás jelenleg nem elérhető." },
      citations: [],
    };
  }

  try {
    const places = await gmaps.searchNearbyPlaces(params.lat, params.lng, params.type, clampedRadius);
    const citations: Citation[] = (places ?? []).map((p: { name: string; placeId: string }) => ({
      name: p.name,
      placeId: p.placeId,
      googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${p.placeId}`,
    }));
    return { result: places, citations };
  } catch (err) {
    log("error", "search_nearby_failed", { error: err instanceof Error ? err.message : String(err) });
    return {
      result: { error: "Nem sikerült a közeli helyek keresése." },
      citations: [],
    };
  }
}

async function executeGetPlaceDetails(
  params: PlaceDetailsParams,
): Promise<{ result: unknown; citations: Citation[] }> {
  const gmaps = await getGoogleMapsService();

  if (!gmaps?.getPlaceDetails) {
    return {
      result: { error: "A Google Maps szolgáltatás jelenleg nem elérhető." },
      citations: [],
    };
  }

  try {
    const details = await gmaps.getPlaceDetails(params.placeId);
    const citations: Citation[] = details?.name
      ? [{
          name: details.name,
          placeId: params.placeId,
          googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${params.placeId}`,
        }]
      : [];
    return { result: details, citations };
  } catch (err) {
    log("error", "place_details_failed", { error: err instanceof Error ? err.message : String(err) });
    return {
      result: { error: "Nem sikerült a hely adatainak lekérése." },
      citations: [],
    };
  }
}

async function executeCalculateDistance(
  params: DistanceParams,
): Promise<{ result: unknown; citations: Citation[] }> {
  const gmaps = await getGoogleMapsService();

  if (!gmaps?.calculateDistance) {
    return {
      result: { error: "A Google Maps szolgáltatás jelenleg nem elérhető." },
      citations: [],
    };
  }

  try {
    const distance = await gmaps.calculateDistance(
      params.originLat, params.originLng,
      params.destLat, params.destLng,
      params.mode,
    );
    return { result: distance, citations: [] };
  } catch (err) {
    log("error", "distance_calc_failed", { error: err instanceof Error ? err.message : String(err) });
    return {
      result: { error: "Nem sikerült a távolság kiszámítása." },
      citations: [],
    };
  }
}

// ─── Local Feed Tool Implementations ────────────────────────

function propertyToSummary(p: NormalizedProperty) {
  return {
    id: p.id,
    title: p.title,
    listingType: p.listingType,
    category: p.category,
    subCategory: p.subCategory,
    price: p.price,
    priceFormatted: p.priceFormatted,
    area: p.area,
    rooms: p.rooms,
    halfRooms: p.halfRooms,
    totalRooms: p.totalRooms,
    city: p.address.city,
    district: p.address.district,
    thumbnailUrl: p.thumbnailUrl,
  };
}

async function getFeedProperties(): Promise<NormalizedProperty[]> {
  const feedUrl = process.env.INGATLAN_XML_URL;
  if (!feedUrl) {
    log("warn", "feed_url_not_configured");
    return [];
  }
  const feed = await fetchFeed(feedUrl);
  return feed.properties;
}

async function executeSearchProperties(
  params: SearchPropertiesParams,
): Promise<{ result: unknown; citations: Citation[] }> {
  try {
    let properties = await getFeedProperties();

    if (params.listingType) {
      properties = properties.filter((p) => p.listingType === params.listingType);
    }
    if (params.category) {
      properties = properties.filter((p) => p.category === params.category);
    }
    if (params.city) {
      const cityLower = params.city.toLowerCase();
      properties = properties.filter((p) => p.address.city.toLowerCase().includes(cityLower));
    }
    if (params.minPrice !== undefined) {
      properties = properties.filter((p) => p.price >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      properties = properties.filter((p) => p.price <= params.maxPrice!);
    }
    if (params.minRooms !== undefined) {
      properties = properties.filter((p) => p.rooms >= params.minRooms!);
    }
    if (params.maxRooms !== undefined) {
      properties = properties.filter((p) => p.rooms <= params.maxRooms!);
    }

    const results = properties.slice(0, 10).map(propertyToSummary);

    log("info", "search_properties_result", {
      filterCount: Object.keys(params).length,
      matchCount: properties.length,
      returnedCount: results.length,
    });

    return {
      result: {
        totalMatches: properties.length,
        properties: results,
      },
      citations: [],
    };
  } catch (err) {
    log("error", "search_properties_failed", { error: err instanceof Error ? err.message : String(err) });
    return {
      result: { error: "Nem sikerült az ingatlanok keresése." },
      citations: [],
    };
  }
}

async function executeGetPropertyDetails(
  params: PropertyDetailsParams,
): Promise<{ result: unknown; citations: Citation[] }> {
  try {
    const properties = await getFeedProperties();
    const property = properties.find((p) => p.id === params.propertyId);

    if (!property) {
      return {
        result: { error: `Az ingatlan nem található (ID: ${params.propertyId}).` },
        citations: [],
      };
    }

    return {
      result: {
        id: property.id,
        title: property.title,
        listingType: property.listingType,
        category: property.category,
        subCategory: property.subCategory,
        price: property.price,
        priceFormatted: property.priceFormatted,
        area: property.area,
        rooms: property.rooms,
        halfRooms: property.halfRooms,
        totalRooms: property.totalRooms,
        address: property.address,
        location: property.location,
        description: property.description?.substring(0, 500),
        builtYear: property.builtYear,
        lotSize: property.lotSize,
        features: property.features,
        imageCount: property.images.length,
      },
      citations: [],
    };
  } catch (err) {
    log("error", "get_property_details_failed", { error: err instanceof Error ? err.message : String(err) });
    return {
      result: { error: "Nem sikerült az ingatlan adatainak lekérése." },
      citations: [],
    };
  }
}
