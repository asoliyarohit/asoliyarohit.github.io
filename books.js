/* ═══════════════════════════════════════════════════════════
   The reading room — chipmunks fetch the book, throw it onto the
   carpet, the cover swings open and the pages turn.
   ═══════════════════════════════════════════════════════════ */
(function () {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const clamp = (a, v, b) => Math.max(a, Math.min(b, v));
  const D = ms => (REDUCED ? 1 : ms);
  const sleep = ms => new Promise(r => setTimeout(r, D(ms)));
  const E = {
    out: t => 1 - Math.pow(1 - t, 3),
    in: t => t * t,
    inOut: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  };
  const THICK = [.24, .2, .22, .19, .25, .21];
  const TALL  = [1, .86, .93, .8, .97, .84];
  const STATUS = { completed: 'Completed', reading: 'Reading now', want: 'On the list' };

  /* ── a chipmunk, facing right ─────────────────────────── */
  const CM_SVG = `
  <svg viewBox="0 0 160 120" aria-hidden="true">
    <ellipse cx="76" cy="113" rx="42" ry="5" fill="rgba(0,0,0,.4)"/>
    <g class="tail">
      <path d="M46 90 C6 98 -6 44 24 12 C26 40 42 58 66 70 Z" fill="#c4813f"/>
      <path d="M24 12 C26 40 42 58 66 70" fill="none" stroke="#3b2314" stroke-width="3.2"/>
      <path d="M17 34 C22 54 36 68 56 76" fill="none" stroke="#f3e2c0" stroke-width="3"/>
    </g>
    <g class="body">
      <g class="legb"><ellipse cx="50" cy="96" rx="15" ry="13" fill="#b87438"/><ellipse cx="43" cy="109" rx="12" ry="5.5" fill="#8a5428"/></g>
      <ellipse cx="74" cy="78" rx="38" ry="25" fill="#c98544"/>
      <path d="M48 63 Q74 49 100 63" fill="none" stroke="#3b2314" stroke-width="5" stroke-linecap="round"/>
      <path d="M45 71 Q74 57 103 71" fill="none" stroke="#f3e2c0" stroke-width="4" stroke-linecap="round"/>
      <path d="M44 79 Q74 65 104 79" fill="none" stroke="#3b2314" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="80" cy="95" rx="25" ry="9" fill="#f6e7c8"/>
    </g>
    <g class="legf"><ellipse cx="96" cy="97" rx="12" ry="11" fill="#b87438"/><ellipse cx="102" cy="109" rx="11" ry="5" fill="#8a5428"/></g>
    <g class="head">
      <circle cx="103" cy="45" r="8" fill="#b87438"/><circle cx="103" cy="45" r="4" fill="#e8b08a"/>
      <circle cx="114" cy="62" r="21" fill="#cf8d4b"/>
      <ellipse cx="122" cy="73" rx="13" ry="10" fill="#f6e7c8"/>
      <path d="M104 52 Q120 46 136 55" fill="none" stroke="#3b2314" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M105 46 Q121 40 134 48" fill="none" stroke="#f3e2c0" stroke-width="3" stroke-linecap="round"/>
      <g class="eye"><circle cx="122" cy="61" r="4" fill="#1c120b"/><circle cx="123.3" cy="59.6" r="1.4" fill="#fff"/></g>
      <ellipse cx="136" cy="67" rx="3.8" ry="3" fill="#2a1710"/>
      <path d="M130 73 Q134 76 138 73" fill="none" stroke="#2a1710" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M136 70 L150 66 M136 71 L150 72" stroke="#2a1710" stroke-width=".8" opacity=".5"/>
    </g>
    <g class="arm"><path d="M104 84 L124 91" stroke="#b87438" stroke-width="8" stroke-linecap="round"/><circle cx="127" cy="92" r="5" fill="#8a5428"/></g>
  </svg>`;

  /* ── cover + page templates ───────────────────────────── */
  const coverSrc = b => b.cover || (b.isbn ? `https://covers.openlibrary.org/b/isbn/${b.isbn}-L.jpg?default=false` : '');
  const coverHTML = b => `
    <div class="cover">
      <div class="cover-gen">
        <span class="cg-top">${esc(b.genre || '')}</span>
        <div><h3 class="cg-title">${esc(b.title)}</h3><span class="cg-rule"></span><span class="cg-author">${esc(b.author)}</span></div>
      </div>
      ${coverSrc(b) ? `<img class="cover-img" alt="Cover of ${esc(b.title)}" src="${esc(coverSrc(b))}" referrerpolicy="no-referrer" />` : ''}
    </div>`;
  function wireCovers(root) {
    root.querySelectorAll('.cover-img').forEach(img => {
      const ok = () => { if (img.naturalWidth > 60) img.classList.add('ok'); else img.remove(); };
      if (img.complete) { if (img.naturalWidth) ok(); else img.remove(); }
      img.addEventListener('load', ok); img.addEventListener('error', () => img.remove());
    });
  }
  const pages = b => ({
    exlibris: `<div class="pg pg-l endpaper"><div class="plate"><span class="mono">Ex libris</span><h4>${esc(b.title)}</h4><p>${esc(b.author)}</p><span class="stamp">${STATUS[b.status] || esc(b.status)}</span>${b.rating ? `<div class="stars">${esc(b.rating)}</div>` : ''}</div></div>`,
    summary:  `<div class="pg pg-r"><span class="chap">Chapter I</span><h4>The summary</h4><p class="dropcap">${esc(b.summary)}</p><span class="pgno">1</span></div>`,
    thoughts: `<div class="pg pg-l"><span class="chap">Chapter II</span><h4>My thoughts</h4><blockquote>${esc((b.thoughts || '').replace(/^"|"$/g, ''))}</blockquote><span class="pgno">2</span></div>`,
    details:  `<div class="pg pg-r"><span class="chap">Chapter III</span><h4>The details</h4>${[['Genre', b.genre], ['Time', b.time], ['Finished', b.date]].filter(r => r[1]).map(r => `<div class="row"><span>${r[0]}</span><span>${esc(r[1])}</span></div>`).join('')}${b.link ? `<a class="buy" href="${esc(b.link)}" target="_blank" rel="noopener">Find it on Amazon &nearr;</a>` : ''}<span class="pgno">3</span></div>`,
    fin:      `<div class="pg pg-l fin"><div class="orn">&#10086;</div><h4>Fin.</h4><p>Back to the shelf?</p></div>`,
    base:     `<div class="pg pg-r endpaper"><div class="orn" style="color:#f0e6d2">&#10022;</div></div>`,
  });

  /* ── the shelf ────────────────────────────────────────── */
  function renderShelf(books) {
    const colors = ['#2a2420', '#1f2a2e', '#33261f', '#262230', '#2d2a1f', '#1e2b25', '#35232a'];
    const hs = [.78, .92, .7, .86, .74, .95, .82], ts = [.13, .17, .12, .15, .19, .14, .16];
    const filler = (i, opt) => `<div class="book-filler${opt ? ' opt' : ''}" style="--h-f:${hs[i % 7]};--t:${ts[i % 7]};--c:${colors[i % 7]}"></div>`;
    const pre = Array.from({ length: 5 }, (_, i) => filler(i, i < 3)).join('');
    const post = Array.from({ length: 5 }, (_, i) => filler(i + 3, i > 1)).join('');
    const real = books.map((b, i) => `
      <button class="book-slot" data-index="${i}" style="--spine:${esc(b.spine)};--accent:${esc(b.accent)};--t:${THICK[i % 6]};--hf:${TALL[i % 6]}"
              aria-label="Open ${esc(b.title)} by ${esc(b.author)}">
        <span class="book-spine-vis"><span class="spine-title">${esc(b.title)}</span><span class="spine-author">${esc(b.author)}</span></span>
      </button>`).join('');
    $('#bookshelf').innerHTML = pre + real + post;
  }

  /* ── motion toolkit ───────────────────────────────────────
     Weight comes from a few classic principles: anticipation before
     every action, squash & stretch on take-off and landing, arcs,
     follow-through (the second chipmunk and the tails lag behind),
     and spring easing so things settle instead of just stopping. */
  const smooth = t => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  const spring = (t, z = .5, w = 14) => {
    if (t >= 1) return 1;
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
  };
  const frames = (n, fn) => Array.from({ length: n + 1 }, (_, k) => fn(k / n));

  /* ── scene ────────────────────────────────────────────── */
  window.initBooksScene = function (books) {
    const room = $('#room'), actors = $('#actors'), shelfRow = $('#bookshelf');
    const controls = $('#controls'), titlecard = $('#titlecard'), hint = $('#hint'), plabel = $('#plabel');
    renderShelf(books);

    let state = 'idle';          // idle | busy | landed | open
    let cur = null;              // the book currently out of the shelf
    const setState = s => { state = s; room.classList.toggle('busy', s !== 'idle'); };

    const rb = () => room.getBoundingClientRect();
    const rel = el => {
      const r = el.getBoundingClientRect(), b = rb();
      return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height, cx: r.left - b.left + r.width / 2, cy: r.top - b.top + r.height / 2 };
    };
    async function go(el, fr, opt) {
      const a = el.animate(fr, { fill: 'forwards', ...opt, duration: D((opt && opt.duration) || 400) });
      await a.finished;
      try { a.commitStyles(); } catch (e) { /* element detached */ }
      a.cancel();
    }

    /* hero book geometry */
    function metrics(slot) {
      const b = rb();
      const H = clamp(200, Math.min(b.height * .44, b.width * .66), 420);
      const W = H * .68, t = slot.w / slot.h;
      return { H, W, D: H * t, s0: slot.h / H, lays: .74 };
    }
    const tf = (m, p) => `translate(${p.cx - m.W / 2}px, ${p.cy - m.H / 2}px) perspective(1700px) rotateX(${p.rx}deg) rotateY(${p.ry}deg) rotateZ(${p.rz}deg) scale(${p.s * (p.sx || 1)}, ${p.s * (p.sy || 1)})`;
    const F = (m, p, extra) => ({ transform: tf(m, p), ...extra });

    function buildHero(book, m) {
      const hero = document.createElement('div');
      hero.className = 'hero';
      hero.style.cssText = `--W:${m.W}px;--H:${m.H}px;--D:${m.D}px;--spine:${book.spine};--accent:${book.accent};width:${m.W}px;height:${m.H}px;visibility:hidden`;
      const pg = pages(book);
      const leaf = (i, front, back) => `<div class="leaf" data-i="${i}" style="transform:rotateY(0deg) translateZ(${3 - i}px) skewY(0deg)">
        <div class="face front">${front}<div class="shade"></div></div><div class="face back">${back}<div class="shade"></div></div></div>`;
      hero.innerHTML = `
        <div class="hb-box">
          <div class="face f-front">${coverHTML(book)}</div>
          <div class="face f-back"></div>
          <div class="face f-spine"><span class="sp-title">${esc(book.title)}</span><span class="sp-author">${esc(book.author)}</span></div>
          <div class="face f-pages"></div><div class="face f-top"></div><div class="face f-bottom"></div>
        </div>
        <div class="hb-spread">
          <div class="sp-base">${pg.base}</div>
          ${leaf(2, pg.details, pg.fin)}
          ${leaf(1, pg.summary, pg.thoughts)}
          ${leaf(0, coverHTML(book), pg.exlibris)}
          <div class="cast cast-r"></div><div class="cast cast-l"></div>
        </div>`;
      wireCovers(hero);
      return hero;
    }

    /* ── chipmunk helpers ─────────────────────────────────── */
    function spawnCM(flip, cmW) {
      const el = document.createElement('div');
      el.className = 'cm' + (flip ? ' flip' : '');
      el.style.setProperty('--cmw', cmW + 'px');
      el.innerHTML = CM_SVG;
      el.w = cmW; el.h = cmW * .75;
      actors.appendChild(el);
      return el;
    }
    /* position of the feet, plus lean (rot, about the feet) and squash/stretch */
    const cmT = (cm, x, feet, o = {}) => `translate(${x}px, ${feet - cm.h}px) rotate(${o.rot || 0}deg) scale(${o.sx || 1}, ${o.sy || 1})`;
    const cmF = (cm, x, feet, o, extra) => ({ transform: cmT(cm, x, feet, o), ...extra });

    /* a gait: quick pick-up, hops that fade in and out, forward lean while
       cruising, and a back-lean skid as they arrive */
    function runFrames(cm, x0, x1, feet, { speed = .62, hop = 9 } = {}) {
      const dist = Math.abs(x1 - x0), dir = x1 > x0 ? 1 : -1, dur = dist / speed;
      const strides = Math.max(2, Math.round(dist / (cm.w * .8)));
      const fr = frames(Math.max(30, Math.round(dur / 16)), t => {
        const p = .5 * t + .5 * smooth(t);
        const ph = Math.abs(Math.sin(Math.PI * strides * p));
        const env = Math.max(0, Math.min(1, t / .1, (1 - t) / .12));
        const cruise = Math.min(1, t / .15) * (1 - smooth(clamp(0, (t - .72) / .2, 1)));
        const skid = Math.sin(Math.PI * clamp(0, (t - .82) / .18, 1));
        return cmF(cm, lerp(x0, x1, p), feet - hop * ph * env, {
          rot: dir * (7 * cruise - 9 * skid),
          sy: 1 + (ph - .5) * .08 * env - .05 * skid,
          sx: 1 - (ph - .5) * .06 * env + .05 * skid,
        }, { offset: t });
      });
      return { fr, dur };
    }

    /* crouch → spring up (anticipation + overshoot) */
    const crouchFrames = (cm, x, feet, dur, depth = .12) => {
      const fr = frames(24, t => {
        const down = Math.sin(Math.min(1, t / .55) * Math.PI / 2);
        const up = t < .55 ? 0 : spring((t - .55) / .45, .45, 14);
        const k = t < .55 ? down : 1 - up;
        return cmF(cm, x, feet, { sy: 1 - depth * k + (t > .55 ? .05 * Math.sin(Math.PI * up) : 0), sx: 1 + depth * .6 * k }, { offset: t });
      });
      return fr;
    };

    /* hop from the shelf down to the carpet: crouch, stretch, tuck, squash, spring */
    function hopFrames(cm, x0, f0, x1, f1, dir) {
      const apex = 95;
      return frames(80, t => {
        let x = x0, f = f0, sx = 1, sy = 1, rot = 0;
        if (t < .14) { const u = Math.sin(t / .14 * Math.PI / 2); sy = 1 - .15 * u; sx = 1 + .09 * u; }
        else if (t < .68) {
          const u = (t - .14) / .54;
          x = lerp(x0, x1, u); f = lerp(f0, f1, u) - 4 * apex * u * (1 - u);
          sy = 1 + .13 * Math.sin(u * Math.PI); sx = 1 - .06 * Math.sin(u * Math.PI); rot = dir * 16 * Math.sin(u * Math.PI);
          if (u < .12) { sy = lerp(.85, sy, u / .12); sx = lerp(1.09, sx, u / .12); }
        } else if (t < .8) { const u = Math.sin((t - .68) / .12 * Math.PI / 2); x = x1; f = f1; sy = 1 - .25 * u; sx = 1 + .17 * u; }
        else { const s = spring((t - .8) / .2, .42, 16); x = x1; f = f1; sy = lerp(.75, 1, s); sx = lerp(1.17, 1, s); }
        return cmF(cm, x, f, { rot, sx, sy }, { offset: t });
      });
    }

    /* ── the throw and the landing ────────────────────────── */
    const tumbleFrames = (m, from, land, base, apex) => frames(48, t => F(m, {
      cx: lerp(from.x, land.cx, 1 - Math.pow(1 - t, 1.35)),
      cy: lerp(from.y, land.cy, t) - 4 * apex * t * (1 - t),
      rx: 58 * smooth(clamp(0, (t - .2) / .8, 1)),
      ry: 90 * (1 - E.out(Math.min(1, t / .62))),
      rz: -365 * (1 - Math.pow(1 - t, 2.2)),
      s: lerp(base.s * 1.16, m.lays, E.out(t)),
    }, { offset: t }));

    /* three decaying bounces with squash on every contact, plus a wobble */
    const BH = [30, 12, 4], BD = BH.map(Math.sqrt), BT = BD.reduce((x, y) => x + y, 0);
    function bounceAt(t) {
      let acc = 0;
      for (let i = 0; i < 3; i++) {
        const w = BD[i] / BT;
        if (t <= acc + w + 1e-9) {
          const u = (t - acc) / w;
          return { y: -BH[i] * 4 * u * (1 - u), sq: Math.max(0, 1 - Math.min(u, 1 - u) / .12) * (BH[i] / 30 * .7 + .3) };
        }
        acc += w;
      }
      return { y: 0, sq: 0 };
    }
    const bounceFrames = (m, lay) => frames(72, t => {
      if (t >= 1) return F(m, lay, { offset: 1 });
      const { y, sq } = bounceAt(t), wob = Math.exp(-3.2 * t);
      return F(m, { ...lay, cy: lay.cy + y, rx: lay.rx + 7 * wob * Math.cos(16 * t), rz: lay.rz + 3 * wob * Math.sin(12 * t), sy: 1 - .07 * sq, sx: 1 + .035 * sq }, { offset: t });
    });
    const shadowFrames = () => frames(72, t => {
      const k = t >= 1 ? 0 : clamp(0, -bounceAt(t).y / 30, 1);
      return { opacity: 1 - .55 * k, transform: `scale(${1 - .25 * k})`, offset: t };
    });

    function puff(land, m) {
      for (let k = 0; k < 14; k++) {
        const d = document.createElement('div'); d.className = 'dust';
        d.style.left = (land.cx - 11 + (Math.random() - .5) * m.W) + 'px';
        d.style.top = (land.cy + m.H * .1 + (Math.random() - .5) * 40) + 'px';
        actors.appendChild(d);
        const dx = (Math.random() - .5) * m.W * 1.6, rise = 14 + Math.random() * 46;
        d.animate([
          { transform: 'translate(0,0) scale(.3)', opacity: .85 },
          { transform: `translate(${dx * .6}px,${-rise}px) scale(${1.6 + Math.random()})`, opacity: .5, offset: .4 },
          { transform: `translate(${dx}px,${-rise * 1.4}px) scale(${2.4 + Math.random() * 1.5})`, opacity: 0 },
        ], { duration: 900 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' }).finished.then(() => d.remove());
      }
    }

    /* ── pull the book off the shelf ──────────────────────── */
    async function pullOut(i) {
      setState('busy');
      hint.classList.add('off');
      window.scrollTo({ top: room.getBoundingClientRect().top + scrollY, behavior: 'instant' });
      room.classList.add('cinema');

      const book = books[i];
      const slotEl = shelfRow.querySelector(`[data-index="${i}"]`);
      const slot = rel(slotEl), box = rb();
      const m = metrics(slot);
      const hero = buildHero(book, m);
      actors.appendChild(hero);
      const base = { cx: slot.cx, cy: slot.cy, rx: 0, ry: 90, rz: 0, s: m.s0 };
      hero.style.transform = tf(m, base);

      const cr = rel($('.carpet'));
      const land = { cx: box.width / 2, cy: cr.y + cr.h * .36 };
      cur = { i, book, slotEl, hero, m, slot, land, page: 0, cms: [] };
      const lay = { cx: land.cx, cy: land.cy, rx: 58, ry: 0, rz: -5, s: m.lays };

      const cmW = clamp(64, box.width * .085, 120), feetY = slot.y + slot.h + 3;
      cur.cmW = cmW;
      const A = REDUCED ? null : spawnCM(false, cmW), B = REDUCED ? null : spawnCM(true, cmW * .94);
      await sleep(300);

      if (!REDUCED) {
        cur.cms = [A, B]; cur.cmH = A.h;
        const ax = slot.x - cmW * .76, bx = slot.x + slot.w - B.w * .24;
        const at = (cm, x, o, ex) => cmF(cm, x, feetY, o, ex);

        /* 1 — they scamper in; the second one is a beat behind and a little slower */
        const rA = runFrames(A, -cmW * 1.4, ax, feetY, { speed: .95, hop: 10 });
        const rB = runFrames(B, box.width + cmW * .4, bx, feetY, { speed: .85, hop: 8 });
        A.style.transform = cmT(A, -cmW * 1.4, feetY); B.style.transform = cmT(B, box.width + cmW * .4, feetY);
        A.classList.add('run');
        await Promise.all([
          go(A, rA.fr, { duration: rA.dur, easing: 'linear' }),
          sleep(130).then(() => { B.classList.add('run'); return go(B, rB.fr, { duration: rB.dur, easing: 'linear' }); }),
        ]);
        A.classList.remove('run'); B.classList.remove('run');

        /* 2 — settle, look at the book, reach, crouch to grip */
        A.classList.add('look'); B.classList.add('look');
        await sleep(90);
        A.classList.add('reach'); setTimeout(() => B.classList.add('reach'), 90);
        await Promise.all([go(A, crouchFrames(A, ax, feetY, 300), { duration: 300 }), sleep(70).then(() => go(B, crouchFrames(B, bx, feetY, 300), { duration: 300 }))]);
        slotEl.style.visibility = 'hidden';
        hero.style.visibility = 'visible';

        /* 3 — two tugs, each bigger; the chipmunks lag the book by a few frames */
        const bk = (dy, s, ex) => F(m, { ...base, cy: base.cy + dy, s: base.s * s }, ex);
        const tug = async (pull, lean, dur) => {
          const off = (cm, dir, lag) => [
            at(cm, cm === A ? ax : bx, { sy: .96 }),
            at(cm, (cm === A ? ax : bx) + dir * lean * .5, { rot: dir * lean * .55, sy: .98 }, { offset: .32 + lag, easing: 'ease-out' }),
            at(cm, (cm === A ? ax : bx) + dir * lean * .85, { rot: dir * lean, sy: .97 }, { offset: .5 + lag, easing: 'ease-in-out' }),
            at(cm, cm === A ? ax : bx, { rot: dir * lean * .1, sy: .96 }),
          ];
          await Promise.all([
            go(hero, [bk(0, 1), bk(pull, 1 + pull * .003, { offset: .36, easing: 'ease-out' }), bk(pull * .15, 1 + pull * .0005, { offset: .72, easing: 'ease-in-out' }), bk(0, 1)], { duration: dur, easing: 'ease-in-out' }),
            go(A, off(A, -1, .04), { duration: dur, easing: 'ease-in-out' }),
            go(B, off(B, 1, .09), { duration: dur, easing: 'ease-in-out' }),
          ]);
        };
        await tug(7, 7, 480); await sleep(50);
        await tug(15, 11, 560); await sleep(70);

        /* the big pull — the book slides clear of the shelf */
        const pullTo = bk(slot.h * .14, 1.16);
        await Promise.all([
          go(hero, [bk(0, 1), bk(slot.h * .03, 1.03, { offset: .2, easing: 'ease-in' }), pullTo], { duration: 520, easing: 'cubic-bezier(.5,0,.15,1)' }),
          go(A, [at(A, ax, { sy: .96 }), at(A, ax - 6, { rot: -9, sy: .95 }, { offset: .3 }), at(A, ax - 20, { rot: -15, sy: .96 })], { duration: 540, easing: 'cubic-bezier(.5,0,.15,1)' }),
          go(B, [at(B, bx, { sy: .96 }), at(B, bx + 6, { rot: 9, sy: .95 }, { offset: .34 }), at(B, bx + 20, { rot: 15, sy: .96 })], { duration: 540, easing: 'cubic-bezier(.5,0,.15,1)' }),
        ]);
        const aX = ax - 20, bX = bx + 20;

        /* 4 — wind up (anticipation), then heave: stretch, release, follow through */
        A.classList.replace('reach', 'cheer'); B.classList.replace('reach', 'cheer');
        const from = { x: slot.cx, y: slot.cy + slot.h * .14 };
        const apex = Math.min(box.height * .2, 190);
        const shadow = document.createElement('div');
        shadow.className = 'dropshadow';
        shadow.style.cssText = `width:${m.W * 1.1}px;height:${m.H * .42}px;left:${land.cx - m.W * .55}px;top:${land.cy + m.H * .1}px`;
        actors.appendChild(shadow); cur.shadow = shadow;

        await Promise.all([
          go(A, [at(A, aX, { rot: -15, sy: .96 }), at(A, aX + 4, { rot: -6, sy: .86, sx: 1.1 })], { duration: 200, easing: 'ease-out' }),
          go(B, [at(B, bX, { rot: 15, sy: .96 }), at(B, bX - 4, { rot: 6, sy: .86, sx: 1.1 })], { duration: 220, easing: 'ease-out' }),
          go(hero, [F(m, { ...base, cy: base.cy + slot.h * .14, s: base.s * 1.16 }), F(m, { ...base, cy: base.cy + slot.h * .17, s: base.s * 1.13 })], { duration: 210, easing: 'ease-out' }),
        ]);
        const launch = (cm, x0, x1, r0, r1) => go(cm, frames(26, t => {
          const k = spring(t, .5, 13), kk = Math.min(1, k), up = t < .67 ? Math.sin(Math.PI * t * 1.5) : 0;
          return cmF(cm, lerp(x0, x1, k), feetY - 22 * up, { rot: lerp(r0, r1, k) * (1 - t * .8), sy: lerp(.86, 1.14, kk) - .1 * t, sx: lerp(1.1, .94, kk) + .06 * t }, { offset: t });
        }), { duration: 320, easing: 'linear' });
        const launchA = launch(A, aX + 4, aX + 12, -6, 8);
        const launchB = sleep(50).then(() => launch(B, bX - 4, bX - 12, 6, -8));

        /* the flight, with the shadow growing on the carpet */
        shadow.animate([{ opacity: 0, transform: 'scale(.3)' }, { opacity: 0, transform: 'scale(.45)', offset: .6 }, { opacity: 1, transform: 'scale(1)' }], { duration: D(1100), fill: 'forwards', easing: 'ease-in' });
        A.classList.remove('cheer'); B.classList.remove('cheer');
        const hx = m.W * .66, yd = land.cy + m.H * .22;
        const flight = go(hero, tumbleFrames(m, from, land, base, apex), { duration: 1100, easing: 'linear' });
        const hopA = (async () => { await Promise.all([launchA, launchB]); A.classList.add('cheer'); B.classList.add('cheer');
          await Promise.all([
            go(A, hopFrames(A, aX + 12, feetY, land.cx - hx - cmW * .6, yd, 1), { duration: 900, easing: 'linear' }),
            sleep(60).then(() => go(B, hopFrames(B, bX - 12, feetY, land.cx + hx - B.w * .4, yd, -1), { duration: 900, easing: 'linear' })),
          ]); })();
        await Promise.all([flight, hopA]);
        A.classList.remove('cheer'); B.classList.remove('cheer');
      } else {
        slotEl.style.visibility = 'hidden'; hero.style.visibility = 'visible';
      }

      /* 5 — impact: dust, a little camera shake, bounces with squash, shadow breathing */
      hero.style.transform = tf(m, { ...lay, rz: -365 });
      if (!REDUCED) {
        puff(land, m);
        room.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(7px)', offset: .18 }, { transform: 'translateY(-3px)', offset: .5 }, { transform: 'translateY(1px)', offset: .78 }, { transform: 'translateY(0)' }], { duration: 460, easing: 'ease-out' });
        const sh = cur.shadow;
        sh && sh.animate(shadowFrames(), { duration: 820, fill: 'forwards', easing: 'linear' });
        await go(hero, bounceFrames(m, lay), { duration: 820, easing: 'linear' });
        cur.cms.forEach(c => c.classList.add('idle'));
      } else { hero.style.transform = tf(m, lay); }
      cur.pose = lay;

      /* 6 — title card */
      titlecard.innerHTML = `<span class="mono">${esc(STATUS[book.status] || '')}</span><h3>${esc(book.title)}</h3><p>${esc(book.author)}</p>`;
      titlecard.classList.add('on');
      hint.textContent = (matchMedia('(pointer: coarse)').matches ? 'Tap' : 'Click') + ' the book to open it'; hint.classList.remove('off');
      hero.classList.add('ready');
      hero.setAttribute('tabindex', '0'); hero.setAttribute('role', 'button'); hero.setAttribute('aria-label', 'Open ' + book.title);
      setState('landed');
    }

    /* ── chipmunks leaving / returning ───────────────────── */
    async function chipExit(leave) {
      if (!cur || REDUCED || !cur.cms.length) return;
      const [A, B] = cur.cms, { cmW, m, land } = cur, box = rb();
      const feet = land.cy + m.H * .22;
      const x0A = land.cx - m.W * .66 - cmW * .6, x0B = land.cx + m.W * .66 - B.w * .4;
      const [fromA, xA] = leave ? [x0A, -cmW * 1.5] : [-cmW * 1.5, x0A];
      const [fromB, xB] = leave ? [x0B, box.width + cmW * .5] : [box.width + cmW * .5, x0B];
      A.classList.remove('idle', 'look', 'cheer', 'reach'); B.classList.remove('idle', 'look', 'cheer', 'reach');
      A.classList.toggle('flip', leave); B.classList.toggle('flip', !leave);
      const rA = runFrames(A, fromA, xA, feet, { speed: .85, hop: 9 }), rB = runFrames(B, fromB, xB, feet, { speed: .78, hop: 7 });
      A.classList.add('run');
      await Promise.all([
        go(A, rA.fr, { duration: rA.dur, easing: 'linear' }),
        sleep(120).then(() => { B.classList.add('run'); return go(B, rB.fr, { duration: rB.dur, easing: 'linear' }); }),
      ]);
      A.classList.remove('run'); B.classList.remove('run');
      if (!leave) { A.classList.remove('flip'); B.classList.add('flip'); A.classList.add('idle'); B.classList.add('idle'); }
      cur.cmsAway = leave;
    }

    /* ── open the cover ───────────────────────────────────── */
    const openPose = () => {
      const { m } = cur, b = rb();
      const s = Math.min(1.4, (b.width * .92) / (2 * m.W), (b.height * .7) / m.H);
      return { s, cx: b.width / 2 + s * m.W / 2, cy: b.height * .5 };
    };

    /* a page turn: it lifts a touch first (anticipation), swings through a
       gentle curl, overshoots a hair and settles flat */
    function animateLeaf(i, forward) {
      const el = cur.hero.querySelector(`.leaf[data-i="${i}"]`), z = 3 - i;
      const L = (a, dz, sk) => `rotateY(${a}deg) translateZ(${z + dz}px) skewY(${sk}deg)`;
      const [a0, a1] = forward ? [0, -180] : [-180, 0], dir = forward ? -1 : 1, sgn = forward ? 1 : -1;
      const opt = { duration: D(1250), fill: 'forwards' };
      const kf = [
        { transform: L(a0, 0, 0), easing: 'cubic-bezier(.3,0,.4,1)' },
        { transform: L(a0 + dir * 7, 9, -sgn * 1.5), offset: .12, easing: 'cubic-bezier(.45,.02,.3,1)' },
        { transform: L(-90, 38, -sgn * 3.5), offset: .52, easing: 'cubic-bezier(.3,.1,.3,1)' },
        { transform: L(a1 + dir * 3.5, 5, sgn * 1.2), offset: .9, easing: 'ease-out' },
        { transform: L(a1, 0, 0) },
      ];
      const rise = [{ opacity: 0 }, { opacity: .5, offset: .5 }, { opacity: .55 }];
      const fall = [{ opacity: .55 }, { opacity: .5, offset: .5 }, { opacity: 0 }];
      const front = el.querySelector('.front .shade'), back = el.querySelector('.back .shade');
      (forward ? front : back).animate(rise, { ...opt, easing: 'ease-in-out' });
      (forward ? back : front).animate(fall, { ...opt, easing: 'ease-in-out' });
      const cr = cur.hero.querySelector('.cast-r'), cl = cur.hero.querySelector('.cast-l');
      cr.animate(forward ? [{ opacity: 0 }, { opacity: .55, offset: .42 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: .55, offset: .6 }, { opacity: 0 }], { ...opt, easing: 'ease-in-out' });
      cl.animate(forward ? [{ opacity: 0 }, { opacity: 0, offset: .48 }, { opacity: .5, offset: .86 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: .5, offset: .14 }, { opacity: 0, offset: .55 }, { opacity: 0 }], { ...opt, easing: 'ease-in-out' });
      return el.animate(kf, opt).finished.then(() => { el.style.transform = L(a1, 0, 0); });
    }

    const LABELS = ['', 'Summary', 'Thoughts · Details', 'The end'];
    const syncControls = () => {
      plabel.textContent = LABELS[cur.page] || '';
      controls.querySelector('[data-act="prev"]').disabled = cur.page <= 1;
      controls.querySelector('[data-act="next"]').disabled = cur.page >= 3;
    };

    async function openBook() {
      setState('busy');
      const { hero, m, pose } = cur;
      hint.classList.add('off'); titlecard.classList.remove('on');
      hero.classList.remove('ready'); hero.removeAttribute('tabindex');
      const exit = sleep(250).then(() => chipExit(true));

      /* lift: the book springs up off the carpet and overshoots slightly */
      const face = { cx: pose.cx, cy: pose.cy - m.H * .14, rx: 0, ry: 0, rz: 0, s: 1.04 };
      await go(hero, frames(54, t => { const k = spring(t, .6, 12); return F(m, { cx: lerp(pose.cx, face.cx, k), cy: lerp(pose.cy, face.cy, k), rx: lerp(pose.rx, 0, k), ry: 0, rz: lerp(pose.rz, 0, k), s: lerp(pose.s, face.s, k) }, { offset: t }); }), { duration: 1000, easing: 'linear' });
      cur.shadow && cur.shadow.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D(500), fill: 'forwards' });

      /* swap the solid box for the page-turning book */
      hero.querySelector('.hb-box').style.visibility = 'hidden';
      hero.querySelector('.hb-spread').style.visibility = 'visible';
      const op = openPose();
      const target = { cx: op.cx, cy: op.cy, rx: 0, ry: 0, rz: 0, s: op.s };
      await Promise.all([
        go(hero, frames(48, t => { const q = smooth(t), k = spring(t, .7, 10); return F(m, { cx: lerp(face.cx, target.cx, q), cy: lerp(face.cy, target.cy, q), rx: 0, ry: 0, rz: 0, s: lerp(face.s, target.s, k) }, { offset: t }); }), { duration: 1300, easing: 'linear' }),
        animateLeaf(0, true),
      ]);
      cur.pose = target; cur.page = 1;
      controls.classList.add('on'); syncControls();
      await exit;
      setState('open');
    }

    async function turn(dir) {
      if (state !== 'open') return;
      const next = cur.page + dir;
      if (next < 1 || next > 3) return;
      setState('busy');
      await animateLeaf(dir > 0 ? cur.page : cur.page - 1, dir > 0);
      cur.page = next; syncControls();
      setState('open');
    }

    /* ── put it back ──────────────────────────────────────── */
    async function putBack() {
      if (state !== 'open' && state !== 'landed') return;
      setState('busy');
      hint.classList.add('off'); titlecard.classList.remove('on'); controls.classList.remove('on');
      const { hero, m, slot, slotEl, land } = cur;
      hero.classList.remove('ready');
      const face = { cx: land.cx, cy: land.cy - m.H * .14, rx: 0, ry: 0, rz: 0, s: 1.04 };
      const lay = { cx: land.cx, cy: land.cy, rx: 58, ry: 0, rz: -5, s: m.lays };
      if (cur.page > 0) {
        const flips = [];
        for (let p = cur.page - 1; p >= 0; p--) { flips.push(animateLeaf(p, false)); await sleep(p === 0 ? 0 : 380); }
        await Promise.all([...flips, go(hero, frames(40, t => { const q = smooth(t); return F(m, { cx: lerp(cur.pose.cx, face.cx, q), cy: lerp(cur.pose.cy, face.cy, q), rx: 0, ry: 0, rz: 0, s: lerp(cur.pose.s, face.s, q) }, { offset: t }); }), { duration: 1250, easing: 'linear' })]);
        hero.querySelector('.hb-box').style.visibility = 'visible';
        hero.querySelector('.hb-spread').style.visibility = 'hidden';
        cur.shadow && cur.shadow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: D(500), fill: 'forwards' });
        await go(hero, frames(40, t => { const k = spring(t, .75, 11); return F(m, { cx: lerp(face.cx, lay.cx, k), cy: lerp(face.cy, lay.cy, k), rx: lerp(0, lay.rx, k), ry: 0, rz: lerp(0, lay.rz, k), s: lerp(face.s, lay.s, k) }, { offset: t }); }), { duration: 750, easing: 'linear' });
        cur.page = 0;
      }
      if (cur.cmsAway) await chipExit(false);
      const [A, B] = cur.cms;
      if (!REDUCED && A) {
        A.classList.add('reach'); B.classList.add('reach');
        await sleep(200);
        await Promise.all([go(A, crouchFrames(A, A.getBoundingClientRect().left - rb().left, land.cy + m.H * .22, 340, .14), { duration: 340 }), go(B, crouchFrames(B, B.getBoundingClientRect().left - rb().left, land.cy + m.H * .22, 340, .14), { duration: 340 })]);
        A.classList.replace('reach', 'cheer'); B.classList.replace('reach', 'cheer');
      }
      /* the toss back up to the shelf */
      const apex = Math.min(rb().height * .22, 200);
      const back = frames(52, t => F(m, {
        cx: lerp(land.cx, slot.cx, smooth(t)), cy: lerp(land.cy, slot.cy, smooth(t)) - 4 * apex * t * (1 - t),
        rx: 58 * (1 - smooth(clamp(0, t / .8, 1))), ry: 90 * smooth(clamp(0, (t - .15) / .85, 1)),
        rz: -5 + 360 * smooth(t), s: lerp(m.lays, m.s0, smooth(t)),
      }, { offset: t }));
      cur.shadow && cur.shadow.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D(700), fill: 'forwards' });
      const walkOff = (async () => { if (REDUCED) return; await sleep(450); await chipExit(true); })();
      await go(hero, back, { duration: 1150, easing: 'linear' });
      slotEl.style.visibility = 'visible';
      slotEl.animate([{ transform: 'translateY(-10px)' }, { transform: 'translateY(3px)', offset: .45 }, { transform: 'translateY(-2px)', offset: .75 }, { transform: 'none' }], { duration: D(520), easing: 'ease-out' });
      hero.remove();
      await walkOff;
      cleanup();
    }

    function cleanup() {
      if (cur) { cur.hero.remove(); cur.shadow && cur.shadow.remove(); cur.cms.forEach(c => c.remove()); cur.slotEl.style.visibility = 'visible'; }
      actors.innerHTML = ''; cur = null;
      room.classList.remove('cinema');
      controls.classList.remove('on'); titlecard.classList.remove('on');
      hint.textContent = 'Pick a book — the chipmunks will fetch it'; hint.classList.remove('off');
      setState('idle');
    }

    /* ── input ─────────────────────────────────────────────── */
    const run = fn => fn().catch(err => { if (err && err.name !== 'AbortError') console.error(err); cleanup(); });
    shelfRow.addEventListener('click', e => {
      const s = e.target.closest('.book-slot');
      if (s && state === 'idle') run(() => pullOut(+s.dataset.index));
    });
    actors.addEventListener('click', e => {
      if (state === 'landed' && e.target.closest('.hero')) run(openBook);
      else if (state === 'open' && e.target.closest('.hero') && !e.target.closest('a')) {
        const r = cur.hero.getBoundingClientRect(), mid = r.left + (cur.pose.s * cur.m.W) / 2;
        run(() => turn(e.clientX > mid ? 1 : -1));
      }
    });
    controls.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.dataset.act;
      if (act === 'next') run(() => turn(1)); if (act === 'prev') run(() => turn(-1)); if (act === 'close') run(putBack);
    });
    document.addEventListener('keydown', e => {
      if (state === 'landed' && (e.key === 'Enter' || e.key === ' ') && document.activeElement === cur.hero) { e.preventDefault(); run(openBook); }
      if (e.key === 'Escape' && (state === 'open' || state === 'landed')) run(putBack);
      if (state === 'open') { if (e.key === 'ArrowRight') run(() => turn(1)); if (e.key === 'ArrowLeft') run(() => turn(-1)); }
    });
    let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (state !== 'idle') cleanup(); }, 200); });
  };
})();
