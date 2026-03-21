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
    gsap.from(ref.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    })
  }, { scope: ref })

  return (
    <div ref={ref} className="flex items-center gap-4 mb-12 md:mb-16">
      <span className="text-primary font-mono text-sm">{number}.</span>
      <h2 className="text-3xl md:text-4xl font-display font-bold">{title}</h2>
      <div className="flex-1 h-px bg-text/10 ml-4" />
    </div>
  )
}
