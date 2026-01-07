/**
 * Generate extension icons at various sizes
 * Uses sharp to convert SVG to PNG at different resolutions
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, '..', 'src', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG template for the icon
// White rounded background with black document icon (matching the dark monochrome design)
function createIconSvg(size) {
  const radius = Math.round(size * 0.15);
  const padding = Math.round(size * 0.2);
  const docWidth = size - (padding * 2);
  const docHeight = size - (padding * 2);
  const cornerFold = Math.round(docWidth * 0.25);

  // Document outline points
  const docX = padding;
  const docY = padding;

  // Line dimensions for text representation
  const lineHeight = Math.max(1, Math.round(size * 0.06));
  const lineSpacing = Math.round(size * 0.14);
  const lineStartX = docX + Math.round(docWidth * 0.15);
  const lineWidth = Math.round(docWidth * 0.55);
  const firstLineY = docY + cornerFold + Math.round(size * 0.12);

  // Create line elements
  let lines = '';
  for (let i = 0; i < 3; i++) {
    const y = firstLineY + (i * lineSpacing);
    if (y + lineHeight < docY + docHeight - Math.round(size * 0.1)) {
      lines += `<rect x="${lineStartX}" y="${y}" width="${lineWidth}" height="${lineHeight}" fill="#FFFFFF" rx="${Math.max(0.5, lineHeight / 2)}"/>`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- White rounded background -->
  <rect width="${size}" height="${size}" fill="#FFFFFF" rx="${radius}"/>

  <!-- Black document with corner fold -->
  <path d="M${docX} ${docY}
           L${docX + docWidth - cornerFold} ${docY}
           L${docX + docWidth} ${docY + cornerFold}
           L${docX + docWidth} ${docY + docHeight}
           L${docX} ${docY + docHeight}
           Z" fill="#000000"/>

  <!-- Corner fold detail -->
  <path d="M${docX + docWidth - cornerFold} ${docY}
           L${docX + docWidth - cornerFold} ${docY + cornerFold}
           L${docX + docWidth} ${docY + cornerFold}"
        fill="none" stroke="#FFFFFF" stroke-width="${Math.max(0.5, size * 0.02)}" stroke-opacity="0.3"/>

  <!-- Text lines -->
  ${lines}
</svg>`;
}

async function generateIcons() {
  console.log('Generating extension icons...');

  for (const size of sizes) {
    const svg = createIconSvg(size);
    const outputPath = path.join(iconsDir, `icon${size}.png`);

    try {
      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);
      console.log(`Generated: icon${size}.png`);
    } catch (error) {
      console.error(`Error generating icon${size}.png:`, error);
    }
  }

  console.log('Done!');
}

generateIcons();
