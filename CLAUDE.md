## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update 'tasks/lessons.md' with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests -> then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

---

# Portfolio Website - Saurabh Jalendra

## Project Overview
A visually stunning, 3D-heavy personal portfolio website showcasing AI/ML research and projects. Clean minimal design with bold 3D elements that create an immersive experience.

## Tech Stack
- **Build**: Vite 6 + React 19 + TypeScript
- **3D**: React Three Fiber (R3F) + Drei + Three.js
- **Animation**: GSAP + ScrollTrigger + Lenis (smooth scroll)
- **Styling**: Tailwind CSS 4
- **Hosting**: GitHub Pages (static output only)

## Architecture
```
src/
  components/       # Reusable UI components
    3d/             # All 3D scene components (R3F Canvas children)
    ui/             # 2D UI components (buttons, cards, nav)
    sections/       # Full page sections (Hero, About, Projects, etc.)
  hooks/            # Custom React hooks
  utils/            # Utility functions
  assets/           # Static assets (textures, models, fonts, images)
    models/         # .glb/.gltf 3D models
    textures/       # Texture maps
  styles/           # Global styles
  data/             # Static data (projects, experience, skills)
    blog/           # Auto-generated blog posts (markdown + index)
  App.tsx           # Root component
  main.tsx          # Entry point
```

## 3D Development Rules

### Performance (Critical for portfolio UX)
- ALWAYS dispose geometries, materials, and textures in useEffect cleanup
- Use `useFrame` with delta time, never raw Date.now()
- Prefer `instances` (InstancedMesh) over multiple identical meshes
- Keep draw calls under 50 per scene
- Use `<Suspense>` with fallback for all lazy-loaded 3D content
- Compress all .glb models with Draco (use `useDraco` from drei)
- Use `<PerformanceMonitor>` to adapt quality on low-end devices
- Textures: max 1024x1024 for decorative, 2048x2048 only for hero
- Use `<AdaptiveDpr>` and `<AdaptiveEvents>` from drei

### R3F Conventions
- 3D components go in `src/components/3d/` - never mix 3D and 2D components
- Each 3D scene gets its own `<Canvas>` only if it needs different camera/GL settings
- Prefer a single persistent `<Canvas>` with scene swapping via scroll position
- Use drei abstractions (`<Float>`, `<MeshDistortMaterial>`, `<Text3D>`, etc.) before writing raw Three.js
- All 3D components must accept `ref` via `forwardRef` for GSAP animation targets

### GSAP + ScrollTrigger Rules
- Initialize ScrollTrigger with Lenis smooth scroll instance
- Use `gsap.context()` for cleanup in useEffect/useLayoutEffect
- Pin sections sparingly - max 2-3 pinned sections total
- Prefer `scrub: true` for scroll-linked animations (not trigger-based)
- Use `gsap.matchMedia()` for responsive animation breakpoints

### Animation Philosophy
- Every animation must serve a purpose - no animation for animation's sake
- Entrance animations: subtle (opacity + small translateY), 0.6-0.8s duration
- 3D transitions: smooth camera movements, object morphing on scroll
- Hover states: 3D tilt/depth effects on cards, scale 1.02-1.05 max
- Respect `prefers-reduced-motion` - provide static fallbacks

## Sections (in scroll order)
1. **Hero** - Immersive 3D scene with name/title, interactive mouse-reactive elements
2. **About** - Brief intro with 3D accent elements, education timeline
3. **Experience** - SKY AI + ISRO with depth cards
4. **Projects** - The star section: 3D project gallery with detailed views
5. **Skills** - Interactive 3D skill visualization
6. **Blog** - Auto-generated daily blog posts (via GitHub Actions + Claude)
7. **Contact** - Clean form with subtle 3D background

## Code Style
- TypeScript strict mode, no `any`
- Functional components only, no class components
- Named exports (not default exports) for all components
- Props interfaces named `{ComponentName}Props`
- Use CSS variables for theme colors (defined in Tailwind config)
- Mobile-first responsive design
- All text content lives in `src/data/` as typed constants

## Color Palette
- Background: `#fafafa` (light) / `#0a0a0a` (dark sections)
- Primary accent: `#6366f1` (indigo-500)
- Secondary accent: `#8b5cf6` (violet-500)
- Text: `#18181b` (zinc-900) / `#f4f4f5` (zinc-100)
- 3D elements: gradient between primary and secondary accent

## Git Conventions
- Commit messages: `type: description` (feat, fix, style, refactor, perf, docs)
- One feature per commit
- No committing node_modules, dist, or .env files

## Typography & Fonts
- Display/headings: Inter (variable weight) or Space Grotesk for geometric feel
- Body: Inter or system font stack for performance
- Load fonts via `@fontsource` packages (self-hosted, no external requests)
- Font display: `swap` to prevent FOIT (flash of invisible text)

## SEO & Meta
- Each page must have: title, description, og:image, og:title, og:description
- Structured data (JSON-LD) for Person schema
- Canonical URL set
- Sitemap generated at build time
- robots.txt allowing all crawlers

## Loading & Preloader
- Show a branded preloader while 3D assets load
- Use `useProgress` from drei to track loading percentage
- Critical content (name, nav) visible within 1 second
- 3D scenes load progressively (low-poly placeholder → full quality)
- Skeleton screens for blog/project cards during data load

## Performance Budget
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Total JS bundle (gzipped): < 350KB
- Total 3D assets: < 2MB
- Lighthouse Performance score: > 80

## WebGL Fallback
- Detect WebGL support with `@react-three/fiber` capabilities
- If no WebGL: show static hero image + standard CSS animations
- `prefers-reduced-motion`: disable all 3D animations, show static layout
- Low-power devices: reduce particle count, lower resolution, disable post-processing

## Blog Data Structure
```
src/data/blog/
  YYYY-MM-DD-slug.md    # Individual blog posts (frontmatter + markdown)
  index.ts              # Blog index with metadata for all posts
```
Blog posts are markdown files parsed at build time. The daily-blogger agent creates them via GitHub Actions.

## Deployment
- `npm run build` outputs to `dist/`
- GitHub Actions deploys `dist/` to GitHub Pages on push to main
- Daily blog bot runs at 11:30 PM IST via separate GitHub Action
- All assets must be referenced with relative paths (not absolute)
- Base path in vite.config.ts is `/` (custom domain saurabhjalendra.com, not repo subpath)
- `ANTHROPIC_API_KEY` must be set as GitHub repo secret for blog bot
