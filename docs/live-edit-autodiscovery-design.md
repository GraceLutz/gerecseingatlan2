# Live-edit auto-discovery — design

**Status:** approved 2026-05-30. Builds on the existing admin visual editor
(`frontend/src/pages/admin/ContentPage.tsx` iframe + `editorBridge.ts` +
`InlineEditPanel.tsx` + `content_blocks` DB). Mirrors aiiskola's live-edit
(auto-tag every text node, save to a shared DB, apply on every public load) —
but extended to images + links.

## Goal
In edit mode the admin can click **any** text / image / link (not only the
pre-wired `[data-editable]` blocks) and edit it. Changes persist to the shared
`content_blocks` DB so **all visitors** see them — exactly like aiiskola.

## Storage (decided: DB, like aiiskola)
Reuse `content_blocks` (no migration). Auto-discovered elements are stored under
a namespaced key: `block_key = "auto:<stableId>"`, `page_path = <page>`.
- Text  → bilingual JSON `{"hu":"…","en":"…"}` (contentType `json`), like wired blocks.
- Image → `{"src":"/uploads/…"}` (contentType `json`).
- Link  → `{"href":"…","label":{"hu":"…","en":"…"}}` (contentType `json`).
Written through the existing `PATCH /api/admin/content/by-path`, read through the
existing `GET /api/content/<pagePath>?lang=` (returns all blocks incl. `auto:*`).

## Stable ID (must match between tagging and apply)
A **DOM-path** from the page root using tag + nth-of-type, sanitized to DB/URL-safe
chars (alphanumeric, `.`, `-`), e.g. `auto:main.section-2.div-1.p-3`. Computed by a
**shared module** `frontend/src/lib/autoEdit.ts` used by BOTH the editor bridge
(tagging) and the public apply layer (lookup) so IDs always line up.
Failure mode: if an override's element is not found (structure drifted) it is
**skipped** — the page renders the original, never breaks.

## Components
1. `frontend/src/lib/autoEdit.ts` (NEW) — selectors + `computeStableId(el)` +
   `discoverEditables(root)`; skips `[data-editable]` (wired) and
   `[data-no-autoedit]` (dynamic regions) and their descendants.
2. `frontend/src/admin/editorBridge.ts` (EXTEND) — after tagging `[data-editable]`,
   auto-tag remaining text/img/a via autoEdit; send `{blockKey:"auto:…", type, …}`
   on click (type = text|image|link).
3. `frontend/src/pages/admin/content/InlineEditPanel.tsx` (EXTEND) — add **image**
   mode (preview + upload button + URL) and **link** mode (label + href).
4. `frontend/src/components/AutoEditApply.tsx` (NEW, app-level in `App.tsx`) — per
   page reads `auto:*` blocks from `ContentContext`, applies to elements by stable
   ID after render; `MutationObserver` re-applies on re-render; re-runs on route
   change. Skips `[data-editable]`.
5. `backend/server/routes/admin/upload.ts` (NEW) — `POST /api/admin/upload`
   (admin auth + CSRF), validates image (type/size, like staff photo), writes to
   `uploads/`, returns `{url}`. Wired in `server/index.ts`.

## Dynamic regions excluded
Feed-driven property lists/cards get `data-no-autoedit` (unstable indices + come
from the XML feed, not CMS).

## Risks / mitigations
- React re-render overwrites DOM patches → MutationObserver re-applies (debounced).
- Slight flash (original → override) → observer starts immediately.
- ID drift on structure change → graceful skip (no break).
- SEO: applied client-side (same as the existing EditableText/SPA model).

## Out of scope (YAGNI)
No rewrite of the 239 wired EditableText blocks; no build-time transform; no edits
to feed-driven dynamic content.

## Verify
- Edit a non-wired heading in admin → saved → appears on the public page (reload).
- Image upload + swap; link href edit. Drift → graceful skip. Frontend build green.
