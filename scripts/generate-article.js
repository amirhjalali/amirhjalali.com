#!/usr/bin/env node

/**
 * AI Article Generation Script
 *
 * Generates articles using OpenAI or Anthropic APIs and saves them as drafts
 *
 * Usage:
 *   node scripts/generate-article.js [topic]
 *
 * Environment variables:
 *   OPENAI_API_KEY - OpenAI API key
 *   ANTHROPIC_API_KEY - Anthropic API key (Claude)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const config = {
  openaiKey: process.env.OPENAI_API_KEY,
  anthropicKey: process.env.ANTHROPIC_API_KEY,
  useAnthropic: !!process.env.ANTHROPIC_API_KEY,

  // Article generation settings
  style: 'casual',
  targetLength: 'medium', // short (300-500), medium (600-800), long (1000-1500)
  topics: [
    'AI and creativity',
    'Future of work with AI',
    'Ethics in AI development',
    'AI in education',
    'Human-AI collaboration',
    'Machine learning breakthroughs',
    'AI and society',
    'Programming paradigms',
    'Developer productivity',
    'Tech industry trends'
  ]
};

// Helper function to make API requests
function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        } else {
          reject(new Error(`API request failed with status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

// Generate article using OpenAI
async function generateWithOpenAI(topic) {
  console.log('Generating article with OpenAI...');

  const prompt = `Write a thoughtful, engaging article about "${topic}".

Requirements:
- Length: 600-800 words
- Tone: Casual and conversational, like a personal blog post
- Structure: Include 2-3 main sections with headers (use ## for markdown headers)
- Style: Share personal insights and observations
- Include practical examples or analogies
- End with a thought-provoking conclusion

Format the response as a JSON object with:
{
  "title": "Article title (engaging and clickable)",
  "content": "Full article content in markdown format with headers",
  "excerpt": "Brief 2-sentence summary (100-150 chars)",
  "tags": ["array", "of", "relevant", "tags"]
}`;

  const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.openaiKey}`
    }
  };

  const postData = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a thoughtful tech blogger who writes engaging, insightful articles about AI and technology.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.8,
    response_format: { type: "json_object" }
  };

  const response = await makeRequest(options, postData);
  return JSON.parse(response.choices[0].message.content);
}

// Generate article using Anthropic (Claude)
async function generateWithAnthropic(topic) {
  console.log('Generating article with Claude...');

  const prompt = `Write a thoughtful, engaging article about "${topic}".

Requirements:
- Length: 600-800 words
- Tone: Casual and conversational, like a personal blog post
- Structure: Include 2-3 main sections with headers (use ## for markdown headers)
- Style: Share personal insights and observations
- Include practical examples or analogies
- End with a thought-provoking conclusion

Format the response as a JSON object with:
{
  "title": "Article title (engaging and clickable)",
  "content": "Full article content in markdown format with headers",
  "excerpt": "Brief 2-sentence summary (100-150 chars)",
  "tags": ["array", "of", "relevant", "tags"]
}

Return ONLY the JSON object, no other text.`;

  const options = {
    hostname: 'api.anthropic.com',
    port: 443,
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.anthropicKey,
      'anthropic-version': '2023-06-01'
    }
  };

  const postData = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    temperature: 0.8,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  const response = await makeRequest(options, postData);
  const content = response.content[0].text;

  // Extract JSON from response (Claude might wrap it in markdown)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from Claude response');
  }

  return JSON.parse(jsonMatch[0]);
}

// Calculate reading time based on word count
function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// Generate article ID
function generateId() {
  return `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Save article as draft
function saveDraft(article) {
  const draftsFile = path.join(__dirname, '..', 'data', 'drafts.json');

  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing drafts
  let drafts = [];
  if (fs.existsSync(draftsFile)) {
    try {
      drafts = JSON.parse(fs.readFileSync(draftsFile, 'utf8'));
    } catch (e) {
      console.warn('Could not load existing drafts, starting fresh');
    }
  }

  // Add new draft
  drafts.push(article);

  // Save back to file
  fs.writeFileSync(draftsFile, JSON.stringify(drafts, null, 2));

  console.log(`\n✅ Draft saved to ${draftsFile}`);
  return draftsFile;
}

// Main function
async function main() {
  try {
    // Get topic from command line or pick random
    const topic = process.argv[2] || config.topics[Math.floor(Math.random() * config.topics.length)];

    console.log(`\n📝 Generating article about: "${topic}"\n`);

    // Check API keys
    if (!config.openaiKey && !config.anthropicKey) {
      throw new Error('No API keys found. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.');
    }

    // Generate article content
    let articleData;
    if (config.useAnthropic) {
      articleData = await generateWithAnthropic(topic);
    } else {
      articleData = await generateWithOpenAI(topic);
    }

    // Calculate metadata
    const wordCount = articleData.content.trim().split(/\s+/).length;
    const readTime = calculateReadTime(articleData.content);

    // Build article object
    const article = {
      id: generateId(),
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt,
      tags: articleData.tags || ['AI', 'Technology'],
      imageUrl: '', // Can be added later with image generation
      aiGenerated: true,
      author: 'Amir H. Jalali',
      publishedAt: new Date().toISOString(),
      readTime: readTime,
      status: 'draft',
      metadata: {
        style: config.style,
        length: config.targetLength,
        wordCount: wordCount,
        generatedAt: new Date().toISOString(),
        topic: topic,
        model: config.useAnthropic ? 'claude-3-5-sonnet' : 'gpt-4o-mini'
      }
    };

    // Display preview
    console.log('\n' + '='.repeat(80));
    console.log('📰 GENERATED ARTICLE PREVIEW');
    console.log('='.repeat(80));
    console.log(`\nTitle: ${article.title}`);
    console.log(`Excerpt: ${article.excerpt}`);
    console.log(`Tags: ${article.tags.join(', ')}`);
    console.log(`Word Count: ${wordCount}`);
    console.log(`Read Time: ${readTime}`);
    console.log(`\nContent Preview:\n${article.content.substring(0, 300)}...\n`);
    console.log('='.repeat(80));

    // Save as draft
    const draftPath = saveDraft(article);

    console.log(`\n📊 Article Stats:`);
    console.log(`   ID: ${article.id}`);
    console.log(`   Words: ${wordCount}`);
    console.log(`   Read Time: ${readTime}`);
    console.log(`   Model: ${article.metadata.model}`);
    console.log(`   Saved: ${draftPath}`);
    console.log(`\n✨ Done! Check the admin panel at http://localhost:3000/admin to review and publish.`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { generateWithOpenAI, generateWithAnthropic, calculateReadTime };
