#!/usr/bin/env node

/**
 * AI Article Generation Script for Static Sites
 *
 * Generates articles using OpenAI or Anthropic APIs and saves them to public/data/drafts.json
 *
 * Usage:
 *   node scripts/generate-article-static.js [topic]
 *
 * Environment variables:
 *   OPENAI_API_KEY - OpenAI API key
 *   ANTHROPIC_API_KEY - Anthropic API key (Claude)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

// Configuration
const config = {
  openaiKey: process.env.OPENAI_API_KEY,
  anthropicKey: process.env.ANTHROPIC_API_KEY,
  useAnthropic: !!process.env.ANTHROPIC_API_KEY,
  draftsFile: path.join(__dirname, '..', 'public', 'data', 'drafts.json'),

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
    'Tech industry trends',
    'Synthetic data in AI',
    'AI safety and alignment',
    'The evolution of programming languages',
    'Code review best practices',
    'Debugging strategies',
    'Software architecture patterns'
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

// Download image from URL
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filepath);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', reject);
  });
}

// Generate image using DALL-E 3
async function generateImageWithDALLE(title, topic) {
  if (!config.openaiKey) {
    console.log('⚠️  OpenAI API key not found, skipping image generation');
    return '';
  }

  console.log('🎨 Generating featured image with DALL-E 3...');

  const imagePrompt = `Create an artistic, modern featured image for a tech blog article titled "${title}" about ${topic}. Style: abstract, contemporary, tech-focused, visually striking. Use vibrant colors and geometric shapes.`;

  const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/images/generations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.openaiKey}`
    }
  };

  const postData = {
    model: 'dall-e-3',
    prompt: imagePrompt,
    n: 1,
    size: '1792x1024', // Landscape format for featured image
    quality: 'standard',
    style: 'vivid'
  };

  try {
    const response = await makeRequest(options, postData);
    const tempImageUrl = response.data[0].url;
    console.log('✅ Image generated successfully');

    // Download and save the image locally
    const imagesDir = path.join(__dirname, '..', 'public', 'images', 'thoughts');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const imageFileName = `ai-${Date.now()}.png`;
    const imagePath = path.join(imagesDir, imageFileName);

    console.log('📥 Downloading image...');
    await downloadImage(tempImageUrl, imagePath);
    console.log('✅ Image saved locally');

    // Return the public path for the image
    return `/images/thoughts/${imageFileName}`;
  } catch (error) {
    console.warn('⚠️  Image generation failed:', error.message);
    return '';
  }
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

// Load existing drafts
function loadDrafts() {
  if (!fs.existsSync(config.draftsFile)) {
    return [];
  }

  try {
    const data = fs.readFileSync(config.draftsFile, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.warn('Could not load existing drafts, starting fresh');
    return [];
  }
}

// Save drafts to file
function saveDrafts(drafts) {
  // Ensure directory exists
  const dir = path.dirname(config.draftsFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(config.draftsFile, JSON.stringify(drafts, null, 2));
  console.log(`\n✅ Drafts saved to ${config.draftsFile}`);
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
    let modelUsed;
    if (config.useAnthropic) {
      articleData = await generateWithAnthropic(topic);
      modelUsed = 'claude-3-5-sonnet';
    } else {
      articleData = await generateWithOpenAI(topic);
      modelUsed = 'gpt-4o-mini';
    }

    // Generate featured image with DALL-E 3
    const imageUrl = await generateImageWithDALLE(articleData.title, topic);

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
      imageUrl: imageUrl,
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
        model: modelUsed,
        imageModel: imageUrl ? 'dall-e-3' : 'none'
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
    if (imageUrl) {
      console.log(`Image: ${imageUrl}`);
    }
    console.log(`\nContent Preview:\n${article.content.substring(0, 300)}...\n`);
    console.log('='.repeat(80));

    // Load existing drafts
    const drafts = loadDrafts();
    console.log(`\nExisting drafts: ${drafts.length}`);

    // Add new draft
    drafts.push(article);

    // Save back to file
    saveDrafts(drafts);

    console.log(`\n📊 Article Stats:`);
    console.log(`   ID: ${article.id}`);
    console.log(`   Words: ${wordCount}`);
    console.log(`   Read Time: ${readTime}`);
    console.log(`   Text Model: ${article.metadata.model}`);
    console.log(`   Image Model: ${article.metadata.imageModel}`);
    console.log(`   Total Drafts: ${drafts.length}`);
    console.log(`\n✨ Done! Article saved to ${config.draftsFile}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { generateWithOpenAI, generateWithAnthropic, generateImageWithDALLE, calculateReadTime };
