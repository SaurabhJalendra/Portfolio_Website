import { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setHiding(true)
          setTimeout(onComplete, 800)
          return 100
        }
        return Math.min(prev + Math.random() * 15, 100)
      })
    }, 100)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-700',
        hiding && 'opacity-0 pointer-events-none'
      )}
    >
      <h1 className="text-2xl font-display font-bold tracking-tight mb-8">SJ</h1>
      <div className="w-48 h-[2px] bg-muted/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className="mt-4 text-sm text-muted font-mono">{Math.min(Math.round(progress), 100)}%</p>
    </div>
  )
}
