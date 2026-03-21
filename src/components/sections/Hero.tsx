import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { personalInfo } from '../../data/personal'

gsap.registerPlugin(useGSAP)

export function Hero() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from('.hero-greeting', { y: 40, opacity: 0, duration: 0.8, delay: 1.2 })
      .from('.hero-name', { y: 60, opacity: 0, duration: 0.8 }, '-=0.4')
      .from('.hero-title', { y: 40, opacity: 0, duration: 0.8 }, '-=0.4')
      .from('.hero-bio', { y: 30, opacity: 0, duration: 0.6 }, '-=0.3')
      .from('.hero-cta', { y: 20, opacity: 0, duration: 0.6 }, '-=0.2')
  }, { scope: containerRef })

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen flex items-center section-padding z-10"
    >
      <div className="max-w-3xl">
        <p className="hero-greeting text-sm md:text-base text-muted font-mono mb-4">
          Hi, my name is
        </p>
        <h1 className="hero-name text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-4">
          {personalInfo.name}
        </h1>
        <h2 className="hero-title text-2xl md:text-4xl font-display font-semibold gradient-text mb-6">
          {personalInfo.title}
        </h2>
        <p className="hero-bio text-lg text-muted max-w-xl mb-8 leading-relaxed">
          {personalInfo.bio}
        </p>
        <div className="hero-cta flex gap-4">
          <a
            href="#projects"
            className="px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="px-6 py-3 rounded-full border border-text/20 text-text hover:border-primary hover:text-primary transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  )
}
