import {
  escapeHtml,
  emailWrapper,
  emailHeader,
  emailDivider,
  emailTitle,
  emailDataSection,
  emailMessageSection,
  emailFooterDivider,
  emailFooter,
} from "./shared";

export interface LeadNotificationParams {
  phone: string;
  name?: string | null;
  propertyId?: string | null;
  conversationSummary?: string | null;
  currentPath?: string | null;
  createdAt: Date;
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

function buildSubject(params: LeadNotificationParams): string {
  if (params.propertyId) {
    return `Új érdeklődő: ingatlan #${params.propertyId}`;
  }
  return "Új érdeklődő a weboldalról";
}

export function leadNotificationSubject(params: LeadNotificationParams): string {
  return buildSubject(params);
}

export function leadNotificationHtml(params: LeadNotificationParams): string {
  const accentColor = "#2D8C3C";
  const timestamp = formatHungarianDate(params.createdAt);

  const rows = [
    { label: "Telefonszám", value: escapeHtml(params.phone) },
  ];

  if (params.name) {
    rows.push({ label: "Név", value: escapeHtml(params.name) });
  }

  if (params.propertyId) {
    rows.push({
      label: "Megtekintett ingatlan",
      value: `<a href="https://gerecseingatlan.hu/ingatlan/${escapeHtml(params.propertyId)}" style="color: #1B3A5C; text-decoration: underline;">#${escapeHtml(params.propertyId)}</a>`,
    });
  }

  if (params.currentPath) {
    rows.push({ label: "Oldal", value: escapeHtml(params.currentPath) });
  }

  rows.push({ label: "Időpont", value: timestamp });

  let inner = "";
  inner += emailHeader({ monogramSize: 28, monogramColor: "#C5A55A" });
  inner += emailDivider(accentColor, 3);
  inner += emailTitle("Új érdeklődő", 22);
  inner += emailDataSection(rows, accentColor);

  if (params.conversationSummary) {
    inner += emailMessageSection(
      "BESZÉLGETÉS ÖSSZEFOGLALÓ",
      escapeHtml(params.conversationSummary).replace(/\n/g, "<br>"),
      accentColor,
    );
  }

  inner += emailFooterDivider(accentColor);
  inner += emailFooter({
    timestamp,
    source: "Gerecse AI Asszisztens",
    accentColor,
  });

  return emailWrapper(inner);
}

export function leadNotificationText(params: LeadNotificationParams): string {
  const timestamp = formatHungarianDate(params.createdAt);

  let text = `Új érdeklődő — Gerecse Ingatlan\n\n`;
  text += `Telefonszám: ${params.phone}\n`;

  if (params.name) {
    text += `Név: ${params.name}\n`;
  }

  if (params.propertyId) {
    text += `Megtekintett ingatlan: https://gerecseingatlan.hu/ingatlan/${params.propertyId}\n`;
  }

  if (params.currentPath) {
    text += `Oldal: ${params.currentPath}\n`;
  }

  text += `Időpont: ${timestamp}\n`;

  if (params.conversationSummary) {
    text += `\nBeszélgetés összefoglaló:\n${params.conversationSummary}\n`;
  }

  text += `\n---\nGerecse Ingatlan\nEz egy automatikus értesítés a gerecseingatlan.hu weboldalról.`;
  return text;
}
