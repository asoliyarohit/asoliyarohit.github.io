import { useState, useEffect, useRef } from 'react'
import { learnings } from '../data/loader'

const CAT_COLORS = { 'Data Science': 'tag-cyan', Statistics: 'tag-purple', Python: '', Growth: 'tag-amber', Tools: '' }
const ALL_CATS = ['All', ...Array.from(new Set(learnings.map(l => l.category)))]

function useReveal() {
  const ref = useRef(null); const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect()
  }, [])
  return [ref, vis]
}

function Card({ entry, idx }) {
  const ref = useRef(null); const [vis, setVis] = useState(false); const [exp, setExp] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect()
  }, [])
  const dateStr = new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const catClass = CAT_COLORS[entry.category] ?? ''
  return (
    <article
      ref={ref}
      className={`card l-card${exp ? ' expanded' : ''} reveal${vis ? ' visible' : ''}`}
      style={{ transitionDelay: `${(idx % 3) * 0.09}s`, cursor: 'pointer' }}
      onClick={() => setExp(e => !e)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setExp(x => !x) }}
      aria-expanded={exp}
    >
      <div className="l-card-meta">
        <time className="l-date" dateTime={entry.date}>{dateStr}</time>
        <span className={`tag ${catClass}`}>{entry.category}</span>
      </div>
      <h3 className="l-title">{entry.title}</h3>
      <p className="l-summary">{entry.summary}</p>
      <div className="l-tags">
        {entry.tags.map(t => <span key={t} className="tag">{t}</span>)}
      </div>
      <ul className="l-highlights" aria-label="Key takeaways">
        {entry.highlights.map((h, i) => <li key={i} className="l-highlight">{h}</li>)}
      </ul>
      <button className="l-toggle" onClick={e => { e.stopPropagation(); setExp(x => !x) }}>
        {exp ? '↑ collapse' : '↓ expand highlights'}
      </button>
    </article>
  )
}

export default function Learning() {
  const [active, setActive] = useState('All')
  const [hRef, hVis] = useReveal()
  const filtered = active === 'All' ? learnings : learnings.filter(l => l.category === active)

  return (
    <div className="page" style={{ position: 'relative', zIndex: 1 }}>
      <div className="container">
        <div className="page-header">
          <div className="page-path">
            <span className="seg-home">~</span>
            <span className="sep">/</span>
            <span className="seg-cur">learning</span>
          </div>
          <div ref={hRef} className={`reveal${hVis ? ' visible' : ''}`}>
            <h1 className="page-h1">Knowledge Log</h1>
            <p className="page-desc">
              A running journal of concepts, skills, and insights picked up along the way.
              Click any card to expand key takeaways.
            </p>
          </div>
        </div>

        <nav className={`filter-bar reveal${hVis ? ' visible' : ''} delay-2`} aria-label="Filter by category">
          {ALL_CATS.map(cat => (
            <button key={cat} className={`filter-pill${active === cat ? ' on' : ''}`}
              onClick={() => setActive(cat)} aria-pressed={active === cat}>
              {cat}
            </button>
          ))}
        </nav>

        <div className="learning-grid" role="feed">
          {filtered.map((entry, i) => <Card key={entry.id} entry={entry} idx={i} />)}
          {filtered.length === 0 && (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', fontFamily: 'var(--font-code)' }}>
              // No entries in this category yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
