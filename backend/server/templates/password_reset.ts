import { escapeHtml } from "./shared";

interface PasswordResetParams {
  email: string;
  resetUrl: string;
}

export function passwordResetHtml(params: PasswordResetParams): string {
  const safeEmail = escapeHtml(params.email);
  const safeResetUrl = escapeHtml(params.resetUrl);

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
              <tr><td style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: bold; color: #1B3A5C;">Jelszó visszaállítás</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px 16px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #333333; line-height: 1.7;">
                A következő fiókhoz jelszó-visszaállítási kérelmet kaptunk: <strong>${safeEmail}</strong>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px 8px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #333333; line-height: 1.7;">
                Kattintson az alábbi gombra az új jelszó beállításához:
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 24px 32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color: #1B3A5C; padding: 14px 32px; border-radius: 4px;">
                  <a href="${safeResetUrl}" style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #FFFFFF; text-decoration: none; font-weight: bold; letter-spacing: 0.5px;">Jelszó visszaállítása</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 32px 24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #999999; line-height: 1.6;">
                Ez a link 1 órán belül lejár. Ha nem Ön kérte a jelszó visszaállítását, kérjük hagyja figyelmen kívül ezt az e-mailt — fiókja biztonságban van.
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

export function passwordResetText(params: PasswordResetParams): string {
  return `Jelszó visszaállítás – Gerecse Ingatlan

A következő fiókhoz jelszó-visszaállítási kérelmet kaptunk: ${params.email}

Jelszó visszaállítása: ${params.resetUrl}

Ez a link 1 órán belül lejár.
Ha nem Ön kérte a jelszó visszaállítását, kérjük hagyja figyelmen kívül ezt az e-mailt — fiókja biztonságban van.

---
Gerecse Ingatlan
Ez egy automatikus értesítés a gerecseingatlan.hu weboldalról.`;
}
