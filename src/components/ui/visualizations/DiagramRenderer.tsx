import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#6366f1',
    primaryTextColor: '#f4f4f5',
    primaryBorderColor: '#8b5cf6',
    lineColor: '#71717a',
    secondaryColor: '#1a1a2e',
    tertiaryColor: '#0a0a0a',
    fontSize: '14px',
  },
})

export function DiagramRenderer({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState('')
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 9)}`)

  useEffect(() => {
    const render = async () => {
      try {
        const { svg: renderedSvg } = await mermaid.render(idRef.current, content.trim())
        setSvg(renderedSvg)
      } catch (e) {
        console.error('Mermaid render error:', e)
        setSvg(`<pre style="color: #ef4444">${content}</pre>`)
      }
    }
    render()
  }, [content])

  return (
    <div
      ref={containerRef}
      className="my-8 p-6 rounded-2xl border border-white/10 bg-white/5 overflow-x-auto flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
