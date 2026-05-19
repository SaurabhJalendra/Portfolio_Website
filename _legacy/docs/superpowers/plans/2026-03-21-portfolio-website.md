# 3D Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a visually stunning, 3D-heavy personal portfolio for Saurabh Jalendra at saurabhjalendra.com — clean minimal design with bold React Three Fiber scenes, GSAP scroll-driven animations, and an auto-generated daily blog.

**Architecture:** Single-page app with a persistent R3F `<Canvas>` overlay for 3D scenes, GSAP ScrollTrigger driving section transitions, Lenis for smooth scroll, and HTML sections rendered beneath the canvas. Data lives in typed constants. Blog posts are markdown files parsed at build time.

**Tech Stack:** Vite 6, React 19, TypeScript, React Three Fiber + Drei, GSAP + ScrollTrigger + @gsap/react, Lenis, Tailwind CSS 4, gray-matter + react-markdown for blog.

---

## File Structure

```
public/
  CNAME                          # Custom domain: saurabhjalendra.com
  favicon.svg                    # SVG favicon
  og-image.png                   # Open Graph preview image (1200x630)

src/
  main.tsx                       # Entry point, render App
  App.tsx                        # Root: Canvas + Layout + Sections
  vite-env.d.ts                  # Vite type declarations

  components/
    3d/
      HeroScene.tsx              # Hero 3D scene (morphing icosahedron + particles)
      FloatingNodes.tsx           # Neural network node cluster (reusable)
      SkillSphere.tsx             # Interactive 3D skill tag cloud sphere
      ParticleField.tsx           # Background particle system
      SceneManager.tsx            # Manages which 3D scene is active based on scroll
    ui/
      Navbar.tsx                  # Fixed top nav with scroll progress
      Preloader.tsx               # Loading screen with progress bar
      SectionHeading.tsx          # Reusable animated section heading
      ProjectCard.tsx             # 2D project card (HTML overlay for detail)
      BlogCard.tsx                # Blog post preview card
      ContactForm.tsx             # Contact form component
      Footer.tsx                  # Site footer
      ReducedMotionProvider.tsx   # Context for prefers-reduced-motion
    sections/
      Hero.tsx                    # Hero section (name, title, CTA)
      About.tsx                   # About + Education timeline
      Experience.tsx              # Work experience cards
      Projects.tsx                # Project gallery section
      Skills.tsx                  # Skills visualization section
      Blog.tsx                    # Blog listing section
      Contact.tsx                 # Contact section

  hooks/
    useScrollProgress.ts         # Returns 0-1 scroll progress for a ref
    useSmoothScroll.ts           # Lenis initialization + GSAP integration
    useMediaQuery.ts             # Responsive breakpoint hook
    useReducedMotion.ts          # prefers-reduced-motion detection

  data/
    projects.ts                  # Project data (title, desc, tech, links, image)
    experience.ts                # Work experience entries
    skills.ts                    # Skills with categories
    personal.ts                  # Name, bio, links, contact info
    blog/
      index.ts                   # Blog post metadata index

  utils/
    cn.ts                        # clsx + tailwind-merge utility

  styles/
    globals.css                  # Tailwind directives + custom CSS vars + fonts

  types/
    index.ts                     # Shared TypeScript types
```

---

### Task 1: Scaffold Vite + React + TypeScript Project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `src/styles/globals.css`, `public/CNAME`, `public/robots.txt`

- [ ] **Step 1: Create Vite project with React TypeScript template**

```bash
cd "D:/Git Repos/Portfolio_Website"
npm create vite@latest . -- --template react-ts
```

If prompted about existing files, choose to proceed (the existing config files won't conflict).

- [ ] **Step 2: Install core dependencies**

```bash
npm install three @react-three/fiber @react-three/drei gsap @gsap/react lenis clsx tailwind-merge react-markdown gray-matter @fontsource/inter @fontsource/space-grotesk
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D @types/three tailwindcss @tailwindcss/vite prettier eslint
```

- [ ] **Step 4: Configure Vite for GitHub Pages**

Replace `vite.config.ts` with:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',  // Custom domain, so root path
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr'],
})
```

- [ ] **Step 5: Set up Tailwind CSS 4 globals**

Write `src/styles/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-background: #fafafa;
  --color-background-dark: #0a0a0a;
  --color-primary: #6366f1;
  --color-secondary: #8b5cf6;
  --color-text: #18181b;
  --color-text-light: #f4f4f5;
  --color-muted: #71717a;
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
}

@layer base {
  html {
    scroll-behavior: auto; /* Lenis handles smooth scroll */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply bg-background text-text font-body;
    overflow-x: hidden;
  }

  ::selection {
    @apply bg-primary/20 text-primary;
  }
}

@layer components {
  .section-padding {
    @apply px-6 md:px-12 lg:px-24 py-24 md:py-32;
  }

  .gradient-text {
    @apply bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent;
  }
}
```

- [ ] **Step 6: Set up entry point**

Write `src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import { App } from './App'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Write `src/App.tsx` (placeholder):

```tsx
export function App() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-primary p-8">
        Saurabh Jalendra — Portfolio
      </h1>
    </div>
  )
}
```

- [ ] **Step 7: Create CNAME for custom domain**

Write `public/CNAME`:
```
saurabhjalendra.com
```

- [ ] **Step 7b: Create robots.txt**

Write `public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://saurabhjalendra.com/sitemap.xml
```

- [ ] **Step 8: Update index.html with SEO meta tags**

Replace `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Saurabh Jalendra — AI/ML Researcher & Engineer. MTech AI/ML at BITS Pilani. Co-Founder at SKY AI." />
    <meta property="og:title" content="Saurabh Jalendra — AI/ML Researcher & Engineer" />
    <meta property="og:description" content="Portfolio showcasing AI/ML research, full-stack projects, and creative engineering." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://saurabhjalendra.com" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta property="og:image" content="https://saurabhjalendra.com/og-image.png" />
    <title>Saurabh Jalendra — AI/ML Researcher & Engineer</title>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Saurabh Jalendra",
      "url": "https://saurabhjalendra.com",
      "jobTitle": "AI/ML Researcher & Engineer",
      "alumniOf": "BITS Pilani",
      "sameAs": ["https://github.com/SaurabhJalendra", "https://linkedin.com/in/saurabhjalendra"]
    }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Verify dev server runs**

```bash
npm run dev
```

Expected: Vite dev server starts, page shows "Saurabh Jalendra — Portfolio" with indigo text.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TS project with Tailwind, R3F, GSAP deps"
```

