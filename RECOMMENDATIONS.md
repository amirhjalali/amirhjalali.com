# Website Analysis & Recommendations

**Date:** December 28, 2025
**Analyst:** Claude Code
**Site:** amirhjalali.com / gaboojabrothers.cloud

---

## Executive Summary

After a comprehensive analysis covering technical architecture, design consistency, content quality, security, SEO, and accessibility, I've identified 10 priority recommendations. The site is well-built with modern Next.js architecture, but has several areas needing attention—particularly around domain identity, security practices, and content refinement.

---

## TOP 10 RECOMMENDATIONS

### 1. **CRITICAL: Resolve Domain Identity Crisis**

**Issue:** The site uses two domains inconsistently:
- Canonical URLs point to `gaboojabrothers.cloud`
- User-facing domain is `amirhjalali.com`
- OG images, sitemap, and metadata all reference `gaboojabrothers.cloud`

**Impact:**
- SEO confusion (Google sees two different sites)
- Social sharing shows wrong domain
- Professional branding inconsistency

**Files Affected:**
- `app/layout.tsx` (lines 57, 63, 75, 96)
- `app/sitemap.ts` (line 4)
- `app/thoughts/[id]/page.tsx` (line 6)
- `public/CNAME`
- `.env.example`

**Recommendation:**
```typescript
// Replace all instances of gaboojabrothers.cloud with:
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amirhjalali.com'
```

Set `NEXT_PUBLIC_SITE_URL=https://amirhjalali.com` in Coolify environment variables.

**Priority:** CRITICAL
**Effort:** Low (1-2 hours)

---

### 2. **HIGH: Improve Admin Authentication Security**

**Issue:** Admin panel uses plain text password comparison:
```typescript
// app/actions/auth.ts
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin'
if (password === ADMIN_PASSWORD) { ... }
```

**Risks:**
- `NEXT_PUBLIC_` variables are exposed to browser
- No password hashing
- Default fallback password is 'admin'

**Recommendation:**
- Use server-only environment variable (remove `NEXT_PUBLIC_` prefix)
- Implement bcrypt password hashing
- Remove default password fallback
- Consider adding rate limiting for login attempts

**Priority:** HIGH
**Effort:** Medium (3-4 hours)

---

### 3. **HIGH: Add Missing Accessibility Features**

**Issues Found:**
- Several `<img>` tags missing `alt` attributes in admin/notes components
- Only 14 ARIA attributes across entire app
- Some external links missing `rel="noopener noreferrer"`

**Files Needing Attention:**
- `app/admin/DashboardClient.tsx` - image previews need alt text
- `app/notes/components/QuickAdd.tsx` - uploaded images need alt text
- `app/notes/components/NoteCard.tsx` - verify all images have alt

**Recommendation:**
```tsx
// Bad
<img src={imageUrl} />

// Good
<img src={imageUrl} alt={title || 'Article preview image'} />
```

Add `rel="noopener noreferrer"` to all `target="_blank"` links.

**Priority:** HIGH
**Effort:** Low (2-3 hours)

---

### 4. **MEDIUM: Refine AI-Generated Content Quality**

**Issue:** Some AI-generated articles have characteristics that feel automated:
- Overly structured with predictable patterns
- Some articles lack the personal voice evident in original Google Sites content
- Titles use ALL CAPS inconsistently (e.g., "THE EDGE OF VIBE CODING" vs "DeepSEEK")

**Content Observations:**
- Original articles (Information, Art, Education) have stronger personal voice
- Newer AI-generated pieces could benefit from editorial review
- Some articles could be consolidated or removed if low-engagement

**Recommendation:**
1. Review and edit AI-generated content for personal voice
2. Standardize title casing (recommend: Title Case)
3. Consider adding a "featured" flag to highlight best content
4. Add engagement metrics to identify underperforming articles

**Priority:** MEDIUM
**Effort:** High (ongoing editorial work)

---

### 5. **MEDIUM: Implement Proper Error Logging**

**Issue:** Production code exposes error details and uses console.log:
```typescript
// Current (exposes internals)
return NextResponse.json({ error: 'Failed', details: error.message })

// Multiple files have:
console.log('🚀 Creating note...')
console.error('Failed to load:', error)
```

**Files with Console Statements:**
- `app/admin/DashboardClient.tsx` - 7 instances
- `app/api/notes/route.ts` - 3 instances with emojis
- Multiple API routes

