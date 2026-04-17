import { Router } from "express";
import { z } from "zod";
import { eq, ilike, and, gte, lte, sql, inArray, count } from "drizzle-orm";
import { db } from "../../db/index";
import { newsletterSubscribers } from "../../db/schema/newsletter";
import { activityLog } from "../../db/schema/users";
import { requireAuth, requireRole, validateCsrf } from "../../middleware/auth";

const router = Router();

router.use(requireAuth);
router.use(requireRole("admin", "editor"));
router.use(validateCsrf);

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

export default router;
