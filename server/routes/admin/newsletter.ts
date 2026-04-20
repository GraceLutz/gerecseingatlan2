import { Router } from "express";
import { z } from "zod";
import { eq, ilike, and, gte, lte, sql, inArray, count, desc } from "drizzle-orm";
import { db } from "../../db/index";
import { newsletterSubscribers, newsletterCampaigns } from "../../db/schema/newsletter";
import { activityLog } from "../../db/schema/users";
import { requireRole } from "../../middleware/auth";
import { sendEmail } from "../../services/email";
import { newsletterCampaignHtml, newsletterCampaignText } from "../../templates/newsletter_campaign";

const router = Router();

router.use(requireRole("admin", "editor"));

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().max(200).optional(),
  status: z.enum(["pending", "confirmed", "unsubscribed"]).optional(),
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
});

/** GET /api/admin/newsletter — list subscribers with pagination, search, filters */
router.get("/", async (req, res) => {
  try {
    const query = listQuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: "Érvénytelen lekérdezési paraméterek." });
    }

    const { page, limit, search, status, dateFrom, dateTo } = query.data;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (search) {
      const escaped = search.replace(/[%_\\]/g, (c) => `\\${c}`);
      conditions.push(
        sql`(${ilike(newsletterSubscribers.email, `%${escaped}%`)} OR ${ilike(newsletterSubscribers.name, `%${escaped}%`)})`
      );
    }
    if (status) {
      conditions.push(eq(newsletterSubscribers.status, status));
    }
    if (dateFrom) {
      conditions.push(gte(newsletterSubscribers.subscribedAt, new Date(dateFrom)));
    }
    if (dateTo) {
      conditions.push(lte(newsletterSubscribers.subscribedAt, new Date(dateTo)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [subscribers, [{ total }], [{ confirmed }]] = await Promise.all([
      db
        .select()
        .from(newsletterSubscribers)
        .where(whereClause)
        .orderBy(sql`${newsletterSubscribers.subscribedAt} DESC`)
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(newsletterSubscribers)
        .where(whereClause),
      db
        .select({ confirmed: count() })
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.status, "confirmed")),
    ]);

    res.json({
      subscribers,
      pagination: {
        page,
        limit,
        total: total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        total: total,
        confirmed: confirmed,
      },
    });
  } catch (error) {
    console.error("[admin/newsletter] List error:", error);
    res.status(500).json({ error: "Hiba történt a feliratkozók lekérdezésekor." });
  }
});

/** GET /api/admin/newsletter/export — CSV export */
router.get("/export", async (req, res) => {
  try {
    const subscribers = await db
      .select()
      .from(newsletterSubscribers)
      .orderBy(sql`${newsletterSubscribers.subscribedAt} DESC`);

    const csvHeader = "E-mail;Név;Státusz;Feliratkozás dátuma;Megerősítés dátuma;IP cím\n";
    const csvRows = subscribers
      .map((s) => {
        const escapeCsv = (val: string | null | undefined) => {
          if (!val) return "";
          if (val.includes(";") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        };
        return [
          escapeCsv(s.email),
          escapeCsv(s.name),
          escapeCsv(s.status),
          s.subscribedAt?.toISOString() ?? "",
          s.confirmedAt?.toISOString() ?? "",
          escapeCsv(s.ipAddress),
        ].join(";");
      })
      .join("\n");

    const bom = "\uFEFF";
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="hirlevel-feliratkozok-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.send(bom + csvHeader + csvRows);
  } catch (error) {
    console.error("[admin/newsletter] Export error:", error);
    res.status(500).json({ error: "Hiba történt az exportálás során." });
  }
});

/** DELETE /api/admin/newsletter/bulk — bulk delete by IDs (GDPR hard delete) */
router.delete("/bulk", async (req, res) => {
  try {
    const schema = z.object({
      ids: z.array(z.string().uuid()).min(1).max(500),
    });
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Érvénytelen azonosítók." });
    }

    const deleted = await db
      .delete(newsletterSubscribers)
      .where(inArray(newsletterSubscribers.id, result.data.ids))
      .returning({ id: newsletterSubscribers.id });

    await db.insert(activityLog).values({
      userId: req.user!.id,
      action: "newsletter_bulk_delete",
      entityType: "newsletter_subscriber",
      details: { deletedCount: deleted.length, ids: result.data.ids },
    });

    res.json({
      success: true,
      deletedCount: deleted.length,
      message: `${deleted.length} feliratkozó törölve.`,
    });
  } catch (error) {
    console.error("[admin/newsletter] Bulk delete error:", error);
    res.status(500).json({ error: "Hiba történt a törlés során." });
  }
});

/** DELETE /api/admin/newsletter/:id — single hard delete (GDPR) */
router.delete("/:id", async (req, res) => {
  try {
    const idSchema = z.string().uuid();
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "Érvénytelen azonosító." });
    }

    const [deleted] = await db
      .delete(newsletterSubscribers)
      .where(eq(newsletterSubscribers.id, idResult.data))
      .returning({ id: newsletterSubscribers.id, email: newsletterSubscribers.email });

    if (!deleted) {
      return res.status(404).json({ error: "Feliratkozó nem található." });
    }

    await db.insert(activityLog).values({
      userId: req.user!.id,
      action: "newsletter_delete",
      entityType: "newsletter_subscriber",
      entityId: deleted.id,
      details: { email: deleted.email },
    });

    res.json({
      success: true,
      message: "Feliratkozó véglegesen törölve (GDPR).",
    });
  } catch (error) {
    console.error("[admin/newsletter] Delete error:", error);
    res.status(500).json({ error: "Hiba történt a törlés során." });
  }
});

/* ========================= CAMPAIGNS ========================= */

