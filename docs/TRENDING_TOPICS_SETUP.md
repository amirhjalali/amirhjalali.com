# Trending Topics Integration - Setup Guide

This system automatically fetches trending tech topics from multiple sources and uses them for AI article generation.

---

## 🎯 Overview

**What it does:**
1. Fetches trending topics from Hacker News, Reddit, and NewsAPI
2. Filters for AI/tech/programming related content
3. Scores and ranks topics by relevance
4. Stores them in a queue (`public/data/topics-queue.json`)
5. Article generator picks from queue (instead of random topics)

**Benefits:**
- ✅ Write about current, relevant topics
- ✅ Better engagement (trending = people care)
- ✅ Automatic topic discovery
- ✅ Never run out of article ideas

---

## 🚀 Quick Start

### Option 1: Simple (No n8n)

**1. Run the fetch script manually:**
```bash
node scripts/fetch-trending-topics.js
```

**2. Generate article from queue:**
```bash
node scripts/generate-article-static.js
# Will automatically use the top topic from queue
```

**3. Or generate from specific topic:**
```bash
node scripts/generate-article-static.js "Your custom topic"
```

---

### Option 2: Automated (GitHub Actions)

**Already configured!** The workflow runs weekly on Sundays at 6 AM UTC.

**Manual trigger:**
1. Go to: https://github.com/amirhjalali/amirhjalali.com/actions
2. Click "Fetch Trending Topics"
3. Click "Run workflow"

**How it works:**
```
Sunday 6 AM UTC → Fetch topics → Update queue
Daily 9 AM UTC  → Generate article → Uses topic from queue
```

---

### Option 3: Advanced (n8n Workflow)

See `docs/n8n-workflow-example.json` for a complete n8n workflow that:
- Fetches from multiple sources
- Uses AI to score topics
- Runs custom analysis
- Integrates with your own services

**To use:**
1. Install n8n: `npm install -g n8n`
2. Run n8n: `n8n start`
3. Import workflow from `docs/n8n-workflow-example.json`
4. Configure credentials
5. Activate workflow

---

## 📋 Data Sources

### 1. Hacker News (Free, No Auth)
- **What:** Top tech stories from YCombinator
- **Quality:** High - curated by tech community
- **Setup:** None needed, works out of the box
- **API:** `https://hacker-news.firebaseio.com/v0`

### 2. Reddit (Free, No Auth*)
- **Subreddits monitored:**
  - r/MachineLearning
  - r/artificial
  - r/programming
- **Quality:** Good - community driven
- **Setup:** None needed for read-only
- **API:** `https://www.reddit.com/r/{subreddit}/hot.json`

*Note: No auth needed for basic fetching, but rate limits apply

### 3. NewsAPI (Optional - 100 free requests/day)
- **What:** News articles from 80,000+ sources
- **Quality:** Variable - includes mainstream news
- **Setup:** Get free API key at https://newsapi.org
- **Add to GitHub Secrets:** `NEWS_API_KEY`

---

## 🔧 Configuration

### Script Options

```bash
# Fetch from all sources (default)
node scripts/fetch-trending-topics.js

# Fetch only from Hacker News
node scripts/fetch-trending-topics.js --source=hn

# Fetch only from Reddit
node scripts/fetch-trending-topics.js --source=reddit

# Limit number of topics
node scripts/fetch-trending-topics.js --limit=20

# Combine options
node scripts/fetch-trending-topics.js --source=hn --limit=5
```

### Customize Keywords

Edit `scripts/fetch-trending-topics.js`:
```javascript
techKeywords: [
  'AI', 'ML', 'machine learning',
  'artificial intelligence',
  // Add your own keywords here
  'blockchain', 'web3', 'cloud'
]
```

### Customize Scoring

