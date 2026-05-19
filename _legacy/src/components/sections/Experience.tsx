import { useRef } from 'react'
import { Briefcase } from 'lucide-react'
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
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.exp-list', start: 'top 85%', toggleActions: 'play none none none' },
      }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="max-w-6xl mx-auto px-6 py-16 border-b border-gray-200">
      <SectionHeading icon={<Briefcase />} title="Work Experience" />
      <div className="exp-list space-y-10">
        {experiences.map((exp) => (
          <div key={exp.id} className="exp-card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-semibold">{exp.role}</h3>
                <p className="text-blue-600 font-medium">{exp.company}, {exp.location}</p>
              </div>
              <span className="text-gray-600 text-sm whitespace-nowrap">{exp.period}</span>
            </div>
            <ul className="space-y-2 text-gray-700">
              {exp.description.map((d, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-blue-600 mt-1.5">•</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
