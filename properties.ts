export interface Property {
  id: string;
  titleHu: string;
  titleEn: string;
  descriptionHu: string;
  descriptionEn: string;
  price: number; // HUF
  type: string;
  status: "sale" | "rent";
  location: string;
  area: number;
  lotSize?: number;
  rooms: number;
  bathrooms: number;
  builtYear?: number;
  condition?: string;
  heating?: string;
  energy?: string;
  floor?: number;
  elevator?: boolean;
  parking?: boolean;
  balcony?: boolean;
  images: string[];
  featured: boolean;
  lat?: number;
  lng?: number;
}

export const mockProperties: Property[] = [
  {
    id: "GI-001",
    titleHu: "Családi ház Tatán",
    titleEn: "Family house in Tata",
    descriptionHu: "Gyönyörű, felújított családi ház a Tata belvárosában, csendes utcában. A ház 4 szobás, 2 fürdőszobás, nagy kerttel és garázzsal rendelkezik. Újszerű állapotban, azonnal költözhető.",
    descriptionEn: "Beautiful, renovated family house in the center of Tata, in a quiet street. The house has 4 rooms, 2 bathrooms, a large garden and a garage. In like-new condition, ready to move in.",
    price: 69900000,
    type: "house",
    status: "sale",
    location: "Tata",
    area: 145,
    lotSize: 680,
    rooms: 4,
    bathrooms: 2,
    builtYear: 1985,
    condition: "Felújított",
    heating: "Gáz (cirkó)",
    energy: "CC",
    parking: true,
    balcony: true,
    images: ["/images/placeholder-property-1.jpg", "/images/placeholder-property-2.jpg", "/images/placeholder-property-3.jpg"],
    featured: true,
  },
  {
    id: "GI-002",
    titleHu: "Téglalakás Tatabányán",
    titleEn: "Brick apartment in Tatabánya",
    descriptionHu: "Tágas, 3 szobás tégla lakás Tatabánya központjában, kiváló közlekedési lehetőségekkel. Felújított konyha és fürdőszoba.",
    descriptionEn: "Spacious 3-room brick apartment in the center of Tatabánya with excellent transport links. Renovated kitchen and bathroom.",
    price: 34500000,
    type: "brick",
    status: "sale",
    location: "Tatabánya",
    area: 78,
    rooms: 3,
    bathrooms: 1,
    builtYear: 1972,
    condition: "Felújított",
    heating: "Távfűtés",
    energy: "DD",
    floor: 3,
    elevator: true,
    balcony: true,
    images: ["/images/placeholder-property-1.jpg", "/images/placeholder-property-2.jpg", "/images/placeholder-property-3.jpg"],
    featured: true,
  },
  {
    id: "GI-003",
    titleHu: "Nyaraló a Gerecse lábánál",
    titleEn: "Holiday home at the foot of Gerecse",
    descriptionHu: "Hangulatos nyaraló a Gerecse hegység lábánál, természetközeli környezetben. Ideális pihenésre és kikapcsolódásra.",
    descriptionEn: "Charming holiday home at the foot of the Gerecse Mountains in a nature-close setting. Ideal for relaxation.",
    price: 28500000,
    type: "holiday",
    status: "sale",
    location: "Vértestolna",
    area: 65,
    lotSize: 1200,
    rooms: 2,
    bathrooms: 1,
    builtYear: 1990,
    condition: "Jó",
    heating: "Vegyes tüzelés",
    energy: "FF",
    parking: true,
    images: ["/images/placeholder-property-1.jpg", "/images/placeholder-property-2.jpg", "/images/placeholder-property-3.jpg"],
    featured: true,
  },
  {
    id: "GI-004",
    titleHu: "Építési telek Neszmélyen",
    titleEn: "Building plot in Neszmély",
    descriptionHu: "Panorámás építési telek a Duna partján, Neszmélyen. Minden közmű a telekhatáron. Ideális családi ház építéséhez.",
    descriptionEn: "Panoramic building plot on the Danube bank in Neszmély. All utilities at the plot boundary. Ideal for building a family home.",
    price: 18900000,
    type: "land",
    status: "sale",
    location: "Neszmély",
    area: 950,
    rooms: 0,
    bathrooms: 0,
    images: ["/images/placeholder-property-1.jpg", "/images/placeholder-property-2.jpg", "/images/placeholder-property-3.jpg"],
    featured: true,
  },
  {
    id: "GI-005",
    titleHu: "Panellakás Tatabányán",
    titleEn: "Panel apartment in Tatabánya",
    descriptionHu: "2 szobás panel lakás Tatabánya újvárosában, felújított, azonnal költözhető. Kiváló befektetési lehetőség.",
    descriptionEn: "2-room panel apartment in Tatabánya Újváros, renovated, ready to move in. Excellent investment opportunity.",
    price: 22500000,
    type: "panel",
    status: "sale",
    location: "Tatabánya",
    area: 54,
    rooms: 2,
    bathrooms: 1,
    builtYear: 1978,
    condition: "Felújított",
    heating: "Távfűtés",
    energy: "DD",
    floor: 7,
    elevator: true,
    images: ["/images/placeholder-property-1.jpg", "/images/placeholder-property-2.jpg", "/images/placeholder-property-3.jpg"],
    featured: true,
  },
  {
    id: "GI-006",
    titleHu: "Kiadó lakás Tatán",
    titleEn: "Apartment for rent in Tata",
    descriptionHu: "Bútorozott, 2 szobás lakás kiadó Tata belvárosában. Azonnal költözhető, rezsi nem tartalmazza.",
    descriptionEn: "Furnished 2-room apartment for rent in the center of Tata. Ready to move in, utilities not included.",
    price: 150000,
    type: "brick",
    status: "rent",
    location: "Tata",
    area: 58,
    rooms: 2,
    bathrooms: 1,
    condition: "Jó",
    heating: "Gáz (konvektor)",
    floor: 1,
    images: ["/images/placeholder-property-1.jpg", "/images/placeholder-property-2.jpg", "/images/placeholder-property-3.jpg"],
    featured: true,
  },
  {
    id: "GI-007",
    titleHu: "Ipari csarnok Tatabányán",
    titleEn: "Industrial hall in Tatabánya",
    descriptionHu: "500 m² ipari csarnok kiváló megközelíthetőséggel, az M1-es autópálya közelében.",
    descriptionEn: "500 m² industrial hall with excellent accessibility, near the M1 motorway.",
    price: 89000000,
    type: "industrial",
    status: "sale",
    location: "Tatabánya",
    area: 500,
    lotSize: 2000,
    rooms: 3,
    bathrooms: 2,
    builtYear: 2005,
    condition: "Jó",
    heating: "Gáz",
    parking: true,
    images: ["/images/placeholder-property-1.jpg", "/images/placeholder-property-2.jpg", "/images/placeholder-property-3.jpg"],
    featured: false,
  },
  {
    id: "GI-008",
    titleHu: "Ikerház Tardoson",
    titleEn: "Semi-detached house in Tardos",
    descriptionHu: "Modern ikerház fele Tardos csendes részén. 3 szoba, 2 fürdő, garázs, kis kert.",
    descriptionEn: "Modern semi-detached house in a quiet part of Tardos. 3 rooms, 2 bathrooms, garage, small garden.",
    price: 45900000,
    type: "semiDetached",
    status: "sale",
    location: "Tardos",
    area: 110,
    lotSize: 350,
    rooms: 3,
    bathrooms: 2,
    builtYear: 2018,
    condition: "Újszerű",
    heating: "Padlófűtés",
    energy: "BB",
    parking: true,
    balcony: true,
    images: ["/images/placeholder-property-1.jpg", "/images/placeholder-property-2.jpg", "/images/placeholder-property-3.jpg"],
    featured: false,
  },
];

export const locations = [
  "Tata", "Tatabánya", "Neszmély", "Vértestolna", "Tardos",
  "Baj", "Héreg", "Dunaszentmiklós", "Vértesszőlős", "Szomód"
];
