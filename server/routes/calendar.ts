import { Router } from "express";
import { z } from "zod";
import { eq, gte } from "drizzle-orm";
import { db } from "../db/index";
import { calendarEvents } from "../db/schema/calendar";
import { staff } from "../db/schema/staff";

const router = Router();

const EVENT_TYPE_LABELS: Record<string, string> = {
  ingatlan_megtekintes: "Ingatlan megtekintés",
  ugyfel_talalkozo: "Ügyfél találkozó",
  belso_megbeszeles: "Belső megbeszélés",
  szabadsag: "Szabadság",
  egyeb: "Egyéb",
};

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatIcsDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

/**
 * GET /api/calendar/ics/:staffId
 * Generates an .ics (iCalendar) feed for a specific staff member's events.
 * Public endpoint — used for Google Calendar / iOS calendar subscription.
 */
router.get("/ics/:staffId", async (req, res) => {
  try {
    const staffIdSchema = z.string().uuid();
    const result = staffIdSchema.safeParse(req.params.staffId);
    if (!result.success) {
      return res.status(400).json({ error: "Érvénytelen munkatárs azonosító." });
    }

    const [staffMember] = await db
      .select({ id: staff.id, name: staff.name })
      .from(staff)
      .where(eq(staff.id, result.data))
      .limit(1);

    if (!staffMember) {
      return res.status(404).json({ error: "Munkatárs nem található." });
    }

    // Fetch events from 90 days ago onwards
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    const events = await db
      .select()
      .from(calendarEvents)
      .where(
        eq(calendarEvents.staffId, result.data)
      )
      .orderBy(calendarEvents.startDatetime);

    const now = formatIcsDate(new Date());
    const calName = escapeIcsText(`Gerecse Ingatlan – ${staffMember.name}`);

    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Gerecse Ingatlan//Naptár//HU",
      `X-WR-CALNAME:${calName}`,
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    for (const event of events) {
      const typeLabel = EVENT_TYPE_LABELS[event.eventType] ?? event.eventType;
      const description = [
        typeLabel,
        event.description ? event.description : "",
        event.location ? `Helyszín: ${event.location}` : "",
      ]
        .filter(Boolean)
        .join("\\n");

      icsLines.push(
        "BEGIN:VEVENT",
        `UID:${event.id}@gerecseingatlan.hu`,
        `DTSTAMP:${now}`,
        `DTSTART:${formatIcsDate(event.startDatetime)}`,
        `DTEND:${formatIcsDate(event.endDatetime)}`,
        `SUMMARY:${escapeIcsText(event.title)}`,
        `DESCRIPTION:${escapeIcsText(description)}`,
      );

      if (event.location) {
        icsLines.push(`LOCATION:${escapeIcsText(event.location)}`);
      }

      icsLines.push("END:VEVENT");
    }

    icsLines.push("END:VCALENDAR");

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="gerecse-ingatlan-${staffMember.name.toLowerCase().replace(/\s+/g, "-")}.ics"`
    );
    res.send(icsLines.join("\r\n"));
  } catch (error) {
    console.error("[calendar/ics] Error:", error);
    res.status(500).json({ error: "Hiba történt a naptár létrehozásakor." });
  }
});

export default router;
