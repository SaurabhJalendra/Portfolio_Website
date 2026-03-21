import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface BlogModalProps {
  post: { title: string; date: string; tags: string[]; readTime: string; content: string } | null
  onClose: () => void
}

export function BlogModal({ post, onClose }: BlogModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (post) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [post])

  if (!post) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal content */}
      <article
        className="relative bg-background rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 md:p-12 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-text/5 transition-colors text-muted hover:text-text"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <time className="text-sm font-mono text-primary">{post.date}</time>
            <span className="text-sm text-muted">{post.readTime}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">{post.title}</h2>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary/70">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Markdown content */}
        <div className="prose prose-zinc max-w-none prose-headings:font-display prose-a:text-primary prose-code:text-primary/80 prose-pre:bg-background-dark prose-pre:text-text-light">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  )
}
