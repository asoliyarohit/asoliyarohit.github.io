/* ── Matrix Rain ──────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  const CHARS = 'アイウエオカキクケコ0123456789ABCDEFabcdef<>/{}[]()=+*#$%';
  const FONT = 14;
  let cols, drops, rafId;

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
    rafId = requestAnimationFrame(draw);
  }

  setup();
  draw();
  window.addEventListener('resize', setup);
})();

/* ── Navbar scroll ────────────────────────────────────────── */
(function () {
  const nav = document.getElementById('navbar');
  const links = nav.querySelectorAll('.nav-links a[href^="#"]');
  const sections = Array.from(document.querySelectorAll('section[id]'));

  function update() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 20);
    nav.style.setProperty('--scroll-pct',
      (y / (document.body.scrollHeight - window.innerHeight) * 100).toFixed(1) + '%');

    let current = '';
    sections.forEach(s => { if (y + 80 >= s.offsetTop) current = s.id; });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── Mobile hamburger ─────────────────────────────────────── */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('nav-links');
  btn.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
})();

/* ── Content: fetch all JSON files, render, then init observers ── */
(async function () {

  /* Helper: escape HTML special chars */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Fetch all content files in parallel */
  const [about, skills, projects, learnings, books, contributions] = await Promise.all([
    fetch('content/about.json').then(r => r.json()),
    fetch('content/skills.json').then(r => r.json()),
    fetch('content/projects.json').then(r => r.json()),
    fetch('content/learnings.json').then(r => r.json()),
    fetch('content/books.json').then(r => r.json()),
    fetch('content/contributions.json').then(r => r.json()),
  ]);

  /* ── Render: Hero bio ── */
  const bioel = document.querySelector('.hero-bio');
  if (bioel) bioel.textContent = about.hero.bio;

  /* ── Render: About text + social links ── */
  const aboutText = document.querySelector('.about-text');
  if (aboutText) {
    const ps   = about.paragraphs.map(p => `<p>${esc(p)}</p>`).join('');
    const lnks = about.links.map(l =>
      `<a href="${esc(l.href)}"${l.external ? ' target="_blank" rel="noopener"' : ''} class="link-badge">${esc(l.label)}</a>`
    ).join('');
    aboutText.innerHTML = ps + `<div class="links-row">${lnks}</div>`;
  }

  /* ── Render: Skills ── */
  const skillList = document.querySelector('.skill-list');
  if (skillList) {
    skillList.innerHTML = skills.map(s => `
      <div class="skill-item">
        <span class="skill-name">${esc(s.name)}</span>
        <div class="skill-bar"><div class="skill-fill" data-level="${s.level}"></div></div>
        <span class="skill-pct">${s.level}%</span>
      </div>`).join('');
  }

  /* ── Render: Stats ── */
  const statsRow = document.querySelector('.stats-row');
  if (statsRow) {
    statsRow.innerHTML = about.stats.map(s => `
      <div class="stat-card">
        <div class="stat-num" data-target="${s.target}">0</div>
        <div class="stat-label">${esc(s.label)}</div>
      </div>`).join('');
  }

  /* ── Render: Projects ── */
  const cardsGrid = document.querySelector('.cards-grid');
  if (cardsGrid) {
    cardsGrid.innerHTML = projects.map(p => {
      const statusCls  = p.status === 'done' ? 'done' : 'wip';
      const statusText = p.status === 'done' ? 'done' : 'in progress';
      return `
      <div class="project-card reveal">
        <div class="card-header">
          <span class="tag">${esc(p.tag)}</span>
          <span class="status ${statusCls}">${statusText}</span>
        </div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.desc)}</p>
        <ul class="highlights">${p.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>
        <div class="tech-pills">${p.tech.map(t => `<span>${esc(t)}</span>`).join('')}</div>
        <a href="${esc(p.link)}" target="_blank" rel="noopener" class="card-link">View on GitHub →</a>
      </div>`;
    }).join('');
  }

  /* ── Render: Learnings ── */
  const learnList = document.querySelector('.learning-list');
  if (learnList) {
    learnList.innerHTML = learnings.map(l => `
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

  /* ── Render: Books ── */
  const booksGrid = document.querySelector('.books-grid');
  if (booksGrid) {
    const statusLabel = { completed: 'completed', reading: 'reading', want: 'want to read' };
    booksGrid.innerHTML = books.map(b => {
      const meta    = [b.genre, b.time, b.date].filter(Boolean);
      const rating  = b.rating ? `<span class="book-rating">${esc(b.rating)}</span>` : '';
      const buyLink = b.link   ? `<a href="${esc(b.link)}" target="_blank" rel="noopener" class="book-link">Buy on Amazon →</a>` : '';
      return `
      <div class="book-card reveal" style="--spine:${b.spine};--accent:${b.accent}">
        <div class="book-spine"></div>
        <div class="book-info">
          <div class="book-top">
            <span class="book-status ${b.status}">${statusLabel[b.status] || b.status}</span>
            ${rating}
          </div>
          <h3>${esc(b.title)}</h3>
          <p class="book-author">${esc(b.author)}</p>
          <p class="book-summary">${esc(b.summary)}</p>
          <p class="book-thoughts">${esc(b.thoughts)}</p>
          <div class="book-meta">${meta.map(m => `<span>${esc(m)}</span>`).join('')}</div>
          ${buyLink}
        </div>
      </div>`;
    }).join('');
  }

  /* ── Render: Contributions — Open Source timeline ── */
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    timeline.innerHTML = contributions.openSource.map(item => `
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

  /* ── Render: Contributions — Available For cards ── */
  const consultCards = document.querySelector('.consult-cards');
  if (consultCards) {
    consultCards.innerHTML = contributions.availableFor.map(c => `
      <div class="consult-card reveal">
        <h4>${esc(c.title)}</h4>
        <p>${esc(c.desc)}</p>
        <div class="tech-pills">${c.tech.map(t => `<span>${esc(t)}</span>`).join('')}</div>
      </div>`).join('');
  }

  /* ── Typewriter (uses roles from about.json) ── */
  (function () {
    const el = document.getElementById('typewriter');
    const roles = about.hero.roles;
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
        else { setTimeout(tick, 100); }
      }
    }
    setTimeout(tick, 600);
  })();

  /* ── Scroll Reveal (must run after render so .reveal elements exist) ── */
  (function () {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  })();

  /* ── Skill Bars ── */
  (function () {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.skill-fill').forEach(bar => {
            bar.style.width = bar.dataset.level + '%';
          });
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    const skillsCol = document.querySelector('.skills-col');
    if (skillsCol) io.observe(skillsCol);
  })();

  /* ── Stats Counter ── */
  (function () {
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
    const statsRow = document.querySelector('.stats-row');
    if (statsRow) io.observe(statsRow);
  })();

})().catch(err => console.error('Content load failed:', err));
