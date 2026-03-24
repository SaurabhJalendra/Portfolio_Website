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
    // Hero staggered entrance
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.fromTo('.hero-greeting', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 })
      .fromTo('.hero-word', { opacity: 0, y: 40, rotateX: -15 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.08 }, '-=0.2')
      .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
      .fromTo('.hero-bio', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .fromTo('.hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.2')

    // Blog feed entrance — diagonal slide with scale
    gsap.fromTo('.blog-entry',
      { opacity: 0, y: 30, x: -20, scale: 0.98 },
      { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.blog-feed', start: 'top 85%', toggleActions: 'play none none none' },
      }
    )
  }, { scope: containerRef })

  const nameWords = personalInfo.name.split(' ')

  return (
    <div ref={containerRef}>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center px-6 md:px-12 lg:px-24 z-10 dot-grid-bg">
        <div className="max-w-4xl">
          <p className="hero-greeting text-sm text-muted font-mono mb-6 opacity-0">
            Welcome to
          </p>
          <h1 className="mb-4" style={{ perspective: '800px' }}>
            {nameWords.map((word, i) => (
              <span
                key={i}
                className="hero-word inline-block text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter text-text-light opacity-0 mr-4 md:mr-6"
                style={{ transformOrigin: 'bottom left' }}
              >
                {word}
              </span>
            ))}
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl lg:text-3xl font-display animated-gradient-text mb-8 opacity-0">
            Thoughts on AI, Research &amp; Engineering
          </p>
          <p className="hero-bio text-muted text-lg max-w-xl leading-relaxed mb-10 opacity-0">
            Exploring reinforcement learning, world models, and the future of
            intelligent systems. Building at the intersection of research and engineering.
          </p>
          <div className="flex gap-4">
            <a
              href="#posts"
              className="hero-cta px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 btn-press opacity-0"
            >
              Read Posts
            </a>
            <Link
              to="/portfolio"
              className="hero-cta px-6 py-3 rounded-full border border-white/20 text-text-light hover:border-primary hover:text-primary transition-all duration-300 btn-press opacity-0"
            >
              Portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* Blog feed */}
      <section id="posts" className="px-6 md:px-12 lg:px-24 py-24 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-text-light mb-12">
            Recent Posts
          </h2>

          {blogPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted text-lg mb-2">No posts yet.</p>
              <p className="text-muted/60 text-sm">First post coming soon.</p>
            </div>
          ) : (
            <div className="blog-feed space-y-6">
              {blogPosts.map((post, i) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="blog-entry group block p-6 md:p-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm card-hover-lift opacity-1"
                >
                  <div className="flex items-start gap-4 md:gap-6">
                    {/* Number */}
                    <span className="text-3xl md:text-4xl font-display font-bold text-white/10 group-hover:text-primary/25 transition-colors duration-300 shrink-0 leading-none mt-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <time className="text-xs font-mono text-primary">{post.date}</time>
                        <span className="text-xs text-muted">{post.readTime}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-display font-semibold text-text-light group-hover:text-primary transition-colors duration-200 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-muted leading-relaxed mb-4 line-clamp-2">{post.summary}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span key={tag} className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary/70">
                              {tag}
                            </span>
                          ))}
                        </div>
                        {/* Arrow */}
                        <svg
                          className="w-5 h-5 text-muted group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 shrink-0"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
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
