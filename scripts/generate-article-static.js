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
  style: 'pragmatic-authoritative',
  targetLength: 'flexible', // 450-750 words, naturally determined by content
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

function normalizeTopic(topic) {
  return topic ? topic.toLowerCase().trim() : '';
}

function getRandomTopic(usedTopics = new Set()) {
  const available = config.topics.filter(
    (topic) => !usedTopics.has(normalizeTopic(topic))
  );

  const pool = available.length > 0 ? available : config.topics;
  return pool[Math.floor(Math.random() * pool.length)];
}

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

  const prompt = `Write a tech article about "${topic}" in the style of amirhjalali.com/thoughts.

VOICE & TONE:
- Pragmatic, lightly opinionated, authoritative
- Mix first-person observations with third-person analysis as needed
- Direct and specific - avoid generic marketing language
- Write like you're documenting real developments, not performing enthusiasm

BANNED PHRASES (never use these):
- "In today's fast-paced…" / "In the digital age…"
- "Discover how…" / "Explore the world of…" / "Unlock the power of…"
- "Revolutionize" / "Unleash" / "Transform"
- "Hey there" / "fellow tech enthusiasts"
- Question-bait endings like "So what do you think?" / "What are your thoughts?"
- Forced analogies like "It's like…" or "Imagine if…"

STRUCTURE:
- Length: 450-750 words (be concise; let content determine actual length)
- Let structure emerge naturally based on topic type:
  * Brief observations: 2-3 sections, direct
  * Industry analysis: News + implications + takeaway
  * Technical deep-dive: Progressive explanation with specifics
  * Field reports: What's happening + what it means
- Use ## headers (Title Case or ALL CAPS for impact)
- Short paragraphs (1-4 sentences each)
- ONE bullet list maximum (only if it genuinely clarifies)
- Optional pull-quote (> block) if there's a genuine insight worth highlighting
- Links: 0-2 maximum, only if essential

CONTENT APPROACH:
- Start directly with the core observation or thesis
- Include specific technical details, not just high-level observations
- Acknowledge limitations and current edges ("as of current...")
- End with a forward-looking insight or direct takeaway, NOT a question
- If discussing personal experience, make it concrete and specific
- Focus on "what this means" not just "what this is"

EXAMPLES OF THE TARGET STYLE:
"Vibe coding is a new paradigm from early 2025 which essentially refers to writing software with the help of LLMs, without actually writing any of the code yourself."

"The biggest friction point comes when a project needs to interact with external data. Whether it's a database or API calls, progress slows down significantly."

"DeepSeek-R1 represents a major breakthrough in AI development, not just for its impressive performance but for the significant cost reductions it introduces."

Format the response as a JSON object with:
{
  "title": "Direct, descriptive title (declarative, no clickbait, no emojis)",
  "content": "Full article in markdown format with natural section structure",
  "excerpt": "1-2 concrete sentences capturing core insight (120-160 chars)",
  "tags": ["specific", "relevant", "technical", "tags"]
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
      { role: 'system', content: 'You are a technical writer documenting developments in AI and technology. Write with authority and pragmatism, avoiding generic marketing language and forced enthusiasm. Focus on concrete observations and specific insights.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
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

// Generate image using DALL-E 3 (two-step process)
async function generateImageWithDALLE(articleData) {
  if (!config.openaiKey) {
    console.log('⚠️  OpenAI API key not found, skipping image generation');
    return '';
  }

  console.log('🎨 Step 1: Deriving image brief from article...');

  // Step 1: Generate image brief from article content
  const briefPrompt = `Derive a hero image concept from this article that matches the visual style on amirhjalali.com/thoughts.

ARTICLE CONTENT:
Title: ${articleData.title}
Excerpt: ${articleData.excerpt}
Content: ${articleData.content.substring(0, 500)}...

VISUAL STYLE REQUIREMENTS:
- Abstract, tech-adjacent aesthetic
- Clean negative space with geometric structure
- May include subtle human/organic elements contrasted with technical forms
- Banner-readable composition (1792×1024)
- NO text, NO people faces, NO logos, NO obvious tech clichés
- Pull visual metaphors directly from the article's thesis and key concepts

