import { describe, it, expect } from "vitest";
import { jsonArrayToHtml, normalizeContent } from "@/types/content";

describe("jsonArrayToHtml", () => {
  it("converts a JSON array of strings to HTML paragraphs", () => {
    expect(jsonArrayToHtml('["paragraph1","paragraph2"]')).toBe(
      "<p>paragraph1</p><p>paragraph2</p>"
    );
  });

  it("converts a single-element array", () => {
    expect(jsonArrayToHtml('["only one"]')).toBe("<p>only one</p>");
  });

  it("returns empty string for empty array", () => {
    expect(jsonArrayToHtml("[]")).toBe("");
  });

  it("returns null for non-array JSON", () => {
    expect(jsonArrayToHtml('{"hu":"text"}')).toBeNull();
  });

  it("returns null for plain strings", () => {
    expect(jsonArrayToHtml("hello world")).toBeNull();
  });

  it("returns null for non-JSON content", () => {
    expect(jsonArrayToHtml("<p>html content</p>")).toBeNull();
  });

  it("handles arrays with HTML content in elements", () => {
    expect(jsonArrayToHtml('["<strong>bold</strong>","normal"]')).toBe(
      "<p><strong>bold</strong></p><p>normal</p>"
    );
  });

  it("skips non-string elements in the array", () => {
    expect(jsonArrayToHtml("[1, 2, 3]")).toBeNull();
  });

  it("handles mixed string and non-string arrays", () => {
    expect(jsonArrayToHtml('["text", 42]')).toBeNull();
  });
});

describe("normalizeContent", () => {
  it("passes through plain text unchanged", () => {
    expect(normalizeContent("hello world", "hu")).toBe("hello world");
  });

  it("extracts language from bilingual JSON", () => {
    expect(normalizeContent('{"hu":"magyar","en":"english"}', "hu")).toBe(
      "magyar"
    );
    expect(normalizeContent('{"hu":"magyar","en":"english"}', "en")).toBe(
      "english"
    );
  });

  it("converts JSON array content to HTML paragraphs", () => {
    expect(normalizeContent('["p1","p2","p3"]', "hu")).toBe(
      "<p>p1</p><p>p2</p><p>p3</p>"
    );
  });

  it("handles bilingual JSON wrapping a JSON array", () => {
    expect(
      normalizeContent('{"hu":["bekezdés1","bekezdés2"],"en":["para1","para2"]}', "hu")
    ).toBe("<p>bekezdés1</p><p>bekezdés2</p>");
  });

  it("passes through HTML content unchanged", () => {
    expect(normalizeContent("<p>already html</p>", "hu")).toBe(
      "<p>already html</p>"
    );
  });

  it("returns raw content for invalid JSON", () => {
    expect(normalizeContent("{broken", "hu")).toBe("{broken");
  });
});
