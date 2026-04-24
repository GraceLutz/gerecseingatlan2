import { Router } from "express";
import { eq, desc, sql, and, ilike, or, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index.js";
import {
  contentBlocks,
  contentBlockVersions,
} from "../../db/schema/content.js";
import { activityLog } from "../../db/schema/users.js";
import { requireRole } from "../../middleware/auth.js";

const router = Router();

const MAX_VERSIONS_PER_BLOCK = 10;

async function saveVersionAndPrune(
  blockId: string,
  content: string,
  contentType: string,
  editedBy: string
): Promise<void> {
  const latestVersion = await db
    .select({ version: contentBlockVersions.version })
    .from(contentBlockVersions)
    .where(eq(contentBlockVersions.blockId, blockId))
    .orderBy(desc(contentBlockVersions.version))
    .limit(1);

  const nextVersion = (latestVersion[0]?.version ?? 0) + 1;

  await db.insert(contentBlockVersions).values({
    blockId,
    content,
    contentType,
    version: nextVersion,
    editedBy,
  });

  const allVersions = await db
    .select({ id: contentBlockVersions.id })
    .from(contentBlockVersions)
    .where(eq(contentBlockVersions.blockId, blockId))
    .orderBy(desc(contentBlockVersions.version));

  if (allVersions.length > MAX_VERSIONS_PER_BLOCK) {
    const toDelete = allVersions
      .slice(MAX_VERSIONS_PER_BLOCK)
      .map((v) => v.id);
    await db
      .delete(contentBlockVersions)
      .where(inArray(contentBlockVersions.id, toDelete));
  }
}

const updateBlockSchema = z.object({
  content: z.string(),
  contentType: z.enum(["text", "html", "markdown", "json"]).optional(),
});

const createBlockSchema = z.object({
  pagePath: z
    .string()
    .min(1)
    .max(255)
    .regex(/^\/[a-zA-Z0-9/_-]*$/),
  blockKey: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9._[\]-]+$/),
  content: z.string(),
  contentType: z.enum(["text", "html", "markdown", "json"]).default("text"),
});

/**
 * GET /api/admin/content/pages
 * Returns distinct page paths with block counts for the sidebar.
 */
router.get("/pages", async (_req, res) => {
  try {
    const pages = await db
      .select({
        pagePath: contentBlocks.pagePath,
        blockCount: sql<number>`count(*)`,
      })
      .from(contentBlocks)
      .groupBy(contentBlocks.pagePath)
      .orderBy(contentBlocks.pagePath);

    res.json({ pages });
  } catch (error) {
    console.error("[api/admin/content] Pages list error:", error);
    res.status(500).json({ error: "Hiba történt az oldalak betöltésekor." });
  }
});

/**
 * GET /api/admin/content/page/:pagePath
 * Returns all blocks for a specific page path.
 * Use empty string or "/" for root page.
 */
router.get("/page/{*pagePath}", async (req, res) => {
  try {
    const paramValue = (req.params as Record<string, string | string[]>).pagePath;
    const raw = Array.isArray(paramValue) ? paramValue.join("/") : paramValue || "";
    const pagePath = "/" + raw.replace(/^\/+/, "").replace(/\/+$/, "");
    const normalizedPath = pagePath === "/" ? "/" : pagePath;

    const blocks = await db
      .select()
      .from(contentBlocks)
      .where(eq(contentBlocks.pagePath, normalizedPath))
      .orderBy(contentBlocks.blockKey);

    res.json({ blocks, pagePath: normalizedPath });
  } catch (error) {
    console.error("[api/admin/content] Page blocks error:", error);
    res.status(500).json({ error: "Hiba történt a blokkok betöltésekor." });
  }
});

/**
 * GET /api/admin/content
 * Lists all content blocks, grouped by page, with search.
 */
router.get("/", async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const page =
      typeof req.query.page === "string" ? parseInt(req.query.page, 10) : 1;
    const limit =
      typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 50;
    const offset = (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit));

    let whereClause;
    if (search) {
      // Escape LIKE special characters to prevent pattern injection
      const escapedSearch = search.replace(/[%_\\]/g, (ch) => `\\${ch}`);
      whereClause = or(
        ilike(contentBlocks.pagePath, `%${escapedSearch}%`),
        ilike(contentBlocks.blockKey, `%${escapedSearch}%`),
        ilike(contentBlocks.content, `%${escapedSearch}%`)
      );
    }

    const [blocks, countResult] = await Promise.all([
      db
        .select()
        .from(contentBlocks)
        .where(whereClause)
        .orderBy(contentBlocks.pagePath, contentBlocks.blockKey)
        .limit(Math.min(100, Math.max(1, limit)))
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(contentBlocks)
        .where(whereClause),
    ]);

    const grouped: Record<string, typeof blocks> = {};
    for (const block of blocks) {
      if (!grouped[block.pagePath]) {
        grouped[block.pagePath] = [];
      }
      grouped[block.pagePath].push(block);
    }

    res.json({
      blocks,
      grouped,
      total: Number(countResult[0]?.count ?? 0),
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)),
    });
  } catch (error) {
    console.error("[api/admin/content] List error:", error);
    res.status(500).json({ error: "Hiba történt a tartalmak betöltésekor." });
  }
});