**Recommendation:**
1. Install proper logging library (e.g., `pino` or `winston`)
2. Remove emoji console logs from production code
3. Conditionally expose error details:
```typescript
details: process.env.NODE_ENV === 'development' ? error.message : undefined
```

**Priority:** MEDIUM
**Effort:** Medium (4-6 hours)

---

### 6. **MEDIUM: Add Rate Limiting to API Routes**

**Issue:** No rate limiting on sensitive endpoints:
- `/api/generate-article` - AI generation (expensive)
- `/api/notes` - Note creation
- `/api/articles/[id]/publish` - Publishing actions

**Risk:**
- API abuse could incur high OpenAI costs
- Potential DoS vector
- No protection against brute force on admin

**Recommendation:**
Implement rate limiting using `@upstash/ratelimit` or similar:
```typescript
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
})
```

**Priority:** MEDIUM
**Effort:** Medium (3-4 hours)

---

### 7. **MEDIUM: Standardize Project Descriptions**

**Issue:** Projects page has inconsistent depth of information:
- GABOOJA! - Minimal description, "stealth beta" status
- Avenu.AI - Good detail with metrics
- MR AI Portfolio - Self-referential, minimal detail

**Observations:**
- Some projects link to external sites that may not exist or are in development
- Status indicators (beta, active, archived) are inconsistent
- Tag usage varies in specificity

**Recommendation:**
1. Add consistent status badges (Active, Beta, Archived, Concept)
2. Ensure all project links are valid and lead to meaningful destinations
3. Add brief case study or impact metrics where available
4. Consider removing or archiving incomplete projects

**Priority:** MEDIUM
**Effort:** Medium (content work)

---

### 8. **LOW: Remove Unused Dependencies**

**Issue:** Package.json contains potentially unused packages:
- `taskmaster` (v0.0.3) - No usage found in app code
- `bullmq` (v5.65.1) - No active queue implementation visible

**Recommendation:**
1. Verify if these are used in worker scripts
2. If unused, remove with:
```bash
npm uninstall taskmaster bullmq
```
3. Run `npm audit` to check for vulnerabilities

**Priority:** LOW
**Effort:** Low (30 minutes)

---

### 9. **LOW: Add Content Security Policy Headers**

**Issue:** No CSP headers configured, leaving site open to XSS if vulnerabilities exist.

**Current State:**
- `next.config.ts` hides `X-Powered-By` (good)
- No CSP, HSTS, or other security headers

**Recommendation:**
Add security headers in `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        }
      ]
    }
  ]
}
```

**Priority:** LOW
**Effort:** Low (1-2 hours)

---

### 10. **LOW: Enhance About Page with Personal Touch**

**Issue:** About page is comprehensive but reads like a resume:
- Heavy on credentials and technical skills
- Missing personal philosophy or mission statement
- No downloadable resume link (mentioned in CLAUDE.md)
- Limited personality/voice

**Current Strengths:**
- Strong quantified achievements
- Clear career progression
- Comprehensive skill matrix

**Recommendation:**
1. Add opening personal statement/philosophy
2. Include a brief "Why I Do This" section
3. Add downloadable PDF resume
4. Consider adding interests/hobbies for human connection
5. Add testimonials or notable collaborations if available

**Priority:** LOW
**Effort:** Medium (content creation)

---

## QUICK WINS (Can Do Today)

1. **Fix canonical URLs** - Search/replace gaboojabrothers.cloud → amirhjalali.com
2. **Add alt text** - Quick pass through image components
3. **Add rel="noopener noreferrer"** - To external links
4. **Standardize article titles** - Change ALL CAPS to Title Case
5. **Remove console.log statements** - grep and remove emoji logs

---

## METRICS TO TRACK

After implementing these recommendations, consider tracking:
- Core Web Vitals (LCP, FID, CLS)
- SEO rankings for target keywords
- Admin panel security logs
- API response times and error rates
- Article engagement (time on page, scroll depth)

---

## CONCLUSION

The site is well-architected with modern tooling and demonstrates strong technical capability. The primary concerns are:

1. **Identity:** Resolve the dual-domain situation
2. **Security:** Strengthen admin authentication
3. **Polish:** Refine AI content and add accessibility features

Addressing the top 5 recommendations would significantly improve the site's professionalism, security, and search visibility.

---

*This analysis was conducted on December 28, 2025. Recommendations should be re-evaluated as the site evolves.*
