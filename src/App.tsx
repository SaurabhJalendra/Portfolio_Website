import { useState, useCallback, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ReducedMotionProvider } from './components/ui/ReducedMotionProvider'
import { Preloader } from './components/ui/Preloader'
import { Navbar } from './components/ui/Navbar'
import { Footer } from './components/ui/Footer'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Home } from './pages/Home'
import { BlogPost } from './pages/BlogPost'
import { Portfolio } from './pages/Portfolio'

gsap.registerPlugin(ScrollTrigger)

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    setTimeout(() => ScrollTrigger.refresh(), 100)
  }, [pathname])
  return null
}

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

      <main className="bg-background-dark min-h-screen">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </main>

      <Footer />
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
