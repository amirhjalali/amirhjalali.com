# Design Improvement Roadmap

A comprehensive plan to elevate amirhjalali.com from "professional portfolio" to "memorable design statement."

---

## Phase 1: Typography & Foundation (Week 1-2)

### 1.1 Replace Inter with a Distinctive Sans-Serif

**Current Problem:** Inter is the most overused font in modern web design. It's invisible—it doesn't communicate anything.

**Solution:** Replace with one of these character-driven alternatives:

| Option | Personality | Best For |
|--------|-------------|----------|
| **Satoshi** | Geometric, modern, confident | Tech-forward feel |
| **General Sans** | Friendly but professional | Approachable expert |
| **Neue Haas Grotesk** | Classic Swiss, timeless | Refined minimalism |
| **Söhne** | Editorial, Stripe-like | Premium positioning |
| **Untitled Sans** | Contemporary, clean | Modern creative |

**Implementation:**
```tsx
// app/layout.tsx - Add new font
import { Satoshi } from 'next/font/google' // or local font

const satoshi = localFont({
  src: [
    { path: '../fonts/Satoshi-Regular.woff2', weight: '400' },
    { path: '../fonts/Satoshi-Medium.woff2', weight: '500' },
    { path: '../fonts/Satoshi-Bold.woff2', weight: '700' },
  ],
  variable: '--font-sans',
})
```

**Files to modify:**
- `app/layout.tsx` - Font import
- `app/globals.css` - Body font-family
- `tailwind.config.js` - Font family definition

---

### 1.2 Establish Type Scale with Purpose

**Current Problem:** Font sizes feel arbitrary. The Golden Ratio system exists but isn't used.

**Solution:** Create a purposeful type scale:

```css
/* app/globals.css - Add semantic type tokens */
:root {
  /* Display - For hero headlines only */
  --text-display: clamp(3rem, 8vw, 7rem);

  /* Headline - Page titles */
  --text-headline: clamp(2rem, 5vw, 4rem);

  /* Title - Section headers, card titles */
  --text-title: clamp(1.25rem, 2vw, 1.75rem);

  /* Body - Primary reading text */
  --text-body: clamp(1rem, 1.2vw, 1.125rem);

  /* Caption - Labels, metadata */
  --text-caption: 0.75rem;

  /* Micro - Tags, timestamps */
  --text-micro: 0.625rem;
}
```

**Usage examples:**
- Homepage name: `--text-display` with Cormorant
- Page titles (Work, Thoughts): `--text-headline` with Cormorant
- Card titles: `--text-title` with Cormorant
- Descriptions: `--text-body` with new sans-serif
- Labels: `--text-caption` with JetBrains Mono
- Tags: `--text-micro` with JetBrains Mono

---

### 1.3 Increase Body Text Size

**Current Problem:** 14px body text is too small for comfortable reading.

**Solution:** Base body at 16-18px with generous line-height:

```css
body {
  font-size: var(--text-body); /* 16-18px responsive */
  line-height: 1.7;
  letter-spacing: -0.01em; /* Slight tightening for modern sans */
}

/* Card descriptions */
.card-description {
  font-size: var(--text-body);
  line-height: 1.6;
  color: #AAAAAA; /* Slightly lighter than #888 for readability */
}
```

---

## Phase 2: Homepage Transformation (Week 2-3)

### 2.1 Strengthen the Value Proposition

**Current Problem:** "Human Consultant" is cryptic. Visitors don't immediately understand what you do.

**Solution:** Add a supporting headline that communicates value:

```tsx
// app/page.tsx
<motion.div className="text-center mb-2">
  <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl 2xl:text-9xl font-light tracking-tight mb-3">
    <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] font-normal">A</span>
    mir H. Jalal
    <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] font-normal">i</span>
  </h1>

  {/* Primary descriptor */}
  <p className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-[#888888] mb-6">
    Human Consultant
  </p>

  {/* NEW: Value proposition */}
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.8, duration: 1.2 }}
    className="font-sans text-lg md:text-xl text-[#666666] max-w-md mx-auto leading-relaxed"
  >
    Turning AI ambition into business reality.<br/>
    <span className="text-[#888888]">14 years of making data work.</span>
  </motion.p>
</motion.div>
```

---

### 2.2 Make Navigation More Discoverable

**Current Problem:** Bottom nav is nearly invisible. Visitors may miss it.

**Solution:** Add visual affordance with subtle animation:

