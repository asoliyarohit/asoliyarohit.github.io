/* The reading room — scene controller.
   Two drones lift the chosen book off the shelf and carry it to the rug,
   a little robot tidies it, the camera moves in, and you read it by
   clicking its pages. */
import * as THREE from '../vendor/three.bundle.js';
import { buildRoom, LAYOUT } from './room.js?v=20261015';
import { Drone, Robot } from './characters.js?v=20261015';
import { Book3D, DIM } from './book.js?v=20261015';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const Q = () => new THREE.Quaternion();
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lerp = THREE.MathUtils.lerp, clamp = THREE.MathUtils.clamp;
const E = {
  inOut: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  lin: t => t,
  soft: t => t * t * (3 - 2 * t),
};
const THICK = [.064, .054, .058, .05, .068, .056];
const GAP = .028;
const STAND = Q().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(0, 0, -1), V(1, 0, 0), V(0, -1, 0)));
const qAxis = (axis, a) => Q().setFromAxisAngle(axis, a);
const X = V(1, 0, 0), Y = V(0, 1, 0);
const FA = .2, FB = .8;             /* where along the top edge each drone grips (fraction of the book depth) */

export async function start(root, books) {
  const $ = s => root.querySelector(s);
  const canvas = $('#stage'), titlecard = $('#titlecard'), hint = $('#hint'), putback = $('#putback'), loader = $('#loader');

  /* ── renderer, room, camera ─────────────────────────── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.5 : 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
  const room = buildRoom(renderer), scene = room.scene;
  const camera = new THREE.PerspectiveCamera(36, 1.6, .05, 40);
  const cam = { pos: V(0, 1.55, 4.6), look: V(0, 1.12, 0) }, CAM_HOME = { pos: V(0, 1.55, 4.6), look: V(0, 1.12, 0) };
  const resize = () => {
    const w = root.clientWidth, h = root.clientHeight; renderer.setSize(w, h, false);
    camera.aspect = w / h; const need = 2 * Math.atan(Math.tan(Math.atan(1.18 / 5.4)) / camera.aspect) * 180 / Math.PI;
    camera.fov = Math.max(36, need); camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(root); resize();

  /* a top-down reading view that always fits the open book on screen */
  const readingCam = () => {
    const th = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const dist = Math.max(.3 / (th * camera.aspect), .235 / th) * 1.2, dir = V(0, .97, .22).normalize();
    const look = V(0, .012, LAYOUT.rugCenter.z - .01); return { pos: look.clone().addScaledVector(dir, dist), look };
  };

  /* ── the six books, standing on the top shelf ───────── */
  const total = THICK.reduce((a, b) => a + b, 0) + GAP * (THICK.length - 1);
  let x = -total / 2; const slots = [];
  const shelf = books.map((d, i) => {
    const T = THICK[i % THICK.length], b = new Book3D(d, i, T);
    slots.push({ x: x + T / 2, z: LAYOUT.shelfFront - .024 }); x += T + GAP;
    b.group.quaternion.copy(STAND);
    b.group.position.set(slots[i].x - T / 2, LAYOUT.topY + DIM.H / 2 + DIM.ov, slots[i].z);
    b.home = b.group.position.clone(); b.hover = 0;
    scene.add(b.group); b.loadCover(); return b;
  });

  /* ── the helpers ────────────────────────────────────── */
  const dA = new Drone('orange'), dB = new Drone('teal'), robot = new Robot();
  dA.group.visible = dB.group.visible = robot.group.visible = false;
  scene.add(dA.group, dB.group, robot.group);
  dA.group.position.set(-3.4, 3, .5); dB.group.position.set(3.4, 3.1, .2); robot.group.position.set(3.2, 0, 1.0);
  const drones = [dA, dB];

  /* ── tweening on one clock ──────────────────────────── */
  let now = 0; const tweens = [];
  const tween = (dur, fn, ease = E.inOut) => new Promise(res => { dur = REDUCED ? Math.min(dur, .01) : dur; tweens.push({ t0: now, dur, fn, ease, res }); });
  const wait = s => tween(s, () => { }, E.lin);
  const runTweens = () => { for (let i = tweens.length - 1; i >= 0; i--) { const tw = tweens[i], p = clamp((now - tw.t0) / tw.dur, 0, 1); tw.fn(tw.ease(p), p); if (p >= 1) { tweens.splice(i, 1); tw.res(); } } };
  const camTo = (pos, look, dur, ease = E.inOut) => { const p0 = cam.pos.clone(), l0 = cam.look.clone(); return tween(dur, t => { cam.pos.lerpVectors(p0, pos, t); cam.look.lerpVectors(l0, look, t); }, ease); };
  const moveV = (v, to, dur, ease) => { const a = v.clone(); return tween(dur, t => v.lerpVectors(a, to, t), ease); };

  /* while the drones carry a book home, the camera follows it so it never leaves the frame */
  const follow = { on: false };

  /* ── a book held by two drones ───────────────────────── */
  const carry = { on: false, book: null, pivot: V(), quat: Q(), wob: 0, offA: V(-.13, .4, .02), offB: V(.13, .4, -.02), lift: 0, gap: .09, follow: 9 };
  const tmpQ = Q(), alignQ = Q().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(0, 1, 0), V(0, 0, -1), V(-1, 0, 0)));
  const _a = V(), _b = V(), _c = V(), _d = V(), _f1 = V(), _f2 = V();
  function syncCarry(dt) {
    if (!carry.on) return; const bk = carry.book, pl = bk.gripLocal(.5);
    const R = tmpQ.copy(carry.quat).multiply(qAxis(X, carry.wob));
    bk.group.quaternion.copy(R); bk.group.position.copy(carry.pivot).sub(_a.copy(pl).applyQuaternion(R));
    bk.group.updateMatrixWorld(true);
    [[dA, FA, carry.offA], [dB, FB, carry.offB]].forEach(([d, f, off]) => {
      const gl = bk.gripLocal(f), gp = _b.copy(gl).sub(pl).applyQuaternion(R).add(carry.pivot);
      const hand = _c.set(0, 0, -.045).applyQuaternion(R).add(gp); hand.y += carry.lift;
      const target = _d.copy(gp).add(off);
      d.group.position.lerp(target, 1 - Math.exp(-dt * carry.follow));
      d.group.rotation.y = lerp(d.group.rotation.y, d === dA ? .35 : -.35, 1 - Math.exp(-dt * 3));
      d.group.updateMatrixWorld(true);
      /* the rod reaches from the drone's winch to the hand */
      const G = d.grip.getWorldPosition(_a), v = d.group.worldToLocal(hand.clone()).sub(d.group.worldToLocal(G.clone()));
      const len = v.length(); d.grip.quaternion.setFromUnitVectors(V(0, -1, 0), v.normalize()); d.setRod(Math.max(.05, len - .012));
      d.group.updateMatrixWorld(true);
      d.grip.updateWorldMatrix(true, false);
      const gq = d.grip.getWorldQuaternion(Q()), want = R.clone().multiply(alignQ);
      d.hand.quaternion.copy(gq.invert().multiply(want)); d.setGap(carry.gap);
    });
  }
  const gapClosed = bk => bk.T + .011;

  /* ── scene state ─────────────────────────────────────── */
  let state = 'idle', cur = null;
  const setState = s => { state = s; root.dataset.state = s; };
  const say = (t, show = true) => { if (t) hint.textContent = t; hint.classList.toggle('off', !show); };

  /* ── helpers for flying ──────────────────────────────── */
  const bez = (p0, p1, p2, t, out) => out.set((1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x, (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y, (1 - t) * (1 - t) * p0.z + 2 * (1 - t) * t * p1.z + t * t * p2.z);
  const fly = (d, to, dur, lift = .25, ease = E.inOut) => { const a = d.group.position.clone(), c = a.clone().lerp(to, .5); c.y = Math.max(a.y, to.y) + lift; return tween(dur, t => bez(a, c, to, t, d.group.position), ease); };
  const restPivot = bk => bk.group.localToWorld(bk.gripLocal(.5));
  const hoverFor = (bk, f, off) => { const gl = bk.gripLocal(f), pl = bk.gripLocal(.5), R = bk.group.quaternion; return gl.clone().sub(pl).applyQuaternion(R).add(restPivot(bk)).add(off); };

  /* ── fetch the book ──────────────────────────────────── */
  async function pullOut(i) {
    if (state !== 'idle') return;
    setState('busy'); say('', false); root.classList.add('cinema');
    const bk = shelf[i]; cur = { i, bk };
    bk.hover = 0; bk.group.position.copy(bk.home);
    const fonts = document.fonts ? Promise.all([document.fonts.load('400 48px "Instrument Serif"'), document.fonts.load('italic 400 48px "Instrument Serif"'), document.fonts.load('500 30px "JetBrains Mono"')]).catch(() => 0) : 0;
    const pages = Promise.race([fonts, wait(1.6)]).then(() => bk.ensurePages());
    dA.group.visible = dB.group.visible = robot.group.visible = true;

    /* the robot rolls in from the right while the drones swoop in */
    robot.group.position.set(3.1, 0, 1.15); robot.group.rotation.y = -Math.PI / 2 + .1; robot.setEyes('normal');
    const rStation = V(camera.aspect < 1 ? .62 : 1.05, 0, 1.1);
    const robotIn = (async () => {
      let last = 3.1;
      await tween(3.4, t => { const px = lerp(3.1, rStation.x, t); robot.roll(last - px); last = px; robot.group.position.set(px, 0, lerp(1.15, rStation.z, t)); }, E.out);
      await tween(.9, t => { robot.group.rotation.y = lerp(-Math.PI / 2 + .1, -.38, t); }, E.inOut); robot.setEyes('wide');
    })();

    dA.group.position.set(-3.2, 3.0, .6); dB.group.position.set(3.2, 3.15, .4); dA.group.rotation.y = .6; dB.group.rotation.y = -.6;
    carry.book = bk; carry.pivot.copy(restPivot(bk)); carry.quat.copy(STAND); carry.wob = 0; carry.lift = .12; carry.gap = .09; carry.on = false;
    const hA = hoverFor(bk, FA, carry.offA), hB = hoverFor(bk, FB, carry.offB);
    hA.y += .14; hB.y += .14;
    camTo(V(0, 2.02, 2.35), V(0, 2.0, -1.1), 2.2, E.sine);
    await Promise.all([fly(dA, hA, 2.2, .5), (async () => { await wait(.25); await fly(dB, hB, 2.2, .45); })()]);
    carry.on = true; carry.follow = 7;
    await pages;

    /* lower the hands into the gaps either side of the book, then pinch */
    await tween(.9, t => { carry.lift = lerp(.14, 0, t); }, E.sine);
    await wait(.15);
    const gc = gapClosed(bk);
    await tween(.6, t => { carry.gap = lerp(.09, gc, t); }, E.inOut);

    /* two tugs, then it slides clear of the shelf */
    const p0 = restPivot(bk), top = p0.y;
    const tug = (up, dur) => tween(dur, t => { carry.pivot.y = top + up * Math.sin(Math.PI * t); carry.wob = .03 * Math.sin(t * 20) * (1 - t); }, E.sine);
    await tug(.012, .45); await wait(.08); await tug(.026, .55); await wait(.1);
    await tween(1.35, t => { carry.pivot.y = top + .332 * t; carry.pivot.x = p0.x + Math.sin(t * 9) * .0025 * (1 - t); }, E.inOut);

    /* the carry: a long arc over the shelf lip, turning the book flat as it travels */
    const rug = LAYOUT.rugCenter, yaw = -.22;
    const QL = qAxis(Y, yaw), rest = V(rug.x, rug.y + DIM.cb * 0 + .0, rug.z);
    const finalPivotRest = V(rug.x, rug.y + bk.T / 2 + .002, rug.z - DIM.H / 2 + .02);
    const rel = finalPivotRest.clone(); rel.y += .16;
    const start = carry.pivot.clone(), ctrl = V((start.x + rel.x) * .5 + .4, 2.85, (start.z + rel.z) * .5 + .3);
    camTo(V(.1, 1.45, 4.3), V(0, 1.0, .1), 3.4, E.sine);
    const startQ = carry.quat.clone();
    await tween(3.6, (t, raw) => {
      bez(start, ctrl, rel, t, carry.pivot);
      carry.quat.slerpQuaternions(startQ, QL, E.soft(clamp((raw - .12) / .7, 0, 1)));
      carry.wob = (.16 * Math.exp(-raw * 2.4) * Math.sin(raw * 15)) + .05 * Math.sin(raw * 6) * Math.sin(Math.PI * raw);
      carry.follow = 5.5; carry.offA.set(-.13, .42, .04); carry.offB.set(.13, .42, -.04);
    }, E.inOut);
    carry.wob = 0; await wait(.4);

    /* let go: it drops and bounces on the rug */
    await tween(.5, t => { carry.gap = lerp(gc, .09, t); }, E.out);
    carry.on = false; bk.group.updateMatrixWorld(true);
    const fall0 = bk.group.position.clone(), restY = rug.y + .0015, h = fall0.y - restY, g = 5.2;
    const e = .26, tFall = Math.sqrt(2 * h / g);
    const yAt = t => { if (t < tFall) return h - .5 * g * t * t; let u = t - tFall, v = Math.sqrt(2 * g * h) * e, hh = 0; for (let k = 0; k < 3; k++) { const tb = 2 * v / g; if (u < tb) return v * u - .5 * g * u * u; u -= tb; v *= e; } return 0; };
    const tilt0 = V(.05, 0, -.035), baseQ = bk.group.quaternion.clone();
    drones.forEach(d => { d.hand.quaternion.identity(); });
    const rise = [fly(dA, V(-1.45, 1.55, .95), 2.2, .3), (async () => { await wait(.15); await fly(dB, V(1.2, 1.6, .75), 2.3, .3); })()];
    await tween(1.7, (t, raw) => {
      const T = raw * 1.7, d = Math.exp(-T * 2.6);
      bk.group.position.y = restY + yAt(T) + (fall0.y - h - restY) * 0;
      bk.group.position.x = fall0.x + Math.sin(T * 3) * .002; bk.group.position.z = fall0.z;
      bk.group.quaternion.copy(baseQ).multiply(qAxis(X, tilt0.x * d * Math.cos(T * 11))).multiply(qAxis(V(0, 0, 1), tilt0.z * d * Math.cos(T * 9)));
    }, E.lin);
    bk.group.position.y = restY; bk.group.quaternion.copy(baseQ);
    cur.rest = bk.group.position.clone(); cur.yaw = yaw;

    /* the robot rolls over and nudges the book straight */
    await robotIn;
    const bkPos = bk.group.position, stand = V(bkPos.x + DIM.W + (camera.aspect < 1 ? .2 : .28), 0, bkPos.z + .02);
    robot.setEyes('normal');
    camTo(V(0, 1.05, 2.45), V(0, .1, .62), 2.6, E.sine);
    await tween(1.5, t => { const a = robot.group.position.x; robot.group.position.x = lerp(rStation.x, stand.x, t); robot.roll(a - robot.group.position.x); robot.group.position.z = lerp(rStation.z, stand.z, t); robot.group.rotation.y = lerp(-.38, -Math.PI / 2, E.soft(clamp(t * 1.4, 0, 1))); }, E.inOut);
    const arms = robot.arms;
    await tween(.7, t => arms.forEach(a => { a.sh.rotation.x = -1.15 * t; a.sh.rotation.z = a.s * (.22 - .06 * t); a.el.rotation.x = -.3 * t; }), E.inOut);
    const x0 = bkPos.x, edge = bkPos.x + DIM.W + .006;
    await tween(1.1, (t) => {
      const push = .09 * t; const before = robot.group.position.x; robot.group.position.x = stand.x - push; robot.roll(before - robot.group.position.x);
      bkPos.x = x0 - .035 * t; bk.group.quaternion.copy(baseQ).premultiply(qAxis(Y, -yaw * t * 1.0));
    }, E.inOut);
    cur.rest = bkPos.clone(); cur.yaw = 0;
    await Promise.all([tween(.8, t => arms.forEach(a => { a.sh.rotation.x = -1.15 * (1 - t); a.sh.rotation.z = a.s * (.16 + .06 * t); a.el.rotation.x = -.3 * (1 - t) - .1 * t; }), E.inOut),
      tween(1.2, t => { const a = robot.group.position.x; robot.group.position.x = lerp(stand.x - .09, stand.x + .12, t); robot.roll(a - robot.group.position.x); robot.group.rotation.y = lerp(-Math.PI / 2, -.5, E.soft(clamp(t * 1.2, 0, 1))); }, E.inOut)]);
    robot.setEyes('happy');
    cur.bkRest = bk.group.position.clone(); cur.bkQ = bk.group.quaternion.clone();

    /* landed: the camera settles close, the title card appears */
    titlecard.innerHTML = `<span class="mono">${{ completed: 'Completed', reading: 'Reading now', want: 'On the list' }[bk.data.status] || ''}</span><h3>${esc(bk.data.title)}</h3><p>${esc(bk.data.author)}</p>`;
    titlecard.classList.add('on'); say((matchMedia('(pointer: coarse)').matches ? 'Tap' : 'Click') + ' the book to open it'); putback.classList.add('on');
    setState('landed');
  }

  /* ── open the cover ──────────────────────────────────── */
  async function openBook() {
    if (state !== 'landed') return; setState('busy');
    const bk = cur.bk; say('', false); titlecard.classList.remove('on');
    robot.setEyes('wide');
    /* robot and drones step out of the shot */
    const out = [
      (async () => { await tween(.5, () => { }); const x0 = robot.group.position.x; let last = x0; await tween(2.3, t => { robot.group.rotation.y = lerp(-.5, -Math.PI / 2 * -1, E.soft(clamp(t * 3, 0, 1))); const p = lerp(x0, 3.6, t); robot.roll(p - last); last = p; robot.group.position.x = p; }, E.in); robot.group.visible = false; })(),
      fly(dA, V(-3.4, 3.2, .8), 2.2, .3, E.in), fly(dB, V(3.4, 3.3, .6), 2.4, .3, E.in),
    ];
    /* reading view: high above, looking straight down at the book */
    const spineX = LAYOUT.rugCenter.x, startPos = bk.group.position.clone();
    { const rc = readingCam(); camTo(rc.pos, rc.look, 2.2, E.sine); }
    await wait(.7);
    const cover = tween(1.7, t => { bk.coverProg = t; bk.layout(); }, E.sine);
    const slide = tween(1.5, t => { bk.group.position.x = lerp(startPos.x, spineX - .002, t); bk.group.position.z = lerp(startPos.z, LAYOUT.rugCenter.z, t); bk.group.quaternion.copy(cur.bkQ).slerp(Q(), t); }, E.sine);
    await Promise.all([cover, slide, ...out]);
    cur.page = 1; say('Click the right page to turn forward, the left page to go back'); setState('open');
  }

  /* ── turn a page (by clicking it) ────────────────────── */
  async function turn(dir) {
    if (state !== 'open') return; const bk = cur.bk, n = cur.page + dir;
    if (n < 1 || n > 3) return; setState('busy'); say('', false);
    const idx = dir > 0 ? cur.page - 1 : cur.page - 2, from = bk.leafProg[idx], to = dir > 0 ? 1 : 0;
    await tween(1.25, (t, raw) => { bk.leafProg[idx] = lerp(from, to, t); bk.layout(); }, E.sine);
    bk.leafProg[idx] = to; bk.layout(); cur.page = n; setState('open');
  }

  /* ── put it back on the shelf ────────────────────────── */
  async function putBackOnShelf() {
    if (state !== 'open' && state !== 'landed') return; const bk = cur.bk;
    const wasOpen = state === 'open'; setState('busy'); say('', false); putback.classList.remove('on'); titlecard.classList.remove('on');
    if (wasOpen) {
      const flips = [];
      for (let k = 1; k >= 0; k--) if (bk.leafProg[k] > .01) { flips.push(tween(.9, (t) => { bk.leafProg[k] = lerp(1, 0, t); bk.layout(); }, E.sine)); await wait(.35); }
      await Promise.all(flips); await wait(.2);
      await Promise.all([tween(1.2, t => { bk.coverProg = 1 - t; bk.layout(); }, E.sine), tween(1.3, t => { bk.group.position.x = lerp(LAYOUT.rugCenter.x - .002, cur.bkRest.x, t); bk.group.position.z = lerp(LAYOUT.rugCenter.z, cur.bkRest.z, t); }, E.sine)]);
    }
    bk.group.position.copy(cur.bkRest); bk.group.quaternion.copy(cur.bkQ);
    robot.group.visible = true; robot.group.position.set(3.1, 0, 1.15); robot.group.rotation.y = -Math.PI / 2 + .1; robot.setEyes('normal');
    camTo(V(0, 1.45, 3.7), V(0, .5, .6), 2.4, E.sine);
    dA.group.visible = dB.group.visible = true; dA.group.position.set(-3.3, 3, .8); dB.group.position.set(3.3, 3.1, .5);
    carry.on = false; bk.group.updateMatrixWorld(true);
    const slot = slots[bk.index], T = bk.T;
    const targetPos = V(slot.x - T / 2, LAYOUT.topY + DIM.H / 2 + DIM.ov, slot.z);
    /* the drones swoop in, grip the far edge, and carry it home */
    const startPivot = bk.group.localToWorld(bk.gripLocal(.5)); const rest0 = startPivot.clone(); const lying = bk.group.quaternion.clone();
    carry.book = bk; carry.pivot.copy(startPivot); carry.quat.copy(lying); carry.wob = 0; carry.lift = .12; carry.gap = .09; carry.offA.set(-.13, .42, .04); carry.offB.set(.13, .42, -.04);
    const hA = hoverFor(bk, FA, carry.offA), hB = hoverFor(bk, FB, carry.offB); hA.y += .12; hB.y += .12;
    await Promise.all([fly(dA, hA, 2.0, .5), (async () => { await wait(.2); await fly(dB, hB, 2.0, .45); })()]);
    carry.on = true; carry.follow = 7; follow.on = true;
    await tween(.8, t => { carry.lift = lerp(.12, 0, t); }, E.sine); const gc = gapClosed(bk);
    await tween(.5, t => { carry.gap = lerp(.09, gc, t); }, E.inOut);
    /* lift, swing upright and travel to the slot */
    const standPivot = bk.group.position.clone(); const q0 = lying.clone();
    const pivotHome = (() => { const g = new THREE.Group(); g.position.copy(targetPos); g.quaternion.copy(STAND); g.updateMatrixWorld(true); return g.localToWorld(bk.gripLocal(.5)); })();
    const hoverP = pivotHome.clone(); hoverP.y += .34;
    const s0 = carry.pivot.clone(), c0 = V((s0.x + hoverP.x) * .5 - .3, 2.85, (s0.z + hoverP.z) * .5 + .4);
    await tween(3.4, (t, raw) => { bez(s0, c0, hoverP, t, carry.pivot); carry.quat.slerpQuaternions(q0, STAND, E.soft(clamp((raw - .1) / .72, 0, 1))); carry.wob = .14 * Math.exp(-raw * 2) * Math.sin(raw * 14) * (raw < .9 ? 1 : 0); carry.follow = 5.5; }, E.inOut);
    carry.wob = 0;
    await tween(1.4, t => { carry.pivot.y = lerp(hoverP.y, pivotHome.y, t); carry.pivot.x = pivotHome.x + Math.sin(t * 8) * .002 * (1 - t); carry.pivot.z = pivotHome.z; }, E.inOut);
    await wait(.15);
    await tween(.6, t => { carry.gap = lerp(gc, .09, t); }, E.out);
    follow.on = false;
    carry.on = false; bk.group.quaternion.copy(STAND); bk.group.position.copy(targetPos); bk.home = targetPos.clone();
    await Promise.all([fly(dA, V(-3.4, 3.3, .6), 2.0, .3, E.in), fly(dB, V(3.4, 3.4, .4), 2.1, .3, E.in), camTo(CAM_HOME.pos, CAM_HOME.look, 2.4, E.sine)]);
    dA.group.visible = dB.group.visible = robot.group.visible = false;
    root.classList.remove('cinema'); say('Pick a book — the helpers will fetch it'); cur = null; setState('idle');
  }

  /* ── input ───────────────────────────────────────────── */
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  const aim = e => { const r = canvas.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, camera); };
  const shelfHit = () => { const objs = shelf.flatMap(b => b.group.children.flatMap(c => c.isMesh ? [c] : c.children)); const h = ray.intersectObjects(objs, false)[0]; if (!h) return null; return shelf.find(b => { let o = h.object; while (o) { if (o === b.group) return true; o = o.parent; } return false; }); };
  const bookHit = () => { const bk = cur && cur.bk; if (!bk) return null; const objs = bk.hitTargets(); const h = ray.intersectObjects(objs, false)[0]; return h ? { h, bk } : null; };
  let hovered = null;
  canvas.addEventListener('pointermove', e => {
    aim(e); let c = 'default';
    if (state === 'idle') { const b = shelfHit(); hovered = b; c = b ? 'pointer' : 'default'; }
    else if (state === 'landed') c = bookHit() ? 'pointer' : 'default';
    else if (state === 'open') { const hit = bookHit(); if (hit) c = 'pointer'; }
    canvas.style.cursor = c;
  });
  canvas.addEventListener('pointerleave', () => { hovered = null; });
  canvas.addEventListener('click', e => {
    aim(e);
    if (state === 'idle') { const b = shelfHit(); if (b) pullOut(b.index).catch(err => { console.error(err); }); }
    else if (state === 'landed') { if (bookHit()) openBook(); }
    else if (state === 'open') {
      const hit = bookHit(); if (!hit) return; const bk = hit.bk, local = bk.group.worldToLocal(hit.h.point.clone());
      if (bk.linkRegion && cur.page === 3 && hit.h.object.userData.page === 'right' && hit.h.uv) {
        const L = bk.linkRegion, u = hit.h.uv.x, v = hit.h.uv.y; if (u > L.u0 && u < L.u1 && v > L.v0 && v < L.v1) { window.open(bk.data.link, '_blank', 'noopener'); return; }
      }
      turn(local.x > 0 ? 1 : -1);
    }
  });
  putback.addEventListener('click', () => putBackOnShelf());
  addEventListener('keydown', e => { if (e.key === 'Escape') putBackOnShelf(); if (state === 'open') { if (e.key === 'ArrowRight') turn(1); if (e.key === 'ArrowLeft') turn(-1); } if (state === 'landed' && (e.key === 'Enter' || e.key === ' ')) openBook(); });

  /* ── render loop ─────────────────────────────────────── */
  const clock = new THREE.Clock(); let first = true;
  const tick = (dt, draw = true) => {
    now += dt; const t = now;
    runTweens();
    /* shelf books lean toward you when hovered */
    shelf.forEach(b => { if (state !== 'idle') return; const want = b === hovered ? .024 : 0; b.hover = lerp(b.hover, want, 1 - Math.exp(-dt * 10)); b.group.position.z = b.home.z + b.hover; });
    syncCarry(dt);
    if (!carry.on) drones.forEach(d => { const k = 1 - Math.exp(-dt * 6); d.grip.quaternion.slerp(Q(), k); d.setRod(lerp(d.rodLen, .16, 1 - Math.exp(-dt * 4))); d.hand.quaternion.slerp(Q(), k); });
    dA.update(dt, t, carry.on ? 1 : 0); dB.update(dt, t, carry.on ? 1 : 0); robot.update(dt, t);
    if (follow.on && carry.on) {
      const p = carry.pivot, kp = 1 - Math.exp(-dt * 2.4), kl = 1 - Math.exp(-dt * 3.4);
      cam.pos.lerp(_f1.set(p.x * .4, clamp(p.y * .55 + .8, 1.3, 2.1), 4.5), kp);
      cam.look.lerp(_f2.set(p.x, p.y + .1, p.z), kl);
    }
    camera.position.set(cam.pos.x + Math.sin(t * .31) * .035, cam.pos.y + Math.sin(t * .23) * .02, cam.pos.z); camera.lookAt(cam.look);
    if (draw) renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(() => { tick(Math.min(clock.getDelta(), .05)); if (first) { first = false; loader.classList.add('gone'); } });

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  /* handles for automated tests */
  /* deterministic stepping, used by the automated checks (software rendering is slow) */
  const advance = async (sec, step = 1 / 30) => { renderer.setAnimationLoop(null); const n = Math.max(1, Math.round(sec / step)); for (let i = 0; i < n; i++) { tick(step, i === n - 1); await new Promise(r => setTimeout(r, 0)); } };
  const project = i => { const v = shelf[i].group.localToWorld(V(DIM.W * .5, shelf[i].T / 2, 0)).project(camera), r = canvas.getBoundingClientRect(); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height }; };
  window.__shelf = { advance, project, state: () => state, pull: pullOut, open: openBook, turn, back: putBackOnShelf, page: () => cur && cur.page, cam, tweens: () => tweens.length };
}
