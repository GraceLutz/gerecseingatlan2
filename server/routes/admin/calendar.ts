import { Router } from "express";
import { z } from "zod";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db } from "../../db/index";
import { calendarEvents } from "../../db/schema/calendar";
import { staff } from "../../db/schema/staff";
import { activityLog } from "../../db/schema/users";

const router = Router();

const EVENT_TYPES = [
  "ingatlan_megtekintes",
  "ugyfel_talalkozo",
  "belso_megbeszeles",
  "szabadsag",
  "egyeb",
] as const;

const createEventSchema = z.object({
  title: z.string().min(1, "A cím megadása kötelező.").max(255),
  description: z.string().max(5000).optional().nullable(),
  startDatetime: z.string().datetime({ offset: true }),
  endDatetime: z.string().datetime({ offset: true }),
  staffId: z.string().uuid().optional().nullable(),
  eventType: z.enum(EVENT_TYPES).default("egyeb"),
  location: z.string().max(500).optional().nullable(),
  propertyId: z.string().max(255).optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
}).refine(
  (data) => new Date(data.endDatetime) > new Date(data.startDatetime),
  { message: "A befejezés dátuma a kezdés után kell legyen.", path: ["endDatetime"] }
);

const updateEventSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional().nullable(),
  startDatetime: z.string().datetime({ offset: true }).optional(),
  endDatetime: z.string().datetime({ offset: true }).optional(),
  staffId: z.string().uuid().optional().nullable(),
  eventType: z.enum(EVENT_TYPES).optional(),
  location: z.string().max(500).optional().nullable(),
  propertyId: z.string().max(255).optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
});

const listQuerySchema = z.object({
  start: z.string().datetime({ offset: true }).optional(),
  end: z.string().datetime({ offset: true }).optional(),
  staffId: z.string().uuid().optional(),
  eventType: z.enum(EVENT_TYPES).optional(),
});

const idSchema = z.string().uuid("Érvénytelen azonosító.");

/** GET /api/admin/calendar — list events with filters */
router.get("/", async (req, res) => {
  try {
    const query = listQuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: "Érvénytelen lekérdezési paraméterek." });
    }

    const conditions = [];
    if (query.data.start) {
      conditions.push(gte(calendarEvents.endDatetime, new Date(query.data.start)));
    }
    if (query.data.end) {
      conditions.push(lte(calendarEvents.startDatetime, new Date(query.data.end)));
    }
    if (query.data.staffId) {
      conditions.push(eq(calendarEvents.staffId, query.data.staffId));
    }
    if (query.data.eventType) {
      conditions.push(eq(calendarEvents.eventType, query.data.eventType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const events = await db
      .select({
        id: calendarEvents.id,
        title: calendarEvents.title,
        description: calendarEvents.description,
        startDatetime: calendarEvents.startDatetime,
        endDatetime: calendarEvents.endDatetime,
        staffId: calendarEvents.staffId,
        staffName: staff.name,
        createdBy: calendarEvents.createdBy,
        eventType: calendarEvents.eventType,
        location: calendarEvents.location,
        propertyId: calendarEvents.propertyId,
        color: calendarEvents.color,
        createdAt: calendarEvents.createdAt,
        updatedAt: calendarEvents.updatedAt,
      })
      .from(calendarEvents)
      .leftJoin(staff, eq(calendarEvents.staffId, staff.id))
      .where(whereClause)
      .orderBy(sql`${calendarEvents.startDatetime} ASC`);

    res.json({ events });
  } catch (error) {
    console.error("[admin/calendar] List error:", error);
    res.status(500).json({ error: "Hiba történt az események lekérdezésekor." });
  }
});

/** GET /api/admin/calendar/:id — get single event */
router.get("/:id", async (req, res) => {
  try {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "Érvénytelen azonosító." });
    }

    const [event] = await db
      .select({
        id: calendarEvents.id,
        title: calendarEvents.title,
        description: calendarEvents.description,
        startDatetime: calendarEvents.startDatetime,
        endDatetime: calendarEvents.endDatetime,
        staffId: calendarEvents.staffId,
        staffName: staff.name,
        createdBy: calendarEvents.createdBy,
        eventType: calendarEvents.eventType,
        location: calendarEvents.location,
        propertyId: calendarEvents.propertyId,
        color: calendarEvents.color,
        createdAt: calendarEvents.createdAt,
        updatedAt: calendarEvents.updatedAt,
      })
      .from(calendarEvents)
      .leftJoin(staff, eq(calendarEvents.staffId, staff.id))
      .where(eq(calendarEvents.id, idResult.data))
      .limit(1);

    if (!event) {
      return res.status(404).json({ error: "Esemény nem található." });
    }

    res.json(event);
  } catch (error) {
    console.error("[admin/calendar] Get error:", error);
    res.status(500).json({ error: "Hiba történt az esemény lekérdezésekor." });
  }
});

