import {
  escapeHtml,
  emailWrapper,
  emailHeader,
  emailDivider,
  emailTitle,
  emailDataSection,
  emailFooterDivider,
  emailFooter,
} from "./shared";

export interface CalendarReminderParams {
  eventTitle: string;
  startDatetime: Date;
  endDatetime: Date;
  location?: string | null;
  staffName: string;
  clientName?: string | null;
  reminderType: "24h" | "90min";
}

function formatHungarianDate(date: Date): string {
  const months = [
    "január", "február", "március", "április", "május", "június",
    "július", "augusztus", "szeptember", "október", "november", "december",
  ];
  const y = date.getFullYear();
  const m = months[date.getMonth()];
  const d = date.getDate();
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${y}. ${m} ${d}. ${h}:${min}`;
}

function reminderLabel(type: "24h" | "90min"): string {
  return type === "24h" ? "24 órás emlékeztető" : "90 perces emlékeztető";
}

export function calendarReminderHtml(params: CalendarReminderParams): string {
  const accentColor = "#E8A317";
  const safeTitle = escapeHtml(params.eventTitle);
  const startHu = formatHungarianDate(params.startDatetime);
  const endHu = formatHungarianDate(params.endDatetime);

  const rows = [
    { label: "Esemény", value: safeTitle },
    { label: "Kezdés", value: startHu },
    { label: "Befejezés", value: endHu },
    { label: "Munkatárs", value: escapeHtml(params.staffName) },
  ];

  if (params.location) {
    rows.push({ label: "Helyszín", value: escapeHtml(params.location) });
  }

  if (params.clientName) {
    rows.push({ label: "Ügyfél", value: escapeHtml(params.clientName) });
  }

  let inner = "";
  inner += emailHeader({ monogramSize: 28, monogramColor: "#C5A55A" });
  inner += emailDivider(accentColor, 3);
  inner += emailTitle(reminderLabel(params.reminderType), 22);
  inner += emailDataSection(rows, accentColor);
  inner += emailFooterDivider(accentColor);
  inner += emailFooter({
    timestamp: startHu,
    source: "Gerecse Ingatlan Naptár",
    accentColor,
  });

  return emailWrapper(inner);
}

export function calendarReminderText(params: CalendarReminderParams): string {
  const startHu = formatHungarianDate(params.startDatetime);
  const endHu = formatHungarianDate(params.endDatetime);

  let text = `${reminderLabel(params.reminderType)} — Gerecse Ingatlan\n\n`;
  text += `Esemény: ${params.eventTitle}\n`;
  text += `Kezdés: ${startHu}\n`;
  text += `Befejezés: ${endHu}\n`;
  text += `Munkatárs: ${params.staffName}\n`;

  if (params.location) {
    text += `Helyszín: ${params.location}\n`;
  }

  if (params.clientName) {
    text += `Ügyfél: ${params.clientName}\n`;
  }

  text += `\n---\nGerecse Ingatlan\nEz egy automatikus emlékeztető a gerecseingatlan.hu weboldalról.`;
  return text;
}
