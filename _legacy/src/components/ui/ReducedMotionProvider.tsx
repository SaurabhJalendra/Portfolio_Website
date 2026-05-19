import { createContext, useContext, type ReactNode } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const ReducedMotionContext = createContext(false)

export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion()
  return (
    <ReducedMotionContext.Provider value={prefersReducedMotion}>
      {children}
    </ReducedMotionContext.Provider>
  )
}

export function useMotionSafe() {
  return !useContext(ReducedMotionContext)
}
