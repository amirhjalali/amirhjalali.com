# Repository Guidelines

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