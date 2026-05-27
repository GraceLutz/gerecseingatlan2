import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/admin/auth";
import usersRoutes from "./routes/admin/users";
import contentAdminRoutes from "./routes/admin/content";
import newsletterAdminRoutes from "./routes/admin/newsletter";
import staffRoutes from "./routes/admin/staff";
import calendarAdminRoutes from "./routes/admin/calendar";
import dashboardRoutes from "./routes/admin/dashboard";
import featuredRoutes from "./routes/admin/featured";
import contentPublicRoutes from "./routes/content";
import newsletterPublicRoutes from "./routes/newsletter";
import calendarPublicRoutes from "./routes/calendar";
import contactRoutes from "./routes/contact";
import propertiesRoutes, { feedAdminRouter } from "./routes/properties";
import staffPublicRoutes from "./routes/staff";
import agentRoutes from "./routes/agent";
import agentAdminRoutes from "./routes/admin/agent";
import chatRoutes from "./routes/chat";
import reviewsRoutes from "./routes/reviews";
import { requireAuth, validateCsrf } from "./middleware/auth";
import { fetchFeed, startAutoRefresh } from "./ingatlan-feed";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 8080;

const app = express();
app.set("trust proxy", 1);

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
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV !== "production" ? 200 : 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Túl sok bejelentkezési kísérlet. Kérjük, próbálja újra 15 perc múlva." },
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
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/featured", featuredRoutes);
app.use("/api/admin/agent", agentAdminRoutes);
app.use("/api/admin", feedAdminRouter);

