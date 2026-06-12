# Regret Engine

**Tinder for your bank statement.** Upload a CSV, swipe every purchase — right if it was worth it, left if you regret it — and get your Regret Receipt: your regret rate, dollars regretted per month, and the patterns you didn't know you had.

No accounts. No bank logins. No server. The entire app runs in the browser; your statement never leaves the device.

## Quickstart (local)

```bash
npm install
npm run dev        # → http://localhost:5173
```

Other scripts:

```bash
npm run smoke      # 26 logic tests for the parse → clean → filter → stats pipeline
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

## Deploying (pick one)

**1. Vercel (recommended).** Push this folder to a GitHub repo, then in Vercel: *Add New Project → Import* the repo. Vercel auto-detects Vite; defaults are correct (build `npm run build`, output `dist`). Done — you get a URL and HTTPS.

**2. Vercel CLI, no Git.** From this folder: `npx vercel` and follow the prompts, then `npx vercel --prod`.

**3. Netlify Drop, no tooling at all.** This zip ships with a prebuilt `dist/` folder. Go to https://app.netlify.com/drop and drag the `dist` folder onto the page. Live in ~10 seconds.

There is no backend, no environment variables, and nothing to configure. Any static host works.

## How it works

```
CSV file → parseCsv.js   header/format detection (Chase, Amex, BofA, debit/credit
                          columns, headerless), amount-sign heuristics, stable IDs
        → clean.js       merchant cleanup: known-merchant table (~110 entries),
                          processor-prefix stripping (SQ*, TST*), category guessing
        → discretionary  auto-excludes income, transfers, rent, utilities,
          .js             insurance, card payments, fees; detects recurring
                          subscriptions (stable amount, ~monthly cadence)
        → Deck.jsx       25-card swipe deck; verdicts stored locally
        → stats.js       regret rate, $/mo, per-merchant shares, day-of-week
                          pattern, subscription annualization, headline picker
        → Report.jsx     the printed Regret Receipt + 1080×1350 share card (canvas)
```

State lives in `localStorage` under `regret-engine:v1` (capped at 2,000 transactions; oldest unrated are dropped first). "Clear all data" wipes it.

## Privacy

This is the product's core promise: **the statement is parsed in the browser and stored only in the browser.** There is no telemetry, no analytics, no network call except fetching the app itself (and the optional demo CSV). Keep it that way — if you add a backend later, add it for *features*, not for harvesting.

## CSV compatibility

Works with standard US bank exports: header-based detection first, then content-based column sniffing as a fallback. Handles single signed-amount columns (either sign convention — majority sign is assumed to be spending), separate Debit/Credit columns, parenthesized negatives, and headerless files. ISO and M/D/Y dates are supported. **Not yet supported:** European decimal-comma formats (`1.234,56`) and non-CSV exports (PDF, OFX, QFX).

## Roadmap (post-validation)

- Plaid/Teller bank linking → fresh decks without manual exports
- Serverless LLM pass for merchant strings the static table misses
- PWA install + Sunday-evening push: "Your deck is ready — 14 cards"
- Regret prediction ("you've regretted 7 of your last 9 purchases like this") and return-window flagging ("Return it. That's $63 back.")

## License

MIT — see `LICENSE`.
