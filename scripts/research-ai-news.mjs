import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { XMLParser } from 'fast-xml-parser'
import OpenAI from 'openai'
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── Configuration ──────────────────────────────────────────────────────────

const RSS_FEEDS = [
  { name: 'ArXiv CS.AI', url: 'https://rss.arxiv.org/rss/cs.AI' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
  { name: 'VentureBeat', url: 'https://venturebeat.com/category/ai/feed/' },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/' },
  { name: 'Wired AI', url: 'https://www.wired.com/feed/tag/ai/latest/rss' },
  { name: 'Reuters Tech', url: 'https://feeds.reuters.com/reuters/technologyNews' },
  { name: 'Google News AI', url: 'https://news.google.com/rss/search?q=artificial+intelligence+OR+%22AI+model%22+OR+%22machine+learning%22&hl=en-US&gl=US&ceid=US:en' },
]

const FEED_TIMEOUT_MS = 10_000
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

const CATEGORIES = [
  { name: 'Research & Papers', slug: 'research-papers' },
  { name: 'Industry & Products', slug: 'industry-products' },
  { name: 'Open Source & Tools', slug: 'open-source-tools' },
  { name: 'Policy & Ethics', slug: 'policy-ethics' },
  { name: 'Analysis & Opinion', slug: 'analysis-opinion' },
  { name: 'Community Buzz', slug: 'community-buzz' },
]

// ─── RSS Fetching ───────────────────────────────────────────────────────────

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

/**
 * Fetch a single RSS feed with timeout. Returns raw XML text or null on failure.
 */
async function fetchFeed(feed) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS)

  try {
    console.log(`  Fetching ${feed.name}...`)
    const response = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'MrAI-News-Researcher/1.0 (amirhjalali.com)',
      },
    })

    if (!response.ok) {
      console.warn(`  Warning: ${feed.name} returned HTTP ${response.status}`)
      return null
    }

    const text = await response.text()
    console.log(`  OK: ${feed.name} (${(text.length / 1024).toFixed(1)} KB)`)
    return text
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`  Warning: ${feed.name} timed out after ${FEED_TIMEOUT_MS / 1000}s`)
    } else {
      console.warn(`  Warning: ${feed.name} failed - ${error.message}`)
    }
    return null
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Parse an article date from various RSS date fields.
 * Returns a Date object or null if parsing fails.
 */
function parseArticleDate(item) {
  const raw = item.pubDate || item.published || item.updated || item['dc:date']
  if (!raw) return null

  const dateStr = typeof raw === 'string' ? raw : String(raw)
  const parsed = new Date(dateStr)

  if (isNaN(parsed.getTime())) return null
  return parsed
}

/**
 * Extract articles from parsed XML, handling both RSS 2.0 and Atom formats.
 */
function extractArticles(parsed, sourceName) {
  const articles = []

  // RSS 2.0 format: rss > channel > item
  const rssItems = parsed?.rss?.channel?.item
  if (rssItems) {
    const items = Array.isArray(rssItems) ? rssItems : [rssItems]
    for (const item of items) {
      articles.push({
        title: item.title || '',
        url: item.link || '',
        description: item.description || item['content:encoded'] || '',
        date: parseArticleDate(item),
        source: sourceName,
      })
    }
    return articles
  }

  // Atom format: feed > entry
  const atomEntries = parsed?.feed?.entry
  if (atomEntries) {
    const entries = Array.isArray(atomEntries) ? atomEntries : [atomEntries]
    for (const entry of entries) {
      // Atom links can be objects with @_href or plain strings
      let link = ''
      if (entry.link) {
        if (Array.isArray(entry.link)) {
          const alt = entry.link.find((l) => l['@_rel'] === 'alternate')
          link = alt?.['@_href'] || entry.link[0]?.['@_href'] || entry.link[0] || ''
        } else if (typeof entry.link === 'object') {
          link = entry.link['@_href'] || ''
        } else {
          link = entry.link
        }
      }

      articles.push({
        title: entry.title || '',
        url: link,
        description: entry.summary || entry.content || '',
        date: parseArticleDate(entry),
        source: sourceName,
      })
    }
    return articles
  }

  // RDF / RSS 1.0 format: rdf:RDF > item
  const rdfRoot = parsed?.['rdf:RDF']
  if (rdfRoot) {
    const rdfItems = rdfRoot.item
    if (rdfItems) {
      const items = Array.isArray(rdfItems) ? rdfItems : [rdfItems]
      for (const item of items) {
        articles.push({
          title: item.title || '',
          url: item.link || '',
          description: item.description || '',
          date: parseArticleDate(item),
          source: sourceName,
        })
      }
      return articles
    }
  }

  return articles
}