// Public routes (no auth required)
app.use("/api/content", contentPublicRoutes);
app.use("/api/newsletter", newsletterPublicRoutes);
app.use("/api/calendar", calendarPublicRoutes);
app.use("/api", contactRoutes);
app.use("/api/properties", propertiesRoutes);
app.use("/api/staff", staffPublicRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api", chatRoutes);

// ─── Legacy service page redirect ────────────────────────────────────
app.get("/ingatlan-ertekesites-berbeadas", (_req, res) => {
  res.redirect(301, "/ingatlan-ertekesites");
});

// ─── API 404 catch-all (JSON, never empty body or HTML) ─────────────
app.all("/api/{*splat}", (_req: express.Request, res: express.Response) => {
  res.status(404).json({ error: "Az API végpont nem található." });
});

// ─── Global API error handler (JSON, never HTML) ─────────────
app.use("/api", (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = (err as unknown as { status?: number }).status || 500;
  if (isProduction) {
    console.error(JSON.stringify({ level: "error", ts: new Date().toISOString(), status, msg: err.message }));
  } else {
    console.error("[API Error]", err.message, err.stack);
  }
  res.status(status).json({
    error: isProduction ? "Szerverhiba történt." : err.message,
  });
});

// ─── OG meta tag injection for social sharing ──────────────

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

async function injectOgTags(html: string, propertyId: string): Promise<string> {
  const ORIGIN = process.env.SITE_URL || "https://gerecseingatlan.hu";
  const feedUrl = process.env.INGATLAN_XML_URL;
  if (!feedUrl) {
    console.warn("[OG] INGATLAN_XML_URL not set, skipping OG injection");
    return html;
  }

  try {
    const feed = await fetchFeed(feedUrl);
    const property = feed.properties.find((p) => p.id === propertyId);
    if (!property) {
      console.warn(`[OG] Property ${propertyId} not found in feed (${feed.propertyCount} properties)`);
      return html;
    }

    const ogTitle = escapeHtml(property.title);
    const rawDesc = property.description
      ? truncate(property.description.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim(), 200)
      : `${property.title} – ${property.address.city}. ${property.area > 0 ? `${property.area} m², ` : ""}${property.priceFormatted}.`;
    const ogDesc = escapeHtml(rawDesc);
    const ogUrl = `${ORIGIN}/ingatlan/${property.id}`;
    const ogImage = property.images[0]?.startsWith("http") ? property.images[0] : (property.images[0] ? `${ORIGIN}${property.images[0]}` : `${ORIGIN}/og-image.png`);

    console.log(`[OG] Injecting for property ${propertyId}: image=${ogImage}`);

    const ogTags = `<!-- OG_START -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDesc}" />
    <meta property="og:url" content="${ogUrl}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Gerecse Ingatlan" />
    <meta property="og:locale" content="hu_HU" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDesc}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
    <meta name="description" content="${ogDesc}" />
    <!-- OG_END -->`;

    let result = html.replace(/<!-- OG_START -->[\s\S]*?<!-- OG_END -->/, ogTags);
    if (result === html) {
      console.warn("[OG] OG_START/OG_END markers not found in HTML, appending before </head>");
      result = html.replace("</head>", `${ogTags}\n  </head>`);
    }
    result = result.replace(/<title>[^<]*<\/title>/, `<title>${ogTitle} | Gerecse Ingatlan</title>`);
    return result;
  } catch (err) {
    console.error(`[OG] Failed for property ${propertyId}:`, err instanceof Error ? err.message : err);
    return html;
  }
}

// ─── Dev middleware / Production startup ──────────────────────

async function start() {
  let indexHtml: string;

  if (isProduction) {
    if (!process.env.DATABASE_URL) {
      console.error(JSON.stringify({ level: "fatal", ts: new Date().toISOString(), msg: "DATABASE_URL is not set — aborting" }));
      process.exit(1);
    }
    const distPath = path.resolve(__dirname, "../dist");
    app.use(express.static(distPath, { index: false }));
    indexHtml = fs.readFileSync(path.join(distPath, "index.html"), "utf-8");
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { port: 24679 },
        watch: {
          ignored: [
            "**/.bridgespace/**",
            "**/.claude/**",
            "**/uploads/**",
            "**/server/**",
            "**/backend/**",
            "**/*.sql",
            "**/*.md",
          ],
        },
      },
      appType: "custom",
    });
    app.use(vite.middlewares);
    indexHtml = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf-8");

    // Transform index.html through Vite in dev mode
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.originalUrl.startsWith("/api") || req.originalUrl.startsWith("/@") || req.originalUrl.startsWith("/src") || req.originalUrl.startsWith("/node_modules") || req.originalUrl.includes(".")) {
        return next();
      }
      (async () => {
        let html = await vite.transformIndexHtml(req.originalUrl, indexHtml);
        const propertyMatch = req.originalUrl.match(/^(?:\/en)?\/ingatlan\/([^/?]+)/);
        if (propertyMatch) {
          html = await injectOgTags(html, propertyMatch[1]);
        }
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      })().catch(next);
    });
  }

  // Production catch-all with OG injection
  if (isProduction) {
    const htmlHeaders = {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    };

    app.get("/{*splat}", (req: express.Request, res: express.Response) => {
      const propertyMatch = req.url.match(/^(?:\/en)?\/ingatlan\/([^/?]+)/);
      if (propertyMatch) {
        injectOgTags(indexHtml, propertyMatch[1]).then((injected) => {
          res.status(200).set(htmlHeaders).end(injected);
        }).catch(() => {
          res.status(200).set(htmlHeaders).end(indexHtml);
        });
      } else {
        res.status(200).set(htmlHeaders).end(indexHtml);
      }
    });
  }

  app.listen(PORT, () => {
    if (isProduction) {
      console.log(JSON.stringify({ level: "info", ts: new Date().toISOString(), msg: `Server listening on port ${PORT}`, mode: "production" }));
    } else {
      console.log(`Server running on http://localhost:${PORT} (development)`);
    }

    // ─── Start auto-refresh of XML feed (every 1 minute) ────
    const feedUrl = process.env.INGATLAN_XML_URL;
    if (feedUrl) {
      // Initial fetch to populate cache
      fetchFeed(feedUrl, { forceRefresh: true }).catch((err) => {
        console.error(JSON.stringify({
          level: "error",
          ts: new Date().toISOString(),
          msg: "Initial feed fetch failed",
          error: err instanceof Error ? err.message : String(err),
        }));
      });
      // Start the periodic auto-refresh timer
      startAutoRefresh(feedUrl);
    } else {
      console.warn(JSON.stringify({
        level: "warn",
        ts: new Date().toISOString(),
        msg: "INGATLAN_XML_URL not set — auto-refresh disabled",
      }));
    }
  });
}

start();