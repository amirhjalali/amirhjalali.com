#!/usr/bin/env node

/**
 * Generate styled project images using DALL-E 3
 * Creates images that represent actual projects while maintaining neural noir aesthetic
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Project image configurations
const projectConfigs = {
  gabooja: {
    name: 'Gabooja',
    prompt: `A single premium black hoodie floating majestically in an infinite void of absolute darkness.

The hoodie is rendered with extreme photorealism — every thread, every fold, every texture visible. It looks impossibly luxurious, the kind of item you'd see in a high-fashion editorial or Apple product shoot.

From beneath the hoodie, ethereal wisps of light and luminous digital particles are rising upward, as if the garment is being materialized from pure data and light. The particles transition from geometric/digital at the bottom to organic fabric at the top — capturing the moment of creation, digital becoming physical.

A single dramatic spotlight from directly above creates a halo effect around the hoodie, with subtle god rays cutting through the darkness. The edges of the garment catch the light with a soft glow.

The overall mood is: witnessing magic happen. Premium. Aspirational. Technological but human.

Think: if Apple made creator merchandise. High-end fashion photography meets subtle sci-fi. The image should make you WANT that hoodie.

Color palette: Deep true black void (#000000 to #050505), pure white light sources, the hoodie itself in charcoal/black with visible texture. No other colors.

Composition: Centered, slightly low angle looking up at the floating garment, creating a sense of reverence and desire.`,
    filename: 'gabooja_noir.png'
  },
  avenu: {
    name: 'Avenu.AI',
    prompt: `A sophisticated dark monochrome mockup of an AI recruitment platform interface.

The scene shows:
- AI-powered candidate matching visualization
- Resume analysis dashboard with scoring
- Interview scheduling interface
- Talent pipeline workflow

Style: Neural noir aesthetic - black (#050505) background with white (#EAEAEA) UI elements.
Subtle AI/neural network patterns integrated into the design.
Clean, corporate-tech feel with dramatic lighting.
Photorealistic, premium SaaS dashboard aesthetic.`,
    filename: 'avenu_noir.png'
  },
  plaiced: {
    name: 'PLAICED',
    prompt: `A dark monochrome mockup of an AI advertising platform interface.

The scene shows:
- Ad campaign dashboard with performance metrics
- AI-generated ad variations preview
- ROI analytics with graphs and charts
- Targeting optimization interface

Style: Neural noir aesthetic - black background with white/gray UI elements.
Data visualization with subtle glow effects.
Premium advertising tech feel.
Photorealistic rendering.`,
    filename: 'plaiced_noir.png'
  },
  argumend: {
    name: 'ARGUMEND',
    prompt: `A dark monochrome mockup of a fact-checking/discourse platform interface.

The scene shows:
- Content analysis panel with claim verification
- Context addition interface
- Source credibility indicators
- Discussion threads with fact-check overlays

Style: Neural noir aesthetic - black background with white/gray elements.
Intellectual, trustworthy feel with clean design.
Subtle neural network patterns suggesting AI analysis.
Photorealistic rendering.`,
    filename: 'argumend_noir.png'
  },
  camp_alborz: {
    name: 'Camp Alborz',
    prompt: `A dark monochrome artistic representation of a global community network.

The scene shows:
- Abstract connected nodes representing people worldwide
- Mountain silhouette (Alborz) in the background
- Community gathering visualization
- Global connections and collaboration paths

Style: Neural noir aesthetic - black background with white/gray elements.
Warm community feel despite dark palette.
Subtle glow on connection points.
Artistic and inspirational.`,
    filename: 'camp_alborz_noir.png'
  },
  portfolio: {
    name: 'MR AI Portfolio',
    prompt: `A dark monochrome mockup of a modern AI-powered portfolio website.

The scene shows:
- Sleek portfolio homepage with hero section
- Project cards with hover states
- AI article generation interface preview
- Modern navigation with smooth animations

Style: Neural noir aesthetic - black (#050505) background with white elements.
Self-referential meta design showing a portfolio within a portfolio.
Premium tech aesthetic.
Photorealistic rendering.`,
    filename: 'portfolio_noir.png'
  }
};

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

async function generateProjectImage(projectKey) {
  const config = projectConfigs[projectKey];
  if (!config) {
    console.error(`Unknown project: ${projectKey}`);
    console.log('Available projects:', Object.keys(projectConfigs).join(', '));
    process.exit(1);
  }

  console.log(`\nGenerating image for ${config.name}...`);
  console.log('Using prompt:', config.prompt.substring(0, 100) + '...\n');

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: config.prompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      style: 'vivid',
    });

    const imageUrl = response.data[0].url;
    const revisedPrompt = response.data[0].revised_prompt;

    console.log('Image generated successfully!');
    console.log('Revised prompt:', revisedPrompt?.substring(0, 200) + '...');

    // Download the image
    const outputPath = path.join(__dirname, '..', 'public', 'images', 'projects', config.filename);
    console.log(`\nDownloading to: ${outputPath}`);

    await downloadImage(imageUrl, outputPath);
    console.log(`\n✓ Image saved: ${config.filename}`);

    return outputPath;
  } catch (error) {
    console.error('Error generating image:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    throw error;
  }
}

// Main execution
const projectKey = process.argv[2];

if (!projectKey) {
  console.log('Usage: node generate-project-image.js <project-key>');
  console.log('\nAvailable projects:');
  Object.entries(projectConfigs).forEach(([key, config]) => {
    console.log(`  ${key} - ${config.name}`);
  });
  process.exit(1);
}

generateProjectImage(projectKey)
  .then((path) => {
    console.log('\nDone! Image saved to:', path);
  })
  .catch((err) => {
    console.error('\nFailed:', err.message);
    process.exit(1);
  });
