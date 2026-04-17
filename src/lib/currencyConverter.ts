/** Default HUF/EUR exchange rate (approximate) */
const DEFAULT_EUR_RATE = 400;

/**
 * Converts a HUF amount to EUR using the given exchange rate.
 * @param hufAmount - Amount in Hungarian Forints
 * @param rate - HUF per 1 EUR (defaults to 400)
 * @returns Amount in EUR (rounded to nearest integer)
 */
export function convertHufToEur(hufAmount: number, rate = DEFAULT_EUR_RATE): number {
  return Math.round(hufAmount / rate);
}

/**
 * Converts an EUR amount to HUF using the given exchange rate.
 * @param eurAmount - Amount in Euros
 * @param rate - HUF per 1 EUR (defaults to 400)
 * @returns Amount in HUF
 */
export function convertEurToHuf(eurAmount: number, rate = DEFAULT_EUR_RATE): number {
  return Math.round(eurAmount * rate);
}

/**
 * Formats a HUF price for display.
 * @param amount - Amount in HUF
 * @returns Formatted string like "69 900 000 Ft"
 */
export function formatHUF(amount: number): string {
  return new Intl.NumberFormat("hu-HU").format(amount) + " Ft";
}

/**
 * Formats an EUR price for display.
 * @param amount - Amount in EUR
 * @returns Formatted string like "€174 750"
 */
export function formatEUR(amount: number): string {
  return "€" + new Intl.NumberFormat("de-DE").format(amount);
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
