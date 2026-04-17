import { XMLParser } from "fast-xml-parser";
import {
  RawIngatlanSchema,
  mapKategoriaToListingType,
  mapTipusToCategory,
  mapAltipusToSubCategory,
  getSubCategoryLabel,
  subCategoryToTypeCode,
  formatPriceHu,
  formatTotalRooms,
  generatePropertySlug,
  type NormalizedProperty,
  type FeedOffice,
  type FeedResult,
  type ListingType,
} from "../shared/types/property";
import { decodeAdatFields } from "./ingatlan-feed-fields";

// ─── Structured Logging ─────────────────────────────────────

function log(level: "info" | "warn" | "error", event: string, data?: Record<string, unknown>) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    module: "ingatlan-feed",
    event,
    ...data,
  };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

// ─── Image extraction ────────────────────────────────────────

function extractImages(kepek: unknown): string[] {
  if (!kepek) return [];
  if (typeof kepek === "object" && kepek !== null) {
    const obj = kepek as Record<string, unknown>;
    if (obj.kep) {
      const kep = obj.kep;
      if (Array.isArray(kep)) return kep.map(String).filter(Boolean);
      if (typeof kep === "string") return [kep];
    }
  }
  return [];
}

// ─── CDATA text extraction ───────────────────────────────────

function getCdataText(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if (obj.__cdata) return String(obj.__cdata).trim();
  }
  return String(value).trim();
}

// ─── Raw adat_* field extraction ─────────────────────────────

function getAdatFields(raw: Record<string, unknown>): Record<string, string | string[]> {
  const attrs: Record<string, string | string[]> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (key.startsWith("adat_")) {
      if (Array.isArray(val)) {
        attrs[key] = val.map(String);
      } else {
        attrs[key] = String(val);
      }
    }
  }
  return attrs;
}

// ─── XML Parser config ──────────────────────────────────────

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  isArray: (name) => name === "ingatlan" || name === "kep" || name === "ertekesito",
  trimValues: true,
  cdataPropName: "__cdata",
  processEntities: true,
});

// ─── Main parser ─────────────────────────────────────────────

