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

/* ── Typewriter ───────────────────────────────────────────── */
(function () {
  const el = document.getElementById('typewriter');
  const roles = ['Staff Data Analyst', 'Curious Learner', 'Problem Solver'];
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
  const btn   = document.getElementById('hamburger');
  const menu  = document.getElementById('nav-links');
  btn.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
})();

/* ── Scroll Reveal ────────────────────────────────────────── */
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ── Skill Bars ───────────────────────────────────────────── */
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

/* ── Stats Counter ────────────────────────────────────────── */
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
