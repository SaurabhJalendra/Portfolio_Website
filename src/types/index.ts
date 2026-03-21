export interface Project {
  id: string
  title: string
  description: string
  longDescription: string
  tech: string[]
  github?: string
  live?: string
  image?: string
  featured: boolean
  category: 'research' | 'fullstack' | 'ml' | 'agents'
}

export interface Experience {
  id: string
  role: string
  company: string
  location: string
  period: string
  description: string[]
  tech: string[]
}

export interface Skill {
  name: string
  category: 'languages' | 'ml' | 'llm' | 'web' | 'cloud'
  level: number
}

export interface BlogPost {
  slug: string
  title: string
  date: string
  tags: string[]
  summary: string
  readTime: string
  content: string
}

export interface PersonalInfo {
  name: string
  title: string
  email: string
  location: string
  bio: string
  github: string
  linkedin: string
  resumeUrl: string
}