/**
 * GET /api/admin/content/:id
 * Returns a single content block with its version history.
 */
router.get("/:id", async (req, res) => {
  try {
    const idSchema = z.string().uuid();
    const parsed = idSchema.safeParse(req.params.id);
    if (!parsed.success) {
      return res.status(400).json({ error: "Érvénytelen azonosító." });
    }

    const [block] = await db
      .select()
      .from(contentBlocks)
      .where(eq(contentBlocks.id, parsed.data))
      .limit(1);

    if (!block) {
      return res.status(404).json({ error: "Tartalom nem található." });
    }

    const versions = await db
      .select()
      .from(contentBlockVersions)
      .where(eq(contentBlockVersions.blockId, block.id))
      .orderBy(desc(contentBlockVersions.version))
      .limit(MAX_VERSIONS_PER_BLOCK);

    res.json({ block, versions });
  } catch (error) {
    console.error("[api/admin/content] Get error:", error);
    res.status(500).json({ error: "Hiba történt a tartalom betöltésekor." });
  }
});

/**
 * PATCH /api/admin/content/by-path
 * Updates a content block identified by pagePath + blockKey.
 * Used by the inline EditableText component.
 */
router.patch(
  "/by-path",
  requireRole("admin", "editor"),
  async (req, res) => {
    try {
      const schema = z.object({
        pagePath: z
          .string()
          .min(1)
          .max(255)
          .regex(/^\/[a-zA-Z0-9/_-]*$/),
        blockKey: z
          .string()
          .min(1)
          .max(255)
          .regex(/^[a-zA-Z0-9._[\]-]+$/),
        content: z.string(),
        contentType: z.enum(["text", "html", "markdown", "json"]).optional(),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Érvénytelen adatok.",
          details: parsed.error.flatten(),
        });
      }

      const { pagePath, blockKey, content, contentType } = parsed.data;

      const [existing] = await db
        .select()
        .from(contentBlocks)
        .where(
          and(
            eq(contentBlocks.pagePath, pagePath),
            eq(contentBlocks.blockKey, blockKey)
          )
        )
        .limit(1);

      if (!existing) {
        // Auto-create the block if it doesn't exist yet
        const [block] = await db
          .insert(contentBlocks)
          .values({
            pagePath,
            blockKey,
            content,
            contentType: contentType ?? "text",
            updatedBy: req.user!.id,
          })
          .returning();

        await db.insert(activityLog).values({
          userId: req.user!.id,
          action: "content_block_created",
          details: { pagePath, blockKey, source: "inline" },
        });

        return res.status(201).json({ block });
      }

      await saveVersionAndPrune(existing.id, existing.content, existing.contentType, req.user!.id);

      const updateData: Record<string, unknown> = {
        content,
        updatedBy: req.user!.id,
        updatedAt: new Date(),
      };
      if (contentType) {
        updateData.contentType = contentType;
      }

      const [updated] = await db
        .update(contentBlocks)
        .set(updateData)
        .where(eq(contentBlocks.id, existing.id))
        .returning();

      await db.insert(activityLog).values({
        userId: req.user!.id,
        action: "content_block_updated",
        details: { pagePath, blockKey, source: "inline" },
      });

      res.json({ block: updated });
    } catch (error) {
      console.error("[api/admin/content] By-path update error:", error);
      res
        .status(500)
        .json({ error: "Hiba történt a tartalom frissítésekor." });
    }
  }
);

/**
 * POST /api/admin/content
 * Creates a new content block. Requires editor or admin role.
 */
router.post("/", requireRole("admin", "editor"), async (req, res) => {
  try {
    const parsed = createBlockSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Érvénytelen adatok.",
        details: parsed.error.flatten(),
      });
    }

    const { pagePath, blockKey, content, contentType } = parsed.data;

    const existing = await db
      .select({ id: contentBlocks.id })
      .from(contentBlocks)
      .where(
        and(
          eq(contentBlocks.pagePath, pagePath),
          eq(contentBlocks.blockKey, blockKey)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Ez a tartalom blokk már létezik ezen az oldalon.",
      });
    }

    const [block] = await db
      .insert(contentBlocks)
      .values({
        pagePath,
        blockKey,
        content,
        contentType,
        updatedBy: req.user!.id,
      })
      .returning();

    await db.insert(activityLog).values({
      userId: req.user!.id,
      action: "content_block_created",
      details: { pagePath, blockKey },
    });

    res.status(201).json({ block });
  } catch (error) {
    console.error("[api/admin/content] Create error:", error);
    res.status(500).json({ error: "Hiba történt a tartalom létrehozásakor." });
  }
});

