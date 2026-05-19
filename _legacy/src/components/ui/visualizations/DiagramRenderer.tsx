import { useEffect, useRef, useState, useId } from 'react'
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
  const reactId = useId()
  const renderCount = useRef(0)

  useEffect(() => {
    // Generate unique ID for each render to avoid Mermaid ID collisions
    renderCount.current += 1
    const id = `mermaid-${reactId.replace(/:/g, '')}-${renderCount.current}`

    let cancelled = false

    const render = async () => {
      try {
        // Remove any previous render artifacts
        const existing = document.getElementById(id)
        if (existing) existing.remove()

        const { svg: renderedSvg } = await mermaid.render(id, content.trim())
        if (!cancelled) setSvg(renderedSvg)
      } catch (e) {
        console.error('Mermaid render error:', e)
        if (!cancelled) setSvg(`<pre style="color: #dc2626; font-size: 14px; white-space: pre-wrap;">${content}</pre>`)
      }
    }

    render()

    return () => {
      cancelled = true
    }
  }, [content, reactId])

  return (
    <div
      ref={containerRef}
      className="my-8 p-6 bg-gray-50 border border-gray-200 overflow-x-auto flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
