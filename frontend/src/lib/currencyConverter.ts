/** Default HUF/EUR exchange rate (approximate) */
export const DEFAULT_EUR_RATE = 400;

/** Returns 0 for NaN/Infinity, otherwise the input value */
function safeNumber(n: number): number {
  return Number.isFinite(n) ? n : 0;
}

/** Returns the rate if positive, otherwise falls back to DEFAULT_EUR_RATE */
function safeRate(rate: number): number {
  return rate > 0 ? rate : DEFAULT_EUR_RATE;
}

/**
 * Converts a HUF amount to EUR using the given exchange rate.
 * @param hufAmount - Amount in Hungarian Forints
 * @param rate - HUF per 1 EUR (defaults to 400); falls back to default if <= 0
 * @returns Amount in EUR (rounded to nearest integer), 0 for invalid input
 */
export function convertHufToEur(hufAmount: number, rate = DEFAULT_EUR_RATE): number {
  return Math.round(safeNumber(hufAmount) / safeRate(rate));
}

/**
 * Converts an EUR amount to HUF using the given exchange rate.
 * @param eurAmount - Amount in Euros
 * @param rate - HUF per 1 EUR (defaults to 400)
 * @returns Amount in HUF, 0 for invalid input
 */
export function convertEurToHuf(eurAmount: number, rate = DEFAULT_EUR_RATE): number {
  return Math.round(safeNumber(eurAmount) * safeRate(rate));
}

/**
 * Formats a HUF price for display.
 * @param amount - Amount in HUF
 * @returns Formatted string like "69 900 000 Ft", or "0 Ft" for invalid input
 */
export function formatHUF(amount: number): string {
  return new Intl.NumberFormat("hu-HU").format(safeNumber(amount)) + " Ft";
}

/**
 * Formats an EUR price for display.
 * @param amount - Amount in EUR
 * @returns Formatted string like "€174.750", or "€0" for invalid input
 */
export function formatEUR(amount: number): string {
  return "€" + new Intl.NumberFormat("de-DE").format(safeNumber(amount));
}

/**
 * Formats a price in the given currency, converting from HUF if needed.
 * @param hufPrice - Original price in HUF
 * @param currency - Target currency ("HUF" or "EUR")
 * @param rate - HUF per 1 EUR exchange rate
 * @returns Formatted price string
 */
export function formatPrice(
  hufPrice: number,
  currency: "HUF" | "EUR",
  rate = DEFAULT_EUR_RATE,
): string {
  if (currency === "HUF") {
    return formatHUF(hufPrice);
  }
  return formatEUR(convertHufToEur(hufPrice, rate));
}
