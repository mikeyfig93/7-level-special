# ⬡ FLIGHTLINE — Airman Maintenance Utility

**Offline-first Progressive Web App for Airmen in heavy maintenance.**  
No server. No login. No network required after install.

---

## 1. PRODUCT SUMMARY

FLIGHTLINE is a phone-first military utility dashboard designed for Airmen working flightline and heavy maintenance. It provides immediate access to Julian date tools, Zulu/local time, ICAO and GO81 location lookups, maintenance unit conversions, a tracker for flights/events/EPB accomplishments, and an offline reference library — all stored locally on the device.

**Design philosophy:** Rugged, readable, fast. Military dashboard aesthetic. Works in low light, outdoors, and without internet after first load.

---

## 2. ARCHITECTURE

```
┌─────────────────────────────────────────┐
│              FLIGHTLINE PWA             │
│         (Single-Origin HTML/JS)         │
├─────────────────────────────────────────┤
│  Service Worker (sw.js)                 │
│  → Cache-first offline strategy         │
│  → All static assets cached on install  │
├─────────────────────────────────────────┤
│  IndexedDB (via db.js wrapper)          │
│  → 8 object stores                     │
│  → Full import/export support           │
├─────────────────────────────────────────┤
│  Module Layer (vanilla JS)              │
│  db · julian · convert · tracker        │
│  ops · notes · settings · ui · app      │
└─────────────────────────────────────────┘
```

**Key decisions:**
- Vanilla JS only — zero dependencies, no build step, no npm
- IndexedDB for all persistence (survives app restarts, 50MB+ capacity)
- Service Worker caches all assets on first visit → fully offline thereafter
- No localStorage (IndexedDB is more reliable for structured data)
- GitHub Pages compatible — no server-side code required

---

## 3. FOLDER / FILE STRUCTURE

```
flightline/
├── index.html          ← Single HTML shell, all screens
├── manifest.json       ← PWA manifest (install, icons, shortcuts)
├── sw.js               ← Service Worker (offline caching)
├── css/
│   └── main.css        ← All styles, CSS variables, themes
├── js/
│   ├── db.js           ← IndexedDB wrapper (CRUD, import/export)
│   ├── julian.js       ← Julian date conversion utilities
│   ├── convert.js      ← Maintenance unit converters
│   ├── tracker.js      ← Flight/event/EPB log + export
│   ├── ops.js          ← ICAO/GO81 search, favorites, time zones
│   ├── notes.js        ← Notes, reference library, acronyms
│   ├── settings.js     ← Themes, import/export, DB management
│   ├── ui.js           ← Navigation, clock, timers, toasts
│   └── app.js          ← Boot loader
├── icons/
│   ├── icon-192.png    ← PWA icon (Android home screen)
│   └── icon-512.png    ← PWA splash icon
└── README.md
```

---

## 4. MAJOR COMPONENTS

| Component | File | Purpose |
|-----------|------|---------|
| DB Wrapper | `js/db.js` | IndexedDB CRUD for all 8 stores |
| Julian Tools | `js/julian.js` | AF Julian (YYDDD), DOY, week number, converters |
| Unit Converter | `js/convert.js` | Length, weight, temp, fuel, pressure, torque |
| Tracker | `js/tracker.js` | Log flights/events/EPB, summaries, CSV/JSON export |
| Ops | `js/ops.js` | ICAO lookup, GO81 search, favorites, live TZ grid |
| Notes | `js/notes.js` | Notes editor, reference library, acronym dictionary |
| Settings | `js/settings.js` | Theme, import/export backup, DB record management |
| UI | `js/ui.js` | Nav routing, clock loop, stopwatch, countdown, shift timer |
| App Boot | `js/app.js` | Module init order, SW registration, online/offline status |
| Service Worker | `sw.js` | Cache-first offline strategy for all static assets |

---

## 5. DATA SCHEMA

### `settings` store — `{ key, value }`
```
key: 'theme'       → value: 'default' | 'olive' | 'stealth' | 'red'
key: 'shift_note'  → value: string
```

