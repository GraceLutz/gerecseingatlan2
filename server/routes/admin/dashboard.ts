import { Router } from "express";
import { eq, sql, gte, lte, and, count, desc } from "drizzle-orm";
import { db } from "../../db/index";
import { newsletterSubscribers } from "../../db/schema/newsletter";
import { calendarEvents } from "../../db/schema/calendar";
import { staff } from "../../db/schema/staff";
import { activityLog } from "../../db/schema/users";
import { fetchFeed } from "../../ingatlan-feed";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();

router.use(requireAuth);
router.use(requireRole("admin", "editor", "viewer"));

/** GET /api/admin/dashboard/stats */
router.get("/stats", async (_req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    let activeProperties = 0;
    const xmlUrl = process.env.INGATLAN_XML_URL;
    if (xmlUrl) {
      try {
        const feed = await fetchFeed(xmlUrl);
        activeProperties = feed.propertyCount;
      } catch {
        activeProperties = 0;
      }
    }

    const [
      [{ subscriberCount }],
      [{ todayEventsCount }],
      [{ activeStaffCount }],
    ] = await Promise.all([
      db
        .select({ subscriberCount: count() })
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.status, "confirmed")),
      db
        .select({ todayEventsCount: count() })
        .from(calendarEvents)
        .where(
          and(
            gte(calendarEvents.startDatetime, todayStart),
            lte(calendarEvents.startDatetime, todayEnd)
          )
        ),
      db
        .select({ activeStaffCount: count() })
        .from(staff)
        .where(eq(staff.active, true)),
    ]);

    res.json({
      activeProperties,
      subscriberCount,
      todayEventsCount,
      activeStaffCount,
    });
  } catch (error) {
    console.error("[admin/dashboard/stats] Error:", error);
    res.status(500).json({ error: "Hiba történt a statisztikák lekérdezésekor." });
  }
});

/** GET /api/admin/dashboard/activity */
router.get("/activity", async (_req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowEnd = new Date(todayStart.getTime() + 2 * 24 * 60 * 60 * 1000);

    const [recentSubscribers, upcomingEvents, recentEdits] = await Promise.all([
      db
        .select({
          id: newsletterSubscribers.id,
          email: newsletterSubscribers.email,
          name: newsletterSubscribers.name,
          status: newsletterSubscribers.status,
          subscribedAt: newsletterSubscribers.subscribedAt,
        })
        .from(newsletterSubscribers)
        .orderBy(desc(newsletterSubscribers.subscribedAt))
        .limit(5),
      db
        .select({
          id: calendarEvents.id,
          title: calendarEvents.title,
          startDatetime: calendarEvents.startDatetime,
          endDatetime: calendarEvents.endDatetime,
          eventType: calendarEvents.eventType,
          location: calendarEvents.location,
          color: calendarEvents.color,
        })
        .from(calendarEvents)
        .where(
          and(
            gte(calendarEvents.startDatetime, todayStart),
            lte(calendarEvents.startDatetime, tomorrowEnd)
          )
        )
        .orderBy(calendarEvents.startDatetime)
        .limit(10),
      db
        .select({
          id: activityLog.id,
          action: activityLog.action,
          entityType: activityLog.entityType,
          entityId: activityLog.entityId,
          details: activityLog.details,
          createdAt: activityLog.createdAt,
        })
        .from(activityLog)
        .where(sql`${activityLog.action} LIKE '%content%'`)
        .orderBy(desc(activityLog.createdAt))
        .limit(5),
    ]);

    res.json({
      recentSubscribers,
      upcomingEvents,
      recentEdits,
    });
  } catch (error) {
    console.error("[admin/dashboard/activity] Error:", error);
    res.status(500).json({ error: "Hiba történt az aktivitás lekérdezésekor." });
  }
});

export default router;
