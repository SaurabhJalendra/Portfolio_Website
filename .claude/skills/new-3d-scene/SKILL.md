---
name: new-3d-scene
description: Scaffold a new R3F 3D scene component with proper cleanup, performance patterns, and TypeScript types
---

# Create New 3D Scene Component

When invoked, create a new React Three Fiber 3D scene component following project conventions.

## Usage
`/new-3d-scene <ComponentName> [description]`

## Steps

1. Ask for the component name if not provided
2. Create the component file at `src/components/3d/<ComponentName>.tsx`
3. Include the following boilerplate:

```tsx
import { forwardRef, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { type Group } from 'three'

export interface <ComponentName>Props {
  // Add props here
}

export const <ComponentName> = forwardRef<Group, <ComponentName>Props>(
  function <ComponentName>(props, ref) {
    const groupRef = useRef<Group>(null!)

    // Use delta time, never Date.now()
    useFrame((state, delta) => {
      // Animation logic using refs, not state
    })

    return (
      <group ref={ref || groupRef} {...props}>
        {/* 3D content */}
      </group>
    )
  }
)
```

## Rules
- Always use `forwardRef` for GSAP animation compatibility
- Always use `useRef` for animation state (never useState inside useFrame)
- Include proper TypeScript interface for props
- Add cleanup in useEffect if creating geometries/materials/textures
- Use drei abstractions before raw Three.js
- Keep the component focused on one visual element
