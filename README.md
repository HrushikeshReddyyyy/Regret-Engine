<div align="center">

<!-- 3D Animated Header via capsule-render -->
<img src="https://capsule-render.vercel.app/api?type=venom&height=300&text=REGRET%20RATE&fontSize=80&color=0:0f2027,50:203a43,100:2c5364&stroke=00ff88&strokeWidth=3&fontColor=00ff88&animation=fadeIn&fontAlignY=50&desc=Tinder%20for%20your%20bank%20statement.%20100%25%20in%20your%20browser.&descSize=20&descAlignY=70&descColor=aaffcc" width="100%" />

<!-- Animated typing effect -->
<a href="https://regret-engine-zeta.vercel.app">
  <img src="https://readme-typing-svg.demolab.com?font=IBM+Plex+Mono&weight=700&size=22&duration=3000&pause=1000&color=00FF88&center=true&vCenter=true&multiline=true&repeat=true&width=700&height=80&lines=Swipe+every+purchase+%E2%86%92+Worth+it+%7C+Regret;100%25+client-side.+Zero+servers.+Zero+leaks.;Your+statement+never+leaves+your+device." alt="Typing SVG" />
</a>

<br/>

<!-- Live Demo Button -->
<a href="https://regret-engine-zeta.vercel.app">
  <img src="https://img.shields.io/badge/%E2%96%B6%20LIVE%20DEMO-regret--engine--zeta.vercel.app-00FF88?style=for-the-badge&labelColor=0d1117&color=00FF88" alt="Live Demo" />
</a>
&nbsp;
<a href="https://github.com/HrushikeshReddyyyy/Regret-Engine">
  <img src="https://img.shields.io/badge/GitHub-Source-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
</a>

<br/><br/>

<!-- Tech Stack Badges -->
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Backend-ZERO-00FF88?style=for-the-badge" />
<img src="https://img.shields.io/badge/Data%20Leaves%20Device-NEVER-FF0066?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />

</div>

---

## What is Regret Rate?

**Regret Rate** is a 100% client-side spending psychology tool. Upload your bank CSV, swipe every discretionary purchase (right = worth it, left = regret), and receive your **Regret Receipt** — a shareable breakdown of what % of your spending you genuinely regret.

The constraint that shaped everything: **your statement never leaves your device.** No backend. No accounts. No bank logins. Parsing, scoring, and analytics all happen in your browser.

---

<div align="center">

<!-- Animated pipeline diagram -->

```
╔══════════════════════════════════════════════════════════════════════╗
║              REGRET RATE  ·  CLIENT-SIDE PIPELINE                   ║
╠══════════╦══════════╦══════════════╦══════════════╦═════════════════╣
║ INGEST   ║ CLEAN    ║ FILTER       ║ SWIPE DECK   ║ REPORT          ║
╠══════════╬══════════╬══════════════╬══════════════╬═════════════════╣
║ CSV      ║ 110+     ║ Auto-skip    ║ 25 cards     ║ Regret Rate %   ║
║ OFX/QFX* ║ merchant ║ income &     ║ ← Regret     ║ $/mo regretted  ║
║ PDF*     ║ aliases  ║ transfers    ║ → Worth it   ║ Per-merchant    ║
║ Intl*    ║ Category ║ Detect subs  ║ S Skip  U Undo║ Sub kill list  ║
╚══════════╩══════════╩══════════════╩══════════════╩═════════════════╝
                                                        * Coming Phase 2
```

</div>

---

## Features

| Feature | Status | Description |
|---|---|---|
| Swipe Deck | ✅ Live | 25-card swipe UI — right = worth it, left = regret |
| Regret Receipt | ✅ Live | Rate, $/mo, top offenders, shareable PNG card |
| Subscription Detection | ✅ Live | Auto-identifies recurring subs, annualizes them |
| Per-Merchant Analytics | ✅ Live | Spot patterns by merchant, weekday, category |
| Share Card | ✅ Live | 1080×1350 canvas PNG — your receipt as a post |
| localStorage Persistence | ✅ Live | 2,000-txn cap, zero cloud, fully device-local |
| Sample Data Mode | ✅ Live | Full demo without uploading anything |
| OFX / QFX Parser | 🔨 Phase 2 | Every US bank's Quicken export format |
| PDF Statement Parser | 🔨 Phase 2 | Text-based PDFs via pdf.js (dynamic import) |
| International Formats | 🔨 Phase 2 | Decimal-comma amounts, DD/MM/YYYY dates |
| PWA Install | 🔨 Phase 2 | Add to home screen, offline-first |
| Trends + Sparkline | 🔨 Phase 2 | "38% → 29% since April" habit loop |
| JSON Backup / Import | 🔨 Phase 2 | Your backup is a file you own |
| Return Window Flags | 🔨 Phase 3 | "Still returnable — 8 days left, $63 back" |
| Subscription Kill List | 🔨 Phase 3 | Annualized regretted subs + cancel links |
| Regret Prediction | 🔨 Phase 3 | Laplace-smoothed per-merchant regret scores |
| Pre-Purchase Check | 🔨 Phase 3 | Type merchant + amount → predicted regret |

---

## Privacy — The Whole Point

