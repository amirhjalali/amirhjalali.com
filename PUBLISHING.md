# Publishing Workflow for Static Site

## The Problem

The admin panel saves articles to **browser localStorage** only. For a static GitHub Pages site, this means:

❌ Clicking "Publish" in admin panel → **Articles DON'T appear on live site**  
✅ Committing `published.json` to repository → **Articles appear after deployment**

## How to Properly Publish Articles

### Method 1: Export & Commit (Recommended)

1. **Login to admin panel**: https://amirhjalali.github.io/amirhjalali.com/admin/login

2. **Publish your articles** using the admin UI (saves to localStorage)

3. **Click "Export & Sync to Repository"** button at the top
   - This downloads `published.json` and `drafts.json` files

4. **Replace the repository files**:
   ```bash
   # Move downloaded files to repository
   mv ~/Downloads/published.json public/data/
   mv ~/Downloads/drafts.json public/data/
   
   # Commit and push
   git add public/data/*.json
   git commit -m "feat: publish new articles"
   git push origin main
   ```

5. **Wait for deployment** (~2-3 minutes)
   - GitHub Actions will rebuild and deploy the site
   - Your articles will now appear on the live site

### Method 2: Auto-commit Script

```bash
# After publishing in admin panel, export files then run:
./scripts/commit-articles.sh
```

This script automatically commits and pushes changes to the repository.

### Method 3: Manual Sync

If you prefer to sync manually:

1. Open browser console (F12) on the admin page

2. Copy published articles:
   ```javascript
   copy(localStorage.getItem('published-articles'))
   ```

3. Format and save to `public/data/published.json`

4. Commit and push to repository

## Why This Workflow?

GitHub Pages serves **static HTML files** that are pre-built at deployment time. The admin panel is client-side JavaScript that can only save to your browser, not to the server (because there is no server).

To update the live site, you must:
1. Update the JSON data files in the repository
2. Trigger a new deployment (happens automatically on push)
3. Wait for the static site to rebuild with new data

## Automated Publishing

For fully automated publishing, you can use the GitHub Actions workflow (requires API key):
- Workflow file: `.github/workflows/ai-article-generator.yml`
- Generates and commits articles automatically
- No manual intervention needed

## Questions?

The admin panel now shows a prominent warning banner with the export button to make this process clear.
