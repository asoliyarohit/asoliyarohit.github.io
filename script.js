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
      <li><button class="nav-jump" id="navJump" type="button" aria-label="Open the terminal"><span class="t-ico">&gt;_</span><span>Terminal</span><kbd id="kA">&#8984;</kbd><kbd>K</kbd></button></li>
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
    window.__go = href => { wipe.classList.add('leaving'); setTimeout(() => { location.href = href; }, 520); };
  }
})();

/* ── Terminal on every page (Ctrl/⌘+K), loaded on demand ───── */
const loadJS = src => new Promise((res, rej) => {
  if (document.querySelector(`script[data-lazy="${src}"]`)) return res();
  const t = document.createElement('script'); t.src = src; t.dataset.lazy = src; t.onload = res; t.onerror = rej; document.head.append(t);
});
async function ensureTerminal() { if (window.toggleTerminal) return; if (!window.createMascot) await loadJS('mascot.js?v=20261011'); await loadJS('cli.js?v=20261011'); }
{
  const k = document.getElementById('kA'); if (k && !/Mac|iPhone|iPad/.test(navigator.platform)) k.textContent = 'Ctrl';
  document.getElementById('navJump').addEventListener('click', async () => { await ensureTerminal(); window.toggleTerminal(); });
  addEventListener('keydown', async e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); await ensureTerminal(); window.toggleTerminal(); } });
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

/* ── Renderers ────────────────────────────────────────────── */
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
const getJSON = f => fetch('content/' + f + '?v=20261011').then(r => r.json());

(async function () {
  switch (PAGE) {
    case 'home':          break;   /* home.js tells its own story */
    case 'projects':      renderProjects(await getJSON('projects.json')); break;
    case 'learning':      renderLearnings(await getJSON('learnings.json')); break;
    case 'books':         break;   /* handled by shelf3d/main.js */
    case 'contributions': renderContributions(await getJSON('contributions.json')); break;
  }
  initScrollReveal();
})().catch(err => console.error('Content load failed:', err));
