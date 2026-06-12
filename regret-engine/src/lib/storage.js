// Persistence layer. Everything lives in the browser — that's the product's
// privacy promise. Transactions are stored slim (no full raw history needed).

const KEY = 'regret-engine:v1';
const TXN_CAP = 2000;

const empty = () => ({ txns: {}, ratings: {} });

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return empty();
    return { txns: data.txns || {}, ratings: data.ratings || {} };
  } catch {
    return empty();
  }
}

function save(store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Storage full or blocked — app still works for this session.
  }
}

function slim(t) {
  return {
    id: t.id,
    d: t.dateStr,
    n: t.name,
    e: t.emoji,
    c: t.category,
    a: t.amount,
    r: t.rawDesc.slice(0, 80),
    s: t.sub ? 1 : 0,
  };
}

export function inflate(s) {
  return {
    id: s.id,
    dateStr: s.d,
    date: new Date(`${s.d}T12:00:00`),
    name: s.n,
    emoji: s.e,
    category: s.c,
    amount: s.a,
    rawDesc: s.r,
    sub: !!s.s,
  };
}

/** Merge newly parsed (cleaned) transactions into the store. */
export function addTxns(store, txns) {
  for (const t of txns) store.txns[t.id] = slim(t);
  // Cap: drop oldest UNRATED transactions first.
  const ids = Object.keys(store.txns);
  if (ids.length > TXN_CAP) {
    const unrated = ids
      .filter((id) => !store.ratings[id])
      .sort((a, b) => (store.txns[a].d < store.txns[b].d ? -1 : 1));
    for (const id of unrated.slice(0, ids.length - TXN_CAP)) delete store.txns[id];
  }
  save(store);
  return store;
}

export function rate(store, txn, verdict) {
  store.txns[txn.id] = slim(txn);
  store.ratings[txn.id] = { v: verdict, t: Date.now() };
  save(store);
  return store;
}

export function unrate(store, id) {
  delete store.ratings[id];
  save(store);
  return store;
}

export function clearAll() {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
  return empty();
}

/** Join ratings with stored txns -> [{ v, txn }] for the stats engine. */
export function joinRatings(store) {
  const out = [];
  for (const [id, r] of Object.entries(store.ratings)) {
    const s = store.txns[id];
    if (s) out.push({ v: r.v, txn: inflate(s) });
  }
  return out;
}

/** Transactions not yet rated, newest first. */
export function unratedTxns(store) {
  return Object.values(store.txns)
    .filter((s) => !store.ratings[s.id])
    .map(inflate)
    .sort((a, b) => b.date - a.date);
}
