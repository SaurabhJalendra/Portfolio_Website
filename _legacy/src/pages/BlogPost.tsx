import { useParams, Link, Navigate } from 'react-router-dom'
import { useRef, useEffect } from 'react'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { blogPosts } from '../data/blog'
import { MarkdownWithViz } from '../components/ui/visualizations/MarkdownWithViz'

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = blogPosts.find((p) => p.slug === slug)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Use ref for progress bar — avoids re-rendering the entire page on scroll
  useEffect(() => {
    const updateProgress = () => {
      if (!progressRef.current) return
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0
      progressRef.current.style.transform = `scaleX(${progress})`
    }
    window.addEventListener('scroll', updateProgress, { passive: true })
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  useGSAP(() => {
    gsap.fromTo('.blog-header',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    )
    gsap.fromTo('.blog-body',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' }
    )
  }, { scope: containerRef })

  if (!post) {
    return <Navigate to="/" replace />
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-white">
      {/* Reading progress — uses ref, no state, no re-renders */}
      <div
        ref={progressRef}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 2,
          background: '#2563eb',
          transformOrigin: 'left', transform: 'scaleX(0)',
          zIndex: 101, pointerEvents: 'none',
        }}
      />

      <article className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="blog-header mb-12">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {post.readTime}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-6">{post.summary}</p>

            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Content */}
          <div className="blog-body prose prose-lg max-w-none">
            {post.content && post.content.trim() !== '' ? (
              <MarkdownWithViz content={post.content} />
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">Coming soon. This post is still being written.</p>
              </div>
            )}
          </div>

          {/* Back to blog */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to all posts
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