---

### Task 2: Core Infrastructure — Utilities, Types, Hooks

**Files:**
- Create: `src/utils/cn.ts`, `src/types/index.ts`, `src/hooks/useReducedMotion.ts`, `src/hooks/useMediaQuery.ts`, `src/hooks/useSmoothScroll.ts`, `src/hooks/useScrollProgress.ts`, `src/components/ui/ReducedMotionProvider.tsx`

- [ ] **Step 1: Create utility function**

Write `src/utils/cn.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Create shared types**

Write `src/types/index.ts`:

```typescript
export interface Project {
  id: string
  title: string
  description: string
  longDescription: string
  tech: string[]
  github?: string
  live?: string
  image: string
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
  level: number // 0-1
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
```

- [ ] **Step 3: Create reduced motion hook**

Write `src/hooks/useReducedMotion.ts`:

```typescript
import { useState, useEffect } from 'react'

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mql.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}
```

- [ ] **Step 4: Create media query hook**

Write `src/hooks/useMediaQuery.ts`:

```typescript
import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}
```

- [ ] **Step 5: Create smooth scroll hook (Lenis + GSAP)**

Write `src/hooks/useSmoothScroll.ts`:

```typescript
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    })

    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const update = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [])

  return lenisRef
}
```

- [ ] **Step 6: Create scroll progress hook**

Write `src/hooks/useScrollProgress.ts`:

```typescript
import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export function useScrollProgress() {
  const ref = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)

  useGSAP(() => {
    if (!ref.current) return

    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => setProgress(self.progress),
    })
  }, { dependencies: [] })

  return { ref, progress }
}
```

- [ ] **Step 7: Create ReducedMotionProvider**

Write `src/components/ui/ReducedMotionProvider.tsx`:

```tsx
import { createContext, useContext, type ReactNode } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const ReducedMotionContext = createContext(false)

export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion()
  return (
    <ReducedMotionContext.Provider value={prefersReducedMotion}>
      {children}
    </ReducedMotionContext.Provider>
  )
}

export function useMotionSafe() {
  return !useContext(ReducedMotionContext)
}
```

- [ ] **Step 8: Verify build succeeds**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 9: Commit**

```bash
git add src/utils/ src/types/ src/hooks/ src/components/ui/ReducedMotionProvider.tsx
git commit -m "feat: add core infrastructure — types, hooks, utilities"
```

---

### Task 3: Data Layer — Projects, Experience, Skills, Personal Info

**Files:**
- Create: `src/data/personal.ts`, `src/data/projects.ts`, `src/data/experience.ts`, `src/data/skills.ts`, `src/data/blog/index.ts`

- [ ] **Step 1: Create personal info data**

Write `src/data/personal.ts`:

```typescript
import type { PersonalInfo } from '../types'

export const personalInfo: PersonalInfo = {
  name: 'Saurabh Jalendra',
  title: 'AI/ML Researcher & Engineer',
  email: 'saurabhjalendra@gmail.com',
  location: 'Jaipur, India',
  bio: 'MTech AI/ML at BITS Pilani. Co-Founder & AI Lead at SKY AI. Building intelligent systems at the intersection of reinforcement learning, world models, and multimodal AI. Previously built VR heritage visualization at ISRO.',
  github: 'https://github.com/SaurabhJalendra',
  linkedin: 'https://linkedin.com/in/saurabhjalendra',
  resumeUrl: '/cv.pdf',
}
```

- [ ] **Step 2: Create projects data**

Write `src/data/projects.ts` with the top 8 projects from GitHub research:

```typescript
import type { Project } from '../types'

