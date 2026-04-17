import type { Property } from "@/data/properties";

/**
 * Represents the office info from the Ingatlan Forrás 9 XML feed.
 */
export interface OfficeInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  web: string;
}

/**
 * Represents the parsed result of an Ingatlan Forrás 9 XML feed.
 */
export interface XmlFeedResult {
  office: OfficeInfo;
  agents: AgentInfo[];
  properties: Property[];
}

/**
 * Represents an agent/sales person from the feed.
 */
export interface AgentInfo {
  name: string;
  phone: string;
  email: string;
}

/**
 * Safely extracts text content from an XML element by tag name.
 */
function getTagText(parent: Element, tagName: string): string {
  const el = parent.getElementsByTagName(tagName)[0];
  return el?.textContent?.trim() ?? "";
}

/**
 * Safely extracts a numeric value from an XML element by tag name.
 */
function getTagNumber(parent: Element, tagName: string): number {
  const text = getTagText(parent, tagName);
  const num = parseFloat(text);
  return isNaN(num) ? 0 : num;
}

/**
 * Safely extracts an optional numeric value from an XML element.
 */
function getTagNumberOptional(parent: Element, tagName: string): number | undefined {
  const text = getTagText(parent, tagName);
  if (!text) return undefined;
  const num = parseFloat(text);
  return isNaN(num) ? undefined : num;
}

/**
 * Maps Ingatlan Forrás 9 property type strings to our internal type keys.
 */
function mapPropertyType(type: string): string {
  const typeMap: Record<string, string> = {
    "családi ház": "house",
    "ház": "house",
    "tégla lakás": "brick",
    "tégla": "brick",
    "panel lakás": "panel",
    "panel": "panel",
    "ikerház": "semiDetached",
    "sorház": "rowHouse",
    "nyaraló": "holiday",
    "telek": "land",
    "építési telek": "land",
    "ipari": "industrial",
    "ipari ingatlan": "industrial",
    "csarnok": "industrial",
    "raktár": "industrial",
    "iroda": "industrial",
    "üzlethelyiség": "industrial",
    "garzon": "brick",
    "lakás": "brick",
  };
  return typeMap[type.toLowerCase()] ?? "house";
}

/**
 * Maps Ingatlan Forrás 9 status to our internal status.
 */
function mapStatus(status: string): "sale" | "rent" {
  const lower = status.toLowerCase();
  if (lower.includes("kiadó") || lower.includes("bérl")) {
    return "rent";
  }
  return "sale";
}

/**
 * Parses an Ingatlan Forrás 9 XML feed string into structured data.
 *
 * The XML format from Ingatlan Forrás 9 typically contains:
 * - <iroda> (office info)
 * - <ertekesitok> (sales agents)
 * - <ingatlanok> (property listings)
 *
 * Each <ingatlan> element contains property details like
 * id, title, price, location, rooms, area, type, images, etc.
 *
 * @param xmlString - Raw XML string from the feed
 * @returns Parsed feed result with office info and properties
 */
export function parseXmlFeed(xmlString: string): XmlFeedResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");

  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    throw new Error(`XML parsing error: ${parserError.textContent}`);
  }

  const office = parseOffice(doc);
  const agents = parseAgents(doc);
  const properties = parseProperties(doc);

  return { office, agents, properties };
}

function parseOffice(doc: Document): OfficeInfo {
  const irodaEl = doc.getElementsByTagName("iroda")[0];
  if (!irodaEl) {
    return { name: "", email: "", phone: "", address: "", web: "" };
  }

  return {
    name: getTagText(irodaEl, "nev"),
    email: getTagText(irodaEl, "email"),
    phone: getTagText(irodaEl, "telefon"),
    address: getTagText(irodaEl, "cim"),
    web: getTagText(irodaEl, "web"),
  };
}

