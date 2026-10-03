/* The helpers: two quadcopter drones with gripper arms, and a small wheeled robot.
   Everything is modelled from primitives with physically based materials. */
import * as THREE from '../vendor/three.bundle.js';
import { RoundedBoxGeometry } from '../vendor/three.bundle.js';
import { cv } from './textures.js?v=20261010';

const phys = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: .32, metalness: 0, clearcoat: .8, clearcoatRoughness: .18, ...o });
const std = (color, rough = .5, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
const MAT = {
  white: phys('#ebe9e3'),
  cream: phys('#d9d4c6', { roughness: .4 }),
  graphite: std('#2a2e35', .36, .85),
  dark: std('#14161a', .55, .4),
  rubber: std('#101010', .95),
  glass: phys('#070b12', { roughness: .04, metalness: .2, clearcoat: 1, clearcoatRoughness: .03 }),
  orange: phys('#ff6a2b', { roughness: .36 }),
  teal: phys('#26b3ae', { roughness: .36 }),
  sage: phys('#9db6ad', { roughness: .4 }),
  steel: std('#aeb4bc', .28, .95),
};
const rbox = (w, h, d, r, mat, seg = 4) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, seg, r), mat); m.castShadow = true; m.receiveShadow = true; return m; };
const cyl = (rt, rb, h, mat, seg = 24) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.castShadow = true; m.receiveShadow = true; return m; };
const sph = (r, mat, seg = 20) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg * .6 | 0), mat); m.castShadow = true; return m; };
const led = c => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });

