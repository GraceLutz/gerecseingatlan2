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

export interface InteriorDesignEmailParams {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  message: string;
}

/** Interior-design badge shown above the footer. */
function interiorDesignBadge(): string {
  return `<!-- BELSŐÉPÍTÉSZET badge -->
                <tr>
                  <td align="center" style="padding: 8px 32px 20px 32px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #A0784D; padding: 8px 20px; font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #FFFFFF; letter-spacing: 2px; font-weight: bold; text-transform: uppercase;">
                          BELSŐÉPÍTÉSZET
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`;
}

/** Build the HTML notification email for an interior design inquiry. */
export function buildInteriorDesignEmail(params: InteriorDesignEmailParams): string {
  const safeName = escapeHtml(params.name);
  const safeEmail = escapeHtml(params.email);
  const safePhone = escapeHtml(params.phone || "Nem adta meg");
  const safeAddress = escapeHtml(params.address || "Nem adta meg");
  const safeMessage = escapeHtml(params.message).replace(/\n/g, "<br />");

  const ACCENT = "#A0784D";

  const rows: DataRow[] = [
    { label: "NÉV", value: safeName },
    { label: "E-MAIL", value: safeEmail, isLink: true },
    { label: "TELEFONSZÁM", value: safePhone },
    { label: "INGATLAN CÍME VAGY HELYSZÍN", value: safeAddress },
  ];

  const timestamp = new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" });

  const inner = [
    emailHeader({ monogramSize: 36, monogramColor: ACCENT }),
    emailDivider(ACCENT, 2),
    emailTitle("&#127968; Belsőépítészeti ajánlatkérés", 22),
    emailDataSection(rows, ACCENT),
    emailMessageSection("ÜZENET, ELKÉPZELÉSEK", safeMessage, ACCENT),
    interiorDesignBadge(),
    emailFooterDivider(ACCENT),
    emailFooter({
      timestamp,
      source: "\u2B50 Belsőépítészeti ajánlatkérő űrlap",
      accentColor: ACCENT,
    }),
  ].join("\n");

  return emailWrapper(inner);
}
