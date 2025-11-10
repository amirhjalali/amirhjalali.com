#!/usr/bin/env node

/**
 * Update Image References Script
 * Replaces all .jpg, .jpeg, .png references with .webp in code files
 */

import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';

const filesToUpdate = [
  'public/data/published.json',
  'public/data/drafts.json',
  'app/projects/page.tsx',
  'data/published.mjs',
  'lib/seo.ts',
  'app/layout.tsx',
  'components/**/*.tsx',
  'app/**/*.tsx',
];

const imageExtensions = ['.jpg', '.jpeg', '.png'];

async function updateFile(filePath) {
  try {
    let content = await readFile(filePath, 'utf-8');
    let updated = false;

    // Replace image extensions
    imageExtensions.forEach(ext => {
      const regex = new RegExp(`${ext}(["'\\s)])`, 'gi');
      if (regex.test(content)) {
        content = content.replace(regex, '.webp$1');
        updated = true;
      }
    });

    if (updated) {
      await writeFile(filePath, content, 'utf-8');
      console.log(`✓ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`  Skipped: ${filePath} (no changes needed)`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔄 Updating image references to WebP...\n');

  let totalUpdated = 0;
  let totalScanned = 0;

  for (const pattern of filesToUpdate) {
    const files = await glob(pattern, { ignore: ['node_modules/**', '.next/**', 'dist/**'] });

    for (const file of files) {
      totalScanned++;
      const wasUpdated = await updateFile(file);
      if (wasUpdated) totalUpdated++;
    }
  }

  console.log('\n================================');
  console.log('📊 Update Summary');
  console.log('================================');
  console.log(`Files scanned: ${totalScanned}`);
  console.log(`Files updated: ${totalUpdated}`);
  console.log('\n✨ Image references updated!');
}

main().catch(console.error);
