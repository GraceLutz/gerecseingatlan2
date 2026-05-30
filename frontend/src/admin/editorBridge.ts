/**
 * Visual Editor Bridge — runs inside the iframe when ?editMode=1.
 * Adds hover highlights and click-to-edit behavior on [data-editable] elements.
 * Communicates with the parent admin panel via postMessage.
 */

import { discoverEditables, computeStableId, kindOf } from "@/lib/autoEdit";

const HIGHLIGHT_CLASS = "ve-highlight";
const ACTIVE_CLASS = "ve-active";

let activeElement: HTMLElement | null = null;

function injectStyles() {
  const style = document.createElement("style");
  style.id = "ve-bridge-styles";
  style.textContent = `
    [data-editable] {
      cursor: pointer !important;
      transition: outline 0.15s ease, box-shadow 0.15s ease;
    }
    [data-editable].${HIGHLIGHT_CLASS} {
      outline: 2px dashed rgba(59, 130, 246, 0.6) !important;
      outline-offset: 3px;
    }
    [data-editable].${ACTIVE_CLASS} {
      outline: 2px solid rgba(59, 130, 246, 1) !important;
      outline-offset: 3px;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important;
    }
    body.ve-edit-mode * {
      user-select: none;
    }
    body.ve-edit-mode [data-editable] {
      user-select: text;
    }
  `;
  document.head.appendChild(style);
}

function getEditableInfo(el: HTMLElement) {
  const hasRichContent = el.querySelector("*") !== null;
  return {
    blockKey: el.getAttribute("data-editable")!,
    pagePath: el.getAttribute("data-page") || "/",
    content: hasRichContent ? el.innerHTML : (el.textContent || ""),
    tagName: el.tagName.toLowerCase(),
    rect: el.getBoundingClientRect(),
  };
}

function setupListeners() {
  document.body.classList.add("ve-edit-mode");

  document.addEventListener("mouseover", (e) => {
    const target = (e.target as HTMLElement).closest("[data-editable]") as HTMLElement | null;
    if (target && target !== activeElement) {
      target.classList.add(HIGHLIGHT_CLASS);
    }
  });

  document.addEventListener("mouseout", (e) => {
    const target = (e.target as HTMLElement).closest("[data-editable]") as HTMLElement | null;
    if (target && target !== activeElement) {
      target.classList.remove(HIGHLIGHT_CLASS);
    }
  });

  document.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement).closest("[data-editable]") as HTMLElement | null;
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    if (activeElement) {
      activeElement.classList.remove(ACTIVE_CLASS);
    }
    activeElement = target;
    target.classList.remove(HIGHLIGHT_CLASS);
    target.classList.add(ACTIVE_CLASS);

    const info = getEditableInfo(target);
    window.parent.postMessage({
      type: "ve:element-clicked",
      payload: info,
    }, window.location.origin);
  });

  // Prevent all default navigation in edit mode
  document.addEventListener("click", (e) => {
    const link = (e.target as HTMLElement).closest("a");
    if (link && !link.hasAttribute("data-editable")) {
      e.preventDefault();
    }
  }, true);
}

function handleParentMessages(event: MessageEvent) {
  if (event.origin !== window.location.origin) return;
  if (!event.data || typeof event.data.type !== "string") return;

  switch (event.data.type) {
    case "ve:update-content": {
      const { blockKey, pagePath, content } = event.data.payload;
      const selector = `[data-editable="${CSS.escape(blockKey)}"][data-page="${CSS.escape(pagePath)}"]`;
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) {
        const looksLikeHtml = /<(?:p|h[1-6]|div|span|ul|ol|li|strong|em|a|br)\b/i.test(content);
        if (looksLikeHtml) {
          el.innerHTML = content;
        } else {
          el.textContent = content;
        }
      }
      break;
    }
    case "ve:deselect": {
      if (activeElement) {
        activeElement.classList.remove(ACTIVE_CLASS);
        activeElement = null;
      }
      break;
    }
    case "ve:navigate": {
      const { path } = event.data.payload;
      window.location.href = path + "?editMode=1";
      break;
    }
  }
}

/** Current page's content path: drop the optional /en prefix, default "/". */
function currentPagePath(): string {
  let p = window.location.pathname.replace(/^\/en(?=\/|$)/, "");
  if (!p.startsWith("/")) p = "/" + p;
  return p === "" ? "/" : p;
}

/**
 * Auto-tag un-wired TEXT elements with data-editable="auto.<stableId>" so the
 * existing hover/click logic treats them as editable. (Images/links: later.)
 */
function autoTag() {
  const pagePath = currentPagePath();
  for (const el of discoverEditables()) {
    if (kindOf(el) !== "text") continue;
    const id = computeStableId(el);
    if (!id) continue;
    el.setAttribute("data-editable", id);
    el.setAttribute("data-page", pagePath);
  }
}

let tagTimer: number | undefined;
function scheduleAutoTag() {
  if (tagTimer) window.clearTimeout(tagTimer);
  tagTimer = window.setTimeout(autoTag, 300);
}

/** React renders/navigates asynchronously — re-tag whenever DOM structure changes. */
function watchForAutoTag() {
  const observer = new MutationObserver(() => scheduleAutoTag());
  observer.observe(document.body, { childList: true, subtree: true });
}

function init() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("editMode") !== "1") return;

  injectStyles();
  setupListeners();
  watchForAutoTag();
  scheduleAutoTag();
  window.addEventListener("message", handleParentMessages);

  // Notify parent that bridge is ready
  window.parent.postMessage({ type: "ve:ready", payload: { url: window.location.pathname } }, window.location.origin);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

export {};
