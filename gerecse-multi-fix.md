# Gerecse Ingatlan – Multiple Fixes and Improvements

> **Task Type:** Bug fixes + feature improvements
> **Tech Stack:** Node.js + Express + TypeScript + React/Vite + Supabase
> **Priority:** High — production website issues

---

## OVERVIEW

This document describes **five separate issues** that need to be fixed on the Gerecse Ingatlan website. Each section is independent, but they should all be addressed in the same deployment.

1. AI chatbot context awareness (current page detection)
2. AI chatbot suggested questions (replace with natural, useful questions)
3. "Rólunk" page — Team section duplicate/wrong record on production
4. "Ingatlan értékesítés és bérbeadás" service page — split into separate sub-pages
5. Google Maps API key configured but not working

---

## 1. AI CHATBOT — PAGE-AWARE CONTEXT DETECTION

### Problem
When the user asks a question like *"Ez a ház jó-e szerinted?"* or *"Megfelelne nekem?"*, the chatbot doesn't know which property the user is currently viewing. It can only answer specifically when in PROPERTY DETAIL mode (URL `/ingatlan/:id`), but not when the user is browsing listing pages or detail pages and asks about "this" or "that" property.

### Required Fix

The frontend ChatWidget must **always send the current URL path** to the backend, so the LLM can detect contextually which property/page the user is referring to.

#### Frontend changes (ChatWidget component)

```typescript
import { useLocation } from "react-router-dom";

function ChatWidget() {
  const location = useLocation();
  const currentPath = location.pathname;
  const propertyId = currentPath.match(/^(?:\/en)?\/ingatlan\/(\d+)/)?.[1];

  async function sendMessage(message: string) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId,             // Property ID if on a property page
        currentPath,            // NEW: Always include current URL path
        userMessage: message,
        conversationHistory,
      }),
    });
    return await response.json();
  }
  // ...
}
```

#### Backend changes (`server/services/gemini-chat.ts`)

Add `currentPath` to the context block in BOTH modes. The LLM will use it for ambiguous questions.

```typescript
interface ChatRequest {
  propertyId?: string;
  currentPath?: string;        // NEW
  userMessage: string;
  conversationHistory?: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>;
}

export async function generateChatResponse(req: ChatRequest): Promise<ChatResponse> {
  const feedUrl = process.env.INGATLAN_XML_URL!;
  const feed = await fetchFeed(feedUrl);

  let contextBlock: string;
  const pathInfo = req.currentPath ? `[CURRENT PAGE PATH] ${req.currentPath}` : "";

  if (req.propertyId) {
    // MODE A: Property Detail (unchanged)
    const property = feed.properties.find((p) => p.id === req.propertyId);
    if (!property) {
      return { reply: FALLBACK_ERROR, tokensUsed: 0 };
    }
    contextBlock = `[MODE: PROPERTY DETAIL]
${pathInfo}
[CURRENT PROPERTY DATA]
${JSON.stringify(buildPropertyContext(property), null, 0)}`;
  } else {
    // MODE B: Global Recommendation (unchanged inventory list)
    const compactList = feed.properties.map((p) => ({
      id: p.id,
      url: `https://gerecseingatlan.hu/ingatlan/${p.id}`,
      type: p.subCategory,
      listingType: p.listingType === "elado" ? "Eladó" : "Kiadó",
      city: p.address.city,
      district: p.address.district || "",
      street: p.address.street || "",
      priceFormatted: p.priceFormatted,
      area_m2: p.area,
      rooms: p.totalRooms,
      builtYear: p.builtYear,
      lotSize_m2: p.lotSize,
      shortDescription: (p.description || "").slice(0, 300),
    }));
    contextBlock = `[MODE: GLOBAL RECOMMENDATION]
${pathInfo}
[AVAILABLE PROPERTIES IN INVENTORY — ${feed.properties.length} TOTAL]
${JSON.stringify(compactList, null, 0)}`;
  }
  // ... rest of the function unchanged
}
```

#### System prompt addition

Add this section to the existing system prompt (under "KÉT MŰKÖDÉSI MÓD"):

```
═══════════════════════════════════════════════════════════════
AKTUÁLIS OLDAL ÉSZLELÉS
═══════════════════════════════════════════════════════════════

