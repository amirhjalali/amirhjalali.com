# Repository Guidelines

## Project Structure & Module Organization
The site runs on Next.js App Router with TypeScript. Page roots live in `app/`; each subfolder (for example `app/projects` or `app/thoughts/[id]`) maps to a route and usually exports both layout and page components. Presentation building blocks stay in `components/`, with design atoms under `components/ui`. Reusable logic such as analytics helpers and article metadata sits in `lib/`, while React hooks belong in `hooks/`. Static assets, including SEO metadata and imagery, are stored in `public/`. Automation helpers and onboarding scripts live in `scripts/` and `tasks/`, and supporting documentation belongs in `docs/` and `archive/`.

## Build, Test, and Development Commands
- `npm run dev`: start the Turbopack dev server on `localhost:3000`.
- `npm run build`: generate the production bundle (also used for static export).
- `npm run start`: serve the built bundle locally for release verification.
- `npm run lint`: run Next.js ESLint rules across the workspace.
- `npm run type-check`: run TypeScript in no‐emit mode to guard types.
- `npm run analyze`: rebuild with `ANALYZE=true` to inspect bundle size.
- `npm run format` / `format:check`: apply or verify Prettier formatting.
- `npm run clean`: remove `.next/` and `node_modules/` to reset local state.

## Coding Style & Naming Conventions
Code is TypeScript-first; prefer `.tsx` for components and `.ts` for utilities. Keep two-space indentation and rely on Prettier for wrapping and trailing commas. Components use PascalCase (`HeroEnhanced.tsx`), hooks use camelCase (`useThemeToggle.ts`), and route folders stay lowercase with hyphens when needed. Tailwind utility classes should remain concise and extracted into reusable components once they exceed readability. Always run `npm run lint` before submitting changes.

## Testing Guidelines
Automated tests are not yet provisioned (`npm run test` is a stub). For now, validate features manually through `npm run dev` and confirm static exports with `npm run build && npm run start`. When adding tests, colocate component specs near the source (for example `components/__tests__/Component.test.tsx`) and aim for both happy-path and accessibility coverage.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commits (`feat:`, `fix:`, `docs:`). Keep subject lines under 72 characters and describe scope (`feat(app/projects): add case studies grid`). PRs should include: summary of changes, screenshots or screen recordings for UI updates, linked issues if applicable, and a checklist of commands executed (lint, build). Request review for any user-facing change or migration.

## Environment & Configuration
Create `.env.local` from `.env.example` and supply values such as `NEXT_PUBLIC_GA_ID`. Never commit secrets; the repo is public. After dependency updates, rerun `npm run lint` and `npm run dev` to detect breaking API changes from Next.js or Tailwind.
