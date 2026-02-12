---
name: research
description: Daily AI research briefing - searches for the latest AI news, research, and community buzz, then compiles a structured briefing
args:
  - name: focus
    description: Optional focus area or topic to emphasize (e.g., "agent frameworks", "what happened with Moltbook")
    required: false
---

# AI Research Briefing

Generate a comprehensive daily AI intelligence briefing by searching the web for the latest developments, research, and community discourse.

## Process

### Step 1: Multi-angle Web Search

Run these searches IN PARALLEL using WebSearch (all of them, every time):

1. `"AI news today" OR "artificial intelligence" latest developments 2026`
2. `site:arxiv.org AI machine learning new papers this week`
3. `site:twitter.com OR site:x.com AI trending discussion today`
4. `site:news.ycombinator.com AI machine learning`
5. `"AI launch" OR "AI release" OR "AI announcement" today`
6. `AI ethics regulation policy news today`
7. `open source AI model release 2026`
8. `AI community buzz viral demo`

If `{{focus}}` is provided, add a 9th search specifically for that topic.

### Step 2: Deep Read

From the search results, identify the 20-30 most interesting items. For the top 5-8 most significant stories, use WebFetch to read the actual article/page for deeper context. This is especially important for:
- Stories that seem like they could be the top story of the day
- Items with high community engagement (HN, Reddit, X)
- Anything that would benefit from more than just a headline summary

### Step 3: Compile the Briefing

Organize findings into this JSON structure and write to `public/data/ai-research/YYYY-MM-DD.json` (use today's date):

```json
{
  "date": "YYYY-MM-DD",
  "generatedAt": "ISO timestamp",
  "briefingSummary": "2-3 sentences capturing the day's AI landscape - both formal news and community vibe",
  "topStory": {
    "title": "The most important or most discussed item",
    "source": "Where it came from",
    "url": "Real, working URL",
    "summary": "1-2 sentences",
    "analysis": "2-3 sentences on why this matters"
  },
  "categories": [
    {
      "name": "Research & Papers",
      "slug": "research-papers",
      "items": [{ "title": "", "source": "", "url": "", "summary": "", "significance": "high|medium|low", "tags": [] }]
    },
    {
      "name": "Industry & Products",
      "slug": "industry-products",
      "items": []
    },
    {
      "name": "Open Source & Tools",
      "slug": "open-source-tools",
      "items": []
    },
    {
      "name": "Policy & Ethics",
      "slug": "policy-ethics",
      "items": []
    },
    {
      "name": "Analysis & Opinion",
      "slug": "analysis-opinion",
      "items": []
    },
    {
      "name": "Community Buzz",
      "slug": "community-buzz",
      "items": []
    }
  ],
  "metadata": {
    "sourcesChecked": 0,
    "articlesFound": 0,
    "articlesIncluded": 0,
    "model": "claude-code",
    "processingTime": 0
  }
}
```

### Category Guidelines

- **Research & Papers**: ArXiv papers, academic research, benchmark results, technical breakthroughs
- **Industry & Products**: Company announcements, product launches, funding rounds, partnerships
- **Open Source & Tools**: New model releases, framework updates, developer tools, GitHub repos
- **Policy & Ethics**: Regulation, safety concerns, ethical debates, government actions
- **Analysis & Opinion**: Thought pieces, predictions, industry analysis, expert commentary
- **Community Buzz**: Things trending on X/Twitter, HN, Reddit. Viral demos, hot takes, memes, drama. Things people are *talking about* even if not technically important. This is where items like "Moltbook" would go - maybe not groundbreaking research but definitely the conversation of the day.

### Quality Rules

1. **Every URL must be real and working** - never fabricate links
2. **Aim for 15-25 items total** across all categories
3. **Community Buzz should always have items** - there's always something people are talking about
4. **Top story can come from any category** - the most discussed item might be community buzz, not a research paper
5. **Significance rating**: high = major development or viral, medium = notable, low = worth mentioning
6. **Tags**: 2-3 lowercase hyphenated tags per item
7. **Summaries**: 1-2 sentences, concrete and specific, not generic
8. **Don't include empty categories** - only categories that have items

### Step 4: Commit and Push

```bash
git add public/data/ai-research/
git commit -m "Daily AI research briefing - YYYY-MM-DD"
git push origin main
```

### Step 5: Output Summary

Display a brief summary to the user:

```
AI Research Briefing - [Date]
Top Story: [title] ([source])
[X] items across [Y] categories
Committed and pushed.
```

## Important Notes

- Run ALL web searches in parallel for speed
- The value of this briefing is in capturing what traditional news misses - the community discourse, the X threads, the Reddit debates
- Be honest about significance - not everything is "groundbreaking"
- If a focus area was specified, make sure it gets prominent coverage but don't ignore everything else
