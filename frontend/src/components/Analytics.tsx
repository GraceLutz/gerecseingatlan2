import { useEffect } from "react";
import { initGA4, updateConsent } from "@/lib/analytics";
import { getConsent, type ConsentState } from "@/components/CookieConsent";

/**
 * Side-effect component that initialises Google Analytics 4 and
 * reacts to consent changes from the cookie banner.
 *
 * Renders nothing (`null`). Place in Layout.tsx or App.tsx so it
 * mounts once for the lifetime of the application.
 *
 * Flow:
 * 1. On mount: call `initGA4()` (sets consent mode default to denied).
 * 2. Read existing consent from localStorage — if analytics was previously
 *    granted, immediately update consent to granted.
 * 3. Listen for the `consent-updated` custom event (dispatched by the
 *    CookieConsent component) and update GA4 consent accordingly.
 */
const Analytics = () => {
  useEffect(() => {
    // Initialise GA4 with consent mode v2 (default: denied)
    initGA4();

    // Apply any previously stored consent
    const existing = getConsent();
    if (existing) {
      updateConsent(existing.analytics, existing.marketing);
    }

    // React to future consent changes
    const handleConsentUpdate = (event: Event) => {
      const detail = (event as CustomEvent<ConsentState>).detail;
      updateConsent(detail.analytics, detail.marketing);
    };

    window.addEventListener("consent-updated", handleConsentUpdate);
    return () => {
      window.removeEventListener("consent-updated", handleConsentUpdate);
    };
  }, []);

  return null;
};

export default Analytics;
