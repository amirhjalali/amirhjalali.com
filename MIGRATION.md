# GitHub Pages Migration Plan

## Overview
Migrate Next.js application from Vercel to GitHub Pages static hosting.

## Pre-Migration Checklist
- [x] Analyze current Vercel deployment configuration
- [x] Identify incompatible features
- [x] Document required changes

## Migration Steps

### Phase 1: Configuration Changes

#### Step 1.1: Enable Static Export
**File**: `next.config.ts`
**Action**: Add `output: 'export'` to enable static site generation
**Details**: This tells Next.js to generate static HTML files instead of requiring a Node.js server

#### Step 1.2: Remove Server-Side Features from Config
**File**: `next.config.ts`
**Actions**:
- Remove `images` configuration (lines 4-10) - server-side image optimization not supported
- Remove `compress` option (line 11) - handled by CDN
- Remove `async headers()` function (lines 22-60) - not supported in static export
- Remove `compiler.removeConsole` (lines 14-16) - not needed for static export
- Keep `poweredByHeader: false` and `reactStrictMode: true`
**Rationale**: GitHub Pages serves static files only; these features require a Node.js server

#### Step 1.3: Update Image Domains Configuration
**File**: `next.config.ts`
**Action**: Since image optimization is removed, update any Next.js Image components to use standard img tags or unoptimized prop
**Details**: Will need to review components using next/image in later steps

### Phase 2: Code Changes

#### Step 2.1: Remove API Route
**File**: `app/api/contact/route.ts`
**Action**: Delete this file
**Rationale**: API routes require a server; GitHub Pages cannot execute server-side code
**Alternative**: Contact form will need to use a third-party service (Formspree, Netlify Forms alternative, or EmailJS)

#### Step 2.2: Update Contact Page
**File**: `app/contact/page.tsx`
**Action**: Update contact form to use client-side submission to external service
**Details**: Replace API call with direct submission to service like Formspree or mailto link

#### Step 2.3: Fix Dynamic Routes
**File**: `app/thoughts/[id]/page.tsx`
**Action**: Add `generateStaticParams` function to pre-render all thought pages
**Details**: Export async function that returns array of all possible [id] values
**Example**:
```typescript
export async function generateStaticParams() {
  return thoughts.map(thought => ({ id: thought.id }))
}
```

#### Step 2.4: Review and Update Image Components
**Files**: All components using `next/image`
**Action**: Add `unoptimized` prop or convert to standard img tags
**Details**: Search for all Image imports and usage

#### Step 2.5: Update Sitemap Generation
**File**: `app/sitemap.ts`
**Action**: Verify sitemap works with static export
**Details**: Ensure all URLs are absolute and include correct domain

### Phase 3: GitHub Pages Setup

#### Step 3.1: Add .nojekyll File
**File**: `public/.nojekyll`
**Action**: Create empty file
**Rationale**: Prevents GitHub Pages from ignoring files starting with underscore (Next.js uses _next directory)

#### Step 3.2: Create GitHub Actions Workflow
**File**: `.github/workflows/deploy.yml`
**Action**: Create workflow for automatic deployment on push to main
**Details**: Workflow will:
1. Checkout code
2. Install dependencies
3. Build static site
4. Deploy to gh-pages branch

#### Step 3.3: Update Package.json Scripts
**File**: `package.json`
**Action**: Add export script for clarity
**Details**: Add `"export": "next build"` to make it clear this generates static export

### Phase 4: Testing & Validation

#### Step 4.1: Local Build Test
**Action**: Run `npm run build` locally
**Validation**:
- Check `out/` directory is created
- Verify all pages are generated as HTML files
- Check for any build errors or warnings

#### Step 4.2: Test Static Files Locally
**Action**: Serve the `out/` directory with a static file server
**Command**: `npx serve out`
**Validation**:
- All pages load correctly
- Navigation works
- Images display properly
- No console errors

#### Step 4.3: Check for Broken Links
**Action**: Review all internal links
**Validation**: Ensure no references to /api routes or server-side features

### Phase 5: GitHub Configuration

#### Step 5.1: Configure Repository Settings
**Action**: In GitHub repository settings
**Steps**:
1. Go to Settings > Pages
2. Set source to "GitHub Actions" (or gh-pages branch if using peaceiris action)
3. Configure custom domain if using amirhjalali.com

#### Step 5.2: Update DNS (if using custom domain)
**Action**: Point domain to GitHub Pages
**Details**:
- A records: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
- Or CNAME: username.github.io

#### Step 5.3: Add Custom Domain File
**File**: `public/CNAME`
**Action**: Create file with content `amirhjalali.com`
**Rationale**: Tells GitHub Pages to serve site at custom domain

### Phase 6: Deployment

#### Step 6.1: Push Changes to Main Branch
**Action**: Commit all changes and push to trigger GitHub Actions
**Command**: Standard git workflow

#### Step 6.2: Monitor GitHub Actions
**Action**: Watch workflow execution in GitHub Actions tab
**Validation**: Ensure workflow completes successfully

#### Step 6.3: Verify Deployment
**Action**: Visit deployed site
**Validation**:
- Site loads at GitHub Pages URL or custom domain
- All pages accessible
- No 404 errors
- Images load
- Navigation works

### Phase 7: Cleanup

#### Step 7.1: Remove Vercel-Specific Files
**Action**: Search for and remove any Vercel configuration
**Files**: Check for `.vercel/` directory, `vercel.json`

#### Step 7.2: Update README
**File**: `README.md`
**Action**: Update deployment instructions to reflect GitHub Pages setup
**Details**: Remove Vercel references, add GitHub Pages deployment info

#### Step 7.3: Update Environment Documentation
**Action**: Document any environment variables or build settings
**Details**: GitHub Actions secrets if needed for future features

## Rollback Plan

If migration fails:
1. Revert all commits related to GitHub Pages migration
2. Restore original `next.config.ts`
3. Re-deploy to Vercel
4. Keep Vercel deployment active until GitHub Pages is fully validated

## Known Limitations After Migration

1. **No API Routes**: Contact form requires external service
2. **No Image Optimization**: Images served as-is without Next.js optimization
3. **No Server-Side Rendering**: All pages are static HTML
4. **No Custom Headers**: Security headers must be configured via GitHub Pages or CDN
5. **No Runtime Environment Variables**: All config must be build-time

## Post-Migration Monitoring

1. Check Google Search Console for crawl errors
2. Verify all analytics still tracking
3. Monitor Core Web Vitals
4. Check for any broken external links
5. Validate SSL certificate on custom domain

## Success Criteria

- [ ] Site builds without errors
- [ ] All pages accessible on GitHub Pages
- [ ] Contact form works (with new solution)
- [ ] Images display correctly
- [ ] No console errors
- [ ] Lighthouse scores maintained or improved
- [ ] Custom domain working with HTTPS
- [ ] Automatic deployment on git push working
