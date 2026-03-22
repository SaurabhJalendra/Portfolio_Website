import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SectionHeading } from '../ui/SectionHeading'
import { ProjectCard } from '../ui/ProjectCard'
import { projects } from '../../data/projects'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function Projects() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.fromTo('.project-card',
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.2, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: '.projects-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )
  }, { scope: containerRef })

  const featured = projects.filter((p) => p.featured)
  const other = projects.filter((p) => !p.featured)

  return (
    <section ref={containerRef} id="projects" className="section-padding relative z-10">
      <div className="max-w-6xl mx-auto">
        <SectionHeading number="03" title="Projects" />

        {/* Featured projects */}
        <div className="projects-grid grid md:grid-cols-2 gap-6 mb-8">
          {featured.map((project, i) => (
            <div key={project.id} className="relative">
              {/* Gradient decorative strip */}
              <div className="bg-gradient-to-r from-primary to-secondary h-0.5 rounded-t-2xl" />
              <ProjectCard project={project} index={i} featured />
            </div>
          ))}
        </div>

        {/* Other projects */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {other.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
