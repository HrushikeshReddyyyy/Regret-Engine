import React, { useRef, useState } from 'react';
import { pct } from '../lib/format.js';

export default function Landing({
  onFileText,
  onDemo,
  busy,
  ratedCount,
  rate,
  remaining,
  onViewReport,
  onRateMore,
}) {
  const fileRef = useRef(null);
  const [over, setOver] = useState(false);

  async function handleFiles(files) {
    const file = files && files[0];
    if (!file) return;
    const text = await file.text();
    onFileText(text);
  }

  return (
    <div className="landing">
      {ratedCount > 0 && (
        <section className="paper tear-b return-block print-in">
          <div className="rb-rate">{rate != null ? pct(rate) : '—'}</div>
          <div className="rb-label">
            your running regret rate · {ratedCount} purchase{ratedCount === 1 ? '' : 's'} rated
          </div>
          <div className="rb-actions">
            <button className="btn btn-stamp" onClick={onViewReport}>
              View receipt
            </button>
            {remaining > 0 && (
              <button className="btn btn-paper" onClick={onRateMore}>
                Rate more ({remaining})
              </button>
            )}
          </div>
        </section>
      )}

      <section className="paper tear-b hero print-in" style={{ '--d': '0.05s' }}>
        <p className="eyebrow">REGRET ENGINE · SELF-AUDIT DIVISION</p>
        <h1>
          What <span className="pct">%</span> of your spending do you regret?
        </h1>
        <p className="sub">
          Swipe through your own bank statement like it's a dating app. Right if it was worth it. Left if you
          regret it. Get your number at the end. No signup. No bank login.
        </p>

        <div
          className={`dropzone${over ? ' over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <span className="dz-title">Drop your bank CSV here</span>
          <button className="btn btn-stamp" onClick={() => fileRef.current?.click()}>
            Choose CSV file
          </button>
          <p className="dz-hint">Chase, Amex, BofA, Capital One, credit unions — most exports just work.</p>
          <button className="btn btn-quiet" onClick={onDemo} disabled={busy}>
            {busy ? 'Loading…' : 'No file handy? Try the demo statement'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="visually-hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      </section>

      <div className="privacy print-in" style={{ '--d': '0.12s' }}>
        <span className="lock" aria-hidden="true">
          🔒
        </span>
        <span>
          Runs 100% in your browser. Your statement never leaves this device — there's no server to send it to.
          Hit “clear all data” any time and it's gone.
        </span>
      </div>

      <section className="paper tear-t tear-b steps print-in" style={{ '--d': '0.18s' }}>
        <h2>HOW IT WORKS</h2>
        <div className="step">
          <span className="num">1</span>
          <div>
            <div className="s-title">EXPORT</div>
            <p>Download a CSV from your bank — Statements → Download → CSV. Bills, rent, and paychecks get filtered out automatically.</p>
          </div>
        </div>
        <div className="step">
          <span className="num">2</span>
          <div>
            <div className="s-title">SWIPE</div>
            <p>Each purchase becomes a card. Right = worth it. Left = regret. Up = skip. Decks are 25 cards — about 90 seconds.</p>
          </div>
        </div>
        <div className="step">
          <span className="num">3</span>
          <div>
            <div className="s-title">RECEIPT</div>
            <p>Get your regret rate, dollars regretted per month, and the patterns you didn't know you had. Then share your number.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
