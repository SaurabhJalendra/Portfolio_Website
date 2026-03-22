import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface SectionHeadingProps {
  number: string
  title: string
}

export function SectionHeading({ number, title }: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return
    const heading = ref.current.querySelector('.heading-text')
    const line = ref.current.querySelector('.heading-line')

    gsap.fromTo(heading,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: ref.current, start: 'top 85%', toggleActions: 'play none none none' },
      }
    )
    gsap.fromTo(line,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: ref.current, start: 'top 85%', toggleActions: 'play none none none' },
      }
    )
  }, { scope: ref })

  return (
    <div ref={ref} className="flex items-center gap-4 mb-12 md:mb-16">
      <span className="heading-text gradient-text font-mono text-sm">{number}.</span>
      <h2 className="heading-text text-3xl md:text-4xl font-display font-bold text-text-light">{title}</h2>
      <div className="heading-line flex-1 h-px bg-white/10 ml-4 origin-left" />
    </div>
  )
}
