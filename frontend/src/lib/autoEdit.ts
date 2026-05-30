// ============================================================
// Live-edit auto-discovery — SHARED between the editor bridge
// (tagging, in edit mode) and the public apply layer (lookup).
// Both must compute identical stable IDs, so the logic lives here.
//
// A stable ID is a DOM-path from the page root (<main>) using
// tag + nth-of-type, sanitized to DB/URL-safe chars, e.g.
//   auto.section-2.div-1.p-3
// Stored in content_blocks as block_key = "auto.<path>".
// NOTE: prefix is "auto." (dot, not colon) — the PATCH /by-path blockKey
// validator only allows [a-zA-Z0-9._[]-], so ":" is rejected.
// ============================================================

export type AutoEditKind = "text" | "image" | "link";

/** Block-level text containers we treat as editable units. */
const TEXT_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "li", "blockquote", "figcaption",
  "td", "th", "dt", "dd", "button", "label",
];
const TEXT_SELECTOR = TEXT_TAGS.join(",");

/** The page-content root. Header/footer (heavily wired) stay out of auto-discovery. */
function getRoot(): Element {
  return document.querySelector("main") || document.body;
}

/** Skip wired blocks ([data-editable]) and dynamic regions ([data-no-autoedit]) + their subtrees. */
function isExcluded(el: Element): boolean {
  return !!el.closest("[data-editable],[data-no-autoedit]");
}

export function kindOf(el: Element): AutoEditKind {
  if (el.tagName === "IMG") return "image";
  if (el.tagName === "A") return "link";
  return "text";
}

/** 1-based index of `el` among same-tag siblings. */
function indexAmongType(el: Element): number {
  const parent = el.parentElement;
  if (!parent) return 1;
  let i = 0;
  for (const c of Array.from(parent.children)) {
    if (c.tagName === el.tagName) {
      i++;
      if (c === el) return i;
    }
  }
  return i;
}

/** Stable DOM-path id from the root, or null if `el` is outside the root. */
export function computeStableId(el: Element): string | null {
  const root = getRoot();
  if (el === root || !root.contains(el)) return null;
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur !== root) {
    parts.unshift(`${cur.tagName.toLowerCase()}-${indexAmongType(cur)}`);
    cur = cur.parentElement;
  }
  return "auto." + parts.join(".");
}

/**
 * All auto-editable elements under the root, excluding wired/dynamic ones.
 * Text blocks that contain another block, a link, or an image are skipped so
 * editing their text content can't destroy nested links/images.
 */
export function discoverEditables(): Element[] {
  const root = getRoot();
  const out: Element[] = [];
  const seen = new Set<Element>();
  const add = (el: Element) => {
    if (isExcluded(el) || seen.has(el)) return;
    seen.add(el);
    out.push(el);
  };

  root.querySelectorAll("img").forEach((el) => add(el));
  root.querySelectorAll("a").forEach((el) => {
    if ((el.textContent || "").trim()) add(el); // skip icon/image-only links
  });
  root.querySelectorAll(TEXT_SELECTOR).forEach((el) => {
    if (isExcluded(el)) return;
    if (!(el.textContent || "").trim()) return;
    if (el.querySelector(`${TEXT_SELECTOR},a,img`)) return; // leaf text blocks only
    add(el);
  });

  return out;
}

/** Map of stableId -> element for the current DOM (used by the apply layer). */
export function buildIdMap(): Map<string, Element> {
  const map = new Map<string, Element>();
  for (const el of discoverEditables()) {
    const id = computeStableId(el);
    if (id && !map.has(id)) map.set(id, el);
  }
  return map;
}
