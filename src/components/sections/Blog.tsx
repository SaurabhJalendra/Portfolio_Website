import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SectionHeading } from '../ui/SectionHeading'
import { BlogCard } from '../ui/BlogCard'
import { blogPosts } from '../../data/blog'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function Blog() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from('.blog-card', {
      y: 40, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.blog-grid', start: 'top 80%' },
    })
  }, { scope: containerRef })

  if (blogPosts.length === 0) {
    return (
      <section ref={containerRef} id="blog" className="section-padding relative z-10">
        <div className="max-w-5xl mx-auto">
          <SectionHeading number="05" title="Blog" />
          <p className="text-muted text-center py-12">
            Blog posts are auto-generated daily. Check back soon!
          </p>
        </div>
      </section>
    )
  }

  return (
    <section ref={containerRef} id="blog" className="section-padding relative z-10">
      <div className="max-w-5xl mx-auto">
        <SectionHeading number="05" title="Blog" />
        <div className="blog-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}
