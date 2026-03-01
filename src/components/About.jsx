import { useEffect, useRef, useState } from 'react'
import { about } from '../data/content'

function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

function SkillBar({ name, level, visible }) {
  return (
    <div className="skill-item">
      <div className="skill-header">
        <span className="skill-name">{name}</span>
        <span className="skill-pct">{level}%</span>
      </div>
      <div className="skill-bar-track" role="progressbar" aria-valuenow={level} aria-valuemin={0} aria-valuemax={100} aria-label={name}>
        <div
          className={`skill-bar-fill${visible ? ' animated' : ''}`}
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  )
}

function StatCounter({ value, suffix, label, visible }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!visible) return
    let start = 0
    const duration = 1200
    const step = (value / duration) * 16
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setCount(value); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [visible, value])

  return (
    <div className="about-stat">
      <div className="about-stat-val">
        {count}{suffix}
      </div>
      <div className="about-stat-label">{label}</div>
    </div>
  )
}

export default function About() {
  const [headerRef, headerVisible] = useReveal()
  const [skillsRef, skillsVisible] = useReveal()
  const [statsRef, statsVisible] = useReveal()

  return (
    <section id="about" className="about" aria-labelledby="about-title">
      <div className="container">
        <div className="about-inner">
          {/* ── Visual / Avatar Column ── */}
          <aside className="about-visual" aria-label="Profile summary">
            <div className="about-avatar" role="img" aria-label="Rohit Singh Asoliya avatar">
              <div className="about-avatar-frame">
                <span className="about-avatar-inner" aria-hidden="true">RS</span>
                <div className="about-avatar-ring" aria-hidden="true" />
                <div className="about-avatar-ring-2" aria-hidden="true" />
              </div>
            </div>

            <p className="about-location">
              <span className="about-location-icon" aria-hidden="true">◈</span>
              {about.location}
            </p>

            <div className="about-social" role="list" aria-label="Social profiles">
              {Object.entries(about.links).map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-social-link"
                  role="listitem"
                  aria-label={`${key} profile`}
                >
                  <span aria-hidden="true">
                    {key === 'github' ? '⌥' : key === 'linkedin' ? '⊞' : '◇'}
                  </span>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </a>
              ))}
            </div>

            <div ref={statsRef} className="about-stats" role="list" aria-label="Statistics">
              {about.stats.map((s) => (
                <StatCounter
                  key={s.label}
                  value={s.value}
                  suffix={s.suffix}
                  label={s.label}
                  visible={statsVisible}
                />
              ))}
            </div>
          </aside>

          {/* ── Content Column ── */}
          <div className="about-content">
            <div
              ref={headerRef}
              className={`section-header reveal${headerVisible ? ' visible' : ''}`}
            >
              <p className="section-label" aria-hidden="true">Who I Am</p>
              <h2 className="section-title" id="about-title">
                A curious mind from<br />the royal land
              </h2>
            </div>

            <p className={`about-bio reveal${headerVisible ? ' visible' : ''} reveal-delay-1`}>
              {about.bio}
            </p>
            <p className={`about-bio reveal${headerVisible ? ' visible' : ''} reveal-delay-2`}>
              {about.bio2}
            </p>

            {/* Skills */}
            <div ref={skillsRef} className="about-skills">
              <p className="about-skills-title">Skills & Tools</p>
              {about.skills.map((s, i) => (
                <div
                  key={s.name}
                  className={`reveal${skillsVisible ? ' visible' : ''}`}
                  style={{ transitionDelay: `${i * 0.08}s` }}
                >
                  <SkillBar name={s.name} level={s.level} visible={skillsVisible} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
