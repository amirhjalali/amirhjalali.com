#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts all JPG/PNG images to WebP format and resizes them appropriately
 */

import sharp from 'sharp';
import { readdir, stat, mkdir, copyFile } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const PUBLIC_DIR = join(ROOT_DIR, 'public');

// Configuration for different image types
const IMAGE_CONFIGS = {
  // Project showcase images - high quality, reasonable size
  projects: {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 85,
  },
  // Blog/thought images - medium size
  thoughts: {
    maxWidth: 1000,
    maxHeight: 800,
    quality: 82,
  },
  // AI tool images
  'ai-tools': {
    maxWidth: 800,
    maxHeight: 600,
    quality: 80,
  },
  // Home page images
  home: {
    maxWidth: 1400,
    maxHeight: 1000,
    quality: 85,
  },
  // Default for any other images
  default: {
    maxWidth: 1200,
    maxHeight: 900,
    quality: 80,
  },
};

// Track conversions for reporting
const conversions = {
  total: 0,
  success: 0,
  skipped: 0,
  failed: 0,
  originalSize: 0,
  optimizedSize: 0,
  details: [],
};

/**
 * Get configuration based on image path
 */
function getConfig(imagePath) {
  for (const [key, config] of Object.entries(IMAGE_CONFIGS)) {
    if (imagePath.includes(`/${key}/`)) {
      return config;
    }
  }
  return IMAGE_CONFIGS.default;
}

/**
 * Recursively find all image files
 */
async function findImages(dir, images = []) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await findImages(fullPath, images);
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      // Only process jpg, jpeg, png - skip existing webp and svg
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        images.push(fullPath);
      }
    }
  }

  return images;
}

/**
 * Get file size in bytes
 */
async function getFileSize(filePath) {
  const stats = await stat(filePath);
  return stats.size;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Optimize a single image
 */
async function optimizeImage(imagePath) {
  conversions.total++;

  const ext = extname(imagePath);
  const outputPath = imagePath.replace(ext, '.webp');
  const config = getConfig(imagePath);

  try {
    // Get original size
    const originalSize = await getFileSize(imagePath);
    conversions.originalSize += originalSize;

    // Get image metadata
    const metadata = await sharp(imagePath).metadata();

    // Calculate resize dimensions maintaining aspect ratio
    let width = metadata.width;
    let height = metadata.height;

    if (width > config.maxWidth || height > config.maxHeight) {
      const widthRatio = config.maxWidth / width;
      const heightRatio = config.maxHeight / height;
      const ratio = Math.min(widthRatio, heightRatio);

      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Convert and optimize
    await sharp(imagePath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: config.quality,
        effort: 6, // Higher effort = better compression (0-6)
      })
      .toFile(outputPath);

    // Get optimized size
    const optimizedSize = await getFileSize(outputPath);
    conversions.optimizedSize += optimizedSize;

    const savings = originalSize - optimizedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

    conversions.success++;
    conversions.details.push({
      file: imagePath.replace(PUBLIC_DIR, ''),
      original: formatBytes(originalSize),
      optimized: formatBytes(optimizedSize),
      savings: `${formatBytes(savings)} (${savingsPercent}%)`,
      dimensions: `${width}x${height}`,
    });

    console.log(`✓ ${basename(imagePath)} -> ${basename(outputPath)}`);
    console.log(`  ${formatBytes(originalSize)} -> ${formatBytes(optimizedSize)} (${savingsPercent}% savings)`);

  } catch (error) {
    conversions.failed++;
    console.error(`✗ Failed to optimize ${imagePath}:`, error.message);
  }
}

/**
 * Create backup of original images
 */
async function createBackup(images) {
  const backupDir = join(PUBLIC_DIR, 'images-backup-original');

  console.log('\n📦 Creating backup of original images...');

  try {
    await mkdir(backupDir, { recursive: true });

    for (const imagePath of images) {
      const relativePath = imagePath.replace(join(PUBLIC_DIR, 'images/'), '');
      const backupPath = join(backupDir, relativePath);
      const backupDirPath = dirname(backupPath);

      // Create subdirectories in backup
      await mkdir(backupDirPath, { recursive: true });
      await copyFile(imagePath, backupPath);
    }

    console.log(`✓ Backed up ${images.length} images to ${backupDir}`);
  } catch (error) {
    console.error('✗ Backup failed:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🖼️  Image Optimization Script');
  console.log('================================\n');

  // Find all images in public directory
  console.log('📁 Scanning for images...');
  const images = await findImages(PUBLIC_DIR);

  console.log(`Found ${images.length} images to optimize\n`);

  if (images.length === 0) {
    console.log('No images found to optimize.');
    return;
  }

  // Create backup
  await createBackup(images);

  // Optimize all images
  console.log('\n🔧 Optimizing images...\n');
  for (const imagePath of images) {
    await optimizeImage(imagePath);
  }

  // Print summary
  console.log('\n================================');
  console.log('📊 Optimization Summary');
  console.log('================================');
  console.log(`Total images processed: ${conversions.total}`);
  console.log(`Successfully optimized: ${conversions.success}`);
  console.log(`Failed: ${conversions.failed}`);
  console.log(`Skipped: ${conversions.skipped}`);
  console.log('');
  console.log(`Original total size: ${formatBytes(conversions.originalSize)}`);
  console.log(`Optimized total size: ${formatBytes(conversions.optimizedSize)}`);
  console.log(`Total savings: ${formatBytes(conversions.originalSize - conversions.optimizedSize)}`);
  console.log(`Percentage saved: ${((1 - conversions.optimizedSize / conversions.originalSize) * 100).toFixed(1)}%`);
  console.log('\n✨ Optimization complete!');
  console.log('\n⚠️  Note: Original images have been backed up to public/images-backup-original/');
  console.log('💡 Next step: Update image references in your code to use .webp extension');
}

main().catch(console.error);
