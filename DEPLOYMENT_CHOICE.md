# Choose Your Deployment Option

Your site has **two deployment options**. You need to pick one:

---

## Option 1: GitHub Pages (Current) ✓

**What you get:**
- ✅ Free hosting on GitHub
- ✅ Automatic deploys when you push
- ✅ No credit card needed
- ⚠️ "Generate AI Article" button **won't work** (API routes not supported)
- ✅ Articles can still be generated via GitHub Actions (automated daily)

**Current status:** ✅ **Active** - Your site deploys to GitHub Pages

**How to generate articles:**
1. Automatic: Daily at 9 AM UTC via GitHub Actions
2. Manual: Go to GitHub → Actions → "Generate AI Article" → Run workflow

**Security:** ✅ API key safe in GitHub Secrets (never exposed)

---

## Option 2: Vercel (Recommended for Button)

**What you get:**
- ✅ Free hosting (Vercel hobby plan)
- ✅ Automatic deploys when you push
- ✅ "Generate AI Article" button **WORKS** in admin panel
- ✅ API routes enabled (server-side = secure)
- ✅ Better performance
- ✅ Custom domains included

**To switch to Vercel:**

1. **Sign up:** https://vercel.com/signup (free, no credit card)

2. **Import repository:**
   - Click "Add New Project"
   - Select your GitHub repo: `amirhjalali/amirhjalali.com`

3. **Add environment variables** in Vercel dashboard:
   ```
   OPENAI_API_KEY=sk-... (your OpenAI key)
   NEXT_PUBLIC_ADMIN_USERNAME=admin
   NEXT_PUBLIC_ADMIN_PASSWORD=your_password
   ```

4. **Update `next.config.mjs`:**
   ```js
   // Comment out these lines:
   // output: 'export',
   // basePath: '/amirhjalali.com',

   // Uncomment this line:
   basePath: '',
   ```

5. **Push to GitHub** - Vercel auto-deploys

6. **Disable GitHub Pages** (optional):
   - Repo → Settings → Pages → Source: None

**Security:** ✅ API key on server only (never exposed to browser)

---

## Comparison Table

| Feature | GitHub Pages | Vercel |
|---------|-------------|--------|
| **Cost** | Free | Free |
| **Setup Time** | Already done ✓ | 5 minutes |
| **Generate Button** | ❌ Doesn't work | ✅ Works |
| **API Key Security** | ✅ Safe (GitHub Secrets) | ✅ Safe (Server-side) |
| **Auto Deploy** | ✅ Yes | ✅ Yes |
| **Custom Domain** | ✅ Yes | ✅ Yes |
| **Performance** | Good | Better (Edge) |
| **GitHub Actions** | ✅ Still works | ✅ Still works |

---

## My Recommendation

**If you want the button to work:** Switch to Vercel (5 min setup)

**If you're happy with GitHub Actions only:** Stay on GitHub Pages

The API route code is already in your repo and ready to go. Just deploy to Vercel and it'll work automatically!

---

## Current Setup

- ✅ GitHub Pages deployment: Working
- ✅ GitHub Actions article generation: Working
- ⚠️ Admin panel button: Shows helpful error message
- ✅ API route code: Present but inactive (needs Vercel to work)

**No changes needed** if you're happy with GitHub Actions for article generation.

**Want the button?** Follow "Option 2: Vercel" steps above.
