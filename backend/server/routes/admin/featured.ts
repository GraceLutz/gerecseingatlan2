import { Router } from "express";
import { z } from "zod";
import { eq, asc, and } from "drizzle-orm";
import { db } from "../../db/index";
import { featuredProperties } from "../../db/schema/featured";
import { activityLog } from "../../db/schema/users";
import { requireRole } from "../../middleware/auth";
import { fetchFeed } from "../../ingatlan-feed";

const MAX_FEATURED = 6;
const INGATLAN_XML_URL = process.env.INGATLAN_XML_URL;

const router = Router();

router.use(requireRole("admin", "editor"));

/** GET /api/admin/featured — list all featured properties */
router.get("/", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(featuredProperties)
      .where(eq(featuredProperties.isFeatured, true))
      .orderBy(asc(featuredProperties.featuredOrder));

    res.json({ featured: rows });
  } catch (error) {
    console.error("[admin/featured] List error:", error);
    res.status(500).json({ error: "Hiba történt a kiemelt ingatlanok lekérdezésekor." });
  }
});

const toggleSchema = z.object({
  propertyId: z.string().min(1).max(255),
});

/** POST /api/admin/featured — toggle a property's featured status */
router.post("/", async (req, res) => {
  try {
    const result = toggleSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0]?.message ?? "Érvénytelen adatok.",
      });
    }

    const { propertyId } = result.data;

    if (INGATLAN_XML_URL) {
      const feed = await fetchFeed(INGATLAN_XML_URL);
      const exists = feed.properties.some((p) => p.id === propertyId);
      if (!exists) {
        return res.status(404).json({ error: "Az ingatlan nem található a feedben." });
      }
    }

    const [existing] = await db
      .select()
      .from(featuredProperties)
      .where(eq(featuredProperties.propertyId, propertyId))
      .limit(1);

    if (existing?.isFeatured) {
      const [updated] = await db
        .update(featuredProperties)
        .set({ isFeatured: false })
        .where(eq(featuredProperties.id, existing.id))
        .returning();

      await db.insert(activityLog).values({
        userId: req.user?.id ?? null,
        action: "featured_removed",
        entityType: "property",
        entityId: propertyId,
      });

      return res.json({ featured: false, record: updated });
    }

    const currentCount = await db
      .select()
      .from(featuredProperties)
      .where(eq(featuredProperties.isFeatured, true));

    if (currentCount.length >= MAX_FEATURED) {
      return res.status(409).json({
        error: `Legfeljebb ${MAX_FEATURED} ingatlan jelölhető ki kiemeltként.`,
      });
    }

    const nextOrder = currentCount.length > 0
      ? Math.max(...currentCount.map((r) => r.featuredOrder ?? 0)) + 1
      : 0;

    let record;
    if (existing) {
      [record] = await db
        .update(featuredProperties)
        .set({ isFeatured: true, featuredOrder: nextOrder, featuredBy: req.user?.id ?? null })
        .where(eq(featuredProperties.id, existing.id))
        .returning();
    } else {
      [record] = await db
        .insert(featuredProperties)
        .values({
          propertyId,
          isFeatured: true,
          featuredOrder: nextOrder,
          featuredBy: req.user?.id ?? null,
        })
        .returning();
    }

    await db.insert(activityLog).values({
      userId: req.user?.id ?? null,
      action: "featured_added",
      entityType: "property",
      entityId: propertyId,
    });

    res.json({ featured: true, record });
  } catch (error) {
    console.error("[admin/featured] Toggle error:", error);
    res.status(500).json({ error: "Hiba történt a kiemelt státusz módosításakor." });
  }
});

const reorderSchema = z.object({
  propertyIds: z.array(z.string().min(1).max(255)).min(1).max(MAX_FEATURED),
});

/** PUT /api/admin/featured/reorder — set the display order of featured properties */
router.put("/reorder", async (req, res) => {
  try {
    const result = reorderSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0]?.message ?? "Érvénytelen adatok.",
      });
    }

    const { propertyIds } = result.data;

    const updates = propertyIds.map((pid, index) =>
      db
        .update(featuredProperties)
        .set({ featuredOrder: index })
        .where(
          and(
            eq(featuredProperties.propertyId, pid),
            eq(featuredProperties.isFeatured, true),
          ),
        ),
    );

    await Promise.all(updates);

    await db.insert(activityLog).values({
      userId: req.user?.id ?? null,
      action: "featured_reordered",
      entityType: "property",
      entityId: propertyIds.join(","),
    });

    const rows = await db
      .select()
      .from(featuredProperties)
      .where(eq(featuredProperties.isFeatured, true))
      .orderBy(asc(featuredProperties.featuredOrder));

    res.json({ featured: rows });
  } catch (error) {
    console.error("[admin/featured] Reorder error:", error);
    res.status(500).json({ error: "Hiba történt a sorrend módosításakor." });
  }
});

export default router;
