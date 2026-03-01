import { useState, useEffect, useRef } from 'react'
import { learnings } from '../data/content'

const CATEGORY_COLORS = {
  'Data Science': 'tag-blue',
  Statistics: 'tag-peacock',
  Python: 'tag-saffron',
  'Personal Growth': 'tag',
  Tools: 'tag',
}

const ALL_CATS = ['All', ...Array.from(new Set(learnings.map((l) => l.category)))]

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

function LearningCard({ entry, index }) {
  const [expanded, setExpanded] = useState(false)
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

  const catClass = CATEGORY_COLORS[entry.category] || 'tag'
  const dateStr = new Date(entry.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <article
      ref={cardRef}
      className={`card learning-card${expanded ? ' expanded' : ''} reveal${visible ? ' visible' : ''}`}
      style={{ transitionDelay: `${(index % 3) * 0.1}s` }}
      onClick={() => setExpanded((e) => !e)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded((x) => !x) }}
      aria-expanded={expanded}
      aria-label={entry.title}
    >
      <div className="learning-card-meta">
        <time className="learning-date" dateTime={entry.date}>{dateStr}</time>
        <span className={catClass} style={{ padding: '0.2rem 0.65rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 600 }}>
          {entry.category}
        </span>
      </div>

      <h3 className="learning-card-title">{entry.title}</h3>

      <p className="learning-card-summary">{entry.summary}</p>

      <div className="learning-card-tags" role="list" aria-label="Tags">
        {entry.tags.map((t) => (
          <span key={t} className="tag" role="listitem">{t}</span>
        ))}
      </div>

      {/* Expandable highlights */}
      <ul className="learning-highlights" aria-label="Key highlights">
        {entry.highlights.map((h, i) => (
          <li key={i} className="learning-highlight">{h}</li>
        ))}
      </ul>

      <button
        className="learning-card-toggle"
        onClick={(e) => { e.stopPropagation(); setExpanded((x) => !x) }}
        aria-label={expanded ? 'Show less' : 'Show highlights'}
      >
        {expanded ? '↑ Less' : '↓ Key highlights'}
      </button>
    </article>
  )
}

export default function Learning() {
  const [active, setActive] = useState('All')
  const [headerRef, headerVisible] = useReveal()

  const filtered = active === 'All'
    ? learnings
    : learnings.filter((l) => l.category === active)

  return (
    <section id="learning" className="learning" aria-labelledby="learning-title">
      <div className="container">
        {/* Header */}
        <div
          ref={headerRef}
          className={`section-header reveal${headerVisible ? ' visible' : ''}`}
        >
          <p className="section-label" aria-hidden="true">Knowledge Log</p>
          <h2 className="section-title" id="learning-title">What I'm Learning</h2>
          <p className="section-subtitle">
            A running journal of concepts, skills, and insights I pick up along the way.
            Click any card to expand the highlights.
          </p>
        </div>

        {/* Filters */}
        <nav
          className={`learning-filters reveal${headerVisible ? ' visible' : ''} reveal-delay-2`}
          aria-label="Filter learnings by category"
          role="toolbar"
        >
          {ALL_CATS.map((cat) => (
            <button
              key={cat}
              className={`filter-btn${active === cat ? ' active' : ''}`}
              onClick={() => setActive(cat)}
              aria-pressed={active === cat}
              aria-label={`Filter by ${cat}`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Grid */}
        <div
          className="learning-grid"
          role="feed"
          aria-label={`Learning entries${active !== 'All' ? ` filtered by ${active}` : ''}`}
        >
          {filtered.map((entry, i) => (
            <LearningCard key={entry.id} entry={entry} index={i} />
          ))}
          {filtered.length === 0 && (
            <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>
              No entries in this category yet. Stay tuned!
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
