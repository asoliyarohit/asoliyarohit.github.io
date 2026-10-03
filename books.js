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
    async function go(el, frames, opt) {
      const a = el.animate(frames, { fill: 'forwards', duration: 400, ...opt, duration: D((opt && opt.duration) || 400) });
      await a.finished;
      try { a.commitStyles(); } catch (e) { /* element detached */ }
      a.cancel();
    }

    /* metrics for the hero book */
    function metrics(slot) {
      const b = rb();
      const H = clamp(200, Math.min(b.height * .44, b.width * .66), 420);
      const W = H * .68, t = slot.w / slot.h;
      return { H, W, D: H * t, s0: slot.h / H, lays: .74, vw: b.width, vh: b.height };
    }
    const tf = (m, p) => `translate(${p.cx - m.W / 2}px, ${p.cy - m.H / 2}px) perspective(1700px) rotateX(${p.rx}deg) rotateY(${p.ry}deg) rotateZ(${p.rz}deg) scale(${p.s})`;
    const F = (m, p, extra) => ({ transform: tf(m, p), ...extra });

    function buildHero(book, m) {
      const hero = document.createElement('div');
      hero.className = 'hero';
      hero.style.cssText = `--W:${m.W}px;--H:${m.H}px;--D:${m.D}px;--spine:${book.spine};--accent:${book.accent};width:${m.W}px;height:${m.H}px;visibility:hidden`;
      const pg = pages(book);
      const leaf = (i, front, back) => `<div class="leaf" data-i="${i}" style="transform:rotateY(0deg) translateZ(${3 - i}px)">
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

    function spawnCM(flip, cmW) {
      const el = document.createElement('div');
      el.className = 'cm' + (flip ? ' flip' : '');
      el.style.setProperty('--cmw', cmW + 'px');
      el.innerHTML = CM_SVG;
      actors.appendChild(el);
      return el;
    }
    const cmTr = (cm, x, feet) => `translate(${x}px, ${feet - cm.h}px)`;

    /* a parabolic hop / throw as sampled keyframes */
    function arcFrames(n, fn) { return Array.from({ length: n + 1 }, (_, k) => fn(k / n)); }

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

      const cmW = clamp(64, box.width * .085, 120), cmH = cmW * .75;
      const feetY = slot.y + slot.h + 3;
      const A = REDUCED ? null : spawnCM(false, cmW), B = REDUCED ? null : spawnCM(true, cmW);
      if (!REDUCED) { A.h = B.h = cmH; cur.cms = [A, B]; }
      cur.cmW = cmW; cur.cmH = cmH;
      const ax = slot.x - cmW * .76, bx = slot.x + slot.w - cmW * .24;

      await sleep(500);
      if (!REDUCED) {
        /* 1 — they scamper in from both sides */
        A.style.transform = cmTr(A, -cmW * 1.4, feetY); B.style.transform = cmTr(B, box.width + cmW * .4, feetY);
        A.classList.add('run'); B.classList.add('run');
        const speed = .7; // px per ms
        await Promise.all([
          go(A, [{ transform: cmTr(A, -cmW * 1.4, feetY) }, { transform: cmTr(A, ax, feetY) }], { duration: (ax + cmW * 1.4) / speed, easing: 'linear' }),
          go(B, [{ transform: cmTr(B, box.width + cmW * .4, feetY) }, { transform: cmTr(B, bx, feetY) }], { duration: (box.width + cmW * .4 - bx) / speed, easing: 'linear' }),
        ]);
        A.classList.remove('run'); B.classList.remove('run');

        /* 2 — grab and tug */
        A.classList.add('reach'); B.classList.add('reach');
        await sleep(380);
        slotEl.style.visibility = 'hidden';
        hero.style.visibility = 'visible';
        A.classList.add('lean'); B.classList.add('lean');
        for (let n = 0; n < 2; n++) {
          await go(hero, [F(m, base), F(m, { ...base, cy: base.cy + 5, s: base.s * 1.03 }), F(m, base)], { duration: 420, easing: 'ease-in-out' });
        }
        await Promise.all([
          go(hero, [F(m, base), F(m, { ...base, cy: base.cy + slot.h * .14, s: base.s * 1.16 })], { duration: 560, easing: 'cubic-bezier(.5,0,.2,1)' }),
          go(A, [{ transform: cmTr(A, ax, feetY) }, { transform: cmTr(A, ax - 16, feetY) }], { duration: 560 }),
          go(B, [{ transform: cmTr(B, bx, feetY) }, { transform: cmTr(B, bx + 16, feetY) }], { duration: 560 }),
        ]);
        A.classList.remove('lean'); B.classList.remove('lean');

        /* 3 — heave! the book tumbles onto the carpet */
        A.classList.replace('reach', 'cheer'); B.classList.replace('reach', 'cheer');
        const from = { x: slot.cx, y: slot.cy + slot.h * .14 }, apex = Math.min(box.height * .2, 190);
        const tumble = arcFrames(40, t => F(m, {
          cx: from.x + (land.cx - from.x) * E.out(t * .98 + .02 * t),
          cy: from.y + (land.cy - from.y) * t - 4 * apex * t * (1 - t),
          rx: 58 * E.inOut(t), ry: 90 * (1 - E.inOut(Math.min(1, t * 1.15))), rz: -365 * E.out(t),
          s: base.s * 1.16 + (m.lays - base.s * 1.16) * E.out(t),
        }, { offset: t }));
        const shadow = document.createElement('div');
        shadow.className = 'dropshadow';
        shadow.style.cssText = `width:${m.W * 1.1}px;height:${m.H * .42}px;left:${land.cx - m.W * .55}px;top:${land.cy + m.H * .1}px`;
        actors.appendChild(shadow); cur.shadow = shadow;
        shadow.animate([{ opacity: 0, transform: 'scale(.3)' }, { opacity: 0, transform: 'scale(.4)', offset: .6 }, { opacity: 1, transform: 'scale(1)' }], { duration: D(1250), fill: 'forwards', easing: 'ease-in' });

        const hop = (cm, x0, x1, dur) => go(cm, arcFrames(30, t => ({
          transform: `${cmTr(cm, x0 + (x1 - x0) * t, feetY + (land.cy + m.H * .22 - feetY) * E.in(t) - 4 * 70 * t * (1 - t))} rotate(${(x1 > x0 ? 1 : -1) * 14 * Math.sin(t * Math.PI)}deg)`, offset: t,
        })), { duration: dur, easing: 'linear' });
        const hx = m.W * .66;
        await Promise.all([
          go(hero, tumble, { duration: 1250, easing: 'linear' }),
          (async () => { await sleep(260); A.classList.remove('cheer'); B.classList.remove('cheer'); await Promise.all([hop(A, ax - 16, land.cx - hx - cmW * .6, 980), hop(B, bx + 16, land.cx + hx - cmW * .4, 980)]); })(),
        ]);
      } else {
        slotEl.style.visibility = 'hidden'; hero.style.visibility = 'visible';
      }

      /* 4 — impact: bounce, dust, a little shake */
      const lay = { cx: land.cx, cy: land.cy, rx: 58, ry: 0, rz: -5, s: m.lays };
      hero.style.transform = tf(m, { ...lay, rz: -365 });
      if (!REDUCED) {
        for (let k = 0; k < 12; k++) {
          const d = document.createElement('div'); d.className = 'dust';
          d.style.left = (land.cx - 11 + (Math.random() - .5) * m.W) + 'px'; d.style.top = (land.cy + m.H * .12 + (Math.random() - .5) * 40) + 'px';
          actors.appendChild(d);
          const dx = (Math.random() - .5) * m.W * 1.6;
          d.animate([{ transform: 'translate(0,0) scale(.4)', opacity: .9 }, { transform: `translate(${dx}px,${-20 - Math.random() * 50}px) scale(${2 + Math.random() * 2})`, opacity: 0 }], { duration: 900 + Math.random() * 500, easing: 'ease-out' }).finished.then(() => d.remove());
        }
        room.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(6px)' }, { transform: 'translateY(-3px)' }, { transform: 'translateY(0)' }], { duration: 380 });
        await go(hero, [F(m, { ...lay, rz: -5 }), F(m, { ...lay, rz: -5, cy: lay.cy - 30, rx: 50 }, { offset: .35 }), F(m, { ...lay, rz: -5 }, { offset: .62 }), F(m, { ...lay, rz: -5, cy: lay.cy - 10, rx: 56 }, { offset: .8 }), F(m, { ...lay, rz: -5 })], { duration: 720, easing: 'ease-in-out' });
      } else { hero.style.transform = tf(m, lay); }
      cur.pose = lay;

      /* 5 — the title card */
      titlecard.innerHTML = `<span class="mono">${esc(STATUS[book.status] || '')}</span><h3>${esc(book.title)}</h3><p>${esc(book.author)}</p>`;
      titlecard.classList.add('on');
      hint.textContent = (matchMedia('(pointer: coarse)').matches ? 'Tap' : 'Click') + ' the book to open it'; hint.classList.remove('off');
      hero.classList.add('ready');
      hero.setAttribute('tabindex', '0'); hero.setAttribute('role', 'button'); hero.setAttribute('aria-label', 'Open ' + book.title);
      setState('landed');
    }

    /* ── open the cover ───────────────────────────────────── */
    const chipExit = async (leave) => {
      if (!cur || REDUCED) return;
      const [A, B] = cur.cms, { cmW, cmH, m, land } = cur, box = rb();
      const feet = land.cy + m.H * .22;
      const x0A = land.cx - m.W * .66 - cmW * .6, x0B = land.cx + m.W * .66 - cmW * .4;
      const xA = leave ? -cmW * 1.5 : x0A, xB = leave ? box.width + cmW * .5 : x0B;
      const fromA = leave ? x0A : -cmW * 1.5, fromB = leave ? x0B : box.width + cmW * .5;
      /* leaving: A runs left, B runs right. Returning: A runs right, B runs left. */
      A.classList.toggle('flip', leave); B.classList.toggle('flip', !leave);
      A.classList.add('run'); B.classList.add('run');
      await Promise.all([
        go(A, [{ transform: cmTr(A, fromA, feet) }, { transform: cmTr(A, xA, feet) }], { duration: Math.abs(xA - fromA) / .6, easing: 'linear' }),
        go(B, [{ transform: cmTr(B, fromB, feet) }, { transform: cmTr(B, xB, feet) }], { duration: Math.abs(xB - fromB) / .6, easing: 'linear' }),
      ]);
      A.classList.remove('run'); B.classList.remove('run');
      if (!leave) { A.classList.remove('flip'); B.classList.add('flip'); }
      cur.cmsAway = leave;
    };

    const openPose = () => {
      const { m } = cur, b = rb();
      const s = Math.min(1.4, (b.width * .92) / (2 * m.W), (b.height * .7) / m.H);
      return { s, cx: b.width / 2 + s * m.W / 2, cy: b.height * .5 };
    };

    function animateLeaf(i, forward) {
      const el = cur.hero.querySelector(`.leaf[data-i="${i}"]`), z = 3 - i;
      const T = a => `rotateY(${a}deg) translateZ(${z}px)`;
      const [a0, a1] = forward ? [0, -180] : [-180, 0];
      const mid = `rotateY(-90deg) translateZ(${z + 36}px) skewY(${forward ? -3 : 3}deg)`;
      const opt = { duration: D(1150), easing: 'cubic-bezier(.55,.05,.3,1)', fill: 'forwards' };
      const rise = [{ opacity: 0 }, { opacity: .55, offset: .5 }, { opacity: .55 }];
      const fall = [{ opacity: .55 }, { opacity: .55, offset: .5 }, { opacity: 0 }];
      const front = el.querySelector('.front .shade'), back = el.querySelector('.back .shade');
      /* the face that is visible first darkens as it turns away; the second lightens as it arrives */
      (forward ? front : back).animate(rise, opt);
      (forward ? back : front).animate(fall, opt);
      const cr = cur.hero.querySelector('.cast-r'), cl = cur.hero.querySelector('.cast-l');
      cr.animate(forward ? [{ opacity: 0 }, { opacity: .55, offset: .4 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: .55, offset: .6 }, { opacity: 0 }], opt);
      cl.animate(forward ? [{ opacity: 0 }, { opacity: 0, offset: .45 }, { opacity: .5, offset: .85 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: .5, offset: .15 }, { opacity: 0, offset: .55 }, { opacity: 0 }], opt);
      return el.animate([{ transform: T(a0) }, { transform: mid, offset: .5 }, { transform: T(a1) }], opt).finished.then(() => { el.style.transform = T(a1); });
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
      const exit = chipExit(true);
      /* lift the book off the carpet to face us */
      const face = { cx: pose.cx, cy: pose.cy - m.H * .14, rx: 0, ry: 0, rz: 0, s: 1.04 };
      await go(hero, [F(m, pose), F(m, face)], { duration: 850, easing: 'cubic-bezier(.5,0,.2,1)' });
      cur.shadow && cur.shadow.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D(500), fill: 'forwards' });
      /* swap the solid box for the page-turning book */
      hero.querySelector('.hb-box').style.visibility = 'hidden';
      hero.querySelector('.hb-spread').style.visibility = 'visible';
      const op = openPose();
      const target = { cx: op.cx, cy: op.cy, rx: 0, ry: 0, rz: 0, s: op.s };
      await Promise.all([
        go(hero, [F(m, face), F(m, target)], { duration: 1250, easing: 'cubic-bezier(.5,0,.2,1)' }),
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
        for (let p = cur.page - 1; p >= 0; p--) { flips.push(animateLeaf(p, false)); await sleep(p === 0 ? 0 : 420); }
        await Promise.all([...flips, go(hero, [F(m, cur.pose), F(m, face)], { duration: 1250, easing: 'cubic-bezier(.5,0,.2,1)' })]);
        hero.querySelector('.hb-box').style.visibility = 'visible';
        hero.querySelector('.hb-spread').style.visibility = 'hidden';
        cur.shadow && cur.shadow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: D(500), fill: 'forwards' });
        await go(hero, [F(m, face), F(m, lay)], { duration: 700, easing: 'ease-in-out' });
        cur.page = 0;
      }
      if (cur.cmsAway) await chipExit(false);
      const [A, B] = cur.cms;
      if (!REDUCED) { A.classList.add('reach'); B.classList.add('reach'); await sleep(300); A.classList.replace('reach', 'cheer'); B.classList.replace('reach', 'cheer'); }
      const to = { cx: slot.cx, cy: slot.cy, rx: 0, ry: 90, rz: 355, s: m.s0 };
      const apex = Math.min(rb().height * .22, 200);
      const back = arcFrames(36, t => F(m, {
        cx: land.cx + (slot.cx - land.cx) * E.inOut(t), cy: land.cy + (slot.cy - land.cy) * E.inOut(t) - 4 * apex * t * (1 - t),
        rx: 58 * (1 - E.inOut(t)), ry: 90 * E.inOut(t), rz: -5 + 360 * E.inOut(t), s: m.lays + (m.s0 - m.lays) * E.inOut(t),
      }, { offset: t }));
      cur.shadow && cur.shadow.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D(700), fill: 'forwards' });
      const walkOff = (async () => { if (REDUCED) return; await sleep(500); A.classList.remove('cheer'); B.classList.remove('cheer'); await chipExit(true); })();
      await go(hero, back, { duration: 1100, easing: 'linear' });
      slotEl.style.visibility = 'visible';
      slotEl.animate([{ transform: 'translateY(-8px)' }, { transform: 'none' }], { duration: D(380), easing: 'cubic-bezier(.3,1.6,.5,1)' });
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
