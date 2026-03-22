import { personalInfo } from '../../data/personal'

export function Footer() {
  return (
    <footer className="relative py-8 px-6 md:px-12">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted">{new Date().getFullYear()} {personalInfo.name}. Built with React & GSAP.</p>
        <div className="flex items-center gap-6">
          <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-text-light transition-colors link-hover-underline">GitHub</a>
          <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-text-light transition-colors link-hover-underline">LinkedIn</a>
          <a href={`mailto:${personalInfo.email}`} className="text-sm text-muted hover:text-text-light transition-colors link-hover-underline">Email</a>
        </div>
      </div>
    </footer>
  )
}
