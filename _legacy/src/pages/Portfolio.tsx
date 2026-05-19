import { lazy, Suspense } from 'react'

const About = lazy(() => import('../components/sections/About').then(m => ({ default: m.About })))
const Experience = lazy(() => import('../components/sections/Experience').then(m => ({ default: m.Experience })))
const Projects = lazy(() => import('../components/sections/Projects').then(m => ({ default: m.Projects })))
const Skills = lazy(() => import('../components/sections/Skills').then(m => ({ default: m.Skills })))
const Contact = lazy(() => import('../components/sections/Contact').then(m => ({ default: m.Contact })))

export function Portfolio() {
  return (
    <div className="relative z-10 pt-16">
      <Suspense fallback={null}>
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </Suspense>
    </div>
  )
}
