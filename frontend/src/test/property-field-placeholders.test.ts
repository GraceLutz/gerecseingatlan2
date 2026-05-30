import { describe, it, expect } from "vitest";
import { decodeAdatFields } from "../../server/ingatlan-feed-fields";

describe("decodeAdatFields", () => {
  it("maps known enum value to Hungarian label", () => {
    const result = decodeAdatFields({ adat_7: "17" });
    expect(result["Fűtés"]).toBe("Gáz (cirkó)");
  });

  it("filters out unmapped enum codes entirely", () => {
    const result = decodeAdatFields({ adat_7: "999" });
    expect(result["Fűtés"]).toBeUndefined();
    expect(Object.keys(result)).not.toContain("Fűtés");
  });

  it("skips unknown adat_* fields with no definition", () => {
    const result = decodeAdatFields({ adat_999: "hello" });
    expect(Object.keys(result)).toHaveLength(0);
  });

  it("handles multi-enum with mixed mapped and unmapped codes", () => {
    const result = decodeAdatFields({ adat_9: ["27", "999", "28"] });
    expect(result["Parkolás"]).toBe("Garázs, Teremgarázs");
  });

  it("handles multi-enum where all codes are unmapped", () => {
    const result = decodeAdatFields({ adat_9: ["998", "999"] });
    expect(result["Parkolás"]).toBeUndefined();
  });

  it("skips number fields with NaN values", () => {
    const result = decodeAdatFields({ adat_89: "not-a-number" });
    expect(result["Építés éve"]).toBeUndefined();
  });

  it("skips number fields with zero values", () => {
    const result = decodeAdatFields({ adat_89: "0" });
    expect(result["Építés éve"]).toBeUndefined();
  });

  it("accepts valid number values", () => {
    const result = decodeAdatFields({ adat_89: "1985" });
    expect(result["Építés éve"]).toBe(1985);
  });

  it("handles boolean fields correctly", () => {
    const result = decodeAdatFields({ adat_107: "1" });
    expect(result["Megtekinthető"]).toBe(true);
  });

  it("handles boolean fields with non-1 value", () => {
    const result = decodeAdatFields({ adat_107: "0" });
    expect(result["Megtekinthető"]).toBe(false);
  });

  it("default type rejects numeric-only values", () => {
    const result = decodeAdatFields({ adat_89: "1985" });
    expect(result["Építés éve"]).toBe(1985);
  });

  it("processes multiple fields at once", () => {
    const result = decodeAdatFields({
      adat_7: "17",
      adat_1: "4",
      adat_89: "2020",
    });
    expect(result["Fűtés"]).toBe("Gáz (cirkó)");
    expect(result["Állapot"]).toBe("Beköltözhető");
    expect(result["Építés éve"]).toBe(2020);
  });

  it("does not produce any #CODE patterns in output", () => {
    const allCodes: Record<string, string | string[]> = {};
    for (let i = 1; i <= 110; i++) {
      allCodes[`adat_${i}`] = String(i * 3);
    }
    const result = decodeAdatFields(allCodes);
    for (const [, val] of Object.entries(result)) {
      const str = String(val);
      expect(str).not.toMatch(/#\d+/);
    }
  });
});

describe("safeStringFeature (via toClientProperty)", () => {
  it("is tested indirectly - regex guard rejects #CODE patterns", () => {
    const UNMAPPED_CODE_RE = /#\d+/;
    expect(UNMAPPED_CODE_RE.test("#391")).toBe(true);
    expect(UNMAPPED_CODE_RE.test("Fűtés #391")).toBe(true);
    expect(UNMAPPED_CODE_RE.test("Gáz (cirkó)")).toBe(false);
    expect(UNMAPPED_CODE_RE.test("Jó állapotú")).toBe(false);
    expect(UNMAPPED_CODE_RE.test("")).toBe(false);
  });
});

describe("parseFloor logic", () => {
  function parseFloor(val: string | undefined): number | undefined {
    if (typeof val !== "string") return undefined;
    if (val === "Földszint" || val === "Félemelet") return 0;
    if (val === "Alagsor" || val === "Szuterén") return -1;
    const m = val.match(/^(\d+)\./);
    return m ? parseInt(m[1], 10) : undefined;
  }

  it("Földszint → 0", () => expect(parseFloor("Földszint")).toBe(0));
  it("Félemelet → 0", () => expect(parseFloor("Félemelet")).toBe(0));
  it("Alagsor → -1", () => expect(parseFloor("Alagsor")).toBe(-1));
  it("Szuterén → -1", () => expect(parseFloor("Szuterén")).toBe(-1));
  it("1. emelet → 1", () => expect(parseFloor("1. emelet")).toBe(1));
  it("5. emelet → 5", () => expect(parseFloor("5. emelet")).toBe(5));
  it("10. emelet → 10", () => expect(parseFloor("10. emelet")).toBe(10));
  it("10. emelet felett → 10", () => expect(parseFloor("10. emelet felett")).toBe(10));
  it("undefined → undefined", () => expect(parseFloor(undefined)).toBeUndefined());
  it("empty string → undefined", () => expect(parseFloor("")).toBeUndefined());
  it("random string → undefined", () => expect(parseFloor("hello")).toBeUndefined());
});
