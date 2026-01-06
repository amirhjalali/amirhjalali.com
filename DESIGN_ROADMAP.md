# Design Improvement Roadmap v2.0

A comprehensive plan to refine amirhjalali.com based on the design critique conducted January 2026. These improvements address spacing consistency, visual hierarchy, mobile experience, and overall polish.

---

## Phase 1: Spacing System Overhaul

**Problem**: Inconsistent spacing (`py-20`, `py-24`, `mb-6`, `mb-8`, `mb-16`) used interchangeably creates visual noise.

### 1.1 Define Spacing Tokens

Create a strict spacing system with only 5 increments:

```css
/* app/globals.css - Add to :root */
:root {
  /* Spacing Scale - Use ONLY these values */
  --space-xs: 0.5rem;    /* 8px - Tight spacing, within components */
  --space-sm: 1rem;      /* 16px - Small gaps, element margins */
  --space-md: 2rem;      /* 32px - Standard section padding */
  --space-lg: 4rem;      /* 64px - Section separators */
  --space-xl: 6rem;      /* 96px - Page section rhythm */

  /* Responsive section spacing */
  --space-section: clamp(4rem, 10vw, 6rem);
  --space-page-x: clamp(1.5rem, 5vw, 3rem);
}
```

**Files to modify:**
- `app/globals.css` - Add spacing tokens
- `tailwind.config.js` - Add custom spacing values

### 1.2 Create Spacing Utility Classes

```css
/* app/globals.css */
.section-padding {
  padding-top: var(--space-section);
  padding-bottom: var(--space-section);
}

.container-padding {
  padding-left: var(--space-page-x);
  padding-right: var(--space-page-x);
}

.stack-sm > * + * { margin-top: var(--space-sm); }
.stack-md > * + * { margin-top: var(--space-md); }
.stack-lg > * + * { margin-top: var(--space-lg); }
```

### 1.3 Audit and Replace All Pages

Update each page to use consistent spacing:

| Page | Current | Target |
|------|---------|--------|
| Homepage | `py-20` | `section-padding` |
| Work | `py-20`, `mb-12`, `mb-16` | `section-padding`, `stack-lg` |
| Thoughts | `py-20 px-6` | `section-padding container-padding` |
| About | `py-20 px-6`, `mb-6`, `mb-8` | `section-padding container-padding stack-md` |
| Contact | `py-20` | `section-padding` |

**Files to modify:**
- `app/page.tsx`
- `app/work/page.tsx`
- `app/thoughts/page.tsx` (or `ThoughtsPageClient.tsx`)
- `app/about/page.tsx`
- `app/contact/page.tsx` (or `ContactPageClient.tsx`)

---

## Phase 2: Typography System Enforcement

**Problem**: CSS custom properties for type scale exist but Tailwind utilities used directly. Inconsistent `text-5xl md:text-7xl` patterns.

### 2.1 Create Semantic Typography Classes

