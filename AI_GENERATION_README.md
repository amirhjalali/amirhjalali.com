# AI Article Generation for GitHub Pages

This repository includes an automated AI article generation system that works with GitHub Pages static deployment.

## How It Works

The system generates AI-powered articles with featured images and stores them as drafts that can be reviewed and published through the admin panel. All generated images are permanently saved to the repository to prevent URL expiration.

**🔒 Security Note:** Article generation happens **server-side via GitHub Actions only** to keep API keys secure. The API key is stored in GitHub Secrets and never exposed to the client-side code or public repository.

### Components

1. **Generation Script** (`scripts/generate-article-static.js`)
   - Node.js script that calls OpenAI GPT-4o-mini and DALL-E 3 APIs
   - Generates 600-800 word articles on tech topics
   - Creates high-quality featured images
   - Saves articles to `public/data/drafts.json`
   - Downloads images as base64 to prevent URL expiration

2. **GitHub Actions Workflow** (`.github/workflows/ai-article-generator.yml`)
   - Runs **automatically** daily at 9 AM UTC
   - Can be **triggered manually** from GitHub Actions tab
   - Commits generated articles to the repository
   - Triggers automatic deployment
   - **API keys stay secure** in GitHub Secrets (never exposed)

3. **Admin Panel** (`/admin`)
   - Review generated drafts
   - Edit articles with full markdown editor
   - Publish articles to make them live
   - Delete unwanted drafts
   - Links to GitHub Actions for manual triggering

## Setup Instructions

### 1. Add API Key to GitHub Secrets

Go to your repository settings → Secrets and variables → Actions → New repository secret

**OpenAI API Key** (Required for GPT-4o-mini and DALL-E 3):
```
Name: NEXT_PUBLIC_OPENAI_API_KEY
Value: sk-... (your API key from https://platform.openai.com/api-keys)
```

**Cost:** ~$0.14 per article (GPT-4o-mini: ~$0.10, DALL-E 3: ~$0.04)

### 2. Get OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up for an account
3. Go to API Keys section
4. Create a new API key
5. **Set spending limits** to protect your account (recommended: $10/month)
6. **Optional:** Restrict API key to specific models and domains for extra security

### 3. Enable GitHub Actions

The workflows are already configured. They will start running automatically once you add the API key to GitHub Secrets.

### 4. Manual Article Generation

You can trigger article generation on-demand from the **Admin Panel**:

1. Go to `/admin` on your site
2. Click **"View GitHub Actions"** button in the AI Article Generator section
3. This opens the GitHub Actions workflow page
4. Click **"Run workflow"** dropdown
5. Optionally specify a custom topic
6. Click **"Run workflow"** button
7. Wait ~30 seconds for generation to complete
8. Refresh admin panel to see new draft

**Alternative:** Directly visit:
```
https://github.com/YOUR_USERNAME/amirhjalali.com/actions/workflows/ai-article-generator.yml
```

## Accessing the Admin Panel

### On GitHub Pages

1. Go to `https://yourusername.github.io/amirhjalali.com/admin/login`
2. Login with your credentials (set in `.env.local` and GitHub Secrets)
3. Review generated drafts
4. Publish or delete as needed

### Locally

1. Run `npm run dev`
2. Go to `http://localhost:3000/admin/login`
3. Login and manage drafts

## Article Generation Schedule

By default, articles are generated:
- **Daily at 9 AM UTC**
- Can be changed in `.github/workflows/generate-article.yml`
- Edit the `cron` schedule to your preferred time

### Common Schedules

```yaml
# Daily at 9 AM UTC
- cron: '0 9 * * *'

# Weekdays at 10 AM UTC
- cron: '0 10 * * 1-5'

# Every Monday at 9 AM UTC
- cron: '0 9 * * 1'

# Twice daily (9 AM and 5 PM UTC)
- cron: '0 9,17 * * *'
```

## How Drafts Work

1. **GitHub Actions generates article** → Saves to `public/data/drafts.json` → Commits to repo
2. **GitHub Pages deploys** → New drafts.json file is live
3. **You visit admin panel** → Drafts load from drafts.json into localStorage
4. **You review and publish** → Article moves from drafts to published articles
5. **Published articles** → Appear on your Thoughts page

