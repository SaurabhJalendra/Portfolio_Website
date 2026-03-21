import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'

const navItems = [
  { label: 'Blog', href: '/' },
  { label: 'Portfolio', href: '/portfolio' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-background-dark/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        <Link to="/" className="font-display font-bold text-lg tracking-tight text-text-light">
          SJ
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'text-sm transition-colors duration-200',
                location.pathname === item.href ? 'text-primary' : 'text-muted hover:text-text-light'
              )}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="/cv.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
          >
            Resume
          </a>
        </div>

        <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={cn('w-6 h-0.5 bg-text-light transition-transform', menuOpen && 'rotate-45 translate-y-2')} />
          <span className={cn('w-6 h-0.5 bg-text-light transition-opacity', menuOpen && 'opacity-0')} />
          <span className={cn('w-6 h-0.5 bg-text-light transition-transform', menuOpen && '-rotate-45 -translate-y-2')} />
        </button>
      </div>

      <div className={cn('md:hidden overflow-hidden transition-all duration-300 bg-background-dark/95 backdrop-blur-xl', menuOpen ? 'max-h-96' : 'max-h-0')}>
        <ul className="flex flex-col gap-4 px-6 py-6">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
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
            <a
              href="/cv.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg text-primary"
            >
              Resume
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}
