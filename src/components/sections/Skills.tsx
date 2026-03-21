import { useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SectionHeading } from '../ui/SectionHeading'
import { SkillSphere } from '../3d/SkillSphere'
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
    gsap.from('.skills-canvas', {
      opacity: 0, scale: 0.8, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.skills-canvas', start: 'top 80%', toggleActions: 'play none none none' },
    })
    gsap.from('.legend-item', {
      x: -20, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.skills-legend', start: 'top 85%', toggleActions: 'play none none none' },
    })
  }, { scope: containerRef })

  return (
    <section ref={containerRef} id="skills" className="section-padding relative z-10 bg-background-dark text-text-light">
      <div className="max-w-6xl mx-auto">
        <SectionHeading number="04" title="Skills" />

        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* 3D Skill Sphere — separate Canvas justified: OrbitControls needs
              pointer events + different camera, while the hero Canvas is pointer-events:none */}
          <div className="skills-canvas md:col-span-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
            <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <Suspense fallback={null}>
                <SkillSphere skills={skills} />
              </Suspense>
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.5}
              />
            </Canvas>
          </div>

          {/* Legend */}
          <div className="skills-legend space-y-4">
            {categories.map((cat) => (
              <div key={cat.key} className="legend-item">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                  <span className="text-sm font-semibold">{cat.label}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-6">
                  {skills
                    .filter((s) => s.category === cat.key)
                    .map((s) => (
                      <span key={s.name} className="text-xs text-muted">
                        {s.name}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
