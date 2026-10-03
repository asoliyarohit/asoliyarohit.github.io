/* A book you can hold, open and read.
   Local frame (book lying flat, cover up): origin on the spine at table level,
   +x spine → fore-edge, +y up out of the cover, −z toward the top of the book.
   Covers are rigid boards on hinges; every page is a bendable surface, so a
   turning page curls the way real paper does. */
import * as THREE from '../vendor/three.bundle.js';
import { cv, tex, mulberry32, speckle, makePaperCanvas, makePageEdge } from './textures.js?v=20261016';

export const DIM = { H: .34, W: .235, cb: .0046, ov: .008 };
const SERIF = '"Instrument Serif", "Iowan Old Style", "Palatino Linotype", Georgia, serif';
const MONO = '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';
const STATUS = { completed: 'Completed', reading: 'Reading now', want: 'On the list' };
const EPS = .0011;

const smooth = t => t * t * (3 - 2 * t);
const clamp01 = t => Math.max(0, Math.min(1, t));

function wrapLines(g, text, maxW) {
  const words = String(text).split(/\s+/), lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line); return lines;
}

/* ── cover + spine artwork ───────────────────────────────── */
function drawCover(d, img) {
  const w = 1024, h = 1480, c = cv(w, h), g = c.getContext('2d'), rnd = mulberry32(d.title.length * 31 + 7);
  const grad = g.createLinearGradient(0, 0, w, h); grad.addColorStop(0, d.spine); grad.addColorStop(1, '#050507'); g.fillStyle = grad; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, w, h);
  if (img) {                              /* real cover artwork */
    const s = Math.max(w / img.width, h / img.height), iw = img.width * s, ih = img.height * s;
    g.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
  } else {
    g.strokeStyle = d.accent; g.globalAlpha = .55; g.lineWidth = 5; g.strokeRect(86, 86, w - 172, h - 172); g.lineWidth = 2; g.strokeRect(104, 104, w - 208, h - 208); g.globalAlpha = 1;
    g.fillStyle = d.accent; g.font = `500 34px ${MONO}`; g.textBaseline = 'alphabetic';
    g.fillText((d.genre || '').toUpperCase().split('').join(' '), 150, 210);
    g.font = `400 150px ${SERIF}`; g.fillStyle = '#f5f1e6'; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 12; g.shadowOffsetY = 4;
    const lines = wrapLines(g, d.title, w - 320); let y = h * .52 - (lines.length - 1) * 80;
    lines.forEach(l => { g.fillText(l, 150, y); y += 158; });
    g.shadowBlur = 0; g.shadowOffsetY = 0; g.fillStyle = d.accent; g.fillRect(150, y - 60, 170, 6);
    g.font = `500 38px ${MONO}`; g.fillStyle = 'rgba(245,241,230,.85)'; g.fillText(d.author.toUpperCase().split('').join(' '), 150, h - 190);
  }
  /* cloth / leather grain, hinge groove, soft light */
  speckle(g, w, h, 60000, rnd, '0,0,0', .03, .12, 2); speckle(g, w, h, 30000, rnd, '255,255,255', .015, .06, 2);
  const hinge = g.createLinearGradient(40, 0, 130, 0); hinge.addColorStop(0, 'rgba(0,0,0,.0)'); hinge.addColorStop(.35, 'rgba(0,0,0,.45)'); hinge.addColorStop(.55, 'rgba(255,255,255,.12)'); hinge.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = hinge; g.fillRect(40, 0, 90, h);
  const sheen = g.createLinearGradient(0, 0, w, h); sheen.addColorStop(0, 'rgba(255,255,255,.1)'); sheen.addColorStop(.4, 'rgba(255,255,255,0)'); sheen.addColorStop(1, 'rgba(0,0,0,.2)'); g.fillStyle = sheen; g.fillRect(0, 0, w, h);
  return c;
}
function drawSpine(d, T) {
  const w = 1480, h = 256, c = cv(w, h), g = c.getContext('2d'), rnd = mulberry32(d.title.length * 17 + 3);
  g.fillStyle = d.spine; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, 0, w, h);
  for (const x of [120, 160, w - 160, w - 120]) { g.fillStyle = d.accent; g.globalAlpha = .8; g.fillRect(x, 0, 6, h); g.globalAlpha = 1; }
  g.fillStyle = '#f2ecdc'; g.textBaseline = 'middle';
  let fs = 92; g.font = `400 ${fs}px ${SERIF}`; while (g.measureText(d.title).width > w - 560 && fs > 44) { fs -= 4; g.font = `400 ${fs}px ${SERIF}`; }
  g.fillText(d.title, 230, h / 2 - 6);
  g.font = `500 34px ${MONO}`; g.fillStyle = d.accent; const au = d.author.toUpperCase(); g.fillText(au, w - 230 - g.measureText(au).width, h / 2 + 2);
  speckle(g, w, h, 20000, rnd, '0,0,0', .03, .12, 2);
  const shade = g.createLinearGradient(0, 0, 0, h); shade.addColorStop(0, 'rgba(255,255,255,.14)'); shade.addColorStop(.5, 'rgba(255,255,255,0)'); shade.addColorStop(1, 'rgba(0,0,0,.3)'); g.fillStyle = shade; g.fillRect(0, 0, w, h);
  return c;
}

