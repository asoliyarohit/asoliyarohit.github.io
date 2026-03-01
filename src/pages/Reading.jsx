import { useState, useEffect, useRef } from 'react'
import { books } from '../data/content'

const STATUS_FILTERS = ['All', 'reading', 'completed', 'want-to-read']
const STATUS_LABEL   = { reading: 'Reading', completed: 'Completed', 'want-to-read': 'Want to Read' }

function useReveal() {
  const ref = useRef(null); const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect()
  }, [])
  return [ref, vis]
}

function Stars({ rating }) {
  if (!rating) return <span className="no-rating" aria-label="Not yet rated">not rated</span>
  return (
    <div className="stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.floor(rating) ? '' : i - 0.5 <= rating ? '' : 'star-empty'}>
          {i <= rating ? '★' : i - 0.5 <= rating ? '☆' : '☆'}
        </span>
      ))}
    </div>
  )
}

function BookCard({ book, idx }) {
  const [flipped, setFlipped] = useState(false)
  const ref = useRef(null); const [vis, setVis] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.06 })
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect()
  }, [])

  // Close on Escape
  useEffect(() => {
    if (!flipped) return
    const onKey = e => { if (e.key === 'Escape') setFlipped(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flipped])

  const badgeClass = book.status === 'reading' ? 'badge-reading' : book.status === 'completed' ? 'badge-done' : 'badge-want'

  return (
    <div
      ref={ref}
      className={`book-card${flipped ? ' flipped' : ''}${book.status === 'reading' ? ' reading-now' : ''} reveal${vis ? ' visible' : ''}`}
      style={{ transitionDelay: `${(idx % 4) * 0.08}s` }}
      onClick={() => setFlipped(f => !f)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setFlipped(f => !f) }}
      aria-label={`${book.title} by ${book.author} — click to ${flipped ? 'close' : 'see details'}`}
      aria-expanded={flipped}
    >
      <div className="book-inner">
        {/* ── FRONT FACE ── */}
        <div className="book-face">
          <div className="book-cover">
            {/* Colored background */}
            <div className="book-cover-bg" style={{ background: `linear-gradient(135deg, ${book.spine} 0%, ${book.accent}55 100%)` }} />
            {/* Diagonal pattern overlay */}
            <div className="book-cover-pattern" />
            {/* Status badge */}
            <span className={`book-status-badge ${badgeClass}`}>{STATUS_LABEL[book.status]}</span>
            {/* Title on cover */}
            <div className="book-spine-title">{book.title}</div>
            <div className="book-spine-author">{book.author}</div>
          </div>

          <div className="book-front-info">
            <div className="book-front-genre">{book.genre}</div>
            <div className="book-rating">
              <Stars rating={book.rating} />
              <span className="book-flip-hint">click to expand</span>
            </div>
          </div>
        </div>

        {/* ── BACK FACE ── */}
        <div className="book-face book-back">
          <div className="book-back-inner" role="region" aria-label={`Details for ${book.title}`}>
            <button
              className="book-back-close"
              onClick={e => { e.stopPropagation(); setFlipped(false) }}
              aria-label="Close details"
            >
              ✕ close
            </button>

            <div className="book-back-title">{book.title}</div>
            <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-code)', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              — {book.author}
            </div>

            <div>
              <div className="book-back-label">summary</div>
              <p className="book-summary-text">{book.summary}</p>
            </div>

            <div>
              <div className="book-back-label">my_thoughts</div>
              <p className="book-thoughts-text">"{book.myThoughts}"</p>
            </div>

            <div className="book-meta-row">
              <div className="book-meta-item">
                <span className="book-meta-k">time</span>
                <span className="book-meta-v">{book.readingTime}</span>
              </div>
              {book.dateRead && (
                <div className="book-meta-item">
                  <span className="book-meta-k">read</span>
                  <span className="book-meta-v">{book.dateRead}</span>
                </div>
              )}
              {book.rating && (
                <div className="book-meta-item">
                  <span className="book-meta-k">rating</span>
                  <span className="book-meta-v">{book.rating}/5</span>
                </div>
              )}
            </div>

            {book.purchaseLink
              ? <a href={book.purchaseLink} target="_blank" rel="noopener noreferrer" className="book-buy-link" onClick={e => e.stopPropagation()}>
                  ↗ Buy / View
                </a>
              : <p className="book-no-link">// no purchase link yet</p>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Reading() {
  const [filter, setFilter] = useState('All')
  const [hRef, hVis] = useReveal()

  const filtered = filter === 'All' ? books : books.filter(b => b.status === filter)
  const counts = {
    total:     books.length,
    completed: books.filter(b => b.status === 'completed').length,
    reading:   books.filter(b => b.status === 'reading').length,
    wantToRead:books.filter(b => b.status === 'want-to-read').length,
  }

  return (
    <div className="page" style={{ position: 'relative', zIndex: 1 }}>
      <div className="container">
        <div className="page-header">
          <div className="page-path">
            <span className="seg-home">~</span><span className="sep">/</span><span className="seg-cur">reading</span>
          </div>
          <div ref={hRef} className={`reveal${hVis ? ' visible' : ''}`}>
            <h1 className="page-h1">Reading List</h1>
            <p className="page-desc">
              Books I've read, am reading, and want to read. Click any card to see my summary and thoughts.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className={`reading-stats reveal${hVis ? ' visible' : ''} delay-1`} role="region" aria-label="Reading statistics">
          <div className="read-stat"><span className="read-stat-val">{counts.total}</span><span className="read-stat-lbl">total books</span></div>
          <div className="read-stat"><span className="read-stat-val">{counts.completed}</span><span className="read-stat-lbl">completed</span></div>
          <div className="read-stat"><span className="read-stat-val">{counts.reading}</span><span className="read-stat-lbl">reading now</span></div>
          <div className="read-stat"><span className="read-stat-val">{counts.wantToRead}</span><span className="read-stat-lbl">in queue</span></div>
        </div>

        {/* Filters */}
        <nav className={`filter-bar reveal${hVis ? ' visible' : ''} delay-2`} aria-label="Filter by reading status">
          {STATUS_FILTERS.map(s => (
            <button key={s} className={`filter-pill${filter === s ? ' on' : ''}`}
              onClick={() => setFilter(s)} aria-pressed={filter === s}>
              {s === 'All' ? 'all' : STATUS_LABEL[s]}
            </button>
          ))}
        </nav>

        {/* Book Grid */}
        <div
          className="book-grid"
          role="feed"
          aria-label={`Books — ${filter === 'All' ? 'all' : STATUS_LABEL[filter]}`}
        >
          {filtered.map((book, i) => <BookCard key={book.id} book={book} idx={i} />)}
          {filtered.length === 0 && (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', fontFamily: 'var(--font-code)' }}>
              // No books in this category.
            </p>
          )}
        </div>

        {/* Add a book note */}
        <div style={{ marginTop: '4rem', padding: '1.5rem', border: '1px solid var(--dark-border)', borderRadius: 'var(--r-lg)', background: 'var(--dark-surface)', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
          <span style={{ color: 'var(--syn-comment)' }}>// More books being added as I read them.</span>
          <br />
          <span style={{ color: 'var(--syn-comment)' }}>// Got a recommendation? </span>
          <a href={`mailto:asoliyarohit@gmail.com?subject=Book Recommendation`} style={{ color: 'var(--green)' }}>send it my way →</a>
        </div>
      </div>
    </div>
  )
}
