import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { getTransporter, getMailFrom } from "./mailer";
import { fetchFeed, getFeedStatus } from "./ingatlan-feed";
import authRoutes from "./routes/admin/auth";
import usersRoutes from "./routes/admin/users";
import contentAdminRoutes from "./routes/admin/content";
import newsletterAdminRoutes from "./routes/admin/newsletter";
import staffRoutes from "./routes/admin/staff";
import calendarAdminRoutes from "./routes/admin/calendar";
import contentPublicRoutes from "./routes/content";
import newsletterPublicRoutes from "./routes/newsletter";
import calendarPublicRoutes from "./routes/calendar";
import { requireAuth, validateCsrf } from "./middleware/auth";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 8080;

const app = express();

// ─── Security middleware ───────────────────────────────────

/** Remove X-Powered-By header */
app.disable("x-powered-by");

/** HTTPS redirect in production */
if (isProduction) {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(301, `https://${req.hostname}${req.url}`);
    }
    next();
  });
}

/** Helmet — sets common security headers */
app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
              "'self'",
              "https://www.googletagmanager.com",
              "https://www.google-analytics.com",
              "https://maps.googleapis.com",
            ],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            fontSrc: ["'self'"],
            connectSrc: [
              "'self'",
              "https://www.google-analytics.com",
              "https://analytics.google.com",
              "https://maps.googleapis.com",
              "https://ingatlankozvetitok.ingatlanszoftver.hu",
            ],
            frameSrc: ["https://www.google.com", "https://maps.google.com"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'self'"],
          },
        }
      : false, // Disable CSP in development — Vite injects inline scripts for HMR
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginEmbedderPolicy: false, // Allow Google Maps embeds
  })
);

/** Permissions-Policy header (not covered by helmet) */
app.use((_req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=()"
  );
  next();
});

/** General rate limiter: 100 requests per 15 minutes per IP */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Túl sok kérés, kérjük próbálja újra később." },
});

/** Strict rate limiter for form submissions: 5 per 15 minutes per IP */
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Túl sok űrlapbeküldés, kérjük próbálja újra később." },
});

/** Apply general rate limit to all API routes */
app.use("/api/", generalLimiter);

/** Cookie security defaults */
app.use((_req, res, next) => {
  // Set default cookie options for any cookies set downstream
  const originalCookie = res.cookie.bind(res);
  res.cookie = (name: string, val: string, options?: express.CookieOptions) => {
    const secureDefaults: express.CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      ...options,
    };
    return originalCookie(name, val, secureDefaults);
  };
  next();
});

app.use(express.json({ limit: "10kb" }));

// ─── Static file serving for uploads ──────────────────────
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads"), {
  maxAge: "7d",
  immutable: false,
}));

// ─── Admin auth routes ────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Túl sok bejelentkezési kísérlet. Próbálja újra 1 perc múlva." },
});

app.use("/api/admin/login", loginLimiter);
app.use("/api/admin", authRoutes);

// CSRF + auth for all other admin API routes
app.use("/api/admin", requireAuth, validateCsrf);

// Admin route modules (auth + CSRF applied above)
app.use("/api/admin/users", usersRoutes);
app.use("/api/admin/content", contentAdminRoutes);
app.use("/api/admin/newsletter", newsletterAdminRoutes);
app.use("/api/admin/staff", staffRoutes);
app.use("/api/admin/calendar", calendarAdminRoutes);

// Public routes (no auth required)
app.use("/api/content", contentPublicRoutes);
app.use("/api/newsletter", newsletterPublicRoutes);
app.use("/api/calendar", calendarPublicRoutes);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Escape HTML special characters to prevent injection in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── API routes ─────────────────────────────────────────────

