import { useEffect, useRef } from 'react'
import { useMotionSafe } from './ReducedMotionProvider'

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const motionSafe = useMotionSafe()

  useEffect(() => {
    // Only on desktop with pointer device
    if (!motionSafe || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mouseX = 0, mouseY = 0
    let ringX = 0, ringY = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`
    }

    // Ring trails the dot
    const animate = () => {
      ringX += (mouseX - ringX) * 0.15
      ringY += (mouseY - ringY) * 0.15
      ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`
      requestAnimationFrame(animate)
    }

    const onEnterInteractive = () => {
      ring.style.width = '60px'
      ring.style.height = '60px'
      ring.style.transform = `translate(${ringX - 30}px, ${ringY - 30}px)`
      ring.style.borderColor = 'rgba(99, 102, 241, 0.5)'
      dot.style.opacity = '0.5'
    }

    const onLeaveInteractive = () => {
      ring.style.width = '40px'
      ring.style.height = '40px'
      ring.style.borderColor = 'rgba(244, 244, 245, 0.3)'
      dot.style.opacity = '1'
    }

    window.addEventListener('mousemove', onMouseMove)
    const rafId = requestAnimationFrame(animate)

    // Listen on interactive elements
    const addListeners = () => {
      document.querySelectorAll('a, button, [data-cursor="pointer"], input, textarea').forEach((el) => {
        el.addEventListener('mouseenter', onEnterInteractive)
        el.addEventListener('mouseleave', onLeaveInteractive)
      })
    }

    addListeners()
    const observer = new MutationObserver(addListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [motionSafe])

  if (!motionSafe) return null

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: 'fixed', top: 0, left: 0, width: 8, height: 8,
          borderRadius: '50%', background: '#f4f4f5', pointerEvents: 'none',
          zIndex: 99999, transition: 'opacity 0.15s ease',
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: 'fixed', top: 0, left: 0, width: 40, height: 40,
          borderRadius: '50%', border: '1px solid rgba(244, 244, 245, 0.3)',
          pointerEvents: 'none', zIndex: 99998,
          transition: 'width 0.2s ease, height 0.2s ease, border-color 0.2s ease',
        }}
      />
    </>
  )
}
