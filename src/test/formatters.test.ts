import { describe, it, expect } from "vitest";
import {
  formatDateLong,
  formatDateShort,
  formatArea,
  formatPlotArea,
  formatRooms,
  formatAddress,
  formatPhone,
  toHungarianSlug,
} from "@/lib/formatters";

describe("formatDateLong", () => {
  it("formats a date in long Hungarian format", () => {
    const date = new Date(2026, 3, 16); // April 16, 2026
    expect(formatDateLong(date)).toBe("2026. április 16.");
  });

  it("formats January correctly", () => {
    const date = new Date(2026, 0, 1);
    expect(formatDateLong(date)).toBe("2026. január 1.");
  });

  it("accepts ISO string input", () => {
    expect(formatDateLong("2026-04-16T00:00:00")).toBe("2026. április 16.");
  });
});

describe("formatDateShort", () => {
  it("formats a date in short Hungarian format", () => {
    const date = new Date(2026, 3, 16);
    expect(formatDateShort(date)).toBe("2026.04.16.");
  });

  it("pads single-digit month and day", () => {
    const date = new Date(2026, 0, 5);
    expect(formatDateShort(date)).toBe("2026.01.05.");
  });
});

describe("formatArea", () => {
  it("formats area with non-breaking space before m²", () => {
    expect(formatArea(120)).toBe("120\u00a0m²");
  });

  it("formats large areas with thousand separator", () => {
    const result = formatArea(1200);
    expect(result).toContain("1");
    expect(result).toContain("200");
    expect(result).toContain("m²");
  });

  it("formats zero area", () => {
    expect(formatArea(0)).toBe("0\u00a0m²");
  });

  it("formats very large areas", () => {
    const result = formatArea(999999);
    expect(result).toContain("m²");
    expect(result).not.toContain("NaN");
  });
});

describe("formatPlotArea", () => {
  it("formats small plots in m²", () => {
    expect(formatPlotArea(800)).toBe("800\u00a0m²");
  });

  it("converts large plots to hectares", () => {
    const result = formatPlotArea(25000);
    expect(result).toBe("2,5\u00a0ha");
  });

  it("formats exactly 10000 m² as 1 ha", () => {
    expect(formatPlotArea(10000)).toBe("1\u00a0ha");
  });
});

describe("formatRooms", () => {
  it("formats full rooms only with default Hungarian label", () => {
    expect(formatRooms(3)).toBe("3 szobás");
  });

  it("formats rooms with half-rooms", () => {
    expect(formatRooms(3, 1)).toBe("3+1 szobás");
  });

  it("formats rooms with zero half-rooms as rooms only", () => {
    expect(formatRooms(2, 0)).toBe("2 szobás");
  });

  it("accepts a custom label for English localization", () => {
    expect(formatRooms(3, 0, "rooms")).toBe("3 rooms");
    expect(formatRooms(3, 1, "rooms")).toBe("3+1 rooms");
  });
});

describe("formatAddress", () => {
  it("formats postal code and city", () => {
    expect(formatAddress("2890", "Tata")).toBe("2890 Tata");
  });

  it("formats full address with street", () => {
    expect(formatAddress("2890", "Tata", "Kossuth tér 1.")).toBe(
      "2890 Tata, Kossuth tér 1.",
    );
  });
});

describe("formatPhone", () => {
  it("formats Hungarian mobile number", () => {
    expect(formatPhone("+36706132658")).toBe("+36 70 613 2658");
  });

  it("returns unrecognized numbers as-is", () => {
    expect(formatPhone("12345")).toBe("12345");
  });
});

describe("toHungarianSlug", () => {
  it("removes accents and creates URL-safe slug", () => {
    expect(toHungarianSlug("Eladó családi ház Tata")).toBe(
      "elado-csaladi-haz-tata",
    );
  });

  it("handles all Hungarian accented characters", () => {
    expect(toHungarianSlug("áéíóöőúüű")).toBe("aeiooouuu");
  });

  it("removes leading and trailing hyphens", () => {
    expect(toHungarianSlug(" hello world ")).toBe("hello-world");
  });

  it("collapses multiple non-alphanumeric characters", () => {
    expect(toHungarianSlug("eladó -- ház")).toBe("elado-haz");
  });
});
