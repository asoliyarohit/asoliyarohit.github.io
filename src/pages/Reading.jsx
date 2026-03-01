import React, { useState, useEffect, useRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { books } from '../data/loader'

const STATUS_FILTERS = ['All', 'reading', 'completed', 'want-to-read']
const STATUS_LABEL   = { reading: 'Reading', completed: 'Completed', 'want-to-read': 'Want to Read' }

function useReveal(threshold = 0.08) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
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

/* ── react-pageflip requires forwardRef on page elements ── */
const BookPage = React.forwardRef(function BookPage({ children, className }, ref) {
  return <div ref={ref} className={`bp${className ? ' ' + className : ''}`}>{children}</div>
})

/* ── Full-screen flip-book modal ── */
function BookModal({ book, onClose }) {
  const flipRef = useRef(null)
  const badgeClass = book.status === 'reading' ? 'badge-reading'
                   : book.status === 'completed' ? 'badge-done'
                   : 'badge-want'

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = e => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowRight') flipRef.current?.pageFlip().flipNext()
      if (e.key === 'ArrowLeft')  flipRef.current?.pageFlip().flipPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="book-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${book.title} by ${book.author}`}>
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
            {/* Page 1 — Front cover */}
            <BookPage className="bp-cover">
              <div className="bp-cover-inner" style={{ background: `linear-gradient(160deg, ${book.spine} 0%, ${book.accent}55 100%)` }}>
                <div className="bp-cover-pattern" />
                <span className={`book-status-badge ${badgeClass}`}>{STATUS_LABEL[book.status]}</span>
                <div className="bp-cover-body">
                  <div className="bp-cover-genre">{book.genre}</div>
                  <div className="bp-cover-title">{book.title}</div>
                  <div className="bp-cover-author">{'— '}{book.author}</div>
                </div>
                <div className="bp-cover-hint">{'open →'}</div>
              </div>
            </BookPage>

            {/* Page 2 — Summary */}
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

            {/* Page 3 — My thoughts */}
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

            {/* Page 4 — Back cover */}
            <BookPage className="bp-cover bp-back-cover">
              <div className="bp-cover-inner" style={{ background: `linear-gradient(340deg, ${book.spine} 0%, ${book.accent}33 100%)` }}>
                <div className="bp-cover-pattern" />
                <div className="bp-back-body">
                  <div className="bp-meta-block">
                    {book.readingTime && (
                      <div className="bp-meta-row">
                        <span className="bp-meta-k">reading time</span>
                        <span className="bp-meta-v">{book.readingTime}</span>
                      </div>
                    )}
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

/* ── Portrait book card on the shelf ── */
function ShelfBook({ book, idx, onOpen }) {
  const [hovered, setHovered] = useState(false)
  const badgeClass = book.status === 'reading' ? 'badge-reading'
                   : book.status === 'completed' ? 'badge-done'
                   : 'badge-want'
  return (
    <div
      className={`sb${hovered ? ' sb-hover' : ''}`}
      style={{ transitionDelay: `${idx * 0.04}s` }}
      onClick={() => onOpen(book)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onOpen(book) }}
      aria-label={`${book.title} by ${book.author}`}
    >
      <div className="sb-cover" style={{ background: `linear-gradient(160deg, ${book.spine} 0%, ${book.accent}66 100%)` }}>
        <div className="sb-pattern" />
        <span className={`sb-badge ${badgeClass}`}>{STATUS_LABEL[book.status]}</span>
        <div className="sb-body">
          <div className="sb-genre">{book.genre}</div>
          <div className="sb-title">{book.title}</div>
          <div className="sb-author">{book.author}</div>
        </div>
        <div className="sb-foot">
          <Stars rating={book.rating} />
          <span className="sb-hint">{'open →'}</span>
        </div>
      </div>
    </div>
  )
}

/* ── Big featured card for "Currently Reading" ── */
function FeaturedBook({ book, onOpen }) {
  const [ref, vis] = useReveal()
  return (
    <div
      ref={ref}
      className={`featured-book reveal${vis ? ' visible' : ''}`}
      onClick={() => onOpen(book)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onOpen(book) }}
      aria-label={`Currently reading: ${book.title}`}
    >
      <div className="featured-book-cover" style={{ background: `linear-gradient(160deg, ${book.spine} 0%, ${book.accent}55 100%)` }}>
        <div className="sb-pattern" />
        <div className="featured-cover-text">
          <div className="featured-cover-genre">{book.genre}</div>
          <div className="featured-cover-title">{book.title}</div>
          <div className="featured-cover-author">{'— '}{book.author}</div>
        </div>
      </div>

      <div className="featured-book-info">
        <div className="featured-status-row">
          <span className="reading-pulse" aria-hidden="true" />
          <span className="featured-status-label">{'currently_reading'}</span>
        </div>
        <h3 className="featured-title">{book.title}</h3>
        <p className="featured-author-line">{'by '}{book.author}</p>
        {book.summary && <p className="featured-summary">{book.summary}</p>}
        <div className="featured-meta-row">
          {book.genre && <span className="tag">{book.genre}</span>}
          {book.readingTime && <span className="featured-time">{book.readingTime}</span>}
        </div>
        <button
          className="btn btn-outline"
          style={{ marginTop: '1.5rem', fontSize: '0.78rem', alignSelf: 'flex-start' }}
          onClick={e => { e.stopPropagation(); onOpen(book) }}
        >
          {'open book →'}
        </button>
      </div>
    </div>
  )
}

