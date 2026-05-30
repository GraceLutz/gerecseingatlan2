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
  /** Advertised name from the feed, e.g. "Azonnal költözhető felújított lakás Dorogon" */
  nev?: string;
  /** 1=eladó, 2=kiadó */
  kategoria: string;
  /** 1=Lakás, 2=Ház, 3=Telek, 4=Garázs, 5=Nyaraló, 6=Iroda, 7=Üzlethelyiség, 8=Vendéglátás, 9=Ipari, 10=Mezőgazdasági, 13=Szoba */
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
  | "nyaralo"
  | "iroda"
  | "uzlethelyiseg"
  | "vendeglatas"
  | "ipari"
  | "mezogazdasagi"
  | "szoba"
  | "egyeb";

export type PropertySubCategory =
  // Lakás
  | "tegla-lakas"
  | "panel-lakas"
  | "csusztatott-zsalus"
  // Ház
  | "csaladi-haz"
  | "ikerhaz"
  | "sorhaz"
  | "hazresz"
  | "tanya"
  | "kastely"
  // Telek
  | "kulterulet-telek"
  | "belterulet-telek"
  | "uduloterulet-telek"
  | "zartkert-telek"
  | "egyeb-telek"
  // Nyaraló
  | "nyaralo-telek"
  | "hetvegi-hazas"
  | "udulohazas"
  // Iroda
  | "irodahaz-a"
  | "irodahaz-b"
  | "irodahaz-c"
  | "csaladi-hazban-iroda"
  | "lakasban-iroda"
  | "egyeb-iroda"
  // Üzlethelyiség
  | "udvarban"
  | "uzlethazban"
  | "utcai-bejarattal"
  | "egyeb-uzlethelyiseg"
  // Vendéglátás
  | "szalloda"
  | "etterem"
  | "egyeb-vendeglato"
  | "borozo"
  | "cukraszda"
  // Ipari
  | "telephely"
  | "raktar"
  | "muhely"
  | "egyeb-ipari"
  | "ipari-park"
  | "csarnok"
  | "gyarepulet"
  | "aruhaz"
  | "autoszalon"
  | "fejlesztesi-terulet"
  // Mezőgazdasági
  | "mg-tanya"
  | "mg-zartkert"
  | "mg-belterulet"
  | "mg-kulterulet"
  | "erdo"
  | "fold"
  | "szantofold"
  | "gyumolcsos"
  | "istallo"
  | "halasto"
  | "gyep"
  | "nadas"
  | "mg-egyeb"
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
  nev: z.coerce.string().optional().default(""),
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
    "lakas", "haz", "telek", "garazs", "nyaralo", "iroda",
    "uzlethelyiseg", "vendeglatas", "ipari", "mezogazdasagi", "szoba", "egyeb",
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

/** tipus code → PropertyCategory (official IF9 spec) */
const tipusToCategoryMap: Record<number, PropertyCategory> = {
  1: "lakas",
  2: "haz",
  3: "telek",
  4: "garazs",
  5: "nyaralo",
  6: "iroda",
  7: "uzlethelyiseg",
  8: "vendeglatas",
  9: "ipari",
  10: "mezogazdasagi",
  13: "szoba",
};

export function mapTipusToCategory(code: number): PropertyCategory {
  return tipusToCategoryMap[code] ?? "egyeb";
}

/** altipus code → PropertySubCategory (IF9: 2=tégla, 3=panel) */
const altipusToSubCategoryMap: Record<number, PropertySubCategory> = {
  // Lakás
  2: "tegla-lakas",
  3: "panel-lakas",
  82: "csusztatott-zsalus",
  // Ház
  4: "csaladi-haz",
  5: "ikerhaz",
  6: "sorhaz",
  7: "hazresz",
  8: "tanya",
  9: "kastely",
  // Telek
  10: "kulterulet-telek",
  11: "belterulet-telek",
  12: "uduloterulet-telek",
  13: "egyeb-telek",
  50: "zartkert-telek",
  // Nyaraló
  16: "nyaralo-telek",
  17: "hetvegi-hazas",
  18: "udulohazas",
  // Iroda
  19: "irodahaz-a",
  20: "csaladi-hazban-iroda",
  21: "lakasban-iroda",
  22: "egyeb-iroda",
  46: "irodahaz-b",
  47: "irodahaz-c",
  // Üzlethelyiség
  23: "udvarban",
  24: "uzlethazban",
  25: "utcai-bejarattal",
  26: "egyeb-uzlethelyiseg",
  // Vendéglátás
  27: "szalloda",
  28: "etterem",
  29: "egyeb-vendeglato",
  60: "borozo",
  61: "cukraszda",
  // Ipari
  30: "telephely",
  31: "raktar",
  32: "muhely",
  33: "egyeb-ipari",
  43: "ipari-park",
  44: "csarnok",
  45: "gyarepulet",
  62: "aruhaz",
  63: "autoszalon",
  64: "fejlesztesi-terulet",
  // Mezőgazdasági
  34: "mg-tanya",
  35: "mg-zartkert",
  48: "mg-belterulet",
  49: "mg-kulterulet",
  51: "erdo",
  52: "fold",
  53: "szantofold",
  54: "gyumolcsos",
  55: "istallo",
  56: "halasto",
  57: "gyep",
  58: "nadas",
  59: "mg-egyeb",
};

