interface NewsletterConfirmationParams {
  email: string;
  confirmUrl: string;
  name?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function newsletterConfirmationHtml(params: NewsletterConfirmationParams): string {
  const safeName = params.name ? escapeHtml(params.name) : null;
  const safeConfirmUrl = escapeHtml(params.confirmUrl);
  const greeting = safeName ? `Kedves ${safeName}!` : "Kedves Feliratkozó!";

  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F3EF; font-family: Arial, Helvetica, sans-serif;">
  <tr>
    <td align="center" style="padding: 32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF;">
        <tr>
          <td align="center" style="background-color: #1B3A5C; padding: 32px 32px 16px 32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; color: #C5A55A; font-weight: bold; letter-spacing: 1px;">G<span style="color: #FFFFFF;">I</span></td>
              </tr>
              <tr>
                <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 14px; color: #C5A55A; letter-spacing: 3px; padding-top: 8px;">GERECSE INGATLAN</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0; line-height: 0; font-size: 0;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height: 3px; background-color: #C5A55A; line-height: 0; font-size: 0;">&nbsp;</td></tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding: 28px 32px 16px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: bold; color: #1B3A5C;">Hírlevél feliratkozás</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px 16px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #333333; line-height: 1.7;">
                ${greeting}<br><br>
                Köszönjük, hogy feliratkozott a Gerecse Ingatlan hírlevelére! Kérjük, erősítse meg feliratkozását az alábbi gombra kattintva:
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 24px 32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color: #1B3A5C; padding: 14px 32px; border-radius: 4px;">
                  <a href="${safeConfirmUrl}" style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #FFFFFF; text-decoration: none; font-weight: bold; letter-spacing: 0.5px;">Feliratkozás megerősítése</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px 24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #999999; line-height: 1.6;">
                Ha nem Ön iratkozott fel, kérjük hagyja figyelmen kívül ezt az e-mailt. A megerősítés nélkül nem fogunk hírlevelet küldeni.
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height: 1px; background-color: #C5A55A; line-height: 0; font-size: 0;">&nbsp;</td></tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 32px 28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #AAAAAA; font-style: italic;">Ez egy automatikus értesítés a gerecseingatlan.hu weboldalról.</td></tr>
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #C5A55A; letter-spacing: 2px; padding-top: 8px;">GERECSE INGATLAN</td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

export function newsletterConfirmationText(params: NewsletterConfirmationParams): string {
  const greeting = params.name ? `Kedves ${params.name}!` : "Kedves Feliratkozó!";

  return `Hírlevél feliratkozás megerősítése – Gerecse Ingatlan

${greeting}

Köszönjük, hogy feliratkozott a Gerecse Ingatlan hírlevelére!
Kérjük, erősítse meg feliratkozását az alábbi linkre kattintva:

${params.confirmUrl}

Ha nem Ön iratkozott fel, kérjük hagyja figyelmen kívül ezt az e-mailt.
A megerősítés nélkül nem fogunk hírlevelet küldeni.

---
Gerecse Ingatlan
Ez egy automatikus értesítés a gerecseingatlan.hu weboldalról.`;
}
