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
            <pre className="p-4 rounded-xl bg-white/5 border border-white/10 overflow-x-auto">
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
              <code className="text-sm font-mono text-text-light">{children}</code>
            )
          }

          // Inline code
          return (
            <code className="px-1.5 py-0.5 rounded bg-white/10 text-primary/80 text-sm font-mono">
              {children}
            </code>
          )
        },

        // Style other markdown elements for dark theme
        h1: ({ children }) => <h1 className="text-3xl font-display font-bold text-text-light mt-10 mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-2xl font-display font-bold text-text-light mt-8 mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-xl font-display font-semibold text-text-light mt-6 mb-2">{children}</h3>,
        p: ({ children }) => <p className="text-muted leading-relaxed mb-4">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-muted mb-4 ml-4">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-muted mb-4 ml-4">{children}</ol>,
        li: ({ children }) => <li className="text-muted leading-relaxed">{children}</li>,
        a: ({ href, children }) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
        blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/50 pl-4 italic text-muted/80 my-4">{children}</blockquote>,
        strong: ({ children }) => <strong className="text-text-light font-semibold">{children}</strong>,
        hr: () => <hr className="border-white/10 my-8" />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
