import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { personalInfo } from '../data/personal'
import { blogPosts } from '../data/blog'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function Home() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo('.blog-entry',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.blog-feed', start: 'top 85%', toggleActions: 'play none none none' },
      }
    )
  }, { scope: containerRef })

  return (
    <div ref={containerRef}>
      {/* Hero section */}
      <section className="relative min-h-screen flex items-center px-6 md:px-12 lg:px-24 z-10">
        <div className="max-w-3xl">
          <p className="text-sm text-muted font-mono mb-4">Welcome to</p>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-4 text-text-light">
            {personalInfo.name}
          </h1>
          <p className="text-xl md:text-2xl font-display gradient-text mb-6">
            Thoughts on AI, Research & Engineering
          </p>
          <p className="text-muted text-lg max-w-xl leading-relaxed mb-8">
            Exploring reinforcement learning, world models, and the future of intelligent systems.
            Building at the intersection of research and engineering.
          </p>
          <div className="flex gap-4">
            <a href="#posts" className="px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
              Read Posts
            </a>
            <Link to="/portfolio" className="px-6 py-3 rounded-full border border-text-light/20 text-text-light hover:border-primary hover:text-primary transition-colors">
              Portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* Blog feed */}
      <section id="posts" className="px-6 md:px-12 lg:px-24 py-24 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-text-light mb-12">Recent Posts</h2>

          {blogPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted text-lg mb-2">No posts yet.</p>
              <p className="text-muted/60 text-sm">First post coming soon.</p>
            </div>
          ) : (
            <div className="blog-feed space-y-6">
              {blogPosts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="blog-entry group block p-6 md:p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/30 hover:bg-white/[0.08] transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <time className="text-xs font-mono text-primary">{post.date}</time>
                    <span className="text-xs text-muted">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-semibold text-text-light group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h3>
                  <p className="text-muted leading-relaxed mb-4">{post.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
