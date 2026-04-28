# CMS Editor Architecture

## Overview

The Gerecse Ingatlan CMS uses a bilingual content editing system built on React, TipTap, and a PostgreSQL-backed content API. Admins edit content inline on the public site (visual editor at `/admin/tartalom`) or through a list-based editor at `/admin/tartalom-lista`.

### Key architectural decisions

- **Bilingual by default**: all content blocks store `{"hu":"...","en":"..."}` as JSON. The public API extracts the requested language before returning it to the frontend.
- **TipTap WYSIWYG**: rich text editing uses TipTap (ProseMirror-based), replacing the legacy `contentEditable` + `document.execCommand` approach.
- **Optimistic updates**: after a successful save, local state is updated immediately via `ContentContext.updateBlockContent()` — no page reload needed.
- **XSS sanitization**: all HTML rendered via `dangerouslySetInnerHTML` passes through a browser-native sanitizer that strips dangerous tags and event handlers.

## Architecture diagram

```
Admin clicks text block
        |
        v
EditableText (or EditableList / EditableButton)
        |
        v
RichTextEditor (TipTap)          <-- rich mode for HTML, plain input for text
        |
        v
PATCH /api/admin/content/by-path  <-- saves with lang param
        |
        v
mergeBilingualContent()           <-- server merges into bilingual JSON
        |
        v
content_blocks table (PostgreSQL)
        |
        v
GET /api/content/:pagePath?lang=  <-- public API extracts language
        |
        v
ContentContext (useContentBlock)   <-- provides content to components
        |
        v
RichText / EditableText            <-- renders sanitized HTML or plain text
```

## Content data model

### Types (`src/types/content.ts`)

| Type | Description |
|------|-------------|
| `StoredContentType` | DB column values: `"text"`, `"html"`, `"markdown"`, `"json"` |
| `ResolvedContentType` | Public API returns: `"text"`, `"html"`, `"markdown"`, `"json-array"` |
| `Lang` | `"hu"` or `"en"` |
| `BilingualContent` | `{ hu: string; en: string }` |
| `ContentBlockRecord` | Full DB row (id, pagePath, blockKey, content, contentType, timestamps) |
| `ContentBlock` | Public API response per block: `{ content: string; contentType: ResolvedContentType }` |

### Helper functions

- `parseBilingual(content)` — parse bilingual JSON, returns `BilingualContent | null`. Accepts content with only one language key present.
- `createBilingual(hu, en)` — create bilingual JSON string.
- `extractLang(content, lang)` — extract a single language value from bilingual JSON, falling back to Hungarian then raw content.

### DB schema

Table: `content_blocks`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| pagePath | VARCHAR(255) | Page path, e.g. `/`, `/szolgaltatasok/villanyszereles` |
| blockKey | VARCHAR(255) | Block identifier, e.g. `hero.title`, `service.benefits.title` |
| content | TEXT | Content value (bilingual JSON for most blocks) |
| contentType | VARCHAR(50) | Storage type: `json`, `text`, `html`, `markdown` |
| updatedAt | TIMESTAMP | Last update time |
| updatedBy | UUID | User who last edited |
| createdAt | TIMESTAMP | Creation time |

Unique constraint: `(pagePath, blockKey)`

Table: `content_block_versions` — stores up to 10 prior versions per block for rollback.

### Block key conventions

- Dot-notation: `hero.title`, `about.text`, `service.benefits.title`
- Array indices: `service.paragraphs[0]`, `faq.items[2].question`
- Page-scoped: each block belongs to exactly one pagePath

## TipTap integration

### RichTextEditor component (`src/components/RichTextEditor.tsx`)

Reusable WYSIWYG editor wrapping TipTap with two modes:

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | HTML string to edit |
| `onChange` | `(html: string) => void` | Called on every edit |
| `placeholder` | `string?` | Placeholder text |
| `className` | `string?` | Additional CSS classes |
| `mode` | `"rich" \| "plain"` | `rich` shows toolbar; `plain` hides it |

**Rich mode toolbar**: Bold, Italic, Underline, H2, H3, Bullet list, Ordered list, Link, Unlink

**Extensions**: StarterKit (headings 2-3, lists), Underline, Link (noopener noreferrer), Placeholder

**Keyboard shortcuts**: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline) — provided by TipTap.

### Integration in EditableText

- `contentType="html"` or stored `contentType==="html"` -> `RichTextEditor mode="rich"`
- `contentType="text"` -> plain `<input type="text">`

## Save flow

### Step-by-step

1. Admin edits content in TipTap (or text input)
2. `onChange` updates local `draft` state and `draftRef`
3. On save (click checkmark, blur, or autosave interval):
   - `saveContent(draft)` sends `PATCH /api/admin/content/by-path` with:
     ```json
     { "pagePath": "/...", "blockKey": "hero.title", "content": "new text", "contentType": "html", "lang": "hu" }
     ```
4. Server `mergeBilingualContent()` merges the edit into the bilingual JSON:
   - If existing block is `contentType: "json"`, updates only the `lang` key, preserves the other language
   - If block doesn't exist, auto-creates as `{"hu": "new text"}` with `contentType: "json"`
5. Server saves a version snapshot (up to 10 retained)
6. On success, client calls `updateBlockContent(pagePath, blockKey, newContent, contentType)` for optimistic local state update
7. ContentContext patches the block in memory — all components consuming this block re-render

### Autosave

- 10-second interval while editing
- Uses `draftRef` and `contentRef` (not closure-captured values) to avoid stale state
- Timer cleared on unmount or when editing stops

### Error handling

