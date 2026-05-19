import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export function useScrollProgress() {
  const ref = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)

  useGSAP(() => {
    if (!ref.current) return

    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => setProgress(self.progress),
    })
  }, { dependencies: [] })

  return { ref, progress }
}
