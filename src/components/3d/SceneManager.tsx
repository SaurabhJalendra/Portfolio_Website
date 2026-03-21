import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useEffect } from 'react'
import { AdaptiveDpr, PerformanceMonitor, Preload } from '@react-three/drei'
import { HeroScene } from './HeroScene'

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

export function SceneManager() {
  const [webgl, setWebgl] = useState(true)
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    setWebgl(isWebGLAvailable())
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const heroHeight = window.innerHeight
      // Fade out over the second half of the hero section
      const fadeStart = heroHeight * 0.3
      const fadeEnd = heroHeight * 0.8
      if (scrollY <= fadeStart) {
        setOpacity(1)
      } else if (scrollY >= fadeEnd) {
        setOpacity(0)
      } else {
        setOpacity(1 - (scrollY - fadeStart) / (fadeEnd - fadeStart))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!webgl) return null

  const isHidden = opacity <= 0.01

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        opacity,
        transition: 'opacity 0.1s ease-out',
        pointerEvents: 'none',
        visibility: isHidden ? 'hidden' : 'visible',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <PerformanceMonitor>
          <AdaptiveDpr pixelated />
        </PerformanceMonitor>
        <Suspense fallback={null}>
          <HeroScene />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}
