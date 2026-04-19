import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });
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
import contentPublicRoutes from "./routes/content";
import newsletterPublicRoutes from "./routes/newsletter";
import calendarPublicRoutes from "./routes/calendar";
import contactRoutes from "./routes/contact";
import propertiesRoutes, { feedAdminRouter } from "./routes/properties";
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
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin", feedAdminRouter);

// Public routes (no auth required)
app.use("/api/content", contentPublicRoutes);
app.use("/api/newsletter", newsletterPublicRoutes);
app.use("/api/calendar", calendarPublicRoutes);
app.use("/api", contactRoutes);
app.use("/api/properties", propertiesRoutes);

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
