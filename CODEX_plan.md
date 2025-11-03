# CODEX Remediation & Growth Plan

## Snapshot
- Site ships as a static Next.js export with all editorial content injected at runtime from `localStorage`. This keeps deploys simple but leaves the Thoughts experience brittle for SEO, sharing, and collaborative editing.
- Admin tooling (`app/admin`) provides rich draft workflows, yet everything (auth, drafts, published state) lives in the browser, so new devices start from scratch and the live site cannot surface timely articles.
- Focus for the next cycle: harden the publishing pipeline, eliminate content drift, and turn the Thoughts section into a timely, visual showcase of AI commentary.

## Critical Fixes (ordered)
1. **Stabilise article data source**  
   - Problem: `app/thoughts/page.tsx` and `app/thoughts/[id]/ThoughtPageClient.tsx` depend on `initializeDefaultArticles()` (`lib/articles.ts:534`) to hydrate content client-side. Static build ships empty HTML, hurting SEO, social embeds, and cold navigations.  
   - Plan: move canonical article data into versioned JSON/MD under `public/data/` (or a lightweight CMS/content layer). Generate IDs and slugs at build time, import them in server components, and fall back to localStorage only for admin drafts. Provide a publish script that writes to `published.json` so Git tracks history.

2. **Fix dynamic routing & typing debt**  
   - Problem: `app/thoughts/[id]/page.tsx` still fabricates params (`generateStaticParams`) and types `params` as a `Promise`, masking real routing regressions when IDs diverge.  
   - Plan: once articles live in a real data source, generate params from that dataset, remove the fake `Array.from`, and treat `params` as `Readonly<{ id: string }>`; add a fallback that returns 404 for missing slugs so static export aligns with live URLs.

3. **Harden admin authentication & persistence**  
   - Problem: Credentials (`lib/auth.ts`) are baked into the bundle and sessions sit in `localStorage`, so anyone can view-source the password and publish. Draft/publish actions never leave the browser, so collaboration is impossible.  
   - Plan: introduce a minimal server-backed workflow (e.g., Supabase/Convex, Next API routes once deployed on Vercel, or git-based content commits) with encrypted secrets. Until then, gate admin behind GitHub OAuth or at least environment-injected hashed credentials and manual content export.

4. **Reinstate automated quality gates**  
   - Problem: `npm run test` is a stub and no lint/type checks run in CI for PRs. Given the animation-heavy UI, regressions slip through.  
   - Plan: wire GitHub Actions to run `npm run lint` and `npm run type-check`, add component smoke tests (Playwright or React Testing Library) for navigation/SEO meta, and capture Lighthouse snapshots for key pages.

## Future Enhancements – Thoughts Experience
1. **Real-time topical feed**  
   - Integrate a daily job (serverless cron or GitHub Action) that pulls trending AI headlines (e.g., RSS/APIs from OpenAI, Anthropic, Financial Times tech desk) into a staging queue (`public/data/topics-queue.json`). Surface a “Today’s Signals” panel summarising the latest stories with links and short takes.
   - Add metadata fields (`source`, `publishedAt`, `geoFocus`) to articles so curated responses can cite original reporting and power filters (Global, Policy, Research, Products).

2. **Editorial workflow upgrades**  
   - Replace local markdown strings with MDX files (e.g., `content/thoughts/<slug>.mdx`) so authors can draft in Git, include interactive charts, and attach frontmatter (`heroImage`, `spotlightQuote`, `callToAction`). Provide a CLI task to promote queued topics into full articles with scaffolding.

3. **Visual layout refresh**  
   - Redesign the grid into a staggered, magazine-style layout: one hero feature (full-bleed image with gradient overlay), two secondary highlights, and a masonry feed for the rest. Use Tailwind’s `grid-auto-rows` plus `aspect-[4/3]` to stabilise card heights and prevent jumpiness.
   - Generate responsive hero imagery via Stable Diffusion / DALLE with consistent art direction; store renditions in `public/images/thoughts/<slug>/` and compute `srcset` via a build script so `LazyImage` can deliver crisp assets without manual resizing.

4. **Contextual depth**  
   - Add “Why it matters” and “Actionable next steps” callouts for each article, pulling key bullet points into an `ArticleInsights` component. Offer related reading powered by vector similarity (e.g., embeddings persisted in `public/data/embeddings.json`) to keep readers exploring.

## Operational Next Steps (suggested cadence)
- **Week 1–2:** Stand up content data source, refactor Thoughts pages to use server-loaded data, and adjust routing/tests.  
- **Week 3:** Ship updated admin workflow (temporary manual publish script if full backend is deferred).  
- **Week 4+:** Begin Thoughts revamp—land hero layout, automate topical ingest, then iterate on insights/related content.  
- Throughout: capture before/after metrics (Time to First Byte, Lighthouse SEO score, share card integrity) to quantify gains.
