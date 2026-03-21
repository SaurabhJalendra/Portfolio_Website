import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function BlackHole() {
  const groupRef = useRef<THREE.Group>(null!)
  const diskRef = useRef<THREE.Mesh>(null!)
  const { pointer } = useThree()

  useFrame((_, delta) => {
    // Slow rotation of the entire blackhole
    groupRef.current.rotation.y += delta * 0.15

    // Accretion disk spins faster
    if (diskRef.current) {
      diskRef.current.rotation.z += delta * 0.3
    }

    // Subtle mouse follow
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      pointer.y * 0.2 - 0.3,
      delta * 2
    )
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      pointer.x * 0.5,
      delta * 2
    )
  })

  return (
    <group ref={groupRef} rotation={[-0.5, 0, 0]}>
      {/* Event horizon - dark sphere */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#0a0010"
          emissiveIntensity={0.5}
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Inner glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.05, 16, 100]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={3}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Accretion disk - main */}
      <mesh ref={diskRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.6, 2, 128]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#6366f1"
          emissiveIntensity={1.5}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer accretion ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.8, 0.3, 2, 128]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#8b5cf6"
          emissiveIntensity={0.8}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function AccretionParticles({ count = 500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Distribute particles in a disk shape
      const angle = Math.random() * Math.PI * 2
      const radius = 1.5 + Math.random() * 3
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.3 // thin disk
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    return pos
  }, [count])

  useFrame((_, delta) => {
    if (!ref.current) return
    const posArray = ref.current.geometry.attributes.position
      .array as Float32Array

    for (let i = 0; i < count; i++) {
      const idx = i * 3
      // Current position
      const x = posArray[idx]
      const z = posArray[idx + 2]
      const dist = Math.sqrt(x * x + z * z)

      // Orbital motion
      const angle = Math.atan2(z, x)
      const orbitalSpeed = 1.5 / (dist + 0.5) // faster closer to center
      const newAngle = angle + orbitalSpeed * delta

      // Slowly pull inward
      const newDist = dist - delta * 0.05

      if (newDist < 0.8) {
        // Reset particle to outer edge
        const resetAngle = Math.random() * Math.PI * 2
        const resetDist = 3 + Math.random() * 2
        posArray[idx] = Math.cos(resetAngle) * resetDist
        posArray[idx + 1] = (Math.random() - 0.5) * 0.3
        posArray[idx + 2] = Math.sin(resetAngle) * resetDist
      } else {
        posArray[idx] = Math.cos(newAngle) * newDist
        posArray[idx + 2] = Math.sin(newAngle) * newDist
      }
    }

    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref} rotation={[-0.5, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#a78bfa"
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function DistantStars({ count = 300 }: { count?: number }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Spread stars far out
      pos[i * 3] = (Math.random() - 0.5) * 40
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40
    }
    return pos
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#ffffff"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  )
}

export function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight
        position={[0, 0, 3]}
        intensity={2}
        color="#6366f1"
        distance={10}
      />
      <pointLight
        position={[3, 2, -2]}
        intensity={0.5}
        color="#8b5cf6"
        distance={15}
      />

      <BlackHole />
      <AccretionParticles count={600} />
      <DistantStars count={400} />
    </>
  )
}
