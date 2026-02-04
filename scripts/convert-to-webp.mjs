#!/usr/bin/env node
/**
 * Convert all PNG/JPG images in public directory to WebP format
 * Usage: node scripts/convert-to-webp.mjs
 */

import sharp from 'sharp'
import { readdir, stat, unlink } from 'fs/promises'
import { join, extname, dirname, basename } from 'path'

const PUBLIC_DIR = 'public'
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg']
const QUALITY = 85 // WebP quality (0-100)

async function findImages(dir) {
  const images = []

  async function scan(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name)

      if (entry.isDirectory()) {
        // Skip node_modules and .next
        if (entry.name !== 'node_modules' && entry.name !== '.next') {
          await scan(fullPath)
        }
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase()
        if (IMAGE_EXTENSIONS.includes(ext)) {
          images.push(fullPath)
        }
      }
    }
  }

  await scan(dir)
  return images
}

async function convertImage(inputPath) {
  const dir = dirname(inputPath)
  const name = basename(inputPath, extname(inputPath))
  const outputPath = join(dir, `${name}.webp`)

  try {
    const inputStats = await stat(inputPath)
    const inputSize = inputStats.size

    await sharp(inputPath)
      .webp({ quality: QUALITY })
      .toFile(outputPath)

    const outputStats = await stat(outputPath)
    const outputSize = outputStats.size

    const savings = ((inputSize - outputSize) / inputSize * 100).toFixed(1)

    console.log(`✓ ${inputPath}`)
    console.log(`  ${(inputSize / 1024).toFixed(1)}KB → ${(outputSize / 1024).toFixed(1)}KB (${savings}% smaller)`)

    return {
      input: inputPath,
      output: outputPath,
      inputSize,
      outputSize,
      savings: parseFloat(savings)
    }
  } catch (error) {
    console.error(`✗ ${inputPath}: ${error.message}`)
    return null
  }
}

async function main() {
  console.log('Finding images to convert...\n')

  const images = await findImages(PUBLIC_DIR)
  console.log(`Found ${images.length} images to convert\n`)

  const results = []
  let totalInputSize = 0
  let totalOutputSize = 0

  for (const image of images) {
    const result = await convertImage(image)
    if (result) {
      results.push(result)
      totalInputSize += result.inputSize
      totalOutputSize += result.outputSize
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))
  console.log(`Converted: ${results.length}/${images.length} images`)
  console.log(`Total size before: ${(totalInputSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Total size after:  ${(totalOutputSize / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Total savings:     ${((totalInputSize - totalOutputSize) / 1024 / 1024).toFixed(2)} MB (${((totalInputSize - totalOutputSize) / totalInputSize * 100).toFixed(1)}%)`)

  // Output list of original files to delete (optional)
  console.log('\nOriginal files that can be deleted:')
  for (const result of results) {
    console.log(`  rm "${result.input}"`)
  }
}

main().catch(console.error)
