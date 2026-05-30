import { db } from "../db/index";
import { calendarEvents } from "../db/schema/calendar";
import { staff } from "../db/schema/staff";
import { sendEmail } from "./email";
import { calendarReminderHtml, calendarReminderText } from "../templates/calendar_reminder";
import { and, gte, lte, isNull, eq } from "drizzle-orm";

const INTERVAL_MS = 5 * 60 * 1000;

async function sendReminders(): Promise<void> {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in90min = new Date(now.getTime() + 90 * 60 * 1000);

  try {
    const events24h = await db
      .select({
        id: calendarEvents.id,
        title: calendarEvents.title,
        startDatetime: calendarEvents.startDatetime,
        endDatetime: calendarEvents.endDatetime,
        location: calendarEvents.location,
        clientName: calendarEvents.clientName,
        staffId: calendarEvents.staffId,
      })
      .from(calendarEvents)
      .where(
        and(
          gte(calendarEvents.startDatetime, now),
          lte(calendarEvents.startDatetime, in24h),
          isNull(calendarEvents.reminder24hSentAt)
        )
      );

    for (const event of events24h) {
      const staffMember = event.staffId
        ? (await db.select({ name: staff.name, email: staff.email }).from(staff).where(eq(staff.id, event.staffId)).limit(1))[0]
        : null;

      if (!staffMember?.email) continue;

      const params = {
        eventTitle: event.title,
        startDatetime: event.startDatetime,
        endDatetime: event.endDatetime,
        location: event.location,
        staffName: staffMember.name,
        clientName: event.clientName,
        reminderType: "24h" as const,
      };

      await sendEmail({
        to: staffMember.email,
        subject: `Emlékeztető: ${event.title} — holnap`,
        html: calendarReminderHtml(params),
        text: calendarReminderText(params),
      });

      await db
        .update(calendarEvents)
        .set({ reminder24hSentAt: now })
        .where(eq(calendarEvents.id, event.id));

      console.log(`[reminders] 24h reminder sent for event ${event.id} to ${staffMember.email}`);
    }

    const events90min = await db
      .select({
        id: calendarEvents.id,
        title: calendarEvents.title,
        startDatetime: calendarEvents.startDatetime,
        endDatetime: calendarEvents.endDatetime,
        location: calendarEvents.location,
        clientName: calendarEvents.clientName,
        staffId: calendarEvents.staffId,
      })
      .from(calendarEvents)
      .where(
        and(
          gte(calendarEvents.startDatetime, now),
          lte(calendarEvents.startDatetime, in90min),
          isNull(calendarEvents.reminder90minSentAt)
        )
      );

    for (const event of events90min) {
      const staffMember = event.staffId
        ? (await db.select({ name: staff.name, email: staff.email }).from(staff).where(eq(staff.id, event.staffId)).limit(1))[0]
        : null;

      if (!staffMember?.email) continue;

      const params = {
        eventTitle: event.title,
        startDatetime: event.startDatetime,
        endDatetime: event.endDatetime,
        location: event.location,
        staffName: staffMember.name,
        clientName: event.clientName,
        reminderType: "90min" as const,
      };

      await sendEmail({
        to: staffMember.email,
        subject: `Emlékeztető: ${event.title} — 90 percen belül`,
        html: calendarReminderHtml(params),
        text: calendarReminderText(params),
      });

      await db
        .update(calendarEvents)
        .set({ reminder90minSentAt: now })
        .where(eq(calendarEvents.id, event.id));

      console.log(`[reminders] 90min reminder sent for event ${event.id} to ${staffMember.email}`);
    }
  } catch (error) {
    console.error("[reminders] Error processing reminders:", error instanceof Error ? error.message : error);
  }
}

export function startReminderScheduler(): void {
  console.log("[reminders] Starting calendar reminder scheduler (every 5 minutes)");
  setInterval(sendReminders, INTERVAL_MS);
  sendReminders().catch((err) => {
    console.error("[reminders] Initial reminder check failed:", err instanceof Error ? err.message : err);
  });
}
