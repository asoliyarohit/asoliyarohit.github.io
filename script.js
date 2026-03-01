/* ── Matrix Rain ──────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  const CHARS = 'アイウエオカキクケコ0123456789ABCDEFabcdef<>/{}[]()=+*#$%';
  const FONT = 14;
  let cols, drops;

  function setup() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / FONT);
    drops = Array.from({ length: cols }, () => Math.random() * -100);
  }
  function draw() {
    ctx.fillStyle = 'rgba(5,5,8,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = FONT + 'px Fira Code, monospace';
    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      ctx.fillStyle = drops[i] * FONT > canvas.height - FONT
        ? 'rgba(180,255,200,' + (Math.random() * 0.6 + 0.4) + ')'
        : 'rgba(0,255,65,'   + (Math.random() * 0.35 + 0.05) + ')';
      ctx.fillText(char, i * FONT, drops[i] * FONT);
      if (drops[i] * FONT > canvas.height && Math.random() > 0.978) drops[i] = 0;
      drops[i] += 0.5;
    }
    requestAnimationFrame(draw);
  }
  setup();
  draw();
  window.addEventListener('resize', setup);
})();

/* ── Navbar ───────────────────────────────────────────────── */
(function () {
  const nav   = document.getElementById('navbar');
  const links = Array.from(nav.querySelectorAll('.nav-links a'));
  const PAGE  = document.body.dataset.page || 'home';

  function updateScrollFx() {
    const y   = window.scrollY;
    const pct = document.body.scrollHeight - window.innerHeight;
    nav.classList.toggle('scrolled', y > 20);
    nav.style.setProperty('--scroll-pct', (pct > 0 ? y / pct * 100 : 0).toFixed(1) + '%');
  }
  window.addEventListener('scroll', updateScrollFx, { passive: true });
  updateScrollFx();

  if (PAGE === 'home') {
    /* scroll-based active link for the two-section home page */
    window.addEventListener('scroll', () => {
      const sections = Array.from(document.querySelectorAll('section[id]'));
      const y = window.scrollY;
      let current = '';
      sections.forEach(s => { if (y + 90 >= s.offsetTop) current = s.id; });
      links.forEach(a => {
        const href = a.getAttribute('href') || '';
        a.classList.toggle('active', current !== '' && href.includes('#' + current));
      });
    }, { passive: true });
  } else {
    /* static active link for single-section pages */
    const path = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
      const linkFile = (a.getAttribute('href') || '').split('#')[0];
      a.classList.toggle('active', linkFile === path);
    });
  }
})();

/* ── Mobile hamburger ─────────────────────────────────────── */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('nav-links');
  btn.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
})();

/* ── Shared helpers ───────────────────────────────────────── */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Observer helpers (called after DOM is populated) ─────── */
function initScrollReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

function initSkillBars() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-fill').forEach(b => { b.style.width = b.dataset.level + '%'; });
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  const col = document.querySelector('.skills-col');
  if (col) io.observe(col);
}

function initStatsCounter() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.stat-num').forEach(el => {
          const target = +el.dataset.target;
          let n = 0;
          const step = Math.ceil(target / 40);
          const id = setInterval(() => {
            n = Math.min(n + step, target);
            el.textContent = n + (target >= 100 ? '' : '+');
            if (n >= target) clearInterval(id);
          }, 40);
        });
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  const row = document.querySelector('.stats-row');
  if (row) io.observe(row);
}

function initTypewriter(roles) {
  const el = document.getElementById('typewriter');
  if (!el) return;
  let ri = 0, ci = 0, deleting = false;
  function tick() {
    const word = roles[ri];
    if (deleting) {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
      setTimeout(tick, 60);
    } else {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(tick, 2000); }
      else setTimeout(tick, 100);
    }
  }
  setTimeout(tick, 600);
}

/* ── Render functions ─────────────────────────────────────── */
function renderAbout(about, skills) {
  const bioel = document.querySelector('.hero-bio');
  if (bioel) bioel.textContent = about.hero.bio;

  const aboutText = document.querySelector('.about-text');
  if (aboutText) {
    const ps   = about.paragraphs.map(p => `<p>${esc(p)}</p>`).join('');
    const lnks = about.links.map(l =>
      `<a href="${esc(l.href)}"${l.external ? ' target="_blank" rel="noopener"' : ''} class="link-badge">${esc(l.label)}</a>`
    ).join('');
    aboutText.innerHTML = ps + `<div class="links-row">${lnks}</div>`;
  }

  const skillList = document.querySelector('.skill-list');
  if (skillList) {
    skillList.innerHTML = skills.map(s => `
      <div class="skill-item">
        <span class="skill-name">${esc(s.name)}</span>
        <div class="skill-bar"><div class="skill-fill" data-level="${s.level}"></div></div>
        <span class="skill-pct">${s.level}%</span>
      </div>`).join('');
  }

  const statsRow = document.querySelector('.stats-row');
  if (statsRow) {
    statsRow.innerHTML = about.stats.map(s => `
      <div class="stat-card">
        <div class="stat-num" data-target="${s.target}">0</div>
        <div class="stat-label">${esc(s.label)}</div>
      </div>`).join('');
  }
}

