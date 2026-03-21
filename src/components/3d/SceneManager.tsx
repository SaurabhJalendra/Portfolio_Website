import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { AdaptiveDpr, PerformanceMonitor, Preload } from '@react-three/drei'
import { HeroScene } from './HeroScene'

export function SceneManager() {
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