const campaignSchema = z.object({
  subject: z.string().min(1).max(500),
  preheader: z.string().max(255).optional(),
  body: z.string().min(1).max(50000),
});

/** GET /api/admin/newsletter/campaigns — list campaigns */
router.get("/campaigns", async (req, res) => {
  try {
    const campaigns = await db
      .select()
      .from(newsletterCampaigns)
      .orderBy(desc(newsletterCampaigns.createdAt));

    res.json({ campaigns });
  } catch (error) {
    console.error("[admin/newsletter] Campaigns list error:", error);
    res.status(500).json({ error: "Hiba történt a kampányok lekérdezésekor." });
  }
});

/** POST /api/admin/newsletter/campaigns — create a campaign */
router.post("/campaigns", async (req, res) => {
  try {
    const result = campaignSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Érvénytelen kampány adatok.", details: result.error.flatten() });
    }

    const [campaign] = await db
      .insert(newsletterCampaigns)
      .values({
        subject: result.data.subject,
        preheader: result.data.preheader || null,
        body: result.data.body,
      })
      .returning();

    res.status(201).json({ campaign });
  } catch (error) {
    console.error("[admin/newsletter] Campaign create error:", error);
    res.status(500).json({ error: "Hiba történt a kampány létrehozásakor." });
  }
});

/** POST /api/admin/newsletter/campaigns/:id/test-send — send test to logged-in user */
router.post("/campaigns/:id/test-send", async (req, res) => {
  try {
    const idResult = z.string().uuid().safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "Érvénytelen kampány azonosító." });
    }

    const [campaign] = await db
      .select()
      .from(newsletterCampaigns)
      .where(eq(newsletterCampaigns.id, idResult.data));

    if (!campaign) {
      return res.status(404).json({ error: "Kampány nem található." });
    }

    const userEmail = req.user!.email;
    const baseUrl = process.env.BASE_URL || "https://gerecseingatlan.hu";
    const unsubscribeUrl = `${baseUrl}/leiratkozas?email=${encodeURIComponent(userEmail)}`;

    await sendEmail({
      to: userEmail,
      subject: `[TESZT] ${campaign.subject}`,
      html: newsletterCampaignHtml({
        subject: campaign.subject,
        preheader: campaign.preheader || undefined,
        body: campaign.body,
        unsubscribeUrl,
      }),
      text: newsletterCampaignText({
        subject: campaign.subject,
        preheader: campaign.preheader || undefined,
        body: campaign.body,
        unsubscribeUrl,
      }),
    });

    res.json({ success: true, message: `Teszt levél elküldve: ${userEmail}` });
  } catch (error) {
    console.error("[admin/newsletter] Test send error:", error);
    res.status(500).json({ error: "Hiba történt a teszt levél küldésekor." });
  }
});

/** POST /api/admin/newsletter/campaigns/:id/send — send to all confirmed subscribers */
router.post("/campaigns/:id/send", async (req, res) => {
  try {
    const idResult = z.string().uuid().safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "Érvénytelen kampány azonosító." });
    }

    const [campaign] = await db
      .select()
      .from(newsletterCampaigns)
      .where(eq(newsletterCampaigns.id, idResult.data));

    if (!campaign) {
      return res.status(404).json({ error: "Kampány nem található." });
    }

    if (campaign.status === "sent") {
      return res.status(409).json({ error: "Ez a kampány már el lett küldve." });
    }

    const subscribers = await db
      .select({ email: newsletterSubscribers.email })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, "confirmed"));

    if (subscribers.length === 0) {
      return res.status(400).json({ error: "Nincs megerősített feliratkozó." });
    }

    const baseUrl = process.env.BASE_URL || "https://gerecseingatlan.hu";
    let sentCount = 0;

    for (const sub of subscribers) {
      try {
        const unsubscribeUrl = `${baseUrl}/leiratkozas?email=${encodeURIComponent(sub.email)}`;
        await sendEmail({
          to: sub.email,
          subject: campaign.subject,
          html: newsletterCampaignHtml({
            subject: campaign.subject,
            preheader: campaign.preheader || undefined,
            body: campaign.body,
            unsubscribeUrl,
          }),
          text: newsletterCampaignText({
            subject: campaign.subject,
            preheader: campaign.preheader || undefined,
            body: campaign.body,
            unsubscribeUrl,
          }),
        });
        sentCount++;
      } catch (err) {
        console.error(`[admin/newsletter] Failed to send to ${sub.email}:`, err);
      }
    }

    await db
      .update(newsletterCampaigns)
      .set({
        status: "sent",
        sentAt: new Date(),
        sentBy: req.user!.id,
        recipientCount: sentCount,
      })
      .where(eq(newsletterCampaigns.id, campaign.id));

    await db.insert(activityLog).values({
      userId: req.user!.id,
      action: "newsletter_campaign_sent",
      entityType: "newsletter_campaign",
      entityId: campaign.id,
      details: { subject: campaign.subject, recipientCount: sentCount },
    });

    res.json({
      success: true,
      message: `Kampány elküldve ${sentCount} címzettnek.`,
      recipientCount: sentCount,
    });
  } catch (error) {
    console.error("[admin/newsletter] Campaign send error:", error);
    res.status(500).json({ error: "Hiba történt a kampány küldésekor." });
  }
});

/** GET /api/admin/newsletter/campaigns/recipient-count — get count of confirmed subscribers */
router.get("/campaigns/recipient-count", async (req, res) => {
  try {
    const [{ total }] = await db
      .select({ total: count() })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, "confirmed"));

    res.json({ count: total });
  } catch (error) {
    console.error("[admin/newsletter] Recipient count error:", error);
    res.status(500).json({ error: "Hiba történt." });
  }
});

export default router;