```tsx
// app/page.tsx - Enhanced bottom nav
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1.2, duration: 0.8 }}
  className="absolute bottom-8 left-0 right-0 z-50"
>
  {/* Scroll indicator */}
  <motion.div
    className="flex justify-center mb-4"
    animate={{ y: [0, 8, 0] }}
    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
  >
    <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#444444] to-transparent" />
  </motion.div>

  {/* Nav links */}
  <div className="flex justify-center gap-8 sm:gap-16 font-mono text-xs uppercase tracking-widest">
    <Link href="/work" className="group flex flex-col items-center gap-2">
      <span className="text-[#888888] group-hover:text-[#EAEAEA] transition-colors">Work</span>
      <span className="w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
    </Link>
    {/* ... repeat for other links */}
  </div>
</motion.div>
```

---

### 2.3 Add Ambient Motion to Homepage

**Current Problem:** After initial load, the homepage is static.

**Solution:** Subtle continuous animation:

```tsx
// components/Spotlight.tsx - Add breathing animation
<motion.div
  ref={ref}
  className="absolute w-[800px] h-[800px] rounded-full bg-white/[0.03] blur-3xl"
  style={{
    left: -400,
    top: -400,
    x: springX,
    y: springY,
  }}
  animate={{
    scale: [1, 1.05, 1],
    opacity: [0.03, 0.05, 0.03],
  }}
  transition={{
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut",
  }}
/>
```

---

## Phase 3: Card System Overhaul (Week 3-4)

### 3.1 Differentiate Project Cards from Thought Cards

**Current Problem:** Both content types look identical.

**Solution:** Create distinct visual signatures:

**Project Cards (Horizontal emphasis):**
```tsx
// components/ProjectCard.tsx - New layout
<article className="group relative grid grid-cols-[1fr,1.2fr] gap-0 border border-white/10 rounded-xl overflow-hidden">
  {/* Image takes 45% */}
  <div className="relative aspect-[4/3] overflow-hidden">
    <LazyImage ... />
  </div>

  {/* Content takes 55% */}
  <div className="p-6 flex flex-col justify-between">
    <div>
      <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">Project</span>
      <h3 className="text-2xl font-serif font-light mt-2 mb-3">{project.title}</h3>
      <p className="text-[#888888] text-sm">{project.description}</p>
    </div>
    <div className="flex items-center justify-between mt-4">
      <div className="flex gap-2">
        {project.tags.slice(0, 2).map(tag => (
          <span key={tag} className="text-[10px] px-2 py-1 border border-white/10 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      <ArrowUpRight className="w-4 h-4 text-[#888888] group-hover:text-white transition-colors" />
    </div>
  </div>
</article>
```

**Thought Cards (Vertical, content-focused):**
```tsx
// components/ThoughtCard.tsx - Keep vertical but enhance
<article className="group relative border border-white/10 rounded-xl overflow-hidden">
  {/* Smaller image ratio */}
  <div className="relative aspect-[2/1] overflow-hidden">
    <LazyImage ... />
    {/* Reading time badge */}
    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] font-mono">
      {article.readTime}
    </div>
  </div>

  <div className="p-6">
    {/* Date more prominent */}
    <time className="text-[11px] font-mono text-[#666666]">
      {formatDate(article.publishedAt)}
    </time>
    <h3 className="text-xl font-serif font-light mt-2 mb-3 line-clamp-2">
      {article.title}
    </h3>
    <p className="text-[#888888] text-sm line-clamp-3">
      {article.excerpt}
    </p>
  </div>
</article>
```

---

### 3.2 Add Grid Variation

**Current Problem:** Uniform 3-column grid is predictable.

**Solution:** Feature the first/latest item larger:

```tsx
// app/work/page.tsx
<div className="grid gap-8">
  {/* Featured project - full width */}
  <motion.div className="col-span-full">
    <FeaturedProjectCard project={projects[0]} />
  </motion.div>

  {/* Rest in 2-column grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {projects.slice(1).map((project, index) => (
      <ProjectCard key={project.id} project={project} index={index} />
    ))}
  </div>
</div>
```

**Featured card design:**
```tsx
// components/FeaturedProjectCard.tsx
<article className="group relative grid md:grid-cols-2 gap-0 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
  <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
    <LazyImage className="object-cover w-full h-full" />
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050505]/80 md:block hidden" />
  </div>

  <div className="p-8 md:p-12 flex flex-col justify-center">
    <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666] mb-4">
      Featured Project
    </span>
    <h2 className="text-3xl md:text-4xl font-serif font-light mb-4">{title}</h2>
    <p className="text-[#888888] text-lg mb-6">{longDescription}</p>
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => ...)}
    </div>
  </div>
</article>
```

---

### 3.3 Enhance Hover States

