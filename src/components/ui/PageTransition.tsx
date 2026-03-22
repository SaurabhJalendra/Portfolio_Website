import { useRef, useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    if (!wrapperRef.current) {
      setDisplayChildren(children)
      return
    }

    // Exit animation
    gsap.to(wrapperRef.current, {
      opacity: 0, y: 8, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        setDisplayChildren(children)
        window.scrollTo(0, 0)
        // Enter animation
        gsap.fromTo(wrapperRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
        )
      },
    })
  }, [location.pathname])

  return <div ref={wrapperRef}>{displayChildren}</div>
}
