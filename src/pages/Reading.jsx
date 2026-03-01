import React, { useState, useEffect, useRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { books } from '../data/loader'

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
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= rating ? '' : 'star-empty'}>{i <= rating ? '★' : '☆'}</span>
      ))}
    </div>
  )
}

/* Book page — forwardRef required by react-pageflip */
const BookPage = React.forwardRef(function BookPage({ children, className }, ref) {
  return <div ref={ref} className={`bp${className ? ' ' + className : ''}`}>{children}</div>
})

/* Book modal with realistic page-flip */
function BookModal({ book, onClose }) {
  const flipRef = useRef(null)

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowRight') flipRef.current?.pageFlip().flipNext()
      if (e.key === 'ArrowLeft')  flipRef.current?.pageFlip().flipPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const badgeClass = book.status === 'reading' ? 'badge-reading' : book.status === 'completed' ? 'badge-done' : 'badge-want'

  return (
    <div className="book-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="book-modal-wrap" onClick={e => e.stopPropagation()}>
        <button className="book-modal-x" onClick={onClose} aria-label="Close">{'✕ close'}</button>

        <div className="book-modal-inner">
          <button className="book-nav prev" onClick={() => flipRef.current?.pageFlip().flipPrev()} aria-label="Previous page">{'‹'}</button>

          <HTMLFlipBook
            key={book.id}
            ref={flipRef}
            width={260}
            height={370}
            showCover={true}
            drawShadow={true}
            maxShadowOpacity={0.5}
            flippingTime={800}
            useMouseEvents={true}
            mobileScrollSupport={false}
            className="the-flip-book"
          >
            {/* Page 1: Front cover */}
            <BookPage className="bp-cover">
              <div className="bp-cover-inner" style={{ background: `linear-gradient(160deg, ${book.spine} 0%, ${book.accent}55 100%)` }}>
                <div className="bp-cover-pattern" />
                <span className={`book-status-badge ${badgeClass}`}>{STATUS_LABEL[book.status]}</span>
                <div className="bp-cover-body">
                  <div className="bp-cover-genre">{book.genre}</div>
                  <div className="bp-cover-title">{book.title}</div>
                  <div className="bp-cover-author">{'— '}{book.author}</div>
                </div>
                <div className="bp-cover-hint">open {'→'}</div>
              </div>
            </BookPage>

            {/* Page 2: Summary */}
            <BookPage className="bp-page">
              <div className="bp-page-inner">
                <div className="bp-gutter-shadow" />
                <div className="bp-label">{'// summary'}</div>
                <p className="bp-text">{book.summary}</p>
                <div className="bp-page-footer">
                  <span className="bp-tag">{book.genre}</span>
                </div>
              </div>
            </BookPage>

            {/* Page 3: My thoughts */}
            <BookPage className="bp-page bp-page-right">
              <div className="bp-page-inner">
                <div className="bp-label">{'// my_thoughts'}</div>
                <p className="bp-quote">{'"'}{book.myThoughts}{'"'}</p>
                <div className="bp-stars-row">
                  <Stars rating={book.rating} />
                  {book.rating && <span className="bp-rating-num">{book.rating}{' / 5'}</span>}
                </div>
              </div>
            </BookPage>

            {/* Page 4: Back cover */}
            <BookPage className="bp-cover bp-back-cover">
              <div className="bp-cover-inner" style={{ background: `linear-gradient(340deg, ${book.spine} 0%, ${book.accent}33 100%)` }}>
                <div className="bp-cover-pattern" />
                <div className="bp-back-body">
                  <div className="bp-meta-block">
                    <div className="bp-meta-row">
                      <span className="bp-meta-k">reading time</span>
                      <span className="bp-meta-v">{book.readingTime}</span>
                    </div>
                    {book.dateRead && (
                      <div className="bp-meta-row">
                        <span className="bp-meta-k">date read</span>
                        <span className="bp-meta-v">{book.dateRead}</span>
                      </div>
                    )}
                    {book.rating && (
                      <div className="bp-meta-row">
                        <span className="bp-meta-k">my rating</span>
                        <span className="bp-meta-v">{book.rating}{' / 5 ★'}</span>
                      </div>
                    )}
                  </div>
                  {book.purchaseLink
                    ? <a href={book.purchaseLink} target="_blank" rel="noopener noreferrer sponsored" className="bp-buy-btn" onClick={e => e.stopPropagation()}>
                        {'↗ Buy / View on Amazon'}
                      </a>
                    : <p className="bp-no-link">{'// no purchase link yet'}</p>
                  }
                </div>
              </div>
            </BookPage>
          </HTMLFlipBook>

          <button className="book-nav next" onClick={() => flipRef.current?.pageFlip().flipNext()} aria-label="Next page">{'›'}</button>
        </div>

        <div className="book-modal-hint">{'← drag corner or use arrow keys →'}</div>
      </div>
    </div>
  )
}