**Current Problem:** `y: -4` lift is predictable and overused.

**Solution:** Varied, purposeful hover effects:

```tsx
// Different hover behaviors per context

// Project cards: Subtle scale + border glow
<motion.div
  whileHover={{
    scale: 1.02,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
  }}
  className="group ... hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
>

// Thought cards: Image zoom + content reveal
<motion.div whileHover="hover" initial="rest" animate="rest">
  <motion.div
    variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
    className="overflow-hidden"
  >
    <LazyImage />
  </motion.div>
  <motion.div
    variants={{ rest: { y: 0 }, hover: { y: -4 } }}
    className="p-6"
  >
    {/* Content slides up slightly */}
  </motion.div>
</motion.div>

// CTA buttons: Magnetic effect
<MagneticWrapper strength={0.3}>
  <Button>Get in Touch</Button>
</MagneticWrapper>
```

---

## Phase 4: Motion & Interaction Polish (Week 4-5)

### 4.1 Create Motion Tokens

**Current Problem:** Animation timing is scattered and inconsistent.

**Solution:** Centralized motion system:

```ts
// lib/motion.ts
export const easings = {
  // Smooth entrances
  smooth: [0.23, 1, 0.32, 1],
  // Snappy interactions
  snappy: [0.17, 0.67, 0.3, 0.96],
  // Bouncy reveals
  bounce: [0.34, 1.56, 0.64, 1],
  // Natural settle
  settle: [0.4, 0, 0.2, 1],
}

export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  dramatic: 1.0,
}

export const stagger = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.15,
}

// Reusable variants
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.normal, ease: easings.smooth }
  }
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.fast, ease: easings.snappy }
  }
}
```

---

### 4.2 Add Scroll-Triggered Animations

**Current Problem:** Only homepage has entrance animations.

**Solution:** Animate elements as they enter viewport:

```tsx
// components/AnimateOnScroll.tsx
'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { fadeInUp } from '@/lib/motion'

interface Props {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function AnimateOnScroll({ children, delay = 0, className }: Props) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

**Usage:**
```tsx
// app/work/page.tsx
<AnimateOnScroll>
  <ProjectCard ... />
</AnimateOnScroll>
```

---

### 4.3 Page Transitions

**Current Problem:** Hard cuts between pages.

**Solution:** Smooth page transitions:

```tsx
// app/template.tsx (new file)
'use client'

import { motion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

---

### 4.4 Magnetic Cursor Effects

**Current Problem:** The magnetic wrapper exists but isn't used.

**Solution:** Apply to key interactive elements:

```tsx
// components/ui/magnetic-wrapper.tsx - Enhanced
'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef, useState } from 'react'

interface Props {
  children: React.ReactNode
  strength?: number
  className?: string
}

export function MagneticWrapper({ children, strength = 0.4, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { damping: 15, stiffness: 150 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    x.set((e.clientX - centerX) * strength)
    y.set((e.clientY - centerY) * strength)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

**Apply to:**
- Primary CTA buttons
- Social links on contact page
- Navigation links
- Project card arrows

---

## Phase 5: Texture & Atmosphere (Week 5-6)

### 5.1 Enhance the Noise Overlay

**Current Problem:** 3% opacity is invisible.

**Solution:** Make it intentional or remove it:

```css
/* Option A: Commit to visible grain */
.noise-overlay {
  opacity: 0.06; /* Visible but not distracting */
  mix-blend-mode: overlay; /* Better integration */
}

/* Option B: Animated grain for premium feel */
.noise-overlay {
  opacity: 0.04;
  animation: grain 0.5s steps(10) infinite;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0) }
  10% { transform: translate(-2%, -2%) }
  20% { transform: translate(2%, 2%) }
  30% { transform: translate(-1%, 1%) }
  40% { transform: translate(1%, -1%) }
  50% { transform: translate(-2%, 2%) }
  60% { transform: translate(2%, -2%) }
  70% { transform: translate(-1%, -1%) }
  80% { transform: translate(1%, 1%) }
  90% { transform: translate(-2%, -1%) }
}
```

---

### 5.2 Add Depth with Gradients

**Current Problem:** Flat #050505 background everywhere.

**Solution:** Subtle gradient atmospheres per section:

```css
/* Hero sections - radial spotlight */
.hero-atmosphere {
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,255,255,0.03), transparent),
    #050505;
}

/* Card sections - bottom fade */
.cards-atmosphere {
  background:
    linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.01) 50%, transparent 100%),
    #050505;
}

