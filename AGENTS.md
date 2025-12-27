# Repository Guidelines

## Agents

### article-generator
**Purpose:** Generate AI-powered blog articles for the thoughts section.

**When to use:** When creating new article content for `/thoughts/`.

**Capabilities:**
- Generate article content using GPT-4o-mini via `/api/generate-article`
- Create DALL-E 3 images for article headers
- Save drafts to the database via `/api/drafts`
- Format content with proper markdown structure
- Generate SEO-friendly titles, excerpts, and tags

**Files involved:**
- `app/api/generate-article/route.ts` - Main generation endpoint
- `app/api/drafts/route.ts` - Draft persistence
- `lib/generateArticle.ts` - Article generation logic
- `scripts/generate-article-static.js` - GitHub Actions generator

---

### component-builder
**Purpose:** Create new React components following project patterns.

**When to use:** When adding new UI components to the site.

**Capabilities:**
- Build components using shadcn/ui as base
- Apply Tailwind CSS with `cn()` utility
- Use Framer Motion for animations
- Implement proper TypeScript interfaces
- Follow compound component patterns when needed

**Patterns to follow:**
```typescript
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline'
}

export function Component({ className, variant = 'default', ...props }: ComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('base-classes', className)}
      {...props}
    />
  )
}
```

**Files to reference:**
- `components/ui/*.tsx` - Base UI components
- `components/ProjectCard.tsx` - Card pattern example
- `components/HeroEnhanced.tsx` - Animation patterns

---

### api-builder
**Purpose:** Create new API routes following established patterns.

**When to use:** When adding new backend functionality.

**Capabilities:**
- Create Next.js App Router API routes
- Implement authentication checks with `getSession()`
- Use Prisma for database operations
- Handle errors consistently with try-catch
- Return proper HTTP status codes

**Pattern:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/app/actions/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await prisma.model.findMany()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Operation failed', details: error.message },
      { status: 500 }
    )
  }
}
```

**Files to reference:**
- `app/api/drafts/route.ts` - CRUD pattern
- `app/api/articles/[id]/route.ts` - Dynamic routes
- `lib/api-utils.ts` - Shared utilities

---

### seo-auditor
**Purpose:** Optimize pages for search engines.

**When to use:** Before deploying new pages or when improving rankings.

**Capabilities:**
- Audit meta tags and Open Graph data
- Check structured data (JSON-LD)
- Validate sitemap entries
- Analyze heading hierarchy
- Check image alt attributes

**Files involved:**
- `app/sitemap.ts` - Dynamic sitemap
- `lib/seo.ts` - SEO utilities
- `components/StructuredData.tsx` - JSON-LD component
- `app/layout.tsx` - Root metadata

**Checklist:**
- [ ] Title under 60 characters
- [ ] Description under 160 characters
- [ ] Open Graph image present
- [ ] Canonical URL set
- [ ] Structured data valid
- [ ] All images have alt text

---

### performance-auditor
**Purpose:** Analyze and improve site performance.

**When to use:** When optimizing load times or before major releases.

**Capabilities:**
- Audit Core Web Vitals (LCP, FID, CLS)
- Check bundle sizes with `npm run analyze`
- Identify render-blocking resources
- Optimize image loading
- Review dynamic imports

**Commands:**
```bash
npm run build          # Check build output size
npm run analyze        # Bundle analysis
npm run start          # Test production build
```

**Files involved:**
- `lib/performance.ts` - Performance utilities
- `lib/image-optimization.ts` - Image helpers
- `components/LazyImage.tsx` - Lazy loading

**Optimization patterns:**
- Use `next/image` for all images
- Dynamic import heavy components
- Implement proper loading states
- Use React.memo for expensive components

---

### accessibility-auditor
**Purpose:** Ensure WCAG 2.1 AA compliance.

**When to use:** When building new features or auditing existing pages.

**Capabilities:**
- Check keyboard navigation
- Validate ARIA attributes
- Test color contrast ratios
- Verify focus indicators
- Check screen reader compatibility

**Files involved:**
- `lib/accessibility.ts` - A11y utilities
- `components/SkipNavigation.tsx` - Skip links
- `hooks/useFocusTrap.ts` - Focus management

**Checklist:**
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Images have alt text
- [ ] Forms have labels
- [ ] ARIA roles used correctly

---

### deploy-validator
**Purpose:** Validate the build before deployment.

**When to use:** Before pushing to main branch.

**Capabilities:**
- Run full build pipeline
- Execute type checking
- Run linting
- Verify environment variables
- Test API routes locally

**Commands to run:**
```bash
npm run lint           # ESLint check
npm run type-check     # TypeScript validation
npm run build          # Production build
npm run start          # Verify build works
```

**Pre-deploy checklist:**
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] No console errors in dev tools
- [ ] Environment variables documented

---

### content-editor
**Purpose:** Review and improve article content.

**When to use:** When editing drafts before publishing.

**Capabilities:**
- Check grammar and readability
- Optimize for SEO keywords
- Ensure consistent formatting
- Validate markdown syntax
- Improve excerpt and title

**Content guidelines:**
- Titles: 50-60 characters, compelling
- Excerpts: 150-160 characters, summarize value
- Content: Use headers (H2, H3), short paragraphs
- Images: Include 1-2 relevant images
- Tags: 3-5 relevant keywords

**Admin panel:** `/admin` for managing drafts

---

### type-checker
**Purpose:** Ensure TypeScript best practices.

**When to use:** When adding new types or reviewing code.

**Capabilities:**
- Validate interface definitions
- Check for `any` type usage
- Ensure proper generic usage
- Verify export consistency
- Check return type annotations

**Commands:**
```bash
npm run type-check     # Run TypeScript compiler
```

**Type patterns:**
```typescript
// Prefer interface for objects
interface Article {
  id: string
  title: string
  content: string
}

