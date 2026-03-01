import { useEffect, useRef, useState } from 'react'
import { contributions } from '../data/content'

const TYPE_ICONS = { code: '⌥', docs: '◈', project: '◇' }

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

function TimelineItem({ item, index }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`timeline-item reveal${visible ? ' visible' : ''}`}
      style={{ transitionDelay: `${index * 0.12}s` }}
    >
      <div className={`timeline-dot ${item.status}`} aria-label={`Status: ${item.status}`} />
      <div className="timeline-content">
        <h4 className="timeline-title">{item.title}</h4>
        {item.organization && (
          <p className="timeline-org">
            {TYPE_ICONS[item.type] || '◈'} {item.organization}
          </p>
        )}
        <p className="timeline-desc">{item.description}</p>
        <div className="timeline-meta">
          <time className="timeline-date">{item.date}</time>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="timeline-link"
              aria-label={`View ${item.title}`}
            >
              View ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function ConsultingCard({ service, index }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`consulting-card reveal${visible ? ' visible' : ''}`}
      style={{ transitionDelay: `${index * 0.12}s` }}
    >
      <div className="consulting-card-header">
        <h4 className="consulting-card-title">{service.title}</h4>
        <span className="consulting-avail">Available</span>
      </div>
      <p className="consulting-desc">{service.description}</p>
      <div className="consulting-skills" role="list" aria-label="Skills involved">
        {service.skills.map((s) => (
          <span key={s} className="tag" role="listitem">{s}</span>
        ))}
      </div>
    </div>
  )
}

export default function Contributions() {
  const [headerRef, headerVisible] = useReveal()

  return (
    <section id="contributions" className="contributions" aria-labelledby="contributions-title">
      <div className="container">
        {/* Header */}
        <div
          ref={headerRef}
          className={`section-header reveal${headerVisible ? ' visible' : ''}`}
        >
          <p className="section-label" aria-hidden="true">Giving Back</p>
          <h2 className="section-title" id="contributions-title">
            Contributions &amp; Consulting
          </h2>
          <p className="section-subtitle">
            My journey into open source and ways I can help others with data, Python, and learning.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="contributions-inner">
          {/* Open Source Column */}
          <div>
            <h3 className="contrib-column-title">Open Source</h3>
            <div className="contrib-timeline" role="feed" aria-label="Open source contributions">
              {contributions.opensource.map((item, i) => (
                <TimelineItem key={item.id} item={item} index={i} />
              ))}
            </div>
          </div>

          {/* Consulting Column */}
          <div>
            <h3 className="contrib-column-title">Consulting &amp; Help</h3>
            <div className="consulting-grid" role="feed" aria-label="Consulting services">
              {contributions.consulting.map((s, i) => (
                <ConsultingCard key={s.id} service={s} index={i} />
              ))}
            </div>
          </div>

          {/* Full-width CTA */}
          <div className="contributions-cta" role="complementary" aria-label="Contact call to action">
            <h3 className="contributions-cta-title">
              Let's Work Together
            </h3>
            <p className="contributions-cta-desc">
              Have a dataset that needs exploring? A Python script that needs building?
              Or just want to talk data science? I'm always happy to connect and collaborate.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="mailto:asoliyarohit@gmail.com"
                className="btn btn-primary"
                aria-label="Send email to Rohit"
              >
                Get In Touch ✉
              </a>
              <a
                href="https://www.linkedin.com/in/asoliyarohit"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                aria-label="Connect on LinkedIn"
              >
                LinkedIn ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
