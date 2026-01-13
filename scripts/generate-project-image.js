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
    prompt: `A single holographic human silhouette floating in an infinite black void, being assembled from thousands of glowing data points and resume fragments.

The figure is mid-formation — the head and shoulders are fully realized and luminous, while the torso dissolves into floating text snippets, skill badges, and experience markers. It's the visualization of AI finding the perfect candidate from millions of data points.

Streams of light connect scattered resume elements (education, skills, experience) flowing upward and coalescing into this ideal candidate form. The effect is like watching a constellation form a person.

A subtle golden/white glow emanates from the completed portions, suggesting "this is the one" — the perfect match found by AI.

The mood: Discovery. Precision. The moment AI surfaces the needle from the haystack.

Color palette: Deep black void, luminous white/silver data streams, subtle warm glow on the formed figure. No UI elements, no dashboards — just the pure concept of AI-powered talent discovery.

Photorealistic rendering with ethereal, almost spiritual quality. Think: if finding perfect talent was visualized as an act of creation.`,
    filename: 'avenu_noir.png'
  },
  plaiced: {
    name: 'PLAICED',
    prompt: `A single floating advertisement creative/banner in the center of an infinite black void, with visible streams of AI optimization happening around it in real-time.

The ad itself is a sleek, minimal rectangular frame — but around it, countless thin light streams are flowing IN from the left (representing audience data, targeting parameters, behavioral signals) and flowing OUT to the right as amplified, glowing conversion paths.

The ad acts as a prism or transformer — chaotic data enters, optimized results emerge. Small floating metrics and upward arrows suggest ROI climbing. The streams have a subtle gradient from cool silver (input) to warm gold (output/conversions).

In the darkness around this central piece, faint ghostly variations of the ad float — A/B test versions that the AI evaluated and dismissed, now fading into the void while the optimized version glows brightest.

The mood: Alchemy. Transformation. AI turning advertising spend into measurable results.

Color palette: True black void, silver/white data streams, golden/warm conversion indicators. The ad creative itself is minimal white on dark.

Photorealistic with data visualization elements. Think: the moment an ad becomes effective, visualized as light passing through a lens.`,
    filename: 'plaiced_noir.png'
  },
  argumend: {
    name: 'ARGUMEND',
    prompt: `A single luminous checkmark or verification symbol emerging from a storm of fragmented, chaotic text in an infinite black void.

The scene captures the moment of truth emerging from noise. Swirling around the edges of the frame are countless text fragments, distorted claims, and garbled information — representing the chaos of online discourse. They spiral inward like a vortex.

At the center, a pristine, glowing verification checkmark hovers — clean, geometric, radiant. It's the signal extracted from noise. Light rays emanate outward from it, pushing back the chaos.

Below the checkmark, settled text becomes readable and organized — facts that have been verified, context that has been added. Above it, the chaos continues to swirl, waiting to be processed.

The mood: Clarity. Truth. The moment understanding defeats misinformation.

Color palette: Deep black void, chaotic gray text fragments at the edges, pure brilliant white for the verification symbol and verified content. No colors — just the stark contrast between confusion and clarity.

The checkmark should feel almost sacred — a beacon of truth in darkness.

Photorealistic rendering with abstract elements. Think: if fact-checking was visualized as light cutting through fog.`,
    filename: 'argumend_noir.png'
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
  portfolio: {
    name: 'MR AI Portfolio',
    prompt: `A sleek, floating laptop or monitor in an infinite black void, its screen glowing with this very portfolio website — a recursive, self-referential image.

The device hovers at a slight angle, premium and minimal — think Apple product photography. The screen displays a dark portfolio interface with elegant typography and subtle UI elements visible but not readable.

From the edges of the screen, streams of code, AI symbols, and creative particles flow outward into the void — representing the AI-powered nature of the site, content being generated, ideas becoming reality.

The glow from the screen is the primary light source, casting subtle reflections on the device's edges. Small floating elements around it suggest the technologies powering it: React symbols, AI nodes, creative sparks.

The mood: Meta. Self-aware. A creation contemplating itself. Technology serving creativity.

Color palette: True black void, the screen glow in cool white/silver, subtle warm accents for the AI elements. The portfolio on screen should feel premium — dark with white text.

The image should feel like peeking behind the curtain — seeing the tool that was used to create everything else in the work section.

Photorealistic product photography with surreal elements. Think: if a portfolio became conscious and looked at itself.`,
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
      quality: 'hd'
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
