interface WelcomeParams {
  email: string;
  tempPassword: string;
  loginUrl: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function welcomeNewUserHtml(params: WelcomeParams): string {
  const safeEmail = escapeHtml(params.email);
  const safePassword = escapeHtml(params.tempPassword);
  const safeLoginUrl = escapeHtml(params.loginUrl);

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
              <tr><td style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: bold; color: #1B3A5C;">Üdvözöljük!</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px 16px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #333333; line-height: 1.7;">
                Fiókja létrejött a Gerecse Ingatlan adminisztrációs felületén. Az alábbi adatokkal tud bejelentkezni:
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 16px; background-color: #FAF8F5; border-bottom: 1px solid #E8E4DD;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #C5A55A; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 4px;">E-MAIL CÍM</td></tr>
                    <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #1B3A5C; font-weight: bold;">${safeEmail}</td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 16px; background-color: #FFFFFF; border-bottom: 1px solid #E8E4DD;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #C5A55A; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 4px;">IDEIGLENES JELSZÓ</td></tr>
                    <tr><td style="font-family: 'Courier New', monospace; font-size: 16px; color: #1B3A5C; font-weight: bold; letter-spacing: 1px;">${safePassword}</td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 24px 32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color: #1B3A5C; padding: 14px 32px; border-radius: 4px;">
                  <a href="${safeLoginUrl}" style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #FFFFFF; text-decoration: none; font-weight: bold; letter-spacing: 0.5px;">Bejelentkezés</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px 24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #999999; line-height: 1.6;">
                Kérjük, az első bejelentkezés után változtassa meg jelszavát. Ha nem Ön kérte ezt a fiókot, kérjük hagyja figyelmen kívül ezt az e-mailt.
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

export function welcomeNewUserText(params: WelcomeParams): string {
  return `Üdvözöljük a Gerecse Ingatlan rendszerében!

Fiókja létrejött az adminisztrációs felületen.

Bejelentkezési adatok:
  E-mail cím: ${params.email}
  Ideiglenes jelszó: ${params.tempPassword}

Bejelentkezés: ${params.loginUrl}

Kérjük, az első bejelentkezés után változtassa meg jelszavát.
Ha nem Ön kérte ezt a fiókot, kérjük hagyja figyelmen kívül ezt az e-mailt.

---
Gerecse Ingatlan
Ez egy automatikus értesítés a gerecseingatlan.hu weboldalról.`;
}
