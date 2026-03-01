import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const LINKS = [
  { label: 'home',          path: '/' },
  { label: 'learning',      path: '/learning' },
  { label: 'projects',      path: '/projects' },
  { label: 'contributions', path: '/contributions' },
  { label: 'reading',       path: '/reading' },
]

export default function Navbar() {
  const [solid, setSolid]       = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => {
      setSolid(window.scrollY > 50)
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); window.scrollTo(0, 0) }, [location.pathname])

  const go = (path) => navigate(path)

  return (
    <>
      <div className="progress-bar" style={{ width: `${progress}%` }} aria-hidden="true" />

      <header className={`nav${solid ? ' solid' : ''}`} role="banner">
        <button className="nav-logo" onClick={() => go('/')} aria-label="Go home">
          <span className="logo-bracket">&lt;</span>
          rsa
          <span className="logo-slash"> /&gt;</span>
        </button>

        <nav aria-label="Main navigation">
          <div className="nav-links">
            {LINKS.map(({ label, path }) => {
              const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
              return (
                <button
                  key={label}
                  className={`nav-link${isActive ? ' active' : ''}`}
                  onClick={() => go(path)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="nav-prefix">~/</span>{label}
                </button>
              )
            })}
          </div>
        </nav>

        <button
          className={`nav-burger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </header>

      <nav className={`mobile-menu${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        {LINKS.map(({ label, path }) => (
          <a key={label} href="#" onClick={e => { e.preventDefault(); go(path) }}
            style={{ color: location.pathname === path ? 'var(--green)' : undefined }}>
            ./{label}
          </a>
        ))}
      </nav>
    </>
  )
}
