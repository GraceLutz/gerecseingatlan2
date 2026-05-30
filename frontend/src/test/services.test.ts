import { describe, it, expect } from "vitest";
import { services, getServiceBySlug } from "@/data/services";

describe("services data", () => {
  it("has 8 services", () => {
    expect(services).toHaveLength(8);
  });

  it("all services have unique slugs", () => {
    const slugs = services.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("all services have required fields", () => {
    for (const service of services) {
      expect(service.slug).toBeTruthy();
      expect(service.icon).toBeTruthy();
      expect(service.titleKey).toBeTruthy();
      expect(service.descKey).toBeTruthy();
    }
  });

  it("all slugs are URL-safe (lowercase, hyphens, no accents)", () => {
    for (const service of services) {
      expect(service.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

describe("getServiceBySlug", () => {
  it("finds selling service by slug", () => {
    const service = getServiceBySlug("ingatlan-ertekesites");
    expect(service).toBeDefined();
    expect(service!.titleKey).toBe("salesTitle");
  });

  it("finds rental service by slug", () => {
    const service = getServiceBySlug("ingatlan-berbeadas");
    expect(service).toBeDefined();
    expect(service!.titleKey).toBe("rentalTitle");
  });

  it("returns undefined for old combined slug", () => {
    expect(getServiceBySlug("ingatlan-ertekesites-berbeadas")).toBeUndefined();
  });

  it("returns undefined for unknown slug", () => {
    expect(getServiceBySlug("nonexistent")).toBeUndefined();
  });

  it("finds all 8 services by their respective slugs", () => {
    const expectedSlugs = [
      "ingatlan-ertekesites",
      "ingatlan-berbeadas",
      "ertekbecsles-ertekmeghatrozas",
      "belsoepiteszet-latvanyterv",
      "teljeskoru-jogi-hatter",
      "hitel-allami-tamogatasok",
      "energetikai-tanusitvany",
      "villamos-biztonsagi-felulvizsgalat",
    ];
    for (const slug of expectedSlugs) {
      expect(getServiceBySlug(slug)).toBeDefined();
    }
  });
});
