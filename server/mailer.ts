import nodemailer from "nodemailer";

let _transporter: nodemailer.Transporter | null = null;

/** Lazy-initialized transporter — ensures env vars are loaded before first use */
export function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    console.log("[SMTP] Initializing transporter:", {
      host: process.env.SMTP_HOST,
      port: smtpPort,
      user: process.env.SMTP_USER,
      passLength: process.env.SMTP_PASS?.length,
    });
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

export function getMailFrom(): string {
  return `"Gerecse Ingatlan" <${process.env.SMTP_USER}>`;
}