/* ── printed pages ───────────────────────────────────────── */
const PW = 1024, PH = 1460, M = 118;
function pageBase(seed, leftSide) {
  const c = makePaperCanvas(PW, PH, seed), g = c.getContext('2d');
  const gut = leftSide ? g.createLinearGradient(PW, 0, PW - 150, 0) : g.createLinearGradient(0, 0, 150, 0);
  gut.addColorStop(0, 'rgba(60,40,15,.38)'); gut.addColorStop(1, 'rgba(60,40,15,0)'); g.fillStyle = gut; g.fillRect(0, 0, PW, PH);
  return { c, g };
}
const pageNo = (g, n) => { g.fillStyle = '#9a7a50'; g.font = `400 34px ${MONO}`; g.textAlign = 'center'; g.fillText(String(n), PW / 2, PH - 76); g.textAlign = 'left'; };
const chapter = (g, t) => { g.fillStyle = '#7d5226'; g.font = `500 34px ${MONO}`; g.fillText(t.toUpperCase().split('').join(' '), M, 190); };
const heading = (g, t) => { g.fillStyle = '#1b130b'; g.font = `400 116px ${SERIF}`; g.fillText(t, M, 320); g.fillStyle = '#b4492a'; g.fillRect(M, 356, 130, 5); };

