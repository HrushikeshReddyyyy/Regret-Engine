// Draws the shareable "regret receipt" as a 1080x1350 PNG (4:5, feed-friendly).
// Pure canvas — no html2canvas flakiness.

const W = 1080;
const H = 1350;

const PAPER = '#F6F2E7';
const INK = '#1F1B14';
const FADED = '#8B8474';
const RED = '#C2362B';
const FELT = '#10241B';

function dashedLine(ctx, x1, x2, y) {
  ctx.save();
  ctx.strokeStyle = FADED;
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.restore();
}

function leaderRow(ctx, label, value, y, pad) {
  ctx.save();
  ctx.font = '500 34px "IBM Plex Mono", monospace';
  ctx.fillStyle = INK;
  ctx.textAlign = 'left';
  ctx.fillText(label, pad, y);
  ctx.textAlign = 'right';
  ctx.font = '700 34px "IBM Plex Mono", monospace';
  ctx.fillText(value, W - pad, y);
  const lw = ctx.measureText(value).width;
  ctx.textAlign = 'left';
  ctx.font = '500 34px "IBM Plex Mono", monospace';
  const startDots = pad + ctx.measureText(label).width + 18;
  const endDots = W - pad - lw - 18;
  ctx.fillStyle = FADED;
  for (let x = startDots; x < endDots; x += 16) ctx.fillText('.', x, y);
  ctx.restore();
}

function zigzag(ctx, yBase, dir) {
  // dir: 1 = teeth point down (bottom edge), -1 = teeth point up (top edge)
  ctx.save();
  ctx.fillStyle = FELT;
  ctx.beginPath();
  const tooth = 36;
  ctx.moveTo(0, yBase);
  for (let x = 0; x <= W; x += tooth) {
    ctx.lineTo(x + tooth / 2, yBase + dir * 22);
    ctx.lineTo(x + tooth, yBase);
  }
  ctx.lineTo(W, yBase + dir * 80);
  ctx.lineTo(0, yBase + dir * 80);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export async function drawShareCard(canvas, rep, headline) {
  const ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;

  try {
    await Promise.all([
      document.fonts.load('900 100px Archivo'),
      document.fonts.load('700 34px "IBM Plex Mono"'),
      document.fonts.load('500 34px "IBM Plex Mono"'),
    ]);
  } catch { /* fall back to system fonts */ }

  // Felt backdrop + paper receipt
  ctx.fillStyle = FELT;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 60, W, H - 120);
  zigzag(ctx, 60, -1);
  zigzag(ctx, H - 60, 1);

  const pad = 96;
  let y = 200;

  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = '700 40px "IBM Plex Mono", monospace';
  ctx.fillText('R E G R E T   E N G I N E', W / 2, y);
  y += 52;
  ctx.font = '500 28px "IBM Plex Mono", monospace';
  ctx.fillStyle = FADED;
  ctx.fillText('* OFFICIAL REGRET RECEIPT *', W / 2, y);
  y += 56;
  dashedLine(ctx, pad, W - pad, y);
  y += 60;

  // The big number
  const rateStr = `${Math.round(rep.rate * 100)}%`;
  ctx.fillStyle = RED;
  ctx.font = '900 300px Archivo, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(rateStr, W / 2, y + 240);
  y += 310;
  ctx.fillStyle = INK;
  ctx.font = '700 36px "IBM Plex Mono", monospace';
  ctx.fillText('OF MY SPENDING WAS REGRET', W / 2, y);
  y += 70;
  dashedLine(ctx, pad, W - pad, y);
  y += 76;

  const top = rep.topRegrets[0];
  leaderRow(ctx, 'REGRETTED / MO', `$${Math.round(rep.regretPerMonth).toLocaleString('en-US')}`, y, pad); y += 64;
  if (top) { leaderRow(ctx, 'TOP OFFENDER', top.name.toUpperCase().slice(0, 16), y, pad); y += 64; }
  leaderRow(ctx, 'RECEIPTS RATED', String(rep.counts.judged), y, pad); y += 64;
  if (rep.subMonthly >= 1) {
    leaderRow(ctx, 'REGRET SUBS / YR', `$${Math.round(rep.subAnnual).toLocaleString('en-US')}`, y, pad);
    y += 64;
  }
  y += 12;
  dashedLine(ctx, pad, W - pad, y);
  y += 70;

  // Headline, wrapped
  ctx.fillStyle = INK;
  ctx.font = '700 38px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  const words = (headline || '').split(' ');
  let line = '';
  const lines = [];
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > W - pad * 2 && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  for (const l of lines.slice(0, 3)) {
    ctx.fillText(l, W / 2, y);
    y += 52;
  }

  // Barcode footer (deterministic from the rate, just for the vibe)
  const by = H - 230;
  let x = pad + 40;
  let seed = Math.round(rep.rate * 997) + rep.counts.judged;
  ctx.fillStyle = INK;
  while (x < W - pad - 40) {
    seed = (seed * 1103515245 + 12345) % 2147483647;
    const bw = 4 + (seed % 12);
    if (seed % 3 !== 0) ctx.fillRect(x, by, bw, 80);
    x += bw + 6;
  }
  ctx.font = '500 26px "IBM Plex Mono", monospace';
  ctx.fillStyle = FADED;
  ctx.textAlign = 'center';
  ctx.fillText("WHAT'S YOUR NUMBER?", W / 2, by + 130);
}

export function downloadCanvas(canvas, filename = 'my-regret-receipt.png') {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, 'image/png');
}

export async function shareCanvas(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return resolve(false);
      const file = new File([blob], 'my-regret-receipt.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'My Regret Receipt' });
          return resolve(true);
        } catch { return resolve(false); }
      }
      resolve(false);
    }, 'image/png');
  });
}
