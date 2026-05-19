import { useRef } from 'react'
import { Terminal, Code, Cpu, Database, Cloud } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SectionHeading } from '../ui/SectionHeading'
import { skills } from '../../data/skills'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const categories = [
  { key: 'languages', label: 'Languages', icon: Code },
  { key: 'ml', label: 'ML/DL Frameworks', icon: Cpu },
  { key: 'llm', label: 'LLM/NLP', icon: Database },
  { key: 'web', label: 'Web/Backend', icon: Database },
  { key: 'cloud', label: 'Cloud/DevOps', icon: Cloud },
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
    <section ref={containerRef} className="max-w-6xl mx-auto px-6 py-16 border-b border-gray-200">
      <SectionHeading icon={<Terminal />} title="Technical Skills" />
      <div className="skills-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <div key={cat.key} className="skill-category">
              <div className="flex items-center gap-2 mb-4">
                <Icon className="text-blue-600" size={20} />
                <h3 className="font-semibold">{cat.label}</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {skills.filter((s) => s.category === cat.key).map((s) => s.name).join(', ')}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
