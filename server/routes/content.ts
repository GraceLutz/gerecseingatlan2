import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { contentBlocks } from "../db/schema/content.js";

const router = Router();

const pagePathSchema = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z0-9/_-]+$/);

/**
 * GET /api/content/:pagePath
 * Returns all content blocks for a given page path.
 * Publicly accessible — used by EditableText on the frontend.
 */
router.get("/{*pagePath}", async (req, res) => {
  try {
    const parsed = pagePathSchema.safeParse(req.params.pagePath);
    if (!parsed.success) {
      return res.status(400).json({ error: "Érvénytelen oldal útvonal." });
    }

    const pagePath = `/${parsed.data.replace(/^\//, "")}`;

    const blocks = await db
      .select({
        blockKey: contentBlocks.blockKey,
        content: contentBlocks.content,
        contentType: contentBlocks.contentType,
      })
      .from(contentBlocks)
      .where(eq(contentBlocks.pagePath, pagePath));

    const blockMap: Record<string, { content: string; contentType: string }> =
      {};
    for (const block of blocks) {
      blockMap[block.blockKey] = {
        content: block.content,
        contentType: block.contentType,
      };
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