Mindig kapsz egy [CURRENT PAGE PATH] információt ami megmondja, melyik
oldalon van éppen a látogató. Használd ezt kontextusra:

- Ha a látogató "ez a ház", "ez az ingatlan", "ez", "az" névmásokat 
  használ ÉS a path /ingatlan/{id}-ra mutat:
  → Az aktuális ingatlanra utal, válaszolj az adatlapja alapján.

- Ha a látogató "ez a ház" névmást használ DE a path NEM /ingatlan/{id}:
  → Kérdezz vissza: "Pontosan melyik ingatlanra gondol? Több ingatlan 
     is elérhető kínálatunkban. Adja meg a település nevét vagy 
     keresse fel az adott ingatlan oldalát."

- Path típusok:
  * "/" → Kezdőlap
  * "/ingatlanok" → Ingatlan lista
  * "/ingatlan/{id}" → Konkrét ingatlan részletes oldala
  * "/szolgaltatasok/*" → Szolgáltatás aloldalak
  * "/kapcsolat" → Kapcsolat
  * "/rolunk" → Rólunk
  * "/gyik" → GYIK

- A path információt SOHA ne idézd vissza a felhasználónak közvetlenül.
  Csak belsőleg használd kontextusra.
```

### Test cases

- [ ] User on `/ingatlan/352309` asks "Ez a ház jó nekem?" → Bot evaluates property 352309 based on what user has told earlier in conversation
- [ ] User on `/ingatlanok` asks "Ez a ház jó-e?" → Bot asks for clarification
- [ ] User on `/` asks "Megéri ezt megvenni?" → Bot asks which property
- [ ] User on `/ingatlan/352309` asks "Hány szobás?" → Answers from property 352309 data (no change in behavior)

---

## 2. AI CHATBOT — SUGGESTED QUESTIONS REPLACEMENT

### Problem
The current "suggested questions" or quick-prompts in the chat widget are not user-friendly or natural. Real visitors don't ask in that style.

### Required Fix

Replace the suggested questions with **natural, useful, mode-aware questions** that real visitors would actually ask. The suggestions should differ based on the current mode.

#### In PROPERTY DETAIL mode (when on `/ingatlan/:id`)

Show 3-4 contextual questions like:
```typescript
const propertyDetailSuggestions = [
  "Mennyibe kerül és hány szobás?",
  "Milyen iskolák, boltok vannak a közelben?",
  "Mikor lehet megtekinteni?",
  "Hitelre is megvásárolható?",
];
```

#### In GLOBAL mode (any other page)

Show 3-4 broader questions:
```typescript
const globalSuggestions = [
  "Milyen ingatlanok vannak Dorogon?",
  "Keresek egy 2 szobás lakást",
  "Melyik a legjobb ár-érték arányú ingatlanuk?",
  "Van olyan ingatlan ami CSOK Plusszal vehető?",
];
```

#### Frontend implementation

```typescript
const suggestions = propertyId
  ? [
      "Mennyibe kerül és hány szobás?",
      "Milyen iskolák, boltok vannak a közelben?",
      "Mikor lehet megtekinteni?",
      "Hitelre is megvásárolható?",
    ]
  : [
      "Milyen ingatlanok vannak Dorogon?",
      "Keresek egy 2 szobás lakást",
      "Melyik a legjobb ár-érték arányú ingatlanuk?",
      "Van olyan ingatlan ami CSOK Plusszal vehető?",
    ];

