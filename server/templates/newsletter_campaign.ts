import { escapeHtml, emailWrapper, emailHeader, emailDivider } from "./shared";

interface CampaignEmailParams {
  subject: string;
  preheader?: string;
  body: string;
  unsubscribeUrl: string;
}

export function newsletterCampaignHtml(params: CampaignEmailParams): string {
  const safeSubject = escapeHtml(params.subject);
  const safeBody = params.body
    .split("\n\n")
    .map((p) => `<p style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #333333; line-height: 1.7; margin: 0 0 16px 0;">${escapeHtml(p)}</p>`)
    .join("");
  const safeUnsubscribeUrl = escapeHtml(params.unsubscribeUrl);

  const preheaderHtml = params.preheader
    ? `<span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${escapeHtml(params.preheader)}</span>`
    : "";

  const innerContent = `
${emailHeader({ monogramSize: 28, monogramColor: "#C5A55A" })}
${emailDivider("#C5A55A", 3)}
                <tr>
                  <td style="padding: 28px 32px 16px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: bold; color: #1B3A5C;">${safeSubject}</td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 32px 24px 32px;">
                    ${safeBody}
                  </td>
                </tr>
${emailDivider("#E8E4DD", 1)}
                <tr>
                  <td style="padding: 20px 32px 28px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #C5A55A; letter-spacing: 2px;">GERECSE INGATLAN</td></tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #999999; padding-top: 12px;">
                          <a href="${safeUnsubscribeUrl}" style="color: #999999; text-decoration: underline;">Leiratkozás a hírlevélről</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`;

  return preheaderHtml + emailWrapper(innerContent);
}

export function newsletterCampaignText(params: CampaignEmailParams): string {
  return `${params.subject}

${params.body}

---
Gerecse Ingatlan

Leiratkozás: ${params.unsubscribeUrl}`;
}
