import { describe, it, expect, beforeEach, vi } from "vitest";
import { initGA4, updateConsent, trackEvent, AnalyticsEvent } from "@/lib/analytics";

describe("analytics", () => {
  beforeEach(() => {
    // Reset DOM and global state
    document.head.querySelectorAll("script").forEach((s) => s.remove());
    window.dataLayer = [];
    delete (window as Record<string, unknown>).gtag;

    // Reset module-level scriptLoaded flag by re-importing
    vi.resetModules();
  });

  describe("initGA4", () => {
    it("does nothing when VITE_GA4_ID is empty", async () => {
      const { initGA4: init } = await import("@/lib/analytics");
      init();
      expect(document.head.querySelectorAll("script[src*='gtag']")).toHaveLength(0);
    });
  });

  describe("trackEvent", () => {
    it("does nothing when GA4_ID is empty", () => {
      trackEvent(AnalyticsEvent.PROPERTY_VIEW, { propertyId: "GI-001" });
      // Should not throw, and dataLayer may or may not exist
    });
  });

  describe("updateConsent", () => {
    it("does nothing when GA4_ID is empty", () => {
      updateConsent(true, false);
      // Should not throw
    });
  });

  describe("AnalyticsEvent", () => {
    it("has all expected event names", () => {
      expect(AnalyticsEvent.PROPERTY_VIEW).toBe("property_view");
      expect(AnalyticsEvent.CONTACT_FORM_SUBMIT).toBe("contact_form_submit");
      expect(AnalyticsEvent.PHONE_CLICK).toBe("phone_click");
      expect(AnalyticsEvent.EMAIL_CLICK).toBe("email_click");
      expect(AnalyticsEvent.MAP_INTERACTION).toBe("map_interaction");
    });
  });
});
