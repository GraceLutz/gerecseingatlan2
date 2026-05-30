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

export interface CalendarInviteParams {
  eventTitle: string;
  startDatetime: Date;
  endDatetime: Date;
  location?: string | null;
  description?: string | null;
  organizerName: string;
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

function formatEnglishDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function generateIcsContent(params: CalendarInviteParams): string {
  const formatIcsDate = (d: Date): string =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@gerecseingatlan.hu`;
  const now = formatIcsDate(new Date());

  let ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Gerecse Ingatlan//Calendar//HU\r\nMETHOD:REQUEST\r\nBEGIN:VEVENT\r\nUID:${uid}\r\nDTSTAMP:${now}\r\nDTSTART:${formatIcsDate(params.startDatetime)}\r\nDTEND:${formatIcsDate(params.endDatetime)}\r\nSUMMARY:${escapeIcsText(params.eventTitle)}\r\nORGANIZER;CN=${escapeIcsText(params.organizerName)}:mailto:info@gerecseingatlan.hu\r\n`;

  if (params.location) {
    ics += `LOCATION:${escapeIcsText(params.location)}\r\n`;
  }
  if (params.description) {
    ics += `DESCRIPTION:${escapeIcsText(params.description)}\r\n`;
  }

  ics += `END:VEVENT\r\nEND:VCALENDAR\r\n`;
  return ics;
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function calendarInviteHtml(params: CalendarInviteParams): string {
  const accentColor = "#3B82F6";
  const safeTitle = escapeHtml(params.eventTitle);
  const startHu = formatHungarianDate(params.startDatetime);
  const endHu = formatHungarianDate(params.endDatetime);

  const rows = [
    { label: "Esemény", value: safeTitle },
    { label: "Kezdés", value: startHu },
    { label: "Befejezés", value: endHu },
  ];

  if (params.location) {
    rows.push({ label: "Helyszín", value: escapeHtml(params.location) });
  }

  rows.push({ label: "Szervező", value: escapeHtml(params.organizerName) });

  let inner = "";
  inner += emailHeader({ monogramSize: 28, monogramColor: "#C5A55A" });
  inner += emailDivider(accentColor, 3);
  inner += emailTitle("Naptár meghívó", 22);
  inner += emailDataSection(rows, accentColor);

  if (params.description) {
    inner += `<tr>
      <td style="padding: 16px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${accentColor}; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 8px;">LEÍRÁS</td></tr>
          <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; line-height: 1.7; padding: 12px 16px; background-color: #FAF8F5; border-left: 3px solid ${accentColor};">${escapeHtml(params.description)}</td></tr>
        </table>
      </td>
    </tr>`;
  }

  inner += emailFooterDivider(accentColor);
  inner += emailFooter({
    timestamp: startHu,
    source: "Gerecse Ingatlan Naptár",
    accentColor,
  });

  return emailWrapper(inner);
}

export function calendarInviteText(params: CalendarInviteParams): string {
  const startHu = formatHungarianDate(params.startDatetime);
  const endHu = formatHungarianDate(params.endDatetime);

  let text = `Naptár meghívó — Gerecse Ingatlan\n\n`;
  text += `Esemény: ${params.eventTitle}\n`;
  text += `Kezdés: ${startHu}\n`;
  text += `Befejezés: ${endHu}\n`;

  if (params.location) {
    text += `Helyszín: ${params.location}\n`;
  }

  text += `Szervező: ${params.organizerName}\n`;

  if (params.description) {
    text += `\nLeírás:\n${params.description}\n`;
  }

  text += `\n---\nGerecse Ingatlan\nEz egy automatikus értesítés a gerecseingatlan.hu weboldalról.`;
  return text;
}

export function calendarInviteHtmlEn(params: CalendarInviteParams): string {
  const accentColor = "#3B82F6";
  const safeTitle = escapeHtml(params.eventTitle);
  const startEn = formatEnglishDate(params.startDatetime);
  const endEn = formatEnglishDate(params.endDatetime);

  const rows = [
    { label: "Event", value: safeTitle },
    { label: "Start", value: startEn },
    { label: "End", value: endEn },
  ];

  if (params.location) {
    rows.push({ label: "Location", value: escapeHtml(params.location) });
  }

  rows.push({ label: "Organizer", value: escapeHtml(params.organizerName) });

  let inner = "";
  inner += emailHeader({ monogramSize: 28, monogramColor: "#C5A55A" });
  inner += emailDivider(accentColor, 3);
  inner += emailTitle("Calendar Invitation", 22);
  inner += emailDataSection(rows, accentColor);

  if (params.description) {
    inner += `<tr>
      <td style="padding: 16px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${accentColor}; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 8px;">DESCRIPTION</td></tr>
          <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; line-height: 1.7; padding: 12px 16px; background-color: #FAF8F5; border-left: 3px solid ${accentColor};">${escapeHtml(params.description)}</td></tr>
        </table>
      </td>
    </tr>`;
  }

  inner += emailFooterDivider(accentColor);
  inner += emailFooter({
    timestamp: startEn,
    source: "Gerecse Ingatlan Calendar",
    accentColor,
  });

  return emailWrapper(inner);
}

export function calendarInviteTextEn(params: CalendarInviteParams): string {
  const startEn = formatEnglishDate(params.startDatetime);
  const endEn = formatEnglishDate(params.endDatetime);

  let text = `Calendar Invitation — Gerecse Ingatlan\n\n`;
  text += `Event: ${params.eventTitle}\n`;
  text += `Start: ${startEn}\n`;
  text += `End: ${endEn}\n`;

  if (params.location) {
    text += `Location: ${params.location}\n`;
  }

  text += `Organizer: ${params.organizerName}\n`;

  if (params.description) {
    text += `\nDescription:\n${params.description}\n`;
  }

  text += `\n---\nGerecse Ingatlan\nThis is an automatic notification from gerecseingatlan.hu.`;
  return text;
}