Edit the `scoreTopics()` function:
```javascript
// Boost for certain keywords
const boostKeywords = ['AI', 'GPT', 'Claude', 'breakthrough'];

// Penalize certain types
const penaltyKeywords = ['tutorial', 'how to', 'beginner'];
```

---

## 📊 Topics Queue Format

```json
{
  "topics": [
    {
      "topic": "Clean title suitable for article",
      "originalTitle": "Full original title from source",
      "source": "Hacker News",
      "url": "https://...",
      "score": 250,
      "fetchedAt": "2025-11-02T10:00:00.000Z"
    }
  ],
  "lastUpdated": "2025-11-02T10:00:00.000Z"
}
```

**Queue behavior:**
- New topics are prepended (added to front)
- Article generator takes from front (highest priority)
- After use, topic is removed from queue
- Queue is capped at 50 topics max

---

## 🎨 Integration with Article Generator

### How Topics Are Selected

Priority order:
1. **Manual topic** (if provided via command line)
2. **Queue topic** (from `topics-queue.json`)
3. **Random topic** (from predefined list)

```javascript
// Command line (highest priority)
node scripts/generate-article-static.js "My specific topic"

// Queue (automatic)
node scripts/generate-article-static.js
// → Uses top topic from queue

// Random fallback
// → If queue is empty, uses random from config.topics
```

### Queue Status

Check queue status:
```bash
# View queue file
cat public/data/topics-queue.json | jq '.topics | length'

# Or use Node
node -e "const q = require('./public/data/topics-queue.json'); console.log('Topics:', q.topics.length)"
```

---

## 🔄 Workflow Integration

### Current Setup

```
┌─────────────────────────────────────┐
│  Sunday 6 AM UTC                    │
│  Fetch Trending Topics              │
│  → Updates topics-queue.json        │
│  → Commits to repo                  │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  Daily 9 AM UTC                     │
│  Generate AI Article                │
│  → Picks topic from queue           │
│  → Generates article                │
│  → Saves to drafts                  │
└─────────────────────────────────────┘
```

### Recommended Schedule

- **Weekly topic fetch:** Sundays at 6 AM UTC
- **Daily article gen:** Every day at 9 AM UTC
- **Result:** 7 articles/week from trending topics

### Adjusting Frequency

Edit `.github/workflows/fetch-trending-topics.yml`:

```yaml
schedule:
  # Every 3 days at 6 AM UTC
  - cron: '0 6 */3 * *'

  # Twice a week (Sun & Wed)
  - cron: '0 6 * * 0,3'

  # Daily (same as article gen)
  - cron: '0 8 * * *'
```

---

## 🧪 Testing

### Test Fetch Script

```bash
# Run fetch and see results
node scripts/fetch-trending-topics.js --limit=5

# Check output
cat public/data/topics-queue.json | jq '.topics[0]'
```

### Test Article Generation

```bash
# Generate using queue topic
node scripts/generate-article-static.js

# Check what topic was used
# (Look for "Using topic from queue" in output)
```

### Test Workflow

```bash
# Trigger manually
gh workflow run fetch-trending-topics.yml

# Check status
gh run list --workflow=fetch-trending-topics.yml

# View logs
gh run view --log
```

---

## 🐛 Troubleshooting

### Queue not being created

**Problem:** Script runs but no `topics-queue.json` file
**Solution:**
```bash
# Create directory if missing
mkdir -p public/data

# Run script with verbose output
node scripts/fetch-trending-topics.js
```

### No topics found

**Problem:** "Found 0 relevant topics"
**Solution:**
1. Check your keywords are not too restrictive
2. Try different sources: `--source=hn` or `--source=reddit`
3. Lower the keyword threshold in the script

### Reddit rate limiting

**Problem:** "Too Many Requests" error
**Solution:**
- Wait 1 minute between requests
- Reduce frequency of fetches
- Add delays in the script

### NewsAPI not working

