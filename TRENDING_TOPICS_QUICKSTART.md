# 🚀 Trending Topics - Quick Start Guide

## ✅ What Was Just Added

Your site now automatically finds trending tech topics and uses them for AI article generation!

---

## 🎯 3 Ways to Use This

### Option 1: Fully Automatic (Recommended)

**Already configured!** Just wait and it works automatically:

1. **Every Sunday 6 AM UTC:** Fetches trending topics from Hacker News & Reddit
2. **Every Day 9 AM UTC:** Generates article using top trending topic
3. **Result:** Fresh, relevant articles about what's trending in tech

**No action needed!** 🎉

---

### Option 2: Manual Fetch → Auto Generate

**When you want fresh topics NOW:**

```bash
# Fetch trending topics right now
node scripts/fetch-trending-topics.js

# Tomorrow's article will use one of these topics automatically
```

**Result:** Queue filled with 15+ trending topics, used automatically

---

### Option 3: Browse Topics → Choose One

**When you want to pick the topic yourself:**

```bash
# 1. Fetch trending topics
node scripts/fetch-trending-topics.js --limit=10

# 2. View the queue
cat public/data/topics-queue.json | jq '.topics[] | .topic'

# 3. Generate article with chosen topic
node scripts/generate-article-static.js "The topic you chose"
```

**Result:** Full control over which topic to write about

---

## 📋 View Current Queue

**See what topics are queued:**

```bash
# Quick view (top 5)
node -e "const q = require('./public/data/topics-queue.json'); console.log('Total:', q.topics.length); q.topics.slice(0,5).forEach((t,i) => console.log((i+1) + '. ' + t.topic + ' (' + t.source + ')'))"

# Or just open the file
cat public/data/topics-queue.json
```

---

## 🧪 Test It Right Now

**Try it out:**

```bash
# 1. Fetch some topics
node scripts/fetch-trending-topics.js --limit=5

# 2. See what was found
cat public/data/topics-queue.json | jq '.topics[0]'

# 3. Generate article from top topic
node scripts/generate-article-static.js

# ✅ Article will be generated using the trending topic!
```

---

## ⚙️ GitHub Actions Workflows

### Current Schedule

| Workflow | When | What |
|----------|------|------|
| **Fetch Trending Topics** | Every Sunday 6 AM UTC | Finds trending topics |
| **Generate AI Article** | Every Day 9 AM UTC | Creates article from queue |

### Manual Triggers

**Via GitHub UI:**
1. Go to: https://github.com/amirhjalali/amirhjalali.com/actions
2. Click "Fetch Trending Topics" or "Generate AI Article"
3. Click "Run workflow"

**Via Command Line:**
```bash
# Fetch topics
gh workflow run fetch-trending-topics.yml

# Generate article
gh workflow run ai-article-generator.yml
```

---

## 🔧 Customization

### Change Fetch Frequency

Edit `.github/workflows/fetch-trending-topics.yml`:

```yaml
schedule:
  # Current: Weekly on Sundays
  - cron: '0 6 * * 0'

  # Change to: Daily
  - cron: '0 6 * * *'

  # Change to: Twice a week (Sunday & Wednesday)
  - cron: '0 6 * * 0,3'
```

### Change Topic Sources

Edit `scripts/fetch-trending-topics.js`:

```bash
# Only Hacker News (fastest, most reliable)
node scripts/fetch-trending-topics.js --source=hn

# Only Reddit
node scripts/fetch-trending-topics.js --source=reddit

# All sources (default)
node scripts/fetch-trending-topics.js --source=all
```

### Add More Keywords

Edit `scripts/fetch-trending-topics.js` line ~25:

```javascript
techKeywords: [
  'AI', 'ML', 'machine learning',
  // Add your interests:
  'blockchain', 'web3', 'rust', 'go'
]
```

---

## 📊 What Topics Get Selected?

**Scoring system:**

🔥 **High Score (Priority):**
- Mentions: AI, GPT, Claude, breakthrough, future
- High engagement (upvotes/comments)
- Recent (last 24 hours)

❄️ **Low Score:**
- Tutorial/beginner content
- "How to" guides
- Old topics

**You get the hottest, most relevant topics first!**

---

## 🐛 Troubleshooting

### "No topics found"

**Fix:**
```bash
# Try just Hacker News
node scripts/fetch-trending-topics.js --source=hn --limit=20
```

### "Queue is empty"

**Fix:**
```bash
# Fetch new topics
node scripts/fetch-trending-topics.js

# Verify it worked
cat public/data/topics-queue.json | jq '.topics | length'
```

### Reddit not working

**This is normal!** Reddit can be rate-limited. Hacker News alone provides excellent topics.

---

## 📚 Full Documentation

See **`docs/TRENDING_TOPICS_SETUP.md`** for:
- Complete API setup
- n8n workflow integration
- Advanced configuration
- NewsAPI integration
- Custom scoring logic
- And much more!

---

## 🎉 You're All Set!

**What happens next:**

1. ✅ **This Sunday:** Topics automatically fetched
2. ✅ **Every day:** Articles use trending topics
3. ✅ **Result:** Always writing about what's current

**Or test it now:**
```bash
node scripts/fetch-trending-topics.js
node scripts/generate-article-static.js
```

**Questions?** Check `docs/TRENDING_TOPICS_SETUP.md` for detailed docs!

---

**Happy writing! 🚀**