export const projects: Project[] = [
  {
    id: 'quantum-rl',
    title: 'Quantum-Enhanced Simulation Learning',
    description: 'MTech dissertation: quantum-inspired methods for DreamerV3-style world models. 200 experiments, 36-47% MSE reduction.',
    longDescription: 'Investigated whether quantum-inspired algorithms can improve world model training in reinforcement learning. Implemented 4 quantum-inspired methods (Tunneling, Superposition Buffer, Entanglement Layer, Interference Ensemble) against a classical baseline. Interference Ensemble achieved statistically significant improvements on DMControl robotics tasks.',
    tech: ['PyTorch', 'CUDA', 'DMControl', 'Atari', 'JAX'],
    github: 'https://github.com/SaurabhJalendra/Quantum-Enhanced-Simulation-Learning-for-Reinforcement-Learning',
    featured: true,
    image: '/projects/quantum-rl.webp',
    category: 'research',
  },
  {
    id: 'simulating-anything',
    title: 'Simulating Anything',
    description: 'Domain-agnostic scientific discovery: NL query → simulation → RSSM world model → symbolic regression → equations.',
    longDescription: '187 simulation domains across physics, biology, and chemistry. PySR/SINDy recovered known physical laws with R² ≥ 0.999 on 11/14 core domains. 570 cross-domain mathematical isomorphisms detected.',
    tech: ['JAX', 'Equinox', 'PySR', 'SINDy', 'Python'],
    github: 'https://github.com/SaurabhJalendra/Simulating-Anything',
    featured: true,
    image: '/projects/simulating-anything.webp',
    category: 'research',
  },
  {
    id: 'skindb-prism',
    title: 'skinDB AI (Prism)',
    description: 'AI Beauty Intelligence Platform with multi-platform price aggregation and AI-powered review analysis.',
    longDescription: 'Full-stack beauty intelligence platform with 10 curated products, price aggregation across Amazon/Sephora/Ulta, AI-powered review analysis from Reddit/YouTube, and sentiment analysis.',
    tech: ['Next.js', 'TypeScript', 'FastAPI', 'LlamaIndex', 'PostgreSQL', 'Docker'],
    github: 'https://github.com/SaurabhJalendra/skinDB-ai',
    featured: true,
    image: '/projects/skindb.webp',
    category: 'fullstack',
  },
  {
    id: 'analyst-coder',
    title: 'Analyst Coder-Agent',
    description: 'Autonomous LLM coding assistant with tool calling, plan-approval safety workflow, and real-time progress.',
    longDescription: 'Full-stack AI coding assistant wrapping Claude Code CLI. React frontend, FastAPI backend, PostgreSQL, JWT auth, real-time progress tracking, workspace management.',
    tech: ['React', 'TypeScript', 'FastAPI', 'Claude API', 'PostgreSQL', 'Docker'],
    github: 'https://github.com/SaurabhJalendra/Analyst_agentic_coder',
    featured: true,
    image: '/projects/analyst-coder.webp',
    category: 'agents',
  },
  {
    id: 'skai',
    title: 'SKAI — Multi-Agent System',
    description: 'Sentient Kernel Adaptive Intelligence: multi-agent AI with task decomposition and self-improvement.',
    longDescription: 'Multi-agent AI assistant with orchestrated execution. Agents: Communicator, Planner, Research, Coding, Critic, Voice, Self-Improving. Uses semantic memory via ChromaDB.',
    tech: ['Python', 'LangChain', 'ChromaDB', 'Streamlit', 'OpenRouter'],
    github: 'https://github.com/SaurabhJalendra/Multi-Model-System',
    featured: false,
    image: '/projects/skai.webp',
    category: 'agents',
  },
  {
    id: 'gravitational-lens',
    title: 'Gravitational Lensing Classification',
    description: 'Multimodal CNN+LSTM architecture for astrophysical gravitational lensing classification.',
    longDescription: '4-block CNN for 45×45 images + 2-layer LSTM for 14-step light curves with late-fusion classification head. 722K trainable parameters on 20K DES-deep survey samples.',
    tech: ['PyTorch', 'NumPy', 'scikit-learn', 'Matplotlib'],
    github: 'https://github.com/SaurabhJalendra/GravitationalLens-MultimodalDL',
    featured: false,
    image: '/projects/gravitational-lens.webp',
    category: 'ml',
  },
  {
    id: 'fraud-detection',
    title: 'Bank Fraud Detection',
    description: 'Hybrid 3-layer fraud detection: Rule-Based + Random Forest + Autoencoder with ensemble scoring.',
    longDescription: 'Hybrid detection system combining rule-based engine (7 rules), Random Forest, and Autoencoder with weighted ensemble scoring. Uses CTGAN for synthetic data generation and SHAP for explainability.',
    tech: ['TensorFlow', 'scikit-learn', 'SHAP', 'CTGAN', 'XGBoost'],
    github: 'https://github.com/SaurabhJalendra/Bank_fraud_detection',
    featured: false,
    image: '/projects/fraud-detection.webp',
    category: 'ml',
  },
  {
    id: 'newsletter-summary',
    title: 'AI Newsletter Digest',
    description: 'Automated newsletter summarization with Gemini AI, delivered via email and Next.js dashboard.',
    longDescription: 'Zero-cost automation: GitHub Actions fetches newsletters via IMAP, summarizes with Gemini 1.5 Flash, delivers via email and Next.js web dashboard on Vercel.',
    tech: ['Next.js', 'Node.js', 'Gemini AI', 'GitHub Actions', 'Vercel'],
    github: 'https://github.com/SaurabhJalendra/Email_daily_newsletter_summary',
    featured: false,
    image: '/projects/newsletter.webp',
    category: 'fullstack',
  },
]
```

- [ ] **Step 3: Create experience data**

Write `src/data/experience.ts`:

```typescript
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
```

- [ ] **Step 4: Create skills data**

Write `src/data/skills.ts`:

```typescript
import type { Skill } from '../types'

export const skills: Skill[] = [
  // Languages
  { name: 'Python', category: 'languages', level: 0.95 },
  { name: 'TypeScript', category: 'languages', level: 0.85 },
  { name: 'JavaScript', category: 'languages', level: 0.85 },
  { name: 'SQL', category: 'languages', level: 0.75 },

  // ML/DL
  { name: 'PyTorch', category: 'ml', level: 0.9 },
  { name: 'JAX/Equinox', category: 'ml', level: 0.8 },
  { name: 'TensorFlow', category: 'ml', level: 0.8 },
  { name: 'scikit-learn', category: 'ml', level: 0.85 },
  { name: 'OpenCV', category: 'ml', level: 0.75 },
  { name: 'Reinforcement Learning', category: 'ml', level: 0.9 },

  // LLM/NLP
  { name: 'LangChain', category: 'llm', level: 0.85 },
  { name: 'LlamaIndex', category: 'llm', level: 0.85 },
  { name: 'Hugging Face', category: 'llm', level: 0.8 },
  { name: 'RAG Pipelines', category: 'llm', level: 0.85 },
  { name: 'Claude API', category: 'llm', level: 0.8 },

  // Web
  { name: 'React', category: 'web', level: 0.85 },
  { name: 'Next.js', category: 'web', level: 0.8 },
  { name: 'FastAPI', category: 'web', level: 0.85 },
  { name: 'Node.js', category: 'web', level: 0.75 },
  { name: 'PostgreSQL', category: 'web', level: 0.8 },

  // Cloud/DevOps
  { name: 'Docker', category: 'cloud', level: 0.8 },
  { name: 'AWS', category: 'cloud', level: 0.7 },
  { name: 'GitHub Actions', category: 'cloud', level: 0.8 },
  { name: 'GCP', category: 'cloud', level: 0.65 },
]
```

- [ ] **Step 5: Create blog index placeholder**

Write `src/data/blog/index.ts`:

```typescript
import type { BlogPost } from '../../types'

// Blog posts are auto-generated by the daily-blogger agent
// Each post is a markdown file in this directory
// This index is updated by the agent after each new post
export const blogPosts: Omit<BlogPost, 'content'>[] = []
```

- [ ] **Step 6: Copy CV to public folder**

```bash
cp "D:/Git Repos/Portfolio_Website/cv.pdf" "D:/Git Repos/Portfolio_Website/public/cv.pdf"
```

- [ ] **Step 7: Commit**

```bash
git add src/data/ public/cv.pdf
git commit -m "feat: add data layer — projects, experience, skills, personal info"
```

---

### Task 4: Preloader + App Shell

**Files:**
- Create: `src/components/ui/Preloader.tsx`, `src/components/ui/Navbar.tsx`, `src/components/ui/Footer.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create Preloader component**