- API errors display Hungarian error messages below the block
- Save-in-progress shows "Mentés..." indicator
- Failed saves do not update local state

## Editable components

### EditableText (`src/components/EditableText.tsx`)

Inline editable text/HTML blocks. Shows an edit pencil button on hover in admin mode.

Props: `pagePath`, `blockKey`, `fallback`, `as` (HTML tag), `className`, `contentType`

### EditableList (`src/components/EditableList.tsx`)

Editable string arrays with per-item CRUD. Saves as bilingual JSON array.

### EditableButton (`src/components/EditableButton.tsx`)

CTA button editor (label + URL). Saves bilingual with `lang` param.

## Public rendering

### RichText (`src/components/RichText.tsx`)

Renders content on the public site. Detects HTML via regex, sanitizes it, and renders via `dangerouslySetInnerHTML`. Plain text renders as `<p>`.

**Sanitization** (`sanitizeHtml`): uses browser-native `DOMParser` to strip:
- Dangerous tags: `script`, `iframe`, `object`, `embed`, `form`, `input`, `textarea`, `select`, `button`, `style`, `link`, `meta`, `base`, `applet`
- Event handler attributes: `onclick`, `onerror`, etc.
- `javascript:` protocol URIs

Preserves all legitimate formatting: `strong`, `em`, `a`, `ul`, `ol`, `li`, `h2`, `h3`, `u`, `p`, `br`

### ContentContext (`src/contexts/ContentContext.tsx`)

React context providing content state:
- `getPageContent(pagePath)` — returns blocks for a page
- `fetchPageContent(pagePath)` — fetches from API
- `updateBlockContent(pagePath, blockKey, content, contentType)` — optimistic update
- `isAdmin` / `setIsAdmin` — admin mode flag

Hooks:
- `useContent()` — access the full context
- `useContentBlock(pagePath, blockKey, fallback)` — get a specific block
- `useContentArray(pagePath, blockKey, fallback)` — get a JSON array block

## Admin editors

### Visual Editor (`/admin/tartalom`)

Iframe-based: loads the public site in an iframe, overlays edit highlights via `editorBridge.ts`, and opens InlineEditPanel when a block is clicked.

**editorBridge.ts**: handles `postMessage` communication between the iframe and the admin shell. The `ve:update-content` handler uses `innerHTML` (not `textContent`) to preserve rich formatting when updating blocks in the iframe.

**InlineEditPanel** (`src/pages/admin/content/InlineEditPanel.tsx`): side panel that opens on block click. Uses TipTap RichTextEditor for non-short text blocks (paragraphs, descriptions). Short text fields (titles, labels) use plain text inputs. Handles bilingual editing with language tabs.

**ContentPage** (`src/pages/admin/ContentPage.tsx`): the visual editor shell. Uses shared `extractLang()` from `src/types/content.ts` for consistent language extraction.

### List Editor (`/admin/tartalom-lista`)

Traditional CRUD list of all content blocks with search, filtering, and version history.

**BlockEditor** (`src/pages/admin/content/BlockEditor.tsx`): full-featured block editor used in the list view. Replaced the legacy HtmlEditor (document.execCommand-based) with TipTap RichTextEditor. Supports bilingual editing (HU/EN tabs), version history, and fullscreen mode. Paragraph array blocks render as a single rich text editor rather than fragmented individual items.

## How to add a new editable field to a page

1. **Choose a block key** following the dot-notation convention: `section.fieldname`

2. **Add the component** in the page file:
   ```tsx
   import EditableText from "@/components/EditableText";

   <EditableText
     pagePath="/your-page"
     blockKey="section.title"
     fallback="Default title text"
     as="h2"
     className="text-2xl font-bold"
     contentType="text"  // or "html" for rich text
   />
   ```

3. **For rich text** (paragraphs with formatting), use `contentType="html"`:
   ```tsx
   <EditableText
     pagePath="/your-page"
     blockKey="section.body"
     fallback="Default paragraph text"
     as="div"
     className="prose"
     contentType="html"
   />
   ```

4. **For read-only rendering** (pages that use RichText directly):
   ```tsx
   import RichText from "@/components/RichText";

   const { content } = useContentBlock("/your-page", "section.body", "fallback");
   <RichText content={content} className="prose" />
   ```

5. **Register the page** in `src/pages/admin/content/pageRegistry.ts` if it's a new page, listing all expected block keys.

6. **Seed initial content** by adding a migration in `server/db/migrations/` that inserts bilingual JSON:
   ```sql
   INSERT INTO content_blocks (page_path, block_key, content, content_type)
   VALUES ('/your-page', 'section.title', '{"hu":"Magyar cím","en":"English title"}', 'json')
   ON CONFLICT (page_path, block_key) DO NOTHING;
   ```

The block auto-creates on first admin edit if it doesn't exist in the DB.

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content/:pagePath?lang=hu\|en` | Public: get all blocks for a page, language-extracted |
| GET | `/api/admin/content/pages` | Admin: list all pages with block counts |
| GET | `/api/admin/content/page/:pagePath` | Admin: get all blocks for a page (raw bilingual) |
| GET | `/api/admin/content/:id` | Admin: get single block with version history |
| PATCH | `/api/admin/content/by-path` | Admin: upsert block by pagePath+blockKey (bilingual merge) |
| PATCH | `/api/admin/content/:id` | Admin: update block by ID |
| POST | `/api/admin/content` | Admin: create new block |
| DELETE | `/api/admin/content/:id` | Admin: delete block |
| POST | `/api/admin/content/:id/rollback/:versionId` | Admin: rollback to a version |
