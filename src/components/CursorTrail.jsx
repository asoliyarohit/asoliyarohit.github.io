import { useEffect } from 'react'

const NUM_DOTS = 10

export default function CursorTrail() {
  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const dots = []
    const positions = Array.from({ length: NUM_DOTS }, () => ({ x: -100, y: -100 }))

    // Create trail dots
    for (let i = 0; i < NUM_DOTS; i++) {
      const el = document.createElement('div')
      const size = Math.max(2, 10 - i)
      el.className = 'cursor-dot'
      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${i < 4 ? '#D4AF37' : '#FF6B2C'};
        opacity: ${(1 - i / NUM_DOTS) * 0.8};
      `
      document.body.appendChild(el)
      dots.push(el)
    }

    let mouseX = -100
    let mouseY = -100

    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    let rafId
    const animate = () => {
      // First dot follows mouse directly
      positions[0].x += (mouseX - positions[0].x) * 0.35
      positions[0].y += (mouseY - positions[0].y) * 0.35

      // Each subsequent dot trails the previous
      for (let i = 1; i < NUM_DOTS; i++) {
        positions[i].x += (positions[i - 1].x - positions[i].x) * 0.4
        positions[i].y += (positions[i - 1].y - positions[i].y) * 0.4
      }

      dots.forEach((dot, i) => {
        const hw = dot.offsetWidth / 2
        const hh = dot.offsetHeight / 2
        dot.style.transform = `translate(${positions[i].x - hw}px, ${positions[i].y - hh}px)`
      })

      rafId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    animate()

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
      dots.forEach((el) => { if (el.parentNode) el.parentNode.removeChild(el) })
    }
  }, [])

  return null
}
