/* Rohit CLI — a retro terminal you can actually use.
   Asleep it shows live charts and "press any key"; awake it is a small shell
   that knows about the whole site. The pixel chipmunk lives on top of it. */
(function () {
  const DATA = {};
  const load = async name => DATA[name] || (DATA[name] = await fetch('content/' + name + '.json?v=20261011').then(r => r.json()));
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const pad = (s, n) => String(s).padEnd(n, ' ');
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const THEMES = { amber: ['#ff9a2e', '#9c5a14', '#120a05'], green: ['#4cf08a', '#1f8f4d', '#06100a'], ice: ['#7fd6ff', '#3c7da3', '#050d14'], paper: ['#f3e7c9', '#9a8a68', '#15110c'] };
  const PAGES = { home: 'index.html', work: 'projects.html', projects: 'projects.html', journal: 'journal.html', learning: 'learning.html', shelf: 'books.html', books: 'books.html', 'open-source': 'contributions.html', contributions: 'contributions.html', contact: 'mailto:asoliyarohit@gmail.com' };
  PAGES.journal = 'learning.html';

  const BANNER = `<svg viewBox="0 0 400 120" class="t-banner" aria-label="Rohit CLI">
    <ellipse cx="200" cy="60" rx="176" ry="40" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".6"/>
    <ellipse cx="200" cy="60" rx="96" ry="40" fill="none" stroke="currentColor" stroke-width="1" opacity=".45"/>
    <ellipse cx="200" cy="60" rx="30" ry="40" fill="none" stroke="currentColor" stroke-width="1" opacity=".35"/>
    <line x1="24" y1="60" x2="376" y2="60" stroke="currentColor" opacity=".25"/>
    <text x="200" y="76" text-anchor="middle" font-family="'Press Start 2P', monospace" font-size="33" fill="currentColor" stroke="#000" stroke-width="2" paint-order="stroke">ROHIT CLI</text>
  </svg>`;

  window.createTerminal = function (host, opts = {}) {
    const overlay = !!opts.overlay;
    host.classList.add('term');
    host.innerHTML = `
      <div class="t-mascot"><div class="t-bubble" hidden></div><canvas class="t-chip" aria-hidden="true"></canvas><div class="t-zzz" aria-hidden="true"><i>z</i><i>z</i><i>Z</i></div></div>
      <div class="t-win" role="application" aria-label="Rohit CLI terminal">
        <div class="t-bar">
          <span class="t-grip" aria-hidden="true">⋮⋮</span><span class="t-dot"></span><span class="t-ttl">Rohit CLI v1.0</span>
          <span class="t-ctl"><button type="button" data-act="boot">[ boot ]</button><button type="button" data-act="nap">[ nap ]</button></span>
          <span class="t-click">click to play</span>
          <span class="t-btns"><button type="button" data-act="full" aria-label="Toggle fullscreen">⛶</button>${overlay ? '<button type="button" data-act="close" aria-label="Close terminal">✕</button>' : ''}</span>
        </div>
        <div class="t-screen">
          <div class="t-idle">
            <div class="t-charts"><div><span>QUERIES / S</span><canvas data-c="q"></canvas></div><div><span>ROWS SCANNED</span><canvas data-c="r"></canvas></div></div>
            ${BANNER}
            <p class="t-press">PRESS ANY KEY<b>█</b></p>
            <div class="t-lines"><div><span>LATENCY <em data-v="lat">25</em>MS</span><canvas data-c="l"></canvas></div><div><span>AWAITING INPUT · <em data-v="keys">0</em> KEYS</span><canvas data-c="k"></canvas></div></div>
          </div>
          <div class="t-shell" hidden>
            <div class="t-out" aria-live="polite"></div>
            <label class="t-line"><span class="t-ps1">rohit@portfolio:~$</span><input class="t-in" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Type a command" /></label>
            <div class="t-chips"><button type="button">help</button><button type="button">about</button><button type="button">projects</button><button type="button">skills</button><button type="button">shelf</button><button type="button">contact</button></div>
            <div class="t-status"><span>LATENCY <em data-v="lat2">25</em>ms</span><span>KEYS <em data-v="keys2">0</em></span><span>THEME <em data-v="theme">amber</em></span></div>
          </div>
          <div class="t-crt" aria-hidden="true"></div>
        </div>
      </div>`;
    const q = s => host.querySelector(s), qa = s => [...host.querySelectorAll(s)];
    const win = q('.t-win'), bubble = q('.t-bubble'), out = q('.t-out'), input = q('.t-in'), idle = q('.t-idle'), shell = q('.t-shell');
    const mascot = createMascot(q('.t-chip'));
    const ctl = { state: 'asleep', keys: 0, lat: 25, history: [], hi: -1, theme: 'amber', tipTimer: 0, visible: true, booted: false };
    const setState = s => { ctl.state = s; host.dataset.state = s; };

    /* ── speech bubble ─────────────────────────────────── */
    const say = (html, ms = 0, buttons) => {
      bubble.hidden = !html; bubble.innerHTML = html || '';
      if (buttons) buttons.forEach(([label, fn, primary]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (primary) b.className = 'p'; b.onclick = fn; bubble.querySelector('.t-bb') ? bubble.querySelector('.t-bb').append(b) : bubble.append(b); });
      clearTimeout(say.t); if (ms) say.t = setTimeout(() => { if (ctl.state !== 'asleep') bubble.hidden = true; }, ms);
    };
    const welcome = () => { bubble.hidden = false; bubble.innerHTML = '<p>Welcome! Any key boots it.</p><div class="t-bb"></div>'; const bb = bubble.querySelector('.t-bb'); [['Nap time', () => nap()], ['Boot', () => boot(), true]].forEach(([l, f, p]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = l; if (p) b.className = 'p'; b.onclick = e => { e.stopPropagation(); f(); }; bb.append(b); }); };

    /* ── charts: calm random walks in amber ──────────────── */
    const dpr = Math.min(devicePixelRatio || 1, 2), ch = {};
    qa('canvas[data-c]').forEach(c => { ch[c.dataset.c] = { c, ctx: c.getContext('2d'), v: Array.from({ length: 28 }, (_, i) => Math.exp(-i / 7) * (.7 + Math.random() * .3)), w: 0, h: 0 }; });
    const walk = [Array.from({ length: 48 }, () => .3 + Math.random() * .2), Array.from({ length: 48 }, () => .2 + Math.random() * .1)];
    const css = () => getComputedStyle(host).getPropertyValue('--t-fg').trim() || '#ff9a2e';
    const fitC = o => { const r = o.c.getBoundingClientRect(); if (!r.width) return false; const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr); if (o.w !== w || o.h !== h) { o.c.width = w; o.c.height = h; o.w = w; o.h = h; } return true; };
    function drawBars(o, tick) {
      if (!fitC(o)) return; const { ctx, w, h } = o, col = css(); ctx.clearRect(0, 0, w, h);
      const n = 28, bw = w / n; o.v.forEach((v, i) => { const base = Math.exp(-i / 7) * (.85 + .15 * Math.sin(tick * .8 + i * .5)); o.v[i] += (base - v) * .12; const bh = Math.max(2, o.v[i] * (h - 14)); ctx.fillStyle = i === 0 ? '#ffe9b8' : col; ctx.globalAlpha = i === 0 ? 1 : .82; ctx.fillRect(i * bw + 1, h - bh, bw - 2, bh); });
      ctx.globalAlpha = 1; ctx.strokeStyle = '#ffe9b8'; ctx.lineWidth = 1.5 * dpr; ctx.beginPath(); o.v.forEach((v, i) => { const x = i * bw + bw / 2, y = h - Math.max(2, v * (h - 14)) - 6 * dpr * (1 - i / n); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    }
    function drawLine(o, series, extra) {
      if (!fitC(o)) return; const { ctx, w, h } = o, col = css(); ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = col; ctx.globalAlpha = .22; ctx.lineWidth = 1; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, h * i / 4); ctx.lineTo(w, h * i / 4); ctx.stroke(); }
      ctx.globalAlpha = 1; ctx.lineWidth = 1.6 * dpr; ctx.beginPath(); series.forEach((v, i) => { const x = i / (series.length - 1) * w, y = h - v * (h - 6) - 3; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      const lv = series[series.length - 1]; ctx.fillStyle = '#ffe9b8'; ctx.fillRect(w - 4 * dpr, h - lv * (h - 6) - 5, 4 * dpr, 4 * dpr);
    }
    let tick = 0, lastDraw = 0, raf = 0;
    const frame = t => {
      raf = requestAnimationFrame(frame); if (!ctl.visible || document.hidden || t - lastDraw < 90) return; lastDraw = t; tick += .09; if (REDUCED) tick = 0;
      if (ctl.state === 'asleep' || ctl.state === 'napping') {
        drawBars(ch.q, tick); drawBars(ch.r, tick + 2);
        walk[0].push(Math.max(.08, Math.min(.9, walk[0].at(-1) + (Math.random() - .5) * .16))); walk[0].shift();
        walk[1].push(ctl.state === 'napping' ? .04 : Math.max(.04, Math.min(.9, walk[1].at(-1) * .9 + (Math.random() < .08 ? .5 : 0) + .02))); walk[1].shift();
        drawLine(ch.l, walk[0]); drawLine(ch.k, walk[1]);
        ctl.lat = Math.round(18 + walk[0].at(-1) * 50); const a = q('[data-v=lat]'); if (a) a.textContent = ctl.lat;
      }
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([e]) => { ctl.visible = e.isIntersecting; }, { threshold: .05 }); io.observe(host);

    /* ── the shell ───────────────────────────────────────── */
    const line = (html, cls = '') => { const d = document.createElement('div'); d.className = 'l ' + cls; d.innerHTML = html; out.append(d); out.scrollTop = out.scrollHeight; return d; };
    const lines = async (arr, gap = 28) => { for (const l of arr) { line(l); if (!REDUCED && gap) await sleep(gap); } };
    const bar = n => '█'.repeat(Math.round(n / 10)) + '░'.repeat(10 - Math.round(n / 10));
    const go = href => { if (/^mailto:/.test(href)) { location.href = href; return; } line(`<span class="dim">→ opening ${esc(href)} …</span>`); setTimeout(() => (window.__go ? window.__go(href) : (location.href = href)), 350); };
    const COMMANDS = {
      help: async () => lines(['<span class="hl">Commands</span>', '  <b>about</b>      who I am', '  <b>skills</b>     what I work with', '  <b>projects</b>   things I have built', '  <b>journal</b>    what I am learning', '  <b>shelf</b>      books I read', '  <b>contact</b>    ways to reach me', '  <b>open</b> &lt;page&gt;   go there (home, work, journal, shelf, open-source)', '  <b>theme</b>      cycle colours', '  <b>neofetch</b>  a quick summary', '  <b>clear</b>      wipe the screen', '<span class="dim">Tip: Tab completes, ↑ recalls, Esc closes.</span>']),
      about: async () => { const a = await load('about'); await lines([`<span class="hl">Rohit Singh Asoliya</span> · ${esc(a.hero.roles.join(' / '))}`, '', ...a.paragraphs.map(esc), '', `<span class="dim">${esc(a.hero.bio)}</span>`], 40); },
      skills: async () => { const s = await load('skills'); await lines(['<span class="hl">Toolkit</span>', ...s.map(x => `  ${pad(esc(x.name), 15)}${bar(x.level)} ${x.level}%`)]); },
      projects: async () => { const p = await load('projects'); await lines(['<span class="hl">Projects</span>', ...p.map((x, i) => `  ${i + 1}. <b>${esc(x.title)}</b> <span class="dim">[${x.status === 'done' ? 'shipped' : 'in progress'}]</span><br>     ${esc(x.desc)}<br>     <span class="dim">${esc(x.tech.join(' · '))}</span>`), '<span class="dim">Type "open work" for the full page.</span>'], 50); },
      journal: async () => { const l = await load('learnings'); await lines(['<span class="hl">Journal</span>', ...l.map(x => `  <span class="dim">${esc(x.date)}</span>  ${esc(x.title)}`), '<span class="dim">Type "open journal" to read them.</span>']); },
      shelf: async () => { const b = await load('books'); const st = { completed: 'read', reading: 'reading', want: 'up next' }; await lines(['<span class="hl">Shelf</span>', ...b.map(x => `  <b>${esc(x.title)}</b> <span class="dim">— ${esc(x.author)} [${st[x.status] || x.status}]</span>`), '<span class="dim">Type "open shelf" and let the drones fetch one.</span>']); },
      contact: async () => { const a = await load('about'); await lines(['<span class="hl">Say hello</span>', ...a.links.map(l => `  <a href="${esc(l.href)}" ${l.external ? 'target="_blank" rel="noopener"' : ''}>${esc(l.label)}</a> <span class="dim">${esc(l.href.replace(/^mailto:/, ''))}</span>`)]); },
      whoami: async () => line('rohit — staff data analyst, curious learner, problem solver'),
      date: async () => line(new Date().toString()),
      ls: async () => line('about  skills  projects  journal  shelf  contact'),
      theme: async () => { const k = Object.keys(THEMES), n = k[(k.indexOf(ctl.theme) + 1) % k.length]; setTheme(n); line(`theme → <b>${n}</b>`); },
      neofetch: async () => { const [s, p, b] = await Promise.all([load('skills'), load('projects'), load('books')]); await lines(['<span class="hl">rohit@portfolio</span>', '-----------------', `role      Staff Data Analyst`, `projects  ${p.length}`, `skills    ${s.map(x => x.name).slice(0, 3).join(', ')} …`, `books     ${b.length} on the shelf`, `mascot    one very small chipmunk`, `uptime    ${Math.floor((performance.now() / 1000) / 60)}m ${Math.floor(performance.now() / 1000) % 60}s`]); },
      clear: async () => { out.innerHTML = ''; },
      exit: async () => { if (overlay) opts.onClose && opts.onClose(); else line('<span class="dim">nowhere to go — you are already home.</span>'); },
      open: async args => { const k = (args[0] || '').toLowerCase(); if (PAGES[k]) go(PAGES[k]); else line(`usage: open &lt;${Object.keys(PAGES).filter(x => x !== 'contact').join(' | ')}&gt;`); },
      sudo: async args => { if (args.join(' ') === 'hire rohit') { mascot.setMood('dance'); await lines(['[sudo] password for recruiter: ********', 'permission granted ✓', 'drafting offer letter .......... done', `<a href="mailto:asoliyarohit@gmail.com?subject=Let%27s%20talk">→ press here to send the first message</a>`, '<span class="dim">The chipmunk approves.</span>'], 360); setTimeout(() => ctl.state === 'ready' && mascot.setMood('idle'), 3500); } else line('nice try. (hint: sudo hire rohit)'); },
    };
    COMMANDS.work = COMMANDS.projects; COMMANDS.learning = COMMANDS.journal; COMMANDS.books = COMMANDS.shelf; COMMANDS.links = COMMANDS.contact;
    const NAMES = Object.keys(COMMANDS).filter(n => !['work', 'learning', 'books', 'links'].includes(n));

    async function run(raw) {
      const cmd = raw.trim(); if (!cmd) return;
      ctl.history.push(cmd); ctl.hi = ctl.history.length;
      line(`<span class="ps">rohit@portfolio:~$</span> ${esc(cmd)}`);
      const [name, ...args] = cmd.split(/\s+/), fn = COMMANDS[name.toLowerCase()];
      if (!fn) { mascot.setMood('think'); line(`command not found: <b>${esc(name)}</b> — try <b>help</b>`, 'err'); setTimeout(() => ctl.state === 'ready' && mascot.setMood('idle'), 1600); return; }
      mascot.setMood('happy'); mascot.hop(); await fn(args); setTimeout(() => ctl.state === 'ready' && mascot.mood !== 'dance' && mascot.setMood('idle'), 900);
    }

    /* ── states: asleep → booting → ready (or napping) ───── */
    function setTheme(n) { const t = THEMES[n]; if (!t) return; ctl.theme = n; host.style.setProperty('--t-fg', t[0]); host.style.setProperty('--t-dim', t[1]); host.style.setProperty('--t-bg', t[2]); const e = q('[data-v=theme]'); if (e) e.textContent = n; }
    const tips = ['psst… type <b>projects</b>', 'try <b>sudo hire rohit</b> 😉', '<b>open shelf</b> — drones will fetch a book', 'try <b>theme</b> for new colours', 'Tab completes commands'];
    function startTips() { clearInterval(ctl.tipTimer); let i = 0; ctl.tipTimer = setInterval(() => { if (ctl.state === 'ready' && ctl.visible) { say(`<p>${tips[i++ % tips.length]}</p>`, 5200); } }, 14000); }
    async function boot() {
      if (ctl.state === 'booting' || ctl.state === 'ready') { input.focus(); return; }
      setState('booting'); mascot.setMood('happy'); mascot.hop(); say('<p>Booting up…</p>');
      idle.hidden = true; shell.hidden = false; out.innerHTML = '';
      const steps = ['RSA-BIOS v1.0 · memory check … 640K ok', 'mounting /data/about ........ [ ok ]', 'mounting /data/projects ..... [ ok ]', 'mounting /data/shelf ........ [ ok ]', 'feeding the chipmunk ........ [ ok ]'];
      for (const s of steps) { line(`<span class="dim">${s}</span>`); if (!REDUCED) await sleep(170); }
      line('<span class="hl">Welcome to Rohit CLI.</span> Type <b>help</b> to get started.'); ctl.booted = true;
      setState('ready'); mascot.setMood('idle'); say('<p>All set! Type a command — or tap a chip.</p>', 5000); startTips();
      input.focus({ preventScroll: true });          /* they chose to boot it, so it's theirs to type in */
    }
    function nap() {
      setState('napping'); idle.hidden = false; shell.hidden = true; clearInterval(ctl.tipTimer);
      mascot.setMood('nap'); bubble.hidden = true; host.classList.add('is-napping'); q('.t-press').innerHTML = 'ZZZ… PRESS ANY KEY<b>█</b>';
    }
    function wake() { host.classList.remove('is-napping'); q('.t-press').innerHTML = 'PRESS ANY KEY<b>█</b>'; setState('asleep'); mascot.setMood('idle'); welcome(); }

    /* ── input ───────────────────────────────────────────── */
    input.addEventListener('keydown', e => {
      ctl.keys++; qa('[data-v=keys2],[data-v=keys]').forEach(n => n.textContent = ctl.keys);
      if (e.key === 'Enter') { const v = input.value; input.value = ''; run(v); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (ctl.history.length) { ctl.hi = Math.max(0, ctl.hi - 1); input.value = ctl.history[ctl.hi] || ''; } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); ctl.hi = Math.min(ctl.history.length, ctl.hi + 1); input.value = ctl.history[ctl.hi] || ''; }
      else if (e.key === 'Tab') { e.preventDefault(); const v = input.value.trim().toLowerCase(); const m = NAMES.filter(n => n.startsWith(v)); if (m.length === 1) input.value = m[0] + ' '; else if (m.length > 1) line(`<span class="dim">${m.join('  ')}</span>`); }
      else if (e.key.length === 1) { mascot.setMood('type'); clearTimeout(ctl.typeT); ctl.typeT = setTimeout(() => ctl.state === 'ready' && mascot.mood === 'type' && mascot.setMood('idle'), 700); }
      if (!(e.metaKey || e.ctrlKey) && e.key !== 'Escape') e.stopPropagation();
    });
    input.addEventListener('input', () => { const e = q('[data-v=lat2]'); if (e) e.textContent = 12 + Math.floor(Math.random() * 40); });
    q('.t-chips').addEventListener('click', e => { const b = e.target.closest('button'); if (b && ctl.state === 'ready') run(b.textContent); });
    out.addEventListener('click', e => { if (!e.target.closest('a')) input.focus({ preventScroll: true }); });
    q('.t-screen').addEventListener('click', () => { if (ctl.state === 'asleep') boot(); else if (ctl.state === 'napping') { wake(); boot(); } else if (ctl.state === 'ready') input.focus({ preventScroll: true }); });
    host.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; e.stopPropagation(); const a = b.dataset.act; if (a === 'boot') boot(); if (a === 'nap') nap(); if (a === 'close') opts.onClose && opts.onClose(); if (a === 'full') { win.classList.toggle('full'); host.classList.toggle('is-full'); } });
    /* any key boots it (when it's on screen) */
    const onKey = e => { if (!ctl.visible && !overlay) return; if (e.metaKey || e.ctrlKey || e.altKey || ['Tab', 'Shift', 'Escape'].includes(e.key)) return; if (ctl.state === 'asleep') { e.preventDefault(); boot(); } else if (ctl.state === 'napping') { e.preventDefault(); wake(); boot(); } };
    addEventListener('keydown', onKey);

    /* ── dragging the window ─────────────────────────────── */
    if (!matchMedia('(pointer: coarse)').matches) {
      let sx, sy, ox = 0, oy = 0, drag = false;
      q('.t-bar').addEventListener('pointerdown', e => { if (e.target.closest('button') || win.classList.contains('full')) return; drag = true; sx = e.clientX - ox; sy = e.clientY - oy; q('.t-bar').setPointerCapture(e.pointerId); host.classList.add('dragging'); });
      q('.t-bar').addEventListener('pointermove', e => { if (!drag) return; ox = e.clientX - sx; oy = e.clientY - sy; host.style.setProperty('--dx', ox + 'px'); host.style.setProperty('--dy', oy + 'px'); });
      const end = () => { drag = false; host.classList.remove('dragging'); };
      q('.t-bar').addEventListener('pointerup', end); q('.t-bar').addEventListener('pointercancel', end);
    }

    setTheme('amber'); setState('asleep'); welcome();
    return {
      boot, nap, wake, say, mascot, el: host, focus: () => input.focus({ preventScroll: true }),
      destroy() { cancelAnimationFrame(raf); clearInterval(ctl.tipTimer); removeEventListener('keydown', onKey); io.disconnect(); mascot.destroy(); },
      get state() { return ctl.state; },
      run,
    };
  };

  /* the global ⌘K / Ctrl+K overlay, available on every page */
  let ov = null;
  window.openTerminal = function () {
    if (ov) return; const wrap = document.createElement('div'); wrap.className = 'term-overlay'; wrap.innerHTML = '<div class="term-back"></div><div class="term-host"></div>';
    document.body.append(wrap); document.documentElement.classList.add('term-open');
    const term = createTerminal(wrap.querySelector('.term-host'), { overlay: true, onClose: close });
    requestAnimationFrame(() => wrap.classList.add('on')); setTimeout(() => term.boot(), 350);
    function close() { wrap.classList.remove('on'); document.documentElement.classList.remove('term-open'); setTimeout(() => { term.destroy(); wrap.remove(); ov = null; }, 380); removeEventListener('keydown', esc2); }
    const esc2 = e => { if (e.key === 'Escape') close(); }; addEventListener('keydown', esc2);
    wrap.querySelector('.term-back').addEventListener('click', close);
    ov = { close };
  };
  window.toggleTerminal = () => (ov ? ov.close() : window.openTerminal());
})();
