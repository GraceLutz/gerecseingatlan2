import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { contentBlocks } from "../db/schema/content.js";

const router = Router();

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

      if (block.contentType === "json") {
        try {
          const jsonContent = JSON.parse(block.content);
          const langValue = jsonContent[lang] ?? jsonContent["hu"] ?? block.content;
          if (typeof langValue === "string") {
            content = langValue;
            contentType = "text";
          } else {
            content = JSON.stringify(langValue);
            contentType = "json-array";
          }
        } catch {}
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
