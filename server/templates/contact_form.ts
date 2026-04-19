import {
  escapeHtml,
  emailHeader,
  emailDivider,
  emailTitle,
  emailDataSection,
  emailMessageSection,
  emailFooterDivider,
  emailFooter,
  emailWrapper,
  type DataRow,
} from "./shared";

export interface ContactFormEmailParams {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/** Build the HTML notification email for a general contact form submission. */
export function buildContactEmail(params: ContactFormEmailParams): string {
  const safeName = escapeHtml(params.name);
  const safeEmail = escapeHtml(params.email);
  const safePhone = escapeHtml(params.phone || "Nem adta meg");
  const safeSubject = escapeHtml(params.subject);
  const safeMessage = escapeHtml(params.message).replace(/\n/g, "<br />");

  const ACCENT = "#C5A55A";

  const rows: DataRow[] = [
    { label: "NÉV", value: safeName },
    { label: "E-MAIL", value: safeEmail, isLink: true },
    { label: "TELEFON", value: safePhone },
    { label: "TÁRGY", value: safeSubject },
  ];

  const timestamp = new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" });

  const inner = [
    emailHeader({ monogramSize: 28, monogramColor: ACCENT }),
    emailDivider(ACCENT, 3),
    emailTitle("Új megkeresés érkezett", 24),
    emailDataSection(rows, ACCENT),
    emailMessageSection("ÜZENET", safeMessage, ACCENT),
    emailFooterDivider(ACCENT),
    emailFooter({
      timestamp,
      source: "Általános kapcsolatfelvételi űrlap",
      accentColor: ACCENT,
    }),
  ].join("\n");

  return emailWrapper(inner);
}
