import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { about, stats } from '../data/loader'

/* ---- Typewriter hook ---- */
function useTypewriter(words, speed = 80, pause = 1800) {
  const [text, setText] = useState('')
  const [wi, setWi]     = useState(0)
  const [ci, setCi]     = useState(0)
  const [del, setDel]   = useState(false)
  const t = useRef(null)

  useEffect(() => {
    const w = words[wi]
    if (!del && ci < w.length)   t.current = setTimeout(() => setCi(c => c + 1), speed)
    else if (!del && ci === w.length) t.current = setTimeout(() => setDel(true), pause)
    else if (del && ci > 0)      t.current = setTimeout(() => setCi(c => c - 1), speed / 2)
    else { setDel(false); setWi(i => (i + 1) % words.length) }
    setText(w.slice(0, ci))
    return () => clearTimeout(t.current)
  }, [ci, del, wi, words, speed, pause])

  return text
}

/* ---- Scroll reveal ---- */
function useReveal() {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.12 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, vis]
}

/* ---- Stat counter ---- */
function StatCounter({ value, suffix, label, vis }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!vis) return
    let s = 0, raf
    const step = () => {
      s += value / 40
      if (s >= value) { setN(value); return }
      setN(Math.floor(s)); raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [vis, value])
  return (
    <div className="stat-cell">
      <div className="stat-val">{n}{suffix}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  )
}

/* ---- Skill bar ---- */
function SkillBar({ name, level, vis }) {
  return (
    <div className="skill-item">
      <div className="sk-name">{name}</div>
      <div className="sk-bar-track">
        <div className={`sk-bar-fill${vis ? ' on' : ''}`} style={{ width: `${level}%` }} />
      </div>
      <div className="sk-pct">{level}%</div>
    </div>
  )
}

