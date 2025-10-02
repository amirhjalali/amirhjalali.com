# Switching from Vercel to GitHub Pages

## Current Status
- ✅ Code is ready for static export
- ✅ All migrations completed
- ✅ Local build successful
- ⏳ Still deployed on Vercel
- ⏳ Need to activate GitHub Pages

## Step-by-Step Guide

### Step 1: Set Up GitHub Actions Workflow

The workflow file exists locally but needs proper permissions to push. You have two options:

#### Option A: Create Manually on GitHub
1. Go to your repository on GitHub: `https://github.com/amirhjalali/amirhjalali.com`
2. Click "Add file" → "Create new file"
3. Name it: `.github/workflows/deploy.yml`
4. Paste this content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Setup Pages
        uses: actions/configure-pages@v4
        with:
          static_site_generator: next

      - name: Install dependencies
        run: npm ci

      - name: Build with Next.js
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

5. Commit the file

#### Option B: Update Your Token and Push
1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Update your token to include `workflow` scope
3. Update your local git credentials
4. Run: `git push origin main`

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
4. Click **Save**

### Step 3: Configure Custom Domain

1. Still in Settings → Pages
2. Under "Custom domain":
   - Enter: `amirhjalali.com`
   - Click **Save**
3. Wait for DNS check (may take a few minutes)
4. Once verified, check "Enforce HTTPS"

### Step 4: Verify DNS Settings

Make sure your domain's DNS is pointing to GitHub Pages:

**For apex domain (amirhjalali.com):**
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: amirhjalali.github.io
```

### Step 5: Trigger First Deployment

1. Make a small change (e.g., add a space to README.md)
2. Commit and push to `main` branch
3. Go to **Actions** tab on GitHub
4. Watch the workflow run
5. Once complete, visit your site

### Step 6: Deactivate Vercel (After Confirming GitHub Pages Works)

1. Log in to Vercel dashboard
2. Go to your project settings
3. Navigate to **Domains** tab
4. Remove `amirhjalali.com` from the project
5. Optionally delete or archive the Vercel project

## Verification Checklist

After GitHub Pages is live:

- [ ] Homepage loads correctly
- [ ] All navigation works
- [ ] Projects page displays
- [ ] Thoughts/articles load properly
- [ ] Individual article pages work
- [ ] Resume page renders
- [ ] Contact form opens email client
- [ ] Images display correctly
- [ ] CSS/styling looks good
- [ ] Custom domain works with HTTPS
- [ ] No console errors

## Rollback Plan (If Needed)

If something goes wrong:

1. **Quick fix**: Re-enable Vercel deployment
   - Vercel project still exists with your code
   - Just re-add the domain in Vercel settings

2. **Revert code changes**:
   ```bash
   git revert HEAD~7  # Revert last 7 commits
   git push origin main
   ```

## Expected Behavior Differences

### What Works the Same:
- All pages and navigation
- Styling and animations
- Content display
- Mobile responsiveness

### What Changed:
- **Contact form**: Now opens email client instead of API submission
- **Image optimization**: Images served as-is (no Next.js optimization)
- **Build time**: All pages pre-rendered at build time

## Troubleshooting

### Workflow fails
- Check Actions tab for error messages
- Ensure all dependencies are in package.json
- Verify Node.js version matches (20.x)

### Custom domain doesn't work
- Wait 24-48 hours for DNS propagation
- Check DNS settings with `dig amirhjalali.com`
- Verify CNAME file exists in `public/` folder

### Pages not found (404)
- Ensure `.nojekyll` file exists in `public/`
- Check that build completed successfully
- Verify `out/` directory contains all pages

### Styling issues
- Check browser console for errors
- Verify all assets are in `public/` folder
- Ensure CSS files are properly linked

## Timeline Estimate

- Step 1: 2-5 minutes
- Step 2: 1 minute
- Step 3: 2-3 minutes
- Step 4: Already done (DNS configured)
- Step 5: 3-5 minutes (build time)
- Step 6: 2 minutes

**Total**: ~15-20 minutes

## Support

If you encounter issues:
1. Check the Actions tab for build logs
2. Review the error messages
3. Compare with working Vercel deployment
4. Test locally with `npm run build` and serve the `out/` folder

---

**Note**: The code is 100% ready. These are just the deployment configuration steps on GitHub's side.