/* Footer - top border glow */
.footer-atmosphere {
  background:
    linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, transparent 30%),
    #050505;
}
```

---

### 5.3 Implement Subtle Border Glow on Focus

**Current Problem:** Card borders are static.

**Solution:** Animated border on hover:

```css
/* Glowing border effect */
.glow-border {
  position: relative;
}

.glow-border::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.1) 0%,
    rgba(255,255,255,0.05) 50%,
    rgba(255,255,255,0.1) 100%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.glow-border:hover::before {
  opacity: 1;
}
```

---

## Phase 6: About Page Redesign (Week 6-7)

### 6.1 Timeline Visualization

**Current Problem:** Wall of identical cards.

**Solution:** Visual timeline with hierarchy:

```tsx
// app/about/components/Timeline.tsx
<div className="relative">
  {/* Vertical line */}
  <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-white/10" />

  {experiences.map((exp, index) => (
    <motion.div
      key={exp.id}
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`relative grid md:grid-cols-2 gap-8 mb-16 ${
        index % 2 === 0 ? '' : 'md:direction-rtl'
      }`}
    >
      {/* Year marker */}
      <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white/20 border-2 border-[#050505]" />

      {/* Content */}
      <div className={`${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12 md:col-start-2'}`}>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">
          {exp.period}
        </span>
        <h3 className="text-xl font-serif font-light mt-2">{exp.title}</h3>
        <p className="text-[#888888] text-sm mt-1">{exp.company}</p>

        {/* Expandable achievements */}
        <ExpandableContent>
          <ul className="mt-4 space-y-2">
            {exp.achievements.map((a, i) => (
              <li key={i} className="text-sm text-[#888888] flex gap-2">
                <span className="text-white/30">-</span>
                {a}
              </li>
            ))}
          </ul>
        </ExpandableContent>
      </div>
    </motion.div>
  ))}
</div>
```

---

### 6.2 Expandable Content Component

**Current Problem:** All achievements shown at once.

**Solution:** Progressive disclosure:

```tsx
// components/ExpandableContent.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export function ExpandableContent({
  children,
  previewLines = 2
}: {
  children: React.ReactNode
  previewLines?: number
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div>
      <AnimatePresence initial={false}>
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? 'auto' : `${previewLines * 1.5}rem` }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 mt-2 text-[10px] font-mono uppercase tracking-widest text-[#666666] hover:text-white transition-colors"
      >
        {isExpanded ? 'Show less' : 'Show more'}
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
          <ChevronDown className="w-3 h-3" />
        </motion.div>
      </button>
    </div>
  )
}
```

---

### 6.3 Skills Visualization

**Current Problem:** Tags blur together.

**Solution:** Grouped, scannable skills:

```tsx
// app/about/components/SkillsSection.tsx
const skillCategories = {
  'AI & ML': ['LLMs', 'OpenAI API', 'LangChain', 'Prompt Engineering', 'RAG'],
  'Data': ['Data Architecture', 'ETL/ELT', 'Data Modeling', 'Warehousing'],
  'Cloud': ['AWS', 'GCP', 'Docker', 'Kubernetes'],
  'Languages': ['Python', 'TypeScript', 'SQL', 'Go'],
}

<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
  {Object.entries(skillCategories).map(([category, skills]) => (
    <div key={category}>
      <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#666666] mb-4">
        {category}
      </h4>
      <ul className="space-y-2">
        {skills.map(skill => (
          <li key={skill} className="text-sm text-[#888888]">{skill}</li>
        ))}
      </ul>
    </div>
  ))}
</div>
```

---

## Phase 7: Mobile Excellence (Week 7-8)

### 7.1 Mobile Navigation Redesign

**Current Problem:** Slide-in from right is unconventional and confusing.

**Solution:** Full-screen overlay with centered content:

```tsx
// components/MobileNav.tsx
<AnimatePresence>
  {mobileOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center"
    >
      {/* Close button */}
      <button
        onClick={() => setMobileOpen(false)}
        className="absolute top-6 right-6 p-2"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation links */}
      <nav className="flex flex-col items-center gap-8">
        {navItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="text-3xl font-serif font-light"
            >
              {item.label}
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* Social links at bottom */}
      <div className="absolute bottom-8 flex gap-6">
        {socialLinks.map(link => ...)}
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

---

### 7.2 Touch-Optimized Cards

**Current Problem:** Hover states don't translate to mobile.

**Solution:** Active states and touch feedback:

```tsx
// components/ProjectCard.tsx - Mobile enhancements
<motion.article
  whileTap={{ scale: 0.98 }} // Touch feedback
  className="
    ...
    active:bg-white/5
    touch-manipulation
  "
>
  {/* Ensure touch targets are at least 44px */}
  <div className="p-6 min-h-[44px]">
    ...
  </div>
</motion.article>
```