export function mapAltipusToSubCategory(code?: number): PropertySubCategory {
  if (code === undefined) return "egyeb";
  return altipusToSubCategoryMap[code] ?? "egyeb";
}

/** SubCategory → Hungarian display label (official IF9 names) */
const subCategoryLabels: Record<PropertySubCategory, string> = {
  // Lakás
  "tegla-lakas": "tégla lakás",
  "panel-lakas": "panel lakás",
  "csusztatott-zsalus": "Csúsztatott zsalus",
  // Ház
  "csaladi-haz": "Családi ház",
  "ikerhaz": "Ikerház",
  "sorhaz": "Sorház",
  "hazresz": "Házrész",
  "tanya": "Tanya",
  "kastely": "Kastély",
  // Telek
  "kulterulet-telek": "Külterület",
  "belterulet-telek": "Belterület",
  "uduloterulet-telek": "Üdülőövezet",
  "zartkert-telek": "Zártkert",
  "egyeb-telek": "Egyéb telek",
  // Nyaraló
  "nyaralo-telek": "Nyaralótelek",
  "hetvegi-hazas": "Hétvégi házas",
  "udulohazas": "Üdülőházas",
  // Iroda
  "irodahaz-a": 'Irodaház "A"',
  "irodahaz-b": 'Irodaház "B"',
  "irodahaz-c": 'Irodaház "C"',
  "csaladi-hazban-iroda": "Családi házban",
  "lakasban-iroda": "Lakásban",
  "egyeb-iroda": "Egyéb iroda",
  // Üzlethelyiség
  "udvarban": "Udvarban",
  "uzlethazban": "Üzletházban",
  "utcai-bejarattal": "Utcai bejárattal",
  "egyeb-uzlethelyiseg": "Egyéb üzlethelyiség",
  // Vendéglátás
  "szalloda": "Szálloda, hotel, panzió",
  "etterem": "Étterem, vendéglő",
  "egyeb-vendeglato": "Egyéb vendéglátó egység",
  "borozo": "Borozó, söröző, büfé",
  "cukraszda": "Cukrászda, presszó",
  // Ipari
  "telephely": "Telephely",
  "raktar": "Raktár",
  "muhely": "Műhely",
  "egyeb-ipari": "Egyéb ipari ingatlan",
  "ipari-park": "Ipari park",
  "csarnok": "Csarnok",
  "gyarepulet": "Gyárépület",
  "aruhaz": "Áruház",
  "autoszalon": "Autószalon",
  "fejlesztesi-terulet": "Fejlesztési terület",
  // Mezőgazdasági
  "mg-tanya": "Tanya",
  "mg-zartkert": "Zártkert",
  "mg-belterulet": "Belterület",
  "mg-kulterulet": "Külterület",
  "erdo": "Erdő",
  "fold": "Föld",
  "szantofold": "Szántóföld, legelő",
  "gyumolcsos": "Gyümölcsös, szőlő",
  "istallo": "Istálló",
  "halasto": "Halastó",
  "gyep": "Gyep",
  "nadas": "Nádas",
  "mg-egyeb": "Egyéb",
  "egyeb": "Egyéb",
};

export function getSubCategoryLabel(sub: PropertySubCategory): string {
  return subCategoryLabels[sub] ?? sub;
}

/** SubCategory → internal type code for existing Property interface compatibility */
export function subCategoryToTypeCode(sub: PropertySubCategory): string {
  if (sub === "panel-lakas") return "panel";
  if (sub === "tegla-lakas" || sub === "csusztatott-zsalus") return "brick";
  if (sub === "csaladi-haz" || sub === "ikerhaz" || sub === "sorhaz" || sub === "hazresz" || sub === "tanya" || sub === "kastely") return "house";
  if (sub.includes("telek") || sub.includes("kulterulet") || sub.includes("belterulet") || sub === "uduloterulet-telek") return "land";
  if (sub.startsWith("mg-") || sub === "erdo" || sub === "fold" || sub === "szantofold" || sub === "gyumolcsos" || sub === "istallo" || sub === "halasto" || sub === "gyep" || sub === "nadas") return "land";
  if (sub === "hetvegi-hazas" || sub === "udulohazas" || sub === "nyaralo-telek") return "holiday";
  if (sub === "telephely" || sub === "raktar" || sub === "muhely" || sub === "csarnok" || sub === "gyarepulet" || sub === "ipari-park" || sub === "aruhaz" || sub === "autoszalon" || sub === "fejlesztesi-terulet" || sub === "egyeb-ipari") return "industrial";
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
