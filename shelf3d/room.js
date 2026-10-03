/* The reading room: bookcase, panelled wall, wooden floor, rug, lamp, plant. */
import * as THREE from '../vendor/three.bundle.js';
import { RoundedBoxGeometry, RoomEnvironment } from '../vendor/three.bundle.js';
import { makeWood, makeWall, makeRug, mulberry32, cv, tex } from './textures.js?v=20261016';

export const LAYOUT = {
  wallZ: -1.4,
  shelfFront: -1.04,
  boardTop: [0.10, 0.62, 1.14, 1.66],      /* top surface of each board */
  topY: 1.66,
  rugCenter: new THREE.Vector3(0, 0.006, 0.62),
  rugSize: [2.7, 1.85],
};

const std = (color, rough = .6, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
const box = (w, h, d, mat, x, y, z, cast = true, recv = true) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = recv; return m;
};

export function buildRoom(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x120d0a);
  scene.fog = new THREE.Fog(0x120d0a, 9, 18);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.16;

  /* ── lights ─────────────────────────────────────────── */
  scene.add(new THREE.HemisphereLight(0xcfd8f2, 0x24160d, .16));
  const key = new THREE.SpotLight(0xffe0b8, 150, 0, .6, .85, 2);
  key.position.set(-1.9, 3.4, 3.1); key.target.position.set(0, .4, .2);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = .8; key.shadow.camera.far = 11;
  key.shadow.bias = -.00018; key.shadow.normalBias = .018; key.shadow.radius = 5;
  scene.add(key, key.target);
  const shelfGlow = new THREE.PointLight(0xffc27d, 3.2, 3.4, 2); shelfGlow.position.set(0, 2.05, -.55); scene.add(shelfGlow);

  /* ── floor ──────────────────────────────────────────── */
  const floorW = makeWood({ base: '#5a3a24', seed: 11, planks: 14, w: 1024, h: 1024, repeat: [2.2, 2.2], tint: 22 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshStandardMaterial({ map: floorW.map, bumpMap: floorW.bump, bumpScale: 1.4, roughness: .48, metalness: 0 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.position.set(0, 0, 0); scene.add(floor);

  /* ── rug ────────────────────────────────────────────── */
  const rugT = makeRug();
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(...LAYOUT.rugSize), new THREE.MeshStandardMaterial({ map: rugT.map, bumpMap: rugT.bump, bumpScale: 2.2, roughness: 1, metalness: 0 }));
  rug.rotation.x = -Math.PI / 2; rug.position.copy(LAYOUT.rugCenter); rug.receiveShadow = true; scene.add(rug);
  const fr = new THREE.InstancedMesh(new THREE.BoxGeometry(.004, .0016, .045), std('#e6d6b2', 1), 260);
  const dm = new THREE.Object3D(), rnd = mulberry32(5);
  for (let i = 0; i < 130; i++) for (const s of [-1, 1]) {
    dm.position.set(LAYOUT.rugCenter.x - LAYOUT.rugSize[0] / 2 + (i + .5) * LAYOUT.rugSize[0] / 130, .004, LAYOUT.rugCenter.z + s * (LAYOUT.rugSize[1] / 2 + .02));
    dm.rotation.set(0, (rnd() - .5) * .3, 0); dm.updateMatrix(); fr.setMatrixAt(i * 2 + (s > 0 ? 1 : 0), dm.matrix);
  }
  fr.receiveShadow = true; scene.add(fr);

  /* ── walls: green wainscot, papered upper wall, mouldings ─ */
  const upper = makeWall({ base: '#8d7f66', stripe: true, repeat: [8, 3] });
  const wallUp = new THREE.Mesh(new THREE.PlaneGeometry(10, 3), new THREE.MeshStandardMaterial({ map: upper.map, bumpMap: upper.bump, bumpScale: .6, roughness: .92 }));
  wallUp.position.set(0, 2.5, LAYOUT.wallZ); wallUp.receiveShadow = true; scene.add(wallUp);
  const paint = std('#223a33', .42), trim = std('#e8e2d3', .38);
  scene.add(box(10, 1.04, .03, paint, 0, .52, LAYOUT.wallZ + .015));
  scene.add(box(10, .055, .06, trim, 0, 1.06, LAYOUT.wallZ + .03));
  scene.add(box(10, .15, .045, trim, 0, .075, LAYOUT.wallZ + .022));
  for (let i = -5; i <= 5; i++) {
    const cx = i * .86; if (Math.abs(cx) < 1.3) continue;
    const pw = .62, ph = .66, cy = .55, z = LAYOUT.wallZ + .036, t = .028;
    for (const [w, h, x, y] of [[pw, t, cx, cy + ph / 2], [pw, t, cx, cy - ph / 2], [t, ph, cx - pw / 2, cy], [t, ph, cx + pw / 2, cy]]) scene.add(box(w, h, .014, trim, x, y, z, true, true));
    scene.add(box(pw - t, ph - t, .006, std('#1e332d', .5), cx, cy, LAYOUT.wallZ + .033, false, true));
  }
  /* pictures */
  const art = (seed) => {
    const r = mulberry32(seed), c = cv(420, 560), g = c.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, 560); sky.addColorStop(0, '#d9c9a6'); sky.addColorStop(1, '#a8b7a5'); g.fillStyle = sky; g.fillRect(0, 0, 420, 560);
    g.fillStyle = 'rgba(240,210,150,.9)'; g.beginPath(); g.arc(250 + r() * 60, 170, 46, 0, 7); g.fill();
    for (let i = 0; i < 4; i++) { g.fillStyle = `rgba(${60 - i * 8},${86 - i * 6},${70 - i * 6},${.55 + i * .13})`; g.beginPath(); g.moveTo(0, 320 + i * 55); for (let x = 0; x <= 420; x += 20) g.lineTo(x, 300 + i * 55 + Math.sin(x * .02 + i + r() * 3) * 30); g.lineTo(420, 560); g.lineTo(0, 560); g.fill(); }
    return tex(c);
  };
  for (const [x, y, s] of [[-2.0, 1.72, 3], [2.0, 1.66, 8], [-2.62, 1.55, 5]]) {
    const frame = box(.5, .66, .035, std('#3a2616', .35, .2), x, y, LAYOUT.wallZ + .03);
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(.4, .56), new THREE.MeshStandardMaterial({ map: art(s), roughness: .7 }));
    pic.position.set(x, y, LAYOUT.wallZ + .05); pic.receiveShadow = true; scene.add(frame, pic);
  }

  /* ── bookcase ───────────────────────────────────────── */
  const wood = makeWood({ base: '#573520', seed: 21, planks: 1, w: 1024, h: 512 });
  const shelfMat = new THREE.MeshStandardMaterial({ map: wood.map, bumpMap: wood.bump, bumpScale: 1.1, roughness: .52 });
  const backMat = std('#3b2616', .8);
  const cz = (LAYOUT.wallZ + .02 + LAYOUT.shelfFront) / 2, depth = LAYOUT.shelfFront - LAYOUT.wallZ - .02;
  const caseH = 1.8;
  scene.add(box(2.28, .08, depth + .03, shelfMat, 0, .04, cz));
  scene.add(box(.04, caseH, depth, shelfMat, -1.12, caseH / 2, cz), box(.04, caseH, depth, shelfMat, 1.12, caseH / 2, cz));
  scene.add(box(2.2, caseH, .014, backMat, 0, caseH / 2, LAYOUT.wallZ + .017));
  for (const top of LAYOUT.boardTop) {
    scene.add(box(2.2, .032, depth, shelfMat, 0, top - .016, cz));
    scene.add(box(2.2, .034, .02, shelfMat, 0, top - .05, LAYOUT.shelfFront - .01));
  }

  /* books on the shelves (the six that matter are added by the scene) */
  const palette = ['#6e2a2a', '#23385a', '#2c5a44', '#b08a3c', '#47484e', '#8a5a3a', '#d8cdb0', '#4a2f4f', '#1f4a52', '#8a3f2f'];
  const spineGeo = new THREE.BoxGeometry(1, 1, 1);
  const filler = (x0, x1, top, seed, maxH) => {
    const r = mulberry32(seed); let x = x0;
    while (x < x1 - .05) {
      const w = .03 + r() * .045, h = Math.min(maxH, .2 + r() * .15), d = .17 + r() * .07;
      if (x + w > x1) break;
      const col = palette[Math.floor(r() * palette.length)];
      const m = new THREE.Mesh(spineGeo, std(col, .62 + r() * .2));
      m.scale.set(w, h, d);
      const z = LAYOUT.shelfFront - .018 - r() * .012 - d / 2;
      m.position.set(x + w / 2, top + h / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
      const band = std(r() < .5 ? '#c9a24e' : '#e7dcc0', .4, .35);
      for (const by of [.2, .78]) { const b = new THREE.Mesh(spineGeo, band); b.scale.set(w * 1.01, .006, .004); b.position.set(x + w / 2, top + h * by, z + d / 2 + .0015); scene.add(b); }
      if (r() < .45) { const lab = new THREE.Mesh(spineGeo, std('#e9dfc6', .8)); lab.scale.set(w * .62, h * .22, .003); lab.position.set(x + w / 2, top + h * .55, z + d / 2 + .0018); scene.add(lab); }
      x += w + .002;
    }
    return x;
  };
  const clear = [.46, .44, .46];
  for (let s = 0; s < 3; s++) { filler(-1.08, 1.08, LAYOUT.boardTop[s], 100 + s * 7, clear[s]); }
  /* top shelf: fillers either side of the reserved middle section */
  filler(-1.08, -.34, LAYOUT.topY, 200, .36);
  const endR = filler(.34, 1.0, LAYOUT.topY, 300, .36);
  for (const sx of [-1, 1]) scene.add(box(.012, .13, .09, std('#b99552', .3, .85), sx * .322, LAYOUT.topY + .065, LAYOUT.shelfFront - .13));
  /* a small stack lying flat on the right of the top shelf */
  for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(spineGeo, std(palette[(i * 3 + 1) % 10], .6)); m.scale.set(.2 - i * .015, .034, .15); m.position.set(1.0 - .02 * i, LAYOUT.topY + .017 + i * .034, LAYOUT.shelfFront - .15); m.rotation.y = (i - 1) * .08; m.castShadow = m.receiveShadow = true; scene.add(m); }

  /* ── floor lamp ─────────────────────────────────────── */
  const lamp = new THREE.Group(); lamp.position.set(2.0, 0, -.5);
  const brass = std('#b99552', .3, .9);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.14, .16, .035, 40), brass); base.position.y = .0175; base.castShadow = true;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.011, .013, 1.42, 16), brass); pole.position.y = .74; pole.castShadow = true;
  const shadeMat = new THREE.MeshStandardMaterial({ color: '#f1dfbd', emissive: '#ffb066', emissiveIntensity: 1.25, roughness: .9, side: THREE.DoubleSide });
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(.15, .23, .27, 40, 1, true), shadeMat); shade.position.y = 1.55;
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.04, 16, 12), new THREE.MeshBasicMaterial({ color: '#fff0d0' })); bulb.position.y = 1.52;
  const lampLight = new THREE.PointLight(0xffb36b, 6, 6.5, 2); lampLight.position.set(0, 1.5, .1);
  lamp.add(base, pole, shade, bulb, lampLight); scene.add(lamp);

  /* ── plant ──────────────────────────────────────────── */
  const plant = new THREE.Group(); plant.position.set(-1.95, 0, -.8);
  const potPts = [[.0, 0], [.1, 0], [.12, .04], [.145, .26], [.155, .28], [.14, .285], [.0, .27]].map(p => new THREE.Vector2(p[0], p[1]));
  const pot = new THREE.Mesh(new THREE.LatheGeometry(potPts, 36), std('#b0684a', .85)); pot.castShadow = pot.receiveShadow = true;
  const soil = new THREE.Mesh(new THREE.CircleGeometry(.135, 24), std('#2a1c12', 1)); soil.rotation.x = -Math.PI / 2; soil.position.y = .262;
  plant.add(pot, soil);
  const leafMat = new THREE.MeshStandardMaterial({ color: '#2c6a38', roughness: .5, side: THREE.DoubleSide });
  const stemMat = std('#3b5a30', .7), leafGeo = new THREE.SphereGeometry(1, 16, 10);
  const pr = mulberry32(42);
  for (let i = 0; i < 15; i++) {
    const a = pr() * 6.283, lean = .12 + pr() * .5, len = .3 + pr() * .32;
    const stem = new THREE.Group(); stem.position.set(Math.cos(a) * .03, .27, Math.sin(a) * .03);
    stem.rotation.order = 'YXZ'; stem.rotation.y = -a; stem.rotation.z = Math.PI / 2 - lean;
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(.004, .006, len, 6), stemMat); rod.rotation.z = -Math.PI / 2; rod.position.x = len / 2; rod.castShadow = true;
    const tip = new THREE.Group(); tip.position.x = len; tip.rotation.z = -.5 - pr() * .5;
    const leaf = new THREE.Mesh(leafGeo, leafMat.clone()); leaf.material.color.offsetHSL((pr() - .5) * .04, 0, (pr() - .5) * .07);
    const ll = .14 + pr() * .08; leaf.scale.set(ll, .004, ll * .5); leaf.position.x = ll * .85; leaf.castShadow = true;
    tip.add(leaf); stem.add(rod, tip); plant.add(stem);
  }
  scene.add(plant);

  return { scene, key, lampLight, shelfGlow, endR };
}
