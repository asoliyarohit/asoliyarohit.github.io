/* Home: a scroll through the singularity.
   The tunnel's depth follows the scroll position; each section is a beat on the way in. */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const getJSON = f => fetch('content/' + f + '?v=20261016').then(r => r.json());

  async function init() {
    /* loader: a big counting number, like stepping into the tunnel */
    const pct = $('#pct'), loader = $('#loaderHome'), t0 = performance.now();
    let shown = 0;
    const counter = setInterval(() => { shown = Math.min(shown + 1 + Math.random() * 5, 96); pct.textContent = String(Math.floor(shown)).padStart(2, '0') + ' %'; }, 40);

    const [about, skills, projects] = await Promise.all([getJSON('about.json'), getJSON('skills.json'), getJSON('projects.json'), document.fonts ? document.fonts.ready.catch(() => 0) : 0]);

    /* ── fill the story from the JSON files ─────────────── */
    $('#bio').textContent = about.hero.bio;
    const roles = about.hero.roles.slice(1), swap = $('#swap'); let ri = 0; swap.textContent = roles[0];
    if (!REDUCED) setInterval(() => { swap.style.transition = 'opacity .35s, transform .35s'; swap.style.opacity = 0; swap.style.transform = 'translateY(8px)'; setTimeout(() => { ri = (ri + 1) % roles.length; swap.textContent = roles[ri]; swap.style.opacity = 1; swap.style.transform = 'none'; }, 350); }, 2600);

    /* the statement lights up word by word as you scroll into it */
    const st = $('#statement'); st.textContent = about.paragraphs[0];
    $('#aboutRest').innerHTML = `<p>${esc(about.paragraphs[1])}</p><div class="links-row">${about.links.map(l => `<a href="${esc(l.href)}"${l.external ? ' target="_blank" rel="noopener"' : ''} class="link-badge">${esc(l.label)}</a>`).join('')}</div>`;
    $('#skillList').innerHTML = skills.map(s => `<div class="skill-item"><span class="skill-name">${esc(s.name)}</span><div class="skill-bar"><div class="skill-fill" data-level="${s.level}"></div></div><span class="skill-pct">${s.level}%</span></div>`).join('');
    $('#stats').innerHTML = about.stats.map(s => `<div class="stat-card"><div class="stat-num" data-target="${s.target}">0</div><div class="stat-label">${esc(s.label)}</div></div>`).join('');
    if (typeof renderProjects === 'function') renderProjects(projects.slice(0, 3));

    /* the terminal: boots on any key once it is on screen */
    try { window.homeTerm = createTerminal($('#homeTerm'), { noFocus: true }); } catch (e) { console.error(e); }

    /* ── the tunnel ─────────────────────────────────────── */
    let tun = null;
    try { tun = initTunnel($('#tunnel')); } catch (e) { console.error(e); }
    const beats = $$('.beat'), footer = $('footer');
    if (footer) { footer.id = 's4'; footer.dataset.label = 'Signal'; footer.dataset.hint = 'Say hello'; footer.dataset.read = '0'; }
    const stops = [...beats, ...(footer ? [footer] : [])];
    const DEPTH = 1.15;                                  /* rings passed per section */
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight), p = scrollY / max;
      if (tun) tun.setDepth(p * (stops.length - 1) * DEPTH);
    };
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();

    /* ── HUD: section label, hint, and the tick rail ─────── */
    const hudS = $('#hudSection'), hudH = $('#hudHint'), ticks = $('#ticks');
    stops.forEach((el, i) => { const b = document.createElement('button'); b.type = 'button'; b.dataset.label = el.dataset.label; b.setAttribute('aria-label', 'Go to ' + el.dataset.label); b.onclick = () => el.scrollIntoView({ behavior: 'smooth', block: 'start' }); ticks.append(b); });
    const setBeat = i => {
      const el = stops[i]; if (!el) return;
      hudH.textContent = String(i + 1).padStart(2, '0') + ' · ' + el.dataset.label + (el.dataset.hint ? '  —  ' + el.dataset.hint : '');
      [...ticks.children].forEach((b, k) => b.classList.toggle('on', k === i));
      if (tun) tun.setMode([.05, .62, .72, .62][+el.dataset.read] || 0);
      beats.forEach(b => b.classList.toggle('reading', b === el && b.dataset.read !== '0'));
    };
    const bio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setBeat(stops.indexOf(e.target)); }), { threshold: .5 });
    stops.forEach(s => bio.observe(s)); setBeat(0);

    /* ── reveals: focus-pull headlines, counters, bars ───── */
    const pulls = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); pulls.unobserve(e.target); } }), { threshold: .3 });
    $$('.pull').forEach(el => pulls.observe(el));
    const rv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); rv.unobserve(e.target); } }), { threshold: .12 });
    $$('.beat-in .reveal').forEach((el, i) => { el.style.setProperty('--d', ((i % 4) * .08) + 's'); rv.observe(el); });
    const words = st.textContent.trim().split(/\s+/); st.innerHTML = words.map(w => `<span class="w">${esc(w)}</span>`).join(' ');
    const spans = $$('#statement .w');
    const lightUp = () => { const r = st.getBoundingClientRect(), p = Math.min(Math.max((innerHeight * .8 - r.top) / (r.height + innerHeight * .25), 0), 1), n = Math.round(p * spans.length); spans.forEach((s, i) => s.classList.toggle('lit', REDUCED || i < n)); };
    addEventListener('scroll', lightUp, { passive: true }); lightUp();
    new IntersectionObserver((es, io) => es.forEach(e => { if (!e.isIntersecting) return; e.target.querySelectorAll('.skill-fill').forEach(b => { b.style.width = b.dataset.level + '%'; }); io.unobserve(e.target); }), { threshold: .3 }).observe($('#skillList'));
    new IntersectionObserver((es, io) => es.forEach(e => { if (!e.isIntersecting) return; e.target.querySelectorAll('.stat-num').forEach(el => { const to = +el.dataset.target, s = performance.now(); (function step(t) { const k = Math.min((t - s) / 1400, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(step); })(s); }); io.unobserve(e.target); }), { threshold: .5 }).observe($('#stats'));

    /* finish the loader (never faster than a beat, so the count reads) */
    const wait = Math.max(0, 1100 - (performance.now() - t0));
    setTimeout(() => { clearInterval(counter); pct.textContent = '100 %'; setTimeout(() => { loader.classList.add('gone'); document.body.classList.add('ready'); }, 260); }, wait);
    window.__home = { tun, setBeat, stops };
  }
  init().catch(err => { console.error(err); const l = $('#loaderHome'); if (l) l.classList.add('gone'); });
})();
