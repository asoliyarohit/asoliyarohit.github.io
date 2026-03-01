import { useState, useEffect, useRef, useCallback } from 'react'
import { projects } from '../data/loader'

const ICONS = { 'Data Analysis': '📊', 'Learning Project': '📖', Practice: '⚙️' }
const CATS  = ['All', ...Array.from(new Set(projects.map(p => p.category)))]

function useReveal() {
  const ref = useRef(null); const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect()
  }, [])
  return [ref, vis]
}

function Card({ project, idx }) {
  const ref = useRef(null); const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect()
  }, [])

  const onMove = useCallback(e => {
    const card = ref.current; if (!card) return
    const r = card.getBoundingClientRect()
    const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 5
    const ry = ((r.width / 2 - (e.clientX - r.left)) / (r.width / 2)) * 5
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`
  }, [])
  const onLeave = useCallback(() => { if (ref.current) ref.current.style.transform = '' }, [])

  return (
    <article
      ref={ref}
      className={`card proj-card reveal${vis ? ' visible' : ''}`}
      style={{ transitionDelay: `${(idx % 3) * 0.09}s` }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="proj-top">
        <div className="proj-icon">{ICONS[project.category] ?? '◈'}</div>
        <span className={`proj-status ${project.status === 'completed' ? 'done' : 'wip'}`}>
          {project.status === 'in-progress' ? 'in progress' : project.status}
        </span>
      </div>
      <h3 className="proj-title">{project.title}</h3>
      <p className="proj-desc">{project.description}</p>
      <ul className="proj-highlights">
        {project.highlights.map((h, i) => <li key={i} className="proj-hl">{h}</li>)}
      </ul>
      <div className="proj-tags">
        {project.tags.map(t => <span key={t} className="tag">{t}</span>)}
      </div>
      <div className="proj-footer">
        {project.github && (
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="proj-link">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            GitHub
          </a>
        )}
        {project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer" className="proj-link">↗ Demo</a>}
        <span className="proj-date">{project.date}</span>
      </div>
    </article>
  )
}

export default function Projects() {
  const [active, setActive] = useState('All')
  const [hRef, hVis] = useReveal()
  const filtered = active === 'All' ? projects : projects.filter(p => p.category === active)

  return (
    <div className="page" style={{ position: 'relative', zIndex: 1 }}>
      <div className="container">
        <div className="page-header">
          <div className="page-path">
            <span className="seg-home">~</span><span className="sep">/</span><span className="seg-cur">projects</span>
          </div>
          <div ref={hRef} className={`reveal${hVis ? ' visible' : ''}`}>
            <h1 className="page-h1">Things I've Built</h1>
            <p className="page-desc">Projects I've shipped — from ETL pipelines to learning exercises. Hover for 3D effect.</p>
          </div>
        </div>

        <nav className={`filter-bar reveal${hVis ? ' visible' : ''} delay-2`}>
          {CATS.map(cat => (
            <button key={cat} className={`filter-pill${active === cat ? ' on' : ''}`}
              onClick={() => setActive(cat)} aria-pressed={active === cat}>
              {cat}
            </button>
          ))}
        </nav>

        <div className="proj-grid" role="feed">
          {filtered.map((p, i) => <Card key={p.id} project={p} idx={i} />)}
        </div>
      </div>
    </div>
  )
}
