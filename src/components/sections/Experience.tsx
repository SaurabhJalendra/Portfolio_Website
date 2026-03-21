import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SectionHeading } from '../ui/SectionHeading'
import { experiences } from '../../data/experience'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function Experience() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from('.exp-card', {
      y: 50, opacity: 0, duration: 0.7, stagger: 0.2, ease: 'power3.out',
      scrollTrigger: { trigger: '.exp-list', start: 'top 80%' },
    })
  }, { scope: containerRef })

  return (
    <section ref={containerRef} id="experience" className="section-padding relative z-10 bg-background-dark text-text-light">
      <div className="max-w-5xl mx-auto">
        <SectionHeading number="02" title="Experience" />

        <div className="exp-list space-y-8">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="exp-card group p-6 md:p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-xl font-display font-semibold group-hover:text-primary transition-colors">
                    {exp.role}
                  </h3>
                  <p className="text-primary/80">{exp.company} — {exp.location}</p>
                </div>
                <span className="text-sm text-muted font-mono whitespace-nowrap">{exp.period}</span>
              </div>

              <ul className="space-y-2 mb-4">
                {exp.description.map((d, i) => (
                  <li key={i} className="text-muted text-sm leading-relaxed flex gap-2">
                    <span className="text-primary mt-1 shrink-0">▹</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2">
                {exp.tech.map((t) => (
                  <span key={t} className="text-xs font-mono px-2 py-1 rounded-full bg-primary/10 text-primary/80">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
