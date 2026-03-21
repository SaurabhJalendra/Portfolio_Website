import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { blogPosts } from '../data/blog'

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = blogPosts.find((p) => p.slug === slug)

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
    <article className="relative z-10 px-6 md:px-12 pt-28 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link to="/" className="text-sm text-muted hover:text-primary transition-colors mb-8 inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>

        {/* Header */}
        <header className="mt-6 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <time className="text-sm font-mono text-primary">{post.date}</time>
            <span className="text-sm text-muted">{post.readTime}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-text-light leading-tight mb-6">
            {post.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs font-mono px-3 py-1 rounded-full bg-primary/10 text-primary/70">
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:text-text-light prose-p:text-muted prose-a:text-primary prose-strong:text-text-light prose-code:text-primary/80 prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  )
}