/**
 * Strip HTML tags from a string for cleaner descriptions.
 */
function stripHtml(str) {
  if (!str || typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

// ─── Community Sources (Hacker News + Reddit) ──────────────────────────────

const AI_KEYWORDS = /\b(ai|artificial intelligence|llm|gpt|claude|gemini|openai|anthropic|deepmind|machine learning|deep learning|neural|transformer|diffusion|chatbot|copilot|midjourney|stable diffusion|llama|mistral|groq|perplexity|hugging\s?face|langchain|rag|fine.?tun|rlhf|agent|multimodal|embedding|token|inference|training|benchmark|reasoning model|foundation model)\b/i

/**
 * Fetch top AI-related stories from Hacker News.
 */
async function fetchHackerNews() {
  console.log('  Fetching Hacker News top stories...')
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS)

    const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) {
      console.warn(`  Warning: Hacker News returned HTTP ${res.status}`)
      return []
    }

    const ids = await res.json()
    // Fetch top 40 stories to find AI-related ones
    const storyPromises = ids.slice(0, 40).map(async (id) => {
      try {
        const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        return r.ok ? r.json() : null
      } catch {
        return null
      }
    })

    const stories = (await Promise.all(storyPromises)).filter(Boolean)
    const now = new Date()
    const cutoff = new Date(now.getTime() - TWENTY_FOUR_HOURS_MS)

    const aiStories = stories.filter((s) => {
      if (!s.title || !s.url) return false
      const storyDate = new Date(s.time * 1000)
      if (storyDate < cutoff) return false
      return AI_KEYWORDS.test(s.title) || AI_KEYWORDS.test(s.url)
    })

    console.log(`  OK: Hacker News (${aiStories.length} AI stories from top 40, ${stories.length} total)`)

    return aiStories.map((s) => ({
      title: s.title,
      url: s.url,
      description: `Score: ${s.score} | ${s.descendants || 0} comments on Hacker News`,
      date: new Date(s.time * 1000),
      source: 'Hacker News',
      communitySignal: { score: s.score, comments: s.descendants || 0 },
    }))
  } catch (error) {
    console.warn(`  Warning: Hacker News failed - ${error.message}`)
    return []
  }
}

/**
 * Fetch top AI posts from Reddit subreddits.
 */
async function fetchReddit() {
  const subreddits = ['MachineLearning', 'artificial', 'LocalLLaMA']
  const articles = []

  for (const sub of subreddits) {
    console.log(`  Fetching r/${sub}...`)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS)

      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=15`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'MrAI-News-Researcher/1.0 (amirhjalali.com)',
        },
      })
      clearTimeout(timeout)

      if (!res.ok) {
        console.warn(`  Warning: r/${sub} returned HTTP ${res.status}`)
        continue
      }

      const data = await res.json()
      const posts = data?.data?.children || []
      const now = new Date()
      const cutoff = new Date(now.getTime() - TWENTY_FOUR_HOURS_MS)

      let count = 0
      for (const post of posts) {
        const p = post.data
        if (!p || p.stickied) continue

        const postDate = new Date(p.created_utc * 1000)
        if (postDate < cutoff) continue

        count++
        articles.push({
          title: p.title,
          url: p.url && !p.url.includes('reddit.com') ? p.url : `https://reddit.com${p.permalink}`,
          description: `r/${sub} | Score: ${p.score} | ${p.num_comments} comments${p.selftext ? ' | ' + p.selftext.slice(0, 200) : ''}`,
          date: postDate,
          source: `Reddit r/${sub}`,
          communitySignal: { score: p.score, comments: p.num_comments },
        })
      }
      console.log(`  OK: r/${sub} (${count} recent posts)`)
    } catch (error) {
      console.warn(`  Warning: r/${sub} failed - ${error.message}`)
    }
  }

  return articles
}

// ─── OpenAI Summarization ───────────────────────────────────────────────────

