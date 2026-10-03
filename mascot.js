/* The pixel chipmunk. Drawn procedurally on a 32×32 grid, outlined automatically,
   then scaled up with hard pixels. Moods: idle, nap, happy, type, dance, think. */
(function () {
  const PAL = { F: '#c9803f', L: '#ebb274', D: '#4b2a15', C: '#f8ebcf', K: '#17100b', W: '#ffffff', P: '#f09a8a', T: '#a4602b', O: '#2d190c', A: '#7a4a22', N: '#d9a45e' };
  const S = 32;

  function sprite(o = {}) {
    const g = Array.from({ length: S }, () => Array(S).fill(null));
    const set = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < S && y >= 0 && y < S) g[y][x] = c; };
    const ell = (cx, cy, rx, ry, c) => { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { const dx = (x - cx) / rx, dy = (y - cy) / ry; if (dx * dx + dy * dy <= 1.02) set(x, y, c); } };
    const dy = o.dy || 0, tail = o.tail || 0, arms = o.arms || 'down', eyes = o.eyes || 'open', mouth = o.mouth || 'smile', look = o.look || 0;

    /* tail: big, curling up behind, striped */
    const tx = 24 + tail;
    ell(tx, 19 + dy, 5.4, 10.2, 'F'); ell(tx + 1.5, 17 + dy, 3, 8, 'L');
    for (let y = 9; y <= 28; y += 4) for (let x = tx - 6; x <= tx + 6; x++) { const yy = y + dy; if (g[yy] && g[yy][Math.round(x)] && g[yy][Math.round(x)] !== 'O') set(x, yy, 'D'); }
    for (let x = tx - 3; x <= tx + 3; x++) set(x, 9 + dy, 'N');
    /* body, belly, feet */
    ell(15, 23.5 + dy, 8.6, 7.4, 'F');
    ell(15, 25.2 + dy, 5.2, 5.4, 'C');
    ell(10.5, 30.2, 3.2, 1.7, 'T'); ell(19.5, 30.2, 3.2, 1.7, 'T');
    /* back stripes just visible beside the head */
    for (const x of [7, 23]) for (let y = 17; y <= 22; y++) set(x, y + dy, 'D');
    /* arms (down holding an acorn, or raised) */
    if (arms === 'down') {
      ell(9.5, 24.5 + dy, 2.1, 3.3, 'F'); ell(20.5, 24.5 + dy, 2.1, 3.3, 'F');
      ell(12, 25.5 + dy, 1.6, 1.4, 'N'); ell(18, 25.5 + dy, 1.6, 1.4, 'N');
      /* acorn */
      ell(15, 25.2 + dy, 2.3, 2.1, 'N'); for (let x = 13; x <= 17; x++) set(x, 23 + dy, 'A'); set(15, 22 + dy, 'A');
    } else if (arms === 'up') {
      ell(6.5, 15 + dy, 2.1, 3.8, 'F'); ell(24.5, 15 + dy, 2.1, 3.8, 'F'); ell(6.5, 11.5 + dy, 1.8, 1.5, 'N'); ell(24.5, 11.5 + dy, 1.8, 1.5, 'N');
    } else {
      ell(10, 22 + dy, 2.1, 3.3, 'F'); ell(20, 22 + dy, 2.1, 3.3, 'F'); ell(12.5, 20.5 + dy, 1.6, 1.4, 'N'); ell(17.5, 20.5 + dy, 1.6, 1.4, 'N');
    }
    /* head */
    const hy = 12 + dy;
    ell(7.5, 5.5 + dy, 3.1, 3.1, 'F'); ell(22.5, 5.5 + dy, 3.1, 3.1, 'F'); ell(7.5, 6 + dy, 1.3, 1.3, 'P'); ell(22.5, 6 + dy, 1.3, 1.3, 'P');
    ell(15, hy, 10.4, 8.2, 'F'); ell(15, hy - 2.5, 7.5, 3.2, 'L');
    /* face stripes: cream, dark, cream from nose to ears */
    for (let x = 9; x <= 21; x++) set(x, 7 + dy + (Math.abs(x - 15) > 5 ? 1 : 0), 'C');
    for (let x = 7; x <= 23; x++) set(x, 9 + dy + (Math.abs(x - 15) > 6 ? 1 : 0), 'D');
    for (let x = 8; x <= 22; x++) if (Math.abs(x - 15) > 3) set(x, 10 + dy + (Math.abs(x - 15) > 6 ? 1 : 0), 'D');
    /* cheeks */
    ell(10, 15.5 + dy, 4.2, 3.2, 'C'); ell(20, 15.5 + dy, 4.2, 3.2, 'C'); ell(15, 16 + dy, 3.4, 2.6, 'C');
    set(7, 15 + dy, 'P'); set(8, 15 + dy, 'P'); set(22, 15 + dy, 'P'); set(23, 15 + dy, 'P');
    /* eyes */
    const ey = 12 + dy + (look > 0 ? 1 : 0);
    const eye = (x, side) => {
      if (eyes === 'open') { set(x, ey, 'K'); set(x + 1, ey, 'K'); set(x, ey + 1, 'K'); set(x + 1, ey + 1, 'K'); set(x, ey - 1, 'K'); set(x + 1, ey - 1, 'K'); set(x + (side < 0 ? 0 : 1), ey - 1, 'W'); }
      else if (eyes === 'closed') { set(x - 1, ey + 1, 'K'); set(x, ey + 1, 'K'); set(x + 1, ey + 1, 'K'); set(x + 2, ey + 1, 'K'); }
      else if (eyes === 'happy') { set(x - 1, ey + 1, 'K'); set(x, ey, 'K'); set(x + 1, ey, 'K'); set(x + 2, ey + 1, 'K'); }
      else if (eyes === 'wide') { for (let a = -1; a <= 2; a++) for (let b = -1; b <= 2; b++) set(x + a, ey + b - 1, 'K'); set(x, ey - 2, 'W'); }
    };
    eye(9, -1); eye(19, 1);
    /* nose & mouth */
    set(15, 14 + dy, 'K'); set(14, 14 + dy, 'K'); set(16, 14 + dy, 'K');
    if (mouth === 'smile') { set(13, 17 + dy, 'K'); set(17, 17 + dy, 'K'); set(14, 18 + dy, 'K'); set(15, 18 + dy, 'K'); set(16, 18 + dy, 'K'); }
    else if (mouth === 'open') { for (let x = 14; x <= 16; x++) for (let y = 17; y <= 18; y++) set(x, y + dy, 'K'); set(15, 18 + dy, 'P'); }
    else if (mouth === 'flat') { set(14, 17 + dy, 'K'); set(15, 17 + dy, 'K'); set(16, 17 + dy, 'K'); }
    else if (mouth === 'o') { set(15, 17 + dy, 'K'); set(15, 18 + dy, 'K'); set(14, 17.5 + dy, 'K'); set(16, 17.5 + dy, 'K'); }
    /* outline */
    const out = g.map(r => r.slice());
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (!g[y][x]) { const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => g[y + b] && g[y + b][x + a]); if (n) out[y][x] = 'O'; }
    return out;
  }

  const MOODS = {
    idle:  [{ }, { dy: 1 }, { eyes: 'closed' }, { dy: 1, tail: 1 }],
    nap:   [{ eyes: 'closed', mouth: 'flat', dy: 2 }, { eyes: 'closed', mouth: 'flat', dy: 3 }],
    happy: [{ eyes: 'happy', mouth: 'open', arms: 'up', dy: 0 }, { eyes: 'happy', mouth: 'open', arms: 'up', dy: 1 }],
    type:  [{ look: 1, mouth: 'flat' }, { look: 1, mouth: 'flat', dy: 1 }],
    dance: [{ eyes: 'happy', mouth: 'open', arms: 'up', tail: 0 }, { eyes: 'happy', mouth: 'open', arms: 'mid', tail: 1 }, { eyes: 'happy', mouth: 'open', arms: 'up', tail: 0, dy: 1 }, { eyes: 'happy', mouth: 'open', arms: 'mid', tail: -1 }],
    think: [{ eyes: 'wide', mouth: 'o' }, { eyes: 'wide', mouth: 'o', dy: 1 }],
  };
  const cache = {};
  const frames = mood => cache[mood] || (cache[mood] = MOODS[mood].map(sprite));

  function paint(ctx, grid) {
    ctx.clearRect(0, 0, S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const c = grid[y][x]; if (c) { ctx.fillStyle = PAL[c]; ctx.fillRect(x, y, 1, 1); } }
  }

  window.createMascot = function (canvas) {
    canvas.width = S; canvas.height = S; const ctx = canvas.getContext('2d');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let mood = 'idle', f = 0, last = 0, hopT = -1, timer = 0;
    const speed = { idle: 520, nap: 1100, happy: 260, type: 200, dance: 170, think: 400 };
    const IDLE = [0, 0, 1, 0, 0, 3, 0, 1, 2, 0];                /* mostly still, a breath, a tail flick, a blink */
    const draw = () => { const fr = frames(mood); paint(ctx, fr[mood === 'idle' ? IDLE[f % IDLE.length] : f % fr.length]); };
    const loop = t => {
      if (t - last > speed[mood]) { last = t; f++; draw(); }
      if (hopT >= 0) { const k = (t - hopT) / 640; if (k >= 1) { hopT = -1; canvas.style.transform = ''; } else canvas.style.transform = `translateY(${-Math.sin(k * Math.PI) * 28}px)`; }
      timer = requestAnimationFrame(loop);
    };
    draw(); if (!reduced) timer = requestAnimationFrame(loop);
    return {
      setMood(m) { if (m === mood) return; mood = m; f = 0; draw(); },
      get mood() { return mood; },
      hop() { if (!reduced) hopT = performance.now(); },
      destroy() { cancelAnimationFrame(timer); },
    };
  };
  window.__mascotFrames = { MOODS, sprite, paint, S };
})();