Write `src/components/ui/Preloader.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    // Simulate loading progress (will integrate with useProgress later)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setHiding(true)
          setTimeout(onComplete, 800)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-700',
        hiding && 'opacity-0 pointer-events-none'
      )}
    >
      <h1 className="text-2xl font-display font-bold tracking-tight mb-8">
        SJ
      </h1>
      <div className="w-48 h-[2px] bg-muted/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className="mt-4 text-sm text-muted font-mono">
        {Math.min(Math.round(progress), 100)}%
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Create Navbar component**

Write `src/components/ui/Navbar.tsx`:

```tsx
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
    // Note: Lenis intercepts native scroll behavior, so scrollIntoView
    // is automatically smoothed by Lenis when it's active.
  }

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-text/5'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        <a href="#" className="font-display font-bold text-lg tracking-tight">
          SJ
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.href}>
              <button
                onClick={() => handleClick(item.href)}
                className="text-sm text-muted hover:text-text transition-colors duration-200"
              >
                {item.label}
              </button>
            </li>
          ))}
          <li>
            <a
              href="/cv.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
            >
              Resume
            </a>
          </li>
        </ul>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={cn('w-6 h-0.5 bg-text transition-transform', menuOpen && 'rotate-45 translate-y-2')} />
          <span className={cn('w-6 h-0.5 bg-text transition-opacity', menuOpen && 'opacity-0')} />
          <span className={cn('w-6 h-0.5 bg-text transition-transform', menuOpen && '-rotate-45 -translate-y-2')} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 bg-background/95 backdrop-blur-xl',
          menuOpen ? 'max-h-96' : 'max-h-0'
        )}
      >
        <ul className="flex flex-col gap-4 px-6 py-6">
          {navItems.map((item) => (
            <li key={item.href}>
              <button
                onClick={() => handleClick(item.href)}
                className="text-lg text-text"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Create Footer component**

Write `src/components/ui/Footer.tsx`:

```tsx
import { personalInfo } from '../../data/personal'

export function Footer() {
  return (
    <footer className="border-t border-text/5 py-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {new Date().getFullYear()} {personalInfo.name}. Built with React Three Fiber.
        </p>
        <div className="flex items-center gap-6">
          <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-text transition-colors">
            GitHub
          </a>
          <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-text transition-colors">
            LinkedIn
          </a>
          <a href={`mailto:${personalInfo.email}`} className="text-sm text-muted hover:text-text transition-colors">
            Email
          </a>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Wire up App.tsx with Preloader, Navbar, Footer, and smooth scroll**

Write `src/App.tsx`:

```tsx
import { useState, useCallback, Suspense, lazy } from 'react'
import { ReducedMotionProvider } from './components/ui/ReducedMotionProvider'
import { Preloader } from './components/ui/Preloader'
import { Navbar } from './components/ui/Navbar'
import { Footer } from './components/ui/Footer'
import { useSmoothScroll } from './hooks/useSmoothScroll'

const Hero = lazy(() => import('./components/sections/Hero').then(m => ({ default: m.Hero })))
const About = lazy(() => import('./components/sections/About').then(m => ({ default: m.About })))
const Experience = lazy(() => import('./components/sections/Experience').then(m => ({ default: m.Experience })))
const Projects = lazy(() => import('./components/sections/Projects').then(m => ({ default: m.Projects })))
const Skills = lazy(() => import('./components/sections/Skills').then(m => ({ default: m.Skills })))
const Blog = lazy(() => import('./components/sections/Blog').then(m => ({ default: m.Blog })))
const Contact = lazy(() => import('./components/sections/Contact').then(m => ({ default: m.Contact })))

export function App() {
  const [loaded, setLoaded] = useState(false)
  useSmoothScroll()

  const handleLoadComplete = useCallback(() => setLoaded(true), [])

  return (
    <ReducedMotionProvider>
      {!loaded && <Preloader onComplete={handleLoadComplete} />}

      <Navbar />

      <main>
        <Suspense fallback={null}>
          <Hero />
          <About />
          <Experience />
          <Projects />
          <Skills />
          <Blog />
          <Contact />
        </Suspense>
      </main>

      <Footer />
    </ReducedMotionProvider>
  )
}
```

- [ ] **Step 5: Create placeholder section components**

Create each section file with a minimal placeholder. Each file follows this pattern — here's Hero as example:

Write `src/components/sections/Hero.tsx`:
```tsx
export function Hero() {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center section-padding">
      <h1 className="text-6xl font-display font-bold">Hero Section</h1>
    </section>
  )
}
```

Repeat for: `About.tsx`, `Experience.tsx`, `Projects.tsx`, `Skills.tsx`, `Blog.tsx`, `Contact.tsx` — each with its own `id` and placeholder heading.

- [ ] **Step 6: Verify app renders with all sections**

```bash
npm run dev
```

Expected: Page loads with preloader animation → fades to show nav + 7 placeholder sections + footer. Smooth scrolling works.

- [ ] **Step 7: Commit**

```bash
git add src/components/ src/App.tsx
git commit -m "feat: add app shell — preloader, navbar, footer, section placeholders"
```

---

### Task 5: 3D Canvas + Hero Scene

**Files:**
- Create: `src/components/3d/HeroScene.tsx`, `src/components/3d/FloatingNodes.tsx`, `src/components/3d/ParticleField.tsx`, `src/components/3d/SceneManager.tsx`
- Modify: `src/components/sections/Hero.tsx`, `src/App.tsx`

- [ ] **Step 1: Create ParticleField component**

Write `src/components/3d/ParticleField.tsx`:

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleFieldProps {
  count?: number
  size?: number
  spread?: number
}

export function ParticleField({ count = 200, size = 0.02, spread = 15 }: ParticleFieldProps) {
  const ref = useRef<THREE.Points>(null!)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread
    }
    return pos
  }, [count, spread])

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.02
    ref.current.rotation.x += delta * 0.01
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color="#6366f1"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}
```

- [ ] **Step 2: Create FloatingNodes component (neural network cluster)**

Write `src/components/3d/FloatingNodes.tsx`:

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface FloatingNodesProps {
  count?: number
  radius?: number
}

export function FloatingNodes({ count = 12, radius = 3 }: FloatingNodesProps) {
  const groupRef = useRef<THREE.Group>(null!)

  const nodes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const phi = Math.acos(-1 + (2 * i) / count)
      const theta = Math.sqrt(count * Math.PI) * phi
      return {
        position: [
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi),
        ] as [number, number, number],
        scale: 0.1 + Math.random() * 0.15,
      }
    })
  }, [count, radius])

  useFrame((state, delta) => {
    groupRef.current.rotation.y += delta * 0.1
  })

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={node.position} scale={node.scale}>
            <icosahedronGeometry args={[1, 1]} />
            <MeshDistortMaterial
              color="#6366f1"
              emissive="#8b5cf6"
              emissiveIntensity={0.3}
              distort={0.3}
              speed={2}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}
