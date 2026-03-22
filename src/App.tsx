import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ReducedMotionProvider } from './components/ui/ReducedMotionProvider'
import { Preloader } from './components/ui/Preloader'
import { Navbar } from './components/ui/Navbar'
import { Footer } from './components/ui/Footer'
import { CustomCursor } from './components/ui/CustomCursor'
import { ScrollProgress } from './components/ui/ScrollProgress'
import { AmbientBackground } from './components/ui/AmbientBackground'
import { PageTransition } from './components/ui/PageTransition'
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

      <Navbar />
      <ScrollProgress />
      <AmbientBackground />

      <main className="bg-background-dark min-h-screen">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Routes>
        </PageTransition>
      </main>

      <Footer />
      <CustomCursor />
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