function parseAgents(doc: Document): AgentInfo[] {
  const agents: AgentInfo[] = [];
  const agentElements = doc.getElementsByTagName("ertekesito");

  for (let i = 0; i < agentElements.length; i++) {
    const el = agentElements[i];
    agents.push({
      name: getTagText(el, "nev"),
      phone: getTagText(el, "telefon"),
      email: getTagText(el, "email"),
    });
  }

  return agents;
}

function parseProperties(doc: Document): Property[] {
  const properties: Property[] = [];
  const ingatlanElements = doc.getElementsByTagName("ingatlan");

  for (let i = 0; i < ingatlanElements.length; i++) {
    const el = ingatlanElements[i];
    const images = parseImages(el);
    const title = getTagText(el, "cim") || getTagText(el, "helyseg");

    const property: Property = {
      id: getTagText(el, "azonosito") || getTagText(el, "id") || `IF-${i + 1}`,
      titleHu: title,
      titleEn: title, // XML feed provides Hungarian only; English can be translated later
      descriptionHu: getTagText(el, "leiras") || getTagText(el, "szoveg"),
      descriptionEn: "",
      price: getTagNumber(el, "ar"),
      type: mapPropertyType(getTagText(el, "ingatlan_tipus") || getTagText(el, "tipus")),
      status: mapStatus(getTagText(el, "statusz") || getTagText(el, "kategoria")),
      location: getTagText(el, "helyseg") || getTagText(el, "telepules"),
      area: getTagNumber(el, "alapterulet"),
      lotSize: getTagNumberOptional(el, "telekterulet"),
      rooms: getTagNumber(el, "szobaszam"),
      bathrooms: getTagNumber(el, "furdoszoba"),
      builtYear: getTagNumberOptional(el, "epitesi_ev") || getTagNumberOptional(el, "epites_eve"),
      condition: getTagText(el, "allapot") || undefined,
      heating: getTagText(el, "futes") || undefined,
      energy: getTagText(el, "energetikai") || getTagText(el, "energia_besorolas") || undefined,
      floor: getTagNumberOptional(el, "emelet"),
      elevator: parseBooleanField(getTagText(el, "lift")),
      parking: parseBooleanField(getTagText(el, "parkolo")),
      balcony: parseBooleanField(getTagText(el, "erkely")),
      images,
      featured: parseBooleanField(getTagText(el, "kiemelt")) ?? false,
      lat: getTagNumberOptional(el, "lat") || getTagNumberOptional(el, "szelesseg"),
      lng: getTagNumberOptional(el, "lng") || getTagNumberOptional(el, "hosszusag"),
    };

    properties.push(property);
  }

  return properties;
}

function parseImages(el: Element): string[] {
  const images: string[] = [];

  // Try <kepek><kep> structure
  const kepElements = el.getElementsByTagName("kep");
  for (let i = 0; i < kepElements.length; i++) {
    const src = kepElements[i].textContent?.trim() ||
                kepElements[i].getAttribute("src") ||
                kepElements[i].getAttribute("url");
    if (src) images.push(src);
  }

  // Try <foto> elements as fallback
  if (images.length === 0) {
    const fotoElements = el.getElementsByTagName("foto");
    for (let i = 0; i < fotoElements.length; i++) {
      const src = fotoElements[i].textContent?.trim();
      if (src) images.push(src);
    }
  }

  return images;
}

function parseBooleanField(value: string): boolean | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (lower === "igen" || lower === "van" || lower === "1" || lower === "true") return true;
  if (lower === "nem" || lower === "nincs" || lower === "0" || lower === "false") return false;
  return undefined;
}

/**
 * Fetches and parses the Ingatlan Forrás 9 XML feed from a URL.
 * @param feedUrl - URL of the XML feed
 * @param timeoutMs - Request timeout in milliseconds (default: 15000)
 * @returns Parsed feed result
 */
export async function fetchAndParseXmlFeed(
  feedUrl: string,
  timeoutMs = 15000,
): Promise<XmlFeedResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(feedUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch XML feed: ${response.status} ${response.statusText}`);
    }
    const xmlString = await response.text();
    return parseXmlFeed(xmlString);
  } finally {
    clearTimeout(timeoutId);
  }
}