function renderProjects(projects) {
  const grid = document.querySelector('.cards-grid');
  if (!grid) return;
  grid.innerHTML = projects.map(p => {
    const cls  = p.status === 'done' ? 'done' : 'wip';
    const text = p.status === 'done' ? 'done' : 'in progress';
    return `
    <div class="project-card reveal">
      <div class="card-header">
        <span class="tag">${esc(p.tag)}</span>
        <span class="status ${cls}">${text}</span>
      </div>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.desc)}</p>
      <ul class="highlights">${p.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>
      <div class="tech-pills">${p.tech.map(t => `<span>${esc(t)}</span>`).join('')}</div>
      <a href="${esc(p.link)}" target="_blank" rel="noopener" class="card-link">View on GitHub &rarr;</a>
    </div>`;
  }).join('');
}

function renderLearnings(learnings) {
  const list = document.querySelector('.learning-list');
  if (!list) return;
  list.innerHTML = learnings.map(l => `
    <details class="learning-card reveal">
      <summary>
        <div class="learn-summary-inner">
          <div>
            <span class="learn-tag">${esc(l.tag)}</span>
            <h3>${esc(l.title)}</h3>
            <p>${esc(l.summary)}</p>
          </div>
          <span class="learn-date">${esc(l.date)}</span>
        </div>
      </summary>
      <ul class="learn-highlights">${l.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>
    </details>`).join('');
}

function renderBookshelf(books) {
  const shelf = document.getElementById('bookshelf');
  if (!shelf) return;
  shelf.innerHTML = books.map((b, i) => `
    <div class="book-slot" data-index="${i}" style="--spine:${b.spine};--accent:${b.accent}" title="${esc(b.title)} &mdash; ${esc(b.author)}">
      <div class="book-spine-vis">
        <span class="spine-title">${esc(b.title)}</span>
        <span class="spine-author">${esc(b.author)}</span>
      </div>
    </div>`).join('');
}

function renderContributions(contributions) {
  const tl = document.querySelector('.timeline');
  if (tl) {
    tl.innerHTML = contributions.openSource.map(item => `
      <div class="tl-item reveal">
        <div class="tl-dot ${item.status}"></div>
        <div class="tl-content">
          <div class="tl-header">
            <span class="tl-title">${esc(item.title)}</span>
            <span class="tl-status ${item.status}-badge">${item.status}</span>
          </div>
          <p class="tl-org">${esc(item.org)}</p>
          <p>${esc(item.desc)}</p>
          <span class="tl-date">${esc(item.date)}</span>
        </div>
      </div>`).join('');
  }
  const cc = document.querySelector('.consult-cards');
  if (cc) {
    cc.innerHTML = contributions.availableFor.map(c => `
      <div class="consult-card reveal">
        <h4>${esc(c.title)}</h4>
        <p>${esc(c.desc)}</p>
        <div class="tech-pills">${c.tech.map(t => `<span>${esc(t)}</span>`).join('')}</div>
      </div>`).join('');
  }
}

