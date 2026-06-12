// Run with: npm run smoke
// Validates the data pipeline against the demo statement + synthetic bank formats.

import { readFileSync } from 'node:fs';
import { parseTransactions } from '../src/lib/parseCsv.js';
import { cleanMerchant } from '../src/lib/clean.js';
import { splitDiscretionary, markSubscriptions } from '../src/lib/discretionary.js';
import { buildReport, pickHeadline } from '../src/lib/stats.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) console.log(`  PASS  ${name}`);
  else { console.error(`  FAIL  ${name} ${extra}`); failed++; }
}

function pipeline(csv) {
  const { txns, meta } = parseTransactions(csv);
  for (const t of txns) Object.assign(t, cleanMerchant(t.rawDesc));
  const { deckable, excluded } = splitDiscretionary(txns);
  markSubscriptions(deckable);
  return { txns, meta, deckable, excluded };
}

// ---------------------------------------------------------------- demo file
console.log('\n[1] Demo statement (Chase-style, sales negative)');
const demo = pipeline(readFileSync(new URL('../public/sample.csv', import.meta.url), 'utf8'));
check('parses 90+ rows', demo.txns.length >= 90, `got ${demo.txns.length}`);
check('payments flagged as credits', demo.txns.filter((t) => t.isCredit).length === 4,
  `got ${demo.txns.filter((t) => t.isCredit).length}`);
const dd = demo.deckable.filter((t) => t.name === 'DoorDash');
check('DoorDash recognized with emoji', dd.length >= 8 && dd[0].emoji === '🛵', `got ${dd.length}`);
check('Blue Bottle cleaned from SQ* string', demo.deckable.some((t) => t.name === 'Blue Bottle Coffee'));
const excludedNames = demo.excluded.map((e) => e.txn.rawDesc);
check('GEICO excluded as insurance', excludedNames.some((d) => d.includes('GEICO')));
check('Comcast excluded as utility', excludedNames.some((d) => d.includes('COMCAST')));
check('T-Mobile excluded as utility', excludedNames.some((d) => d.includes('T-MOBILE')));
check('card payment excluded', excludedNames.some((d) => d.includes('PAYMENT THANK YOU')));
check('Netflix kept in deck (subs are fair game)', demo.deckable.some((t) => t.name === 'Netflix'));
check('Netflix marked subscription', demo.deckable.find((t) => t.name === 'Netflix')?.sub === true);
check('Planet Fitness detected as recurring', demo.deckable.find((t) => t.name === 'Planet Fitness')?.sub === true);
const unknownLocal = demo.deckable.find((t) => t.rawDesc.includes('OBED'));
check('unknown local merchant cleaned + titled', !!unknownLocal && /Obed/.test(unknownLocal.name), unknownLocal?.name);
check('local merchant categorized', unknownLocal?.category !== undefined);

// --------------------------------------------------- debit/credit columns
console.log('\n[2] Checking-account format (Debit / Credit columns)');
const checking = pipeline(
  `Date,Description,Debit,Credit
01/05/2026,STARBUCKS #1234 SEATTLE WA,6.45,
01/06/2026,PAYROLL ACME CORP DIRECT DEP,,2150.00
01/07/2026,DOORDASH*THAI PLACE,28.90,
01/08/2026,ONLINE TRANSFER TO SAVINGS,500.00,
01/09/2026,NETFLIX.COM,15.49,`
);
check('parses all rows', checking.txns.length === 5, `got ${checking.txns.length}`);
check('payroll is credit', checking.txns.find((t) => t.rawDesc.includes('PAYROLL'))?.isCredit === true);
check('starbucks spend amount correct', checking.deckable.find((t) => t.name === 'Starbucks')?.amount === 6.45);
check('transfer excluded even though debit', checking.excluded.some((e) => e.txn.rawDesc.includes('TRANSFER')));

// ----------------------------------------------------- Amex-style positive
console.log('\n[3] Amex-style (charges positive, payments negative)');
const amex = pipeline(
  `Date,Description,Amount
01/05/2026,UBER EATS,32.10
01/06/2026,WHOLE FOODS MARKET,84.55
01/07/2026,SHELL OIL 1234,41.00
01/08/2026,CHIPOTLE ONLINE,12.85
01/09/2026,AUTOPAY PAYMENT RECEIVED,-180.00`
);
check('majority-sign heuristic: charges are spends', amex.deckable.length === 4, `got ${amex.deckable.length}`);
check('negative payment is credit', amex.txns.find((t) => t.rawDesc.includes('AUTOPAY'))?.isCredit === true);
check('Uber Eats not confused with Uber', amex.deckable.find((t) => t.rawDesc === 'UBER EATS')?.name === 'Uber Eats');

// ------------------------------------------------------------- headerless
console.log('\n[4] Headerless dump');
const headerless = pipeline(
  `2026-01-05,SQ *CORNER BAKERY CAFE,-12.40
2026-01-06,AMZN MKTP US*XY12,-55.20
2026-01-07,LYFT *RIDE,-17.80
2026-01-08,TRADER JOE'S #552,-63.10`
);
check('detects columns without headers', headerless.txns.length === 4, `got ${headerless.txns.length}`);
check('amounts normalized positive', headerless.deckable.every((t) => t.amount > 0));

// -------------------------------------------------------------- stats
console.log('\n[5] Stats engine + headline');
const rated = demo.deckable.slice(0, 60).map((t) => ({
  v: t.name === 'DoorDash' || t.name === 'Shein' ? 'r' : 'w',
  txn: t,
}));
const rep = buildReport(rated);
const headline = pickHeadline(rep);
check('report built', !!rep && rep.counts.judged === 60);
check('regret rate sane', rep.rate > 0 && rep.rate < 1, String(rep.rate));
check('top regret is DoorDash', rep.topRegrets[0]?.name === 'DoorDash', rep.topRegrets[0]?.name);
check('headline names the offender', /DoorDash/.test(headline), headline);
console.log(`        headline: "${headline}"`);
console.log(`        rate: ${Math.round(rep.rate * 100)}%, $${Math.round(rep.regretPerMonth)}/mo regretted`);

// Subscription regret path
const subRated = demo.deckable.filter((t) => t.sub).map((t) => ({ v: 'r', txn: t }));
const subRep = buildReport(subRated.concat(rated.filter((r) => r.v === 'w').slice(0, 10)));
check('subscription annualization computed', subRep.subAnnual > 100, String(subRep.subAnnual));

console.log(failed ? `\n${failed} FAILURE(S)\n` : '\nAll smoke tests passed.\n');
process.exit(failed ? 1 : 0);