### `icao` store — `{ code (PK), name, city, country }`
```json
{ "code": "KLSV", "name": "Nellis AFB", "city": "Las Vegas", "country": "NV, USA" }
```

### `go81` store — `{ code (PK), name, unit, address }`
```json
{ "code": "HELN1", "name": "Nellis AFB", "unit": "99th ABW", "address": "Nellis AFB, NV" }
```

### `favorites` store — `{ id (auto), type, code, name, savedAt }`
```json
{ "id": 1, "type": "icao", "code": "KLSV", "name": "Nellis AFB", "savedAt": "2025-01-01T00:00:00Z" }
```

### `tracker` store — `{ id (auto), type, date, description, notes, hours, createdAt }`
```json
{
  "id": 1,
  "type": "flight",
  "date": "2025-01-15",
  "description": "Red Flag 25-1 Sortie Support",
  "notes": "Launched 4x F-16s, recovered all. 0 gripes.",
  "hours": "",
  "createdAt": "2025-01-15T08:30:00Z"
}
```
**type values:** `flight | launch | recovery | event | exercise | inspection | volunteer | epb | other`

### `notes` store — `{ id (auto), title, body, savedAt }`
```json
{ "id": 1, "title": "Shift Brief", "body": "...", "savedAt": "2025-01-01T06:00:00Z" }
```

### `reference` store — `{ id (auto), title, body, tags, savedAt }`
```json
{ "id": 1, "title": "Red X Symbols", "body": "Red X = grounded...", "tags": "forms,781,red x" }
```

### `acronyms` store — `{ id (auto), abbr, def }`
```json
{ "id": 1, "abbr": "FMC", "def": "Fully Mission Capable" }
```

### Export format (full backup)
```json
{
  "settings":  [...],
  "icao":      [...],
  "go81":      [...],
  "favorites": [...],
  "tracker":   [...],
  "notes":     [...],
  "reference": [...],
  "acronyms":  [...]
}
```

---

## 6. SCREEN-BY-SCREEN UI LAYOUT

### HOME
```
┌─────────────────────────────┐
│ ⬡ FLIGHTLINE   22:14:07 Z ● │  ← Top bar: app name, Zulu, status
├─────────────────────────────┤
│ LOCAL TIME    │ ZULU (UTC)  │
│  14:14:07     │  22:14:07   │  ← Live clock cells
│ ─────────────────────────── │
│    JULIAN DATE               │
│       25167                  │  ← AF Julian YYDDD (large amber)
│    WED 16 JUN 2025           │
├─────────────────────────────┤
│ QUICK ACCESS                 │
│  [◈ OPS  ]  [ ⚙ TOOLS ]    │  ← 2×2 nav card grid
│  [▣ TRACK]  [ ≡ NOTES ]    │
├─────────────────────────────┤
│ THIS MONTH                   │
│  [5 FLIGHTS][2 EVENTS]...   │  ← Summary strip
├─────────────────────────────┤
│ SHIFT NOTE  (tap to edit)    │
└─────────────────────────────┘
│ ⌂HOME │◈OPS │⚙TOOLS│▣TRK│≡ │  ← Bottom nav
```

### OPS
- ICAO input → tap SEARCH → result card with ★ FAVORITE button
- GO81 input → live search as you type → list of matching records
- Favorites list (star to save, ✕ to remove)
- Live 6-zone time grid (Local / Zulu / Eastern / Central / Mountain / Pacific)

### TOOLS
Three sub-tabs: **JULIAN | CONVERT | TIMERS**

**JULIAN tab:**
- Current date/julian/DOY/week panel (live)
- Date → Julian converter (date picker → result)
- Julian → Date (year + DOY inputs → result)

**CONVERT tab:**
- Sub-tabs: LENGTH | WEIGHT | TEMP | FUEL | PRESS | TORQUE
- Single input → live conversion output table

**TIMERS tab:**
- Stopwatch (START/PAUSE/LAP/RESET, lap list)
- Countdown timer (HH MM SS inputs, START/PAUSE/RESET, expiry toast)
- Shift elapsed (set start time → live elapsed, 8hr/12hr end times shown)

