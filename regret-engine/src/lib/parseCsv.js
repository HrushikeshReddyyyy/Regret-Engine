import Papa from 'papaparse';

// ---------------------------------------------------------------------------
// Bank CSV parsing. Banks export wildly different shapes:
//   - Chase card:  Transaction Date, Post Date, Description, Category, Type, Amount  (sales negative)
//   - Amex:        Date, Description, Amount                                          (charges positive)
//   - Checking:    Date, Description, Debit, Credit  (or Withdrawals / Deposits)
//   - Headerless dumps from smaller banks
// Strategy: find columns by header name first, fall back to content detection,
// then infer which sign means "spending" from the data itself.
// ---------------------------------------------------------------------------

const H_DATE = /^(trans(action)?[ _-]?date|date|posted?[ _-]?date|booking[ _-]?date|value[ _-]?date)$/i;
const H_DESC = /^(description|merchant( name)?|name|payee|memo|details?|narrative|transaction( description)?|reference|appears on your statement as)$/i;
const H_AMOUNT = /^(amount( \(usd\))?|transaction[ _-]?amount|amt|value)$/i;
const H_DEBIT = /^(debit|debit[ _-]?amount|withdrawals?( amount)?|money[ _-]?out|paid[ _-]?out|spent)$/i;
const H_CREDIT = /^(credit|credit[ _-]?amount|deposits?( amount)?|money[ _-]?in|paid[ _-]?in|received)$/i;

const MONEY_RE = /^[-+(]?\s*\$?\s*[-+]?[\d,]+(\.\d{1,2})?\s*\)?$/;

export function parseMoney(raw) {
  if (raw == null) return null;
  let s = String(raw).trim();
  if (!s) return null;
  const negParen = /^\(.*\)$/.test(s);
  s = s.replace(/[()$,\s]/g, '');
  if (!s || s === '-' || s === '+') return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negParen ? -Math.abs(n) : n;
}

