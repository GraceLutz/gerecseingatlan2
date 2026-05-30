# CMS VISUAL EDITOR — STABILIZATION AND UNIFICATION

The /admin/tartalom visual editor has multiple critical issues that prevent reliable content editing. The goal of this sprint is to fully stabilize and unify the editor: every text on every page must be editable through one consistent system, edits must save reliably, and the editing UX must be simple word-processor-like with no HTML knowledge required from the admin.

## Phase 1 — Diagnostic report

Audit the current editor end to end. Identify and document every failure mode found:

- Pages where text cannot be edited at all
- Pages where edits appear to save but do not persist after reload
- Pages where the rendered output does not match what was saved
- Inconsistent block structures across pages where the same kind of content uses different schemas
- Any state, binding, or backend sync issues observed

For each issue document the affected component, exact reproduction steps, and the root cause if identifiable. Deliver this as a short technical report before writing any fix.

## Phase 2 — Bugfix implementation

Fix every critical issue identified in phase 1:

- Every text element on every public page must be click-editable from /admin/tartalom
- Edits must update the frontend state immediately (no need to refresh to see the change)
- Saves must persist to the database via the existing CMS API
- After a hard refresh the edit must still be visible on the public site
- Both Hungarian and English variants must save independently and correctly

## Phase 3 — Unified content model

Eliminate all inconsistency in how content blocks are stored and rendered. Define a single canonical content model that every page uses:

- Same JSON schema for every text field across every page
- Same block_key naming convention everywhere
- Same content_type values
- Same fallback behavior when a value is missing

Refactor any page or component that uses a different model to align with the canonical structure. No inline hacks or one-off solutions per page. If a page needs a special block type, add it to the canonical schema, do not work around it.

## Phase 4 — Editor UX redesign

Replace the current HTML source editor with a lightweight rich text editor that gives admins a Word-like experience without exposing raw HTML.

Required features:

- Plain text input that feels like a textarea
- Bold, italic, bullet list, numbered list, line break
- Keyboard shortcuts (Ctrl+B for bold, Ctrl+I for italic)
- No raw HTML input — admins should never see or type tags

Recommended library: TipTap, Slate, or Quill — pick whichever integrates cleanest with the existing React codebase.

The editor must work for paragraph blocks, list blocks, and any other rich text content. Plain text blocks (titles, subtitles, button labels) keep a simple text input.

## Phase 5 — Data layer

Switch the storage format from raw HTML to structured JSON-based rich text matching whichever editor library is chosen. The renderer on the public site reads the structured format and outputs valid HTML with the same styling that exists today.

Migrate existing content from HTML to the structured format as part of the rollout. No content should be lost. Verify that every existing block round-trips correctly: load it, save it without changes, and the rendered output is identical.

## Phase 6 — Testing

Manual test checklist for every page in /admin/tartalom:

- Click any text block → editor opens
- Make a change → live preview updates immediately
- Save → success toast appears
- Reload the page → change is still visible
- Switch to other language → other language unchanged
- Switch back → original change still visible

Edge cases to verify:

- Empty content blocks render correctly with placeholder
- Very long text saves and renders without breaking layout
- Mixed formatting (bold + italic + list) saves and renders correctly
- Concurrent edits from two admin sessions do not corrupt data

## Phase 7 — Documentation

Write a short developer doc covering:

- Editor architecture and which library is used
- The canonical content data model
- How to add a new editable field to a page
- How the save flow works end to end
- How the public renderer reads the data and produces HTML

## Definition of done

Every text on every public page is reliably click-editable from /admin/tartalom in both Hungarian and English. Edits save instantly, persist across reloads, and render correctly on the public site. The editor UX feels like Word — no HTML knowledge needed. The codebase has one consistent data model with no per-page hacks. A new admin can edit any text on the site within 30 seconds of opening the editor without reading documentation.
