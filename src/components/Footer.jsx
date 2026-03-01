import { about } from '../data/content'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Learning', href: '#learning' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contributions', href: '#contributions' },
]

const CONNECT_LINKS = [
  { label: 'GitHub', href: about.links.github },
  { label: 'LinkedIn', href: about.links.linkedin },
  { label: 'Twitter / X', href: about.links.twitter },
  { label: 'Email Me', href: `mailto:${about.email}` },
]

function scrollTo(id) {
  const el = document.getElementById(id.replace('#', ''))
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        {/* Brand */}
        <div>
          <div
            className="footer-brand-name"
            role="heading"
            aria-level={2}
          >
            Rohit Singh Asoliya
          </div>
          <p className="footer-brand-desc">
            {about.tagline} Building, learning, and growing — one data point at a time.
          </p>
          <div className="footer-social" role="list" aria-label="Social media links">
            {/* GitHub */}
            <a
              href={about.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="GitHub"
              role="listitem"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href={about.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="LinkedIn"
              role="listitem"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            {/* Twitter */}
            <a
              href={about.links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Twitter / X"
              role="listitem"
            >
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <nav aria-label="Footer navigation">
          <p className="footer-col-title">Navigate</p>
          <ul className="footer-links">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  onClick={(e) => { e.preventDefault(); scrollTo(href) }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Connect */}
        <nav aria-label="Connect links">
          <p className="footer-col-title">Connect</p>
          <ul className="footer-links">
            {CONNECT_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">
          &copy; {year} Rohit Singh Asoliya. All rights reserved.
        </p>
        <p className="footer-made">
          Built with <span>♥</span> from Rajasthan
        </p>
      </div>
    </footer>
  )
}
