import { describe, it, expect } from "vitest";
import {
  convertHufToEur,
  convertEurToHuf,
  formatHUF,
  formatEUR,
  formatPrice,
} from "@/lib/currencyConverter";

describe("convertHufToEur", () => {
  it("converts using default rate", () => {
    expect(convertHufToEur(40000)).toBe(100);
  });

  it("converts using custom rate", () => {
    expect(convertHufToEur(39000, 390)).toBe(100);
  });

  it("rounds to nearest integer", () => {
    expect(convertHufToEur(1000, 400)).toBe(3);
  });

  it("returns 0 for zero input", () => {
    expect(convertHufToEur(0)).toBe(0);
  });

  it("handles very large amounts", () => {
    expect(convertHufToEur(400_000_000, 400)).toBe(1_000_000);
  });

  it("falls back to default rate when rate is 0", () => {
    expect(convertHufToEur(40000, 0)).toBe(100);
  });

  it("falls back to default rate when rate is negative", () => {
    expect(convertHufToEur(40000, -400)).toBe(100);
  });

  it("returns 0 for NaN input", () => {
    expect(convertHufToEur(NaN)).toBe(0);
  });
});

describe("convertEurToHuf", () => {
  it("converts using default rate", () => {
    expect(convertEurToHuf(100)).toBe(40000);
  });

  it("converts using custom rate", () => {
    expect(convertEurToHuf(100, 390)).toBe(39000);
  });

  it("returns 0 for zero input", () => {
    expect(convertEurToHuf(0)).toBe(0);
  });

  it("returns 0 for NaN input", () => {
    expect(convertEurToHuf(NaN)).toBe(0);
  });
});

describe("formatHUF", () => {
  it("formats with Ft suffix and Hungarian thousand separators", () => {
    const result = formatHUF(69900000);
    expect(result).toContain("Ft");
    expect(result).toContain("69");
    expect(result).toContain("900");
    expect(result).toContain("000");
  });

  it("formats zero as '0 Ft'", () => {
    expect(formatHUF(0)).toBe("0 Ft");
  });

  it("handles NaN gracefully", () => {
    const result = formatHUF(NaN);
    expect(result).not.toContain("NaN");
  });
});

describe("formatEUR", () => {
  it("formats with € prefix", () => {
    const result = formatEUR(174750);
    expect(result).toContain("€");
    expect(result).toContain("174");
    expect(result).toContain("750");
  });

  it("formats zero as '€0'", () => {
    expect(formatEUR(0)).toBe("€0");
  });

  it("handles NaN gracefully", () => {
    const result = formatEUR(NaN);
    expect(result).not.toContain("NaN");
  });
});

describe("formatPrice", () => {
  it("formats HUF prices", () => {
    const result = formatPrice(10000000, "HUF");
    expect(result).toContain("Ft");
  });

  it("formats EUR prices with conversion", () => {
    const result = formatPrice(40000000, "EUR", 400);
    expect(result).toContain("€");
    expect(result).toContain("100");
  });

  it("handles zero price", () => {
    expect(formatPrice(0, "HUF")).toBe("0 Ft");
    expect(formatPrice(0, "EUR")).toBe("€0");
  });

  it("handles NaN price gracefully", () => {
    const hufResult = formatPrice(NaN, "HUF");
    const eurResult = formatPrice(NaN, "EUR");
    expect(hufResult).not.toContain("NaN");
    expect(eurResult).not.toContain("NaN");
  });

  it("handles rate=0 by using fallback", () => {
    const result = formatPrice(40000, "EUR", 0);
    expect(result).toContain("€");
    expect(result).not.toContain("Infinity");
    expect(result).not.toContain("NaN");
  });
});