// Use type for unions
type Status = 'draft' | 'published' | 'archived'

// Generic API response
interface ApiResponse<T> {
  data?: T
  error?: string
}
```

---

### note-processor
**Purpose:** Handle voice note transcription and processing.

**When to use:** When working with the notes feature.

**Capabilities:**
- Process voice recordings via Whisper API
- Queue notes for background processing
- Monitor processing status via Redis
- Handle batch processing

**Files involved:**
- `app/api/notes/route.ts` - Notes CRUD
- `app/api/notes/[id]/process/route.ts` - Processing trigger
- `lib/note-processing-service.ts` - Processing logic
- `lib/redis.ts` - Queue management
- `scripts/note-worker.js` - Background worker

**Commands:**
```bash
npm run worker         # Start processing worker
```

## Project Structure & Module Organization
The site runs on Next.js App Router with TypeScript. Page roots live in `app/`; each subfolder (for example `app/projects` or `app/thoughts/[id]`) maps to a route and usually exports both layout and page components. Presentation building blocks stay in `components/`, with design atoms under `components/ui`. Reusable logic such as analytics helpers and article metadata sits in `lib/`, while React hooks belong in `hooks/`. Static assets, including SEO metadata and imagery, are stored in `public/`. Automation helpers and onboarding scripts live in `scripts/`, and supporting documentation belongs in `docs/` and `archive/`.

## Build, Test, and Development Commands
- `npm run dev`: start the Turbopack dev server on `localhost:3000`.
- `npm run build`: generate the production bundle (also used for static export).
- `npm run start`: serve the built bundle locally for release verification.
- `npm run lint`: run Next.js ESLint rules across the workspace.
- `npm run type-check`: run TypeScript in no‐emit mode to guard types.
- `npm run analyze`: rebuild with `ANALYZE=true` to inspect bundle size.
- `npm run format` / `format:check`: apply or verify Prettier formatting.
- `npm run clean`: remove `.next/` and `node_modules/` to reset local state.
- `npm run worker`: start the note processing worker.
- `npm run generate:published`: generate published articles JSON.

## Testing Guidelines
Automated tests are not yet provisioned (`npm run test` is a stub). For now, validate features manually through `npm run dev` and confirm static exports with `npm run build && npm run start`. When adding tests, colocate component specs near the source (for example `components/__tests__/Component.test.tsx`) and aim for both happy-path and accessibility coverage.

## Code Style & Formatting
- **TypeScript-first**: Prefer `.tsx` for components and `.ts` for utilities
- **Indentation**: 2 spaces (enforced by Prettier)
- **Imports**: Use absolute imports with `@/` prefix for internal modules. Group external imports first, then internal imports, then type imports
- **Naming**: Components use PascalCase (`HeroEnhanced.tsx`), hooks use camelCase (`useThemeToggle.ts`), utilities use camelCase, constants use UPPER_SNAKE_CASE
- **Route folders**: lowercase with hyphens when needed
- **Tailwind**: Keep utility classes concise, extract into reusable components when they exceed readability
- **Trailing commas**: Enforced by Prettier for all multi-line structures

## Type System & Interfaces
- Use `interface` for object shapes that might be extended
- Use `type` for unions, primitives, and utility types
- Export all types from `lib/types.ts` when shared across components
- Use generic types properly: `<T = any>` for flexible APIs
- Prefer explicit return types for public APIs

## Error Handling Patterns
- Use the `ApiResponse<T>` interface from `lib/api-utils.ts` for all API responses
- Throw `ApiError` class for known error scenarios with status codes
- Implement retry logic with exponential backoff for network requests
- Use try-catch-finally patterns for resource cleanup
- Return error objects rather than throwing for user-facing operations

## Component Architecture
- Use shadcn/ui components as base (`components/ui/`)
- Follow the compound component pattern for complex UI
- Use `class-variance-authority` (cva) for component variants
- Implement proper TypeScript props with `React.ComponentProps`
- Use `cn()` utility from `lib/utils.ts` for conditional classes
- Forward refs when necessary for DOM interaction

## Import Organization
```typescript
// External libraries (React, Next.js, etc.)
import { motion } from 'framer-motion'
import Link from 'next/link'