/* ════════════════════════ DRONE ════════════════════════ */
export class Drone {
  constructor(accent = 'orange') {
    this.group = new THREE.Group();
    this.accentMat = accent === 'orange' ? MAT.orange : MAT.teal;
    this.props = []; this.spin = 14; this.phase = Math.random() * 6;
    this.vel = new THREE.Vector3(); this._last = null; this.tilt = new THREE.Vector2();
    const body = new THREE.Group(); this.body = body; this.group.add(body);

    const core = rbox(.15, .05, .15, .02, MAT.white, 5); body.add(core);
    const dome = sph(.058, MAT.white); dome.scale.set(1, .5, 1); dome.position.y = .022; body.add(dome);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.05, .004, 10, 40), this.accentMat); ring.rotation.x = Math.PI / 2; ring.position.y = .03; body.add(ring);
    const belly = rbox(.1, .03, .1, .012, MAT.graphite, 3); belly.position.y = -.03; body.add(belly);
    /* camera gimbal */
    const gimbal = new THREE.Group(); gimbal.position.set(0, -.035, .06); body.add(gimbal);
    const gb = sph(.026, MAT.graphite); gimbal.add(gb);
    const lens = sph(.015, MAT.glass); lens.position.z = .017; gimbal.add(lens);
    const lensRing = new THREE.Mesh(new THREE.TorusGeometry(.016, .002, 8, 24), MAT.steel); lensRing.position.z = .0172; gimbal.add(lensRing);
    this.gimbal = gimbal;
    /* status leds on the front corners */
    this.leds = [];
    for (const [x, c] of [[-.07, '#ff3b30'], [.07, '#34d27b']]) { const l = new THREE.Mesh(new THREE.SphereGeometry(.0065, 10, 8), led(c)); l.position.set(x, .0, .076); body.add(l); this.leds.push(l); }

    /* four booms with motors, guard rings and propellers */
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const len = .14, ang = Math.atan2(sz, sx);
      const boom = rbox(len, .014, .022, .006, MAT.graphite, 2);
      boom.position.set(sx * .075, .004, sz * .075); boom.rotation.y = -ang; body.add(boom);
      const mx = sx * .122, mz = sz * .122;
      const motor = cyl(.022, .024, .034, MAT.graphite, 20); motor.position.set(mx, .012, mz); body.add(motor);
      const cap = cyl(.014, .014, .006, MAT.steel, 16); cap.position.set(mx, .033, mz); body.add(cap);
      const guard = new THREE.Mesh(new THREE.TorusGeometry(.092, .0035, 8, 48), MAT.dark); guard.rotation.x = Math.PI / 2; guard.position.set(mx, .018, mz); guard.castShadow = true; body.add(guard);
      for (const a of [0, Math.PI / 2 * 1.0]) { /* spokes joining ring to motor */
        const sp = rbox(.092, .004, .005, .002, MAT.dark, 1); sp.position.set(mx + Math.cos(a + ang) * .046, .018, mz + Math.sin(a + ang) * .046); sp.rotation.y = -(a + ang); body.add(sp);
      }
      const prop = new THREE.Group(); prop.position.set(mx, .04, mz);
      for (let b = 0; b < 2; b++) { const blade = rbox(.17, .002, .017, .0008, MAT.dark, 1); blade.rotation.y = b * Math.PI; blade.castShadow = false; prop.add(blade); }
      const hub = cyl(.007, .007, .006, MAT.steel, 12); prop.add(hub);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(.087, 40), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .0, side: THREE.DoubleSide, depthWrite: false }));
      disc.rotation.x = -Math.PI / 2; disc.position.y = .001; prop.add(disc);
      prop.userData = { dir: (sx * sz > 0 ? 1 : -1), disc };
      body.add(prop); this.props.push(prop);
    }

    /* gripper: telescopic rod + a hand with two fingers that pinch */
    const grip = new THREE.Group(); grip.position.set(0, -.045, -.01); this.group.add(grip); this.grip = grip;
    const sleeve = cyl(.011, .011, .05, MAT.graphite, 16); sleeve.position.y = -.025; grip.add(sleeve);
    this.rod = cyl(.0075, .0075, 1, MAT.steel, 12); grip.add(this.rod);
    this.hand = new THREE.Group(); grip.add(this.hand);
    const palm = rbox(.07, .022, .042, .008, MAT.graphite, 3); this.hand.add(palm);
    this.fingers = [];
    for (const s of [-1, 1]) {
      const f = new THREE.Group(); const plate = rbox(.006, .052, .04, .002, this.accentMat, 2); plate.position.y = -.036;
      const pad = rbox(.003, .036, .034, .001, MAT.rubber, 1); pad.position.set(-s * .0045, -.04, 0); f.add(plate, pad); this.hand.add(f); this.fingers.push(f);
    }
    this.setRod(.2); this.setGap(.09);
  }
  setRod(len) { this.rodLen = len; this.rod.scale.y = Math.max(.001, len); this.rod.position.y = -len / 2 - .01; this.hand.position.y = -len - .012; }
  setGap(g) { this.gap = g; this.fingers[0].position.x = -g / 2; this.fingers[1].position.x = g / 2; }
  /* world position of the pinch point (between the finger pads) */
  gripPoint(out = new THREE.Vector3()) { this.group.updateWorldMatrix(true, true); return this.hand.localToWorld(out.set(0, -.045, 0)); }
  /* call each frame: props, hover bob, banking into the direction of travel */
  update(dt, t, load = 0) {
    const g = this.group;
    if (this._last) this.vel.copy(g.position).sub(this._last).divideScalar(Math.max(dt, 1e-3)); this._last = g.position.clone();
    const rev = this.spin + load * 14 + Math.min(this.vel.length() * 6, 8);
    for (const p of this.props) { p.rotation.y += p.userData.dir * rev * dt * 2.2; p.userData.disc.material.opacity = Math.min(.2, rev * .011); }
    const tp = new THREE.Vector2(THREE.MathUtils.clamp(this.vel.z * .55, -.34, .34), THREE.MathUtils.clamp(-this.vel.x * .55, -.34, .34));
    this.tilt.lerp(tp, 1 - Math.exp(-dt * 5));
    this.body.rotation.x = this.tilt.x; this.body.rotation.z = this.tilt.y;
    this.body.position.y = Math.sin(t * 2.4 + this.phase) * .006;
    this.gimbal.rotation.x = Math.sin(t * .9 + this.phase) * .08;
    this.leds[0].material.color.set((Math.sin(t * 6 + this.phase) > .2) ? '#ff3b30' : '#401512');
  }
}