```css
/* app/globals.css - Typography Classes */

/* Hero - Only for homepage main headline */
.text-hero {
  font-size: clamp(3rem, 10vw, 8rem);
  font-family: var(--font-cormorant);
  font-weight: 300;
  line-height: 1;
  letter-spacing: -0.02em;
}

/* Page Title - Main heading on each page */
.text-page-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-family: var(--font-cormorant);
  font-weight: 300;
  line-height: 1.1;
}

/* Section Title - Major sections within pages */
.text-section-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-family: var(--font-cormorant);
  font-weight: 400;
  line-height: 1.2;
}

/* Card Title - Featured cards, large cards */
.text-card-title {
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-family: var(--font-cormorant);
  font-weight: 400;
  line-height: 1.3;
}

/* Body Large - Introductory paragraphs, important descriptions */
.text-body-lg {
  font-size: clamp(1.125rem, 1.5vw, 1.25rem);
  line-height: 1.7;
  color: var(--color-muted, #888888);
}

/* Body - Standard paragraph text */
.text-body {
  font-size: clamp(1rem, 1.2vw, 1.0625rem);
  line-height: 1.7;
  color: var(--color-muted, #888888);
}

/* Label - UI labels, metadata, dates */
.text-label {
  font-size: 0.6875rem;
  font-family: var(--font-jetbrains);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--color-subtle, #666666);
}

/* Micro - Tags, tiny metadata */
.text-micro {
  font-size: 0.625rem;
  font-family: var(--font-jetbrains);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

### 2.2 Replace All Typography Patterns

Create a migration map:

| Current Pattern | Replace With |
|-----------------|--------------|
| `text-5xl md:text-7xl font-serif font-light` | `text-page-title` |
| `text-3xl md:text-4xl font-serif font-light` | `text-section-title` |
| `text-xl md:text-2xl font-serif font-light` | `text-card-title` |
| `text-[#888888] text-lg` | `text-body-lg` |
| `text-[#888888]` (paragraph) | `text-body` |
| `font-mono text-xs uppercase tracking-widest` | `text-label` |
| `text-[10px] font-mono uppercase` | `text-micro` |

**Files to modify:**
- All page files (app/*/page.tsx)
- All card components (ProjectCard, ThoughtCard, FeaturedProjectCard, etc.)
- NavigationEnhanced.tsx
- Footer component (to be created)

---

## Phase 3: Visual Hierarchy Improvements

**Problem**: Homepage hero elements compete for attention. Work page cards have identical weight.

### 3.1 Homepage Hero Hierarchy

Restructure the hero to create clear primary/secondary/tertiary levels:

```tsx
// app/page.tsx - Hero section restructure

{/* Primary: Name - Dominant visual */}
<h1 className="text-hero text-[#EAEAEA] mb-4">
  Amir H. Jalali
</h1>

{/* Secondary: Role - Supporting context */}
<p className="text-label text-[#666666] mb-8">
  Human Consultant
</p>

{/* Tertiary: Value prop - Readable supporting text */}
<p className="text-body-lg max-w-md mx-auto text-center">
  Transforming AI ambition into business reality.
  14 years of making data work.
</p>
```

**Key changes:**
- Remove or simplify the diagonal line treatment (competes with name)
- Increase contrast between levels using size AND opacity
- Animated profile photo should be secondary to name

### 3.2 Work Page Featured Differentiation

Make the featured project dramatically larger:

```tsx
// components/FeaturedProjectCard.tsx enhancements

{/* Make featured card 2x the visual presence */}
<article className="
  relative
  grid md:grid-cols-[1.2fr,1fr]
  gap-0
  border border-white/20  {/* Slightly brighter border */}
  rounded-3xl            {/* Larger radius */}
  overflow-hidden
  bg-white/[0.03]        {/* Subtle fill */}
  min-h-[400px] md:min-h-[500px]  {/* Taller */}
">
  {/* Add "Featured" badge */}
  <div className="absolute top-6 left-6 z-10">
    <span className="text-micro px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
      Featured Project
    </span>
  </div>

  {/* Title should be noticeably larger */}
  <h2 className="text-section-title text-[#EAEAEA] mb-4">
    {project.title}
  </h2>
</article>
```

### 3.3 Card Border Standardization

Establish consistent border treatments:

```css
/* app/globals.css - Card border tokens */
:root {
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-default: rgba(255, 255, 255, 0.12);
  --border-emphasis: rgba(255, 255, 255, 0.2);
}

/* Standard card */
.card-border {
  border: 1px solid var(--border-default);
  border-radius: 1rem;  /* rounded-2xl = 1rem */
}

/* Featured/emphasized card */
.card-border-emphasis {
  border: 1px solid var(--border-emphasis);
  border-radius: 1.5rem;
}

/* Subtle card (tags, small elements) */
.card-border-subtle {
  border: 1px solid var(--border-subtle);
  border-radius: 0.5rem;
}
```

**Files to modify:**
- `app/page.tsx` (HeroEnhanced)
- `components/FeaturedProjectCard.tsx`
- `components/ProjectCard.tsx`
- `components/ThoughtCard.tsx`
- `components/FeaturedArticleCard.tsx`

---

## Phase 4: Footer Implementation

**Problem**: No consistent footer across pages. Abrupt page endings feel unfinished.

### 4.1 Create Site Footer Component

```tsx
// components/Footer.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Linkedin, Twitter, Mail } from 'lucide-react'
import MagneticWrapper from '@/components/ui/magnetic-wrapper'

const navLinks = [
  { href: '/work', label: 'Work' },
  { href: '/thoughts', label: 'Thoughts' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const socialLinks = [
  { href: 'https://github.com/amirhjalali', icon: Github, label: 'GitHub' },
  { href: 'https://linkedin.com/in/amirhjalali', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://twitter.com/amirhjalali', icon: Twitter, label: 'Twitter' },
  { href: 'mailto:hello@amirhjalali.com', icon: Mail, label: 'Email' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-white/10 bg-[#050505]">
      {/* Subtle top gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="max-w-7xl mx-auto section-padding container-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

          {/* Brand Column */}
          <div>
            <Link href="/" className="inline-block">
              <span className="text-card-title text-[#EAEAEA]">AHJ</span>
            </Link>
            <p className="text-body mt-4 max-w-xs">
              Generative AI consultant transforming data into opportunity.
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="text-label text-[#EAEAEA] mb-4">Navigation</h4>
            <nav className="flex flex-col gap-3">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-body hover:text-[#EAEAEA] transition-colors w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Column */}
          <div>
            <h4 className="text-label text-[#EAEAEA] mb-4">Connect</h4>
            <div className="flex gap-4">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <MagneticWrapper key={href} strength={0.3}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#888888] hover:text-[#EAEAEA] hover:border-white/20 transition-all"
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                </MagneticWrapper>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-micro text-[#666666]">
            {currentYear} Amir H. Jalali. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
```

### 4.2 Add Footer to Layout

```tsx
// app/layout.tsx - Add Footer import and placement
import Footer from '@/components/Footer'

// Inside RootLayout, after main content:
<main id="main-content" className="pt-20" role="main">
  {children}
</main>
<Footer />
```

**Files to create:**
- `components/Footer.tsx`

**Files to modify:**
- `app/layout.tsx`

---

## Phase 5: Animation Rationalization

**Problem**: Multiple animation layers (page transitions, scroll triggers, hover states, noise grain, custom cursor) can feel overwhelming.

### 5.1 Create Animation Priority System

Define when each animation type should be used:

```ts
// lib/motion.ts - Add animation priority guide

/**
 * Animation Priority System
 *
 * Level 1 (Always): Page fade transitions, essential hover feedback
 * Level 2 (Default): Scroll reveals for main content, card hovers
 * Level 3 (Optional): Magnetic effects, custom cursor, loading sequence
 * Level 4 (Reduced Motion): Disable Levels 2-3, keep only Level 1
 */

export const shouldAnimate = {
  // Check user preference for reduced motion
  prefersReducedMotion: () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
}
```

### 5.2 Add Reduced Motion Support

```tsx
// components/AnimateOnScroll.tsx - Add reduced motion check
import { shouldAnimate } from '@/lib/motion'

export function AnimateOnScroll({ children, delay = 0, className }: Props) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const prefersReducedMotion = shouldAnimate.prefersReducedMotion()

  // Skip animation if user prefers reduced motion
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

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

### 5.3 Disable Loading Sequence by Default

The loading sequence should be opt-in, not default:

```tsx
// app/layout.tsx - Make LoadingSequence optional
// Remove LoadingSequence wrapper or set enabled={false} by default

// If keeping:
<LoadingSequence enabled={false}>
  {children}
</LoadingSequence>

// Or remove entirely and only use for special pages
```

### 5.4 Reduce Noise Animation Frequency

```css
/* app/globals.css - Slow down grain animation */
.noise-overlay {
  opacity: 0.04;  /* Slightly reduced */
  animation: grain 1s steps(6) infinite;  /* Slower, fewer steps */
}
```

**Files to modify:**
- `lib/motion.ts`
- `components/AnimateOnScroll.tsx`
- `app/layout.tsx` or wherever LoadingSequence is used
- `app/globals.css`
- `components/CustomCursor.tsx` (add reduced motion check)

---

## Phase 6: Mobile Navigation Enhancement

**Problem**: Full-screen overlay works but lacks current page indication and has disconnected branding.

### 6.1 Add Active State to Mobile Navigation

```tsx
// components/NavigationEnhanced.tsx - Mobile menu enhancements

'use client'
import { usePathname } from 'next/navigation'

export function NavigationEnhanced() {
  const pathname = usePathname()

  // In mobile menu:
  {navItems.map((item, index) => {
    const isActive = pathname === item.href

    return (
      <motion.div key={item.href} ...>
        <Link
          href={item.href}
          className={`
            text-3xl font-serif font-light transition-colors
            ${isActive ? 'text-[#EAEAEA]' : 'text-[#666666] hover:text-[#EAEAEA]'}
          `}
        >
          {item.label}
          {isActive && (
            <motion.div
              layoutId="mobile-nav-indicator"
              className="h-px w-full bg-white/30 mt-1"
            />
          )}
        </Link>
      </motion.div>
    )
  })}
```

### 6.2 Improve Mobile Menu Header

```tsx
// components/NavigationEnhanced.tsx - Better header branding

{/* Mobile menu header */}
<div className="flex items-center justify-between mb-12">
  <Link href="/" onClick={() => setMobileOpen(false)}>
    <span className="text-xl font-serif font-light text-[#EAEAEA]">
      Amir H. Jalali
    </span>
  </Link>

  <button
    onClick={() => setMobileOpen(false)}
    className="p-3 -mr-3 text-[#888888] hover:text-[#EAEAEA] transition-colors"
    aria-label="Close menu"
  >
    <X className="w-6 h-6" />
  </button>
</div>
```

### 6.3 Desktop Navigation Active State

```tsx
// components/NavigationEnhanced.tsx - Desktop nav active state

{navLinks.map(link => {
  const isActive = pathname === link.href

  return (
    <Link
      key={link.href}
      href={link.href}
      className={`
        text-label transition-colors relative
        ${isActive ? 'text-[#EAEAEA]' : 'text-[#888888] hover:text-[#EAEAEA]'}
      `}
    >
      {link.label}
      {isActive && (
        <motion.div
          layoutId="desktop-nav-indicator"
          className="absolute -bottom-1 left-0 right-0 h-px bg-white/30"
        />
      )}
    </Link>
  )
})}
```

**Files to modify:**
- `components/NavigationEnhanced.tsx`

---

## Phase 7: Form & Accessibility Improvements

**Problem**: Form inputs rely on subtle borders that may have contrast issues. Focus states need enhancement.

### 7.1 Enhanced Input Styles

```css
/* app/globals.css - Form input improvements */

.input-field {
  width: 100%;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  color: #EAEAEA;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.input-field::placeholder {
  color: #666666;
}

.input-field:hover {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.04);
}

.input-field:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.05);
}

/* Error state */
.input-field[aria-invalid="true"] {
  border-color: rgba(255, 100, 100, 0.5);
}

/* Label styling */
.input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.6875rem;
  font-family: var(--font-jetbrains);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #888888;
}

/* Error message */
.input-error {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #888888;
}
```

### 7.2 Update Contact Form Component

```tsx
// components/ContactForm.tsx (or wherever the form is)

<div className="space-y-6">
  <div>
    <label htmlFor="name" className="input-label">
      Name <span className="text-[#666666]">*</span>
    </label>
    <input
      type="text"
      id="name"
      name="name"
      required
      aria-required="true"
      aria-invalid={errors.name ? "true" : "false"}
      aria-describedby={errors.name ? "name-error" : undefined}
      className="input-field"
      placeholder="Your name"
    />
    {errors.name && (
      <p id="name-error" className="input-error" role="alert">
        {errors.name}
      </p>
    )}
  </div>

  {/* Repeat for email, message, etc. */}
</div>
```

### 7.3 Focus Visible Enhancement

```css
/* app/globals.css - Global focus visible styles */

/* Remove default focus, add custom */
*:focus {
  outline: none;
}

/* Keyboard focus only */
*:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

/* For elements with custom focus styles */
.custom-focus:focus-visible {
  outline: none;
}
```

**Files to modify:**
- `app/globals.css`
- `app/contact/ContactPageClient.tsx` (or equivalent)

---

## Phase 8: Expandable Content Affordance

**Problem**: Users may not know sections can expand. Interaction affordance isn't obvious.

### 8.1 Improve Visual Indicator

```tsx
// components/ExpandableContent.tsx - Better expand indicator

export function ExpandableList({
  items,
  previewCount = 3
}: {
  items: string[]
  previewCount?: number
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasMore = items.length > previewCount

  const visibleItems = isExpanded ? items : items.slice(0, previewCount)
  const hiddenCount = items.length - previewCount

  return (
    <div>
      <ul className="space-y-2">
        {visibleItems.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="text-body flex gap-3"
          >
            <span className="text-[#444444] select-none">-</span>
            <span>{item}</span>
          </motion.li>
        ))}
      </ul>

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center gap-2 text-label text-[#666666] hover:text-[#EAEAEA] transition-colors group"
        >
          <span className="border-b border-dashed border-current pb-0.5">
            {isExpanded ? 'Show less' : `Show ${hiddenCount} more`}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="transition-transform"
          >
            <ChevronDown className="w-3 h-3" />
          </motion.div>
        </button>
      )}
    </div>
  )
}
```

### 8.2 Add Collapse Animation

```tsx
// components/ExpandableContent.tsx - Smoother animation

<AnimatePresence initial={false}>
  <motion.ul
    className="space-y-2 overflow-hidden"
    initial={false}
    animate={{ height: 'auto' }}
  >
    {visibleItems.map((item, i) => (
      <motion.li
        key={item}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="text-body flex gap-3"
      >
        <span className="text-[#444444] select-none">-</span>
        <span>{item}</span>
      </motion.li>
    ))}
  </motion.ul>
</AnimatePresence>
```

**Files to modify:**
- `components/ExpandableContent.tsx`

---

## Phase 9: Performance & Polish

**Problem**: Multiple animation layers may cause performance issues on lower-end devices.

### 9.1 Add Performance Detection

```ts
// lib/performance.ts
export function getDevicePerformance(): 'high' | 'medium' | 'low' {
  if (typeof window === 'undefined') return 'medium'

  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'low'
  }

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 4
  if (cores <= 2) return 'low'
  if (cores <= 4) return 'medium'

  // Check device memory if available
  const memory = (navigator as any).deviceMemory
  if (memory && memory < 4) return 'low'
  if (memory && memory < 8) return 'medium'

  return 'high'
}

export function shouldUseComplexAnimations(): boolean {
  return getDevicePerformance() !== 'low'
}
```

### 9.2 Conditionally Disable Heavy Effects

```tsx
// components/CustomCursor.tsx - Performance check
import { shouldUseComplexAnimations } from '@/lib/performance'

export function CustomCursor() {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Only render on high-performance desktop devices
    const isMobile = window.matchMedia('(pointer: coarse)').matches
    const hasPerformance = shouldUseComplexAnimations()
    setShouldRender(!isMobile && hasPerformance)
  }, [])

  if (!shouldRender) return null

  // ... rest of component
}
```

### 9.3 Lazy Load Heavy Components

```tsx
// app/layout.tsx - Dynamic imports for non-critical components
import dynamic from 'next/dynamic'

const CustomCursor = dynamic(() => import('@/components/CustomCursor'), {
  ssr: false,
  loading: () => null,
})

const LoadingSequence = dynamic(() => import('@/components/LoadingSequence'), {
  ssr: false,
})
```

**Files to create:**
- `lib/performance.ts`

**Files to modify:**
- `components/CustomCursor.tsx`
- `app/layout.tsx`

---

## Phase 10: Content & Copywriting Polish

**Problem**: "Human Consultant" tagline is cryptic. Some descriptive text could be stronger.

### 10.1 Homepage Messaging

Update the value proposition to be clearer:

```tsx
// Current: "Human Consultant" (cryptic)
// Options to consider:

// Option A: Descriptive
<p className="text-label">AI Strategy Consultant</p>
<p className="text-body-lg">
  Helping businesses harness AI to solve real problems.
</p>

// Option B: Outcome-focused
<p className="text-label">AI Consultant</p>
<p className="text-body-lg">
  From AI strategy to implementation.
  14 years making technology deliver results.
</p>

// Option C: Keep "Human" but explain
<p className="text-label">Human Consultant</p>
<p className="text-body-lg">
  The human element in AI transformation.
  Strategy, implementation, and hands-on expertise.
</p>
```

### 10.2 CTA Button Copy

Review and improve call-to-action text:

| Current | Consider |
|---------|----------|
| "View Work" | "See Projects" or "View Portfolio" |
| "Read Thoughts" | "Read Articles" or "Latest Thinking" |
| "Get in Touch" | "Start a Conversation" or "Work Together" |
| "Learn More" | More specific: "Read Case Study" |

### 10.3 About Page Introduction

The about page should immediately communicate value:

```tsx
// Current: Generic bio
// Improved: Lead with impact

<p className="text-body-lg mb-8">
  I've spent 14 years helping organizations turn data into decisions
  and AI experiments into production systems. Currently serving as
  CTO at AVENU AI, I focus on the practical side of AI adoption—not
  just what's possible, but what actually works.
</p>
```

**Files to modify:**
- `app/page.tsx` (or HeroEnhanced)
- `app/about/page.tsx`
- Various CTA buttons throughout

---

## Implementation Priority

| Phase | Impact | Effort | Priority | Estimate |
|-------|--------|--------|----------|----------|
| Phase 1: Spacing System | High | Medium | **P0** | 2-3 hours |
| Phase 2: Typography Enforcement | High | Medium | **P0** | 2-3 hours |
| Phase 3: Visual Hierarchy | High | Medium | **P1** | 2-3 hours |
| Phase 4: Footer | Medium | Low | **P1** | 1 hour |
| Phase 5: Animation Rationalization | Medium | Low | **P1** | 1-2 hours |
| Phase 6: Mobile Nav Enhancement | Medium | Low | **P2** | 1 hour |
| Phase 7: Form Accessibility | Medium | Low | **P2** | 1-2 hours |
| Phase 8: Expandable Affordance | Low | Low | **P3** | 30 min |
| Phase 9: Performance Polish | Medium | Medium | **P2** | 2 hours |
| Phase 10: Copywriting | Medium | Low | **P3** | 1 hour |

---

## Quick Wins (15 minutes each)

1. **Add spacing tokens to globals.css** - Foundation for consistency
2. **Add footer to layout.tsx** - Immediately improves page endings
3. **Add active state to navigation** - Better wayfinding
4. **Reduce noise animation speed** - Less distracting
5. **Add `prefers-reduced-motion` check** - Accessibility improvement
6. **Enhance input focus states** - Better form UX

---

## Success Metrics

After implementation, the site should:

- [ ] Have consistent spacing rhythm across all pages
- [ ] Use semantic typography classes instead of utility combinations
- [ ] Have clear visual hierarchy on every page
- [ ] Include a footer with navigation and social links
- [ ] Respect user's reduced motion preferences
- [ ] Show active state in navigation
- [ ] Have accessible, clearly-focused form inputs
- [ ] Perform smoothly on mid-range devices
- [ ] Communicate value proposition within 5 seconds

---

## Design System Audit Checklist

Before marking complete, verify:

**Spacing**
- [ ] All `py-20`, `py-24` replaced with `section-padding`
- [ ] All arbitrary `mb-*` replaced with stack utilities
- [ ] Container padding consistent across pages

**Typography**
- [ ] No raw `text-5xl md:text-7xl` patterns remaining
- [ ] All headings use semantic classes
- [ ] Body text uses `text-body` or `text-body-lg`
- [ ] Labels use `text-label`

**Components**
- [ ] All cards use standardized border tokens
- [ ] Buttons follow primary/secondary patterns
- [ ] Form inputs use `.input-field` class

**Motion**
- [ ] Reduced motion preference respected
- [ ] Heavy animations conditionally loaded
- [ ] No animation on low-performance devices

**Accessibility**
- [ ] Focus visible on all interactive elements
- [ ] Form errors properly announced
- [ ] Navigation shows current page

---

## Resources

**Design Systems Reference:**
- [Radix UI Themes](https://www.radix-ui.com/themes) - Spacing and type scale
- [Tailwind Spacing](https://tailwindcss.com/docs/customizing-spacing)
- [WCAG Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)

**Performance:**
- [web.dev Performance](https://web.dev/performance/)
- [Framer Motion Performance](https://www.framer.com/motion/guide-reduce-bundle-size/)

**Accessibility:**
- [A11y Checklist](https://www.a11yproject.com/checklist/)
- [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
