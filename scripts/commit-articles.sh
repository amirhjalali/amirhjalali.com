#!/bin/bash
# Auto-commit published articles to repository
# This script should be run after publishing articles in the admin panel

set -e

echo "🔄 Syncing articles from admin panel to repository..."

# Check if there are changes
if [ -n "$(git status --porcelain public/data/published.json public/data/drafts.json)" ]; then
    git add public/data/published.json public/data/drafts.json
    git commit -m "feat: publish articles from admin panel - $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin main
    echo "✅ Articles committed and pushed to repository"
    echo "🚀 GitHub Actions will deploy in a few minutes"
else
    echo "ℹ️  No changes to commit"
fi
