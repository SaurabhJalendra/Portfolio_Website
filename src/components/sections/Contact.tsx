import { useRef } from 'react'
import { Mail } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SectionHeading } from '../ui/SectionHeading'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function Contact() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.fromTo('.contact-content',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.contact-content', start: 'top 85%', toggleActions: 'play none none none' },
      }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="max-w-6xl mx-auto px-6 py-16">
      <SectionHeading icon={<Mail />} title="Get In Touch" />
      <div className="contact-content">
        <p className="text-xl text-gray-700 mb-6 max-w-2xl">
          I'm always open to discussing research collaborations, interesting projects,
          or opportunities in AI/ML and reinforcement learning.
        </p>
        <div className="flex flex-wrap gap-4">
          <a href="mailto:saurabhjalendra@gmail.com" className="px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
            Send Email
          </a>
          <a href="https://linkedin.com/in/saurabhjalendra" target="_blank" rel="noopener noreferrer" className="px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:border-gray-400 transition-colors">
            Connect on LinkedIn
          </a>
        </div>
      </div>
    </section>
  )
}