**Problem:** NewsAPI returns errors
**Solution:**
1. Check API key is set: `echo $NEWS_API_KEY`
2. Verify free tier limits (100 requests/day)
3. Check key is in GitHub Secrets for workflows

---

## 📈 Monitoring

### Queue Health

Good queue indicators:
- ✅ 10-50 topics in queue
- ✅ Topics updated within last 7 days
- ✅ Variety of sources represented
- ✅ Mix of high and medium scores

Warning signs:
- ⚠️ Queue empty (using random topics)
- ⚠️ Topics older than 14 days
- ⚠️ All from one source
- ⚠️ Duplicate topics

### GitHub Actions

Monitor workflows:
```bash
# Check recent runs
gh run list --limit 5

# View specific run
gh run view RUN_ID

# Watch live
gh run watch
```

---

## 🎯 Best Practices

### Topic Selection

✅ **DO:**
- Keep queue size between 20-40 topics
- Fetch weekly or bi-weekly
- Review queue occasionally and remove stale topics
- Balance between trending and evergreen topics

❌ **DON'T:**
- Fetch too frequently (respect rate limits)
- Let queue grow over 100 topics
- Rely solely on automated selection
- Ignore topic quality for quantity

### Content Strategy

**Mix your sources:**
- 40% from trending (Hacker News, Reddit)
- 40% from your predefined topics
- 20% manual/custom topics

**Topic rotation:**
- Technical deep-dives: 30%
- Industry trends: 40%
- Opinion pieces: 20%
- Tutorials: 10%

---

## 🔐 Security

### API Keys

**Store securely:**
```bash
# Local development (.env)
NEWS_API_KEY=your_key_here

# GitHub (Settings → Secrets)
NEWS_API_KEY: [secret value]
```

**Never commit:**
- API keys
- Credentials
- Tokens

### Rate Limiting

**Respect limits:**
- Hacker News: ~60 requests/min
- Reddit: ~60 requests/min (unauthenticated)
- NewsAPI: 100 requests/day (free tier)

**Implement backoff:**
```javascript
// Add delay between requests
await new Promise(resolve => setTimeout(resolve, 1000));
```

---

## 🚀 Future Enhancements

### Potential Additions

1. **AI-powered topic scoring**
   - Use GPT/Claude to rate topic quality
   - Suggest better angles for articles
   - Filter out low-quality topics

2. **Twitter/X integration**
   - Monitor tech influencers
   - Track trending hashtags
   - Identify breaking news

3. **Google Trends**
   - Find rising search terms
   - Geographic targeting
   - Related queries

4. **RSS Feed aggregation**
   - Tech blogs (TechCrunch, Ars Technica)
   - Research papers (arXiv)
   - Company blogs (OpenAI, Anthropic)

5. **Custom filters**
   - Topic categories
   - Difficulty levels
   - Target audience

---

## 📚 Additional Resources

- [Hacker News API Docs](https://github.com/HackerNews/API)
- [Reddit API Docs](https://www.reddit.com/dev/api/)
- [NewsAPI Docs](https://newsapi.org/docs)
- [n8n Documentation](https://docs.n8n.io/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

## ❓ FAQ

**Q: How much does this cost?**
A: Free! All APIs used have free tiers. NewsAPI is optional.

**Q: Can I use this without GitHub Actions?**
A: Yes! Run `fetch-trending-topics.js` manually whenever you want.

**Q: What if the queue runs out?**
A: The system falls back to random topics from the predefined list.

**Q: Can I edit the queue manually?**
A: Yes! Edit `public/data/topics-queue.json` directly.

**Q: How do I stop using trending topics?**
A: Remove `topics-queue.json` or always provide manual topics.

**Q: Can I use different AI models for scoring?**
A: Yes! See the n8n workflow example for AI-powered scoring.

---

## 🤝 Contributing

Have ideas for improvements?
1. Test your changes locally
2. Update this documentation
3. Submit a pull request

---

**Happy topic hunting! 🎯**
