/**
 * Canonical content model types for the CMS editor.
 *
 * All content blocks use bilingual JSON as the storage format in the DB:
 *   contentType "json", content: '{"hu":"...","en":"..."}'
 *
 * The public API extracts the requested language before returning to the
 * frontend, so components see plain strings or json-array values.
 */

/** Valid content types stored in the DB content_type column. */
export type StoredContentType = "text" | "html" | "markdown" | "json";

/** Content types returned by the public API after language extraction. */
export type ResolvedContentType = "text" | "html" | "markdown" | "json-array";

/** Supported UI languages. */
export type Lang = "hu" | "en";

/** Bilingual content wrapper — the canonical storage format for all text blocks. */
export interface BilingualContent {
  hu: string;
  en: string;
}

/** Content block as stored in the DB (content_blocks table). */
export interface ContentBlockRecord {
  id: string;
  pagePath: string;
  blockKey: string;
  content: string;
  contentType: StoredContentType;
  updatedAt: string;
  updatedBy: string | null;
  createdAt: string;
}

/** Content block as returned by the public API (language-extracted). */
export interface ContentBlock {
  content: string;
  contentType: ResolvedContentType;
}

/**
 * Parse a bilingual JSON string into a BilingualContent object.
 * Returns null if the string is not valid bilingual JSON.
 */
export function parseBilingual(content: string): BilingualContent | null {
  try {
    const parsed = JSON.parse(content);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed) &&
      typeof parsed.hu === "string" &&
      typeof parsed.en === "string"
    ) {
      return { hu: parsed.hu, en: parsed.en };
    }
    return null;
  } catch {
    return null;
  }
}

/** Create a bilingual JSON string from hu and en values. */
export function createBilingual(hu: string, en: string): string {
  return JSON.stringify({ hu, en });
}

/**
 * Extract a single language's value from bilingual JSON content.
 * Falls back to Hungarian, then returns the raw content if parsing fails.
 */
export function extractLang(content: string, lang: Lang): string {
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      const value = parsed[lang] ?? parsed.hu;
      if (typeof value === "string") return value;
      if (value !== undefined) return JSON.stringify(value);
    }
  } catch {
    // Not JSON — return raw content
  }
  return content;
}
