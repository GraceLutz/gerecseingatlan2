import { Router } from "express";
import { z } from "zod";
import { eq, sql, desc, gte, lte, and, count } from "drizzle-orm";
import { db } from "../../db/index.js";
import { apiUsageLog, chatSessions, chatMessages, aiLeads } from "../../db/schema/agent.js";
import { requireRole } from "../../middleware/auth.js";

const router = Router();

router.use(requireRole("admin"));

const BUDGET_EUR = Number(process.env.AGENT_MONTHLY_BUDGET_EUR) || 50;

/** GET /api/admin/agent/stats */
router.get("/stats", async (_req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [spendResult] = await db
      .select({
        total: sql<string>`coalesce(sum(${apiUsageLog.estimatedCostEur}), 0)`,
        gemini: sql<string>`coalesce(sum(case when ${apiUsageLog.service} = 'gemini' then ${apiUsageLog.estimatedCostEur} else 0 end), 0)`,
        googleMaps: sql<string>`coalesce(sum(case when ${apiUsageLog.service} = 'google_maps' then ${apiUsageLog.estimatedCostEur} else 0 end), 0)`,
      })
      .from(apiUsageLog)
      .where(gte(apiUsageLog.createdAt, monthStart));

    const [dailyResult] = await db
      .select({ count: count() })
      .from(chatMessages)
      .where(
        and(
          gte(chatMessages.createdAt, todayStart),
          eq(chatMessages.role, "user"),
        ),
      );

    const topProperties = await db
      .select({
        propertyId: apiUsageLog.propertyId,
        count: count(),
      })
      .from(apiUsageLog)
      .where(
        and(
          gte(apiUsageLog.createdAt, monthStart),
          sql`${apiUsageLog.propertyId} is not null`,
        ),
      )
      .groupBy(apiUsageLog.propertyId)
      .orderBy(desc(count()))
      .limit(10);

    const topPlaceTypes = await db
      .select({
        endpoint: apiUsageLog.endpoint,
        count: count(),
      })
      .from(apiUsageLog)
      .where(
        and(
          gte(apiUsageLog.createdAt, monthStart),
          eq(apiUsageLog.service, "google_maps"),
        ),
      )
      .groupBy(apiUsageLog.endpoint)
      .orderBy(desc(count()))
      .limit(10);

    const totalSpend = parseFloat(spendResult?.total ?? "0");

    res.json({
      budgetEur: BUDGET_EUR,
      currentMonthSpend: {
        total: totalSpend,
        byService: {
          gemini: parseFloat(spendResult?.gemini ?? "0"),
          google_maps: parseFloat(spendResult?.googleMaps ?? "0"),
        },
      },
      budgetUsedPercent: BUDGET_EUR > 0 ? Math.round((totalSpend / BUDGET_EUR) * 100) : 0,
      dailyRequestCount: dailyResult?.count ?? 0,
      topQueriedProperties: topProperties.map((r) => ({
        propertyId: r.propertyId,
        count: r.count,
      })),
      topQueriedPlaceTypes: topPlaceTypes.map((r) => ({
        type: r.endpoint,
        count: r.count,
      })),
    });
  } catch (error) {
    console.error("[admin/agent] Stats error:", error);
    res.status(500).json({ error: "Hiba a statisztikák lekérdezésekor." });
  }
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** GET /api/admin/agent/sessions */
router.get("/sessions", async (req, res) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const offset = (page - 1) * limit;

    const [totalResult] = await db
      .select({ count: count() })
      .from(chatSessions);

    const sessions = await db
      .select()
      .from(chatSessions)
      .orderBy(desc(chatSessions.lastMessageAt))
      .limit(limit)
      .offset(offset);

    res.json({
      sessions,
      pagination: {
        page,
        limit,
        total: totalResult?.count ?? 0,
        totalPages: Math.ceil((totalResult?.count ?? 0) / limit),
      },
    });
  } catch (error) {
    console.error("[admin/agent] Sessions error:", error);
    res.status(500).json({ error: "Hiba a munkamenetek lekérdezésekor." });
  }
});

const idSchema = z.string().uuid();

/** DELETE /api/admin/agent/sessions/:id */
router.delete("/sessions/:id", async (req, res) => {
  try {
    const id = idSchema.parse(req.params.id);

    const [deleted] = await db
      .delete(chatSessions)
      .where(eq(chatSessions.id, id))
      .returning({ id: chatSessions.id });

    if (!deleted) {
      return res.status(404).json({ error: "Munkamenet nem található." });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("[admin/agent] Delete session error:", error);
    res.status(500).json({ error: "Hiba a munkamenet törlésekor." });
  }
});

const leadsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["uj", "felhivva", "nem_elerheto", "lezart"]).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

/** GET /api/admin/agent/leads */
router.get("/leads", async (req, res) => {
  try {
    const { page, limit, status, dateFrom, dateTo } = leadsQuerySchema.parse(req.query);
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status) conditions.push(eq(aiLeads.status, status));
    if (dateFrom) conditions.push(gte(aiLeads.createdAt, dateFrom));
    if (dateTo) conditions.push(lte(aiLeads.createdAt, dateTo));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(aiLeads)
      .where(whereClause);

    const leads = await db
      .select()
      .from(aiLeads)
      .where(whereClause)
      .orderBy(desc(aiLeads.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      leads,
      pagination: {
        page,
        limit,
        total: totalResult?.count ?? 0,
        totalPages: Math.ceil((totalResult?.count ?? 0) / limit),
      },
    });
  } catch (error) {
    console.error("[admin/agent] Leads error:", error);
    res.status(500).json({ error: "Hiba az érdeklődők lekérdezésekor." });
  }
});

const leadStatusUpdateSchema = z.object({
  status: z.enum(["felhivva", "nem_elerheto", "lezart"]),
});

/** PATCH /api/admin/agent/leads/:id */
router.patch("/leads/:id", async (req, res) => {
  try {
    const id = idSchema.parse(req.params.id);
    const { status } = leadStatusUpdateSchema.parse(req.body);

    const now = new Date();
    const updateData: Record<string, unknown> = { status };

    if (status === "felhivva" || status === "nem_elerheto") {
      updateData.calledAt = now;
    }
    if (status === "lezart") {
      updateData.closedAt = now;
    }

    const [updated] = await db
      .update(aiLeads)
      .set(updateData)
      .where(eq(aiLeads.id, id))
      .returning({ id: aiLeads.id });

    if (!updated) {
      return res.status(404).json({ error: "Érdeklődő nem található." });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("[admin/agent] Update lead error:", error);
    res.status(500).json({ error: "Hiba az érdeklődő frissítésekor." });
  }
});

export default router;
