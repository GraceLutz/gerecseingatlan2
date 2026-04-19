import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { getTransporter, getMailFrom } from "../mailer";
import { buildContactEmail } from "../templates/contact_form";
import { buildInteriorDesignEmail } from "../templates/interior_design";

const router = Router();

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Túl sok űrlapbeküldés, kérjük próbálja újra később." },
});

const contactFormSchema = z.object({
  name: z.string().min(1, "A név megadása kötelező.").max(255),
  email: z.string().email("Érvénytelen email cím.").max(320),
  phone: z.string().max(50).optional(),
  subject: z.string().min(1, "A tárgy megadása kötelező.").max(500),
  message: z.string().min(1, "Az üzenet megadása kötelező.").max(5000),
  honeypot: z.string().optional(),
});

const interiorDesignSchema = z.object({
  name: z.string().min(1, "A név megadása kötelező.").max(255),
  email: z.string().email("Érvénytelen email cím.").max(320),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  message: z.string().min(1, "Az üzenet megadása kötelező.").max(5000),
  honeypot: z.string().optional(),
});

/** POST /api/contact — general contact form submission */
router.post("/contact", formLimiter, async (req, res) => {
  try {
    const parsed = contactFormSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Érvénytelen adatok." });
    }

    const { name, email, phone, subject, message, honeypot } = parsed.data;

    if (honeypot) {
      return res.json({ success: true });
    }

    await getTransporter().sendMail({
      from: getMailFrom(),
      to: process.env.EMAIL_TO!,
      replyTo: email,
      subject: `Új kapcsolatfelvétel – ${subject}`,
      html: buildContactEmail({ name, email, phone, subject, message }),
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Email küldési hiba:", error);
    res.status(500).json({ error: "Hiba történt a küldés során." });
  }
});

/** POST /api/interior-design — interior design inquiry form submission */
router.post("/interior-design", formLimiter, async (req, res) => {
  try {
    const parsed = interiorDesignSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Érvénytelen adatok." });
    }

    const { name, email, phone, address, message, honeypot } = parsed.data;

    if (honeypot) {
      return res.json({ success: true });
    }

    await getTransporter().sendMail({
      from: getMailFrom(),
      to: process.env.EMAIL_TO!,
      replyTo: email,
      subject: `🏠 Belsőépítészeti ajánlatkérés – ${name}`,
      html: buildInteriorDesignEmail({ name, email, phone, address, message }),
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Email küldési hiba:", error);
    res.status(500).json({ error: "Hiba történt a küldés során." });
  }
});

export default router;
