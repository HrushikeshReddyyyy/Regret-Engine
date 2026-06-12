<div align="center">
```
 ██████╗ ███████╗ ██████╗ ██████╗ ███████╗████████╗
 ██╔══██╗██╔════╝██╔════╝ ██╔══██╗██╔════╝╚══██╔══╝
 ██████╔╝█████╗ ██║ ███╗██████╔╝█████╗ ██║
 ██╔══██╗██╔══╝ ██║ ██║██╔══██╗██╔══╝ ██║
 ██║ ██║███████╗╚██████╔╝██║ ██║███████╗ ██║
 ╚═╝ ╚═╝╚══════╝ ╚═════╝ ╚═╝ ╚═╝╚══════╝ ╚═╝

███████╗███╗ ██╗ ██████╗ ██╗███╗ ██╗███████╗
██╔════╝████╗ ██║██╔════╝ ██║████╗ ██║██╔════╝
█████╗ ██╔██╗ ██║██║ ███╗██║██╔██╗ ██║█████╗
██╔══╝ ██║╚██╗██║██║ ██║██║██║╚██╗██║██╔══╝
███████╗██║ ╚████║╚██████╔╝██║██║ ╚████║███████╗
╚══════╝╚═╝ ╚═══╝ ╚═════╝ ╚═╝╚═╝ ╚═══╝╚══════╝
```

### _Tinder for your bank statement. Swipe. Regret. Learn._

[![MIT License](https://img.shields.io/badge/License-MIT-cyan.svg?style=for-the-badge)](LICENSE)
[![Vite](https://img.shields.io/badge/Built%20With-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Zero Backend](https://img.shields.io/badge/Backend-ZERO-00FF88?style=for-the-badge)](#privacy)
[![Privacy First](https://img.shields.io/badge/Data%20Leaves%20Device-NEVER-FF0066?style=for-the-badge)](#privacy)

> **Upload a CSV. Swipe every purchase — right if it was worth it, left if you regret it.**
> Get your **Regret Receipt**: regret rate, dollars regretted per month, and spending patterns you never knew you had.

---

</div>

## ⚡ What Is This?

Regret Engine is a **100% client-side** spending psychology tool. No accounts. No bank logins. No server. No cloud. Your financial data is parsed in your browser, stored in your browser, and **never leaves your device** — not even for a millisecond.

Think of it as a mirror for your wallet: it forces you to confront every purchase and answer one brutal question — *was it worth it?*

---

## 🌐 Live Demo

**Try it now — no setup, no signup, no data leaves your browser:**

👉 **[https://regret-engine-zeta.vercel.app](https://regret-engine-zeta.vercel.app)**

---

## 🚀 Quickstart

```bash
# Clone & install
git clone https://github.com/HrushikeshReddyyyy/Regret-Engine.git
cd Regret-Engine/regret-engine
npm install

# Launch dev server
npm run dev          # → http://localhost:5173
```

### All Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at `localhost:5173` |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run smoke` | Run 26 logic tests across the full pipeline |

---

## 🧠 How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGRET ENGINE PIPELINE                       │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│ parseCsv.js  │   clean.js   │discretion.js │     Deck.jsx       │
│              │              │              │                    │
│ ◆ Chase      │ ◆ 110+ known │ ◆ Auto-skip  │ ◆ 25-card swipe    │
│ ◆ Amex       │   merchants  │   income     │   deck             │
│ ◆ BofA       │ ◆ Strip SQ*  │ ◆ Auto-skip  │ ◆ Verdicts in      │
│ ◆ Debit cols │   TST* etc.  │   transfers  │   localStorage     │
│ ◆ Headerless │ ◆ Category   │ ◆ Detect     │ ◆ Swipe right =    │
│ ◆ Stable IDs │   guessing   │   recurring  │   worth it         │
│              │              │   subs       │ ◆ Swipe left =     │
│              │              │              │   regret           │
└──────────────┴──────────────┴──────────────┴────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    stats.js + Report.jsx                        │
│                                                                 │
│ 📊 Regret Rate  💸 $/month  🏪 Per-Merchant  📅 Day-of-Week    │
│ 🔄 Subscription Annualization  🖼 Share Card (1080×1350 PNG)   │
└─────────────────────────────────────────────────────────────────┘
```

**State** lives in `localStorage` under `regret-engine:v1` — capped at 2,000 transactions (oldest unrated dropped first). "Clear all data" wipes everything instantly.

---

## 🔒 Privacy — The Core Promise

> Your statement is parsed in the browser and stored only in the browser.

- ✅ Zero telemetry
- ✅ Zero analytics
- ✅ Zero network calls (except fetching the app bundle itself)
- ✅ Works fully offline after first load
- ✅ No accounts, no OAuth, no third-party cookies

**If you add a backend later — add it for features, not for harvesting.**

---

## 📂 CSV Compatibility

| Format | Supported |
|---|---|
| Chase / Amex / BofA exports | ✅ |
| Single signed-amount column | ✅ |
| Separate Debit / Credit columns | ✅ |
| Parenthesized negatives | ✅ |
| Headerless files | ✅ |
| ISO dates & M/D/Y dates | ✅ |
| European decimal-comma (`1.234,56`) | ❌ Coming soon |
| PDF / OFX / QFX exports | ❌ Coming soon |

---

## 🛣 Roadmap

```
[ PHASE 1 — LIVE NOW ]
✅ CSV parsing + swipe deck + Regret Receipt

[ PHASE 2 — IN PROGRESS ]
🔄 PWA install + offline push notifications

[ PHASE 3 — PLANNED ]
📡 Plaid/Teller bank linking (fresh decks, no exports)

[ PHASE 4 — RESEARCH ]
🤖 LLM merchant-string enrichment (serverless)

[ PHASE 5 — VISION ]
🔮 Regret prediction engine — "You've regretted 7 of your last 9 purchases like this."
    Return-window flagging — "Return it. $63 back."
```

---

## 🗂 Project Structure

```
Regret-Engine/
└── regret-engine/
    ├── src/
    │   ├── parseCsv.js       # CSV header detection + amount heuristics
    │   ├── clean.js          # Merchant cleanup (110+ entries) + categories
    │   ├── discretionary.js  # Auto-filter income, transfers, rent, subs
    │   ├── stats.js          # Regret rate, $/mo, per-merchant, day-of-week
    │   ├── Deck.jsx          # 25-card swipe UI
    │   └── Report.jsx        # Regret Receipt + 1080×1350 share card
    ├── public/               # Static assets
    ├── dist/                 # Prebuilt production bundle
    ├── scripts/              # Smoke test runner
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 📜 License

**MIT** — see [`LICENSE`](LICENSE). Build on it, fork it, ship it.

---

_Built with obsession over spending psychology._
_No VC funding. No data harvesting. Just vibes and regret._

**[⭐ Star this repo](https://github.com/HrushikeshReddyyyy/Regret-Engine) if it made you think twice about that last purchase.**
