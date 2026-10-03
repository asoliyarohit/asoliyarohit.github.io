/* ═══════════════════════════════════════════════════════════
   Rohit Singh Asoliya — portfolio
   ═══════════════════════════════════════════════════════════ */

const PAGE = document.body.dataset.page || 'home';
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EMAIL = 'asoliyarohit@gmail.com';

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad2 = n => String(n).padStart(2, '0');

/* ── Chrome: nav, footer, cursor, page wipe ───────────────── */
(function buildChrome() {
  const nav = `
  <div class="progress" id="progress"></div>
  <div class="cursor" id="cursor"></div>
  <div class="wipe" id="wipe"></div>
  <nav id="navbar">
    <a href="index.html" class="nav-logo">R.S.A</a>
    <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">Menu</button>
    <ul class="nav-links" id="nav-links">
      <li><a href="index.html#about">About</a></li>
      <li><a href="projects.html">Work</a></li>
      <li><a href="learning.html">Journal</a></li>
      <li><a href="books.html">Shelf</a></li>
      <li><a href="contributions.html">Open Source</a></li>
      <li><a href="mailto:${EMAIL}" class="nav-cta">Say hello</a></li>
    </ul>
  </nav>`;

  const footer = `
  <footer>
    <div class="container">
      <a href="mailto:${EMAIL}" class="foot-cta">Let’s make<br/>data <em>speak.</em></a>
      <a href="mailto:${EMAIL}" class="foot-mail link-arrow">${EMAIL} &nearr;</a>
      <div class="footer-bottom mono">
        <span>&copy; ${new Date().getFullYear()} Rohit Singh Asoliya</span>
        <div class="footer-links">
          <a href="https://github.com/asoliyarohit" target="_blank" rel="noopener">GitHub</a>
          <a href="https://www.linkedin.com/in/asoliyarohit" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://twitter.com/asoliyarohit" target="_blank" rel="noopener">Twitter</a>
        </div>
      </div>
    </div>
  </footer>`;

  document.body.insertAdjacentHTML('afterbegin', nav);
  document.body.insertAdjacentHTML('beforeend', footer);

  /* active link */
  const links = document.querySelectorAll('.nav-links a');
  const file = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const f = (a.getAttribute('href') || '').split('#')[0];
    if (f === file && !a.getAttribute('href').includes('#')) a.classList.add('active');
  });

  /* hamburger */
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('nav-links');
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    btn.textContent = open ? 'Close' : 'Menu';
  });

  /* scroll progress */
  const bar = document.getElementById('progress');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--p', (max > 0 ? scrollY / max * 100 : 0) + '%');
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* custom cursor */
  const cur = document.getElementById('cursor');
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !REDUCED) {
    let x = 0, y = 0, tx = 0, ty = 0;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); });
    document.addEventListener('pointerleave', () => cur.classList.remove('on'));
    (function loop() {
      x += (tx - x) * .22; y += (ty - y) * .22;
      cur.style.transform = `translate(${x}px,${y}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', e => {
      cur.classList.toggle('big', !!e.target.closest('a, button, summary, .book-slot, .hero.ready'));
    });
  }

  /* page transitions */
  const wipe = document.getElementById('wipe');
  if (!REDUCED) {
    wipe.classList.add('entering');
    requestAnimationFrame(() => requestAnimationFrame(() => wipe.classList.add('go')));
    setTimeout(() => wipe.classList.remove('entering', 'go'), 900);
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname === location.pathname) return;
      e.preventDefault();
      wipe.classList.add('leaving');
      setTimeout(() => { location.href = a.href; }, 520);
    });
    addEventListener('pageshow', e => { if (e.persisted) wipe.classList.remove('leaving'); });
  }
})();

/* ── Hero: orbiting particle field ("singularity") ────────── */
function initField() {
  const canvas = document.getElementById('field');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr, cx, cy, parts = [], visible = true;
  const mouse = { x: -999, y: -999 };

  function setup() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const wide = w > 820;
    cx = wide ? w * .8 : w * .5;
    cy = wide ? h * .43 : h * .26;
    const R = Math.min(w, h) * (wide ? .55 : .5);
    const n = Math.round(Math.min(1100, (w * h) / 1500));
    parts = Array.from({ length: n }, () => {
      const t = Math.random();
      return {
        r: 28 + Math.pow(t, 1.6) * R,
        a: Math.random() * Math.PI * 2,
        s: .0009 + Math.random() * .0006,
        ox: 0, oy: 0,
        size: Math.random() * 1.3 + .4,
        hot: Math.random() < .07,
      };
    });
  }

  function frame() {
    if (visible) {
      ctx.clearRect(0, 0, w, h);
      /* core glow */
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
      g.addColorStop(0, 'rgba(255,91,46,.28)'); g.addColorStop(1, 'rgba(255,91,46,0)');
      ctx.fillStyle = g; ctx.fillRect(cx - 130, cy - 130, 260, 260);

      for (const p of parts) {
        p.a += p.s * (260 / p.r) * (REDUCED ? 0 : 1);
        let x = cx + Math.cos(p.a) * p.r;
        let y = cy + Math.sin(p.a) * p.r * .5;
        /* tilt the disc */
        const tilt = -.32, xr = x - cx, yr = y - cy;
        x = cx + xr * Math.cos(tilt) - yr * Math.sin(tilt);
        y = cy + xr * Math.sin(tilt) + yr * Math.cos(tilt);

        const dx = x + p.ox - mouse.x, dy = y + p.oy - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { const f = (1 - d2 / 14000) * 3; const d = Math.sqrt(d2) || 1; p.ox += dx / d * f; p.oy += dy / d * f; }
        p.ox *= .93; p.oy *= .93;

        ctx.fillStyle = p.hot ? 'rgba(255,91,46,.95)' : 'rgba(236,233,226,' + (.18 + (1 - p.r / (w * .6)) * .45).toFixed(2) + ')';
        ctx.fillRect(x + p.ox, y + p.oy, p.size, p.size);
      }
      /* event horizon */
      ctx.beginPath(); ctx.arc(cx, cy, 24, 0, 7);
      ctx.fillStyle = '#0a0a0b'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,91,46,.8)'; ctx.lineWidth = 1; ctx.stroke();
    }
    if (!REDUCED) requestAnimationFrame(frame);
  }

  setup();
  frame();
  addEventListener('resize', setup);
  addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(canvas);
}

/* ── Hero role swapper ────────────────────────────────────── */
function initSwap(roles) {
  const el = document.getElementById('swap');
  if (!el || REDUCED) return;
  let i = 0;
  setInterval(() => {
    el.style.transition = 'opacity .35s, transform .35s';
    el.style.opacity = 0; el.style.transform = 'translateY(8px)';
    setTimeout(() => {
      i = (i + 1) % roles.length; el.textContent = roles[i];
      el.style.opacity = 1; el.style.transform = 'none';
    }, 350);
  }, 2600);
}

/* ── Observers ────────────────────────────────────────────── */
function initScrollReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.setProperty('--d', ((i % 4) * .07) + 's');
    io.observe(el);
  });
}

function initSkillBars() {
  const col = document.querySelector('.skill-list');
  if (!col) return;
  new IntersectionObserver((es, io) => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.skill-fill').forEach(b => { b.style.width = b.dataset.level + '%'; });
    io.unobserve(e.target);
  }), { threshold: .3 }).observe(col);
}

function initStatsCounter() {
  const row = document.querySelector('.stats-row');
  if (!row) return;
  new IntersectionObserver((es, io) => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.stat-num').forEach(el => {
      const target = +el.dataset.target, t0 = performance.now(), dur = 1400;
      (function step(t) {
        const k = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - k, 4);
        el.textContent = Math.round(target * eased);
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
    io.unobserve(e.target);
  }), { threshold: .5 }).observe(row);
}

/* words light up as the statement scrolls through the viewport */
function initStatement() {
  const el = document.querySelector('.statement');
  if (!el) return;
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(w => `<span class="w">${esc(w)}</span>`).join(' ');
  const spans = el.querySelectorAll('.w');
  const update = () => {
    const r = el.getBoundingClientRect();
    const p = Math.min(Math.max((innerHeight * .85 - r.top) / (r.height + innerHeight * .3), 0), 1);
    const lit = Math.round(p * spans.length);
    spans.forEach((s, i) => s.classList.toggle('lit', REDUCED || i < lit));
  };
  addEventListener('scroll', update, { passive: true });
  update();
}

/* ── Renderers ────────────────────────────────────────────── */
function renderHome(about, skills, projects) {
  document.querySelector('.hero-bio').textContent = about.hero.bio;
  document.getElementById('swap').textContent = about.hero.roles[1] || about.hero.roles[0];

  document.querySelector('.marquee-track').innerHTML =
    [...skills.map(s => s.name), 'Python', 'Pandas', 'Matplotlib', 'Statistics']
      .map(t => `<span>${esc(t)}</span><span>&#10038;</span>`).join('').repeat(2);

  document.querySelector('.statement').textContent = about.paragraphs[0];
  document.querySelector('.about-text').innerHTML =
    `<p>${esc(about.paragraphs[1])}</p>` +
    `<div class="links-row">${about.links.map(l =>
      `<a href="${esc(l.href)}"${l.external ? ' target="_blank" rel="noopener"' : ''} class="link-badge">${esc(l.label)}</a>`).join('')}</div>`;

  document.querySelector('.skill-list').innerHTML = skills.map(s => `
    <div class="skill-item">
      <span class="skill-name">${esc(s.name)}</span>
      <div class="skill-bar"><div class="skill-fill" data-level="${s.level}"></div></div>
      <span class="skill-pct">${s.level}%</span>
    </div>`).join('');

  document.querySelector('.stats-row').innerHTML = about.stats.map(s => `
    <div class="stat-card">
      <div class="stat-num" data-target="${s.target}">0</div>
      <div class="stat-label">${esc(s.label)}</div>
    </div>`).join('');

  renderProjects(projects.slice(0, 3));
}

function renderProjects(projects) {
  const list = document.querySelector('.work-list');
  if (!list) return;
  list.innerHTML = projects.map((p, i) => `
    <a class="work-row reveal" href="${esc(p.link)}" target="_blank" rel="noopener">
      <span class="work-num">${pad2(i + 1)}</span>
      <div>
        <div class="work-tag mono"><span>${esc(p.tag)}</span><span class="status ${p.status}">${p.status === 'done' ? 'Shipped' : 'In progress'}</span></div>
        <h3 class="work-title">${esc(p.title)}</h3>
      </div>
      <div class="work-detail">
        <p class="work-desc">${esc(p.desc)}</p>
        <ul class="work-hl">${p.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>
        <div class="pills">${p.tech.map(t => `<span class="pill">${esc(t)}</span>`).join('')}</div>
      </div>
      <span class="work-go">&nearr;</span>
    </a>`).join('');
}

function renderLearnings(items) {
  document.querySelector('.learning-list').innerHTML = items.map(l => `
    <details class="learning-card reveal">
      <summary>
        <div class="learn-row">
          <span class="learn-date mono">${esc(l.date)}</span>
          <div>
            <span class="learn-tag mono">${esc(l.tag)}</span>
            <h3 class="learn-title">${esc(l.title)}</h3>
            <p class="learn-sum">${esc(l.summary)}</p>
          </div>
          <span class="learn-plus">+</span>
        </div>
      </summary>
      <ul class="learn-highlights">${l.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>
    </details>`).join('');
}

function renderContributions(c) {
  document.querySelector('.timeline').innerHTML = c.openSource.map(item => `
    <div class="tl-item reveal">
      <div class="tl-header">
        <span class="tl-title">${esc(item.title)}</span>
        <span class="tl-status ${esc(item.status)}-badge">${esc(item.status)}</span>
      </div>
      <p class="tl-org mono">${esc(item.org)}</p>
      <p>${esc(item.desc)}</p>
      <span class="tl-date mono">${esc(item.date)}</span>
    </div>`).join('');

  document.querySelector('.consult-cards').innerHTML = c.availableFor.map(x => `
    <div class="consult-card reveal">
      <h4>${esc(x.title)}</h4>
      <p>${esc(x.desc)}</p>
      <div class="pills">${x.tech.map(t => `<span class="pill">${esc(t)}</span>`).join('')}</div>
    </div>`).join('');
}

/* ── Routing ──────────────────────────────────────────────── */
const getJSON = f => fetch('content/' + f + '?v=20261006').then(r => r.json());

(async function () {
  switch (PAGE) {
    case 'home': {
      const [about, skills, projects] = await Promise.all([getJSON('about.json'), getJSON('skills.json'), getJSON('projects.json')]);
      renderHome(about, skills, projects);
      initField(); initSwap(about.hero.roles.slice(1));
      initStatement(); initSkillBars(); initStatsCounter();
      break;
    }
    case 'projects':      renderProjects(await getJSON('projects.json')); break;
    case 'learning':      renderLearnings(await getJSON('learnings.json')); break;
    case 'books':         initBooksScene(await getJSON('books.json')); break;
    case 'contributions': renderContributions(await getJSON('contributions.json')); break;
  }
  initScrollReveal();
})().catch(err => console.error('Content load failed:', err));
