import { useState, useCallback, Suspense, lazy } from 'react'
import { ReducedMotionProvider } from './components/ui/ReducedMotionProvider'
import { Preloader } from './components/ui/Preloader'
import { Navbar } from './components/ui/Navbar'
import { Footer } from './components/ui/Footer'
import { SceneManager } from './components/3d/SceneManager'
import { useSmoothScroll } from './hooks/useSmoothScroll'

const Hero = lazy(() => import('./components/sections/Hero').then(m => ({ default: m.Hero })))
const About = lazy(() => import('./components/sections/About').then(m => ({ default: m.About })))
const Experience = lazy(() => import('./components/sections/Experience').then(m => ({ default: m.Experience })))
const Projects = lazy(() => import('./components/sections/Projects').then(m => ({ default: m.Projects })))
const Skills = lazy(() => import('./components/sections/Skills').then(m => ({ default: m.Skills })))
const Blog = lazy(() => import('./components/sections/Blog').then(m => ({ default: m.Blog })))
const Contact = lazy(() => import('./components/sections/Contact').then(m => ({ default: m.Contact })))

export function App() {
  const [loaded, setLoaded] = useState(false)
  useSmoothScroll()

  const handleLoadComplete = useCallback(() => setLoaded(true), [])

  return (
    <ReducedMotionProvider>
      {!loaded && <Preloader onComplete={handleLoadComplete} />}
      {loaded && <SceneManager />}
      <Navbar />
      <main>
        <Suspense fallback={null}>
          <Hero />
          <About />
          <Experience />
          <Projects />
          <Skills />
          <Blog />
          <Contact />
        </Suspense>
      </main>
      <Footer />
    </ReducedMotionProvider>
  )
}
