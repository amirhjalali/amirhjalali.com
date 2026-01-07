#!/usr/bin/env node

/**
 * Generate project images using Google Gemini
 * Neural Noir Product Shots - Unified visual framework
 */

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Neural Noir Product Shots - Unified visual framework
// Formula: [Hero Object] + [Black Void] + [Dramatic Lighting] + [Ethereal Elements]

const projectConfigs = {
  gabooja: {
    name: 'Gabooja',
    prompt: `A professional e-commerce product photography flat lay of premium streetwear merchandise on a pure black background.

The scene shows: a black premium hoodie laid flat and styled, a black t-shirt folded neatly beside it, a black baseball cap, and black joggers or sweatpants. All items are arranged in an aesthetically pleasing flat lay composition - the kind you'd see on a high-end streetwear brand's Instagram or website.

The products are REAL and TANGIBLE - you can see fabric texture, stitching details, hang tags. This is product photography, not abstract art.

Dramatic overhead lighting creates crisp shadows and highlights the texture of each item. The black garments have subtle tonal variations - charcoal, jet black, faded black - creating visual interest.

A few small props: maybe a phone showing a creator's social media, or small branded elements scattered naturally.

Color palette: Pure black background, products in various black/charcoal tones, crisp white lighting highlights.

Style: High-end streetwear product photography. Think Essentials, Fear of God, or premium creator merch drops.
Mood: Premium. Covetable. "I want to buy this."`,
    filename: 'gabooja_noir.png'
  },

  camp_alborz: {
    name: 'Camp Alborz',
    prompt: `A group of friends sitting around a campfire at night in the desert or mountains, photographed from a cinematic wide angle.

Real people - silhouettes of 6-8 friends gathered in a circle around a warm glowing campfire. Some sitting on the ground, some on camping chairs. Relaxed, happy body language - someone has their arm around a friend, others are leaning back looking at the stars.

Behind them, the dramatic silhouette of a mountain range (the Alborz mountains with Mount Damavand's distinctive volcanic cone) against a star-filled night sky. The Milky Way is faintly visible.

The fire provides warm orange/amber light that illuminates the faces and bodies of the friends closest to it. String lights or lanterns add additional warm glow to the scene.

This is a REAL gathering - you can see camping gear, blankets, maybe someone holding a drink. It feels like a festival campout or a Burning Man-style regional gathering.

Color palette: Deep night sky blues and blacks, warm firelight (orange, amber), cool starlight, silhouetted mountains.

Style: Cinematic night photography. Think National Geographic meets festival culture.
Mood: Friendship. Adventure. "These are my people."`,
    filename: 'camp_alborz_noir.png'
  },

  avenu: {
    name: 'Avenu.AI',
    prompt: `A holographic resume or professional profile card floating in an infinite black void, being assembled from thousands of glowing data points.

The card is mid-formation — the top portion is fully realized and luminous, showing a professional headshot silhouette and key details, while the bottom dissolves into floating text snippets, skill badges, and experience markers. It's the visualization of AI finding the perfect candidate.

Streams of light connect scattered resume elements (education icons, skill tags, experience markers) flowing upward and coalescing into this ideal candidate profile. The effect is like watching a constellation form a document.

A subtle golden/white glow emanates from the completed portions, suggesting "this is the one" — the perfect match found by AI.

Color palette: Deep black void, luminous white/silver data streams, subtle warm gold glow on the formed portions.

Composition: Card centered, angled slightly, data streams flowing from edges.
Mood: Discovery. Precision. AI-powered talent matching.`,
    filename: 'avenu_noir.png'
  },

  plaiced: {
    name: 'PLAICED',
    prompt: `A sleek advertising creative or digital ad frame floating in the center of an infinite black void, with visible streams of AI optimization happening around it.

The ad itself is a minimal rectangular frame with a simple product image inside. Around it, countless thin light streams are flowing IN from the left (representing audience data, targeting signals, behavioral data) and flowing OUT to the right as amplified, glowing conversion paths.

The ad acts as a prism or transformer — chaotic data enters, optimized results emerge. Small floating metrics, percentages, and upward arrows suggest ROI climbing. The streams have a subtle gradient from cool silver (input data) to warm gold (conversions/results).

In the darkness, faint ghostly variations of the ad float nearby — A/B test versions that the AI evaluated, now fading while the optimized version glows brightest.

Color palette: True black void, silver/white data streams, golden warm conversion indicators, the ad frame in clean white.

Composition: Ad centered, data streams flowing left to right, metrics floating nearby.
Mood: Transformation. Optimization. AI turning ad spend into results.`,
    filename: 'plaiced_noir.png'
  },

  argumend: {
    name: 'ARGUMEND',
    prompt: `A luminous verification checkmark or balance scale floating in the center of an infinite black void, emerging from a swirl of chaotic text fragments.

The scene captures truth emerging from noise. Swirling around the edges of the frame are countless text fragments, distorted claims, garbled headlines — representing the chaos of online misinformation. They spiral inward like a vortex being drawn to the center.

At the center, a pristine, glowing checkmark (or balanced scale) hovers — clean, geometric, radiant with white light. It's the signal extracted from noise. Subtle light rays emanate outward from it, pushing back the chaos.

Below the symbol, text becomes readable and organized — verified facts settling into clarity. Above, the chaos continues to swirl, waiting to be processed.

Color palette: Deep black void, chaotic gray text fragments at edges, pure brilliant white for the verification symbol, softer white for verified text.

Composition: Symbol centered, chaos swirling at edges, clarity spreading from center.
Mood: Truth. Clarity. Order from chaos.`,
    filename: 'argumend_noir.png'
  },

  portfolio: {
    name: 'Portfolio',
    prompt: `A sleek laptop or monitor floating in an infinite black void, its screen glowing with a dark portfolio website interface.

The device is premium and minimal — think Apple product photography. It hovers at a slight angle, the screen the primary light source in the void. The portfolio on screen shows dark UI with elegant white typography, project cards, subtle design elements.

From the edges of the screen, streams of code symbols, creative particles, and AI-related iconography flow outward into the void — representing the technology and creativity powering the site. Small React logos, code brackets, sparkles of inspiration float nearby.

The glow from the screen casts subtle reflections on the device's edges. The overall effect is meta — a creation contemplating itself.

Color palette: True black void, screen glow in cool white/silver, subtle warm accents for creative elements.

Composition: Device centered, angled slightly, particles emanating outward.
Mood: Meta. Creative technology. The tool behind the work.`,
    filename: 'portfolio_noir.png'
  }
};

