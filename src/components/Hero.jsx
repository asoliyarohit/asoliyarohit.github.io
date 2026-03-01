import { useEffect, useState, useRef } from 'react'
import { about } from '../data/content'
import Jharokha from './Jharokha'

const ROLES = about.roles

// Particle config
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 18 + 10,
  delay: Math.random() * 12,
  color: i % 3 === 0 ? '#D4AF37' : i % 3 === 1 ? '#FF6B2C' : '#1B2A6B',
}))

function useTypewriter(words, speed = 80, pause = 1800) {
  const [text, setText] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const current = words[wordIdx]

    if (!deleting && charIdx < current.length) {
      timeoutRef.current = setTimeout(() => setCharIdx((c) => c + 1), speed)
    } else if (!deleting && charIdx === current.length) {
      timeoutRef.current = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIdx > 0) {
      timeoutRef.current = setTimeout(() => setCharIdx((c) => c - 1), speed / 2)
    } else if (deleting && charIdx === 0) {
      setDeleting(false)
      setWordIdx((i) => (i + 1) % words.length)
    }

    setText(current.slice(0, charIdx))
    return () => clearTimeout(timeoutRef.current)
  }, [charIdx, deleting, wordIdx, words, speed, pause])

  return text
}

export default function Hero() {
  const role = useTypewriter(ROLES)

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" aria-label="Hero">
      {/* Background gradient */}
      <div className="hero-bg" aria-hidden="true" />

      {/* Floating particles */}
      <div className="hero-particles" aria-hidden="true">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="hero-particle"
            style={{
              left: p.left,
              bottom: '-20px',
              width: p.size,
              height: p.size,
              background: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="hero-inner">
        {/* ── Text Content ── */}
        <div className="hero-content">
          <div className="hero-greeting" role="text">
            <span className="hero-greeting-dot" aria-hidden="true" />
            Welcome to my world
          </div>

          <h1 className="hero-name">{about.name}</h1>

          <p className="hero-role" aria-label={`Currently: ${role}`}>
            <span style={{ color: 'var(--text-muted)' }}>I am a</span>
            &nbsp;
            <span className="hero-role-text">{role}</span>
            <span className="hero-role-cursor" aria-hidden="true" />
          </p>

          <p className="hero-desc">{about.tagline}</p>

          <div className="hero-cta">
            <button className="btn btn-primary" onClick={scrollToProjects}>
              View Projects
              <span aria-hidden="true">→</span>
            </button>
            <a
              href={`mailto:${about.email}`}
              className="btn btn-outline"
            >
              Let's Talk
              <span aria-hidden="true">✉</span>
            </a>
          </div>

          <div className="hero-social" role="list" aria-label="Social links">
            <a
              href={about.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-social-link"
              aria-label="GitHub profile"
              role="listitem"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
            <a
              href={about.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-social-link"
              aria-label="LinkedIn profile"
              role="listitem"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href={about.links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-social-link"
              aria-label="Twitter/X profile"
              role="listitem"
            >
              <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── Jharokha SVG ── */}
        <Jharokha />
      </div>

      {/* Scroll cue */}
      <button
        className="hero-scroll"
        onClick={scrollToAbout}
        aria-label="Scroll to about section"
      >
        <div className="hero-scroll-line" aria-hidden="true" />
        <span>Scroll</span>
      </button>
    </section>
  )
}