export function parseFeedXml(xmlString: string): FeedResult {
  const errors: string[] = [];
  const parseStart = Date.now();

  let parsed: unknown;
  try {
    parsed = xmlParser.parse(xmlString);
  } catch (err) {
    const msg = `XML parse failed: ${err instanceof Error ? err.message : String(err)}`;
    log("error", "xml_parse_failed", { error: msg });
    return {
      office: { name: "", email: "", phone: "", address: "", web: "" },
      properties: [],
      fetchedAt: new Date().toISOString(),
      propertyCount: 0,
      errors: [msg],
    };
  }

  const root = (parsed as Record<string, unknown>).xml || parsed;
  const rootObj = root as Record<string, unknown>;

  // Parse office info
  const irodaRaw = (rootObj.iroda || {}) as Record<string, unknown>;
  const office: FeedOffice = {
    name: String(irodaRaw.nev || "").trim(),
    email: String(irodaRaw.email || "").trim(),
    phone: String(irodaRaw.telefon || "").trim(),
    address: String(irodaRaw.cim || "").trim(),
    web: String(irodaRaw.web || "").trim(),
  };

  // Parse properties
  const ingatlanokContainer = rootObj.ingatlanok as Record<string, unknown> | undefined;
  const ingatlanokRaw = ingatlanokContainer?.ingatlan || [];
  const rawList = Array.isArray(ingatlanokRaw) ? ingatlanokRaw : [ingatlanokRaw];

  const properties: NormalizedProperty[] = [];
  let skippedCount = 0;

  for (const raw of rawList) {
    try {
      const validated = RawIngatlanSchema.safeParse(raw);
      if (!validated.success) {
        const errMsg = `Property validation failed: ${validated.error.issues.map((i) => i.message).join("; ")}`;
        errors.push(errMsg);
        skippedCount++;
        continue;
      }
      const data = validated.data;
      const rawAttrs = getAdatFields(raw as Record<string, unknown>);

      // Map codes to normalized types
      const listingType: ListingType = mapKategoriaToListingType(data.kategoria);
      const category = mapTipusToCategory(data.tipus);
      const subCategory = mapAltipusToSubCategory(data.altipus);
      const typeCode = subCategoryToTypeCode(subCategory);
      const typeLabel = getSubCategoryLabel(subCategory);
      const city = data.telepules || "Ismeretlen";
      const area = data.alapterulet;
      const images = extractImages(data.kepek);
      const description = getCdataText(data.leiras);

      // Decode adat_* fields into human-readable features
      const features = decodeAdatFields(rawAttrs);

      // Extract specific well-known fields
      const builtYear = rawAttrs.adat_89
        ? parseInt(String(rawAttrs.adat_89), 10) || undefined
        : undefined;
      const lotSize = rawAttrs.adat_27
        ? parseInt(String(rawAttrs.adat_27), 10) || undefined
        : undefined;

      // Build display title
      const statusLabel = listingType === "elado" ? "Eladó" : "Kiadó";
      const title = `${statusLabel} ${typeLabel} - ${city}`;

      const rooms = data.szobaszam;
      const halfRooms = data.felszobaszam;

      const slug = generatePropertySlug({
        id: data.id,
        listingType,
        subCategory,
        city,
        area,
      });

      const property: NormalizedProperty = {
        id: data.id,
        slug,
        listingType,
        category,
        subCategory,
        title,
        price: data.ar,
        priceFormatted: formatPriceHu(data.ar, data.penznem),
        currency: data.penznem,
        area,
        rooms,
        halfRooms,
        totalRooms: formatTotalRooms(rooms, halfRooms),
        address: {
          zip: data.irszam,
          city,
          district: data.telepulesresz,
          street: data.utca,
        },
        description,
        images,
        thumbnailUrl: images[0] || "",
        builtYear,
        lotSize,
        features,
        featured: false,
        videoUrl: data.video || undefined,
      };

      properties.push(property);
    } catch (err) {
      const errMsg = `Property processing error: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(errMsg);
      skippedCount++;
    }
  }

  const parseMs = Date.now() - parseStart;
  log("info", "xml_parsed", {
    propertyCount: properties.length,
    skippedCount,
    errorCount: errors.length,
    parseMs,
    xmlBytes: xmlString.length,
  });

  return {
    office,
    properties,
    fetchedAt: new Date().toISOString(),
    propertyCount: properties.length,
    errors,
  };
}

// ─── Fetcher with caching ────────────────────────────────────

let cachedResult: FeedResult | null = null;
let lastFetchTime = 0;
let fetchCount = 0;
let cacheHitCount = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function fetchFeed(
  feedUrl: string,
  options?: { forceRefresh?: boolean; timeoutMs?: number },
): Promise<FeedResult> {
  const now = Date.now();
  const forceRefresh = options?.forceRefresh ?? false;
  const timeoutMs = options?.timeoutMs ?? 30_000;

  // Return cached if still fresh
  if (!forceRefresh && cachedResult && now - lastFetchTime < CACHE_TTL_MS) {
    cacheHitCount++;
    log("info", "cache_hit", {
      cacheAgeMs: now - lastFetchTime,
      cacheHitCount,
      propertyCount: cachedResult.propertyCount,
    });
    return cachedResult;
  }

  fetchCount++;
  const fetchStart = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    log("info", "fetch_start", { fetchCount, forceRefresh, timeoutMs });
    const response = await fetch(feedUrl, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Feed HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlString = await response.text();
    const fetchMs = Date.now() - fetchStart;

    log("info", "fetch_complete", {
      fetchMs,
      bytes: xmlString.length,
      fetchCount,
    });

    const result = parseFeedXml(xmlString);

    if (result.errors.length > 0) {
      log("warn", "parse_warnings", { errors: result.errors });
    }

    // Update cache
    cachedResult = result;
    lastFetchTime = now;

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const fetchMs = Date.now() - fetchStart;
    const isTimeout = message.includes("abort");

    log("error", "fetch_failed", {
      error: message,
      fetchMs,
      isTimeout,
      fetchCount,
      hasStaleCacheAge: lastFetchTime > 0 ? now - lastFetchTime : null,
    });

    // Return stale cache if available
    if (cachedResult) {
      const staleCacheAgeMs = now - lastFetchTime;
      log("warn", "serving_stale_cache", { staleCacheAgeMs });
      return {
        ...cachedResult,
        errors: [...cachedResult.errors, `Stale data (fetch failed: ${message})`],
      };
    }

    // No cache available — return empty result with error
    return {
      office: { name: "", email: "", phone: "", address: "", web: "" },
      properties: [],
      fetchedAt: new Date().toISOString(),
      propertyCount: 0,
      errors: [`Feed unavailable: ${message}`],
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Returns cache status for admin/debug */
export function getFeedStatus() {
  return {
    cached: cachedResult !== null,
    lastFetchTime: lastFetchTime > 0 ? new Date(lastFetchTime).toISOString() : null,
    cacheAgeMs: lastFetchTime > 0 ? Date.now() - lastFetchTime : null,
    cacheTtlMs: CACHE_TTL_MS,
    propertyCount: cachedResult?.propertyCount ?? 0,
    errors: cachedResult?.errors ?? [],
    stats: {
      totalFetches: fetchCount,
      cacheHits: cacheHitCount,
    },
  };
}
