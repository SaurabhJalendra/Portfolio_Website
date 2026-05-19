import type { Experience } from '../types'

export const experiences: Experience[] = [
  {
    id: 'sky-ai',
    role: 'Co-Founder & AI Lead',
    company: 'SKY AI',
    location: 'Jaipur, India',
    period: 'Oct 2024 — Present',
    description: [
      'Built Klares: Document intelligence platform for Hong Kong finance with DDQ autofill (LlamaIndex RAG), SBERT categorization, pgvector knowledge base with cross-encoder re-ranking.',
      'Led International Citizen: AI-powered portfolio management with automated statement extraction, multi-currency aggregation, and conversational AI assistant.',
    ],
    tech: ['LlamaIndex', 'SBERT', 'pgvector', 'FastAPI', 'Next.js', 'PostgreSQL'],
  },
  {
    id: 'isro',
    role: 'Research Intern',
    company: 'ISRO (National Remote Sensing Centre)',
    location: 'Jodhpur, India',
    period: 'Feb 2017 — Jun 2017',
    description: [
      'Developed VR heritage visualization application using Unity deployed on Oculus Rift and HTC Vive.',
      'Built photogrammetry pipeline with Meshroom generating high-fidelity 3D models from aerial drone imagery.',
    ],
    tech: ['Unity', 'C#', 'Oculus SDK', 'Meshroom', 'Photogrammetry'],
  },
]