### TRACKER
- Form: TYPE (select) / DATE / HOURS (volunteer) / DESCRIPTION / NOTES
- Log button → toast confirmation
- Summary grid: MONTH | YEAR | ALL toggle → 9 stat cells
- Export JSON / CSV buttons
- Searchable entry log (cards with DELETE)

### NOTES
Three sub-tabs: **NOTES | REFERENCE | ACRONYMS**

**NOTES:** Title + body textarea → SAVE → searchable card list  
**REFERENCE:** Pre-seeded maintenance refs (TO hierarchy, Red X, EPB format, etc.) + add form with tags  
**ACRONYMS:** Pre-seeded 55 military acronyms + add form, searchable

### SETTINGS
- Export All (JSON backup) / Import backup file / Clear all data
- Theme swatches: GUNSHIP | OLIVE | STEALTH | ALERT
- ICAO DB: record count + add form (code / name / city / country)
- GO81 DB: record count + add form (code / name / unit / address)
- About panel: version, build date, storage type, mode

---

## 7. PHASED BUILD PLAN

### Phase 1 — Core (This Release) ✅
- [x] PWA shell + Service Worker + manifest
- [x] IndexedDB wrapper + all 8 stores
- [x] Bottom nav routing (5 tabs)
- [x] Live local + Zulu clock in top bar and home hero
- [x] Julian date display + bidirectional converter
- [x] ICAO lookup + seeded USAF/USMC bases
- [x] GO81 lookup + seeded records
- [x] Favorites system
- [x] 6-zone time grid
- [x] Tracker (all types, monthly/yearly/all summary, CSV + JSON export)
- [x] Notes + Reference library + Acronym dictionary (seeded)
- [x] Stopwatch + Countdown + Shift elapsed
- [x] 6-category unit converter
- [x] 4 color themes
- [x] Import/export backup
- [x] Shift note widget on home screen

### Phase 2 — Enhancement
- [ ] Editable ICAO/GO81 records (inline edit, not just add/delete)
- [ ] Bulk import ICAO/GO81 from CSV paste
- [ ] Tracker: filter by type, date range search
- [ ] Tracker: EPB bullet auto-formatter (action–impact–result template)
- [ ] Barometric pressure / altimeter setting converter
- [ ] Clock in/out punch tracker with shift totals
- [ ] Recent searches history for ICAO/GO81

### Phase 3 — Power Features
- [ ] Local weather integration (METAR paste/decode)
- [ ] TO reference quick-links (user-defined URL bookmarks)
- [ ] AFSC-based reference filter
- [ ] QR code export for sharing entries
- [ ] Widget-style home screen customization
- [ ] Notification for countdown timer (Web Notifications API)

---

## DEPLOYMENT — GITHUB PAGES

1. Fork or push this folder to a GitHub repo
2. In **Settings → Pages**, set source to `main` branch, root `/`
3. Access via `https://<username>.github.io/<repo>/`
4. On Android Chrome: tap **⋮ Menu → Add to Home Screen → Install**
5. App installs as standalone PWA with full offline support

## LOCAL DEVELOPMENT

```bash
# Serve with any static server (Python built-in)
python3 -m http.server 8080

# Then open: http://localhost:8080
# Install banner will appear on Android Chrome
```

> ⚠️ **IMPORTANT:** Must be served over HTTPS or localhost for Service Workers to register. GitHub Pages handles HTTPS automatically.

---

## SEED DATA INCLUDED

**ICAO (34 records):** Major USAF bases + overseas locations (Yokota, Osan, Kunsan, Kuwait, Bahrain, Baghdad)

**GO81 (13 records):** Key AMU/ABW codes for major USAF installations

**Reference Library (10 entries):** TO hierarchy, Red X symbols, AFTO 781 sections, EPB bullet format, mandatory inspection intervals, IMDS/G081 codes, hazmat handling, FOD walk, torque wrench care, LO/TO procedure

**Acronyms (55 entries):** Core USAF maintenance acronyms from AFSC to Zulu

---

*FLIGHTLINE v1.0 — Built for Airmen, by Airmen.*  
*Offline-first. No server. No login. Just the tool.*
