/* Procedural surface textures: wood, plaster, woven rug, paper.
   Everything is drawn to canvas once at start-up — no image downloads. */
import * as THREE from '../vendor/three.bundle.js';

export const mulberry32 = a => () => {
  a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const shade = (hex, d) => {
  const n = parseInt(hex.slice(1), 16);
  const f = v => Math.max(0, Math.min(255, v + d));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
};
const tex = (canvas, { srgb = true, repeat, aniso = 8 } = {}) => {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
};
const grayscale = (src, filter = 'grayscale(1) contrast(1.5)') => {
  const c = cv(src.width, src.height), g = c.getContext('2d');
  g.filter = filter; g.drawImage(src, 0, 0); return c;
};
const speckle = (g, w, h, n, rnd, rgb, a0, a1, size = 1.4) => {
  for (let i = 0; i < n; i++) {
    g.fillStyle = `rgba(${rgb},${a0 + rnd() * (a1 - a0)})`;
    g.fillRect(rnd() * w, rnd() * h, size * (.5 + rnd()), size * (.5 + rnd()));
  }
};

/* ── wood: grain, plank seams, a few knots ───────────────── */
export function makeWood({ w = 1024, h = 1024, base = '#8a5a34', seed = 1, planks = 1, tint = 26, repeat, rough = .6 } = {}) {
  const rnd = mulberry32(seed), c = cv(w, h), g = c.getContext('2d');
  const ph = h / planks;
  for (let p = 0; p < planks; p++) {
    const y0 = p * ph;
    g.fillStyle = shade(base, (rnd() - .5) * tint * 2); g.fillRect(0, y0, w, ph);
    const lines = Math.floor(ph / 2.1);
    for (let k = 0; k < lines; k++) {
      const yy = y0 + rnd() * ph, amp = 2 + rnd() * 6, fr = .003 + rnd() * .009, p0 = rnd() * 6, dark = rnd() < .62;
      g.strokeStyle = dark ? `rgba(38,20,8,${.05 + rnd() * .14})` : `rgba(255,222,170,${.02 + rnd() * .07})`;
      g.lineWidth = .6 + rnd() * 2;
      g.beginPath();
      for (let x = 0; x <= w; x += 10) {
        const y = yy + Math.sin(x * fr + p0) * amp + Math.sin(x * fr * 3.1 + p0 * 2) * amp * .3;
        x ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    }
    if (rnd() < .5) {            /* a knot */
      const kx = rnd() * w, ky = y0 + ph * (.25 + rnd() * .5);
      for (let r = 20; r > 2; r -= 3) { g.strokeStyle = `rgba(40,22,10,${.07 + (20 - r) * .012})`; g.lineWidth = 1.2; g.beginPath(); g.ellipse(kx, ky, r * 2.1, r * .75, 0, 0, 7); g.stroke(); }
    }
    g.fillStyle = 'rgba(18,9,3,.6)'; g.fillRect(0, y0, w, 2);           /* seam */
    g.fillStyle = 'rgba(255,230,190,.08)'; g.fillRect(0, y0 + 2, w, 1);
    if (planks > 1) { const bx = rnd() * w; g.fillStyle = 'rgba(18,9,3,.5)'; g.fillRect(bx, y0, 2, ph); }
  }
  speckle(g, w, h, 4000, rnd, '30,16,6', .02, .09);
  return { map: tex(c, { repeat }), bump: tex(grayscale(c), { srgb: false, repeat }), rough };
}

/* ── plaster / painted wall with a faint paper weave ─────── */
export function makeWall({ base = '#b9a98c', stripe = false, seed = 4, repeat } = {}) {
  const rnd = mulberry32(seed), c = cv(512, 512), g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  if (stripe) for (let x = 0; x < 512; x += 64) { g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(x, 0, 32, 512); g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(x + 32, 0, 2, 512); }
  speckle(g, 512, 512, 9000, rnd, '60,50,35', .015, .06, 1.8);
  speckle(g, 512, 512, 5000, rnd, '255,255,255', .01, .035, 1.8);
  return { map: tex(c, { repeat }), bump: tex(grayscale(c, 'grayscale(1) contrast(2)'), { srgb: false, repeat }) };
}

/* ── woven rug: border, lattice field, medallion, pile ───── */
export function makeRug({ w = 2048, h = 1400, seed = 7 } = {}) {
  const rnd = mulberry32(seed), c = cv(w, h), g = c.getContext('2d');
  const red = '#6f1f25', deep = '#4b1318', cream = '#e6d6b2', navy = '#1d2c44', gold = '#b98a3c';
  g.fillStyle = red; g.fillRect(0, 0, w, h);
  const band = (inset, thick, col) => { g.fillStyle = col; g.fillRect(inset, inset, w - inset * 2, thick); g.fillRect(inset, h - inset - thick, w - inset * 2, thick); g.fillRect(inset, inset, thick, h - inset * 2); g.fillRect(w - inset - thick, inset, thick, h - inset * 2); };
  band(40, 26, cream); band(86, 62, navy); band(160, 14, gold); band(190, 20, cream);
  /* border motif */
  g.fillStyle = cream;
  for (let x = 120; x < w - 120; x += 64) { for (const y of [117, h - 117]) { g.beginPath(); g.moveTo(x, y - 18); g.lineTo(x + 18, y); g.lineTo(x, y + 18); g.lineTo(x - 18, y); g.fill(); } }
  for (let y = 120; y < h - 120; y += 64) { for (const x of [117, w - 117]) { g.beginPath(); g.moveTo(x, y - 18); g.lineTo(x + 18, y); g.lineTo(x, y + 18); g.lineTo(x - 18, y); g.fill(); } }
  /* lattice field */
  g.save(); g.beginPath(); g.rect(230, 230, w - 460, h - 460); g.clip();
  g.strokeStyle = deep; g.lineWidth = 7;
  for (let d = -h; d < w; d += 112) { g.beginPath(); g.moveTo(d, 0); g.lineTo(d + h, h); g.stroke(); g.beginPath(); g.moveTo(d + h, 0); g.lineTo(d, h); g.stroke(); }
  g.fillStyle = 'rgba(230,214,178,.55)';
  for (let x = 286; x < w; x += 112) for (let y = 230 + 56; y < h; y += 112) { g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); }
  g.restore();
  /* medallion */
  const cx = w / 2, cy = h / 2;
  const ring = (r, col) => { g.fillStyle = col; g.beginPath(); g.ellipse(cx, cy, r * 1.35, r, 0, 0, 7); g.fill(); };
  ring(300, deep); ring(280, cream); ring(262, navy); ring(210, red); ring(190, gold); ring(170, deep); ring(90, cream); ring(70, navy);
  g.fillStyle = cream;
  for (let a = 0; a < 16; a++) { const t = a / 16 * 6.283; g.beginPath(); g.ellipse(cx + Math.cos(t) * 235 * 1.35, cy + Math.sin(t) * 235, 16, 9, t, 0, 7); g.fill(); }
  /* woven thread texture + pile noise */
  for (let y = 0; y < h; y += 3) { g.fillStyle = `rgba(0,0,0,${.03 + rnd() * .05})`; g.fillRect(0, y, w, 1); }
  for (let x = 0; x < w; x += 3) { g.fillStyle = `rgba(255,255,255,${.012 + rnd() * .025})`; g.fillRect(x, 0, 1, h); }
  speckle(g, w, h, 90000, rnd, '0,0,0', .03, .12, 2);
  speckle(g, w, h, 50000, rnd, '255,235,200', .02, .07, 2);
  const bump = grayscale(c, 'grayscale(1) contrast(1.8) blur(.6px)');
  return { map: tex(c), bump: tex(bump, { srgb: false }) };
}

/* ── paper: used as the base of every printed page ───────── */
export function makePaperCanvas(w = 1024, h = 1460, seed = 9, tone = '#efe6d2') {
  const rnd = mulberry32(seed), c = cv(w, h), g = c.getContext('2d');
  g.fillStyle = tone; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) {
    g.strokeStyle = `rgba(120,95,60,${.02 + rnd() * .05})`; g.lineWidth = .6;
    const x = rnd() * w, y = rnd() * h, a = rnd() * 6.28, l = 6 + rnd() * 20;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  speckle(g, w, h, 6000, rnd, '110,85,50', .02, .08, 1.6);
  const v = g.createRadialGradient(w / 2, h / 2, h * .35, w / 2, h / 2, h * .8);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(90,60,25,.16)'); g.fillStyle = v; g.fillRect(0, 0, w, h);
  return c;
}

/* edge of a page block: many fine sheets */
export function makePageEdge(horizontal = true) {
  const c = cv(256, 256), g = c.getContext('2d');
  g.fillStyle = '#e9dfc8'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 2) { g.fillStyle = `rgba(110,90,55,${.1 + (i % 4) * .05})`; horizontal ? g.fillRect(0, i, 256, 1) : g.fillRect(i, 0, 1, 256); }
  const t = tex(c); return t;
}
export { tex, shade, speckle };