export function parseDate(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return validDate(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (m) {
    let y = +m[3];
    if (y < 100) y += y < 70 ? 2000 : 1900;
    return validDate(y, +m[1], +m[2]); // US convention: MM/DD/YYYY
  }
  const t = Date.parse(s);
  if (!Number.isNaN(t)) {
    const d = new Date(t);
    if (d.getFullYear() >= 1990 && d.getFullYear() <= 2100) return d;
  }
  return null;
}

function validDate(y, mo, d) {
  if (y < 1990 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, mo - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function looksLikeMoney(v) {
  return v != null && String(v).trim() !== '' && MONEY_RE.test(String(v).trim());
}

// djb2 — stable id so the same transaction isn't re-asked across uploads.
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function findHeaderColumns(headers) {
  const idx = (re) => headers.findIndex((h) => re.test(String(h || '').trim()));
  return {
    date: idx(H_DATE),
    desc: idx(H_DESC),
    amount: idx(H_AMOUNT),
    debit: idx(H_DEBIT),
    credit: idx(H_CREDIT),
  };
}

// Content-based detection for headerless or oddly-labeled files.
function detectColumns(rows) {
  const cols = Math.max(...rows.map((r) => r.length));
  const sample = rows.slice(0, Math.min(rows.length, 60));
  const score = [];
  for (let c = 0; c < cols; c++) {
    let dates = 0, moneys = 0, textLen = 0, filled = 0;
    for (const r of sample) {
      const v = r[c];
      if (v == null || String(v).trim() === '') continue;
      filled++;
      if (parseDate(v)) dates++;
      if (looksLikeMoney(v)) moneys++;
      textLen += String(v).length;
    }
    score.push({
      c,
      date: filled ? dates / filled : 0,
      money: filled ? moneys / filled : 0,
      avgLen: filled ? textLen / filled : 0,
      filled,
    });
  }
  const dateCol = score.filter((s) => s.date >= 0.7).sort((a, b) => b.date - a.date)[0];
  const moneyCols = score
    .filter((s) => s.money >= 0.6 && (!dateCol || s.c !== dateCol.c))
    .sort((a, b) => b.money - a.money);
  const descCol = score
    .filter((s) => (!dateCol || s.c !== dateCol.c) && !moneyCols.some((m) => m.c === s.c))
    .sort((a, b) => b.avgLen - a.avgLen)[0];
  return {
    date: dateCol ? dateCol.c : -1,
    desc: descCol ? descCol.c : -1,
    amount: moneyCols.length ? moneyCols[0].c : -1,
    debit: -1,
    credit: -1,
  };
}

/**
 * Parse raw CSV text into normalized transactions.
 * Returns { txns, meta }.
 * Each txn: { id, date: Date, dateStr, rawDesc, amount (spend, always > 0), isCredit }
 * Credits/income are kept (flagged) so the filter layer can report them.
 */
export function parseTransactions(csvText) {
  const parsed = Papa.parse(csvText, { skipEmptyLines: 'greedy' });
  let rows = (parsed.data || []).filter((r) => Array.isArray(r) && r.some((v) => String(v ?? '').trim() !== ''));
  if (rows.length < 2) throw new Error('EMPTY');

  // Does the first row look like a header? (no dates, no money values)
  const first = rows[0];
  const headerish = !first.some((v) => parseDate(v)) && !first.some((v) => looksLikeMoney(v));
  let cols;
  let dataRows;
  if (headerish) {
    cols = findHeaderColumns(first);
    dataRows = rows.slice(1);
    // Header row existed but names didn't match anything we know — detect by content.
    if (cols.date === -1 || (cols.amount === -1 && cols.debit === -1)) {
      const detected = detectColumns(dataRows);
      cols = {
        date: cols.date !== -1 ? cols.date : detected.date,
        desc: cols.desc !== -1 ? cols.desc : detected.desc,
        amount: cols.amount !== -1 ? cols.amount : detected.amount,
        debit: cols.debit,
        credit: cols.credit,
      };
    }
  } else {
    cols = detectColumns(rows);
    dataRows = rows;
  }

  if (cols.date === -1 || cols.desc === -1 || (cols.amount === -1 && cols.debit === -1)) {
    throw new Error('NO_COLUMNS');
  }

  const usePair = cols.debit !== -1;
  const raw = [];
  for (const r of dataRows) {
    const date = parseDate(r[cols.date]);
    const desc = String(r[cols.desc] ?? '').trim();
    if (!date || !desc) continue;
    if (usePair) {
      const debit = parseMoney(r[cols.debit]);
      const credit = cols.credit !== -1 ? parseMoney(r[cols.credit]) : null;
      if (debit != null && Math.abs(debit) > 0.004) {
        raw.push({ date, desc, spend: Math.abs(debit), isCredit: false });
      } else if (credit != null && Math.abs(credit) > 0.004) {
        raw.push({ date, desc, spend: Math.abs(credit), isCredit: true });
      }
    } else {
      const v = parseMoney(r[cols.amount]);
      if (v == null || Math.abs(v) < 0.004) continue;
      raw.push({ date, desc, value: v });
    }
  }
  if (!raw.length) throw new Error('NO_ROWS');

  // Single amount column: infer which sign means "spending".
  // Heuristic: people make many purchases and receive few deposits,
  // so the majority sign is the spending sign.
  if (!usePair) {
    const neg = raw.filter((t) => t.value < 0).length;
    const pos = raw.length - neg;
    const spendSign = neg > pos ? -1 : 1;
    for (const t of raw) {
      t.spend = Math.abs(t.value);
      t.isCredit = Math.sign(t.value) !== spendSign;
      delete t.value;
    }
  }

  // Stable ids; same-day duplicates get an occurrence counter.
  const seen = new Map();
  const txns = raw.map((t) => {
    const dateStr = t.date.toISOString().slice(0, 10);
    const key = `${dateStr}|${t.desc}|${t.spend.toFixed(2)}|${t.isCredit ? 'c' : 'd'}`;
    const n = (seen.get(key) || 0) + 1;
    seen.set(key, n);
    return {
      id: hash(`${key}#${n}`),
      date: t.date,
      dateStr,
      rawDesc: t.desc,
      amount: Math.round(t.spend * 100) / 100,
      isCredit: t.isCredit,
    };
  });

  txns.sort((a, b) => b.date - a.date);
  return {
    txns,
    meta: {
      rows: dataRows.length,
      parsed: txns.length,
      credits: txns.filter((t) => t.isCredit).length,
      from: txns[txns.length - 1]?.dateStr,
      to: txns[0]?.dateStr,
    },
  };
}
