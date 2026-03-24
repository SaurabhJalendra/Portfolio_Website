import type { ReactNode } from 'react'
import { isValidElement, Children } from 'react'
import ReactMarkdown from 'react-markdown'
import { ChartRenderer } from './ChartRenderer'
import { DiagramRenderer } from './DiagramRenderer'

interface MarkdownWithVizProps {
  content: string
}

/**
 * Extract the language class from a code element's props.
 * Returns the language string (e.g. "chart:bar") or empty string.
 */
function getCodeLanguage(child: ReactNode): string {
  if (isValidElement(child)) {
    const props = child.props as Record<string, unknown>
    const className = props.className as string | undefined
    return className?.replace('language-', '') ?? ''
  }
  return ''
}

/**
 * Check whether a code block language represents a visualization.
 */
function isVisualizationLang(lang: string): boolean {
  return lang.startsWith('chart:') || lang === 'diagram' || lang === 'mermaid'
}

export function MarkdownWithViz({ content }: MarkdownWithVizProps) {
  return (
    <ReactMarkdown
      components={{
        // Override pre to pass through visualization blocks without a <pre> wrapper
        pre({ children }) {
          const child = Children.toArray(children)[0]
          const lang = getCodeLanguage(child)

          // For visualization code blocks, render children directly (no <pre> wrapper)
          if (isVisualizationLang(lang)) {
            return <>{children}</>
          }

          return (
            <pre className="p-4 bg-gray-50 border border-gray-200 overflow-x-auto">
              {children}
            </pre>
          )
        },

        code({ className, children }) {
          const codeContent = String(children).replace(/\n$/, '')
          const lang = className?.replace('language-', '') ?? ''

          // Chart code blocks: chart:bar, chart:line, chart:area
          if (lang.startsWith('chart:')) {
            const chartType = lang.split(':')[1]
            return <ChartRenderer content={codeContent} chartType={chartType} />
          }

          // Mermaid diagram code blocks
          if (lang === 'diagram' || lang === 'mermaid') {
            return <DiagramRenderer content={codeContent} />
          }

          // Block code (has a language class) — styled inside the <pre> from above
          if (className) {
            return (
              <code className="text-sm font-mono text-gray-900">{children}</code>
            )
          }

          // Inline code
          return (
            <code className="px-1.5 py-0.5 rounded bg-gray-100 text-blue-600 text-sm font-mono">
              {children}
            </code>
          )
        },

        // Style markdown elements for light theme
        h1: ({ children }) => <h1 className="text-3xl font-bold text-black mt-10 mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-2xl font-bold text-black mt-8 mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-xl font-semibold text-black mt-6 mb-2">{children}</h3>,
        p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4 ml-4">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-gray-700 mb-4 ml-4">{children}</ol>,
        li: ({ children }) => <li className="text-gray-700 leading-relaxed">{children}</li>,
        a: ({ href, children }) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
        blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-600 bg-blue-50 p-6 italic text-gray-700 my-4">{children}</blockquote>,
        strong: ({ children }) => <strong className="text-black font-semibold">{children}</strong>,
        hr: () => <hr className="border-gray-200 my-8" />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
