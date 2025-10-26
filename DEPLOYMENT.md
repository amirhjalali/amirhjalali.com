# Deployment Guide

This site can be deployed in two ways: **Vercel (recommended)** or **GitHub Pages**.

## Option 1: Vercel (Recommended for API Routes)

**✅ Pros:**
- Free tier available
- API routes work (keeps OpenAI key secure server-side)
- "Generate AI Article" button works in admin panel
- Automatic deployments on git push
- Better performance with edge functions

**Setup:**

1. **Sign up for Vercel** (free): https://vercel.com/signup

2. **Import your GitHub repository:**
   - Go to https://vercel.com/new
   - Select "Import Git Repository"
   - Choose `amirhjalali/amirhjalali.com`
   - Click "Import"

3. **Configure environment variables:**
   - In Vercel dashboard, go to your project settings
   - Navigate to "Environment Variables"
   - Add these variables:

   ```
   OPENAI_API_KEY=sk-... (your actual OpenAI key)
   NEXT_PUBLIC_ADMIN_USERNAME=admin
   NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait ~1-2 minutes
   - Your site will be live at `your-project.vercel.app`

5. **Custom domain (optional):**
   - In project settings → Domains
   - Add `amirhjalali.com`
   - Follow DNS configuration instructions

**Future deployments:**
- Push to GitHub main branch → Vercel automatically deploys
- No manual action needed

---

## Option 2: GitHub Pages (Static Export)

**⚠️ Limitations:**
- API routes don't work (no server-side functions)
- "Generate AI Article" button won't work in admin panel
- Must use GitHub Actions for article generation
- API key exposed if using NEXT_PUBLIC_ prefix

**Setup:**

1. **Enable static export** in `next.config.mjs`:
   ```js
   output: 'export',
   basePath: '/amirhjalali.com',
   ```

2. **GitHub Settings:**
   - Repository → Settings → Pages
   - Source: GitHub Actions
   - Branch: main

3. **Environment variables:**
   - Repository → Settings → Secrets → Actions
   - Add: `NEXT_PUBLIC_OPENAI_API_KEY=sk-...`

4. **Deployment:**
   - Push to main branch
   - GitHub Actions builds and deploys automatically
   - Site available at `username.github.io/amirhjalali.com`

**Article generation:**
- Only works via GitHub Actions (not from admin panel button)
- Articles generate automatically daily at 9 AM UTC
- Manual trigger: GitHub → Actions → "Generate AI Article" → Run workflow

---

## Current Configuration

The repository is currently configured for **Vercel deployment** (API routes enabled).

To switch to GitHub Pages, update `next.config.mjs`:

```js
// For GitHub Pages:
output: 'export',
basePath: '/amirhjalali.com',

// For Vercel:
// Remove 'output: export' line
basePath: '',
```

---

## Security Comparison

### Vercel (Secure)
- ✅ API key stored in Vercel environment variables
- ✅ Never exposed to client-side code
- ✅ Generate button works from admin panel
- ✅ No risk of key theft

### GitHub Pages (Less Secure)
- ⚠️ Requires `NEXT_PUBLIC_` prefix (exposed in bundle)
- ⚠️ API key visible in browser dev tools
- ⚠️ Must rely on GitHub Actions only
- ⚠️ Higher risk if key is stolen

**Recommendation:** Use Vercel for the secure API route approach.

---

## Cost Comparison

### Vercel
- **Hosting:** Free tier (hobby plan)
- **Bandwidth:** 100GB/month free
- **Functions:** Unlimited invocations
- **OpenAI API:** ~$0.14 per article generated
- **Total:** ~$4-10/month (30 articles)

### GitHub Pages
- **Hosting:** Free (unlimited)
- **Bandwidth:** Soft limit (100GB recommended)
- **Functions:** N/A (static only)
- **OpenAI API:** ~$0.14 per article via GitHub Actions
- **Total:** ~$4-10/month (30 articles)

Both are essentially the same cost for OpenAI usage. Vercel offers better security and functionality.

---

## Recommended Setup

**For production with secure article generation:**
1. Deploy to **Vercel**
2. Use `OPENAI_API_KEY` (without NEXT_PUBLIC_)
3. Generate articles from admin panel button
4. Optional: Keep GitHub Actions as backup

**For simple static blog without article generation:**
1. Deploy to **GitHub Pages**
2. Remove API routes
3. Manually write articles or use GitHub Actions only

---

## Migration Between Platforms

### From GitHub Pages to Vercel:
1. Follow Vercel setup steps above
2. Update environment variables (remove NEXT_PUBLIC_ prefix)
3. Change `basePath: ''` in next.config.mjs
4. Disable GitHub Pages in repository settings

### From Vercel to GitHub Pages:
1. Add `output: 'export'` to next.config.mjs
2. Set `basePath: '/amirhjalali.com'`
3. Remove API routes or accept they won't work
4. Use GitHub Actions for article generation
5. Enable GitHub Pages in repository settings

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **GitHub Pages:** https://docs.github.com/pages