// Internal components (absolute imports)
import Spotlight from '@/components/Spotlight'
import PortraitReveal from '@/components/PortraitReveal'

// Utilities and types
import { ApiResponse } from '@/lib/api-utils'
import type { Article } from '@/lib/types'
```

## Database & ORM Patterns
- Use Prisma as the ORM with schema in `prisma/schema.prisma`
- All database operations should be in `lib/server/` or API routes
- Use transactions for multi-table operations
- Implement proper error handling for database queries
- Use environment variables for database connections

## Performance & Optimization
- Use Next.js Image component for all images
- Implement lazy loading for heavy components
- Use React.memo for expensive pure components
- Optimize bundle size with dynamic imports
- Use the `apiCache` utility for API response caching
- Implement rate limiting for public APIs

## Security Best Practices
- Never commit secrets or API keys
- Use environment variables with `NEXT_PUBLIC_` prefix for client-side vars
- Implement proper input validation with Zod schemas
- Use CSRF protection for form submissions
- Sanitize user-generated content
- Implement proper authentication checks

## Commit & Pull Request Guidelines
- Follow Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Keep subject lines under 72 characters with scope: `feat(app/projects): add case studies grid`
- PRs should include: summary of changes, screenshots for UI updates, linked issues, and checklist of commands executed (lint, build, type-check)
- Request review for any user-facing change or migration
- Ensure all tests pass and build succeeds before merging

## Environment & Configuration
- Create `.env.local` from `.env.example` for local development
- Use `NEXT_PUBLIC_` prefix for client-side environment variables
- Never commit `.env.local` or any secrets to the repository
- After dependency updates, rerun `npm run lint` and `npm run dev` to detect breaking changes
- Use Vercel for deployment with proper environment variable management

## Development Workflow
1. Always run `npm run lint` before committing changes
2. Use `npm run type-check` to verify TypeScript compliance
3. Test features manually with `npm run dev`
4. Verify production build with `npm run build && npm run start`
5. Use absolute imports (`@/`) for all internal module references
6. Follow the existing component patterns and naming conventions
7. Add proper TypeScript types for all new interfaces and props