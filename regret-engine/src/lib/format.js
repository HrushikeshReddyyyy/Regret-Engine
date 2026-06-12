export const usd = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: Math.abs(n) >= 100 ? 0 : 2,
    minimumFractionDigits: Math.abs(n) >= 100 ? 0 : 2,
  }).format(n);

export const usd0 = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.round(n));

export const pct = (x) => `${Math.round(x * 100)}%`;

export const fmtDate = (d) =>
  d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

export const fmtDateShort = (d) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
