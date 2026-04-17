/**
 * Google Analytics 4 utility with GDPR consent mode v2 support.
 *
 * GA4 measurement ID is read from `import.meta.env.VITE_GA4_ID`.
 * Tracking only fires after the user grants analytics consent via the
 * cookie consent banner (consent mode v2).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const GA4_ID: string = import.meta.env.VITE_GA4_ID ?? "";

/** Whether the gtag script has already been injected into the DOM. */
let scriptLoaded = false;

/**
 * Push a command onto the Google Tag Manager data layer.
 * This is the low-level helper used by all public functions.
 */
function gtag(...args: unknown[]): void {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

/**
 * Initialise GA4 with consent mode v2.
 *
 * - Injects the gtag.js script tag (once).
 * - Sets the *default* consent state to **denied** for both analytics and
 *   ad storage so no data is collected before the user opts in.
 * - Configures the GA4 measurement ID.
 *
 * Safe to call multiple times — the script is only loaded once.
 */
export function initGA4(): void {
  if (!GA4_ID) return;
  if (scriptLoaded) return;
  scriptLoaded = true;

  // Expose gtag globally
  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args);
  };

  // Default consent: deny everything until the user opts in
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });

  // Load the gtag.js script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", GA4_ID, {
    send_page_view: true,
  });
}

/**
 * Update the consent state after the user interacts with the cookie banner.
 *
 * @param analytics - Whether the user granted analytics consent.
 * @param marketing - Whether the user granted marketing consent.
 */
export function updateConsent(analytics: boolean, marketing: boolean): void {
  if (!GA4_ID) return;

  window.gtag("consent", "update", {
    analytics_storage: analytics ? "granted" : "denied",
    ad_storage: marketing ? "granted" : "denied",
    ad_user_data: marketing ? "granted" : "denied",
    ad_personalization: marketing ? "granted" : "denied",
  });
}

// ─── Pre-defined event names ────────────────────────────────────────────────

/** Standard event names used across the site. */
export const AnalyticsEvent = {
  PROPERTY_VIEW: "property_view",
  CONTACT_FORM_SUBMIT: "contact_form_submit",
  PHONE_CLICK: "phone_click",
  EMAIL_CLICK: "email_click",
  MAP_INTERACTION: "map_interaction",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

/**
 * Track a custom GA4 event.
 *
 * @param name   - The event name (use {@link AnalyticsEvent} constants where possible).
 * @param params - Optional key/value pairs attached to the event.
 */
export function trackEvent(
  name: string,
  params?: Record<string, string>,
): void {
  if (!GA4_ID) return;

  window.gtag("event", name, params);
}
