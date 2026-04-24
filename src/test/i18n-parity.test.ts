import { describe, it, expect } from "vitest";
import { hu } from "@/i18n/hu";
import { en } from "@/i18n/en";

/**
 * Recursively extracts all keys from a nested object as dot-notation paths.
 * Array items are tracked by index.
 */
function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (Array.isArray(value)) {
      keys.push(fullKey);
      value.forEach((item, i) => {
        if (typeof item === "object" && item !== null) {
          keys.push(...getKeys(item as Record<string, unknown>, `${fullKey}[${i}]`));
        }
      });
    } else if (typeof value === "object" && value !== null) {
      keys.push(...getKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe("i18n key parity", () => {
  const huKeys = getKeys(hu as unknown as Record<string, unknown>);
  const enKeys = getKeys(en as unknown as Record<string, unknown>);

  it("hu.ts and en.ts have the same number of keys", () => {
    expect(huKeys.length).toBe(enKeys.length);
  });

  it("every hu.ts key exists in en.ts", () => {
    const enKeySet = new Set(enKeys);
    const missingInEn = huKeys.filter((k) => !enKeySet.has(k));
    expect(missingInEn).toEqual([]);
  });

  it("every en.ts key exists in hu.ts", () => {
    const huKeySet = new Set(huKeys);
    const missingInHu = enKeys.filter((k) => !huKeySet.has(k));
    expect(missingInHu).toEqual([]);
  });

  it("faq.items arrays have the same length", () => {
    expect(hu.faq.items.length).toBe(en.faq.items.length);
  });

  it("every faq item has both q and a fields in both languages", () => {
    for (let i = 0; i < hu.faq.items.length; i++) {
      expect(hu.faq.items[i]).toHaveProperty("q");
      expect(hu.faq.items[i]).toHaveProperty("a");
      expect(en.faq.items[i]).toHaveProperty("q");
      expect(en.faq.items[i]).toHaveProperty("a");
    }
  });

  it("no translation value is an empty string", () => {
    // Keys whose content comes from the CMS at runtime — empty fallbacks are intentional
    const cmsProvidedKeys = new Set(["hero.title", "hero.subtitle", "hero.cta"]);

    function findEmpty(obj: Record<string, unknown>, prefix = ""): string[] {
      const empties: string[] = [];
      for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        if (typeof value === "string" && value.trim() === "") {
          if (!cmsProvidedKeys.has(fullKey)) empties.push(fullKey);
        } else if (Array.isArray(value)) {
          value.forEach((item, i) => {
            if (typeof item === "object" && item !== null) {
              empties.push(...findEmpty(item as Record<string, unknown>, `${fullKey}[${i}]`));
            }
          });
        } else if (typeof value === "object" && value !== null) {
          empties.push(...findEmpty(value as Record<string, unknown>, fullKey));
        }
      }
      return empties;
    }

    expect(findEmpty(hu as unknown as Record<string, unknown>)).toEqual([]);
    expect(findEmpty(en as unknown as Record<string, unknown>)).toEqual([]);
  });
});
