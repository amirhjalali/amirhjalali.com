/**
 * Script to calculate reading times for all MrAI content
 *
 * Run with: npx tsx scripts/calculate-reading-times.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// Reading speed constants
const READING_SPEEDS = {
  default: 200,
  technical: 150,
  philosophical: 180,
  casual: 250,
}

interface ContentMetrics {
  path: string
  wordCount: number
  readingTimeMinutes: number
  paragraphCount: number
  sentenceCount: number
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML/JSX tags
    .replace(/&[a-z]+;/gi, ' ') // Replace HTML entities
    .replace(/\{[^}]*\}/g, '') // Remove JSX expressions
    .replace(/className="[^"]*"/g, '') // Remove className attributes
    .replace(/import .+ from .+/g, '') // Remove imports
    .replace(/export .+/g, '') // Remove exports
    .replace(/'use client'/g, '') // Remove directives
    .replace(/const .+ = .+/g, '') // Remove const declarations
    .replace(/function .+\(/g, '') // Remove function declarations
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTextFromJSX(content: string): string {
  // Extract text content from JSX - look for text in paragraphs
  const textMatches = content.match(/>([^<>{]+)</g) || []
  const texts = textMatches.map(match =>
    match.replace(/^>/, '').replace(/<$/, '').trim()
  ).filter(t => t.length > 0)

  return texts.join(' ')
}

function calculateMetrics(text: string, wordsPerMinute = 180): Omit<ContentMetrics, 'path'> {
  const cleanedText = cleanText(text)
  const words = cleanedText.split(/\s+/).filter(word => word.length > 0)
  const wordCount = words.length
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute))

  const paragraphCount = Math.max(
    1,
    text.split(/\n\s*\n|<\/p>/gi).filter(p => p.trim().length > 0).length
  )

  const sentenceCount = cleanedText
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 0).length

  return { wordCount, readingTimeMinutes, paragraphCount, sentenceCount }
}

function scanDirectory(dir: string, results: ContentMetrics[]): void {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(filePath, results)
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      // Only process client components (likely to have content)
      if (file.includes('Client') || file.includes('Page')) {
        const content = fs.readFileSync(filePath, 'utf-8')
        const textContent = extractTextFromJSX(content)

        if (textContent.length > 100) { // Only count substantial content
          const metrics = calculateMetrics(textContent)
          results.push({
            path: filePath.replace(process.cwd(), ''),
            ...metrics,
          })
        }
      }
    }
  }
}

function main(): void {
  console.log('🔍 Calculating reading times for MrAI content...\n')

  const results: ContentMetrics[] = []

  // Scan reflections
  const reflectionsDir = path.join(process.cwd(), 'app/mrai/reflections')
  if (fs.existsSync(reflectionsDir)) {
    scanDirectory(reflectionsDir, results)
  }

  // Scan letters
  const lettersDir = path.join(process.cwd(), 'app/mrai/letters')
  if (fs.existsSync(lettersDir)) {
    scanDirectory(lettersDir, results)
  }

  // Sort by word count descending
  results.sort((a, b) => b.wordCount - a.wordCount)

  // Output results
  console.log('📊 Reading Time Analysis\n')
  console.log('=' .repeat(80))

  let totalWords = 0
  let totalMinutes = 0

  for (const result of results) {
    console.log(`\n📄 ${result.path}`)
    console.log(`   Words: ${result.wordCount.toLocaleString()} | Reading time: ${result.readingTimeMinutes} min`)
    console.log(`   Paragraphs: ${result.paragraphCount} | Sentences: ${result.sentenceCount}`)

    totalWords += result.wordCount
    totalMinutes += result.readingTimeMinutes
  }

  console.log('\n' + '=' .repeat(80))
  console.log(`\n📈 TOTALS`)
  console.log(`   Total pieces: ${results.length}`)
  console.log(`   Total words: ${totalWords.toLocaleString()}`)
  console.log(`   Total reading time: ${totalMinutes} minutes (${(totalMinutes / 60).toFixed(1)} hours)`)
  console.log(`   Average words per piece: ${Math.round(totalWords / results.length).toLocaleString()}`)
}

main()
