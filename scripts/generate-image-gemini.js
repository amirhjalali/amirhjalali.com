#!/usr/bin/env node

/**
 * Generate project images using Google Gemini (Nano Banana Pro)
 */

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Project prompts
const projectConfigs = {
  gabooja: {
    name: 'Gabooja',
    prompt: `A stylized screenshot of a creator merchandise e-commerce website, displayed at a slight 3D angle floating in a pure black void.

The website shows:
- Dark theme e-commerce platform with "GABOOJA" logo
- Hero section featuring a premium black hoodie product shot
- Tagline like "Turn Moments into Merch" or "Creator Commerce"
- Product grid showing hoodies, t-shirts, caps - all in dark/monochrome colors
- Clean modern UI with Add to Cart buttons, prices
- Creator-focused branding - feels like where YouTubers and streamers sell merch
- Sleek, minimal, premium aesthetic

The screenshot has dark/noir color grading - deep blacks, muted colors, subtle white accents. Product images pop against the dark UI.

Subtle reflection beneath the floating screenshot. The image should convey: creator economy, premium merchandise, modern e-commerce, dark aesthetic.`,
    filename: 'gabooja_gemini.png'
  },
  camp_alborz: {
    name: 'Camp Alborz',
    prompt: `A stylized screenshot of a cultural community website, displayed at a slight 3D angle floating in a pure black void.

The website has an elegant, warm design with these elements:
- Hero section featuring a breathtaking photo of the Alborz mountain range at golden hour, with Mount Damavand visible
- "CAMP ALBORZ" in sophisticated serif typography
- A Rumi poetry quote visible in elegant script
- Navigation: Events, Gallery, Community, Our Story
- Photo grid showing: friends gathering around a sunset campfire, people sharing a Persian feast outdoors, a group hiking in mountains, friends laughing at a chill outdoor party with string lights, cultural celebration with music
- Warm earth tones - cream, taupe, warm browns
- The vibe is sophisticated yet welcoming, Persian heritage meets modern community

The screenshot has dark/noir color grading applied - the warm earth tones become muted but retain warmth, deep shadows, golden hour light preserved as accent.

Subtle reflection beneath. Clean, minimalist web design. The image should convey: cultural community, mountain adventures, friendship, chill gatherings, Persian heritage, warmth and belonging.`,
    filename: 'camp_alborz_noir.png'
  },
  // Can add more projects here as needed
};

async function generateImage(projectKey) {
  const config = projectConfigs[projectKey];
  if (!config) {
    console.error(`Unknown project: ${projectKey}`);
    console.log('Available projects:', Object.keys(projectConfigs).join(', '));
    process.exit(1);
  }

  console.log(`\nGenerating image for ${config.name} using Gemini...`);
  console.log('Prompt:', config.prompt.substring(0, 100) + '...\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp-image-generation',
      contents: config.prompt,
      config: {
        responseModalities: ['Text', 'Image'],
      },
    });

    // Find the image part in the response
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, 'base64');

        const outputPath = path.join(__dirname, '..', 'public', 'images', 'projects', config.filename);
        fs.writeFileSync(outputPath, buffer);

        console.log(`\n✓ Image saved: ${outputPath}`);
        return outputPath;
      } else if (part.text) {
        console.log('Response text:', part.text);
      }
    }

    console.error('No image found in response');
    process.exit(1);
  } catch (error) {
    console.error('Error generating image:', error.message);
    if (error.response) {
      console.error('API Response:', JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
}

// Main execution
const projectKey = process.argv[2];

if (!projectKey) {
  console.log('Usage: node generate-image-gemini.js <project-key>');
  console.log('\nAvailable projects:');
  Object.entries(projectConfigs).forEach(([key, config]) => {
    console.log(`  ${key} - ${config.name}`);
  });
  process.exit(1);
}

generateImage(projectKey)
  .then((path) => {
    console.log('\nDone!');
  })
  .catch((err) => {
    console.error('\nFailed:', err.message);
    process.exit(1);
  });
