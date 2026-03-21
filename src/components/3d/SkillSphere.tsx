import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import type { Skill } from '../../types'

interface SkillSphereProps {
  skills: Skill[]
  radius?: number
}

export function SkillSphere({ skills, radius = 4 }: SkillSphereProps) {
  const groupRef = useRef<THREE.Group>(null!)

  const positions = useMemo(() => {
    return skills.map((_, i) => {
      const phi = Math.acos(-1 + (2 * i) / skills.length)
      const theta = Math.sqrt(skills.length * Math.PI) * phi
      return new THREE.Vector3(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      )
    })
  }, [skills, radius])

  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * 0.05
    groupRef.current.rotation.x += delta * 0.02
  })

  const categoryColors: Record<string, string> = {
    languages: '#6366f1',
    ml: '#8b5cf6',
    llm: '#a78bfa',
    web: '#818cf8',
    cloud: '#c4b5fd',
  }

  return (
    <group ref={groupRef}>
      {skills.map((skill, i) => (
        <Float key={skill.name} speed={0.5} rotationIntensity={0} floatIntensity={0.3}>
          <Text
            position={positions[i]}
            fontSize={0.25 + skill.level * 0.15}
            color={categoryColors[skill.category] || '#6366f1'}
            anchorX="center"
            anchorY="middle"
          >
            {skill.name}
          </Text>
        </Float>
      ))}
    </group>
  )
}
