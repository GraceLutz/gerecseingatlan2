import { getTransporter, getMailFrom } from "../mailer";
import { welcomeNewUserHtml, welcomeNewUserText } from "../templates/welcome_new_user";
import { passwordResetHtml, passwordResetText } from "../templates/password_reset";
import { newsletterConfirmationHtml, newsletterConfirmationText } from "../templates/newsletter_confirmation";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends an email via SMTP using the shared mailer transporter.
 * Falls back to console logging when SMTP is not configured.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  try {
    const smtp = getTransporter();
    await smtp.sendMail({
      from: getMailFrom(),
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    if (!process.env.SMTP_HOST) {
      console.log("[Email] SMTP not configured — logging email to console:");
      console.log(`  To: ${options.to}`);
      console.log(`  Subject: ${options.subject}`);
      console.log(`  Text: ${options.text.substring(0, 200)}...`);
      return;
    }
    throw error;
  }
}

interface WelcomeEmailParams {
  email: string;
  tempPassword: string;
  loginUrl: string;
}

export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<void> {
  await sendEmail({
    to: params.email,
    subject: "Üdvözöljük a Gerecse Ingatlan rendszerében",
    html: welcomeNewUserHtml(params),
    text: welcomeNewUserText(params),
  });
}

interface PasswordResetParams {
  email: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail(params: PasswordResetParams): Promise<void> {
  await sendEmail({
    to: params.email,
    subject: "Jelszó visszaállítás – Gerecse Ingatlan",
    html: passwordResetHtml(params),
    text: passwordResetText(params),
  });
}

interface NewsletterConfirmationParams {
  email: string;
  confirmUrl: string;
  name?: string;
}

export async function sendNewsletterConfirmationEmail(params: NewsletterConfirmationParams): Promise<void> {
  await sendEmail({
    to: params.email,
    subject: "Hírlevél feliratkozás megerősítése – Gerecse Ingatlan",
    html: newsletterConfirmationHtml(params),
    text: newsletterConfirmationText(params),
  });
}