/** POST /api/admin/calendar — create event */
router.post("/", async (req, res) => {
  try {
    const result = createEventSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0]?.message ?? "Érvénytelen adatok.",
      });
    }

    // Verify staff exists if staffId provided
    if (result.data.staffId) {
      const [staffMember] = await db
        .select({ id: staff.id })
        .from(staff)
        .where(eq(staff.id, result.data.staffId))
        .limit(1);

      if (!staffMember) {
        return res.status(400).json({ error: "A kiválasztott munkatárs nem található." });
      }
    }

    // createdBy comes from auth session (set by middleware)
    const createdBy = req.user?.id;
    if (!createdBy) {
      return res.status(401).json({ error: "Nincs bejelentkezve." });
    }

    const [event] = await db
      .insert(calendarEvents)
      .values({
        title: result.data.title,
        description: result.data.description ?? null,
        startDatetime: new Date(result.data.startDatetime),
        endDatetime: new Date(result.data.endDatetime),
        staffId: result.data.staffId ?? null,
        createdBy,
        eventType: result.data.eventType,
        location: result.data.location ?? null,
        propertyId: result.data.propertyId ?? null,
        color: result.data.color ?? null,
      })
      .returning();

    await db.insert(activityLog).values({
      userId: createdBy,
      action: "event_created",
      entityType: "calendar_event",
      entityId: event.id,
      details: { title: event.title, eventType: event.eventType },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("[admin/calendar] Create error:", error);
    res.status(500).json({ error: "Hiba történt az esemény létrehozásakor." });
  }
});

/** PATCH /api/admin/calendar/:id — update event (including drag-drop reschedule) */
router.patch("/:id", async (req, res) => {
  try {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "Érvénytelen azonosító." });
    }

    const result = updateEventSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.issues[0]?.message ?? "Érvénytelen adatok.",
      });
    }

    const updateData: Record<string, any> = {};
    if (result.data.title !== undefined) updateData.title = result.data.title;
    if (result.data.description !== undefined) updateData.description = result.data.description;
    if (result.data.startDatetime !== undefined) updateData.startDatetime = new Date(result.data.startDatetime);
    if (result.data.endDatetime !== undefined) updateData.endDatetime = new Date(result.data.endDatetime);
    if (result.data.staffId !== undefined) updateData.staffId = result.data.staffId;
    if (result.data.eventType !== undefined) updateData.eventType = result.data.eventType;
    if (result.data.location !== undefined) updateData.location = result.data.location;
    if (result.data.propertyId !== undefined) updateData.propertyId = result.data.propertyId;
    if (result.data.color !== undefined) updateData.color = result.data.color;

    // Validate date range if both provided
    if (updateData.startDatetime && updateData.endDatetime) {
      if (updateData.endDatetime <= updateData.startDatetime) {
        return res.status(400).json({ error: "A befejezés dátuma a kezdés után kell legyen." });
      }
    }

    const [updated] = await db
      .update(calendarEvents)
      .set(updateData)
      .where(eq(calendarEvents.id, idResult.data))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Esemény nem található." });
    }

    await db.insert(activityLog).values({
      userId: req.user?.id ?? null,
      action: "event_updated",
      entityType: "calendar_event",
      entityId: updated.id,
      details: { title: updated.title, changes: Object.keys(updateData) },
    });

    res.json(updated);
  } catch (error) {
    console.error("[admin/calendar] Update error:", error);
    res.status(500).json({ error: "Hiba történt az esemény módosításakor." });
  }
});

/** DELETE /api/admin/calendar/:id — delete event */
router.delete("/:id", async (req, res) => {
  try {
    const idResult = idSchema.safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({ error: "Érvénytelen azonosító." });
    }

    const [deleted] = await db
      .delete(calendarEvents)
      .where(eq(calendarEvents.id, idResult.data))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: "Esemény nem található." });
    }

    await db.insert(activityLog).values({
      userId: req.user?.id ?? null,
      action: "event_deleted",
      entityType: "calendar_event",
      entityId: deleted.id,
      details: { title: deleted.title },
    });

    res.json({
      success: true,
      message: "Esemény sikeresen törölve.",
    });
  } catch (error) {
    console.error("[admin/calendar] Delete error:", error);
    res.status(500).json({ error: "Hiba történt az esemény törlésekor." });
  }
});

export default router;
