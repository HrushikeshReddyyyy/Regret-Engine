// Decides which transactions are worth swiping. You should never be asked
// to regret-rate your electric bill — but Netflix is fair game.

const EXCLUDE_RULES = [
  {
    reason: 'Income & transfers',
    re: /PAYROLL|DIRECT\s?DEP|\bSALARY\b|PAYCHECK|EMPLOYER|ONLINE TRANSFER|TRANSFER (TO|FROM)|\bXFER\b|ACH TRANSFER|WIRE (IN|OUT)|MOBILE DEPOSIT|CHECK DEPOSIT|ZELLE (FROM|CREDIT)|CASH ?OUT|TAX REF|REFUND/,
  },
  {
    reason: 'Card & loan payments',
    re: /PAYMENT THANK YOU|THANK YOU.{0,5}PAYMENT|AUTOPAY|AUTOMATIC PAYMENT|CRD PMT|CARD ?PAYMENT|E-?PAYMENT|ONLINE PMT|\bBILL ?PAY\b|MORTGAGE|STUDENT LN|NAVIENT|NELNET|SALLIE MAE|LOAN (PMT|PAYMENT)|LENDING CLUB|AFFIRM PAYMENT|KLARNA PAYMENT/,
  },
  {
    reason: 'Rent & housing',
    re: /\bRENT\b(?!AL)|PROPERTY (MGMT|MANAGEMENT)|LANDLORD|\bHOA\b|APARTMENT(S)? LLC/,
  },
  {
    reason: 'Bills & utilities',
    re: /ELECTRIC|\bENERGY\b|POWER CO|\bUTILIT|WATER (BILL|DEPT|DISTRICT)|\bSEWER\b|COMCAST|XFINITY|SPECTRUM|CENTURYLINK|COX COMM|VERIZON|\bAT&T\b|\bATT\b PAYMENT|T-?MOBILE|US CELLULAR|AMEREN|\bPG&E\b|CON ?ED|DUKE ENERGY|COMED|NICOR/,
  },
  {
    reason: 'Insurance & medical billing',
    re: /INSURANCE|GEICO|PROGRESSIVE|ALLSTATE|STATE FARM|AETNA|CIGNA|HUMANA|BLUE CROSS|UNITEDHEALTH|ANTHEM\b/,
  },
  {
    reason: 'Government & taxes',
    re: /\bIRS\b|US TREASURY|TAX (PMT|PAYMENT)|\bDMV\b|DEPT OF REVENUE|SECRETARY OF STATE/,
  },
  {
    reason: 'Bank fees & cash',
    re: /INTEREST (PAYMENT|EARNED|CHARGE)|OVERDRAFT|MONTHLY (SERVICE )?FEE|SERVICE CHARGE|ATM (WITHDRAWAL|FEE)|CASH WITHDRAWAL|NON-?\w* ATM|CHECK\s?#?\s?\d+/,
  },
  {
    reason: 'Investing',
    re: /ROBINHOOD|FIDELITY|VANGUARD|SCHWAB|E\*?TRADE|WEALTHFRONT|BETTERMENT|ACORNS|COINBASE\.COM|COINBASE INC/,
  },
];

/**
 * Split parsed transactions into swipeable purchases vs auto-excluded noise.
 * Returns { deckable, excluded } where excluded items carry a reason.
 */
export function splitDiscretionary(txns) {
  const deckable = [];
  const excluded = [];
  for (const t of txns) {
    if (t.isCredit) {
      excluded.push({ txn: t, reason: 'Income & transfers' });
      continue;
    }
    const upper = t.rawDesc.toUpperCase();
    const hit = EXCLUDE_RULES.find((r) => r.re.test(upper));
    if (hit) excluded.push({ txn: t, reason: hit.reason });
    else deckable.push(t);
  }
  return { deckable, excluded };
}

/**
 * Mark recurring charges (stable amount, ~monthly cadence) as subscriptions.
 * Mutates txns in place, adding `sub: true` where detected.
 */
export function markSubscriptions(txns) {
  const groups = new Map();
  for (const t of txns) {
    const key = t.name;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  }
  for (const [, list] of groups) {
    const isKnownSub = list[0].category === 'Subscriptions';
    if (isKnownSub) {
      for (const t of list) t.sub = true;
      continue;
    }
    if (list.length < 2) continue;
    const amounts = list.map((t) => t.amount);
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    const stable = max - min <= Math.max(1.5, min * 0.02);
    if (!stable) continue;
    const dates = list.map((t) => t.date.getTime()).sort((a, b) => a - b);
    const gaps = [];
    for (let i = 1; i < dates.length; i++) gaps.push((dates[i] - dates[i - 1]) / 86400000);
    if (!gaps.length) continue;
    gaps.sort((a, b) => a - b);
    const median = gaps[Math.floor(gaps.length / 2)];
    if (median >= 20 && median <= 40) {
      for (const t of list) t.sub = true;
    }
  }
  return txns;
}

export function excludedSummary(excluded) {
  const counts = {};
  for (const e of excluded) counts[e.reason] = (counts[e.reason] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}
