import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usd, fmtDate } from '../lib/format.js';

const THRESH = 110; // px to commit a verdict
const FLY_MS = 280;

export default function Deck({ deck, skipNote, onVerdict, onUndo, onComplete }) {
  const [i, setI] = useState(0);

  const cardRef = useRef(null);
  const regretRef = useRef(null);
  const worthRef = useRef(null);
  const busyRef = useRef(false);
  const dragRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ dx: 0, dy: 0 });

  const top = deck[i];

  // Fresh card: clear any leftover transform/stamp state, release the busy lock.
  useLayoutEffect(() => {
    busyRef.current = false;
    dragRef.current = false;
    posRef.current = { dx: 0, dy: 0 };
    const el = cardRef.current;
    if (el) {
      el.style.transition = 'none';
      el.style.transform = '';
      el.style.opacity = '1';
    }
    for (const r of [regretRef, worthRef]) {
      if (r.current) {
        r.current.style.opacity = '0';
        r.current.classList.remove('stamped');
      }
    }
  }, [i]);

  function setStampOpacity(dx) {
    if (regretRef.current) regretRef.current.style.opacity = String(Math.min(Math.max(-dx / 100, 0), 1));
    if (worthRef.current) worthRef.current.style.opacity = String(Math.min(Math.max(dx / 100, 0), 1));
  }

  function commit(v, fromDrag = false) {
    if (busyRef.current || !top) return;
    busyRef.current = true;
    const el = cardRef.current;
    const { dx, dy } = fromDrag ? posRef.current : { dx: 0, dy: 0 };

    if (el) {
      el.style.transition = `transform ${FLY_MS / 1000}s ease-in, opacity ${FLY_MS / 1000}s ease-in`;
      if (v === 'r') el.style.transform = `translate(${Math.min(dx, 0) - 560}px, ${dy}px) rotate(-18deg)`;
      else if (v === 'w') el.style.transform = `translate(${Math.max(dx, 0) + 560}px, ${dy}px) rotate(18deg)`;
      else el.style.transform = `translate(${dx}px, ${Math.min(dy, 0) - 640}px) rotate(${dx * 0.03}deg)`;
      if (v === 's') el.style.opacity = '0';
    }

    // Press the stamp.
    const stamp = v === 'r' ? regretRef.current : v === 'w' ? worthRef.current : null;
    if (stamp) {
      stamp.style.opacity = '';
      stamp.classList.add('stamped');
    }
    if (navigator.vibrate) navigator.vibrate(12);

    const txn = top;
    window.setTimeout(() => {
      onVerdict(txn, v);
      const ni = i + 1;
      if (ni >= deck.length) onComplete();
      else setI(ni);
    }, FLY_MS);
  }

  // ---------- pointer drag ----------
  function onPointerDown(e) {
    if (busyRef.current) return;
    dragRef.current = true;
    startRef.current = { x: e.clientX, y: e.clientY };
    posRef.current = { dx: 0, dy: 0 };
    const el = cardRef.current;
    if (el) {
      el.setPointerCapture(e.pointerId);
      el.style.transition = 'none';
      el.classList.add('dragging');
    }
  }

  function onPointerMove(e) {
    if (!dragRef.current || busyRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    posRef.current = { dx, dy };
    const el = cardRef.current;
    if (el) el.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.06}deg)`;
    setStampOpacity(dx);
  }

  function endDrag() {
    const el = cardRef.current;
    if (el) el.classList.remove('dragging');
    dragRef.current = false;
  }

  function onPointerUp() {
    if (!dragRef.current || busyRef.current) return;
    const { dx, dy } = posRef.current;
    endDrag();
    if (dx <= -THRESH) return commit('r', true);
    if (dx >= THRESH) return commit('w', true);
    if (dy <= -THRESH) return commit('s', true);
    // Snap back.
    const el = cardRef.current;
    if (el) {
      el.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.2)';
      el.style.transform = '';
    }
    setStampOpacity(0);
  }

  function onPointerCancel() {
    endDrag();
    const el = cardRef.current;
    if (el) {
      el.style.transition = 'transform 0.25s ease';
      el.style.transform = '';
    }
    setStampOpacity(0);
  }

  // ---------- keyboard ----------
  useEffect(() => {
    function onKey(e) {
      if (busyRef.current) return;
      if (e.key === 'ArrowLeft') commit('r');
      else if (e.key === 'ArrowRight') commit('w');
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        commit('s');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, deck]);

  function undo() {
    if (busyRef.current || i === 0) return;
    onUndo(deck[i - 1]);
    setI(i - 1);
  }

  if (!top) return null;

  return (
    <div className="deckwrap">
      <div className="deckhead">
        <div>
          RECEIPT {i + 1} OF {deck.length}
          {skipNote && <span className="skipnote">{skipNote}</span>}
        </div>
        <button className="btn btn-quiet on-felt" onClick={undo} disabled={i === 0} aria-label="Undo last verdict">
          ↩ undo
        </button>
      </div>

      <div className="deck">
        {/* under-cards, deepest first so the top card paints last */}
        {[2, 1].map((depth) => {
          const t = deck[i + depth];
          if (!t) return null;
          return (
            <div
              key={t.id}
              className="card paper tear-b"
              aria-hidden="true"
              style={{
                transform: `translateY(${depth * 12}px) scale(${1 - depth * 0.04})`,
                zIndex: 3 - depth,
              }}
            >
              <CardBody t={t} />
            </div>
          );
        })}

        <div
          key={top.id}
          ref={cardRef}
          className="card paper tear-b"
          style={{ zIndex: 5 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          <CardBody t={top} />
          <span ref={regretRef} className="stamp regret" aria-hidden="true">
            Regret
          </span>
          <span ref={worthRef} className="stamp worth" aria-hidden="true">
            Worth it
          </span>
        </div>
      </div>

      <div className="verdicts">
        <button className="btn v-regret" onClick={() => commit('r')}>
          ✗ Regret
        </button>
        <button className="v-skip" onClick={() => commit('s')}>
          skip ↑
        </button>
        <button className="btn v-worth" onClick={() => commit('w')}>
          ✓ Worth it
        </button>
      </div>

      <p className="keyhint">drag the receipt · or use ← regret / → worth it / ↑ skip</p>

      <span className="visually-hidden" aria-live="polite">
        {top.name}, {usd(top.amount)}, {fmtDate(top.date)}. Card {i + 1} of {deck.length}.
      </span>
    </div>
  );
}

function CardBody({ t }) {
  return (
    <>
      <div className="row-top">
        <span className="chip">{t.category}</span>
        {t.sub && <span className="chip sub">recurring</span>}
      </div>
      <div className="emoji" aria-hidden="true">
        {t.emoji}
      </div>
      <div className="mname">{t.name}</div>
      <div className="amount">{usd(t.amount)}</div>
      <div className="date">{fmtDate(t.date)}</div>
      <div className="raw">{t.rawDesc}</div>
    </>
  );
}
