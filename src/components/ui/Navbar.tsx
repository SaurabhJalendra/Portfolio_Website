import { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact', href: '#contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-text/5' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        <a href="#" className="font-display font-bold text-lg tracking-tight">SJ</a>

        <ul className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.href}>
              <button onClick={() => handleClick(item.href)} className="text-sm text-muted hover:text-text transition-colors duration-200">
                {item.label}
              </button>
            </li>
          ))}
          <li>
            <a href="/cv.pdf" target="_blank" rel="noopener noreferrer" className="text-sm px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200">
              Resume
            </a>
          </li>
        </ul>

        <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={cn('w-6 h-0.5 bg-text transition-transform', menuOpen && 'rotate-45 translate-y-2')} />
          <span className={cn('w-6 h-0.5 bg-text transition-opacity', menuOpen && 'opacity-0')} />
          <span className={cn('w-6 h-0.5 bg-text transition-transform', menuOpen && '-rotate-45 -translate-y-2')} />
        </button>
      </div>

      <div className={cn('md:hidden overflow-hidden transition-all duration-300 bg-background/95 backdrop-blur-xl', menuOpen ? 'max-h-96' : 'max-h-0')}>
        <ul className="flex flex-col gap-4 px-6 py-6">
          {navItems.map((item) => (
            <li key={item.href}>
              <button onClick={() => handleClick(item.href)} className="text-lg text-text">{item.label}</button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