export function drawPages(d) {
  const out = {};
  /* inside front cover — endpaper with an ex-libris plate */
  { const c = cv(PW, PH), g = c.getContext('2d'); g.fillStyle = '#6e2024'; g.fillRect(0, 0, PW, PH);
    g.strokeStyle = 'rgba(240,215,170,.1)'; g.lineWidth = 4; for (let k = -PH; k < PW + PH; k += 70) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + PH, PH); g.stroke(); g.beginPath(); g.moveTo(k + PH, 0); g.lineTo(k, PH); g.stroke(); }
    speckle(g, PW, PH, 30000, mulberry32(3), '0,0,0', .04, .14, 2);
    const px = 150, py = 330, pw = PW - 300, ph = 760; g.fillStyle = '#efe6d2'; g.fillRect(px, py, pw, ph);
    g.strokeStyle = '#9a6b3a'; g.lineWidth = 5; g.strokeRect(px + 22, py + 22, pw - 44, ph - 44); g.lineWidth = 2; g.strokeRect(px + 34, py + 34, pw - 68, ph - 68);
    g.textAlign = 'center'; g.fillStyle = '#9a6b3a'; g.font = `500 32px ${MONO}`; g.fillText('E X   L I B R I S', PW / 2, py + 130);
    g.fillStyle = '#251b12'; g.font = `400 88px ${SERIF}`; const tl = wrapLines(g, d.title, pw - 150); let y = py + 270; tl.forEach(l => { g.fillText(l, PW / 2, y); y += 96; });
    g.fillStyle = '#6b4a2a'; g.font = `400 48px ${SERIF}`; g.fillText(d.author, PW / 2, y + 20);
    g.save(); g.translate(PW / 2, py + ph - 150); g.rotate(-.06); g.strokeStyle = '#b4492a'; g.fillStyle = '#b4492a'; g.lineWidth = 5; g.font = `500 34px ${MONO}`;
    const st = (STATUS[d.status] || d.status).toUpperCase().split('').join(' '), sw = g.measureText(st).width + 50; g.strokeRect(-sw / 2, -34, sw, 68); g.fillText(st, 0, 12); g.restore();
    if (d.rating) { g.fillStyle = '#9a6b3a'; g.font = `400 40px ${MONO}`; g.fillText(d.rating, PW / 2, py + ph - 70); }
    const gut = g.createLinearGradient(PW, 0, PW - 150, 0); gut.addColorStop(0, 'rgba(0,0,0,.4)'); gut.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gut; g.fillRect(0, 0, PW, PH);
    out.exlibris = c; }
  /* chapter I — the summary (right page) */
  { const { c, g } = pageBase(11, false); chapter(g, 'Chapter I'); heading(g, 'The summary');
    g.fillStyle = '#1b130b'; g.font = `400 70px ${SERIF}`; const txt = d.summary || ''; const first = txt.charAt(0), rest = txt.slice(1);
    g.fillStyle = '#b4492a'; g.font = `400 250px ${SERIF}`; g.fillText(first, M - 6, 640);
    g.fillStyle = '#1b130b'; g.font = `400 70px ${SERIF}`;
    const dropW = 170, lines = []; const all = wrapLines(g, rest, PW - M * 2); /* reflow: first 3 lines indented for the drop cap */
    let words = rest.split(/\s+/), li = 0, line = '', y = 470;
    const maxFor = i => PW - M * 2 - (i < 3 ? dropW : 0);
    for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxFor(li) && line) { lines.push({ t: line, i: li }); li++; line = w; } else line = t; }
    if (line) lines.push({ t: line, i: li });
    lines.forEach(l => { g.fillText(l.t, M + (l.i < 3 ? dropW : 0), y); y += 92; });
    pageNo(g, 1); out.summary = c; }
  /* chapter II — thoughts (left page) */
  { const { c, g } = pageBase(12, true); chapter(g, 'Chapter II'); heading(g, 'My thoughts');
    g.fillStyle = '#dcbb9a'; g.font = `400 360px ${SERIF}`; g.fillText('“', M - 10, 640);
    g.fillStyle = '#1b130b'; g.font = `italic 400 82px ${SERIF}`; const q = (d.thoughts || '').replace(/^"|"$/g, ''); let y = 640;
    wrapLines(g, q, PW - M * 2 - 20).forEach(l => { g.fillText(l, M + 8, y); y += 104; });
    pageNo(g, 2); out.thoughts = c; }
  /* chapter III — details (right page); remember where the link sits */
  { const { c, g } = pageBase(13, false); chapter(g, 'Chapter III'); heading(g, 'The details');
    let y = 500; const row = (k, v) => { if (!v) return; g.fillStyle = '#9a6b3a'; g.font = `500 32px ${MONO}`; g.fillText(k.toUpperCase().split('').join(' '), M, y); g.fillStyle = '#1b130b'; g.font = `400 68px ${SERIF}`; g.textAlign = 'right'; g.fillText(v, PW - M, y + 4); g.textAlign = 'left'; g.strokeStyle = 'rgba(100,70,35,.35)'; g.setLineDash([6, 8]); g.lineWidth = 2; g.beginPath(); g.moveTo(M, y + 36); g.lineTo(PW - M, y + 36); g.stroke(); g.setLineDash([]); y += 124; };
    row('Genre', d.genre); row('Time', d.time); row('Finished', d.date || (d.status === 'reading' ? 'In progress' : ''));
    if (d.link) { g.fillStyle = '#b4492a'; g.font = `500 38px ${MONO}`; const t = 'FIND IT ON AMAZON ↗'; g.fillText(t, M, y + 40); const tw = g.measureText(t).width; g.fillRect(M, y + 54, tw, 3); out.link = { u0: M / PW, u1: (M + tw) / PW, v0: 1 - (y + 70) / PH, v1: 1 - (y + 0) / PH }; }
    pageNo(g, 3); out.details = c; }
  /* the last page (left) */
  { const { c, g } = pageBase(14, true); g.textAlign = 'center'; g.fillStyle = '#b4492a'; g.font = `400 240px ${SERIF}`; g.fillText('❦', PW / 2, 640);
    g.fillStyle = '#251b12'; g.font = `400 130px ${SERIF}`; g.fillText('Fin.', PW / 2, 830); g.fillStyle = '#9a7a50'; g.font = `500 32px ${MONO}`; g.fillText('T H E   E N D', PW / 2, 920); out.fin = c; }
  /* inside back cover */
  { const c = cv(PW, PH), g = c.getContext('2d'); g.fillStyle = '#6e2024'; g.fillRect(0, 0, PW, PH);
    g.strokeStyle = 'rgba(240,215,170,.1)'; g.lineWidth = 4; for (let k = -PH; k < PW + PH; k += 70) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + PH, PH); g.stroke(); g.beginPath(); g.moveTo(k + PH, 0); g.lineTo(k, PH); g.stroke(); }
    speckle(g, PW, PH, 30000, mulberry32(4), '0,0,0', .04, .14, 2);
    const gut = g.createLinearGradient(0, 0, 150, 0); gut.addColorStop(0, 'rgba(0,0,0,.4)'); gut.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gut; g.fillRect(0, 0, PW, PH); out.base = c; }
  return out;
}

