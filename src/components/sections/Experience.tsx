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
    gsap.fromTo('.exp-card',
      { opacity: 0, y: 50, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.2, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.exp-list', start: 'top 80%', toggleActions: 'play none none none' },
      }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} id="experience" className="section-padding relative z-10 bg-background-dark text-text-light">
      <div className="max-w-5xl mx-auto">
        <SectionHeading title="Experience" />

        <div className="exp-list space-y-8 relative border-l-2 border-dashed border-white/10 pl-8 ml-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="exp-card card-hover-lift group relative p-6 md:p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
            >
              {/* Timeline dot */}
              <div className="absolute -left-[calc(2rem+5px)] top-8 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background-dark" />
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
