# Admin Dashboard – gerecseingatlan.hu

## STACK & CONVENTIONS (applies to all agents)

- **Frontend:** Vite + React, TypeScript, existing project
- **Backend:** Express, TypeScript, existing `/server` folder
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** session-based, httpOnly cookies, bcrypt (12 rounds)
- **Validation:** Zod on every endpoint
- **Language:** ALL UI text in Hungarian
- **Styling:** match existing public site design
- **Routes:** admin pages under `/admin/*`, admin APIs under `/api/admin/*`
- **Tables:** snake_case, UUID primary keys, `created_at` + `updated_at` on every table
- **Security:** CSRF tokens on POST/PATCH/DELETE, auth middleware on all `/admin/*` and `/api/admin/*` routes, rate limiting on login
- **Audit:** every admin action writes to `activity_log` table
- **Secrets:** `.env.local` only, never in code or git

---

## WHAT TO BUILD

### 1. Authentication & Users

- Login page `/admin/login` with email + password
- Session-based auth, 24h expiry, secure cookies
- Roles: `admin` (full), `editor` (content + properties), `viewer` (read-only)
- First admin seeded from env vars (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
- `/admin/users` page: list, create, edit role, deactivate, delete
- New user creation: generates temp password + sends welcome email
- Welcome email in Hungarian with login URL and credentials

### 2. Email Infrastructure

- Nodemailer + SMTP, config from env (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`)
- From: `"Gerecse Ingatlan <noreply@gerecseingatlan.hu>"`
- Hungarian HTML + plain text templates
- Templates: `welcome_new_user`, `password_reset`, `newsletter_confirmation`

### 3. Inline Content Editor (Full Site Rewrite)

- Table `content_blocks`: `id`, `page_path`, `block_key`, `content`, `content_type` (text/html/markdown), `updated_at`, `updated_by`, `UNIQUE(page_path, block_key)`
- Table `content_block_versions`: keeps last 10 versions per block
- `<EditableText>` React component:
  - Fetches from `/api/content/:pagePath` on mount (cached in context)
  - Public view: renders content normally
  - When admin logged in: hover outline + pencil icon → inline contenteditable or modal with TipTap rich text editor
  - Auto-save draft every 10s, manual save on blur/button
- Replace ALL hardcoded texts on public site with `<EditableText>`:
  - Headings, paragraphs, button labels, menu items, footer
  - Hero sections, `/bemutatkozas` content
  - Meta titles/descriptions
- Seed script migrates current hardcoded texts into `content_blocks`
- `/admin/content` page: list all blocks grouped by page, search, direct edit, version history, rollback button

### 4. Newsletter Subscribers

- Public signup form in footer: email (required), name (optional), GDPR checkbox `"Hozzájárulok az adataim kezeléséhez..."`
- Double opt-in: confirmation email with token link
- Table `newsletter_subscribers`: `id`, `email UNIQUE`, `name`, `status` (pending/confirmed/unsubscribed), `confirmation_token`, `confirmed_at`, `subscribed_at`, `unsubscribed_at`, `ip_address`, `user_agent`
- `/admin/newsletter` page:
  - Table: email, name, status badge, subscribed date, confirmed date
  - Search, filter by status and date range
  - CSV export button
  - Bulk delete
  - Summary at top: `"Összesen X feliratkozó (Y megerősített)"`
  - GDPR `"Töröl"` button per subscriber (hard delete)

### 5. Staff Management

- Table `staff`: `id`, `name`, `email`, `phone`, `role_title` (e.g. `"Ingatlanközvetítő"`), `photo_url`, `bio`, `active`, `user_id` (FK users, nullable), `created_at`, `updated_at`
- `/admin/munkatarsak` page:
  - List of staff cards/table
  - `"Új munkatárs"` modal: name, email, phone, role_title, photo upload, bio, checkbox `"Dashboard hozzáférés"` (creates linked user + sends welcome email)
  - Edit, deactivate, delete per staff
  - Photo upload to `/uploads/staff/` (or cloud storage if configured)
- Public `/munkatarsak` page: active staff with photos, names, titles, contact info

### 6. Calendar

- Table `calendar_events`: `id`, `title`, `description`, `start_datetime`, `end_datetime`, `staff_id` FK, `created_by` FK users, `event_type` (ingatlan_megtekintes / ugyfel_talalkozo / belso_megbeszeles / szabadsag / egyeb), `location`, `property_id` (nullable, references XML feed property id), `color`, `created_at`, `updated_at`
- `/admin/naptar` page using FullCalendar.io:
  - Month/week/day views
  - Click empty slot → create event modal
  - Click event → edit/delete modal
  - Sidebar filter: show/hide per staff member (each has assigned color)
  - Drag & drop to reschedule
  - Generate `.ics` feed per staff: `GET /api/calendar/ics/:staffId` (for Google Calendar / iOS subscription)

### 7. Dashboard Overview (`/admin/dashboard`)

- Stats cards: active properties (from XML feed), newsletter subscribers count, today's calendar events, active staff count
- Recent activity feed:
  - Last 5 newsletter subscribers
  - Today's and tomorrow's calendar events
  - Last 5 content edits

### 8. Sidebar Navigation

Dashboard / Ingatlanok / Tartalom / Munkatársak / Naptár / Hírlevél / Felhasználók (admin only) / Beállítások / Kijelentkezés

---

## EXECUTION

### Phase A (must complete first, single agent)

Database setup, Drizzle migrations, `users` + `sessions` + `activity_log` tables, login/logout endpoints, auth middleware, `/admin/login` page, admin layout shell with sidebar. Seed first admin from env.

### Phase B onwards (parallel, after Phase A complete)

- **Agent B:** User Management + Email Infrastructure (sections 1–2)
- **Agent C:** Inline Content Editor (section 3)
- **Agent D:** Newsletter (section 4)
- **Agent E:** Staff + Calendar (sections 5–6)
- **Agent F:** Dashboard Overview + Activity Log + Polish (sections 7–8)

### Each agent

1. Reads this full spec for shared context
2. Builds only their assigned section
3. Uses Phase A auth middleware + shared Drizzle schema
4. Commits migrations to `/server/db/migrations/`
5. Documents their API endpoints in comments
6. Reports back with: files changed, new endpoints, new tables, any blockers

### Integration agent at the end

- Verifies all sections work together
- Resolves any schema conflicts
- Ensures sidebar links to all new pages
- Final Hungarian translation review
- Full end-to-end test of admin flow
