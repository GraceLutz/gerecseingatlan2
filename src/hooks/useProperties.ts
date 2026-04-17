import { useQuery } from "@tanstack/react-query";
import { mockProperties, locations as mockLocations } from "@/data/properties";
import type { Property } from "@/data/properties";

/** Slim version of NormalizedProperty for client-side mapping (avoids importing server types) */
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

interface FeedResponse {
  properties: FeedProperty[];
  propertyCount: number;
  errors: string[];
  error?: string;
}

/** Maps server NormalizedProperty to client Property interface */
function toClientProperty(fp: FeedProperty): Property {
  // Map subCategory to legacy type code
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
    descriptionEn: "",
    price: fp.price,
    type,
    status: fp.listingType === "kiado" ? "rent" : "sale",
    location: fp.address.city,
    area: fp.area,
    lotSize: fp.lotSize,
    rooms: fp.rooms,
    bathrooms: 0,
    builtYear: fp.builtYear,
    condition: typeof fp.features["Állapot"] === "string" ? fp.features["Állapot"] : undefined,
    heating: typeof fp.features["Fűtés típusa"] === "string" ? fp.features["Fűtés típusa"] : undefined,
    energy: typeof fp.features["Energetikai besorolás"] === "string" ? fp.features["Energetikai besorolás"] : undefined,
    elevator: typeof fp.features["Lift"] === "string" ? fp.features["Lift"].includes("Van") : undefined,
    parking: typeof fp.features["Parkolás"] === "string" ? fp.features["Parkolás"].includes("Garázs") : undefined,
    balcony: typeof fp.features["Erkély / Terasz"] === "string" ? fp.features["Erkély / Terasz"].includes("Van") : undefined,
    images: fp.images,
    featured: fp.featured,
    lat: fp.location?.lat,
    lng: fp.location?.lng,
  };
}

async function fetchProperties(): Promise<{ properties: Property[]; locations: string[] }> {
  try {
    const response = await fetch("/api/properties");

    if (!response.ok) {
      console.warn("[useProperties] API returned", response.status, "— falling back to mock data");
      return { properties: mockProperties, locations: mockLocations };
    }

    const data: FeedResponse = await response.json();

    if (data.error || !data.properties?.length) {
      console.warn("[useProperties] No feed data available — using mock data");
      return { properties: mockProperties, locations: mockLocations };
    }

    const properties = data.properties.map(toClientProperty);
    const locationSet = new Set(properties.map((p) => p.location).filter(Boolean));
    const locations = Array.from(locationSet).sort((a, b) => a.localeCompare(b, "hu"));

    return { properties, locations };
  } catch (err) {
    console.warn("[useProperties] Fetch failed — using mock data:", err);
    return { properties: mockProperties, locations: mockLocations };
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
  };
}