```
┌─────────────────────────────────────────────────────────┐
│  YOUR DATA FLOW                                         │
│                                                         │
│  📁 Your CSV  ──►  🌐 Browser Parser  ──►  💾 localStorage │
│                                                         │
│  ❌ No server  ❌ No API  ❌ No accounts  ❌ No telemetry  │
│                                                         │
│  ✅ Works fully offline after first load                │
│  ✅ "Clear all data" wipes everything instantly         │
│  ✅ localStorage key: regret-engine:v1  (device-only)  │
└─────────────────────────────────────────────────────────┘
```

> We count visits and completed decks — nothing else. Your transactions never leave your browser.

---

## Quickstart

```bash
# Clone & install
git clone https://github.com/HrushikeshReddyyyy/Regret-Engine.git
cd Regret-Engine/regret-engine
npm install

# Dev server
npm run dev
# → http://localhost:5173

# Production build
npm run build

# Smoke tests
npm run smoke
```

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| UI Framework | React 18 + Vite | Fast HMR, tiny bundle |
| CSV Parsing | PapaParse | Battle-tested, streaming |
| PDF Parsing | pdf.js (dynamic import) | ~1MB loaded only when needed |
| State | localStorage only | Privacy-first; evictable by user |
| Share Card | Canvas API | No server-side image gen |
| Tests | Vitest (porting in progress) | ESM-native, fast |
| CI | GitHub Actions | build + test on every push |
| Deploy | Vercel | Zero-config Vite deploy |

---

## Project Structure

```
Regret-Engine/
└── regret-engine/
    ├── src/
    │   ├── lib/
    │   │   ├── parseCsv.js          # Header detection + sign heuristics
    │   │   ├── parseOfx.js          # OFX/QFX SGML parser  [Phase 2]
    │   │   ├── parsePdf.js          # pdf.js wrapper        [Phase 2]
    │   │   ├── parsePdfLayout.js    # Row reconstruction    [Phase 2]
    │   │   ├── clean.js             # 110+ merchant aliases + categories
    │   │   ├── discretionary.js     # Auto-filter income/transfers/subs
    │   │   ├── stats.js             # Rate, $/mo, per-merchant, day-of-week
    │   │   ├── predict.js           # Laplace regret prediction [Phase 3]
    │   │   ├── returns.js           # Return-window flags   [Phase 3]
    │   │   ├── cancelLinks.js       # Sub kill list         [Phase 3]
    │   │   └── storage.js           # Versioned localStorage (v1→v2)
    │   ├── components/
    │   │   ├── Deck.jsx             # 25-card swipe UI
    │   │   ├── Report.jsx           # Regret Receipt + share card
    │   │   └── Landing.jsx          # Upload / sample flow
    │   └── main.jsx
    ├── src/lib/__tests__/           # Vitest suite (porting in progress)
    ├── .github/workflows/ci.yml    # CI: test + build on push
    ├── public/
    │   ├── sample.csv               # Demo statement (90 rows)
    │   ├── favicon.svg
    │   └── og.png                   # 1200×630 OG image
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Roadmap

<div align="center">

| Phase | Milestone | ETA |
|---|---|---|
| ✅ Phase 1 | Ship: live URL · OG tags · README · Smoke tests | Done |
| 🔨 Phase 2 | OFX/QFX · PDF parsing · Intl formats · PWA · Trends | Week 2–3 |
| 🔭 Phase 3 | Return windows · Kill list · Regret prediction | Week 4–5 |
| 🚀 Phase 4 | Show HN · Product Hunt · Plaid opt-in tier | Post-launch |

</div>

**Deliberately excluded:** OCR for scanned PDFs (too heavy), LLM merchant cleanup (privacy tradeoff), auto bank linking on the default path. Excluding things on purpose is itself showcase material — see `ARCHITECTURE.md`.

---

## Storage Schema (v2)

```js
// localStorage key: "regret-engine:v1"  ← never rename (wipes user data)
// Schema v2 shape:
{
  v: 2,
  txns:    { [id]: { d, n, e, c, a, r, s } },   // slim 7-field records
  ratings: { [id]: { v, t, ret? } },              // verdict + timestamp
  sessions: [ { ts, judged, rate, dollarRate, regretPerMonth, topMerchant } ], // trends
  lastDeckCompletedAt: number | null,
  cancelled: { [subName]: { t, annual } }          // kill-list tallies
}
// Cap: 2,000 txns · 60 sessions · oldest-unrated dropped first
```

---

## Test Suite

```bash
npm run smoke          # Node-native smoke tests (current)
npm test               # Vitest suite (porting in progress)
npm run coverage       # Coverage via @vitest/coverage-v8
```

Test coverage targets:
- `parseCsv` — 6 bank formats, parenthesized negatives, headerless files
- `parseOfx` — SGML tag soup, FITID stability, timezone suffixes
- `parsePdf` — Row reconstruction from synthetic text-item arrays
- `clean` — 110+ merchant alias cases
- `discretionary` — Income/transfer/sub filtering
- `stats` — monthsSpan edge cases, subscription annualization
- `predict` — Laplace smoothing, fallback ladder, threshold gating
- `storage` — v1→v2 migration, addTxns cap, importBackup merge

---

<div align="center">

<!-- Animated footer -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,50:203a43,100:2c5364&height=120&section=footer&text=Your%20statement%20never%20leaves%20your%20device.&fontSize=18&fontColor=00ff88&animation=twinkling" width="100%" />

<sub>Built with spending psychology, privacy-first architecture, and zero VC money.<br/>
MIT License · <a href="https://regret-engine-zeta.vercel.app">regret-engine-zeta.vercel.app</a></sub>

</div>
