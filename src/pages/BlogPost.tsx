import { useParams, Link } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import { blogPosts } from '../data/blog'
import { MarkdownWithViz } from '../components/ui/visualizations/MarkdownWithViz'

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = blogPosts.find((p) => p.slug === slug)
  const articleRef = useRef<HTMLElement>(null)
  const [readProgress, setReadProgress] = useState(0)

  // Reading progress bar
  useEffect(() => {
    const updateProgress = () => {
      if (!articleRef.current) return
      const articleTop = articleRef.current.offsetTop
      const articleHeight = articleRef.current.offsetHeight
      const windowHeight = window.innerHeight
      const scrollY = window.scrollY

      const progress = Math.max(0, Math.min(1,
        (scrollY - articleTop + windowHeight * 0.3) / (articleHeight - windowHeight * 0.5)
      ))
      setReadProgress(progress)
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-text-light mb-4">Post not found</h1>
          <Link to="/" className="text-primary hover:underline">Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Reading progress */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
          transformOrigin: 'left', transform: `scaleX(${readProgress})`,
          zIndex: 101, pointerEvents: 'none',
        }}
      />

      <article ref={articleRef} className="relative z-10 px-6 md:px-12 pt-28 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <Link
            to="/"
            className="group text-sm text-muted hover:text-primary transition-colors mb-8 inline-flex items-center gap-2 link-hover-underline"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          {/* Header */}
          <header className="mt-6 mb-12">
            <div className="flex items-center gap-3 mb-4">
              <time className="text-sm font-mono text-primary">{post.date}</time>
              <span className="text-sm text-muted">{post.readTime}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-text-light leading-[1.1] tracking-tight mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs font-mono px-3 py-1 rounded-full bg-primary/10 text-primary/70">
                  {tag}
                </span>
              ))}
            </div>
            {/* Decorative gradient line */}
            <div className="h-px bg-gradient-to-r from-primary/50 via-secondary/30 to-transparent" />
          </header>

          {/* Content */}
          <div className="blog-content">
            <MarkdownWithViz content={'content' in post ? post.content : ''} />
          </div>
        </div>
      </article>
    </>
  )
}