/* ── Book Reader ──────────────────────────────────────────── */
function initBookReader(books) {
  const overlay   = document.getElementById('readerOverlay');
  const leftPage  = document.getElementById('bookLeftPage');
  const flipper   = document.getElementById('pageFlipper');
  const front     = document.getElementById('pageFront');
  const back      = document.getElementById('pageBack');
  const prevBtn   = document.getElementById('btnPrev');
  const nextBtn   = document.getElementById('btnNext');
  const indicator = document.getElementById('pageIndicator');
  const closeBtn  = document.getElementById('readerClose');
  const shelf     = document.getElementById('bookshelf');
  if (!overlay || !shelf) return;

  const TOTAL = 3;
  let activeBook  = null;
  let currentPage = 0;
  let isFlipping  = false;
  const statusLabels = { completed: 'completed', reading: 'reading', want: 'want to read' };

  function renderLeft(book) {
    leftPage.innerHTML = `
      <div class="left-cover-strip" style="background:${book.spine}"></div>
      <div class="left-cover-body">
        <span class="book-status ${book.status}">${statusLabels[book.status] || book.status}</span>
        <h2 class="left-title">${esc(book.title)}</h2>
        <p class="left-author">${esc(book.author)}</p>
        ${book.rating ? `<div class="left-rating">${esc(book.rating)}</div>` : ''}
      </div>`;
  }

  function renderRight(book, pg) {
    if (pg === 0) return `
      <div class="rp-chapter">Chapter I</div>
      <h3 class="rp-heading">Summary</h3>
      <p class="rp-text">${esc(book.summary)}</p>`;

    if (pg === 1) return `
      <div class="rp-chapter">Chapter II</div>
      <h3 class="rp-heading">Thoughts</h3>
      <blockquote class="rp-quote">${esc(book.thoughts)}</blockquote>`;

    /* pg === 2 */
    const meta = [
      book.genre ? `<div class="rp-meta-item"><span class="rp-label">Genre</span><span class="rp-value">${esc(book.genre)}</span></div>` : '',
      book.time  ? `<div class="rp-meta-item"><span class="rp-label">Time</span><span class="rp-value">${esc(book.time)}</span></div>`  : '',
      book.date  ? `<div class="rp-meta-item"><span class="rp-label">Date</span><span class="rp-value">${esc(book.date)}</span></div>`  : '',
    ].join('');
    return `
      <div class="rp-chapter">Chapter III</div>
      <h3 class="rp-heading">Details</h3>
      <div class="rp-meta-list">${meta}</div>
      ${book.link ? `<a href="${esc(book.link)}" target="_blank" rel="noopener" class="rp-buy-link">Buy on Amazon &rarr;</a>` : ''}`;
  }

  function updateControls() {
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage === TOTAL - 1;
    indicator.textContent = `${currentPage + 1} / ${TOTAL}`;
  }

  function flipTo(target) {
    if (isFlipping || target < 0 || target >= TOTAL) return;
    isFlipping = true;
    const fwd = target > currentPage;

    back.innerHTML = renderRight(activeBook, target);
    flipper.style.transformOrigin = fwd ? 'left center' : 'right center';
    flipper.classList.add(fwd ? 'flip-fwd' : 'flip-bwd');

    setTimeout(() => {
      front.innerHTML = renderRight(activeBook, target);
      flipper.style.transition = 'none';
      flipper.classList.remove('flip-fwd', 'flip-bwd');
      /* double RAF ensures the style flush happens before re-enabling transition */
      requestAnimationFrame(() => requestAnimationFrame(() => {
        flipper.style.transition = '';
        currentPage = target;
        updateControls();
        isFlipping = false;
      }));
    }, 650);
  }

  function openBook(idx) {
    activeBook  = books[idx];
    currentPage = 0;
    renderLeft(activeBook);
    front.innerHTML = renderRight(activeBook, 0);
    back.innerHTML  = '';
    updateControls();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeBook() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  shelf.addEventListener('click', e => {
    const slot = e.target.closest('.book-slot');
    if (slot) openBook(+slot.dataset.index);
  });
  prevBtn.addEventListener('click',  () => flipTo(currentPage - 1));
  nextBtn.addEventListener('click',  () => flipTo(currentPage + 1));
  closeBtn.addEventListener('click', closeBook);
  overlay.addEventListener('click',  e => { if (e.target === overlay) closeBook(); });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') flipTo(currentPage + 1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   flipTo(currentPage - 1);
    if (e.key === 'Escape') closeBook();
  });
}

/* ── Page routing ─────────────────────────────────────────── */
(async function () {
  const PAGE = document.body.dataset.page || 'home';

  switch (PAGE) {
    case 'home': {
      const [about, skills] = await Promise.all([
        fetch('content/about.json').then(r => r.json()),
        fetch('content/skills.json').then(r => r.json()),
      ]);
      renderAbout(about, skills);
      initTypewriter(about.hero.roles);
      initScrollReveal();
      initSkillBars();
      initStatsCounter();
      break;
    }
    case 'projects': {
      const projects = await fetch('content/projects.json').then(r => r.json());
      renderProjects(projects);
      initScrollReveal();
      break;
    }
    case 'learning': {
      const learnings = await fetch('content/learnings.json').then(r => r.json());
      renderLearnings(learnings);
      initScrollReveal();
      break;
    }
    case 'books': {
      const books = await fetch('content/books.json').then(r => r.json());
      renderBookshelf(books);
      initBookReader(books);
      break;
    }
    case 'contributions': {
      const contributions = await fetch('content/contributions.json').then(r => r.json());
      renderContributions(contributions);
      initScrollReveal();
      break;
    }
  }
})().catch(err => console.error('Content load failed:', err));
