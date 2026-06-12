import React, { useMemo, useState } from 'react';
import Landing from './components/Landing.jsx';
import Deck from './components/Deck.jsx';
import Report from './components/Report.jsx';
import { parseTransactions } from './lib/parseCsv.js';
import { cleanMerchant } from './lib/clean.js';
import { splitDiscretionary, markSubscriptions, excludedSummary } from './lib/discretionary.js';
import { buildReport, pickHeadline } from './lib/stats.js';
import * as storage from './lib/storage.js';

const DECK_SIZE = 25;

const PARSE_ERRORS = {
  EMPTY: "That file looks empty. Export a CSV that includes your transactions — most banks: Statements → Download → CSV.",
  NO_COLUMNS:
    "Couldn't find date and amount columns in that file. Try your bank's standard CSV export (Statements → Download → CSV) rather than a PDF or screenshot.",
  NO_ROWS:
    "Found the columns but no readable transactions. Check that the export actually contains rows for the period you picked.",
};

export default function App() {
  const [store, setStore] = useState(() => storage.load());
  const [screen, setScreen] = useState('landing'); // landing | deck | report
  const [deck, setDeck] = useState([]);
  const [skipNote, setSkipNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const ratedCount = Object.keys(store.ratings).length;
  const remaining = useMemo(() => storage.unratedTxns(store).length, [store]);

  const report = useMemo(() => {
    const rep = buildReport(storage.joinRatings(store));
    if (rep) rep.headline = pickHeadline(rep);
    return rep;
  }, [store]);

  function buildDeck(s) {
    return storage.unratedTxns(s).slice(0, DECK_SIZE);
  }

  function ingestCsv(text) {
    setError('');
    let parsed;
    try {
      parsed = parseTransactions(text);
    } catch (e) {
      setError(PARSE_ERRORS[e.message] || PARSE_ERRORS.NO_COLUMNS);
      return;
    }

    const cleaned = parsed.txns.map((t) => ({ ...t, ...cleanMerchant(t.rawDesc) }));
    const { deckable, excluded } = splitDiscretionary(cleaned);
    markSubscriptions(deckable);

    if (!deckable.length) {
      setError(
        'Every row in that file was income, transfers, or bills — nothing swipeable. Try an export from your checking or credit card account.'
      );
      return;
    }

    const next = { ...storage.addTxns(store, deckable) };
    setStore(next);

    const ex = excludedSummary(excluded);
    const exTotal = excluded.length;
    setSkipNote(
      exTotal
        ? `${exTotal} bill${exTotal === 1 ? '' : 's'} & transfer${exTotal === 1 ? '' : 's'} auto-skipped (${ex
            .slice(0, 2)
            .map(([r]) => r.toLowerCase())
            .join(', ')}…)`
        : ''
    );

    const d = buildDeck(next);
    if (!d.length) {
      // Everything in this file was already rated.
      setScreen(report ? 'report' : 'landing');
      if (!report) setError("You've already rated every purchase in that file. Upload a newer export to keep going.");
      return;
    }
    setDeck(d);
    setScreen('deck');
  }

  async function onFileText(text) {
    ingestCsv(text);
  }

  async function onDemo() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}sample.csv`);
      ingestCsv(await res.text());
    } catch {
      setError('Could not load the demo statement. Try uploading your own CSV instead.');
    } finally {
      setBusy(false);
    }
  }

  function onVerdict(txn, v) {
    setStore({ ...storage.rate(store, txn, v) });
  }

  function onUndo(txn) {
    setStore({ ...storage.unrate(store, txn.id) });
  }

  function onDeckComplete() {
    setScreen('report');
  }

  function onNextDeck() {
    const d = buildDeck(store);
    if (!d.length) return;
    setDeck(d);
    setSkipNote('');
    setScreen('deck');
  }

  function onReset() {
    if (!window.confirm('Erase all transactions and ratings stored in this browser? This cannot be undone.')) return;
    setStore(storage.clearAll());
    setDeck([]);
    setSkipNote('');
    setScreen('landing');
  }

  return (
    <div className="shell">
      <header className="brand">
        <span>
          Regret Engine<span className="reg">®</span>
        </span>
        <span className="tag">est. every Sunday</span>
      </header>

      {error && (
        <div className="toast" role="alert">
          {error}
        </div>
      )}

      {screen === 'landing' && (
        <Landing
          onFileText={onFileText}
          onDemo={onDemo}
          busy={busy}
          ratedCount={ratedCount}
          rate={report ? report.rate : null}
          remaining={remaining}
          onViewReport={() => setScreen('report')}
          onRateMore={onNextDeck}
        />
      )}

      {screen === 'deck' && (
        <Deck
          key={deck.length ? deck[0].id : 'deck'}
          deck={deck}
          skipNote={skipNote}
          onVerdict={onVerdict}
          onUndo={onUndo}
          onComplete={onDeckComplete}
        />
      )}

      {screen === 'report' && report && (
        <Report
          report={report}
          remaining={remaining}
          onNextDeck={onNextDeck}
          onUploadMore={() => setScreen('landing')}
          onReset={onReset}
        />
      )}

      {screen === 'report' && !report && (
        <div className="toast" role="alert">
          No rated purchases yet — swipe a deck first.
        </div>
      )}

      <p className="footer-note">RUNS ENTIRELY IN YOUR BROWSER · NOTHING IS UPLOADED · NO ACCOUNT</p>
    </div>
  );
}