// Render as clickable chips above the input field
// When user clicks a chip, send it immediately as a message
```

### UX details

- Show suggestions only at the START of the conversation (before the user sends their first message)
- Once the user sends any message, hide the suggestions for the rest of the conversation
- The suggestions should be small, light-styled chips/buttons (not large blocks)
- Hungarian-only by default; if the UI is in English mode, use English equivalents

### Test cases

- [ ] Open chat on `/` → see global suggestions
- [ ] Open chat on `/ingatlan/352309` → see property detail suggestions
- [ ] Click any suggestion → message is sent immediately
- [ ] After first message, suggestions disappear

---

## 3. "RÓLUNK" PAGE — FIX TEAM SECTION

### Problem

The "Csapatunk" (Team) section currently has two different states:

**On production website (Image 1 - `gerecseingatlan.hu/rolunk`):**
- Only one team member: **Csonka Szilvia**, labeled as "Ingatlanközvetítő"
- Email shown: `szilvia.bugany@gmail.com` ← **WRONG / OLD email**
- This is the OUTDATED version

**On admin panel / staging (Image 2):**
- Two team members:
  - **Csonka Szilvia** — Iroda vezető — +36706132658 — szilvia.geszting@gmail.com
  - **Komoróczki Éva** — Ingatlanközvetítő — +36205756958 — ekomoroczki@gmail.com
- This is the CORRECT version

### Required Fix

**The production website is not reflecting the admin panel data.** The team data shown on `gerecseingatlan.hu/rolunk` must:

1. Show **exactly two team members** as configured in the admin panel:
   - Csonka Szilvia (Iroda vezető, szilvia.geszting@gmail.com, +36706132658)
   - Komoróczki Éva (Ingatlanközvetítő, ekomoroczki@gmail.com, +36205756958)

2. Remove the outdated single-person card with the `szilvia.bugany@gmail.com` email.

### Investigation steps

The data is likely stored in Supabase (table: `staff` or similar). Check:

```sql
-- Run this in Supabase SQL editor to see current records
SELECT * FROM staff ORDER BY created_at DESC;
```

Possible causes:
- **Old hardcoded data** in the React frontend that overrides the database
- **Cached API response** not being invalidated when admin updates staff
- **Two different database tables** (one for staff, one for old "rólunk" content)
- **Frontend bug** that displays a fallback team member when API returns the wrong shape

### Required code changes

1. **Verify the API endpoint** `/api/staff` returns the correct two team members from the database.

2. **Check the React component** (likely `RolunkPage.tsx` or `TeamSection.tsx`) — remove any hardcoded fallback team data.

3. **Remove cache** if present (e.g., service worker, React Query stale time too high).

4. **Re-deploy** the frontend after the fix.

### Verification

After fix:
- [ ] `gerecseingatlan.hu/rolunk` shows EXACTLY two team member cards
- [ ] Csonka Szilvia card shows: "Iroda vezető" + szilvia.geszting@gmail.com + +36-70-613-2658
- [ ] Komoróczki Éva card shows: "Ingatlanközvetítő" + ekomoroczki@gmail.com + +36-20-575-6958
- [ ] No card with `szilvia.bugany@gmail.com` email
- [ ] Admin panel changes are reflected on production within 60 seconds (or after page reload)

---

## 4. SPLIT "INGATLAN ÉRTÉKESÍTÉS ÉS BÉRBEADÁS" INTO SEPARATE PAGES

### Problem

Currently, the service page `/ingatlan-ertekesites-berbeadas` combines two distinct services into one page:
- **Ingatlan értékesítés** (Property selling)
- **Ingatlan bérbeadás** (Property letting/renting)

These should be **two separate pages** with independent content, both editable via the admin panel.

### Required Fix

#### 4.1 New URL structure

| Old URL | New URLs |
|---------|----------|
| `/ingatlan-ertekesites-berbeadas` | `/ingatlan-ertekesites` (eladás) <br> `/ingatlan-berbeadas` (bérbeadás) |

#### 4.2 Redirect (SEO preservation)

Add a 301 redirect from the old URL so existing links don't break:

```typescript
// server/index.ts
app.get("/ingatlan-ertekesites-berbeadas", (req, res) => {
  res.redirect(301, "/ingatlan-ertekesites");
});
```

#### 4.3 Database schema update

Add a new entry to the content management system. The current schema likely has a `content` or `pages` table with a slug column.

**Migration steps:**

1. Find the existing record:
```sql
SELECT id, slug, title, content FROM content WHERE slug = 'ingatlan-ertekesites-berbeadas';
```

2. Update the existing record to be ONLY about selling:
```sql
UPDATE content
SET slug = 'ingatlan-ertekesites',
    title = 'Ingatlan értékesítés',
    content = '<<NEW SELLING-ONLY CONTENT — extracted from old content>>'
