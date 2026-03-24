import { useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface SectionHeadingProps {
  icon?: ReactNode
  title: string
}

export function SectionHeading({ icon, title }: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: ref.current, start: 'top 85%', toggleActions: 'play none none none' },
      }
    )
  }, { scope: ref })

  return (
    <h2 ref={ref} className="text-3xl font-semibold mb-12 flex items-center gap-3">
      {icon && <span className="text-blue-600">{icon}</span>}
      {title}
    </h2>
  )
}
