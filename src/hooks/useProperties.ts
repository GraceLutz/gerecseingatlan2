/**
 * Property data hook with automatic fallback to mock data.
 *
 * Fetches normalised property listings from the server-side XML feed
 * proxy (`/api/properties`) and maps them to the client-side {@link Property}
 * interface. When the API is unavailable or returns no data, transparently
 * falls back to bundled mock properties so the UI always has content.
 *
 * @module hooks/useProperties
 */

import { useQuery } from "@tanstack/react-query";
import { mockProperties, locations as mockLocations } from "@/data/properties";
import type { Property } from "@/data/properties";

/**
 * Slim mirror of the server-side `NormalizedProperty` shape returned by `/api/properties`.
 * Kept separate from the server type to avoid importing Node-only modules into the client bundle.
 */
interface FeedProperty {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  priceFormatted: string;
  currency: string;
  category: string;
  subCategory: string;
  listingType: "elado" | "kiado";
  area: number;
  rooms: number;
  halfRooms: number;
  totalRooms: string;
  address: { zip: string; city: string; district: string; street: string };
  location?: { lat: number; lng: number };
  images: string[];
  thumbnailUrl: string;
  builtYear?: number;
  lotSize?: number;
  features: Record<string, string | number | boolean>;
  featured: boolean;
}

/** JSON shape returned by the `/api/properties` endpoint. */
interface FeedResponse {
  properties: FeedProperty[];
  propertyCount: number;
  errors: string[];
  error?: string;
}

const UNMAPPED_CODE_RE = /#\d+/;

function safeStringFeature(val: string | number | boolean | undefined): string | undefined {
  if (typeof val !== "string") return undefined;
  if (UNMAPPED_CODE_RE.test(val)) return undefined;
  return val || undefined;
}

function parseFloor(val: string | number | boolean | undefined): number | undefined {
  if (typeof val !== "string") return undefined;
  if (val === "Földszint" || val === "Félemelet") return 0;
  if (val === "Alagsor" || val === "Szuterén") return -1;
  const m = val.match(/^(\d+)\./);
  return m ? parseInt(m[1], 10) : undefined;
}

/** Maps server NormalizedProperty to client Property interface */
function toClientProperty(fp: FeedProperty): Property {
  let type = "house";
  if (fp.subCategory?.includes("panel")) type = "panel";
  else if (fp.subCategory?.includes("lakas") || fp.subCategory === "garzon") type = "brick";
  else if (fp.subCategory?.includes("telek")) type = "land";
  else if (fp.category === "lakas") type = "brick";
  else if (fp.category === "telek") type = "land";

  return {
    id: fp.id,
    titleHu: fp.title,
    titleEn: fp.title,
    descriptionHu: fp.description,
    descriptionEn: fp.description,
    price: fp.price,
    type,
    category: fp.category,
    subCategory: fp.subCategory,
    status: fp.listingType === "kiado" ? "rent" : "sale",
    location: fp.address.city,
    zip: fp.address.zip || undefined,
    street: fp.address.street || undefined,
    area: fp.area,
    lotSize: fp.lotSize,
    rooms: fp.rooms,
    bathrooms: 0,
    builtYear: fp.builtYear,
    condition: safeStringFeature(fp.features["Állapot"]),
    heating: safeStringFeature(fp.features["Fűtés"]),
    energy: safeStringFeature(fp.features["Energiatanúsítvány"]),
    floor: parseFloor(fp.features["Emelet"]),
    elevator: typeof fp.features["Lift"] === "string" ? fp.features["Lift"].includes("Van") : undefined,
    parking: typeof fp.features["Parkolás"] === "string" ? !fp.features["Parkolás"].includes("Nincs") : undefined,
    balcony: typeof fp.features["Erkély"] === "string" ? fp.features["Erkély"].includes("Igen") : undefined,
    images: fp.images,
    featured: fp.featured,
    lat: fp.location?.lat,
    lng: fp.location?.lng,
  };
}

interface PropertiesResult {
  properties: Property[];
  locations: string[];
  /** True when showing mock/demo data instead of live feed data */
  isMockData: boolean;
}

/**
 * Fetches properties from the server feed endpoint and maps them to client types.
 * Returns mock data on any network or parsing failure, so the UI is never empty.
 */
async function fetchProperties(): Promise<PropertiesResult> {
  try {
    const response = await fetch("/api/properties");

    if (!response.ok) {
      console.warn("[useProperties] API returned", response.status, "— falling back to mock data");
      return { properties: mockProperties, locations: mockLocations, isMockData: true };
    }

    const data: FeedResponse = await response.json();

    if (data.error || !data.properties?.length) {
      console.warn("[useProperties] No feed data available — using mock data");
      return { properties: mockProperties, locations: mockLocations, isMockData: true };
    }

    const properties = data.properties.map(toClientProperty);
    const locationSet = new Set(properties.map((p) => p.location).filter(Boolean));
    const locations = Array.from(locationSet).sort((a, b) => a.localeCompare(b, "hu"));

    return { properties, locations, isMockData: false };
  } catch (err) {
    console.warn("[useProperties] Fetch failed — using mock data:", err);
    return { properties: mockProperties, locations: mockLocations, isMockData: true };
  }
}

/**
 * Hook to load properties from the server-side XML feed proxy.
 * Falls back to mock data when the API is unavailable or returns no data.
 */
export function useProperties() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["properties"],
    queryFn: fetchProperties,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  return {
    properties: data?.properties ?? mockProperties,
    locations: data?.locations ?? mockLocations,
    isLoading,
    error,
    isMockData: data?.isMockData ?? true,
  };
}
