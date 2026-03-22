import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'
import gsap from 'gsap'

const navItems = [
  { label: 'Blog', href: '/' },
  { label: 'Portfolio', href: '/portfolio' },
]

export function Navbar() {
  const [scrollY, setScrollY] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const mobileMenuRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Mobile menu stagger animation
  useEffect(() => {
    if (menuOpen && mobileMenuRef.current) {
      gsap.fromTo(
        mobileMenuRef.current.children,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power3.out' }
      )
    }
  }, [menuOpen])

  const blurAmount = Math.min(scrollY / 5, 20)
  const bgOpacity = Math.min(scrollY / 200, 0.8)
  const borderOpacity = Math.min(scrollY / 300, 0.05)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-[border-color] duration-300"
      style={{
        backdropFilter: `blur(${blurAmount}px)`,
        WebkitBackdropFilter: `blur(${blurAmount}px)`,
        backgroundColor: `rgba(10, 10, 10, ${bgOpacity})`,
        borderBottom: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        <Link
          to="/"
          className="font-display font-bold text-lg text-text-light tracking-tight hover:tracking-wide transition-all duration-300"
        >
          SJ
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'relative text-sm transition-colors duration-200 link-hover-underline py-1',
                location.pathname === item.href ? 'text-text-light' : 'text-muted hover:text-text-light'
              )}
            >
              {item.label}
              {location.pathname === item.href && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          ))}
          <a
            href="/cv.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 btn-press"
          >
            Resume
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={cn('w-6 h-0.5 bg-text-light transition-all duration-300', menuOpen && 'rotate-45 translate-y-2')} />
          <span className={cn('w-6 h-0.5 bg-text-light transition-all duration-300', menuOpen && 'opacity-0')} />
          <span className={cn('w-6 h-0.5 bg-text-light transition-all duration-300', menuOpen && '-rotate-45 -translate-y-2')} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          menuOpen ? 'max-h-96' : 'max-h-0'
        )}
        style={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(20px)' }}
      >
        <ul ref={mobileMenuRef} className="flex flex-col gap-4 px-6 py-6">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'text-lg transition-colors',
                  location.pathname === item.href ? 'text-primary' : 'text-text-light'
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <a href="/cv.pdf" target="_blank" rel="noopener noreferrer" className="text-lg text-muted hover:text-text-light">
              Resume
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}
