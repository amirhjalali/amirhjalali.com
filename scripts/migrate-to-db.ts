import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100) // Limit length
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

async function migrateArticles() {
  console.log('🚀 Starting migration...\n')

  // Read existing JSON files
  const publishedJson = JSON.parse(
    readFileSync(join(process.cwd(), 'public/data/published.json'), 'utf-8')
  )

  let draftsJson: any[] = []
  try {
    draftsJson = JSON.parse(
      readFileSync(join(process.cwd(), 'public/data/drafts.json'), 'utf-8')
    )
  } catch (e) {
    console.log('⚠️  No drafts.json found, skipping drafts migration\n')
  }

  console.log(`📄 Found ${publishedJson.length} published articles`)
  console.log(`📝 Found ${draftsJson.length} drafts\n`)

  // Migrate published articles
  console.log('Migrating published articles...')
  let publishedCount = 0

  for (const article of publishedJson) {
    try {
      const baseSlug = slugify(article.title)
      const uniqueSlug = await ensureUniqueSlug(baseSlug)

      await prisma.article.create({
        data: {
          id: article.id,
          title: article.title,
          slug: uniqueSlug,
          excerpt: article.excerpt,
          content: article.content,
          author: article.author || 'Amir H. Jalali',
          tags: article.tags || [],
          imageUrl: article.imageUrl || null,
          readTime: article.readTime || '5 min read',
          aiGenerated: article.aiGenerated || false,
          published: true,
          publishedAt: new Date(article.publishedAt),
        }
      })

      publishedCount++
      console.log(`  ✓ ${article.title}`)
    } catch (error: any) {
      console.error(`  ✗ Failed to migrate: ${article.title}`)
      console.error(`    Error: ${error.message}`)
    }
  }

  console.log(`\n✅ Migrated ${publishedCount}/${publishedJson.length} published articles\n`)

  // Migrate drafts
  if (draftsJson.length > 0) {
    console.log('Migrating drafts...')
    let draftsCount = 0

    for (const draft of draftsJson) {
      try {
        await prisma.draft.create({
          data: {
            id: draft.id,
            title: draft.title,
            content: draft.content,
            excerpt: draft.excerpt || null,
            tags: draft.tags || [],
            imageUrl: draft.imageUrl || null,
            aiGenerated: draft.aiGenerated || false,
          }
        })

        draftsCount++
        console.log(`  ✓ ${draft.title}`)
      } catch (error: any) {
        console.error(`  ✗ Failed to migrate draft: ${draft.title}`)
        console.error(`    Error: ${error.message}`)
      }
    }

    console.log(`\n✅ Migrated ${draftsCount}/${draftsJson.length} drafts\n`)
  }

  // Summary
  console.log('📊 Migration Summary:')
  const articleCount = await prisma.article.count()
  const draftCount = await prisma.draft.count()

  console.log(`  • Articles: ${articleCount}`)
  console.log(`  • Drafts: ${draftCount}`)
  console.log(`  • Total: ${articleCount + draftCount}\n`)

  console.log('🎉 Migration complete!')
}

migrateArticles()
  .catch((error) => {
    console.error('\n❌ Migration failed:')
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
