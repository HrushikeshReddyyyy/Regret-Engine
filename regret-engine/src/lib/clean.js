import { MERCHANTS, CATEGORY_EMOJI } from './merchants.js';

const US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]);

const CATEGORY_HINTS = [
  [/COFFEE|CAFE|ESPRESSO|ROASTER/, 'Coffee'],
  [/PIZZA|BURGER|GRILL|KITCHEN|RESTAURANT|SUSHI|TACO|THAI|RAMEN|NOODLE|BBQ|DINER|BISTRO|DELI|BAKERY|DONUT|WAFFLE|PANCAKE|CHICKEN|SEAFOOD|STEAK|CANTINA|EATERY|FOOD TRUCK/, 'Restaurants'],
  [/BREW|TAPROOM|\bBAR\b|\bPUB\b|LIQUOR|WINE|SPIRITS|LOUNGE/, 'Drinks'],
  [/MARKET|GROCER|FOODS|SUPERMARKET|FARMERS MKT/, 'Groceries'],
  [/FUEL|GAS STATION|PETROLEUM|\bOIL\b/, 'Gas'],
  [/SALON|NAILS|\bSPA\b|BARBER|BEAUTY|LASH|WAX/, 'Self-care'],
  [/FITNESS|GYM\b|YOGA|PILATES|CROSSFIT|ATHLETIC CLUB/, 'Fitness'],
  [/HOTEL|MOTEL|RESORT|\bINN\b|HOSTEL/, 'Travel'],
  [/AIRLINE|AIRWAYS|\bAIR\b/, 'Travel'],
  [/CINEMA|THEATRE|THEATER|MOVIES|BOWLING|ARCADE|MUSEUM|\bZOO\b/, 'Entertainment'],
  [/TRANSIT|METRO|TOLL|TAXI|\bCAB\b|SCOOTER|\bBIKE ?SHARE\b/, 'Transport'],
  [/PHARMACY|\bRX\b/, 'Shopping'],
  [/\bPET\b|VETERINARY|\bVET\b/, 'Shopping'],
  [/GAME|HOBBY|COMICS/, 'Gaming'],
];

const STRIP_PATTERNS = [
  /PURCHASE AUTHORIZED ON \d{1,2}\/\d{1,2}(\/\d{2,4})?/g,
  /RECURRING PAYMENT AUTHORIZED ON \d{1,2}\/\d{1,2}(\/\d{2,4})?/g,
  /\b(POS|DEBIT|CREDIT)\s+(CARD\s+)?(PURCHASE|TRANSACTION|PYMT)\b/g,
  /\bCHECKCARD\s*\d*\b/g,
  /\bCARD\s+\d{4}\b/g,
  /\b(SQ|TST|PY|SP|IN|GG|DD|EB|CKE|PYPL|PAYPAL|PP)\s*\*+\s*/g, // processor prefixes
  /\*+/g,
  /\bWWW\./g,
  /HTTPS?:\/\/\S+/g,
  /\.(COM|NET|ORG|CO|IO|APP|AI)\b/g,
  /\b\d{3}[-. ]\d{3}[-. ]\d{4}\b/g, // phone numbers
  /#\s?\w*\d+\w*/g, // store numbers like #08841
  /\b\d{5,}\b/g, // long reference numbers
  /\bX{2,}\d*\b/g, // masked digits
];

function titleCase(s) {
  return s
    .toLowerCase()
    .replace(/(^|[\s\-'&/.])([a-z])/g, (m, pre, ch) => pre + ch.toUpperCase());
}

/**
 * Clean a raw bank description into { name, emoji, category, known }.
 */
export function cleanMerchant(rawDesc) {
  const upper = String(rawDesc || '').toUpperCase();

  // 1. Known merchant table wins.
  for (const [re, name, emoji, category] of MERCHANTS) {
    if (re.test(upper)) return { name, emoji, category, known: true };
  }

  // 2. Generic cleanup.
  let s = ` ${upper} `;
  for (const re of STRIP_PATTERNS) s = s.replace(re, ' ');
  s = s.replace(/[^A-Z0-9&'./\- ]/g, ' ').replace(/\s{2,}/g, ' ').trim();

  // Drop a trailing 2-letter US state code ("BIG TACO PEORIA IL" -> "BIG TACO PEORIA").
  const tokens = s.split(' ');
  if (tokens.length >= 2 && US_STATES.has(tokens[tokens.length - 1])) {
    tokens.pop();
    s = tokens.join(' ');
  }

  // Keep it readable.
  if (s.length > 32) s = s.slice(0, 32).replace(/\s+\S*$/, '');
  if (!s) s = 'Unknown merchant';

  // 3. Guess a category from keywords (on the original string for max signal).
  let category = 'Other';
  for (const [re, cat] of CATEGORY_HINTS) {
    if (re.test(upper)) { category = cat; break; }
  }

  return {
    name: titleCase(s),
    emoji: CATEGORY_EMOJI[category] || '🧾',
    category,
    known: false,
  };
}
