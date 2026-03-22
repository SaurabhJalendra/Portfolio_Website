import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Accretion disk with gravitational lensing illusion
// We simulate the lensing by rendering TWO half-disks:
// one tilted forward (visible above the hole) and one tilted back (visible below)
function AccretionDisk() {
  const diskRef = useRef<THREE.Group>(null!)

  useFrame((_, delta) => {
    diskRef.current.rotation.y += delta * 0.1
  })

  // Custom ring with gradient using vertex colors
  const diskGeometry = useMemo(() => {
    const geo = new THREE.RingGeometry(1.4, 4, 128, 3)
    const colors = new Float32Array(geo.attributes.position.count * 3)
    const positions = geo.attributes.position.array

    for (let i = 0; i < geo.attributes.position.count; i++) {
      const x = positions[i * 3]
      const y = positions[i * 3 + 1]
      const dist = Math.sqrt(x * x + y * y)
      const t = (dist - 1.4) / (4 - 1.4) // 0 at inner, 1 at outer

      // Inner: bright warm (1.0, 0.6, 0.2) -> Outer: cool violet (0.4, 0.3, 0.95)
      colors[i * 3] = THREE.MathUtils.lerp(1.0, 0.39, t) // R
      colors[i * 3 + 1] = THREE.MathUtils.lerp(0.5, 0.2, t) // G
      colors[i * 3 + 2] = THREE.MathUtils.lerp(0.1, 0.96, t) // B
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  return (
    <group ref={diskRef}>
      {/* Main accretion disk */}
      <mesh rotation={[Math.PI / 2, 0, 0]} geometry={diskGeometry}>
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Lensed disk - curved over the top */}
      <mesh rotation={[0, 0, 0]} geometry={diskGeometry} scale={[1, 0.15, 1]}>
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function EventHorizon() {
  return (
    <group>
      {/* Pure black sphere */}
      <mesh>
        <sphereGeometry args={[1.1, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Photon ring - thin bright ring at event horizon */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.03, 16, 128]} />
        <meshBasicMaterial
          color="#ffaa44"
          toneMapped={false}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Secondary photon ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.25, 0.015, 16, 128]} />
        <meshBasicMaterial
          color="#8b5cf6"
          toneMapped={false}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Glow sphere around event horizon */}
      <mesh>
        <sphereGeometry args={[1.35, 32, 32]} />
        <meshStandardMaterial
          color="#1a0a30"
          emissive="#6366f1"
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  )
}

function OrbitalParticles({ count = 800 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 1.5 + Math.random() * 3.5
      const height = (Math.random() - 0.5) * 0.2 * (radius / 3) // thinner near center
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = height
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    return pos
  }, [count])

  const colors = useMemo(() => {
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3]
      const z = positions[i * 3 + 2]
      const dist = Math.sqrt(x * x + z * z)
      const t = (dist - 1.5) / 3.5

      // Warm near center, cool at edges
      col[i * 3] = THREE.MathUtils.lerp(1.0, 0.4, t)
      col[i * 3 + 1] = THREE.MathUtils.lerp(0.6, 0.25, t)
      col[i * 3 + 2] = THREE.MathUtils.lerp(0.2, 0.95, t)
    }
    return col
  }, [count, positions])

  useFrame((_, delta) => {
    if (!ref.current) return
    const posArray = ref.current.geometry.attributes.position
      .array as Float32Array

    for (let i = 0; i < count; i++) {
      const idx = i * 3
      const x = posArray[idx]
      const z = posArray[idx + 2]
      const dist = Math.sqrt(x * x + z * z)
      const angle = Math.atan2(z, x)
      const speed = 1.2 / (dist * 0.8 + 0.3)
      const newAngle = angle + speed * delta
      const newDist = dist - delta * 0.03

      if (newDist < 1.2) {
        const resetAngle = Math.random() * Math.PI * 2
        const resetDist = 3 + Math.random() * 2
        posArray[idx] = Math.cos(resetAngle) * resetDist
        posArray[idx + 1] = (Math.random() - 0.5) * 0.15
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
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function DistantStars({ count = 500 }: { count?: number }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 20 + Math.random() * 30
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  )
}

export function HeroScene() {
  const groupRef = useRef<THREE.Group>(null!)
  const { pointer } = useThree()

  useFrame((_, delta) => {
    // Subtle mouse interaction on the whole scene
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -0.5 + pointer.y * 0.15,
      delta * 1.5
    )
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      pointer.x * 0.2,
      delta * 1.5
    )
  })

  return (
    <>
      {/* Minimal ambient - we want dramatic lighting */}
      <ambientLight intensity={0.05} />

      {/* Key light behind/above - creates rim lighting on the disk */}
      <pointLight
        position={[0, 3, -5]}
        intensity={3}
        color="#6366f1"
        distance={20}
      />
      <pointLight
        position={[0, -2, 5]}
        intensity={1}
        color="#8b5cf6"
        distance={15}
      />

      {/* Offset right so text on left is readable */}
      <group ref={groupRef} position={[3, 0.5, 0]} rotation={[-0.5, 0, 0]} scale={0.8}>
        <EventHorizon />
        <AccretionDisk />
      </group>

      <OrbitalParticles count={800} />
      <DistantStars count={500} />
    </>
  )
}
