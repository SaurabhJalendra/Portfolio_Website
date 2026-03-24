import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ReducedMotionProvider } from './components/ui/ReducedMotionProvider'
import { Preloader } from './components/ui/Preloader'
import { ScrollProgress } from './components/ui/ScrollProgress'
import { PageTransition } from './components/ui/PageTransition'
import { Navbar } from './components/ui/Navbar'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Home } from './pages/Home'
import { BlogPost } from './pages/BlogPost'
import { Portfolio } from './pages/Portfolio'

gsap.registerPlugin(ScrollTrigger)

function AppContent() {
  const [loaded, setLoaded] = useState(false)
  useSmoothScroll()

  const handleLoadComplete = useCallback(() => {
    setLoaded(true)
    setTimeout(() => ScrollTrigger.refresh(), 100)
  }, [])

  return (
    <>
      {!loaded && <Preloader onComplete={handleLoadComplete} />}
      <ScrollProgress />
      <Navbar />
      <main className="min-h-screen">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Routes>
        </PageTransition>
      </main>
    </>
  )
}

export function App() {
  return (
    <ReducedMotionProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ReducedMotionProvider>
  )
}
