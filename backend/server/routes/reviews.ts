import { Router } from "express";
import { fetchGoogleReviews } from "../services/google-reviews.js";

const router = Router();

/** GET /api/reviews — public endpoint returning cached Google reviews */
router.get("/", async (_req, res) => {
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!placeId) {
    res.json({ reviews: [], error: "not_configured" });
    return;
  }

  try {
    const result = await fetchGoogleReviews(placeId);
    res.json(result);
  } catch (err) {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "error",
        module: "reviews-route",
        event: "fetch_failed",
        error: err instanceof Error ? err.message : String(err),
      }),
    );
    res.status(500).json({
      reviews: [],
      error: "Hiba történt a vélemények betöltésekor.",
    });
  }
});

export default router;
