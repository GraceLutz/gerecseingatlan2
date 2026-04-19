import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Types ──────────────────────────────────────────────────────────────────

/** Granular consent categories stored in localStorage. */
export interface ConsentState {
  /** Essential cookies — always true, cannot be toggled off. */
  essential: true;
  /** Analytics cookies (GA4). */
  analytics: boolean;
  /** Marketing cookies (future use). */
  marketing: boolean;
  /** ISO-8601 timestamp of when consent was given/updated. */
  timestamp: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const COOKIE_CONSENT_KEY = "gerecse_cookie_consent";

/** Custom event dispatched on `window` whenever consent changes. */
const CONSENT_EVENT = "consent-updated";

// ─── Public helpers ─────────────────────────────────────────────────────────

/**
 * Read and parse the current consent state from localStorage.
 * Returns `null` if no consent has been recorded yet.
 */
export function getConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    // Basic shape validation
    if (typeof parsed.analytics !== "boolean") return null;
    return parsed;
  } catch {
    return null;
  }
}

// ─── Internal helpers ───────────────────────────────────────────────────────

function saveConsent(analytics: boolean, marketing: boolean): void {
  const consent: ConsentState = {
    essential: true,
    analytics,
    marketing,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }));
}

// ─── Translations ───────────────────────────────────────────────────────────

const translations = {
  hu: {
    message:
      "Ez a weboldal sütiket használ a felhasználói élmény javítása érdekében.",
    acceptAll: "Elfogadom",
    rejectNonEssential: "Elutasítom",
    settings: "Beállítások",
    settingsTitle: "Süti beállítások",
    save: "Mentés",
    essential: "Szükséges",
    essentialDesc: "A weboldal alapvető működéséhez szükséges sütik. Nem kapcsolhatók ki.",
    analytics: "Analitika",
    analyticsDesc: "Segítenek megérteni, hogyan használják a weboldalt a látogatók (Google Analytics).",
    marketing: "Marketing",
    marketingDesc: "Személyre szabott hirdetések megjelenítéséhez használt sütik.",
    alwaysOn: "Mindig aktív",
    ariaLabel: "Süti hozzájárulás",
    ariaSettingsLabel: "Süti beállítások panel",
  },
  en: {
    message:
      "This website uses cookies to improve your experience.",
    acceptAll: "Accept",
    rejectNonEssential: "Decline",
    settings: "Settings",
    settingsTitle: "Cookie Settings",
    save: "Save",
    essential: "Essential",
    essentialDesc: "Required for the website to function. Cannot be disabled.",
    analytics: "Analytics",
    analyticsDesc: "Help us understand how visitors use the website (Google Analytics).",
    marketing: "Marketing",
    marketingDesc: "Used to display personalized advertisements.",
    alwaysOn: "Always on",
    ariaLabel: "Cookie consent",
    ariaSettingsLabel: "Cookie settings panel",
  },
} as const;

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * GDPR-compliant cookie consent banner with granular settings.
 *
 * Three interaction modes:
 * 1. **Accept all** — enables all cookie categories.
 * 2. **Reject non-essential** — only essential cookies remain.
 * 3. **Settings** — opens a panel for per-category toggling.
 *
 * Consent is stored as structured JSON in localStorage and a custom
 * `consent-updated` event is dispatched on `window` so the Analytics
 * component can react.
 */
const CookieConsent = () => {
  const { lang } = useLanguage();
  const text = translations[lang];

  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Granular toggles (settings panel)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  useEffect(() => {
    const consent = getConsent();
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    saveConsent(true, true);
    setVisible(false);
    setShowSettings(false);
  }, []);

  const handleRejectNonEssential = useCallback(() => {
    saveConsent(false, false);
    setVisible(false);
    setShowSettings(false);
  }, []);

  const handleSaveSettings = useCallback(() => {
    saveConsent(analyticsEnabled, marketingEnabled);
    setVisible(false);
    setShowSettings(false);
  }, [analyticsEnabled, marketingEnabled]);

  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={text.ariaLabel}
      aria-modal="false"
      className="fixed bottom-0 left-0 right-0 z-50 bg-dark-navy text-primary-foreground shadow-2xl border-t border-primary-foreground/10"
    >
      <div className="container mx-auto p-4">
        {/* ── Main banner ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/90 max-w-2xl">
            {text.message}
          </p>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleRejectNonEssential}
              className="px-4 py-2 text-sm font-semibold border border-primary-foreground/30 rounded hover:bg-primary-foreground/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {text.rejectNonEssential}
            </button>
            <button
              onClick={toggleSettings}
              aria-expanded={showSettings}
              aria-controls="cookie-settings-panel"
              className="px-4 py-2 text-sm font-semibold border border-primary-foreground/30 rounded hover:bg-primary-foreground/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {text.settings}
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm font-semibold bg-gold text-accent-foreground rounded hover:bg-gold/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {text.acceptAll}
            </button>
          </div>
        </div>

        {/* ── Settings panel ──────────────────────────────────── */}
        {showSettings && (
          <div
            id="cookie-settings-panel"
            role="region"
            aria-label={text.ariaSettingsLabel}
            className="mt-4 pt-4 border-t border-primary-foreground/10"
          >
            <h3 className="text-base font-semibold mb-3">{text.settingsTitle}</h3>

            <ul className="space-y-3" role="list">
              {/* Essential — always on */}
              <li className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{text.essential}</p>
                  <p className="text-xs text-primary-foreground/60">{text.essentialDesc}</p>
                </div>
                <span className="text-xs text-primary-foreground/50 shrink-0 mt-0.5">
                  {text.alwaysOn}
                </span>
              </li>

              {/* Analytics */}
              <li className="flex items-start justify-between gap-4">
                <div>
                  <label htmlFor="consent-analytics" className="text-sm font-medium cursor-pointer">
                    {text.analytics}
                  </label>
                  <p className="text-xs text-primary-foreground/60">{text.analyticsDesc}</p>
                </div>
                <input
                  id="consent-analytics"
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-primary-foreground/30 accent-gold cursor-pointer focus-visible:ring-2 focus-visible:ring-gold"
                  aria-describedby="consent-analytics-desc"
                />
                <span id="consent-analytics-desc" className="sr-only">{text.analyticsDesc}</span>
              </li>

              {/* Marketing */}
              <li className="flex items-start justify-between gap-4">
                <div>
                  <label htmlFor="consent-marketing" className="text-sm font-medium cursor-pointer">
                    {text.marketing}
                  </label>
                  <p className="text-xs text-primary-foreground/60">{text.marketingDesc}</p>
                </div>
                <input
                  id="consent-marketing"
                  type="checkbox"
                  checked={marketingEnabled}
                  onChange={(e) => setMarketingEnabled(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-primary-foreground/30 accent-gold cursor-pointer focus-visible:ring-2 focus-visible:ring-gold"
                  aria-describedby="consent-marketing-desc"
                />
                <span id="consent-marketing-desc" className="sr-only">{text.marketingDesc}</span>
              </li>
            </ul>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 text-sm font-semibold bg-gold text-accent-foreground rounded hover:bg-gold/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {text.save}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;
