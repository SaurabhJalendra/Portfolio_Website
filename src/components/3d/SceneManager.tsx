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

  useEffect(() => {
    setWebgl(isWebGLAvailable())
  }, [])

  if (!webgl) return null

  return (
    <Canvas
      className="!fixed inset-0 !z-0"
      camera={{ position: [0, 0, 8], fov: 45 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ pointerEvents: 'none' }}
    >
      <PerformanceMonitor>
        <AdaptiveDpr pixelated />
      </PerformanceMonitor>
      <Suspense fallback={null}>
        <HeroScene />
        <Preload all />
      </Suspense>
    </Canvas>
  )
}