/* Book card — clicking opens the modal */
function BookCard({ book, idx, onOpen }) {
  const ref = useRef(null); const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.06 })
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect()
  }, [])

  const badgeClass = book.status === 'reading' ? 'badge-reading' : book.status === 'completed' ? 'badge-done' : 'badge-want'

  return (
    <div
      ref={ref}
      className={`book-card${book.status === 'reading' ? ' reading-now' : ''} reveal${vis ? ' visible' : ''}`}
      style={{ transitionDelay: `${(idx % 4) * 0.08}s` }}
      onClick={() => onOpen(book)}
      role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onOpen(book) }}
      aria-label={`${book.title} by ${book.author}`}
    >
      <div className="book-inner">
        <div className="book-face">
          <div className="book-cover">
            <div className="book-cover-bg" style={{ background: `linear-gradient(135deg, ${book.spine} 0%, ${book.accent}55 100%)` }} />
            <div className="book-cover-pattern" />
            <span className={`book-status-badge ${badgeClass}`}>{STATUS_LABEL[book.status]}</span>
            <div className="book-spine-title">{book.title}</div>
            <div className="book-spine-author">{book.author}</div>
          </div>
          <div className="book-front-info">
            <div className="book-front-genre">{book.genre}</div>
            <div className="book-rating">
              <Stars rating={book.rating} />
              <span className="book-flip-hint">click to open</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Reading() {
  const [filter, setFilter]     = useState('All')
  const [openBook, setOpenBook] = useState(null)
  const [hRef, hVis]            = useReveal()

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
            <p className="page-desc">Books I've read, am reading, and want to read. Click any card to open the book.</p>
          </div>
        </div>

        <div className={`reading-stats reveal${hVis ? ' visible' : ''} delay-1`} role="region">
          <div className="read-stat"><span className="read-stat-val">{counts.total}</span><span className="read-stat-lbl">total books</span></div>
          <div className="read-stat"><span className="read-stat-val">{counts.completed}</span><span className="read-stat-lbl">completed</span></div>
          <div className="read-stat"><span className="read-stat-val">{counts.reading}</span><span className="read-stat-lbl">reading now</span></div>
          <div className="read-stat"><span className="read-stat-val">{counts.wantToRead}</span><span className="read-stat-lbl">in queue</span></div>
        </div>

        <nav className={`filter-bar reveal${hVis ? ' visible' : ''} delay-2`} aria-label="Filter by status">
          {STATUS_FILTERS.map(s => (
            <button key={s} className={`filter-pill${filter === s ? ' on' : ''}`}
              onClick={() => setFilter(s)} aria-pressed={filter === s}>
              {s === 'All' ? 'all' : STATUS_LABEL[s]}
            </button>
          ))}
        </nav>

        <div className="book-grid" role="feed">
          {filtered.map((book, i) => <BookCard key={book.id} book={book} idx={i} onOpen={setOpenBook} />)}
          {filtered.length === 0 && (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', fontFamily: 'var(--font-code)' }}>
              {'// No books in this category.'}
            </p>
          )}
        </div>

        <div style={{ marginTop: '4rem', padding: '1.5rem', border: '1px solid var(--dark-border)', borderRadius: 'var(--r-lg)', background: 'var(--dark-surface)', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
          <span style={{ color: 'var(--syn-comment)' }}>{'// More books being added as I read them.'}</span>
          <br />
          <span style={{ color: 'var(--syn-comment)' }}>{'// Got a recommendation? '}</span>
          <a href="mailto:asoliyarohit@gmail.com?subject=Book Recommendation" style={{ color: 'var(--green)' }}>send it my way {'→'}</a>
        </div>
      </div>

      {openBook && <BookModal book={openBook} onClose={() => setOpenBook(null)} />}
    </div>
  )
}
