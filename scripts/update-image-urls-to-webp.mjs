#!/usr/bin/env node
/**
 * Update database image URLs from PNG/JPG to WebP
 * Run with: node scripts/update-image-urls-to-webp.mjs
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating image URLs to WebP...\n')

  // Find all articles with PNG/JPG image URLs
  const articles = await prisma.article.findMany({
    where: {
      imageUrl: {
        contains: '/images/',
      },
    },
    select: {
      id: true,
      title: true,
      imageUrl: true,
    },
  })

  console.log(`Found ${articles.length} articles with image URLs\n`)

  let updated = 0
  let skipped = 0

  for (const article of articles) {
    if (!article.imageUrl) {
      skipped++
      continue
    }

    // Check if it needs updating (has .png, .jpg, or .jpeg extension)
    if (!/\.(png|jpg|jpeg)$/i.test(article.imageUrl)) {
      skipped++
      continue
    }

    // Replace extension with .webp
    const newUrl = article.imageUrl.replace(/\.(png|jpg|jpeg)$/i, '.webp')

    console.log(`Updating: ${article.title}`)
    console.log(`  Old: ${article.imageUrl}`)
    console.log(`  New: ${newUrl}`)

    await prisma.article.update({
      where: { id: article.id },
      data: { imageUrl: newUrl },
    })

    updated++
  }

  // Also update Notes table if it exists
  try {
    const notes = await prisma.note.findMany({
      where: {
        OR: [
          { thumbnailUrl: { contains: '/images/' } },
          { content: { contains: '/images/' } },
        ],
      },
      select: {
        id: true,
        thumbnailUrl: true,
      },
    })

    console.log(`\nFound ${notes.length} notes with potential image URLs\n`)

    for (const note of notes) {
      if (note.thumbnailUrl && /\.(png|jpg|jpeg)$/i.test(note.thumbnailUrl)) {
        const newUrl = note.thumbnailUrl.replace(/\.(png|jpg|jpeg)$/i, '.webp')
        console.log(`Updating note thumbnail: ${note.id}`)
        console.log(`  Old: ${note.thumbnailUrl}`)
        console.log(`  New: ${newUrl}`)

        await prisma.note.update({
          where: { id: note.id },
          data: { thumbnailUrl: newUrl },
        })
        updated++
      }
    }
  } catch (e) {
    console.log('Note table not found or error accessing it, skipping...')
  }

  console.log('\n' + '='.repeat(50))
  console.log('SUMMARY')
  console.log('='.repeat(50))
  console.log(`Updated: ${updated}`)
  console.log(`Skipped: ${skipped}`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
