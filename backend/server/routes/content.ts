import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { contentBlocks } from "../db/schema/content.js";

const router = Router();

/**
 * String-based extraction for bilingual JSON with malformed inner values.
 * Handles content like {"hu":"<p>text with "unescaped" quotes</p>","en":""}
 * where JSON.parse fails due to unescaped quotes in HTML content.
 */
function extractBilingualFallback(content: string, lang: string): string | null {
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
    // Fall back to hu
    if (lang !== "hu") {
      return extractBilingualFallback(content, "hu");
    }
  }

  return null;
}

const pagePathSchema = z
  .string()
  .max(255)
  .regex(/^[a-zA-Z0-9/_-]*$/);

/**
 * GET /api/content/*pagePath
 * Returns all content blocks for a given page path.
 * Publicly accessible — used by EditableText on the frontend.
 * Supports ?lang=hu|en for bilingual content.
 *
 * BILINGUAL CONTENT CONTRACT:
 * DB stores contentType "json" with content like {"hu":"...", "en":"..."}.
 * This route extracts the requested language value before returning:
 *   - String values → contentType "text"
 *   - Array values (paragraphs, benefits) → contentType "json-array" (stringified)
 * The frontend's useContentArray hook relies on contentType "json-array"
 * to parse arrays. Breaking this contract causes blank service pages.
 */
router.get("/{*pagePath}", async (req, res) => {
  try {
    const paramValue = (req.params as Record<string, string | string[]>).pagePath;
    const raw = (Array.isArray(paramValue) ? paramValue.join("/") : paramValue || "").replace(/^\/+/, "");
    const parsed = pagePathSchema.safeParse(raw);
    if (!parsed.success) {
      return res.status(400).json({ error: "Érvénytelen oldal útvonal." });
    }

    const pagePath = parsed.data ? `/${parsed.data}` : "/";

    const blocks = await db
      .select({
        blockKey: contentBlocks.blockKey,
        content: contentBlocks.content,
        contentType: contentBlocks.contentType,
      })
      .from(contentBlocks)
      .where(eq(contentBlocks.pagePath, pagePath));

    const lang = req.query.lang === "en" ? "en" : "hu";

    const blockMap: Record<string, { content: string; contentType: string }> =
      {};
    for (const block of blocks) {
      let content = block.content;
      let contentType = block.contentType;

      // Extract bilingual JSON regardless of contentType — some blocks have
      // contentType "text" but content is actually bilingual JSON like {"hu":"...","en":"..."}
      // Loops to handle double-nested content (value is itself bilingual JSON)
      for (let i = 0; i < 3 && (content.startsWith('{"hu":') || content.startsWith('{"en":')); i++) {
        try {
          const jsonContent = JSON.parse(content);
          if (typeof jsonContent === "object" && jsonContent !== null && !Array.isArray(jsonContent)
              && ("hu" in jsonContent || "en" in jsonContent)) {
            const langValue = jsonContent[lang] ?? jsonContent["hu"] ?? content;
            if (typeof langValue === "string") {
              content = langValue;
              contentType = "text";
            } else {
              content = JSON.stringify(langValue);
              contentType = "json-array";
            }
          } else {
            break;
          }
        } catch {
          const extracted = extractBilingualFallback(content, lang);
          if (extracted !== null) {
            content = extracted;
            contentType = "text";
          }
          break;
        }
      }

      blockMap[block.blockKey] = { content, contentType };
    }

    res.setHeader(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300"
    );
    res.json({ blocks: blockMap });
  } catch (error) {
    console.error("[api/content] Error:", error);
    res.status(500).json({ error: "Hiba történt a tartalom betöltésekor." });
  }
});

export default router;