---

### 7.3 Mobile-Specific Spacing

**Current Problem:** Desktop spacing on mobile is cramped.

**Solution:** Responsive spacing tokens:

```css
/* app/globals.css */
:root {
  --space-section: clamp(3rem, 8vw, 6rem);
  --space-card: clamp(1rem, 3vw, 1.5rem);
  --space-content: clamp(1rem, 4vw, 1.5rem);
}

/* Usage */
.section {
  padding-top: var(--space-section);
  padding-bottom: var(--space-section);
}

.card {
  padding: var(--space-card);
}
```

---

## Phase 8: Signature Moments (Week 8-9)

### 8.1 Custom Cursor (Desktop Only)

Create a subtle custom cursor that reinforces the light/reveal theme:

```tsx
// components/CustomCursor.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 25, stiffness: 400 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    const handleHoverStart = () => setIsHovering(true)
    const handleHoverEnd = () => setIsHovering(false)

    window.addEventListener('mousemove', moveCursor)

    // Add hover detection for interactive elements
    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', handleHoverStart)
      el.addEventListener('mouseleave', handleHoverEnd)
    })

    return () => {
      window.removeEventListener('mousemove', moveCursor)
    }
  }, [cursorX, cursorY])

  // Only show on desktop
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-white pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />

      {/* Hover ring */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-white/30 pointer-events-none z-[9998]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 1 : 0.5,
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  )
}
```

---

### 8.2 Page Load Sequence

Create a memorable first impression:

```tsx
// components/LoadingSequence.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function LoadingSequence({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Minimum display time for brand impact
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center"
            >
              {/* Animated logo or name */}
              <motion.h1
                className="text-4xl font-serif font-light"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                AHJ
              </motion.h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </>
  )
}
```

---

### 8.3 Easter Egg: Konami Code

Add a playful hidden feature:

```tsx
// hooks/useKonamiCode.ts
import { useEffect, useState } from 'react'

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
]

export function useKonamiCode(callback: () => void) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === KONAMI_CODE[index]) {
        if (index === KONAMI_CODE.length - 1) {
          callback()
          setIndex(0)
        } else {
          setIndex(i => i + 1)
        }
      } else {
        setIndex(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [index, callback])
}

// Usage: Reveal an alternate color theme, show a hidden message, etc.
```

---

## Implementation Priority Matrix

| Phase | Impact | Effort | Priority |
|-------|--------|--------|----------|
| Phase 1: Typography | High | Low | **P0** |
| Phase 2: Homepage | High | Medium | **P0** |
| Phase 3: Cards | High | Medium | **P1** |
| Phase 4: Motion | Medium | Medium | **P1** |
| Phase 5: Texture | Low | Low | **P2** |
| Phase 6: About | Medium | High | **P2** |
| Phase 7: Mobile | High | Medium | **P1** |
| Phase 8: Signature | Medium | High | **P3** |

---

## Quick Wins (Do First)

1. **Replace Inter with Satoshi/General Sans** - 30 minutes
2. **Increase body text size to 16-18px** - 15 minutes
3. **Add value proposition to homepage** - 30 minutes
4. **Increase noise overlay to 6%** - 5 minutes
5. **Add scroll indicator to homepage** - 20 minutes
6. **Apply magnetic wrapper to CTA buttons** - 15 minutes

---

## Success Metrics

After implementation, the site should:

- [ ] Have a distinctive typography voice (not Inter)
- [ ] Communicate value proposition within 3 seconds
- [ ] Have visually distinct content types (projects vs. thoughts)
- [ ] Feel alive with purposeful motion
- [ ] Work beautifully on mobile
- [ ] Have 2-3 memorable interaction moments
- [ ] Load with a branded sequence
- [ ] Feel cohesive across all pages

---

## Resources

**Fonts:**
- [Satoshi](https://www.fontshare.com/fonts/satoshi)
- [General Sans](https://www.fontshare.com/fonts/general-sans)
- [Söhne](https://klim.co.nz/retail-fonts/soehne/)

**Inspiration:**
- [Stripe](https://stripe.com) - Motion and typography
- [Linear](https://linear.app) - Dark mode, monochrome
- [Vercel](https://vercel.com) - Gradient atmospheres
- [Rauno](https://rauno.me) - Personal portfolio excellence

**Tools:**
- [Framer Motion](https://www.framer.com/motion/) - Animation
- [Cubic Bezier](https://cubic-bezier.com/) - Easing curves
- [Type Scale](https://typescale.com/) - Typography ratios
