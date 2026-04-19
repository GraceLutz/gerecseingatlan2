/**
 * Shared email template helpers for Gerecse Ingatlan notification emails.
 * Provides reusable layout primitives (header, data rows, message block, footer)
 * so individual templates only specify their unique content and accent color.
 */

/** Escape HTML special characters to prevent injection in email templates. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface EmailHeaderConfig {
  monogramSize: number;
  monogramColor: string;
}

/** Navy header block with the GI monogram and "GERECSE INGATLAN" brand text. */
export function emailHeader(config: EmailHeaderConfig): string {
  return `<!-- Header -->
                <tr>
                  <td align="center" style="background-color: #1B3A5C; padding: 32px 32px 16px 32px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: ${config.monogramSize}px; color: ${config.monogramColor}; font-weight: bold; letter-spacing: 1px;">G<span style="color: #FFFFFF;">I</span></td>
                      </tr>
                      <tr>
                        <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 14px; color: #C5A55A; letter-spacing: 3px; padding-top: 8px;">GERECSE INGATLAN</td>
                      </tr>
                    </table>
                  </td>
                </tr>`;
}

/** Colored horizontal divider line. */
export function emailDivider(color: string, height: number): string {
  return `<tr>
                  <td style="padding: 0; line-height: 0; font-size: 0;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height: ${height}px; background-color: ${color}; line-height: 0; font-size: 0;">&nbsp;</td></tr></table>
                  </td>
                </tr>`;
}

/** Title row below the header divider. */
export function emailTitle(text: string, fontSize: number): string {
  return `<!-- Title -->
                <tr>
                  <td style="padding: 28px 32px 24px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Georgia, 'Times New Roman', serif; font-size: ${fontSize}px; font-weight: bold; color: #1B3A5C;">${text}</td></tr></table>
                  </td>
                </tr>`;
}

export interface DataRow {
  label: string;
  value: string;
  isLink?: boolean;
}

/** A single data row inside the data table. Alternates white/#FAF8F5 backgrounds. */
export function emailDataRow(row: DataRow, index: number, accentColor: string): string {
  const isAlternate = index % 2 !== 0;
  const bgColor = isAlternate ? "#FAF8F5" : "#FFFFFF";
  const valueHtml = row.isLink
    ? `<a href="mailto:${row.value}" style="color: #1B3A5C; text-decoration: none;">${row.value}</a>`
    : row.value;

  return `<tr>
                        <td style="padding: 12px 16px; background-color: ${bgColor}; border-bottom: 1px solid #E8E4DD; vertical-align: top;">
                          <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${accentColor}; text-transform: uppercase; font-weight: normal; letter-spacing: 1px; padding-bottom: 4px;">${row.label}</td></tr><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #1B3A5C; font-weight: bold;">${valueHtml}</td></tr></table>
                        </td>
                      </tr>`;
}

/** Wraps data rows in the outer data table structure. */
export function emailDataSection(rows: DataRow[], accentColor: string): string {
  const rowsHtml = rows.map((row, i) => emailDataRow(row, i, accentColor)).join("\n");
  return `<!-- Data rows -->
                <tr>
                  <td style="padding: 0 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
${rowsHtml}
                    </table>
                  </td>
                </tr>`;
}

/** Message block with a colored left border. */
export function emailMessageSection(label: string, message: string, accentColor: string): string {
  return `<!-- Message section -->
                <tr>
                  <td style="padding: 24px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: ${accentColor}; text-transform: uppercase; font-weight: normal; letter-spacing: 1px; padding-bottom: 12px;">${label}</td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0 16px 16px; border-left: 3px solid ${accentColor}; background-color: #FAF8F5;">
                          <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; line-height: 1.7; padding: 0 16px 0 0;">${message}</td></tr></table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`;
}

/** Thin footer divider with padding. */
export function emailFooterDivider(color: string): string {
  return `<!-- Footer divider -->
                <tr>
                  <td style="padding: 0 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height: 1px; background-color: ${color}; line-height: 0; font-size: 0;">&nbsp;</td></tr></table>
                  </td>
                </tr>`;
}

export interface EmailFooterConfig {
  timestamp: string;
  source: string;
  accentColor: string;
}

/** Footer block with timestamp, source label, auto-notice, and brand text. */
export function emailFooter(config: EmailFooterConfig): string {
  return `<!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px 12px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #999999; line-height: 1.6;">
                          Beérkezés: ${config.timestamp}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #999999; padding-top: 2px;">
                          Forrás: ${config.source}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #AAAAAA; font-style: italic; padding-top: 8px;">
                          Ez egy automatikus értesítés a gerecseingatlan.hu weboldalról.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Brand footer -->
                <tr>
                  <td style="padding: 12px 32px 28px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: ${config.accentColor}; letter-spacing: 2px;">GERECSE INGATLAN</td></tr></table>
                  </td>
                </tr>`;
}

/** Wraps inner content in the standard email outer/inner table structure. */
export function emailWrapper(innerContent: string): string {
  return `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F3EF; font-family: Arial, Helvetica, sans-serif;">
          <tr>
            <td align="center" style="padding: 32px 16px;">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF;">
${innerContent}
              </table>
            </td>
          </tr>
        </table>
      `;
}