/* ── a bendable page ─────────────────────────────────────── */
function makeLeaf(Wp, Hp, nx, nz, frontTex, backTex) {
  const cols = nx + 1, rows = nz + 1, n = cols * rows;
  const pos = new THREE.BufferAttribute(new Float32Array(n * 3), 3); pos.setUsage(THREE.DynamicDrawUsage);
  const nor = new THREE.BufferAttribute(new Float32Array(n * 3), 3); nor.setUsage(THREE.DynamicDrawUsage);
  const uvF = new Float32Array(n * 2), uvB = new Float32Array(n * 2), idx = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const k = j * cols + i; uvF[k * 2] = i / nx; uvF[k * 2 + 1] = 1 - j / nz; uvB[k * 2] = 1 - i / nx; uvB[k * 2 + 1] = 1 - j / nz;
    if (i < nx && j < nz) { const a = k, b = k + 1, c = k + cols, d = k + cols + 1; idx.push(a, c, b, b, c, d); }
  }
  const gF = new THREE.BufferGeometry(), gB = new THREE.BufferGeometry();
  for (const [g, uv] of [[gF, uvF], [gB, uvB]]) { g.setAttribute('position', pos); g.setAttribute('normal', nor); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); }
  const mf = new THREE.MeshStandardMaterial({ map: frontTex, roughness: .88, side: THREE.FrontSide });
  const mb = new THREE.MeshStandardMaterial({ map: backTex, roughness: .88, side: THREE.BackSide });
  const front = new THREE.Mesh(gF, mf), back = new THREE.Mesh(gB, mb);
  for (const m of [front, back]) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; }
  const grp = new THREE.Group(); grp.add(front, back);
  return { grp, front, back, gF, pos, nx, nz, Wp, Hp, cols, rows };
}

