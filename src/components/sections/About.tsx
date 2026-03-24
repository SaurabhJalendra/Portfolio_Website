import { useRef } from 'react'
import { MapPin, Mail, ExternalLink, Cpu, GraduationCap, FileText } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SectionHeading } from '../ui/SectionHeading'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const researchInterests = [
  'Reinforcement Learning', 'World Models', 'Scientific Simulation and Discovery',
  'Symbolic Regression', 'Multimodal Learning', 'LLM Agents'
]

const education = [
  { degree: 'M.Tech in AI/ML', school: 'Birla Institute of Technology and Science, Pilani', period: 'Jun 2024 – Mar 2026', detail: 'Dissertation: Quantum-Enhanced Simulation Learning for RL', primary: true },
  { degree: 'MBA in Banking and Finance', school: 'NMIMS, Mumbai', period: 'Jan 2022 – Jan 2024', detail: '', primary: false },
  { degree: 'B.Tech in Computer Science Engineering', school: 'Government Engineering College, Bikaner', period: 'May 2013 – May 2017', detail: '', primary: false },
]

export function About() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.fromTo('.about-content',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.about-content', start: 'top 85%', toggleActions: 'play none none none' },
      }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef}>
      {/* About */}
      <div className="max-w-6xl mx-auto px-6 py-16 border-b border-gray-200">
        <div className="about-content">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Portfolio</h1>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed mb-8">
            AI/ML researcher and engineer building at the intersection of deep learning,
            reinforcement learning, and scientific discovery. Passionate about world models,
            symbolic regression, and autonomous systems.
          </p>
          <div className="flex flex-wrap gap-6 text-gray-600">
            <div className="flex items-center gap-2"><MapPin size={18} /><span>Jaipur, India (open to relocate)</span></div>
            <div className="flex items-center gap-2"><Mail size={18} /><a href="mailto:saurabhjalendra@gmail.com" className="hover:text-blue-600">saurabhjalendra@gmail.com</a></div>
            <div className="flex items-center gap-2"><ExternalLink size={18} /><a href="https://linkedin.com/in/saurabhjalendra" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">LinkedIn</a></div>
            <div className="flex items-center gap-2"><ExternalLink size={18} /><a href="https://github.com/SaurabhJalendra" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">GitHub</a></div>
          </div>
          <div className="mt-6">
            <a
              href="/cv.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              <FileText size={16} />
              Download Resume
            </a>
          </div>
        </div>
      </div>

      {/* Research Interests */}
      <div className="max-w-6xl mx-auto px-6 py-16 border-b border-gray-200">
        <SectionHeading icon={<Cpu />} title="Research Interests" />
        <div className="flex flex-wrap gap-3">
          {researchInterests.map((interest) => (
            <span key={interest} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-medium">
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="max-w-6xl mx-auto px-6 py-16 border-b border-gray-200">
        <SectionHeading icon={<GraduationCap />} title="Education" />
        <div className="space-y-8">
          {education.map((edu, i) => (
            <div key={i} className={`relative pl-8 border-l-2 ${edu.primary ? 'border-blue-600' : 'border-gray-300'}`}>
              <div className={`absolute -left-2 top-0 w-4 h-4 rounded-full ${edu.primary ? 'bg-blue-600' : 'bg-gray-400'}`} />
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold">{edu.school}</h3>
                <span className="text-gray-600 text-sm">{edu.period}</span>
              </div>
              <p className={`font-medium mb-2 ${edu.primary ? 'text-blue-600' : 'text-gray-600'}`}>{edu.degree}</p>
              {edu.detail && (
                <ul className="space-y-2 text-gray-700 mt-3">
                  <li className="flex gap-2"><span className="text-blue-600 mt-1.5">•</span><span>{edu.detail}</span></li>
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
