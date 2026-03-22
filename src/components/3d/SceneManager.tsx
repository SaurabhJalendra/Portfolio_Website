import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useEffect, useRef } from 'react'
import { AdaptiveDpr, PerformanceMonitor, Preload } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HeroScene } from './HeroScene'

gsap.registerPlugin(ScrollTrigger)

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
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setWebgl(isWebGLAvailable())
  }, [])

  useEffect(() => {
    if (!wrapperRef.current) return

    // Fade within the first 400px of scroll (works even on short pages)
    const st = ScrollTrigger.create({
      start: 0,
      end: 400,
      onUpdate: (self) => {
        if (wrapperRef.current) {
          const opacity = 1 - self.progress * 0.92
          wrapperRef.current.style.opacity = String(Math.max(opacity, 0.08))
        }
      },
    })

    return () => st.kill()
  }, [])

  if (!webgl) return null

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
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
