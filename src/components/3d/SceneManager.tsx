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
      if (scrollY <= heroHeight * 0.3) {
        setOpacity(1)
      } else {
        // Fade to 0.15 instead of 0 — always subtly visible
        const t = Math.min((scrollY - heroHeight * 0.3) / (heroHeight * 0.5), 1)
        setOpacity(1 - t * 0.85)
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
