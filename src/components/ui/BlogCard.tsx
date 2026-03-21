import type { BlogPost } from '../../types'

interface BlogCardProps {
  post: Omit<BlogPost, 'content'>
  onClick?: () => void
}

export function BlogCard({ post, onClick }: BlogCardProps) {
  return (
    <article
      className="blog-card group p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/30 transition-all duration-300 cursor-pointer"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}
    >
      <div className="flex items-center gap-3 mb-3">
        <time className="text-xs font-mono text-primary">{post.date}</time>
        <span className="text-xs text-muted">{post.readTime}</span>
      </div>
      <h3 className="text-lg font-display font-semibold mb-2 group-hover:text-primary transition-colors">
        {post.title}
      </h3>
      <p className="text-sm text-muted leading-relaxed mb-4">{post.summary}</p>
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span key={tag} className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary/70">
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}
