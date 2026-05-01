import { z } from "zod";

// ─── Raw XML Types (as parsed by fast-xml-parser) ────────────

/**
 * Raw property element from the Ingatlan Forrás 9 XML feed.
 * Field names match the XML tags exactly.
 */
export interface RawXmlProperty {
  id: string;
  nyilvantartasi_szam?: string;
  ertekesito_id?: string;
  /** 1=eladó, 2=kiadó */
  kategoria: string;
  /** 1=lakás, 2=ház, 3=telek, 4=garázs, 5=üzlethelyiség, 6=iroda */
  tipus: string;
  /** Fine-grained subtype code (see altipusMap in ingatlan-feed.ts) */
  altipus?: string;
  irszam?: string;
  telepules?: string;
  telepulesresz?: string;
  utca?: string;
  /** Price in smallest unit (no decimal) */
  ar: string;
  /** Currency code, typically "HUF" */
  penznem?: string;
  /** Floor area in m² */
  alapterulet: string;
  szobaszam?: string;
  felszobaszam?: string;
  /** Description — may be CDATA, parsed as { __cdata: string } or string */
  leiras?: string | { __cdata: string };
  /** Images container */
  kepek?: { kep: string | string[] };
  video?: string;
  /** IF9 internal attribute fields (numeric codes → reference IDs) */
  [key: `adat_${number}`]: string | string[] | undefined;
}

export interface RawXmlOffice {
  nev?: string;
  email?: string;
  telefon?: string;
  cim?: string;
  web?: string;
}

export interface RawXmlFeed {
  xml: {
    iroda?: RawXmlOffice;
    ertekesitok?: { ertekesito?: RawXmlAgent[] };
    ingatlanok?: { ingatlan: RawXmlProperty[] };
  };
}

export interface RawXmlAgent {
  nev?: string;
  telefon?: string;
  email?: string;
}

// ─── Normalized Types (clean internal model for frontend) ────

export type ListingType = "elado" | "kiado";

export type PropertyCategory =
  | "lakas"
  | "haz"
  | "telek"
  | "garazs"
  | "iroda"
  | "uzlethelyiseg"
  | "ipari"
  | "mezogazdasagi"
  | "egyeb";

export type PropertySubCategory =
  | "tegla-lakas"
  | "panel-lakas"
  | "csaladi-haz"
  | "ikerhaz"
  | "sorhaz"
  | "garzon"
  | "tarsashazi-lakas"
  | "nyaralo"
  | "tanya"
  | "kastely-villa"
  | "epitesi-telek"
  | "zartkerti-telek"
  | "mezogazdasagi-telek"
  | "ipari-telek"
  | "egyeb";

export interface PropertyAddress {
  zip: string;
  city: string;
  district: string;
  street: string;
}

export interface PropertyLocation {
  lat: number;
  lng: number;
}

/**
 * Normalized property — clean internal model used by the frontend.
 * All values are display-ready or easily formattable.
 */
export interface NormalizedProperty {
  id: string;
  slug: string;
  listingType: ListingType;
  category: PropertyCategory;
  subCategory: PropertySubCategory;
  /** Display title in Hungarian, e.g. "Eladó családi ház - Dorog" */
  title: string;
  price: number;
  /** Formatted price string, e.g. "52 500 000 Ft" */
  priceFormatted: string;
  currency: string;
  /** Floor area in m² */
  area: number;
  rooms: number;
  halfRooms: number;
  /** e.g. "2+1" or "4" */
  totalRooms: string;
  address: PropertyAddress;
  location?: PropertyLocation;
  description: string;
  /** Full image URLs */
  images: string[];
  /** First image URL (for listing cards) */
  thumbnailUrl: string;
  /** Built year if available */
  builtYear?: number;
  /** Lot size in m² (for houses/land) */
  lotSize?: number;
  /**
   * Decoded adat_* features with Hungarian labels where known.
   * Unknown codes are kept as "adat_XX" keys.
   */
  features: Record<string, string | number | boolean>;
  /** Whether this property is marked as featured */
  featured: boolean;
  /** Video URL if available */
  videoUrl?: string;
}

export interface FeedOffice {
  name: string;
  email: string;
  phone: string;
  address: string;
  web: string;
}

export interface FeedResult {
  office: FeedOffice;
  properties: NormalizedProperty[];
  fetchedAt: string;
  propertyCount: number;
  errors: string[];
}

// ─── Zod Schemas ─────────────────────────────────────────────

export const RawIngatlanSchema = z.object({
  id: z.coerce.string(),
  nyilvantartasi_szam: z.coerce.string().optional().default(""),
  ertekesito_id: z.coerce.string().optional().default("0"),
  kategoria: z.coerce.number(),
  tipus: z.coerce.number(),
  altipus: z.coerce.number().optional(),
  irszam: z.coerce.string().optional().default(""),
  telepules: z.coerce.string().optional().default(""),
  telepulesresz: z.coerce.string().optional().default(""),
  utca: z.coerce.string().optional().default(""),
  ar: z.coerce.number().default(0),
  penznem: z.string().optional().default("HUF"),
  alapterulet: z.coerce.number().default(0),
  szobaszam: z.coerce.number().optional().default(0),
  felszobaszam: z.coerce.number().optional().default(0),
  leiras: z.any().optional().default(""),
  kepek: z.any().optional(),
  video: z.coerce.string().optional().default(""),
});

