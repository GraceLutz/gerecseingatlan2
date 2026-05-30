// ============================================================
// Public apply layer for live-edit auto-overrides.
// Reads "auto.*" content blocks for the current page and writes them
// onto the matching DOM elements (by stable id) AFTER React renders.
// A MutationObserver re-applies on re-render; runs on every route.
// App-level singleton (mounted in App.tsx next to ChatWidget).
// ============================================================
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useContent } from "@/contexts/ContentContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { normalizeContent } from "@/types/content";
import type { Lang } from "@/types/content";
import { buildIdMap } from "@/lib/autoEdit";

/** Current page's content path: drop the optional /en prefix, default "/". */
function pagePathFromLocation(pathname: string): string {
  let p = pathname.replace(/^\/en(?=\/|$)/, "");
  if (!p.startsWith("/")) p = "/" + p;
  return p === "" ? "/" : p;
}

const HTML_RE = /<(?:p|h[1-6]|div|span|ul|ol|li|strong|em|a|br)\b/i;

export default function AutoEditApply() {
  const location = useLocation();
  const { getPageContent, fetchPageContent } = useContent();
  const { lang } = useLanguage();

  const pagePath = pagePathFromLocation(location.pathname);

  // Make sure this page's content (including auto.* blocks) is loaded.
  useEffect(() => {
    fetchPageContent(pagePath);
  }, [pagePath, lang, fetchPageContent]);

  const pageData = getPageContent(pagePath);
  const blocks = pageData.blocks;

  useEffect(() => {
    // In edit mode the bridge owns the DOM — don't fight it.
    if (new URLSearchParams(window.location.search).get("editMode") === "1") return;

    const autoBlocks = Object.entries(blocks).filter(([k]) => k.startsWith("auto."));
    if (autoBlocks.length === 0) return;

    let raf = 0;
    const apply = () => {
      const map = buildIdMap();
      for (const [key, block] of autoBlocks) {
        const el = map.get(key) as HTMLElement | undefined;
        if (!el) continue; // structure drifted → skip gracefully, never break the page
        const value = normalizeContent(block.content, lang as Lang);
        if (value == null) continue;
        if (HTML_RE.test(value)) {
          if (el.innerHTML !== value) el.innerHTML = value;
        } else if (el.textContent !== value) {
          el.textContent = value;
        }
      }
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };

    schedule();
    const root = document.querySelector("main") || document.body;
    const observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [blocks, lang]);

  return null;
}
