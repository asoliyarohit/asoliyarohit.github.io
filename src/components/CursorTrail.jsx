import { useEffect } from 'react'

export default function CursorTrail() {
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const N = 8
    const dots = []
    const pos  = Array.from({ length: N }, () => ({ x: -200, y: -200 }))
    let mx = -200, my = -200

    for (let i = 0; i < N; i++) {
      const size = Math.max(2, 10 - i * 1.1)
      const el = document.createElement('div')
      el.className = 'cursor-dot'
      el.style.cssText = `width:${size}px;height:${size}px;background:${i < 3 ? '#00ff41' : '#00d4ff'};opacity:${(1 - i / N) * 0.75};`
      document.body.appendChild(el)
      dots.push(el)
    }

    const onMove = e => { mx = e.clientX; my = e.clientY }
    window.addEventListener('mousemove', onMove, { passive: true })

    let raf
    const tick = () => {
      pos[0].x += (mx - pos[0].x) * 0.38
      pos[0].y += (my - pos[0].y) * 0.38
      for (let i = 1; i < N; i++) {
        pos[i].x += (pos[i-1].x - pos[i].x) * 0.42
        pos[i].y += (pos[i-1].y - pos[i].y) * 0.42
      }
      dots.forEach((d, i) => {
        d.style.transform = `translate(${pos[i].x - d.offsetWidth / 2}px,${pos[i].y - d.offsetHeight / 2}px)`
      })
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      dots.forEach(d => d.parentNode?.removeChild(d))
    }
  }, [])

  return null
}