export const NormalizedPropertySchema = z.object({
  id: z.string(),
  slug: z.string(),
  listingType: z.enum(["elado", "kiado"]),
  category: z.enum([
    "lakas", "haz", "telek", "garazs", "iroda",
    "uzlethelyiseg", "ipari", "mezogazdasagi", "egyeb",
  ]),
  subCategory: z.string(),
  title: z.string(),
  price: z.number(),
  priceFormatted: z.string(),
  currency: z.string(),
  area: z.number(),
  rooms: z.number(),
  halfRooms: z.number(),
  totalRooms: z.string(),
  address: z.object({
    zip: z.string(),
    city: z.string(),
    district: z.string(),
    street: z.string(),
  }),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  description: z.string(),
  images: z.array(z.string()),
  thumbnailUrl: z.string(),
  builtYear: z.number().optional(),
  lotSize: z.number().optional(),
  features: z.record(z.union([z.string(), z.number(), z.boolean()])),
  featured: z.boolean(),
  videoUrl: z.string().optional(),
});

export const FeedResultSchema = z.object({
  office: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    address: z.string(),
    web: z.string(),
  }),
  properties: z.array(NormalizedPropertySchema),
  fetchedAt: z.string(),
  propertyCount: z.number(),
  errors: z.array(z.string()),
});

// ─── Mapping Utilities ──────────────────────────────────────

/** kategoria code → ListingType */
export function mapKategoriaToListingType(code: number): ListingType {
  return code === 2 ? "kiado" : "elado";
}

/** tipus code → PropertyCategory */
const tipusToCategoryMap: Record<number, PropertyCategory> = {
  1: "lakas",
  2: "haz",
  3: "telek",
  4: "garazs",
  5: "uzlethelyiseg",
  6: "iroda",
  7: "ipari",
  8: "mezogazdasagi",
  9: "egyeb",
};

export function mapTipusToCategory(code: number): PropertyCategory {
  return tipusToCategoryMap[code] ?? "egyeb";
}

/** altipus code → PropertySubCategory */
const altipusToSubCategoryMap: Record<number, PropertySubCategory> = {
  1: "garzon",
  2: "panel-lakas",
  3: "tegla-lakas",
  4: "csaladi-haz",
  5: "ikerhaz",
  6: "sorhaz",
  7: "tarsashazi-lakas",
  8: "nyaralo",
  9: "tanya",
  10: "kastely-villa",
  11: "epitesi-telek",
  12: "zartkerti-telek",
  13: "mezogazdasagi-telek",
  14: "ipari-telek",
};

export function mapAltipusToSubCategory(code?: number): PropertySubCategory {
  if (code === undefined) return "egyeb";
  return altipusToSubCategoryMap[code] ?? "egyeb";
}

/** SubCategory → Hungarian display label */
const subCategoryLabels: Record<PropertySubCategory, string> = {
  "tegla-lakas": "tégla lakás",
  "panel-lakas": "panellakás",
  "csaladi-haz": "családi ház",
  "ikerhaz": "ikerház",
  "sorhaz": "sorház",
  "garzon": "garzonlakás",
  "tarsashazi-lakas": "társasházi lakás",
  "nyaralo": "nyaraló",
  "tanya": "tanya",
  "kastely-villa": "kastély/villa",
  "epitesi-telek": "építési telek",
  "zartkerti-telek": "zártkerti telek",
  "mezogazdasagi-telek": "mezőgazdasági telek",
  "ipari-telek": "ipari telek",
  "egyeb": "egyéb",
};

export function getSubCategoryLabel(sub: PropertySubCategory): string {
  return subCategoryLabels[sub] ?? sub;
}

/** SubCategory → internal type code for existing Property interface compatibility */
export function subCategoryToTypeCode(sub: PropertySubCategory): string {
  if (sub === "panel-lakas") return "panel";
  if (sub.includes("lakas") || sub === "garzon") return "brick";
  if (sub.includes("haz") || sub === "tanya" || sub === "nyaralo" || sub === "kastely-villa") return "house";
  if (sub.includes("telek")) return "land";
  if (sub === "ikerhaz" || sub === "sorhaz") return "house";
  return "house";
}

/** Format price as Hungarian string: "52 500 000 Ft" */
export function formatPriceHu(amount: number, currency = "HUF"): string {
  const formatted = amount.toLocaleString("hu-HU");
  return currency === "HUF" ? `${formatted} Ft` : `${formatted} ${currency}`;
}

/** Format total rooms: "2+1" or "4" */
export function formatTotalRooms(rooms: number, halfRooms: number): string {
  if (halfRooms > 0) return `${rooms}+${halfRooms}`;
  return String(rooms);
}

/** Remove Hungarian accents and generate URL-safe slug */
export function slugify(text: string): string {
  const charMap: Record<string, string> = {
    á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o",
    ú: "u", ü: "u", ű: "u", Á: "a", É: "e", Í: "i",
    Ó: "o", Ö: "o", Ő: "o", Ú: "u", Ü: "u", Ű: "u",
  };
  return text
    .split("")
    .map((c) => charMap[c] || c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Generate SEO-friendly slug from property data */
export function generatePropertySlug(property: {
  id: string;
  listingType: ListingType;
  subCategory: PropertySubCategory;
  city: string;
  area: number;
}): string {
  const typeSlug = slugify(getSubCategoryLabel(property.subCategory));
  const citySlug = slugify(property.city);
  const parts = [property.listingType, typeSlug, citySlug];
  if (property.area > 0) parts.push(`${property.area}nm`);
  parts.push(property.id);
  return parts.join("-");
}
