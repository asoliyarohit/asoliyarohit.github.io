import { useEffect, useRef } from 'react'

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789ABCDEFabcdef<>/{}[]()=+*#$%&|;'

export default function MatrixRain() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const FONT = 14
    let cols, drops, rafId

    const setup = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      cols  = Math.floor(canvas.width / FONT)
      drops = Array.from({ length: cols }, () => Math.random() * -100)
    }

    setup()

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 5, 8, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${FONT}px Fira Code, monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)]
        const x = i * FONT
        const y = drops[i] * FONT

        // Bright head
        if (drops[i] * FONT > canvas.height - FONT) {
          ctx.fillStyle = `rgba(180,255,200,${Math.random() * 0.6 + 0.4})`
        } else {
          ctx.fillStyle = `rgba(0, 255, 65, ${Math.random() * 0.35 + 0.05})`
        }

        ctx.fillText(char, x, y)

        if (y > canvas.height && Math.random() > 0.978) drops[i] = 0
        drops[i] += 0.5
      }

      rafId = requestAnimationFrame(draw)
    }

    const onResize = () => { setup() }
    window.addEventListener('resize', onResize)
    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        opacity: 0.055,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  )
}