/* ════════════════════════ ROBOT ════════════════════════ */
export class Robot {
  constructor() {
    this.group = new THREE.Group();
    this.wheelSpin = 0; this.blinkAt = 2 + Math.random() * 3; this.eyeState = 'normal'; this.eyeLook = 0; this.t = 0;
    const root = new THREE.Group(); this.root = root; this.group.add(root);

    /* chassis, wheels */
    const chassis = rbox(.21, .05, .16, .022, MAT.graphite, 4); chassis.position.y = .075; root.add(chassis);
    for (const s of [-1, 1]) {
      const w = new THREE.Group(); w.position.set(s * .115, .06, 0);
      const tire = cyl(.06, .06, .042, MAT.rubber, 32); tire.rotation.z = Math.PI / 2;
      const hub = cyl(.034, .034, .046, MAT.steel, 24); hub.rotation.z = Math.PI / 2;
      const cap = cyl(.012, .012, .052, MAT.orange, 16); cap.rotation.z = Math.PI / 2;
      w.add(tire, hub, cap);
      for (let k = 0; k < 5; k++) { const sp = rbox(.048, .008, .01, .003, MAT.dark, 1); sp.rotation.x = k * 1.2566; sp.position.x = s * .002; w.add(sp); }
      root.add(w); (this.wheels ||= []).push(w);
      const fender = rbox(.03, .016, .12, .007, MAT.sage, 2); fender.position.set(s * .115, .125, 0); root.add(fender);
    }
    const caster = sph(.014, MAT.steel); caster.position.set(0, .03, -.06); root.add(caster);

    /* torso */
    const torso = rbox(.16, .125, .125, .04, MAT.sage, 5); torso.position.y = .165; root.add(torso);
    const belt = rbox(.164, .014, .129, .006, MAT.white, 2); belt.position.y = .132; root.add(belt);
    const panel = rbox(.06, .034, .006, .004, MAT.dark, 2); panel.position.set(0, .175, .064); root.add(panel);
    this.chestLed = []; for (let i = 0; i < 3; i++) { const l = new THREE.Mesh(new THREE.CircleGeometry(.0058, 12), led(['#ffb02e', '#34d27b', '#4cc9ff'][i])); l.position.set(-.017 + i * .017, .175, .0675); root.add(l); this.chestLed.push(l); }

    /* head */
    const head = new THREE.Group(); head.position.y = .275; root.add(head); this.head = head;
    const neck = cyl(.016, .02, .03, MAT.graphite, 16); neck.position.y = -.045; head.add(neck);
    const skull = rbox(.155, .105, .12, .042, MAT.white, 6); head.add(skull);
    const bezel = rbox(.126, .07, .02, .022, MAT.dark, 4); bezel.position.set(0, .002, .054); head.add(bezel);
    /* the face: a small canvas drawn with glowing eyes */
    this.faceCanvas = cv(256, 128); this.faceTex = new THREE.CanvasTexture(this.faceCanvas); this.faceTex.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(.112, .056), new THREE.MeshBasicMaterial({ map: this.faceTex, toneMapped: false })); face.position.set(0, .002, .0645); head.add(face);
    const gloss = new THREE.Mesh(new THREE.PlaneGeometry(.112, .056), new THREE.MeshPhysicalMaterial({ color: '#000', roughness: .03, metalness: 0, transparent: true, opacity: .16, clearcoat: 1 })); gloss.position.set(0, .002, .0652); head.add(gloss);
    for (const s of [-1, 1]) { const ear = cyl(.019, .019, .02, MAT.orange, 20); ear.rotation.z = Math.PI / 2; ear.position.set(s * .0825, 0, 0); head.add(ear); }
    const ant = cyl(.0025, .0025, .05, MAT.steel, 8); ant.position.set(.03, .075, -.01); head.add(ant);
    this.bulb = new THREE.Mesh(new THREE.SphereGeometry(.009, 12, 10), led('#ff9d3a')); this.bulb.position.set(.03, .102, -.01); head.add(this.bulb);

