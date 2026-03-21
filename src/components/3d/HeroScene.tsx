import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'
import { FloatingNodes } from './FloatingNodes'
import { ParticleField } from './ParticleField'

export function HeroScene() {
  const mainMeshRef = useRef<THREE.Mesh>(null!)
  const { pointer } = useThree()

  useFrame((_, delta) => {
    if (mainMeshRef.current) {
      // Smooth mouse follow
      mainMeshRef.current.rotation.x = THREE.MathUtils.lerp(
        mainMeshRef.current.rotation.x,
        pointer.y * 0.3,
        delta * 2
      )
      mainMeshRef.current.rotation.y = THREE.MathUtils.lerp(
        mainMeshRef.current.rotation.y,
        pointer.x * 0.3,
        delta * 2
      )
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#8b5cf6" />

      {/* Central morphing shape */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={mainMeshRef} scale={2}>
          <icosahedronGeometry args={[1, 4]} />
          <MeshDistortMaterial
            color="#6366f1"
            emissive="#8b5cf6"
            emissiveIntensity={0.15}
            distort={0.4}
            speed={1.5}
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={0.9}
          />
        </mesh>
      </Float>

      {/* Orbiting nodes */}
      <FloatingNodes count={10} radius={4} />

      {/* Background particles */}
      <ParticleField count={300} spread={20} size={0.015} />
    </>
  )
}