WHERE slug = 'ingatlan-ertekesites-berbeadas';
```

3. Insert a new record for letting:
```sql
INSERT INTO content (slug, title, content, language, ...)
VALUES (
  'ingatlan-berbeadas',
  'Ingatlan bérbeadás',
  '<<NEW LETTING-ONLY CONTENT — extracted from old content>>',
  'hu',
  ...
);
```

4. If the table also has English versions:
```sql
UPDATE content
SET slug = 'property-sales'
WHERE slug = 'property-sales-and-letting';

INSERT INTO content (slug, title, content, language, ...)
VALUES ('property-letting', 'Property Letting', '<<...>>', 'en', ...);
```

#### 4.4 Admin panel update

The admin panel must show **two separate editable sections** instead of one:

- "Ingatlan értékesítés" — slug: `ingatlan-ertekesites`
- "Ingatlan bérbeadás" — slug: `ingatlan-berbeadas`

If the admin panel uses a dynamic list of pages (from the database), no code change needed — the new database record will appear automatically.

If the admin panel uses a hardcoded list of editable sections, update the list:

```typescript
// admin/EditableSections.tsx (or similar)
const EDITABLE_SECTIONS = [
  // ... other sections ...
  { slug: "ingatlan-ertekesites", title: "Ingatlan értékesítés" },   // CHANGED
  { slug: "ingatlan-berbeadas", title: "Ingatlan bérbeadás" },        // NEW
  // ... rest ...
];
```

#### 4.5 Frontend menu update

Update the "Szolgáltatások" dropdown in the main navigation:

```typescript
// Before
const services = [
  { url: "/ingatlan-ertekesites-berbeadas", label: "Ingatlan értékesítés és bérbeadás" },
  // ...
];

// After
const services = [
  { url: "/ingatlan-ertekesites", label: "Ingatlan értékesítés" },
  { url: "/ingatlan-berbeadas", label: "Ingatlan bérbeadás" },
  // ...
];
```

#### 4.6 Sitemap update

If a `sitemap.xml` exists, add the new URLs:
```xml
<url><loc>https://gerecseingatlan.hu/ingatlan-ertekesites</loc></url>
<url><loc>https://gerecseingatlan.hu/ingatlan-berbeadas</loc></url>
```

### Verification

- [ ] `/ingatlan-ertekesites` loads with selling-only content
- [ ] `/ingatlan-berbeadas` loads with letting-only content
- [ ] `/ingatlan-ertekesites-berbeadas` redirects (301) to `/ingatlan-ertekesites`
- [ ] Both pages are editable in the admin panel as separate sections
- [ ] Saving in admin panel updates the live site within 60 seconds
- [ ] "Szolgáltatások" dropdown shows both options separately

---

## 5. GOOGLE MAPS API — NOT WORKING DESPITE KEY SET

### Problem

The `GOOGLE_MAPS_API_KEY` is configured in `.env.local`, but the AI chatbot and/or property pages don't display maps or use Google Maps services. The integration is not functioning.

### Investigation checklist

Run these checks in order:

#### 5.1 Verify the key is loaded by the server

```bash
# On the server
cd /var/www/ingatlan2
grep GOOGLE_MAPS_API_KEY .env.local
```

Should show: `GOOGLE_MAPS_API_KEY=AIza...`

```bash
# Check if it's exposed to PM2
pm2 env ingatlan2 | grep GOOGLE
```

#### 5.2 Verify the key is loaded in the browser (frontend usage)

If the frontend uses the key directly (e.g., for `<MapEmbed />`), the key must be exposed as a `VITE_` prefixed environment variable:

```env
# .env.local
GOOGLE_MAPS_API_KEY=AIzaSyAbc...               # Backend only
VITE_GOOGLE_MAPS_API_KEY=AIzaSyAbc...          # Frontend (Vite needs VITE_ prefix)
```

In React components:
```typescript
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
```

#### 5.3 Verify API restrictions in Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Click on the API key
3. **Application restrictions** — should include:
   - `https://gerecseingatlan.hu/*`
   - `https://www.gerecseingatlan.hu/*`
   - `http://localhost:8080/*` (for dev)