/* ═════════════════════════ Book3D ═════════════════════════ */
export class Book3D {
  constructor(data, index, T) {
    this.data = data; this.index = index; this.T = T;
    const { H, W, cb, ov } = DIM; this.Tb = T - 2 * cb;
    this.group = new THREE.Group(); this.group.userData.book = this;
    this.coverCanvas = drawCover(data); this.coverTex = tex(this.coverCanvas);
    this.spineTex = tex(drawSpine(data, T));
    const cloth = new THREE.MeshStandardMaterial({ color: new THREE.Color(data.spine).multiplyScalar(.72), roughness: .7, metalness: 0 });
    this.cloth = cloth;
    const edgeH = makePageEdge(true); const edge = new THREE.MeshStandardMaterial({ map: edgeH, roughness: .92 });
    const paper = new THREE.MeshStandardMaterial({ color: '#e9dfc9', roughness: .95 });

    const mk = (w, h, d, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.castShadow = true; m.receiveShadow = true; return m; };
    /* back cover + spine board */
    this.back = mk(W + ov, cb, H + 2 * ov, cloth); this.back.position.set((W + ov) / 2 - .0, cb / 2, 0); this.group.add(this.back);
    this.spineBoard = mk(cb, T, H + 2 * ov, cloth); this.spineBoard.position.set(-cb / 2, T / 2, 0); this.group.add(this.spineBoard);
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(H + 2 * ov, T), new THREE.MeshStandardMaterial({ map: this.spineTex, roughness: .6 }));
    sp.rotation.y = -Math.PI / 2; sp.position.set(-cb - .0004, T / 2, 0); sp.receiveShadow = true; this.group.add(sp); this.spinePlane = sp;
    /* right page block (full thickness while closed) */
    const blockMats = [edge, paper, paper, paper, edge, edge];            /* +x fore-edge, −x, +y, −y, +z, −z */
    this.rBlock = mk(W - .006, 1, H - .006, blockMats); this.rBlock.position.x = (W - .006) / 2 + .002; this.group.add(this.rBlock);
    /* front cover — a rigid board on a hinge, carrying the left half of the pages once open */
    this.cover = new THREE.Group(); this.group.add(this.cover);
    const board = mk(W + ov, cb, H + 2 * ov, cloth); board.position.set((W + ov) / 2, -cb / 2, 0); this.cover.add(board);
    const outer = new THREE.Mesh(new THREE.PlaneGeometry(W + ov, H + 2 * ov), new THREE.MeshStandardMaterial({ map: this.coverTex, roughness: .55 }));
    outer.rotation.x = -Math.PI / 2; outer.position.set((W + ov) / 2, .0004, 0); outer.receiveShadow = true; this.cover.add(outer); this.outerCover = outer;
    this.lBlock = mk(W - .006, 1, H - .006, blockMats); this.lBlock.position.x = (W - .006) / 2 + .002; this.cover.add(this.lBlock);
    this.cover.userData.hinge = true;
    this.coverProg = 0; this.leafProg = [0, 0]; this.pagesReady = false;
    this.layout();
  }

  /* lazily build the printed pages and the bendable leaves */
  ensurePages() {
    if (this.pagesReady) return; this.pagesReady = true;
    const { H, W, cb, ov } = DIM, d = this.data, p = drawPages(d); this.pageCanvases = p;
    const T = canvas => { const t = tex(canvas, { aniso: 8 }); t.generateMipmaps = true; return t; };
    this.linkRegion = p.link;
    /* inside of the front cover (left page once open) */
    const inner = new THREE.Mesh(new THREE.PlaneGeometry(W + ov, H + 2 * ov), new THREE.MeshStandardMaterial({ map: T(p.exlibris), roughness: .8 }));
    inner.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, -1, 0)));
    inner.position.set((W + ov) / 2, -cb - .0004 - this.Tb * 0, 0); inner.receiveShadow = true; inner.userData.page = 'left'; this.cover.add(inner); this.innerCover = inner;
    /* bare inside back cover */
    const base = new THREE.Mesh(new THREE.PlaneGeometry(W + ov, H + 2 * ov), new THREE.MeshStandardMaterial({ map: T(p.base), roughness: .8 }));
    base.rotation.x = -Math.PI / 2; base.position.set((W + ov) / 2, DIM.cb + .0003, 0); base.receiveShadow = true; this.baseSheet = base; this.group.add(base);
    /* two bendable leaves: [summary | thoughts], [details | fin] */
    this.leaves = [
      makeLeaf(W - .006, H - .006, 44, 6, T(p.summary), T(p.thoughts)),
      makeLeaf(W - .006, H - .006, 44, 6, T(p.details), T(p.fin)),
    ];
    this.leaves.forEach(l => this.group.add(l.grp));
    this.leaves[0].front.userData.page = 'right'; this.leaves[1].front.userData.page = 'right';
    this.leaves[0].back.userData.page = 'left'; this.leaves[1].back.userData.page = 'left';
    this.layout();
  }

  /* position everything for the current cover/leaf progress (call after any change) */
  layout() {
    const { T, Tb } = this, { cb } = DIM;
    const cs = smooth(clamp01(this.coverProg));
    /* the page block moves from the right-hand side to the left as the pages turn */
    const tl = Tb * .5 * (smooth(clamp01(this.leafProg[0])) + smooth(clamp01(this.leafProg[1]))), tr = Tb - tl;
    this.rBlock.scale.y = Math.max(tr, .0001); this.rBlock.position.y = cb + tr / 2; this.rBlock.visible = tr > .0005;
    this.lBlock.scale.y = Math.max(tl, .0001); this.lBlock.position.y = -cb - tl / 2 - .0006; this.lBlock.visible = tl > .0005;
    /* once open, the spine drops below the gutter instead of poking up between the pages */
    const sh = THREE.MathUtils.lerp(1, (cb + .01) / T, cs);
    this.spineBoard.scale.y = sh; this.spineBoard.position.y = T * sh / 2;
    this.spinePlane.scale.y = sh; this.spinePlane.position.y = T * sh / 2;
    this.cover.position.y = THREE.MathUtils.lerp(T, 0, cs);
    this.cover.rotation.z = Math.PI * cs;
    if (this.innerCover) this.innerCover.visible = true;
    if (!this.leaves) return;
    const rTop = cb + tr, lTop = cb + tl + .0006;
    this.leaves.forEach((leaf, i) => {
      const t = this.leafProg[i];
      this.bend(leaf, t, rTop + (2 - i) * EPS * 1.4 + .0006, lTop + (i + 1) * EPS * 1.4 + .0006, cs);
    });
    this.baseSheet.position.y = cb + .0003;
  }

  bend(leaf, t, yR, yL, coverOpen) {
    const { Wp, Hp, nx, nz, cols, rows, pos } = leaf, a = pos.array;
    const ease = smooth(t), theta = Math.PI * ease, mid = Math.sin(Math.PI * t);
    const hingeY = THREE.MathUtils.lerp(yR, yL, ease), ds = Wp / nx;
    for (let j = 0; j < rows; j++) {
      const z = -Hp / 2 + Hp * j / nz, zk = (j / nz - .5) * 2;                     /* −1 … 1 along the page height */
      let x = 0, y = hingeY;
      for (let i = 0; i < cols; i++) {
        const s = i / nx;
        if (i > 0) {
          const sm = (i - .5) / nx;
          const lag = (1.15 * Math.pow(sm, .85) * (1 + .22 * zk)) * mid;           /* the free edge trails behind the hinge */
          let phi = theta - lag; phi = Math.max(0, Math.min(Math.PI, phi));
          x += Math.cos(phi) * ds; y += Math.sin(phi) * ds;
        }
        const rest = 1 - mid;                                                      /* pages settle into the gutter when still */
        const dip = -.0042 * Math.exp(-s * Wp / .03) * rest;
        const k = (j * cols + i) * 3; a[k] = x; a[k + 1] = y + dip; a[k + 2] = z;
      }
    }
    pos.needsUpdate = true; leaf.gF.computeVertexNormals(); leaf.gF.attributes.normal.needsUpdate = true;
  }

  /* world-space point on the top edge, halfway between the two grip points */
  gripLocal(f) { return new THREE.Vector3(DIM.W * f, this.T / 2, -DIM.H / 2 + .02); }

  /* meshes a click can land on */
  hitTargets() { const t = [this.rBlock, this.baseSheet, this.innerCover, this.outerCover]; if (this.leaves) this.leaves.forEach(l => t.push(l.front, l.back)); return t.filter(Boolean); }
  dispose() { this.group.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }

  /* real cover artwork replaces the generated cover when it arrives */
  loadCover() {
    const d = this.data, src = d.cover || (d.isbn ? `https://covers.openlibrary.org/b/isbn/${d.isbn}-L.jpg?default=false` : '');
    if (!src) return;
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => { if (img.naturalWidth < 80) return; this.coverCanvas = drawCover(d, img); this.coverTex.image = this.coverCanvas; this.coverTex.needsUpdate = true; };
    img.src = src;
  }
}