async function generateImage(projectKey, version = '') {
  const config = projectConfigs[projectKey];
  if (!config) {
    console.error(`Unknown project: ${projectKey}`);
    console.log('Available projects:', Object.keys(projectConfigs).join(', '));
    process.exit(1);
  }

  // Add version suffix if provided
  const filename = version
    ? config.filename.replace('.png', `_v${version}.png`)
    : config.filename;

  console.log(`\nGenerating image for ${config.name} using Gemini...`);
  console.log('Output:', filename);
  console.log('Prompt preview:', config.prompt.substring(0, 150) + '...\n');

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

        const outputPath = path.join(__dirname, '..', 'public', 'images', 'projects', filename);
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
const version = process.argv[3]; // Optional version number

if (!projectKey) {
  console.log('Usage: node generate-image-gemini.js <project-key> [version]');
  console.log('\nAvailable projects:');
  Object.entries(projectConfigs).forEach(([key, config]) => {
    console.log(`  ${key} - ${config.name}`);
  });
  console.log('\nExamples:');
  console.log('  node generate-image-gemini.js gabooja        # Saves as gabooja_noir.png');
  console.log('  node generate-image-gemini.js gabooja 2      # Saves as gabooja_noir_v2.png');
  process.exit(1);
}

generateImage(projectKey, version)
  .then((path) => {
    console.log('\nDone!');
  })
  .catch((err) => {
    console.error('\nFailed:', err.message);
    process.exit(1);
  });
