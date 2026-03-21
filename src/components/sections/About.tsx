import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SectionHeading } from '../ui/SectionHeading'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const education = [
  { degree: 'M.Tech in AI/ML', school: 'BITS Pilani', period: '2024 — 2026', detail: 'Dissertation: Quantum-Enhanced Simulation Learning for RL' },
  { degree: 'MBA, Banking & Finance', school: 'NMIMS, Mumbai', period: '2022 — 2024', detail: '' },
  { degree: 'B.Tech, Computer Science', school: 'GEC Bikaner', period: '2013 — 2017', detail: '' },
]

export function About() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from('.about-text', {
      y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.about-text', start: 'top 85%', toggleActions: 'play none none none' },
    })

    gsap.from('.edu-item', {
      y: 30, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: '.edu-timeline', start: 'top 80%', toggleActions: 'play none none none' },
    })
  }, { scope: containerRef })

  return (
    <section ref={containerRef} id="about" className="section-padding relative z-10">
      <div className="max-w-5xl mx-auto">
        <SectionHeading number="01" title="About Me" />

        <div className="grid md:grid-cols-2 gap-12">
          <div className="about-text space-y-4 text-muted leading-relaxed">
            <p>
              I'm an AI/ML researcher and engineer focused on reinforcement learning,
              world models, and multimodal intelligence. Currently completing my M.Tech
              at BITS Pilani while co-founding SKY AI, where we build document
              intelligence and portfolio management platforms.
            </p>
            <p>
              My research explores quantum-inspired methods for training world models,
              with my dissertation achieving a 36-47% improvement in prediction accuracy
              on robotics environments. I've published work spanning gravitational
              lensing classification, graph neural networks, and scientific simulation.
            </p>
            <p>
              When I'm not training models, I build full-stack applications and
              multi-agent AI systems. I believe the most impactful work happens at the
              intersection of rigorous research and practical engineering.
            </p>
          </div>

          <div className="edu-timeline">
            <h3 className="text-lg font-display font-semibold mb-6">Education</h3>
            <div className="relative pl-6 border-l border-primary/30">
              {education.map((edu, i) => (
                <div key={i} className="edu-item relative mb-8 last:mb-0">
                  <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-primary" />
                  <p className="text-sm text-primary font-mono">{edu.period}</p>
                  <h4 className="font-semibold mt-1">{edu.degree}</h4>
                  <p className="text-sm text-muted">{edu.school}</p>
                  {edu.detail && <p className="text-sm text-muted/70 mt-1 italic">{edu.detail}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
