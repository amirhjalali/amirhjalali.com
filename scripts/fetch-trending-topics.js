#!/usr/bin/env node

/**
 * Fetch Trending Tech Topics from Multiple Sources
 *
 * This script fetches trending topics from:
 * - Hacker News (top stories)
 * - Reddit (r/MachineLearning, r/artificial, r/programming)
 * - Optional: NewsAPI (requires API key)
 *
 * Usage:
 *   node scripts/fetch-trending-topics.js
 *   node scripts/fetch-trending-topics.js --source hn
 *   node scripts/fetch-trending-topics.js --limit 5
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  newsApiKey: process.env.NEWS_API_KEY || null,
  limit: parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1]) || 10,
  source: process.argv.find(arg => arg.startsWith('--source='))?.split('=')[1] || 'all',
  outputFile: path.join(__dirname, '../public/data/topics-queue.json'),
  techKeywords: [
    'AI', 'ML', 'machine learning', 'artificial intelligence',
    'programming', 'software', 'developer', 'coding', 'tech',
    'algorithm', 'data science', 'neural network', 'deep learning',
    'LLM', 'GPT', 'Claude', 'chatbot', 'automation'
  ]
};

// Helper to make HTTPS requests
function makeRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ArticleBot/1.0)',
        ...headers
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// Fetch from Hacker News
async function fetchHackerNews() {
  console.log('📰 Fetching from Hacker News...');

  try {
    const topStories = await makeRequest('https://hacker-news.firebaseio.com/v0/topstories.json');
    const storyIds = topStories.slice(0, 30); // Get top 30

    const stories = await Promise.all(
      storyIds.map(id =>
        makeRequest(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          .catch(() => null)
      )
    );

    const topics = stories
      .filter(story => story && story.title)
      .filter(story => config.techKeywords.some(keyword =>
        story.title.toLowerCase().includes(keyword.toLowerCase())
      ))
      .map(story => ({
        title: story.title,
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        score: story.score || 0,
        source: 'Hacker News',
        fetchedAt: new Date().toISOString()
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, config.limit);

    console.log(`   ✓ Found ${topics.length} relevant topics`);
    return topics;
  } catch (error) {
    console.error('   ✗ Failed to fetch from Hacker News:', error.message);
    return [];
  }
}

// Fetch from Reddit
async function fetchReddit(subreddit) {
  console.log(`📰 Fetching from r/${subreddit}...`);

  try {
    const data = await makeRequest(`https://www.reddit.com/r/${subreddit}/hot.json?limit=25`);

    const topics = data.data.children
      .map(post => post.data)
      .filter(post => !post.stickied) // Skip stickied posts
      .filter(post => config.techKeywords.some(keyword =>
        (post.title + ' ' + post.selftext).toLowerCase().includes(keyword.toLowerCase())
      ))
      .map(post => ({
        title: post.title,
        url: `https://reddit.com${post.permalink}`,
        score: post.score,
        source: `r/${subreddit}`,
        fetchedAt: new Date().toISOString()
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, config.limit);

    console.log(`   ✓ Found ${topics.length} relevant topics`);
    return topics;
  } catch (error) {
    console.error(`   ✗ Failed to fetch from r/${subreddit}:`, error.message);
    return [];
  }
}

// Fetch from NewsAPI (requires API key)
async function fetchNewsAPI() {
  if (!config.newsApiKey) {
    console.log('📰 Skipping NewsAPI (no API key set)');
    return [];
  }

  console.log('📰 Fetching from NewsAPI...');

  try {
    const query = 'AI OR "machine learning" OR "artificial intelligence"';
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=popularity&pageSize=20&language=en&apiKey=${config.newsApiKey}`;

    const data = await makeRequest(url);

    const topics = data.articles
      .filter(article => article.title)
      .map(article => ({
        title: article.title,
        url: article.url,
        score: 0,
        source: article.source.name,
        fetchedAt: new Date().toISOString()
      }))
      .slice(0, config.limit);

    console.log(`   ✓ Found ${topics.length} relevant topics`);
    return topics;
  } catch (error) {
    console.error('   ✗ Failed to fetch from NewsAPI:', error.message);
    return [];
  }
}

// Score and rank topics using simple heuristics
function scoreTopics(topics) {
  return topics.map(topic => {
    let score = topic.score || 0;

    // Boost for certain keywords
    const boostKeywords = ['AI', 'GPT', 'Claude', 'breakthrough', 'new', 'future'];
    boostKeywords.forEach(keyword => {
      if (topic.title.toLowerCase().includes(keyword.toLowerCase())) {
        score += 50;
      }
    });

    // Penalize for certain words
    const penaltyKeywords = ['tutorial', 'how to', 'beginner'];
    penaltyKeywords.forEach(keyword => {
      if (topic.title.toLowerCase().includes(keyword.toLowerCase())) {
        score -= 20;
      }
    });

    return { ...topic, adjustedScore: score };
  }).sort((a, b) => b.adjustedScore - a.adjustedScore);
}

// Extract article topics from titles
function extractArticleTopics(topics) {
  return topics.map(topic => {
    // Clean up the title to make it a good article topic
    let cleanTitle = topic.title
      .replace(/\[.*?\]/g, '') // Remove [tags]
      .replace(/\(.*?\)/g, '') // Remove (parentheses)
      .replace(/https?:\/\/\S+/g, '') // Remove URLs
      .replace(/\s+/g, ' ')
      .trim();

    // Shorten if too long
    if (cleanTitle.length > 100) {
      cleanTitle = cleanTitle.substring(0, 97) + '...';
    }

    return {
      topic: cleanTitle,
      originalTitle: topic.title,
      source: topic.source,
      url: topic.url,
      score: topic.adjustedScore || topic.score,
      fetchedAt: topic.fetchedAt
    };
  });
}

// Main function
async function main() {
  console.log('🔍 Fetching trending tech topics...\n');

  let allTopics = [];

  // Fetch from sources based on config
  if (config.source === 'all' || config.source === 'hn') {
    allTopics = allTopics.concat(await fetchHackerNews());
  }

  if (config.source === 'all' || config.source === 'reddit') {
    allTopics = allTopics.concat(await fetchReddit('MachineLearning'));
    allTopics = allTopics.concat(await fetchReddit('artificial'));
    allTopics = allTopics.concat(await fetchReddit('programming'));
  }

  if (config.source === 'all' || config.source === 'news') {
    allTopics = allTopics.concat(await fetchNewsAPI());
  }

  console.log(`\n📊 Total topics found: ${allTopics.length}`);

  // Remove duplicates by title
  const uniqueTopics = [];
  const seenTitles = new Set();

  for (const topic of allTopics) {
    const normalizedTitle = topic.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seenTitles.has(normalizedTitle)) {
      seenTitles.add(normalizedTitle);
      uniqueTopics.push(topic);
    }
  }

  console.log(`📊 Unique topics: ${uniqueTopics.length}`);

  // Score and rank
  const scoredTopics = scoreTopics(uniqueTopics);

  // Extract article topics
  const articleTopics = extractArticleTopics(scoredTopics.slice(0, config.limit * 2));

  // Load existing queue if it exists
  let queue = { topics: [], lastUpdated: null };
  if (fs.existsSync(config.outputFile)) {
    try {
      queue = JSON.parse(fs.readFileSync(config.outputFile, 'utf8'));
    } catch (e) {
      console.warn('⚠️  Could not parse existing queue, creating new one');
    }
  }

  // Add new topics to queue (prepend new ones)
  queue.topics = [...articleTopics, ...queue.topics];
  queue.lastUpdated = new Date().toISOString();

  // Keep only top 50 topics
  queue.topics = queue.topics.slice(0, 50);

  // Save to file
  const dir = path.dirname(config.outputFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(config.outputFile, JSON.stringify(queue, null, 2));

  console.log(`\n✅ Saved ${queue.topics.length} topics to ${config.outputFile}`);
  console.log('\n🎯 Top 5 recommended topics:');
  queue.topics.slice(0, 5).forEach((topic, i) => {
    console.log(`   ${i + 1}. ${topic.topic}`);
    console.log(`      Source: ${topic.source} | Score: ${topic.score}`);
  });

  console.log('\n✨ Done!');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

module.exports = { fetchHackerNews, fetchReddit, fetchNewsAPI, scoreTopics, extractArticleTopics };
