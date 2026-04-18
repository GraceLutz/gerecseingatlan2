import { describe, it, expect } from "vitest";
import { mockProperties, locations } from "@/data/properties";

describe("mockProperties", () => {
  it("has at least 6 properties for a meaningful demo", () => {
    expect(mockProperties.length).toBeGreaterThanOrEqual(6);
  });

  it("all properties have unique IDs", () => {
    const ids = mockProperties.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all properties have required fields", () => {
    for (const prop of mockProperties) {
      expect(prop.id).toBeTruthy();
      expect(prop.titleHu).toBeTruthy();
      expect(prop.titleEn).toBeTruthy();
      expect(prop.price).toBeGreaterThan(0);
      expect(prop.type).toBeTruthy();
      expect(["sale", "rent"]).toContain(prop.status);
      expect(prop.location).toBeTruthy();
      expect(prop.area).toBeGreaterThan(0);
      expect(prop.images.length).toBeGreaterThan(0);
    }
  });

  it("has both sale and rent properties", () => {
    const statuses = new Set(mockProperties.map((p) => p.status));
    expect(statuses.has("sale")).toBe(true);
    expect(statuses.has("rent")).toBe(true);
  });

  it("has featured properties for homepage display", () => {
    const featured = mockProperties.filter((p) => p.featured);
    expect(featured.length).toBeGreaterThanOrEqual(3);
  });

  it("rent prices are plausible (< 1M HUF/month)", () => {
    const rentals = mockProperties.filter((p) => p.status === "rent");
    for (const prop of rentals) {
      expect(prop.price).toBeLessThan(1_000_000);
    }
  });

  it("sale prices are plausible (> 1M HUF)", () => {
    const sales = mockProperties.filter((p) => p.status === "sale");
    for (const prop of sales) {
      expect(prop.price).toBeGreaterThan(1_000_000);
    }
  });
});

describe("locations", () => {
  it("has at least 5 locations for meaningful filtering", () => {
    expect(locations.length).toBeGreaterThanOrEqual(5);
  });

  it("includes key Gerecse region cities", () => {
    expect(locations).toContain("Tata");
    expect(locations).toContain("Tatabánya");
  });

  it("all locations are non-empty strings", () => {
    for (const loc of locations) {
      expect(loc.trim().length).toBeGreaterThan(0);
    }
  });
});
