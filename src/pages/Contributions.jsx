import { useEffect, useRef, useState } from 'react'
import { contributions, about } from '../data/content'

function useReveal() {
  const ref = useRef(null); const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect()
  }, [])
  return [ref, vis]
}

function TlItem({ item, idx }) {
  const ref = useRef(null); const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={`tl-item reveal${vis ? ' visible' : ''}`} style={{ transitionDelay: `${idx * 0.1}s` }}>
      <div className={`tl-dot ${item.status}`} aria-label={`Status: ${item.status}`} />
      <div>
        <h4 className="tl-title">{item.title}</h4>
        {item.organization && <p className="tl-org">// {item.organization}</p>}
        <p className="tl-desc">{item.description}</p>
        <div className="tl-meta">
          <time className="tl-date">{item.date}</time>
          {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="tl-link">view ↗</a>}
        </div>
      </div>
    </div>
  )
}

function ConsCard({ service, idx }) {
  const ref = useRef(null); const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={`cons-card reveal${vis ? ' visible' : ''}`} style={{ transitionDelay: `${idx * 0.1}s` }}>
      <div className="cons-head">
        <h4 className="cons-title">{service.title}</h4>
        <span className="cons-badge">available</span>
      </div>
      <p className="cons-desc">{service.description}</p>
      <div className="cons-skills">
        {service.skills.map(s => <span key={s} className="tag">{s}</span>)}
      </div>
    </div>
  )
}

export default function Contributions() {
  const [hRef, hVis] = useReveal()

  return (
    <div className="page" style={{ position: 'relative', zIndex: 1 }}>
      <div className="container">
        <div className="page-header">
          <div className="page-path">
            <span className="seg-home">~</span><span className="sep">/</span><span className="seg-cur">contributions</span>
          </div>
          <div ref={hRef} className={`reveal${hVis ? ' visible' : ''}`}>
            <h1 className="page-h1">Contributions & Consulting</h1>
            <p className="page-desc">Open source journey and ways I can help others with data, Python, and learning.</p>
          </div>
        </div>

        <div className="contrib-grid">
          {/* Open Source column */}
          <div>
            <h3 className="contrib-col-head">open_source</h3>
            <div className="timeline" role="feed">
              {contributions.opensource.map((item, i) => <TlItem key={item.id} item={item} idx={i} />)}
            </div>
          </div>

          {/* Consulting column */}
          <div>
            <h3 className="contrib-col-head">consulting</h3>
            <div role="feed">
              {contributions.consulting.map((s, i) => <ConsCard key={s.id} service={s} idx={i} />)}
            </div>
          </div>

          {/* CTA */}
          <div className="contrib-cta">
            <h3 className="cta-title">Let's Work Together</h3>
            <p className="cta-sub">
              Have a dataset that needs exploring, a script that needs building, or just want to talk data science?
              I'm always open to connect and collaborate.
            </p>
            <div className="cta-btns">
              <a href={`mailto:${about.email}`} className="btn btn-green">./get-in-touch</a>
              <a href={about.links.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-outline">LinkedIn ↗</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
