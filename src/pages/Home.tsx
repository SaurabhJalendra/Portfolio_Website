import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { blogPosts } from '../data/blog'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const postsWithContent = blogPosts.filter(p => p.content && p.content.trim() !== '')

  useGSAP(() => {
    gsap.fromTo('.hero-content',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    )
    gsap.fromTo('.blog-article',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: '.blog-feed', start: 'top 85%', toggleActions: 'play none none none' },
      }
    )
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="min-h-screen bg-white">
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="hero-content">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
              Saurabh Jalendra
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl leading-relaxed">
              AI/ML Researcher · MTech Student at BITS Pilani · Co-Founder at SKY AI
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mt-4 leading-relaxed">
              Exploring reinforcement learning, world models, and the future of programming.
              Building at the intersection of research and engineering.
            </p>
          </div>
        </section>

        {/* Blog Feed */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-2">Latest Writing</h2>
            <p className="text-gray-600">Deep technical ideas and research insights</p>
          </div>

          {postsWithContent.length === 0 ? (
            <p className="text-gray-500 text-center py-16">No posts yet. Check back soon.</p>
          ) : (
            <div className="blog-feed space-y-8">
              {postsWithContent.map((post) => (
                <article key={post.slug} className="blog-article group">
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="border border-gray-200 hover:border-gray-400 transition-all p-8 bg-white hover:shadow-lg hover:shadow-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {post.readTime}
                        </span>
                      </div>

                      <h3 className="text-2xl font-semibold mb-3 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-gray-600 leading-relaxed mb-4">{post.summary}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <span className="text-blue-600 flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
                          Read more
                          <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
