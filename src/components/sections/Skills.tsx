import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SectionHeading } from '../ui/SectionHeading'
import { skills } from '../../data/skills'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const categories = [
  { key: 'languages', label: 'Languages', color: 'bg-indigo-500' },
  { key: 'ml', label: 'ML / Deep Learning', color: 'bg-violet-500' },
  { key: 'llm', label: 'LLM / NLP', color: 'bg-purple-400' },
  { key: 'web', label: 'Web / Backend', color: 'bg-indigo-400' },
  { key: 'cloud', label: 'Cloud / DevOps', color: 'bg-violet-300' },
]

export function Skills() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.fromTo('.skill-category',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.skills-grid', start: 'top 85%', toggleActions: 'play none none none' },
      }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} id="skills" className="section-padding relative z-10">
      <div className="max-w-5xl mx-auto">
        <SectionHeading number="04" title="Skills" />
        <div className="skills-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div key={cat.key} className="skill-category">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                <h3 className="text-sm font-display font-semibold text-text-light">{cat.label}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.filter((s) => s.category === cat.key).map((s) => (
                  <span
                    key={s.name}
                    className="text-sm px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-muted hover:text-text-light hover:border-primary/30 transition-all duration-200"
                  >
                    {s.name}
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