    /* arms: shoulder → upper arm → elbow → forearm → claw */
    this.arms = [];
    for (const s of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(s * .095, .195, 0); root.add(sh);
      sh.add(sph(.019, MAT.graphite));
      const up = new THREE.Mesh(new THREE.CapsuleGeometry(.0125, .05, 6, 12), MAT.white); up.position.y = -.036; up.castShadow = true; sh.add(up);
      const el = new THREE.Group(); el.position.y = -.07; sh.add(el); el.add(sph(.014, MAT.graphite));
      const fo = new THREE.Mesh(new THREE.CapsuleGeometry(.011, .045, 6, 12), MAT.sage); fo.position.y = -.033; fo.castShadow = true; el.add(fo);
      const claw = new THREE.Group(); claw.position.y = -.07; el.add(claw);
      const palm = rbox(.026, .014, .02, .005, MAT.graphite, 2); claw.add(palm);
      const fingers = [-1, 1].map(k => { const f = rbox(.006, .028, .014, .002, MAT.orange, 1); f.position.set(k * .009, -.018, 0); claw.add(f); return f; });
      this.arms.push({ sh, el, claw, fingers, s });
      sh.rotation.z = s * .22; el.rotation.x = -.1;
    }
    this.setEyes('normal');
  }
  setEyes(state, look = 0) { this.eyeState = state; this.eyeLook = look; this.drawFace(); }
  drawFace(blink = false) {
    const g = this.faceCanvas.getContext('2d'), w = 256, h = 128;
    g.fillStyle = '#04070b'; g.fillRect(0, 0, w, h);
    g.shadowColor = '#7fe8ff'; g.shadowBlur = 16; g.fillStyle = '#9af0ff'; g.strokeStyle = '#9af0ff'; g.lineWidth = 11; g.lineCap = 'round';
    const lx = 80 + this.eyeLook * 14, rx = 176 + this.eyeLook * 14, cy = 62;
    if (blink || this.eyeState === 'blink') { for (const x of [lx, rx]) { g.beginPath(); g.moveTo(x - 20, cy); g.lineTo(x + 20, cy); g.stroke(); } }
    else if (this.eyeState === 'happy') { for (const x of [lx, rx]) { g.beginPath(); g.arc(x, cy + 14, 22, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } g.shadowBlur = 0; g.globalAlpha = .6; g.fillStyle = '#ff8fa3'; g.beginPath(); g.ellipse(lx - 28, cy + 26, 11, 6, 0, 0, 7); g.ellipse(rx + 28, cy + 26, 11, 6, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
    else if (this.eyeState === 'wide') { for (const x of [lx, rx]) { g.beginPath(); g.ellipse(x, cy, 21, 30, 0, 0, 7); g.fill(); } }
    else { for (const x of [lx, rx]) { g.beginPath(); g.roundRect(x - 17, cy - 26, 34, 52, 16); g.fill(); } }
    this.faceTex.needsUpdate = true;
  }
  /* roll forward/back by `dist` metres along the current heading */
  roll(dist) { this.wheelSpin += dist / .06; for (const w of this.wheels) w.rotation.x = this.wheelSpin; }
  update(dt, t) {
    this.t = t;
    this.blinkAt -= dt;
    if (this.blinkAt < 0) { this.drawFace(true); this.blinkAt = 2.5 + Math.random() * 3.5; this._unblink = .13; }
    if (this._unblink > 0) { this._unblink -= dt; if (this._unblink <= 0) this.drawFace(false); }
    this.bulb.scale.setScalar(.85 + Math.sin(t * 4) * .2);
    this.chestLed.forEach((l, i) => l.material.color.setScalar(.45 + .55 * (Math.sin(t * 3 + i * 1.7) > 0 ? 1 : .15)));
    this.root.position.y = Math.sin(t * 2) * .0012;
  }
}