## File Structure

```
├── public/
│   └── data/
│       └── drafts.json          # AI-generated drafts (committed by GitHub Actions)
├── scripts/
│   ├── generate-article.js      # CLI script (for local use)
│   └── generate-article-static.js # Static site script (for GitHub Actions)
├── .github/
│   └── workflows/
│       ├── deploy.yml           # Deployment workflow
│       └── generate-article.yml # Generation workflow
├── app/
│   ├── admin/                   # Admin panel
│   └── api/
│       └── generate-article/    # API endpoint (works locally only)
└── lib/
    └── articles.ts              # Article management with static file support
```

## Security Architecture

### Why GitHub Actions Only?

This system generates articles **exclusively via GitHub Actions** (not in the browser) for security:

**The Problem with Client-Side Generation:**
- Any `NEXT_PUBLIC_*` environment variable gets embedded in the JavaScript bundle
- Anyone can inspect your site's code and extract the API key
- Attackers could use your key for unlimited API calls
- Could result in massive unexpected bills

**Our Solution:**
- Article generation happens **server-side** in GitHub Actions
- API key stored in **GitHub Secrets** (encrypted, never exposed)
- Key is only accessible during the workflow run
- Even if someone views your site's source code, they can't find the key

**For Manual Generation:**
- Users click "View GitHub Actions" in admin panel
- Opens GitHub's secure workflow page
- Must be logged into GitHub to trigger (authentication required)
- Generation runs on GitHub's servers, not in the browser

**Best Practices Applied:**
1. ✅ API keys in GitHub Secrets only
2. ✅ No client-side API calls
3. ✅ GitHub authentication required for manual triggers
4. ✅ Spending limits on OpenAI account
5. ✅ Optional: API key restrictions (models, domains, rate limits)

## Cost Estimates

### Monthly Costs (30 articles/month)

**Anthropic Claude 3.5 Sonnet:**
- Generation: ~$3-6/month
- High quality output
- Better at following instructions
- No image generation (text only)

**OpenAI GPT-4o-mini + DALL-E 3 (RECOMMENDED):**
- Text generation (GPT-4o-mini): ~$2-4/month
- Image generation (DALL-E 3): ~$6/month ($0.04 per image × 30 articles)
- Total: ~$8-10/month
- Excellent quality output
- Featured images automatically generated
- Best value for money

**Note:** These are estimates. Actual costs may vary based on article length, token usage, and API pricing. GPT-4o-mini is very cost-effective while maintaining high quality. DALL-E 3 costs $0.04 per standard quality image (1792x1024).

## Troubleshooting

### Articles Not Generating

1. Check GitHub Actions tab for errors
2. Verify API key is set correctly in Secrets
3. Check API key has sufficient credits
4. Review workflow logs for specific error messages

### Drafts Not Appearing in Admin

1. Make sure you're logged into the admin panel
2. Check that `public/data/drafts.json` exists in the repository
3. Clear browser localStorage and refresh
4. Check browser console for errors

### Workflow Not Running

1. Ensure GitHub Actions are enabled in repository settings
2. Check that the workflow file is in `.github/workflows/`
3. Verify the cron schedule syntax is correct
4. Manual trigger from Actions tab to test

## Customization

### Topics

Edit topics in `scripts/generate-article-static.js`:

```javascript
topics: [
  'Your custom topic 1',
  'Your custom topic 2',
  // Add more topics...
]
```

### Article Length

Change `targetLength` in the script:
- `'short'` - 300-500 words
- `'medium'` - 600-800 words
- `'long'` - 1000-1500 words

### Article Style

Modify the prompt in the generation functions to adjust tone, style, and structure.

## Security Notes

- API keys are stored as GitHub Secrets (encrypted)
- Admin credentials are baked into the static build (client-side only)
- Use strong admin passwords even though they're not highly secure
- This system is suitable for personal blogs, not sensitive content

## Support

For issues or questions:
1. Check the workflow logs in GitHub Actions
2. Review browser console for client-side errors
3. Test generation locally with `node scripts/generate-article-static.js`

---

**Last Updated:** $(date +%Y-%m-%d)
**Status:** Ready for deployment