4. **API restrictions** — should enable:
   - Maps JavaScript API
   - Places API (if used)
   - Geocoding API (if used)
   - Maps Embed API (if used)

#### 5.4 Verify billing is enabled

The key won't work without a billing account, even within the $200/month free tier.
- https://console.cloud.google.com/billing
- Ensure the project is linked to an active billing account

#### 5.5 Check browser console for errors

Open `gerecseingatlan.hu/ingatlan/352309` in browser, F12 → Console. Look for:
- `Google Maps JavaScript API error: ApiNotActivatedMapError`
- `Google Maps JavaScript API error: RefererNotAllowedMapError`
- `Google Maps JavaScript API error: InvalidKeyMapError`

Each error has a specific fix in the Google Cloud Console.

### Required fix for AI chatbot map integration

If the AI chatbot was supposed to use Google Maps for neighborhood queries:

**The current implementation likely uses Gemini's built-in Google Search grounding**, not the Maps API. These are separate services:

- **Gemini Google Search grounding** — built into the Gemini 2.5 Flash model, no Maps API key needed, returns text results from Google Search
- **Google Maps Places API** — requires the Maps API key, returns structured data about places (names, addresses, ratings)

If you want the chatbot to use **structured Places data** (more accurate for "is there a Tesco nearby?" type questions), implement Places API as a separate tool:

```typescript
// server/services/places-search.ts
export async function searchNearbyPlaces(query: string, location: string): Promise<PlaceResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return [];
  }
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + " " + location)}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}
```

But for most chatbot use cases, **Gemini's built-in Google Search is sufficient and doesn't need the Maps API**.

### Decide the use case

Ask the project owner:
1. Should the AI chatbot use **Google Maps Places API** (more structured, costs API calls), OR
2. Continue using **Gemini's built-in Google Search** (simpler, no extra cost, less structured)?

If (1) is chosen, the Maps API key needs to be used in `server/services/places-search.ts`.
If (2) is chosen, the Maps API key is only needed for displaying maps on property pages (frontend Vite variable).

### Verification

- [ ] `GOOGLE_MAPS_API_KEY` is set in `.env.local`
- [ ] `VITE_GOOGLE_MAPS_API_KEY` is set in `.env.local` (if frontend uses maps)
- [ ] Server restarted: `pm2 restart ingatlan2`
- [ ] Google Cloud Console: domain restrictions include `gerecseingatlan.hu/*`
- [ ] Google Cloud Console: billing is enabled
- [ ] Browser console shows no Maps API errors
- [ ] If using Maps for chatbot: implement `places-search.ts` and call it from `gemini-chat.ts`

---

## DEPLOYMENT STEPS

After all fixes are implemented:

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Apply database migrations** (Section 4 — service pages split):
   ```sql
   -- Run migration SQL in Supabase SQL editor
   ```

3. **Deploy backend:**
   ```bash
   # Copy files to /var/www/ingatlan2
   pm2 restart ingatlan2
   ```

4. **Verify environment variables:**
   ```bash
   pm2 env ingatlan2 | grep -E "GOOGLE|GEMINI|DATABASE"
   ```

5. **Clear Cloudflare cache** (if needed):
   - Cloudflare → Caching → Purge Everything (only on `gerecseingatlan.hu`)

6. **Run all test cases** from each section.

---

## SUMMARY OF ALL FIXES

| # | Issue | Type | Affected Areas |
|---|-------|------|----------------|
| 1 | Chatbot doesn't know current page | Bug + Feature | Frontend ChatWidget + Backend chat service + System prompt |
| 2 | Suggested questions not user-friendly | UX | Frontend ChatWidget |
| 3 | Rólunk page shows wrong team data | Bug | Database + Frontend RolunkPage |
| 4 | Service page combines two services | Refactor | Database migration + Admin panel + Frontend menu + Routing |
| 5 | Google Maps API not responding | Config / Integration | .env.local + Google Cloud Console + Service implementation |

All five issues should be addressed in the same deployment. Each section is independent and can be developed in parallel by different developers if needed.

---

**END OF SPECIFICATION**

Test thoroughly before declaring done. All Hungarian text in templates must match exactly. Production URL: https://gerecseingatlan.hu