async function summarizeWithOpenAI(articles) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const articleList = articles
    .map((a, i) => {
      const desc = stripHtml(a.description).slice(0, 300)
      const engagement = a.communitySignal
        ? `\n   Engagement: Score ${a.communitySignal.score}, ${a.communitySignal.comments} comments`
        : ''
      return `${i + 1}. [${a.source}] "${a.title}"\n   URL: ${a.url}\n   Description: ${desc}${engagement}`
    })
    .join('\n\n')

  const categoryNames = CATEGORIES.map((c) => `"${c.name}" (slug: "${c.slug}")`).join(', ')

  const systemPrompt = `You are an AI news analyst tracking both formal publications and community buzz. You will receive articles from news sites, RSS feeds, Hacker News, and Reddit. Your job is to:

1. FILTER: Only include articles genuinely about AI/ML. Discard tangentially related tech news.
2. CATEGORIZE each included article into exactly one of these categories: ${categoryNames}
   - Use "community-buzz" for items that are trending/viral in the AI community — things people are talking about on social platforms, hot demos, surprising launches, or contentious takes. These might not be "important" from a research standpoint but represent what the community is excited or arguing about.
   - Articles from Hacker News and Reddit with high engagement (scores, comments) are strong candidates for "community-buzz" unless they clearly fit another category better.
3. SUMMARIZE each article in 1-2 sentences.
4. RATE significance: "high" = major development or very high community engagement, "medium" = notable, "low" = minor.
   - For community-buzz items, high engagement (100+ HN score, 50+ Reddit score) should boost significance.
5. TAG each article with 2-3 relevant tags (lowercase, hyphenated).
6. Pick the single TOP STORY — could be the most technically important OR the most discussed item of the day. Write a 2-3 sentence analysis of why it matters.
7. Write a 2-3 sentence overall BRIEFING SUMMARY that captures both the formal news and the community vibe.

Respond with valid JSON matching this exact structure:
{
  "briefingSummary": "2-3 sentence overview of the day's AI news and community discussion...",
  "topStory": {
    "articleIndex": 0,
    "analysis": "2-3 sentences on why this is the top story..."
  },
  "articles": [
    {
      "articleIndex": 0,
      "category": "research-papers",
      "summary": "1-2 sentence summary...",
      "significance": "high",
      "tags": ["tag-one", "tag-two"]
    }
  ]
}

IMPORTANT:
- articleIndex refers to the 1-based index number from the input list.
- Only include articles genuinely about AI/ML.
- Items with engagement signals (HN score, Reddit votes) indicate community interest — factor this in.
- Be concise but informative.
- Return ONLY valid JSON, no markdown code blocks.`

  console.log('\nSending articles to OpenAI for analysis...')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Here are today's articles:\n\n${articleList}` },
    ],
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI returned empty response')
  }

  return JSON.parse(content)
}

// ─── Output Assembly ────────────────────────────────────────────────────────

