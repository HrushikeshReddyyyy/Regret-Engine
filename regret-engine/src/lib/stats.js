// Turns rated transactions into the Regret Report.
// Input: array of { v: 'r' | 'w' | 's', txn } (regret / worth it / skipped)

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function monthsSpan(dates) {
  if (!dates.length) return 1;
  const min = Math.min(...dates);
  const max = Math.max(...dates);
  return Math.max(1, (max - min) / (86400000 * 30.44));
}

export function buildReport(rated) {
  const judged = rated.filter((r) => r.v === 'r' || r.v === 'w');
  const regrets = judged.filter((r) => r.v === 'r');
  const worths = judged.filter((r) => r.v === 'w');

  if (!judged.length) return null;

  const sum = (list) => list.reduce((a, r) => a + r.txn.amount, 0);
  const regretTotal = sum(regrets);
  const worthTotal = sum(worths);
  const spendTotal = regretTotal + worthTotal;
  const rate = regrets.length / judged.length;
  const dollarRate = spendTotal > 0 ? regretTotal / spendTotal : 0;
  const months = monthsSpan(judged.map((r) => r.txn.date.getTime()));
  const regretPerMonth = regretTotal / months;

  // Per-merchant breakdown.
  const byName = new Map();
  for (const r of judged) {
    const k = r.txn.name;
    if (!byName.has(k)) {
      byName.set(k, { name: k, emoji: r.txn.emoji, regret: 0, worth: 0, regretCount: 0, count: 0 });
    }
    const m = byName.get(k);
    m.count++;
    if (r.v === 'r') { m.regret += r.txn.amount; m.regretCount++; }
    else m.worth += r.txn.amount;
  }
  const merchants = [...byName.values()].map((m) => ({
    ...m,
    spendShare: spendTotal > 0 ? (m.regret + m.worth) / spendTotal : 0,
    regretShare: regretTotal > 0 ? m.regret / regretTotal : 0,
  }));
  const topRegrets = merchants
    .filter((m) => m.regret > 0)
    .sort((a, b) => b.regret - a.regret)
    .slice(0, 5);

  // Day-of-week pattern (bank CSVs carry dates, not times).
  const byDay = new Array(7).fill(0);
  for (const r of regrets) byDay[r.txn.date.getDay()] += r.txn.amount;
  const weekend = byDay[0] + byDay[5] + byDay[6]; // Fri + Sat + Sun
  const weekendShare = regretTotal > 0 ? weekend / regretTotal : 0;
  const peakDay = DAY_NAMES[byDay.indexOf(Math.max(...byDay))];

  // Regretted subscriptions — the annualized number is the gut punch.
  const subRegretNames = new Map();
  for (const r of regrets) {
    if (r.txn.sub) {
      if (!subRegretNames.has(r.txn.name)) {
        subRegretNames.set(r.txn.name, { name: r.txn.name, emoji: r.txn.emoji, monthly: r.txn.amount });
      }
    }
  }
  const subRegrets = [...subRegretNames.values()];
  const subMonthly = subRegrets.reduce((a, s) => a + s.monthly, 0);

  const biggest = regrets.slice().sort((a, b) => b.txn.amount - a.txn.amount)[0] || null;
  const avgRegret = regrets.length ? regretTotal / regrets.length : 0;
  const avgWorth = worths.length ? worthTotal / worths.length : 0;

  return {
    counts: { judged: judged.length, regrets: regrets.length, worths: worths.length, skipped: rated.length - judged.length },
    rate,
    dollarRate,
    regretTotal,
    worthTotal,
    spendTotal,
    months,
    regretPerMonth,
    merchants,
    topRegrets,
    byDay,
    dayNames: DAY_NAMES,
    peakDay,
    weekendShare,
    subRegrets,
    subMonthly,
    subAnnual: subMonthly * 12,
    biggest: biggest ? biggest.txn : null,
    avgRegret,
    avgWorth,
    headline: null, // filled below
  };
}

const pct = (x) => `${Math.round(x * 100)}%`;
const usd0 = (n) => `$${Math.round(n).toLocaleString('en-US')}`;

/**
 * Pick the spiciest true statement about this person's spending.
 */
export function pickHeadline(rep) {
  if (!rep) return '';

  // 1. A merchant that punches way above its weight in regret.
  const offender = rep.merchants
    .filter((m) => m.regretCount >= 3 && m.spendShare >= 0.02 && m.regretShare > 0)
    .map((m) => ({ ...m, ratio: m.regretShare / Math.max(m.spendShare, 0.001) }))
    .sort((a, b) => b.ratio - a.ratio)[0];
  if (offender && offender.ratio >= 1.6) {
    return `${offender.name} is ${pct(offender.spendShare)} of your spending — but ${pct(offender.regretShare)} of your regret.`;
  }

  // 2. Subscriptions you keep paying for and keep regretting.
  if (rep.subMonthly >= 8) {
    return `You're paying ${usd0(rep.subAnnual)} a year for subscriptions you just rated "regret."`;
  }

  // 3. Weekend pattern.
  if (rep.weekendShare >= 0.55 && rep.counts.regrets >= 5) {
    return `${pct(rep.weekendShare)} of your regret happens Friday through Sunday.`;
  }

  // 4. Death by a thousand swipes.
  if (rep.counts.regrets >= 5 && rep.avgWorth > 0 && rep.avgRegret < rep.avgWorth * 0.6) {
    return `Your regrets average ${usd0(rep.avgRegret)} each. Small swipes, ${usd0(rep.regretPerMonth)} a month.`;
  }

  // 5. Fallback.
  return `You regret ${pct(rep.rate)} of your purchases — about ${usd0(rep.regretPerMonth)} every month.`;
}
