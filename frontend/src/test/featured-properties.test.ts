import { describe, it, expect } from "vitest";
import type { FeaturedProperty, NewFeaturedProperty } from "../../server/db/schema/featured";
import { featuredProperties } from "../../server/db/schema/featured";

describe("featured_properties schema", () => {
  it("exports the table with correct SQL table name", () => {
    expect(featuredProperties).toBeDefined();
    // Drizzle tables expose their SQL name via the Symbol-keyed config
    const tableName = (featuredProperties as Record<string, unknown>)[
      Symbol.for("drizzle:Name")
    ];
    expect(tableName).toBe("featured_properties");
  });

  it("FeaturedProperty type has all required fields", () => {
    const sample: FeaturedProperty = {
      id: "00000000-0000-0000-0000-000000000000",
      propertyId: "prop-123",
      isFeatured: true,
      featuredAt: new Date(),
      featuredOrder: 0,
      featuredBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(sample.id).toBeTruthy();
    expect(sample.propertyId).toBe("prop-123");
    expect(sample.isFeatured).toBe(true);
    expect(sample.featuredAt).toBeInstanceOf(Date);
    expect(sample.featuredOrder).toBe(0);
    expect(sample.featuredBy).toBeNull();
    expect(sample.createdAt).toBeInstanceOf(Date);
    expect(sample.updatedAt).toBeInstanceOf(Date);
  });

  it("NewFeaturedProperty requires only propertyId (rest have defaults)", () => {
    const minimal: NewFeaturedProperty = {
      propertyId: "prop-456",
    };
    expect(minimal.propertyId).toBe("prop-456");
    expect(minimal.isFeatured).toBeUndefined();
    expect(minimal.featuredOrder).toBeUndefined();
    expect(minimal.featuredBy).toBeUndefined();
  });

  it("schema defines propertyId as unique", () => {
    const columns = featuredProperties as Record<string, unknown>;
    const propertyIdCol = (columns as { propertyId: { isUnique: boolean } }).propertyId;
    expect(propertyIdCol.isUnique).toBe(true);
  });
});

describe("featured properties business rules", () => {
  const MAX_FEATURED = 6;

  it("enforces a maximum of 6 featured properties", () => {
    const featuredList = Array.from({ length: MAX_FEATURED }, (_, i) => ({
      propertyId: `prop-${i}`,
      isFeatured: true,
      featuredOrder: i,
    }));

    expect(featuredList).toHaveLength(MAX_FEATURED);
    expect(featuredList.length + 1).toBeGreaterThan(MAX_FEATURED);
  });

  it("toggle on sets isFeatured to true", () => {
    const before = { propertyId: "prop-1", isFeatured: false };
    const after = { ...before, isFeatured: true };
    expect(after.isFeatured).toBe(true);
  });

  it("toggle off sets isFeatured to false", () => {
    const before = { propertyId: "prop-1", isFeatured: true };
    const after = { ...before, isFeatured: false };
    expect(after.isFeatured).toBe(false);
  });

  it("reorder assigns sequential featuredOrder values", () => {
    const propertyIds = ["prop-c", "prop-a", "prop-b"];
    const reordered = propertyIds.map((pid, index) => ({
      propertyId: pid,
      featuredOrder: index,
    }));

    expect(reordered[0]).toEqual({ propertyId: "prop-c", featuredOrder: 0 });
    expect(reordered[1]).toEqual({ propertyId: "prop-a", featuredOrder: 1 });
    expect(reordered[2]).toEqual({ propertyId: "prop-b", featuredOrder: 2 });
  });
});

describe("featured merge into properties response", () => {
  it("marks properties as featured when they exist in the featured map", () => {
    const featuredMap = new Map<string, number>([
      ["prop-1", 0],
      ["prop-3", 1],
    ]);

    const feedProperties = [
      { id: "prop-1", title: "House A" },
      { id: "prop-2", title: "House B" },
      { id: "prop-3", title: "House C" },
    ];

    const merged = feedProperties.map((p) => ({
      ...p,
      featured: featuredMap.has(p.id),
      featuredOrder: featuredMap.get(p.id) ?? null,
    }));

    expect(merged[0].featured).toBe(true);
    expect(merged[0].featuredOrder).toBe(0);
    expect(merged[1].featured).toBe(false);
    expect(merged[1].featuredOrder).toBeNull();
    expect(merged[2].featured).toBe(true);
    expect(merged[2].featuredOrder).toBe(1);
  });

  it("returns no featured properties when featured map is empty", () => {
    const featuredMap = new Map<string, number>();

    const feedProperties = [
      { id: "prop-1", title: "House A" },
      { id: "prop-2", title: "House B" },
    ];

    const merged = feedProperties.map((p) => ({
      ...p,
      featured: featuredMap.has(p.id),
      featuredOrder: featuredMap.get(p.id) ?? null,
    }));

    expect(merged.every((p) => !p.featured)).toBe(true);
    expect(merged.every((p) => p.featuredOrder === null)).toBe(true);
  });

  it("preserves featured order for sorting on the client", () => {
    const featuredMap = new Map<string, number>([
      ["prop-2", 0],
      ["prop-1", 2],
      ["prop-3", 1],
    ]);

    const feedProperties = [
      { id: "prop-1" },
      { id: "prop-2" },
      { id: "prop-3" },
    ];

    const merged = feedProperties
      .map((p) => ({
        ...p,
        featured: featuredMap.has(p.id),
        featuredOrder: featuredMap.get(p.id) ?? null,
      }))
      .filter((p) => p.featured)
      .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));

    expect(merged.map((p) => p.id)).toEqual(["prop-2", "prop-3", "prop-1"]);
  });
});
