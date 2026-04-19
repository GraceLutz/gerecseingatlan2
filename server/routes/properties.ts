import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import { fetchFeed, getFeedStatus } from "../ingatlan-feed";
import { db } from "../db/index";
import { featuredProperties } from "../db/schema/featured";

const INGATLAN_XML_URL = process.env.INGATLAN_XML_URL;

const router = Router();

/** GET /api/properties — returns parsed property listings from XML feed with featured state merged */
router.get("/", async (_req, res) => {
  if (!INGATLAN_XML_URL) {
    return res.status(503).json({
      error: "XML feed URL not configured",
      properties: [],
    });
  }

  try {
    const [result, featuredRows] = await Promise.all([
      fetchFeed(INGATLAN_XML_URL),
      db
        .select()
        .from(featuredProperties)
        .where(eq(featuredProperties.isFeatured, true))
        .orderBy(asc(featuredProperties.featuredOrder)),
    ]);

    const featuredMap = new Map(
      featuredRows.map((r) => [r.propertyId, r.featuredOrder ?? 0]),
    );

    const properties = result.properties.map((p) => ({
      ...p,
      featured: featuredMap.has(p.id),
      featuredOrder: featuredMap.get(p.id) ?? null,
    }));

    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    res.json({ ...result, properties });
  } catch (err) {
    console.error("[api/properties] Error:", err);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

/** GET /api/properties/:id — returns a single property by ID or slug */
router.get("/:id", async (req, res) => {
  if (!INGATLAN_XML_URL) {
    return res.status(503).json({ error: "XML feed URL not configured" });
  }

  try {
    const result = await fetchFeed(INGATLAN_XML_URL);
    const property = result.properties.find((p) => p.id === req.params.id || p.slug === req.params.id);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    res.json({ property, office: result.office });
  } catch (err) {
    console.error("[api/properties/:id] Error:", err);
    res.status(500).json({ error: "Failed to fetch property" });
  }
});

export default router;

/** Feed admin router — mount behind auth middleware at /api/admin */
const feedAdminRouter = Router();

/** POST /api/admin/feed-refresh — force refresh the feed cache */
feedAdminRouter.post("/feed-refresh", async (_req, res) => {
  if (!INGATLAN_XML_URL) {
    return res.status(503).json({ error: "XML feed URL not configured" });
  }

  try {
    const result = await fetchFeed(INGATLAN_XML_URL, { forceRefresh: true });
    res.json({
      success: true,
      propertyCount: result.propertyCount,
      errors: result.errors,
      fetchedAt: result.fetchedAt,
    });
  } catch (err) {
    console.error("[api/admin/feed-refresh] Error:", err);
    res.status(500).json({ error: "Failed to refresh feed" });
  }
});

/** GET /api/admin/feed-status — returns feed cache status */
feedAdminRouter.get("/feed-status", (_req, res) => {
  res.json(getFeedStatus());
});

export { feedAdminRouter };
