import { personalInfo } from '../../data/personal'

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted">{new Date().getFullYear()} {personalInfo.name}. Built with React Three Fiber.</p>
        <div className="flex items-center gap-6">
          <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-text-light transition-colors">GitHub</a>
          <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-text-light transition-colors">LinkedIn</a>
          <a href={`mailto:${personalInfo.email}`} className="text-sm text-muted hover:text-text-light transition-colors">Email</a>
        </div>
      </div>
    </footer>
  )
}