// General contact form
app.post("/api/contact", formLimiter, async (req, res) => {
  try {
    const { name, email, phone, subject, message, honeypot } = req.body;

    if (honeypot) {
      return res.json({ success: true });
    }

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Kérjük, töltse ki az összes kötelező mezőt." });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Érvénytelen email cím." });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || "Nem adta meg");
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    await getTransporter().sendMail({
      from: getMailFrom(),
      to: process.env.EMAIL_TO!,
      replyTo: email,
      subject: `Új kapcsolatfelvétel – ${safeSubject}`,
      html: `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F3EF; font-family: Arial, Helvetica, sans-serif;">
          <tr>
            <td align="center" style="padding: 32px 16px;">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF;">
                <!-- Header -->
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
                <!-- Gold divider -->
                <tr>
                  <td style="padding: 0; line-height: 0; font-size: 0;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height: 3px; background-color: #C5A55A; line-height: 0; font-size: 0;">&nbsp;</td></tr></table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 28px 32px 24px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: bold; color: #1B3A5C;">Új megkeresés érkezett</td></tr></table>
                  </td>
                </tr>
                <!-- Data rows -->
                <tr>
                  <td style="padding: 0 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                      <tr>
                        <td style="padding: 12px 16px; background-color: #FFFFFF; border-bottom: 1px solid #E8E4DD; vertical-align: top;">
                          <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #C5A55A; text-transform: uppercase; font-weight: normal; letter-spacing: 1px; padding-bottom: 4px;">NÉV</td></tr><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #1B3A5C; font-weight: bold;">${safeName}</td></tr></table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; background-color: #FAF8F5; border-bottom: 1px solid #E8E4DD; vertical-align: top;">
                          <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #C5A55A; text-transform: uppercase; font-weight: normal; letter-spacing: 1px; padding-bottom: 4px;">E-MAIL</td></tr><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #1B3A5C; font-weight: bold;"><a href="mailto:${safeEmail}" style="color: #1B3A5C; text-decoration: none;">${safeEmail}</a></td></tr></table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; background-color: #FFFFFF; border-bottom: 1px solid #E8E4DD; vertical-align: top;">
                          <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #C5A55A; text-transform: uppercase; font-weight: normal; letter-spacing: 1px; padding-bottom: 4px;">TELEFON</td></tr><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #1B3A5C; font-weight: bold;">${safePhone}</td></tr></table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; background-color: #FAF8F5; border-bottom: 1px solid #E8E4DD; vertical-align: top;">
                          <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #C5A55A; text-transform: uppercase; font-weight: normal; letter-spacing: 1px; padding-bottom: 4px;">TÁRGY</td></tr><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #1B3A5C; font-weight: bold;">${safeSubject}</td></tr></table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Message section -->
                <tr>
                  <td style="padding: 24px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #C5A55A; text-transform: uppercase; font-weight: normal; letter-spacing: 1px; padding-bottom: 12px;">ÜZENET</td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0 16px 16px; border-left: 3px solid #C5A55A; background-color: #FAF8F5;">
                          <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; line-height: 1.7; padding: 0 16px 0 0;">${safeMessage}</td></tr></table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer divider -->
                <tr>
                  <td style="padding: 0 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height: 1px; background-color: #C5A55A; line-height: 0; font-size: 0;">&nbsp;</td></tr></table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px 12px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #999999; line-height: 1.6;">
                          Beérkezés: ${new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" })}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #999999; padding-top: 2px;">
                          Forrás: Általános kapcsolatfelvételi űrlap
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
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #C5A55A; letter-spacing: 2px;">GERECSE INGATLAN</td></tr></table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Email küldési hiba:", error);
    res.status(500).json({ error: "Hiba történt a küldés során." });
  }
});

// Interior design inquiry form
app.post("/api/interior-design", formLimiter, async (req, res) => {
  try {
    const { name, email, phone, address, message, honeypot } = req.body;

    if (honeypot) {
      return res.json({ success: true });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Kérjük, töltse ki az összes kötelező mezőt." });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Érvénytelen email cím." });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || "Nem adta meg");
    const safeAddress = escapeHtml(address || "Nem adta meg");
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    await getTransporter().sendMail({
      from: getMailFrom(),
      to: process.env.EMAIL_TO!,
      replyTo: email,
      subject: `🏠 Belsőépítészeti ajánlatkérés – ${safeName}`,
      html: `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F3EF; font-family: Arial, Helvetica, sans-serif;">
          <tr>
            <td align="center" style="padding: 32px 16px;">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF;">
                <!-- Dark navy header with monogram -->
                <tr>
                  <td align="center" style="background-color: #1B3A5C; padding: 32px 32px 16px 32px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 36px; color: #A0784D; font-weight: bold; letter-spacing: 1px;">G<span style="color: #FFFFFF;">I</span></td>
                      </tr>
                      <tr>
                        <td align="center" style="font-family: Georgia, 'Times New Roman', serif; font-size: 14px; color: #C5A55A; letter-spacing: 3px; padding-top: 8px;">
                          GERECSE INGATLAN
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Bronze divider -->
                <tr>
                  <td style="padding: 0; line-height: 0; font-size: 0;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height: 2px; background-color: #A0784D; line-height: 0; font-size: 0;">&nbsp;</td></tr></table>
                  </td>
                </tr>
                <!-- Title -->
                <tr>
                  <td style="padding: 28px 32px 24px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: bold; color: #1B3A5C;">&#127968; Belsőépítészeti ajánlatkérés</td></tr></table>
                  </td>
                </tr>
                <!-- Data rows -->
                <tr>
                  <td style="padding: 0 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                      <tr>
                        <td style="padding: 12px 16px; background-color: #FFFFFF; border-bottom: 1px solid #E8E4DD; vertical-align: top;">
                          <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #A0784D; text-transform: uppercase; font-weight: normal; letter-spacing: 1px; padding-bottom: 4px;">NÉV</td></tr><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #1B3A5C; font-weight: bold;">${safeName}</td></tr></table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; background-color: #FAF8F5; border-bottom: 1px solid #E8E4DD; vertical-align: top;">
                          <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #A0784D; text-transform: uppercase; font-weight: normal; letter-spacing: 1px; padding-bottom: 4px;">E-MAIL</td></tr><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #1B3A5C; font-weight: bold;"><a href="mailto:${safeEmail}" style="color: #1B3A5C; text-decoration: none;">${safeEmail}</a></td></tr></table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; background-color: #FFFFFF; border-bottom: 1px solid #E8E4DD; vertical-align: top;">
                          <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #A0784D; text-transform: uppercase; font-weight: normal; letter-spacing: 1px; padding-bottom: 4px;">TELEFONSZÁM</td></tr><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #1B3A5C; font-weight: bold;">${safePhone}</td></tr></table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 16px; background-color: #FAF8F5; border-bottom: 1px solid #E8E4DD; vertical-align: top;">
                          <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #A0784D; text-transform: uppercase; font-weight: normal; letter-spacing: 1px; padding-bottom: 4px;">INGATLAN CÍME VAGY HELYSZÍN</td></tr><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #1B3A5C; font-weight: bold;">${safeAddress}</td></tr></table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Message section -->
                <tr>
                  <td style="padding: 24px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #A0784D; text-transform: uppercase; font-weight: normal; letter-spacing: 1px; padding-bottom: 12px;">ÜZENET, ELKÉPZELÉSEK</td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 0 16px 16px; border-left: 3px solid #A0784D; background-color: #FAF8F5;">
                          <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; line-height: 1.7; padding: 0 16px 0 0;">${safeMessage}</td></tr></table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- BELSŐÉPÍTÉSZET badge -->
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
                </tr>
                <!-- Footer divider -->
                <tr>
                  <td style="padding: 0 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height: 1px; background-color: #A0784D; line-height: 0; font-size: 0;">&nbsp;</td></tr></table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px 12px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #999999; line-height: 1.6;">
                          Beérkezés: ${new Date().toLocaleString("hu-HU", { timeZone: "Europe/Budapest" })}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #999999; padding-top: 2px;">
                          Forrás: ⭐ Belsőépítészeti ajánlatkérő űrlap
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
                    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #A0784D; letter-spacing: 2px;">GERECSE INGATLAN</td></tr></table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Email küldési hiba:", error);
    res.status(500).json({ error: "Hiba történt a küldés során." });
  }
});