function assembleOutput(articles, aiResponse, metadata) {
  const today = new Date().toISOString().split('T')[0]

  // Build category map
  const categoryMap = {}
  for (const cat of CATEGORIES) {
    categoryMap[cat.slug] = {
      name: cat.name,
      slug: cat.slug,
      items: [],
    }
  }

  // Map AI response articles back to original data
  for (const aiArticle of aiResponse.articles) {
    const originalIndex = aiArticle.articleIndex - 1
    const original = articles[originalIndex]
    if (!original) continue

    const catSlug = aiArticle.category
    if (!categoryMap[catSlug]) continue

    categoryMap[catSlug].items.push({
      title: original.title,
      source: original.source,
      url: original.url,
      summary: aiArticle.summary,
      significance: aiArticle.significance,
      tags: aiArticle.tags,
    })
  }

  // Build top story
  const topOriginal = articles[(aiResponse.topStory?.articleIndex || 1) - 1]
  const topAiArticle = aiResponse.articles.find(
    (a) => a.articleIndex === aiResponse.topStory?.articleIndex
  )

  const topStory = topOriginal
    ? {
        title: topOriginal.title,
        source: topOriginal.source,
        url: topOriginal.url,
        summary: topAiArticle?.summary || '',
        analysis: aiResponse.topStory?.analysis || '',
      }
    : null

  // Filter out empty categories
  const categories = Object.values(categoryMap).filter((c) => c.items.length > 0)

  const articlesIncluded = categories.reduce((sum, c) => sum + c.items.length, 0)

  return {
    date: today,
    generatedAt: new Date().toISOString(),
    briefingSummary: aiResponse.briefingSummary || '',
    topStory,
    categories,
    metadata: {
      sourcesChecked: metadata.sourcesChecked,
      articlesFound: metadata.articlesFound,
      articlesIncluded,
      model: 'gpt-4o-mini',
      processingTime: metadata.processingTime,
    },
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const startTime = performance.now()

  console.log('=== AI News Research Script ===')
  console.log(`Date: ${new Date().toISOString().split('T')[0]}`)
  console.log(`Checking ${RSS_FEEDS.length} RSS feeds + Hacker News + Reddit...\n`)

  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is not set.')
    process.exit(1)
  }

  // Fetch all sources in parallel: RSS feeds + HN + Reddit
  const [feedResults, hnArticles, redditArticles] = await Promise.all([
    Promise.all(RSS_FEEDS.map((feed) => fetchFeed(feed))),
    fetchHackerNews(),
    fetchReddit(),
  ])

  // Parse feeds and extract articles
  const now = new Date()
  const cutoff = new Date(now.getTime() - TWENTY_FOUR_HOURS_MS)
  let allArticles = []
  let totalFound = 0

  for (let i = 0; i < RSS_FEEDS.length; i++) {
    const xml = feedResults[i]
    if (!xml) continue

    try {
      const parsed = xmlParser.parse(xml)
      const articles = extractArticles(parsed, RSS_FEEDS[i].name)
      totalFound += articles.length

      // Filter to last 24 hours
      const recent = articles.filter((a) => {
        if (!a.date) return false
        return a.date >= cutoff && a.date <= now
      })

      console.log(`  ${RSS_FEEDS[i].name}: ${articles.length} total, ${recent.length} in last 24h`)
      allArticles.push(...recent)
    } catch (error) {
      console.warn(`  Warning: Failed to parse ${RSS_FEEDS[i].name} XML - ${error.message}`)
    }
  }

  // Add community source articles
  console.log(`\n  Hacker News: ${hnArticles.length} AI stories`)
  console.log(`  Reddit: ${redditArticles.length} posts`)
  allArticles.push(...hnArticles, ...redditArticles)
  totalFound += hnArticles.length + redditArticles.length

  // Deduplicate by URL
  const seen = new Set()
  allArticles = allArticles.filter((a) => {
    if (!a.url || seen.has(a.url)) return false
    seen.add(a.url)
    return true
  })

  const totalSources = RSS_FEEDS.length + 1 + 3 // RSS + HN + 3 subreddits
  console.log(`\nTotal articles found across all sources: ${totalFound}`)
  console.log(`Articles from last 24 hours (deduplicated): ${allArticles.length}`)

  if (allArticles.length === 0) {
    console.log('\nNo articles found in the last 24 hours. Writing empty briefing.')
    const emptyOutput = {
      date: new Date().toISOString().split('T')[0],
      generatedAt: new Date().toISOString(),
      briefingSummary: 'No AI news articles were found in the last 24 hours from monitored sources.',
      topStory: null,
      categories: [],
      metadata: {
        sourcesChecked: totalSources,
        articlesFound: totalFound,
        articlesIncluded: 0,
        model: 'gpt-4o-mini',
        processingTime: parseFloat(((performance.now() - startTime) / 1000).toFixed(1)),
      },
    }
    await writeOutput(emptyOutput)
    return
  }

  if (allArticles.length < 3) {
    console.log('\nNote: Fewer than 3 articles found. Generating briefing with available articles.')
  }

  // Send to OpenAI for summarization
  const aiResponse = await summarizeWithOpenAI(allArticles)

  const elapsed = parseFloat(((performance.now() - startTime) / 1000).toFixed(1))
  console.log(`\nOpenAI analysis complete. Processing time: ${elapsed}s`)

  // Assemble final output
  const output = assembleOutput(allArticles, aiResponse, {
    sourcesChecked: totalSources,
    articlesFound: totalFound,
    processingTime: elapsed,
  })

  await writeOutput(output)
}

async function writeOutput(output) {
  const outputDir = path.resolve(__dirname, '../public/data/ai-research')
  await fs.mkdir(outputDir, { recursive: true })

  const outputPath = path.join(outputDir, `${output.date}.json`)
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2))

  console.log(`\nOutput written to: ${outputPath}`)
  console.log(`  Sources checked: ${output.metadata.sourcesChecked}`)
  console.log(`  Articles found: ${output.metadata.articlesFound}`)
  console.log(`  Articles included: ${output.metadata.articlesIncluded}`)
  console.log(`  Categories: ${output.categories.length}`)
  if (output.topStory) {
    console.log(`  Top story: "${output.topStory.title}" (${output.topStory.source})`)
  }
  console.log('\nDone.')
}

main().catch((error) => {
  console.error('\nFatal error:', error.message)
  process.exit(1)
})