```

- [ ] **Step 3: Create HeroScene**

Write `src/components/3d/HeroScene.tsx`:

```tsx
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'
import { FloatingNodes } from './FloatingNodes'
import { ParticleField } from './ParticleField'

export function HeroScene() {
  const mainMeshRef = useRef<THREE.Mesh>(null!)
  const { pointer } = useThree()

  useFrame((state, delta) => {
    if (mainMeshRef.current) {
      // Smooth mouse follow
      mainMeshRef.current.rotation.x = THREE.MathUtils.lerp(
        mainMeshRef.current.rotation.x,
        pointer.y * 0.3,
        delta * 2
      )
      mainMeshRef.current.rotation.y = THREE.MathUtils.lerp(
        mainMeshRef.current.rotation.y,
        pointer.x * 0.3,
        delta * 2
      )
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#8b5cf6" />

      {/* Central morphing shape */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={mainMeshRef} scale={2}>
          <icosahedronGeometry args={[1, 4]} />
          <MeshDistortMaterial
            color="#6366f1"
            emissive="#8b5cf6"
            emissiveIntensity={0.15}
            distort={0.4}
            speed={1.5}
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={0.9}
          />
        </mesh>
      </Float>

      {/* Orbiting nodes */}
      <FloatingNodes count={10} radius={4} />

      {/* Background particles */}
      <ParticleField count={300} spread={20} size={0.015} />
    </>
  )
}
```

- [ ] **Step 4: Create SceneManager (persistent Canvas)**

Write `src/components/3d/SceneManager.tsx`:

```tsx
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { AdaptiveDpr, PerformanceMonitor, Preload } from '@react-three/drei'
import { HeroScene } from './HeroScene'

export function SceneManager() {
  return (
    <Canvas
      className="!fixed inset-0 !z-0"
      camera={{ position: [0, 0, 8], fov: 45 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ pointerEvents: 'none' }}
    >
      <PerformanceMonitor>
        <AdaptiveDpr pixelated />
      </PerformanceMonitor>
      <Suspense fallback={null}>
        <HeroScene />
        <Preload all />
      </Suspense>
    </Canvas>
  )
}
```

- [ ] **Step 5: Update Hero section with content overlay**

Update `src/components/sections/Hero.tsx`:

```tsx
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { personalInfo } from '../../data/personal'

gsap.registerPlugin(useGSAP)

export function Hero() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from('.hero-greeting', { y: 40, opacity: 0, duration: 0.8, delay: 1.2 })
      .from('.hero-name', { y: 60, opacity: 0, duration: 0.8 }, '-=0.4')
      .from('.hero-title', { y: 40, opacity: 0, duration: 0.8 }, '-=0.4')
      .from('.hero-bio', { y: 30, opacity: 0, duration: 0.6 }, '-=0.3')
      .from('.hero-cta', { y: 20, opacity: 0, duration: 0.6 }, '-=0.2')
  }, { scope: containerRef })

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen flex items-center section-padding z-10"
    >
      <div className="max-w-3xl">
        <p className="hero-greeting text-sm md:text-base text-muted font-mono mb-4">
          Hi, my name is
        </p>
        <h1 className="hero-name text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-4">
          {personalInfo.name}
        </h1>
        <h2 className="hero-title text-2xl md:text-4xl font-display font-semibold gradient-text mb-6">
          {personalInfo.title}
        </h2>
        <p className="hero-bio text-lg text-muted max-w-xl mb-8 leading-relaxed">
          {personalInfo.bio}
        </p>
        <div className="hero-cta flex gap-4">
          <a
            href="#projects"
            className="px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="px-6 py-3 rounded-full border border-text/20 text-text hover:border-primary hover:text-primary transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Add SceneManager Canvas to App.tsx**

Add the SceneManager import and render it before `<main>` in App.tsx:

```tsx
import { SceneManager } from './components/3d/SceneManager'

// Inside the return, before <main>:
{loaded && <SceneManager />}
```

- [ ] **Step 7: Verify Hero renders with 3D scene**

```bash
npm run dev
```

Expected: Preloader → 3D icosahedron with floating nodes and particles in background → Hero text overlaid with staggered GSAP entrance animation. Shape follows mouse.

- [ ] **Step 8: Commit**

```bash
git add src/components/3d/ src/components/sections/Hero.tsx src/App.tsx
git commit -m "feat: add 3D canvas with hero scene — morphing shape, floating nodes, particles"
```

---

### Task 6: About + Experience Sections

**Files:**
- Modify: `src/components/sections/About.tsx`, `src/components/sections/Experience.tsx`
- Create: `src/components/ui/SectionHeading.tsx`

- [ ] **Step 1: Create reusable SectionHeading**

Write `src/components/ui/SectionHeading.tsx`:

```tsx
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface SectionHeadingProps {
  number: string
  title: string
}

export function SectionHeading({ number, title }: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from(ref.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
      },
    })
  }, { scope: ref })

  return (
    <div ref={ref} className="flex items-center gap-4 mb-12 md:mb-16">
      <span className="text-primary font-mono text-sm">{number}.</span>
      <h2 className="text-3xl md:text-4xl font-display font-bold">{title}</h2>
      <div className="flex-1 h-px bg-text/10 ml-4" />
    </div>
  )
}
```

- [ ] **Step 2: Build About section**

Write `src/components/sections/About.tsx`:

```tsx
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SectionHeading } from '../ui/SectionHeading'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const education = [
  { degree: 'M.Tech in AI/ML', school: 'BITS Pilani', period: '2024 — 2026', detail: 'Dissertation: Quantum-Enhanced Simulation Learning for RL' },
  { degree: 'MBA, Banking & Finance', school: 'NMIMS, Mumbai', period: '2022 — 2024', detail: '' },
  { degree: 'B.Tech, Computer Science', school: 'GEC Bikaner', period: '2013 — 2017', detail: '' },
]

export function About() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from('.about-text', {
      y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.about-text', start: 'top 85%' },
    })

    gsap.from('.edu-item', {
      y: 30, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: '.edu-timeline', start: 'top 80%' },
    })
  }, { scope: containerRef })

  return (
    <section ref={containerRef} id="about" className="section-padding relative z-10">
      <div className="max-w-5xl mx-auto">
        <SectionHeading number="01" title="About Me" />

        <div className="grid md:grid-cols-2 gap-12">
          <div className="about-text space-y-4 text-muted leading-relaxed">
            <p>
              I'm an AI/ML researcher and engineer focused on reinforcement learning,
              world models, and multimodal intelligence. Currently completing my M.Tech
              at BITS Pilani while co-founding SKY AI, where we build document
              intelligence and portfolio management platforms.
            </p>
            <p>
              My research explores quantum-inspired methods for training world models,
              with my dissertation achieving a 36-47% improvement in prediction accuracy
              on robotics environments. I've published work spanning gravitational
              lensing classification, graph neural networks, and scientific simulation.
            </p>
            <p>
              When I'm not training models, I build full-stack applications and
              multi-agent AI systems. I believe the most impactful work happens at the
              intersection of rigorous research and practical engineering.
            </p>
          </div>

          <div className="edu-timeline">
            <h3 className="text-lg font-display font-semibold mb-6">Education</h3>
            <div className="relative pl-6 border-l border-primary/30">
              {education.map((edu, i) => (
                <div key={i} className="edu-item relative mb-8 last:mb-0">
                  <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-primary" />
                  <p className="text-sm text-primary font-mono">{edu.period}</p>
                  <h4 className="font-semibold mt-1">{edu.degree}</h4>
                  <p className="text-sm text-muted">{edu.school}</p>
                  {edu.detail && <p className="text-sm text-muted/70 mt-1 italic">{edu.detail}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Build Experience section**

Write `src/components/sections/Experience.tsx`:

```tsx
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SectionHeading } from '../ui/SectionHeading'
import { experiences } from '../../data/experience'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function Experience() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from('.exp-card', {
      y: 50, opacity: 0, duration: 0.7, stagger: 0.2, ease: 'power3.out',
      scrollTrigger: { trigger: '.exp-list', start: 'top 80%' },
    })
  }, { scope: containerRef })

  return (
    <section ref={containerRef} id="experience" className="section-padding relative z-10 bg-background-dark text-text-light">
      <div className="max-w-5xl mx-auto">
        <SectionHeading number="02" title="Experience" />

        <div className="exp-list space-y-8">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="exp-card group p-6 md:p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-xl font-display font-semibold group-hover:text-primary transition-colors">
                    {exp.role}
                  </h3>
                  <p className="text-primary/80">{exp.company} — {exp.location}</p>
                </div>
                <span className="text-sm text-muted font-mono whitespace-nowrap">{exp.period}</span>
              </div>

              <ul className="space-y-2 mb-4">
                {exp.description.map((d, i) => (
                  <li key={i} className="text-muted text-sm leading-relaxed flex gap-2">
                    <span className="text-primary mt-1 shrink-0">▹</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2">
                {exp.tech.map((t) => (
                  <span key={t} className="text-xs font-mono px-2 py-1 rounded-full bg-primary/10 text-primary/80">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Verify both sections render with scroll animations**

```bash
npm run dev
```

Expected: Scrolling past hero → About section fades in with education timeline → Experience section on dark background with animated cards.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/About.tsx src/components/sections/Experience.tsx src/components/ui/SectionHeading.tsx
git commit -m "feat: add About and Experience sections with scroll animations"
```

---

### Task 7: Projects Section (The Star)

**Files:**
- Modify: `src/components/sections/Projects.tsx`
- Create: `src/components/ui/ProjectCard.tsx`

- [ ] **Step 1: Create ProjectCard component**

Write `src/components/ui/ProjectCard.tsx`:

```tsx
import { useRef } from 'react'
import { cn } from '../../utils/cn'
import type { Project } from '../../types'

interface ProjectCardProps {
  project: Project
  index: number
  featured?: boolean
}

export function ProjectCard({ project, index, featured }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    cardRef.current.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)'
  }

  const categoryColors = {
    research: 'bg-violet-500/10 text-violet-400',
    fullstack: 'bg-blue-500/10 text-blue-400',
    ml: 'bg-emerald-500/10 text-emerald-400',
    agents: 'bg-amber-500/10 text-amber-400',
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        'project-card group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden transition-all duration-300 ease-out',
        featured ? 'md:col-span-2' : ''
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6 md:p-8">
        <div className="flex items-start justify-between mb-4">
          <span className={cn('text-xs font-mono px-2 py-1 rounded-full', categoryColors[project.category])}>
            {project.category}
          </span>
          <div className="flex gap-3">
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
            )}
            {project.live && (
              <a href={project.live} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors" aria-label="Live demo">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            )}
          </div>
        </div>

        <h3 className="text-xl font-display font-semibold mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>

        <p className="text-sm text-muted leading-relaxed mb-4">
          {featured ? project.longDescription : project.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span key={t} className="text-xs font-mono px-2 py-1 rounded-full bg-primary/10 text-primary/70">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build Projects section**

Write `src/components/sections/Projects.tsx`:

```tsx
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SectionHeading } from '../ui/SectionHeading'
import { ProjectCard } from '../ui/ProjectCard'
import { projects } from '../../data/projects'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function Projects() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from('.project-card', {
      y: 60,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.projects-grid',
        start: 'top 80%',
      },
    })
  }, { scope: containerRef })

  const featured = projects.filter((p) => p.featured)
  const other = projects.filter((p) => !p.featured)

  return (
    <section ref={containerRef} id="projects" className="section-padding relative z-10">
      <div className="max-w-6xl mx-auto">
        <SectionHeading number="03" title="Projects" />

        {/* Featured projects */}
        <div className="projects-grid grid md:grid-cols-2 gap-6 mb-8">
          {featured.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} featured />
          ))}
        </div>

        {/* Other projects */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {other.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify 3D tilt cards and scroll animations**

```bash
npm run dev
```

Expected: Project cards appear with staggered scroll animation. Hovering tilts cards in 3D with perspective. Featured cards span 2 columns.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Projects.tsx src/components/ui/ProjectCard.tsx
git commit -m "feat: add Projects section with 3D tilt cards and scroll animations"
```

---

### Task 8: Skills Section (3D Sphere Visualization)

**Files:**
- Create: `src/components/3d/SkillSphere.tsx`
- Modify: `src/components/sections/Skills.tsx`

- [ ] **Step 1: Create 3D SkillSphere component**

Write `src/components/3d/SkillSphere.tsx`:

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import type { Skill } from '../../types'

interface SkillSphereProps {
  skills: Skill[]
  radius?: number
}

export function SkillSphere({ skills, radius = 4 }: SkillSphereProps) {
  const groupRef = useRef<THREE.Group>(null!)

  const positions = useMemo(() => {
    return skills.map((_, i) => {
      const phi = Math.acos(-1 + (2 * i) / skills.length)
      const theta = Math.sqrt(skills.length * Math.PI) * phi
      return new THREE.Vector3(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      )
    })
  }, [skills, radius])

  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * 0.05
    groupRef.current.rotation.x += delta * 0.02
  })

  const categoryColors: Record<string, string> = {
    languages: '#6366f1',
    ml: '#8b5cf6',
    llm: '#a78bfa',
    web: '#818cf8',
    cloud: '#c4b5fd',
  }

  return (
    <group ref={groupRef}>
      {skills.map((skill, i) => (
        <Float key={skill.name} speed={0.5} rotationIntensity={0} floatIntensity={0.3}>
          <Text
            position={positions[i]}
            fontSize={0.25 + skill.level * 0.15}
            color={categoryColors[skill.category] || '#6366f1'}
            anchorX="center"
            anchorY="middle"
          >
            {skill.name}
          </Text>
        </Float>
      ))}
    </group>
  )
}
```

- [ ] **Step 2: Build Skills section with embedded Canvas**

Write `src/components/sections/Skills.tsx`:

```tsx
import { useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SectionHeading } from '../ui/SectionHeading'
import { SkillSphere } from '../3d/SkillSphere'
import { skills } from '../../data/skills'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const categories = [
  { key: 'languages', label: 'Languages', color: 'bg-indigo-500' },
  { key: 'ml', label: 'ML / Deep Learning', color: 'bg-violet-500' },
  { key: 'llm', label: 'LLM / NLP', color: 'bg-purple-400' },
  { key: 'web', label: 'Web / Backend', color: 'bg-indigo-400' },
  { key: 'cloud', label: 'Cloud / DevOps', color: 'bg-violet-300' },
]

export function Skills() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from('.skills-canvas', {
      opacity: 0, scale: 0.8, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.skills-canvas', start: 'top 80%' },
    })
    gsap.from('.legend-item', {
      x: -20, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.skills-legend', start: 'top 85%' },
    })
  }, { scope: containerRef })

  return (
    <section ref={containerRef} id="skills" className="section-padding relative z-10 bg-background-dark text-text-light">
      <div className="max-w-6xl mx-auto">
        <SectionHeading number="04" title="Skills" />

        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* 3D Skill Sphere — separate Canvas justified: OrbitControls needs
              pointer events + different camera, while the hero Canvas is pointer-events:none */}
          <div className="skills-canvas md:col-span-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
            <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <Suspense fallback={null}>
                <SkillSphere skills={skills} />
              </Suspense>
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.5}
              />
            </Canvas>
          </div>

          {/* Legend */}
          <div className="skills-legend space-y-4">
            {categories.map((cat) => (
              <div key={cat.key} className="legend-item">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                  <span className="text-sm font-semibold">{cat.label}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-6">
                  {skills
                    .filter((s) => s.category === cat.key)
                    .map((s) => (
                      <span key={s.name} className="text-xs text-muted">
                        {s.name}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify 3D skill sphere renders and is interactive**

```bash
npm run dev
```

Expected: Rotating 3D sphere of skill text labels. Orbit controls allow dragging. Legend shows categories.

- [ ] **Step 4: Commit**

```bash
git add src/components/3d/SkillSphere.tsx src/components/sections/Skills.tsx
git commit -m "feat: add Skills section with interactive 3D skill sphere"
```

---

### Task 9: Blog + Contact Sections

**Files:**
- Modify: `src/components/sections/Blog.tsx`, `src/components/sections/Contact.tsx`
- Create: `src/components/ui/BlogCard.tsx`, `src/components/ui/ContactForm.tsx`

- [ ] **Step 1: Create BlogCard component**

Write `src/components/ui/BlogCard.tsx`:

```tsx
import type { BlogPost } from '../../types'

interface BlogCardProps {
  post: Omit<BlogPost, 'content'>
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="blog-card group p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <time className="text-xs font-mono text-primary">{post.date}</time>
        <span className="text-xs text-muted">{post.readTime}</span>
      </div>
      <h3 className="text-lg font-display font-semibold mb-2 group-hover:text-primary transition-colors">
        {post.title}
      </h3>
      <p className="text-sm text-muted leading-relaxed mb-4">{post.summary}</p>
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span key={tag} className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary/70">
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Build Blog section**

Write `src/components/sections/Blog.tsx`:

```tsx
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
```

- [ ] **Step 3: Create ContactForm component**

Write `src/components/ui/ContactForm.tsx`:

```tsx
import { useState, type FormEvent } from 'react'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const data = new FormData(form)

    // mailto fallback (no backend needed for GitHub Pages)
    const subject = encodeURIComponent(`Portfolio Contact: ${data.get('name')}`)
    const body = encodeURIComponent(`From: ${data.get('name')} (${data.get('email')})\n\n${data.get('message')}`)
    window.open(`mailto:saurabhjalendra@gmail.com?subject=${subject}&body=${body}`)
    setStatus('sent')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-light placeholder-muted focus:outline-none focus:border-primary transition-colors"
          placeholder="Your name"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-light placeholder-muted focus:outline-none focus:border-primary transition-colors"
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-text-light placeholder-muted focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="What would you like to discuss?"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
      >
        {status === 'sent' ? 'Message sent!' : 'Send Message'}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Build Contact section**

Write `src/components/sections/Contact.tsx`:

```tsx
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SectionHeading } from '../ui/SectionHeading'
import { ContactForm } from '../ui/ContactForm'
import { personalInfo } from '../../data/personal'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function Contact() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from('.contact-content', {
      y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact-content', start: 'top 85%' },
    })
  }, { scope: containerRef })

  return (
    <section ref={containerRef} id="contact" className="section-padding relative z-10 bg-background-dark text-text-light">
      <div className="max-w-5xl mx-auto">
        <SectionHeading number="06" title="Get in Touch" />

        <div className="contact-content grid md:grid-cols-2 gap-12">
          <div>
            <p className="text-muted leading-relaxed mb-8">
              I'm always interested in hearing about new opportunities, research collaborations,
              or interesting projects. Whether you have a question or just want to say hi,
              feel free to reach out.
            </p>

            <div className="space-y-4">
              <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-3 text-muted hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {personalInfo.email}
              </a>
              <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </a>
              <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Verify Blog and Contact sections**

```bash
npm run dev
```

Expected: Blog shows "check back soon" placeholder. Contact shows form + links, all with scroll animations.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/Blog.tsx src/components/sections/Contact.tsx src/components/ui/BlogCard.tsx src/components/ui/ContactForm.tsx
git commit -m "feat: add Blog and Contact sections"
```

---

### Task 10: Polish, Accessibility & Performance

**Files:**
- Modify: `src/components/3d/SceneManager.tsx`, `src/App.tsx`, `src/styles/globals.css`
- Create: `public/favicon.svg`

- [ ] **Step 1: Add favicon**

Write `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#6366f1"/>
  <text x="50" y="68" font-family="system-ui" font-size="55" font-weight="700" fill="white" text-anchor="middle">SJ</text>
</svg>
```

- [ ] **Step 2: Add WebGL fallback to SceneManager**

Update `src/components/3d/SceneManager.tsx` to detect WebGL support:

```tsx
import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useEffect } from 'react'
import { AdaptiveDpr, PerformanceMonitor, Preload } from '@react-three/drei'
import { HeroScene } from './HeroScene'

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

export function SceneManager() {
  const [webgl, setWebgl] = useState(true)

  useEffect(() => {
    setWebgl(isWebGLAvailable())
  }, [])

  if (!webgl) return null

  return (
    <Canvas
      className="!fixed inset-0 !z-0"
      camera={{ position: [0, 0, 8], fov: 45 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ pointerEvents: 'none' }}
    >
      <PerformanceMonitor>
        <AdaptiveDpr pixelated />
      </PerformanceMonitor>
      <Suspense fallback={null}>
        <HeroScene />
        <Preload all />
      </Suspense>
    </Canvas>
  )
}
```

- [ ] **Step 3: Add skip-to-content link and a11y landmarks**

Add to `src/App.tsx`, as first child inside the return:

```tsx
<a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg">
  Skip to content
</a>
```

- [ ] **Step 4: Add reduced-motion CSS fallback**

Append to `src/styles/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  canvas {
    display: none !important;
  }
}
```

- [ ] **Step 5: Full build + verify**

```bash
npm run build && npx serve dist
```

Expected: Production build succeeds. Site loads, 3D renders, all sections visible, scroll animations work. Verify in browser.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add polish — favicon, WebGL fallback, a11y, reduced motion support"
```

---

### Task 11: GitHub Actions Deploy + Custom Domain

**Files:**
- Verify: `.github/workflows/deploy.yml` (already created in setup)
- Verify: `public/CNAME`

- [ ] **Step 1: Verify deploy workflow exists and is correct**

Read `.github/workflows/deploy.yml` and confirm it matches the GitHub Pages v4 actions pattern.

- [ ] **Step 2: Verify CNAME file**

```bash
cat public/CNAME
```

Expected: `saurabhjalendra.com`

- [ ] **Step 3: Verify vite.config.ts base path is `/` for custom domain**

Read `vite.config.ts` and confirm `base: '/'`.

- [ ] **Step 4: Create initial commit with all files and push**

```bash
git add -A
git commit -m "feat: complete portfolio website — ready for deployment"
git push origin main
```

- [ ] **Step 5: Configure GitHub Pages**

After push, go to repo Settings → Pages → Source: GitHub Actions. The deploy workflow will trigger automatically.

- [ ] **Step 6: Configure DNS**

Set up DNS for `saurabhjalendra.com`:
- Add a CNAME record pointing to `saurabhjalendra.github.io`
- Or add A records pointing to GitHub's IPs:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`

- [ ] **Step 7: Verify deployment**

```bash
gh run list --workflow=deploy.yml --limit=1
```

Expected: Workflow run shows success. Site accessible at saurabhjalendra.com.

---

## Summary

| Task | Description | Dependencies |
|------|-------------|-------------|
| 1 | Scaffold Vite + React + TS + deps | None |
| 2 | Core infrastructure (types, hooks, utils) | Task 1 |
| 3 | Data layer (projects, experience, skills) | Task 2 |
| 4 | App shell (preloader, navbar, footer) | Task 2, 3 |
| 5 | 3D Canvas + Hero scene | Task 4 |
| 6 | About + Experience sections | Task 4 |
| 7 | Projects section (3D cards) | Task 4, 3 |
| 8 | Skills section (3D sphere) | Task 4, 3 |
| 9 | Blog + Contact sections | Task 4, 3 |
| 10 | Polish, a11y, performance | Task 5-9 |
| 11 | Deploy + custom domain | Task 10 |

**Total: 11 tasks, ~55 steps.** Each task produces a working, committable state.