// ─── Property feed API ──────────────────────────────────────

const INGATLAN_XML_URL = process.env.INGATLAN_XML_URL;

/** GET /api/properties — returns parsed property listings from XML feed */
app.get("/api/properties", async (_req, res) => {
  if (!INGATLAN_XML_URL) {
    return res.status(503).json({
      error: "XML feed URL not configured",
      properties: [],
    });
  }

  try {
    const result = await fetchFeed(INGATLAN_XML_URL);
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    res.json(result);
  } catch (err) {
    console.error("[api/properties] Error:", err);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

/** GET /api/properties/:id — returns a single property by ID */
app.get("/api/properties/:id", async (req, res) => {
  if (!INGATLAN_XML_URL) {
    return res.status(503).json({ error: "XML feed URL not configured" });
  }

  try {
    const result = await fetchFeed(INGATLAN_XML_URL);
    const property = result.properties.find((p) => p.id === req.params.id || p.slug === req.params.id);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    res.json({ property, office: result.office });
  } catch (err) {
    console.error("[api/properties/:id] Error:", err);
    res.status(500).json({ error: "Failed to fetch property" });
  }
});

/** POST /api/admin/feed-refresh — force refresh the feed cache (auth required via middleware above) */
app.post("/api/admin/feed-refresh", async (_req, res) => {
  if (!INGATLAN_XML_URL) {
    return res.status(503).json({ error: "XML feed URL not configured" });
  }

  try {
    const result = await fetchFeed(INGATLAN_XML_URL, { forceRefresh: true });
    res.json({
      success: true,
      propertyCount: result.propertyCount,
      errors: result.errors,
      fetchedAt: result.fetchedAt,
    });
  } catch (err) {
    console.error("[api/admin/feed-refresh] Error:", err);
    res.status(500).json({ error: "Failed to refresh feed" });
  }
});

/** GET /api/admin/feed-status — returns feed cache status */
app.get("/api/admin/feed-status", (_req, res) => {
  res.json(getFeedStatus());
});

// ─── Vite / Static serving ──────────────────────────────────

async function start() {
  if (!isProduction) {
    // Dev: mount Vite's dev server as middleware (HMR, React fast-refresh, etc.)
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static files with cache headers
    const distPath = path.resolve(__dirname, "../dist");
    app.use(
      express.static(distPath, {
        maxAge: "1y",
        immutable: true,
        setHeaders(res, filePath) {
          // HTML files should not be cached aggressively (SPA entry point)
          if (filePath.endsWith(".html")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          }
        },
      })
    );
    app.get("/{*splat}", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} (${isProduction ? "production" : "development"})`);
  });
}

start();