Return ONLY a JSON object with:
{
  "image_title": "Short internal name tied to article thesis",
  "motifs": ["3-5 visual elements from the article concepts"],
  "composition": "One-sentence layout description with focal tension",
  "palette": ["1-3 accent colors + neutrals; restrained, not garish"],
  "texture": "Visual treatment (e.g., subtle grain, soft glow, wireframe overlay)",
  "avoid": ["Specific elements to exclude based on clichés"],
  "image_prompt": "Complete DALL-E prompt using above elements, emphasizing abstract geometric forms with subtle organic contrast. Specify: no text, no faces, no logos. Use vivid style with restrained palette and strong negative space.",
  "alt_text": "Accessible description tied to article thesis (≤140 chars)"
}`;

  const briefOptions = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.openaiKey}`
    }
  };

  const briefPostData = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert at translating technical article concepts into abstract visual compositions. Focus on extracting core metaphors and creating coherent image briefs.' },
      { role: 'user', content: briefPrompt }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  };

  let imageBrief;
  try {
    const briefResponse = await makeRequest(briefOptions, briefPostData);
    imageBrief = JSON.parse(briefResponse.choices[0].message.content);
    console.log('✅ Image brief generated');
    console.log(`   Motifs: ${imageBrief.motifs?.join(', ')}`);
    console.log(`   Palette: ${imageBrief.palette?.join(', ')}`);
  } catch (error) {
    console.warn('⚠️  Image brief generation failed:', error.message);
    // Fallback to simple prompt
    const imagePrompt = `Abstract geometric composition representing "${articleData.title}". Tech-focused, modern aesthetic with clean negative space. No text, no faces, no logos. Vivid style with restrained palette.`;
    imageBrief = { image_prompt: imagePrompt };
  }

  console.log('🎨 Step 2: Generating image with DALL-E 3...');

  const imagePrompt = imageBrief.image_prompt;

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

  const prompt = `Write a tech article about "${topic}" in the style of amirhjalali.com/thoughts.

VOICE & TONE:
- Pragmatic, lightly opinionated, authoritative
- Mix first-person observations with third-person analysis as needed
- Direct and specific - avoid generic marketing language
- Write like you're documenting real developments, not performing enthusiasm

BANNED PHRASES (never use these):
- "In today's fast-paced…" / "In the digital age…"
- "Discover how…" / "Explore the world of…" / "Unlock the power of…"
- "Revolutionize" / "Unleash" / "Transform"
- "Hey there" / "fellow tech enthusiasts"
- Question-bait endings like "So what do you think?" / "What are your thoughts?"
- Forced analogies like "It's like…" or "Imagine if…"

STRUCTURE:
- Length: 450-750 words (be concise; let content determine actual length)
- Let structure emerge naturally based on topic type:
  * Brief observations: 2-3 sections, direct
  * Industry analysis: News + implications + takeaway
  * Technical deep-dive: Progressive explanation with specifics
  * Field reports: What's happening + what it means
- Use ## headers (Title Case or ALL CAPS for impact)
- Short paragraphs (1-4 sentences each)
- ONE bullet list maximum (only if it genuinely clarifies)
- Optional pull-quote (> block) if there's a genuine insight worth highlighting
- Links: 0-2 maximum, only if essential

CONTENT APPROACH:
- Start directly with the core observation or thesis
- Include specific technical details, not just high-level observations
- Acknowledge limitations and current edges ("as of current...")
- End with a forward-looking insight or direct takeaway, NOT a question
- If discussing personal experience, make it concrete and specific
- Focus on "what this means" not just "what this is"

EXAMPLES OF THE TARGET STYLE:
"Vibe coding is a new paradigm from early 2025 which essentially refers to writing software with the help of LLMs, without actually writing any of the code yourself."

"The biggest friction point comes when a project needs to interact with external data. Whether it's a database or API calls, progress slows down significantly."

"DeepSeek-R1 represents a major breakthrough in AI development, not just for its impressive performance but for the significant cost reductions it introduces."

Format the response as a JSON object with:
{
  "title": "Direct, descriptive title (declarative, no clickbait, no emojis)",
  "content": "Full article in markdown format with natural section structure",
  "excerpt": "1-2 concrete sentences capturing core insight (120-160 chars)",
  "tags": ["specific", "relevant", "technical", "tags"]
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

// Check if article is a duplicate based on content similarity
function isDuplicate(newArticle, existingDrafts) {
  // Strategy 1: Check for exact title match
  const titleMatch = existingDrafts.some(draft =>
    draft.title.toLowerCase().trim() === newArticle.title.toLowerCase().trim()
  );

  if (titleMatch) {
    console.log(`⚠️  Duplicate detected: Article with title "${newArticle.title}" already exists`);
    return true;
  }

  // Strategy 2: Check content similarity (first 200 chars as fingerprint)
  const newContentFingerprint = newArticle.content
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
    .substring(0, 200);

  const contentMatch = existingDrafts.some(draft => {
    const existingFingerprint = draft.content
      .replace(/[^a-z0-9]/gi, '')
      .toLowerCase()
      .substring(0, 200);

    return existingFingerprint === newContentFingerprint;
  });

  if (contentMatch) {
    console.log(`⚠️  Duplicate detected: Article with similar content already exists`);
    return true;
  }

  // Strategy 3: Check topic similarity (if topics are very similar)
  if (newArticle.metadata?.topic) {
    const topicMatch = existingDrafts.some(draft =>
      draft.metadata?.topic?.toLowerCase().trim() ===
      newArticle.metadata.topic.toLowerCase().trim()
    );

    if (topicMatch) {
      console.log(`⚠️  Duplicate detected: Article with same topic "${newArticle.metadata.topic}" already exists`);
      return true;
    }
  }

  return false;
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

// Get topic from queue or fallback to random
function getTopicFromQueue(usedTopics = new Set()) {
  const queueFile = path.join(__dirname, '../public/data/topics-queue.json');

  // Check if queue file exists
  if (fs.existsSync(queueFile)) {
    try {
      const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));

      if (queue.topics && queue.topics.length > 0) {
        while (queue.topics.length > 0) {
          const topicData = queue.topics.shift();
          const normalized = normalizeTopic(topicData.topic);

          if (normalized && usedTopics.has(normalized)) {
            console.log(
              `⚠️  Skipping queued topic "${topicData.topic}" (already drafted)`
            );
            continue;
          }

          fs.writeFileSync(queueFile, JSON.stringify(queue, null, 2));

          console.log(`📋 Using topic from queue (${queue.topics.length} remaining)`);
          console.log(`   Source: ${topicData.source}`);
          return topicData.topic;
        }

        // All queued topics were duplicates; persist the emptied queue
        fs.writeFileSync(queueFile, JSON.stringify(queue, null, 2));
      }
    } catch (e) {
      console.warn('⚠️  Could not read topics queue, using random topic');
    }
  }

  // Fallback to random topic
  const topic = getRandomTopic(usedTopics);
  console.log('📋 Using random topic from predefined list');
  return topic;
}

// Main function
async function main() {
  try {
    const drafts = loadDrafts();
    const usedTopics = new Set(
      drafts
        .map((draft) => normalizeTopic(draft.metadata?.topic || draft.title))
        .filter(Boolean)
    );

    let topic = process.argv[2];
    if (!topic) {
      topic = getTopicFromQueue(usedTopics);
      if (!topic) {
        console.error('❌ No topics available to generate.');
        return;
      }
    }

    usedTopics.add(normalizeTopic(topic));

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

    // Generate featured image with DALL-E 3 (two-step process based on article content)
    const imageUrl = await generateImageWithDALLE(articleData);

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

    console.log(`\nExisting drafts: ${drafts.length}`);

    // Check for duplicates before adding
    if (isDuplicate(article, drafts)) {
      console.log('\n⚠️  DUPLICATE ARTICLE DETECTED - Skipping generation');
      console.log('   The article has similar content, title, or topic to an existing draft.');
      console.log('   No new draft was created.');
      console.log('\nTo generate a unique article, try:');
      console.log('   1. Specifying a different topic');
      console.log('   2. Deleting the similar draft from drafts.json');
      console.log('   3. Publishing existing drafts to make room for new ones\n');

      // Exit successfully (not an error)
      process.exit(0);
    }

    // Add new draft (only if not duplicate)
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
