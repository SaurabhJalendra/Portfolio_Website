import type { Project } from '../../types'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="project-card border border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold">{project.title}</h3>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed mb-3">
        {project.featured ? project.longDescription : project.description}
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {project.tech.map((t) => (
          <span key={t} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">{t}</span>
        ))}
      </div>
      {project.github && (
        <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:text-blue-700">
          View on GitHub →
        </a>
      )}
    </div>
  )
}