/**
 * PATCH /api/admin/content/:id
 * Updates a content block. Saves current version before overwriting.
 * Keeps max 10 versions per block.
 */
router.patch("/:id", requireRole("admin", "editor"), async (req, res) => {
  try {
    const idSchema = z.string().uuid();
    const idParsed = idSchema.safeParse(req.params.id);
    if (!idParsed.success) {
      return res.status(400).json({ error: "Érvénytelen azonosító." });
    }

    const bodyParsed = updateBlockSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({
        error: "Érvénytelen adatok.",
        details: bodyParsed.error.flatten(),
      });
    }

    const blockId = idParsed.data;

    const [existing] = await db
      .select()
      .from(contentBlocks)
      .where(eq(contentBlocks.id, blockId))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "Tartalom nem található." });
    }

    await saveVersionAndPrune(blockId, existing.content, existing.contentType, req.user!.id);

    // Update the block
    const updateData: Record<string, unknown> = {
      content: bodyParsed.data.content,
      updatedBy: req.user!.id,
      updatedAt: new Date(),
    };
    if (bodyParsed.data.contentType) {
      updateData.contentType = bodyParsed.data.contentType;
    }

    const [updated] = await db
      .update(contentBlocks)
      .set(updateData)
      .where(eq(contentBlocks.id, blockId))
      .returning();

    await db.insert(activityLog).values({
      userId: req.user!.id,
      action: "content_block_updated",
      details: { pagePath: existing.pagePath, blockKey: existing.blockKey },
    });

    res.json({ block: updated });
  } catch (error) {
    console.error("[api/admin/content] Update error:", error);
    res
      .status(500)
      .json({ error: "Hiba történt a tartalom frissítésekor." });
  }
});

/**
 * POST /api/admin/content/:id/rollback/:versionId
 * Rolls back a content block to a previous version.
 */
router.post(
  "/:id/rollback/:versionId",
  requireRole("admin", "editor"),
  async (req, res) => {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid(),
        versionId: z.string().uuid(),
      });
      const parsed = paramsSchema.safeParse(req.params);
      if (!parsed.success) {
        return res.status(400).json({ error: "Érvénytelen azonosítók." });
      }

      const { id: blockId, versionId } = parsed.data;

      const [block] = await db
        .select()
        .from(contentBlocks)
        .where(eq(contentBlocks.id, blockId))
        .limit(1);

      if (!block) {
        return res.status(404).json({ error: "Tartalom nem található." });
      }

      const [version] = await db
        .select()
        .from(contentBlockVersions)
        .where(
          and(
            eq(contentBlockVersions.id, versionId),
            eq(contentBlockVersions.blockId, blockId)
          )
        )
        .limit(1);

      if (!version) {
        return res.status(404).json({ error: "Verzió nem található." });
      }

      await saveVersionAndPrune(blockId, block.content, block.contentType, req.user!.id);

      const [updated] = await db
        .update(contentBlocks)
        .set({
          content: version.content,
          contentType: version.contentType,
          updatedBy: req.user!.id,
          updatedAt: new Date(),
        })
        .where(eq(contentBlocks.id, blockId))
        .returning();

      await db.insert(activityLog).values({
        userId: req.user!.id,
        action: "content_block_rollback",
        details: { pagePath: block.pagePath, blockKey: block.blockKey, rolledBackToVersion: version.version },
      });

      res.json({ block: updated });
    } catch (error) {
      console.error("[api/admin/content] Rollback error:", error);
      res
        .status(500)
        .json({ error: "Hiba történt a visszaállítás során." });
    }
  }
);

/**
 * DELETE /api/admin/content/:id
 * Deletes a content block and all its versions. Admin only.
 */
router.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    const idSchema = z.string().uuid();
    const parsed = idSchema.safeParse(req.params.id);
    if (!parsed.success) {
      return res.status(400).json({ error: "Érvénytelen azonosító." });
    }

    const [block] = await db
      .select()
      .from(contentBlocks)
      .where(eq(contentBlocks.id, parsed.data))
      .limit(1);

    if (!block) {
      return res.status(404).json({ error: "Tartalom nem található." });
    }

    await db
      .delete(contentBlocks)
      .where(eq(contentBlocks.id, parsed.data));

    await db.insert(activityLog).values({
      userId: req.user!.id,
      action: "content_block_deleted",
      details: { pagePath: block.pagePath, blockKey: block.blockKey },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("[api/admin/content] Delete error:", error);
    res.status(500).json({ error: "Hiba történt a tartalom törlésekor." });
  }
});

export default router;