export default function Home() {
  const navigate   = useNavigate()
  const role       = useTypewriter(about.roles)
  const [statsRef, statsVis]  = useReveal()
  const [aboutRef, aboutVis]  = useReveal()
  const [skillRef, skillVis]  = useReveal()
  const [headerRef, headerVis] = useReveal()

  // Terminal lines
  const lines = [
    { ln: '1',  tokens: [{ t: 'c-comment', v: '// profile.js' }] },
    { ln: '2',  tokens: [] },
    { ln: '3',  tokens: [{ t: 'c-kw', v: 'const' }, { t: '', v: ' ' }, { t: 'c-var', v: 'developer' }, { t: 'c-op', v: ' = {' }] },
    { ln: '4',  tokens: [{ t: 'c-key', v: '  name' },     { t: 'c-op', v: ':' }, { t: 'c-str', v: ' "Rohit Singh Asoliya"' }, { t: 'c-op', v: ',' }], indent: true },
    { ln: '5',  tokens: [{ t: 'c-key', v: '  role' },     { t: 'c-op', v: ':' }, { t: 'c-str', v: ` "${role || '...'}"` },     { t: 'c-op', v: ',' }, { t: 'cur-role', v: '' }], indent: true },
    { ln: '6',  tokens: [{ t: 'c-key', v: '  focus' },    { t: 'c-op', v: ':' }, { t: 'c-str', v: ' "Data Science & Python"' }, { t: 'c-op', v: ',' }], indent: true },
    { ln: '7',  tokens: [{ t: 'c-key', v: '  status' },   { t: 'c-op', v: ':' }, { t: 'c-str', v: ' "learning & building"' },   { t: 'c-op', v: ',' }], indent: true },
    { ln: '8',  tokens: [{ t: 'c-key', v: '  openTo' },   { t: 'c-op', v: ': [' }, { t: 'c-str', v: '"collabs"' }, { t: 'c-op', v: ', ' }, { t: 'c-str', v: '"consulting"' }, { t: 'c-op', v: ', ' }, { t: 'c-str', v: '"mentoring"' }, { t: 'c-op', v: '],' }], indent: true },
    { ln: '9',  tokens: [{ t: 'c-op', v: '}' }] },
    { ln: '10', tokens: [] },
    { ln: '11', tokens: [{ t: 'c-comment', v: '// Ready to execute.' }] },
  ]

  return (
    <div className="page" style={{ position: 'relative', zIndex: 1 }}>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            {/* Left: text */}
            <div>
              <div className="hero-label">init dev_environment</div>

              <h1 className="hero-name glitch" data-text={about.name}>{about.name}</h1>

              <p className="hero-role">
                <span style={{ color: 'var(--text-muted)' }}>role →&nbsp;</span>
                <span className="hero-role-text">{role}</span>
                <span className="cur" />
              </p>

              <p className="hero-bio">{about.bio}</p>

              <div className="hero-cta">
                <button className="btn btn-green" onClick={() => navigate('/projects')}>
                  ./view-projects
                </button>
                <a href={`mailto:${about.email}`} className="btn btn-outline">
                  ./contact-me
                </a>
              </div>

              <div className="hero-social">
                <a href={about.links.github}   target="_blank" rel="noopener noreferrer" className="hero-soc-link" aria-label="GitHub">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                </a>
                <a href={about.links.linkedin} target="_blank" rel="noopener noreferrer" className="hero-soc-link" aria-label="LinkedIn">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href={about.links.twitter}  target="_blank" rel="noopener noreferrer" className="hero-soc-link" aria-label="Twitter">
                  <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>

            {/* Right: terminal */}
            <div className="hero-terminal">
              <div className="term">
                <div className="term-bar">
                  <span className="term-dot r" /><span className="term-dot y" /><span className="term-dot g" />
                  <span className="term-fname">~/rsa/profile.js</span>
                </div>
                <div className="term-body">
                  {lines.map((line, li) => (
                    <div key={li} className="code-line" style={{ whiteSpace: 'pre' }}>
                      <span className="ln">{line.ln}</span>
                      {line.tokens.map((tok, ti) =>
                        tok.t === 'cur-role'
                          ? <span key={ti} className="cur" />
                          : <span key={ti} className={tok.t}>{tok.v}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div ref={statsRef} className="hero-stats">
            {stats.map(s => (
              <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} vis={statsVis} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section style={{ background: 'var(--dark-mid)', borderTop: '1px solid var(--dark-border)', borderBottom: '1px solid var(--dark-border)' }}>
        <div className="container">
          <div className="about-grid">
            {/* Profile card */}
            <div className="about-card">
              <div className="avatar-box" aria-label="RSA initials">RS</div>
              <div className="about-identity">
                <div className="about-name">{about.name}</div>
                <span className="about-role-tag">data scientist</span>
              </div>
              <div className="about-links">
                <a href={about.links.github}   target="_blank" rel="noopener noreferrer" className="about-ext-link">
                  <span className="ext-icon">⌥</span> github.com/asoliyarohit
                </a>
                <a href={about.links.linkedin} target="_blank" rel="noopener noreferrer" className="about-ext-link">
                  <span className="ext-icon">⊞</span> linkedin/asoliyarohit
                </a>
                <a href={about.links.twitter}  target="_blank" rel="noopener noreferrer" className="about-ext-link">
                  <span className="ext-icon">◇</span> @asoliyarohit
                </a>
                <a href={`mailto:${about.email}`} className="about-ext-link">
                  <span className="ext-icon">✉</span> {about.email}
                </a>
              </div>
            </div>

            {/* Content */}
            <div>
              <div ref={headerRef} className={`reveal${headerVis ? ' visible' : ''}`}>
                <div className="section-eyebrow">about_me</div>
                <h2 className="section-title">Building with curiosity,<br />shipping with intent.</h2>
              </div>

              <p className={`reveal${headerVis ? ' visible' : ''} delay-1`} style={{ color: 'var(--text-dim)', lineHeight: 1.9, marginBottom: '1rem', marginTop: '1.5rem' }}>
                {about.bio}
              </p>
              <p className={`reveal${headerVis ? ' visible' : ''} delay-2`} style={{ color: 'var(--text-dim)', lineHeight: 1.9 }}>
                {about.bio2}
              </p>

              {/* Skills */}
              <div ref={skillRef} style={{ marginTop: '2.5rem' }}>
                <div className={`reveal${skillVis ? ' visible' : ''}`}>
                  <p style={{ fontFamily: 'var(--font-code)', fontSize: '0.7rem', color: 'var(--green)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '1.1rem' }}>
                    // skills &amp; tools
                  </p>
                </div>
                <div className="skills-grid">
                  {about.skills.map((s, i) => (
                    <div key={s.name} className={`reveal${skillVis ? ' visible' : ''}`} style={{ transitionDelay: `${i * 0.07}s` }}>
                      <SkillBar name={s.name} level={s.level} vis={skillVis} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
