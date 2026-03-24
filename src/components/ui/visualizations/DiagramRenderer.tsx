import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  themeVariables: {
    primaryColor: '#2563eb',
    primaryTextColor: '#1f2937',
    primaryBorderColor: '#3b82f6',
    lineColor: '#6b7280',
    secondaryColor: '#eff6ff',
    tertiaryColor: '#f9fafb',
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
      className="my-8 p-6 bg-gray-50 border border-gray-200 overflow-x-auto flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
