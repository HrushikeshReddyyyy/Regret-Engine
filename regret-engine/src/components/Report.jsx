import React, { useRef, useState } from 'react';
import { usd, usd0, pct } from '../lib/format.js';
import { drawShareCard, downloadCanvas, shareCanvas } from '../lib/sharecard.js';

export default function Report({ report, remaining, onNextDeck, onUploadMore, onReset }) {
  const canvasRef = useRef(null);
  const [working, setWorking] = useState(false);
  const rep = report;

  const maxOffender = rep.topRegrets.length ? rep.topRegrets[0].regret : 1;
  const maxDay = Math.max(...rep.byDay, 1);
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.canShare;
  const receiptNo = `RGRT-${String(Math.round(rep.rate * 100)).padStart(2, '0')}-${String(rep.counts.judged).padStart(4, '0')}`;

  async function prepareCard() {
    setWorking(true);
    try {
      await drawShareCard(canvasRef.current, rep, rep.headline);
    } finally {
      setWorking(false);
    }
  }

  async function handleDownload() {
    await prepareCard();
    downloadCanvas(canvasRef.current);
  }

  async function handleShare() {
    await prepareCard();
    const ok = await shareCanvas(canvasRef.current);
    if (!ok) downloadCanvas(canvasRef.current);
  }

  let d = 0;
  const delay = () => ({ '--d': `${(d++ * 0.07).toFixed(2)}s` });

  return (
    <div>
      <section className="paper tear-t tear-b report">
        <div className="r-head print-in" style={delay()}>
          <div className="store">★ YOUR REGRET RECEIPT ★</div>
          <div className="meta">
            {rep.counts.judged} PURCHASES RATED · {rep.months.toFixed(1)} MO OF SPENDING
            {rep.counts.skipped > 0 ? ` · ${rep.counts.skipped} SKIPPED` : ''}
          </div>
        </div>

        <div className="print-in" style={delay()}>
          <div className="bigpct">{pct(rep.rate)}</div>
          <div className="bigpct-label">OF YOUR PURCHASES — REGRETTED</div>
        </div>

        <div className="headline print-in" style={delay()}>
          {rep.headline}
        </div>

        <hr className="dashed" />

        <div className="print-in" style={delay()}>
          <div className="leader">
            <span className="l-label">REGRETTED / MO</span>
            <span className="l-dots" />
            <span className="l-val red">{usd0(rep.regretPerMonth)}</span>
          </div>
          <div className="leader">
            <span className="l-label">TOTAL REGRETTED</span>
            <span className="l-dots" />
            <span className="l-val red">{usd0(rep.regretTotal)}</span>
          </div>
          <div className="leader">
            <span className="l-label">DOLLAR REGRET RATE</span>
            <span className="l-dots" />
            <span className="l-val">{pct(rep.dollarRate)}</span>
          </div>
          <div className="leader">
            <span className="l-label">RATED WORTH IT</span>
            <span className="l-dots" />
            <span className="l-val">{usd0(rep.worthTotal)}</span>
          </div>
          {rep.biggest && (
            <div className="leader">
              <span className="l-label">BIGGEST SINGLE REGRET</span>
              <span className="l-dots" />
              <span className="l-val red">
                {rep.biggest.emoji} {usd(rep.biggest.amount)}
              </span>
            </div>
          )}
        </div>

        {rep.topRegrets.length > 0 && (
          <>
            <hr className="dashed" />
            <div className="print-in" style={delay()}>
              <div className="sec-title">TOP OFFENDERS</div>
              <div className="offender">
                {rep.topRegrets.map((m) => (
                  <div className="off-row" key={m.name}>
                    <div className="o-top">
                      <span>
                        {m.emoji} {m.name}
                        <span style={{ color: 'var(--faded)', fontWeight: 500 }}> ×{m.regretCount}</span>
                      </span>
                      <span className="o-amt">{usd0(m.regret)}</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(m.regret / maxOffender) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <hr className="dashed" />
        <div className="print-in" style={delay()}>
          <div className="sec-title">WHEN YOU REGRET · PEAK {rep.peakDay.toUpperCase()}</div>
          <div className="days">
            {rep.byDay.map((amt, idx) => (
              <div className={`day${amt === 0 ? ' dim' : ''}`} key={idx}>
                <div className="d-bar" style={{ height: `${Math.max((amt / maxDay) * 100, 3)}%` }} />
                <div className="d-lab">{rep.dayNames[idx].slice(0, 2).toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {rep.subRegrets.length > 0 && (
          <>
            <hr className="dashed" />
            <div className="callout print-in" style={delay()}>
              <span className="big">
                {usd0(rep.subMonthly)}/MO → {usd0(rep.subAnnual)}/YR
              </span>
              Subscriptions you just stamped “regret”:{' '}
              {rep.subRegrets.map((s) => `${s.emoji} ${s.name}`).join(' · ')}. They renew whether you remember
              them or not.
            </div>
          </>
        )}

        <div className="barcode-wrap print-in" style={delay()}>
          <div className="barcode" aria-hidden="true" />
          <div className="barcode-num">{receiptNo}</div>
        </div>
      </section>

      <div className="r-actions">
        <div className="r-actions-row">
          <button className="btn btn-stamp" onClick={handleDownload} disabled={working}>
            {working ? 'Printing…' : '⤓ Download share card'}
          </button>
          {canNativeShare && (
            <button className="btn btn-paper" onClick={handleShare} disabled={working}>
              Share
            </button>
          )}
        </div>
        {remaining > 0 && (
          <button className="btn btn-paper" onClick={onNextDeck}>
            Rate next deck ({Math.min(remaining, 25)} cards)
          </button>
        )}
        <button className="btn btn-ghost" onClick={onUploadMore}>
          Upload another statement
        </button>
        <button className="btn btn-quiet on-felt" onClick={onReset}>
          clear all data from this browser
        </button>
      </div>

      <canvas ref={canvasRef} className="visually-hidden" aria-hidden="true" />
    </div>
  );
}
