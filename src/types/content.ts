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
 * Accepts content with only one language present (common for blocks
 * where English hasn't been set yet). Returns null only if the string
 * is not a valid JSON object with at least one language key.
 */
export function parseBilingual(content: string): BilingualContent | null {
  try {
    const parsed = JSON.parse(content);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed) &&
      (typeof parsed.hu === "string" || typeof parsed.en === "string")
    ) {
      return { hu: parsed.hu ?? "", en: parsed.en ?? "" };
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
 *
 * Includes a string-based fallback for malformed bilingual JSON where the
 * inner HTML values contain unescaped quotes that break JSON.parse.
 */
export function extractLang(content: string, lang: Lang): string {
  let result = content;
  // Loop to handle double-nested bilingual JSON
  for (let i = 0; i < 3 && (result.startsWith('{"hu":') || result.startsWith('{"en":')); i++) {
    try {
      const parsed = JSON.parse(result);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
          && ("hu" in parsed || "en" in parsed)) {
        const value = parsed[lang] ?? parsed.hu;
        if (typeof value === "string") { result = value; continue; }
        if (value !== undefined) return JSON.stringify(value);
      }
      break;
    } catch {
      const extracted = extractLangFallback(result, lang);
      if (extracted !== null) { result = extracted; continue; }
      break;
    }
  }
  return result;
}

/**
 * String-based extraction for bilingual JSON with malformed inner values.
 * Uses lastIndexOf to find the delimiter between language slots, avoiding
 * confusion from unescaped quotes inside HTML content.
 */
function extractLangFallback(content: string, lang: Lang): string | null {
  const otherLang = lang === "hu" ? "en" : "hu";
  const langPrefix = `{"${lang}":"`;
  const otherPrefix = `{"${otherLang}":"`;
  const langDelim = `","${lang}":"`;
  const otherDelim = `","${otherLang}":"`;

  if (content.startsWith(langPrefix)) {
    const valueStart = langPrefix.length;
    const delimIdx = content.lastIndexOf(otherDelim);
    if (delimIdx > valueStart) {
      return content.slice(valueStart, delimIdx);
    }
    if (content.endsWith('"}')) {
      return content.slice(valueStart, content.length - 2);
    }
  }

  if (content.startsWith(otherPrefix)) {
    const delimIdx = content.lastIndexOf(langDelim);
    if (delimIdx !== -1) {
      const valueStart = delimIdx + langDelim.length;
      if (content.endsWith('"}')) {
        return content.slice(valueStart, content.length - 2);
      }
    }
    if (lang !== "hu") {
      return extractLangFallback(content, "hu");
    }
  }

  return null;
}
