import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Learning', href: '#learning' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contributions', href: '#contributions' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const sy = window.scrollY
      setScrolled(sy > 60)

      // Scroll progress
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? (sy / total) * 100 : 0)

      // Active section highlight
      const sections = ['about', 'learning', 'projects', 'contributions']
      let current = ''
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) {
          current = id
        }
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleNavClick = (href) => {
    setMobileOpen(false)
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Scroll Progress Bar */}
      <div
        className="scroll-progress"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />

      <header className={`navbar${scrolled ? ' scrolled' : ''}`} role="banner">
        <button
          className="navbar-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Go to top"
        >
          RSA
        </button>

        {/* Desktop nav */}
        <nav role="navigation" aria-label="Main navigation">
          <ul className="navbar-links">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className={activeSection === href.replace('#', '') ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); handleNavClick(href) }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Hamburger */}
        <button
          className={`navbar-hamburger${mobileOpen ? ' open' : ''}`}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* Mobile menu */}
      <nav
        className={`navbar-mobile${mobileOpen ? ' open' : ''}`}
        role="navigation"
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        {NAV_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            onClick={(e) => { e.preventDefault(); handleNavClick(href) }}
          >
            {label}
          </a>
        ))}
      </nav>
    </>
  )
}