/* ── A labelled shelf row ── */
function BookShelf({ label, shelfBooks, onOpen }) {
  const [ref, vis] = useReveal()
  if (!shelfBooks.length) return null
  return (
    <div ref={ref} className={`bshelf reveal${vis ? ' visible' : ''}`}>
      <div className="bshelf-header">
        <span className="bshelf-comment">{'//'}</span>
        <span className="bshelf-name">{label}</span>
        <span className="bshelf-count">{'('}{shelfBooks.length}{')'}</span>
        <div className="bshelf-line" />
      </div>
      <div className="bshelf-row">
        {shelfBooks.map((book, i) => (
          <ShelfBook key={book.id} book={book} idx={i} onOpen={onOpen} />
        ))}
      </div>
      <div className="bshelf-plank">
        <div className="bshelf-plank-shine" />
      </div>
    </div>
  )
}

/* ── Page ── */
export default function Reading() {
  const [filter, setFilter]     = useState('All')
  const [openBook, setOpenBook] = useState(null)
  const [hRef, hVis]            = useReveal()

  const readingBooks    = books.filter(b => b.status === 'reading')
  const completedBooks  = books.filter(b => b.status === 'completed')
  const wantToReadBooks = books.filter(b => b.status === 'want-to-read')
  const filtered        = filter === 'All' ? books : books.filter(b => b.status === filter)

  const counts = {
    total:      books.length,
    completed:  completedBooks.length,
    reading:    readingBooks.length,
    wantToRead: wantToReadBooks.length,
  }

  const showAll      = filter === 'All'
  const showReading  = filter === 'reading'
  const showDone     = filter === 'completed'
  const showWant     = filter === 'want-to-read'

  return (
    <div className="page" style={{ position: 'relative', zIndex: 1 }}>
      <div className="container">

        {/* ── Header ── */}
        <div className="page-header">
          <div className="page-path">
            <span className="seg-home">~</span><span className="sep">/</span><span className="seg-cur">reading</span>
          </div>
          <div ref={hRef} className={`reveal${hVis ? ' visible' : ''}`}>
            <h1 className="page-h1">Library</h1>
            <p className="page-desc">My personal bookshelf — books I've read, am reading, and want to explore. Click any book to open it.</p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className={`reading-stats reveal${hVis ? ' visible' : ''} delay-1`} role="region" aria-label="Reading statistics">
          <div className="read-stat">
            <span className="read-stat-val">{counts.total}</span>
            <span className="read-stat-lbl">total books</span>
          </div>
          <div className="read-stat">
            <span className="read-stat-val" style={{ color: 'var(--green)' }}>{counts.completed}</span>
            <span className="read-stat-lbl">completed</span>
          </div>
          <div className="read-stat">
            <span className="read-stat-val" style={{ color: 'var(--syn-str)' }}>{counts.reading}</span>
            <span className="read-stat-lbl">reading now</span>
          </div>
          <div className="read-stat">
            <span className="read-stat-val">{counts.wantToRead}</span>
            <span className="read-stat-lbl">in queue</span>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <nav className={`filter-bar reveal${hVis ? ' visible' : ''} delay-2`} aria-label="Filter by reading status">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              className={`filter-pill${filter === s ? ' on' : ''}`}
              onClick={() => setFilter(s)}
              aria-pressed={filter === s}
            >
              {s === 'All' ? 'all books' : STATUS_LABEL[s]}
            </button>
          ))}
        </nav>

        {/* ── Currently Reading — featured ── */}
        {(showAll || showReading) && readingBooks.length > 0 && (
          <div style={{ marginBottom: '4rem' }}>
            <div className="bshelf-header" style={{ marginBottom: '1.5rem' }}>
              <span className="bshelf-comment">{'//'}</span>
              <span className="bshelf-name" style={{ color: 'var(--syn-str)' }}>{'currently_reading'}</span>
              <span className="bshelf-count">{'('}{readingBooks.length}{')'}</span>
              <div className="bshelf-line" />
            </div>
            {readingBooks.map(book => (
              <FeaturedBook key={book.id} book={book} onOpen={setOpenBook} />
            ))}
          </div>
        )}

        {/* ── Shelves ── */}
        {(showAll || showDone)    && <BookShelf label="completed"    shelfBooks={completedBooks}  onOpen={setOpenBook} />}
        {(showAll || showWant)    && <BookShelf label="want_to_read" shelfBooks={wantToReadBooks} onOpen={setOpenBook} />}
        {showReading && readingBooks.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', fontFamily: 'var(--font-code)', fontSize: '0.82rem' }}>
            {'// Not currently reading anything.'}
          </p>
        )}

        {/* ── Empty state ── */}
        {filtered.length === 0 && !showReading && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', fontFamily: 'var(--font-code)', fontSize: '0.82rem' }}>
            {'// No books in this category yet.'}
          </p>
        )}

        {/* ── Footer note ── */}
        <div style={{ marginTop: '4rem', padding: '1.5rem', border: '1px solid var(--dark-border)', borderRadius: 'var(--r-lg)', background: 'var(--dark-surface)', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
          <span style={{ color: 'var(--syn-comment)' }}>{'// More books being added as I read them.'}</span>
          <br />
          <span style={{ color: 'var(--syn-comment)' }}>{'// Got a recommendation? '}</span>
          <a href="mailto:asoliyarohit@gmail.com?subject=Book Recommendation" style={{ color: 'var(--green)' }}>
            {'send it my way →'}
          </a>
        </div>

      </div>

      {openBook && <BookModal book={openBook} onClose={() => setOpenBook(null)} />}
    </div>
  )
}
