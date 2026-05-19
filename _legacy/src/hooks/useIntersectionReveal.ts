import { useEffect, type RefObject } from 'react'

export function useIntersectionReveal(containerRef: RefObject<HTMLElement | null>, threshold = 0.1) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Check reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      container.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('revealed'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin: '0px 0px -10% 0px' }
    )

    // Slight delay to ensure elements are rendered
    const timer = setTimeout(() => {
      container.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [containerRef, threshold])
}
