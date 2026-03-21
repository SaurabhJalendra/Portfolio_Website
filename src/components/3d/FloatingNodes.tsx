import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface FloatingNodesProps {
  count?: number
  radius?: number
}

export function FloatingNodes({ count = 12, radius = 3 }: FloatingNodesProps) {
  const groupRef = useRef<THREE.Group>(null!)

  const nodes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const phi = Math.acos(-1 + (2 * i) / count)
      const theta = Math.sqrt(count * Math.PI) * phi
      return {
        position: [
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi),
        ] as [number, number, number],
        scale: 0.1 + Math.random() * 0.15,
      }
    })
  }, [count, radius])

  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * 0.1
  })

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={node.position} scale={node.scale}>
            <icosahedronGeometry args={[1, 1]} />
            <MeshDistortMaterial
              color="#6366f1"
              emissive="#8b5cf6"
              emissiveIntensity={0.3}
              distort={0.3}
              speed={2}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}
