import { useState, useEffect, useRef, useCallback } from 'react'
import { projects } from '../data/content'

const CATEGORIES = ['All', ...Array.from(new Set(projects.map((p) => p.category)))]

const PROJECT_ICONS = {
  'Data Analysis': '📊',
  'Learning Project': '📖',
  Practice: '⚙️',
  default: '◈',
}

function useReveal(threshold = 0.1) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

function ProjectCard({ project, index }) {
  const cardRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (cardRef.current) obs.observe(cardRef.current)
    return () => obs.disconnect()
  }, [])

  // 3D tilt effect
  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rx = ((y - cy) / cy) * 6
    const ry = ((cx - x) / cx) * 6
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = ''
  }, [])

  const icon = PROJECT_ICONS[project.category] || PROJECT_ICONS.default

  return (
    <article
      ref={cardRef}
      className={`card project-card reveal${visible ? ' visible' : ''}`}
      style={{ transitionDelay: `${(index % 3) * 0.1}s` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={project.title}
    >
      <div className="project-card-top">
        <div className="project-icon" aria-hidden="true">{icon}</div>
        <span className={`project-status ${project.status}`} aria-label={`Status: ${project.status}`}>
          {project.status === 'in-progress' ? 'In Progress' : 'Completed'}
        </span>
      </div>

      <h3 className="project-card-title">{project.title}</h3>
      <p className="project-card-desc">{project.description}</p>

      <ul className="project-highlights" aria-label="Project highlights">
        {project.highlights.map((h, i) => (
          <li key={i} className="project-highlight">{h}</li>
        ))}
      </ul>

      <div className="project-card-tags" role="list" aria-label="Tech stack">
        {project.tags.map((t) => (
          <span key={t} className="tag" role="listitem">{t}</span>
        ))}
      </div>

      <div className="project-card-footer">
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link"
            aria-label={`View ${project.title} on GitHub`}
          >
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            GitHub
          </a>
        )}
        {project.demo && (
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link"
            aria-label={`View ${project.title} live demo`}
          >
            ↗ Live Demo
          </a>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>
          {project.date}
        </span>
      </div>
    </article>
  )
}

export default function Projects() {
  const [active, setActive] = useState('All')
  const [headerRef, headerVisible] = useReveal()

  const filtered = active === 'All'
    ? projects
    : projects.filter((p) => p.category === active)

  return (
    <section id="projects" className="projects" aria-labelledby="projects-title">
      <div className="container">
        {/* Header */}
        <div
          ref={headerRef}
          className={`section-header reveal${headerVisible ? ' visible' : ''}`}
        >
          <p className="section-label" aria-hidden="true">Portfolio</p>
          <h2 className="section-title" id="projects-title">Things I've Built</h2>
          <p className="section-subtitle">
            Projects I've tackled — from data analysis pipelines to learning exercises.
            Hover cards for a 3D effect.
          </p>
        </div>

        {/* Filters */}
        <nav
          className={`learning-filters reveal${headerVisible ? ' visible' : ''} reveal-delay-2`}
          aria-label="Filter projects by category"
          role="toolbar"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-btn${active === cat ? ' active' : ''}`}
              onClick={() => setActive(cat)}
              aria-pressed={active === cat}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Grid */}
        <div
          className="projects-grid"
          role="feed"
          aria-label={`Projects${active !== 'All' ? ` in ${active}` : ''}`}
        >
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
