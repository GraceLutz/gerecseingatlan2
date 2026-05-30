import { describe, it, expect } from "vitest";
import { translateHuToEn, translateEnToHu } from "@/contexts/LanguageContext";

describe("translateHuToEn", () => {
  it("translates known static routes", () => {
    expect(translateHuToEn("/ingatlanok")).toBe("/properties");
    expect(translateHuToEn("/kapcsolat")).toBe("/contact");
    expect(translateHuToEn("/gyik")).toBe("/faq");
    expect(translateHuToEn("/bemutatkozas")).toBe("/introduction");
  });

  it("translates dynamic property detail paths", () => {
    expect(translateHuToEn("/ingatlan/123")).toBe("/property/123");
    expect(translateHuToEn("/ingatlan/abc-def")).toBe("/property/abc-def");
  });

  it("returns unknown paths as-is", () => {
    expect(translateHuToEn("/unknown-page")).toBe("/unknown-page");
  });

  it("translates service routes", () => {
    expect(translateHuToEn("/ingatlan-ertekesites")).toBe("/property-sales");
    expect(translateHuToEn("/ingatlan-berbeadas")).toBe("/property-letting");
    expect(translateHuToEn("/ingatlan-ertekesites-berbeadas")).toBe("/property-sales-and-rental");
    expect(translateHuToEn("/energetikai-tanusitvany")).toBe("/energy-performance-certificate");
    expect(translateHuToEn("/belsoepiteszet-latvanyterv")).toBe("/interior-design-and-visualization");
    expect(translateHuToEn("/hitel-allami-tamogatasok")).toBe("/credit-and-state-support");
  });

  it("translates legal pages", () => {
    expect(translateHuToEn("/adatkezelesi-tajekoztato")).toBe("/privacy-policy");
    expect(translateHuToEn("/cookie-tajekoztato")).toBe("/cookie-policy");
    expect(translateHuToEn("/aszf")).toBe("/terms");
  });
});

describe("translateEnToHu", () => {
  it("translates known static routes back to Hungarian", () => {
    expect(translateEnToHu("/properties")).toBe("/ingatlanok");
    expect(translateEnToHu("/contact")).toBe("/kapcsolat");
    expect(translateEnToHu("/faq")).toBe("/gyik");
    expect(translateEnToHu("/introduction")).toBe("/bemutatkozas");
  });

  it("translates dynamic property detail paths back", () => {
    expect(translateEnToHu("/property/123")).toBe("/ingatlan/123");
    expect(translateEnToHu("/property/abc-def")).toBe("/ingatlan/abc-def");
  });

  it("returns unknown paths as-is", () => {
    expect(translateEnToHu("/unknown-page")).toBe("/unknown-page");
  });

  it("is a proper inverse of translateHuToEn for all mapped routes", () => {
    const huPaths = [
      "/bemutatkozas", "/munkatarsaink", "/velemenyek", "/ingatlanok",
      "/kapcsolat", "/gyik", "/aszf", "/adatkezelesi-tajekoztato",
      "/cookie-tajekoztato", "/impresszum",
    ];
    for (const huPath of huPaths) {
      const enPath = translateHuToEn(huPath);
      expect(translateEnToHu(enPath)).toBe(huPath);
    }
  });

  it("round-trips dynamic property paths", () => {
    const huPath = "/ingatlan/42";
    const enPath = translateHuToEn(huPath);
    expect(translateEnToHu(enPath)).toBe(huPath);
  });
});
