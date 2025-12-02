import { PrismaClient } from '@prisma/client'
import { baseArticles } from '../data/published.mjs'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting seed...')

    // 1. Seed Published Articles
    console.log(`Seeding ${baseArticles.length} published articles...`)
    for (const article of baseArticles) {
        // Create slug from title if not present
        const slug = article.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')

        // Check if exists
        const existing = await prisma.article.findUnique({
            where: { slug }
        })

        if (!existing) {
            await prisma.article.create({
                data: {
                    title: article.title,
                    slug,
                    excerpt: article.excerpt,
                    content: article.content,
                    author: article.author || 'Amir H. Jalali',
                    tags: article.tags || [],
                    imageUrl: article.imageUrl,
                    readTime: `${Math.ceil((article.content.split(' ').length || 0) / 200)} min read`,
                    aiGenerated: article.aiGenerated || false,
                    published: true,
                    publishedAt: new Date(), // Using current date as published date isn't in mjs
                    metadata: {}, // Empty metadata for base articles
                }
            })
            console.log(`Created article: ${article.title}`)
        } else {
            console.log(`Skipping existing article: ${article.title}`)
        }
    }

    // 2. Seed Drafts
    const draftsPath = path.join(process.cwd(), 'public', 'data', 'drafts.json')
    if (fs.existsSync(draftsPath)) {
        const draftsData = fs.readFileSync(draftsPath, 'utf-8')
        const drafts = JSON.parse(draftsData)

        console.log(`Seeding ${drafts.length} drafts...`)

        for (const draft of drafts) {
            // Check if exists by ID (assuming ID is preserved or we use title)
            // Since IDs in JSON are custom strings, we might let Prisma generate new CUIDs 
            // or try to use them if they fit CUID format. 
            // The JSON IDs look like "article-1762679313265-83zl8g7qr" which are NOT CUIDs.
            // So we will let Prisma generate new IDs but check for duplicates by Title.

            const existing = await prisma.draft.findFirst({
                where: { title: draft.title }
            })

            if (!existing) {
                await prisma.draft.create({
                    data: {
                        title: draft.title,
                        content: draft.content,
                        excerpt: draft.excerpt,
                        tags: draft.tags || [],
                        imageUrl: draft.imageUrl,
                        aiGenerated: draft.aiGenerated || false,
                        readTime: draft.readTime,
                        metadata: draft.metadata || {},
                        createdAt: draft.publishedAt ? new Date(draft.publishedAt) : new Date(),
                        updatedAt: new Date(),
                    }
                })
                console.log(`Created draft: ${draft.title}`)
            } else {
                console.log(`Skipping existing draft: ${draft.title}`)
            }
        }
    } else {
        console.log('No drafts.json found, skipping drafts.')
    }

    console.log('Seeding completed.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
