export function AmbientBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '60vw', height: '60vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          animation: 'float-glow 25s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: '-30%', left: '-20%',
          width: '70vw', height: '70vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)',
          animation: 'float-glow 30s ease-in-out infinite reverse',
        }}
      />
    </div>
  )
}
