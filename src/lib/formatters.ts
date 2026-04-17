/**
 * Hungarian formatting utilities for dates, areas, rooms, and addresses.
 *
 * All formatters follow Hungarian locale conventions:
 * - Dates: "2026. április 16." or "2026.04.16."
 * - Areas: "120 m²" (with non-breaking space)
 * - Rooms: "3+1 szobás"
 * - Prices: delegated to currencyConverter.ts (single source of truth)
 */

/** Hungarian month names (lowercase, as used in formal Hungarian dates) */
const HU_MONTHS = [
  "január",
  "február",
  "március",
  "április",
  "május",
  "június",
  "július",
  "augusztus",
  "szeptember",
  "október",
  "november",
  "december",
] as const;

/**
 * Formats a date in long Hungarian format: "2026. április 16."
 * @param date - Date object or ISO string
 * @returns Formatted date string (e.g. "2026. április 16.")
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = HU_MONTHS[d.getMonth()];
  const day = d.getDate();
  return `${year}. ${month} ${day}.`;
}

/**
 * Formats a date in short Hungarian format: "2026.04.16."
 * @param date - Date object or ISO string
 * @returns Formatted date string (e.g. "2026.04.16.")
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}.`;
}

/**
 * Formats an area value in Hungarian convention with m² unit.
 * Uses non-breaking space between number and unit for proper typography.
 * @param squareMeters - Area in square meters
 * @returns Formatted string (e.g. "120\u00a0m²")
 */
export function formatArea(squareMeters: number): string {
  const formatted = new Intl.NumberFormat("hu-HU").format(squareMeters);
  return `${formatted}\u00a0m²`;
}

/**
 * Formats a plot/land area in Hungarian convention with m² or ha.
 * Uses hectares for areas >= 10 000 m².
 * @param squareMeters - Area in square meters
 * @returns Formatted string (e.g. "1\u00a0200\u00a0m²" or "2,5\u00a0ha")
 */
export function formatPlotArea(squareMeters: number): string {
  if (squareMeters >= 10_000) {
    const ha = squareMeters / 10_000;
    const formatted = new Intl.NumberFormat("hu-HU", {
      maximumFractionDigits: 1,
    }).format(ha);
    return `${formatted}\u00a0ha`;
  }
  const formatted = new Intl.NumberFormat("hu-HU").format(squareMeters);
  return `${formatted}\u00a0m²`;
}

/**
 * Formats room count in Hungarian convention.
 * Hungarian real estate uses "X+Y szobás" where Y = félszoba (half-rooms).
 * @param rooms - Number of full rooms
 * @param halfRooms - Number of half-rooms (félszoba), defaults to 0
 * @returns Formatted string (e.g. "3 szobás" or "3+1 szobás")
 */
export function formatRooms(rooms: number, halfRooms = 0): string {
  if (halfRooms > 0) {
    return `${rooms}+${halfRooms} szobás`;
  }
  return `${rooms} szobás`;
}

/**
 * Formats a Hungarian postal address.
 * Hungarian format: "PostalCode City, Street"
 * @param postalCode - 4-digit Hungarian postal code
 * @param city - City/town name
 * @param street - Street address (optional)
 * @returns Formatted address string
 */
export function formatAddress(
  postalCode: string,
  city: string,
  street?: string,
): string {
  const base = `${postalCode} ${city}`;
  return street ? `${base}, ${street}` : base;
}

/**
 * Formats a Hungarian phone number for display.
 * Converts "+36301234567" to "+36 30 123 4567".
 * @param phone - Phone number string (with or without +36 prefix)
 * @returns Formatted phone string
 */
export function formatPhone(phone: string): string {
  // Strip all non-digit characters except leading +
  const cleaned = phone.replace(/(?!^\+)\D/g, "");

  // Match Hungarian mobile: +36 XX XXX XXXX
  const mobileMatch = cleaned.match(/^(\+36)(20|30|31|50|70)(\d{3})(\d{4})$/);
  if (mobileMatch) {
    return `${mobileMatch[1]} ${mobileMatch[2]} ${mobileMatch[3]} ${mobileMatch[4]}`;
  }

  // Match Hungarian landline: +36 XX XXX XXX (shorter)
  const landlineMatch = cleaned.match(/^(\+36)(\d{1,2})(\d{3})(\d{3,4})$/);
  if (landlineMatch) {
    return `${landlineMatch[1]} ${landlineMatch[2]} ${landlineMatch[3]} ${landlineMatch[4]}`;
  }

  // Fallback: return as-is
  return phone;
}

/**
 * Strips Hungarian accented characters from a string for URL-safe slugs.
 * "Eladó családi ház Tata" → "elado-csaladi-haz-tata"
 * @param text - Input text with potential Hungarian characters
 * @returns URL-safe slug
 */
export function toHungarianSlug(text: string): string {
  const charMap: Record<string, string> = {
    á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o",
    ú: "u", ü: "u", ű: "u",
    Á: "a", É: "e", Í: "i", Ó: "o", Ö: "o", Ő: "o",
    Ú: "u", Ü: "u", Ű: "u",
  };
  return text
    .toLowerCase()
    .split("")
    .map((ch) => charMap[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
