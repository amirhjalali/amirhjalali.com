import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sample articles for seeding an empty database
const sampleArticles = [
    {
        title: "Welcome to My Thoughts",
        excerpt: "An introduction to my blog where I share insights on AI, technology, and data engineering.",
        content: `# Welcome to My Thoughts

I'm excited to share my perspectives on artificial intelligence, data engineering, and technology trends.

## What to Expect

Through this blog, I'll be covering:
- AI and Machine Learning developments
- Data engineering best practices
- Technology strategy insights
- Industry observations

Stay tuned for more content!`,
        tags: ["Welcome", "AI", "Technology"],
        author: "Amir H. Jalali",
        aiGenerated: false
    }
]

async function main() {
    console.log('Starting seed...')

    // Check if database already has articles
    const existingCount = await prisma.article.count()

    if (existingCount > 0) {
        console.log(`Database already has ${existingCount} articles. Skipping seed.`)
        return
    }

    // Seed sample articles
    console.log(`Seeding ${sampleArticles.length} sample articles...`)

    for (const article of sampleArticles) {
        const slug = article.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')

        await prisma.article.create({
            data: {
                title: article.title,
                slug,
                excerpt: article.excerpt,
                content: article.content,
                author: article.author,
                tags: article.tags,
                readTime: `${Math.ceil(article.content.split(' ').length / 200)} min read`,
                aiGenerated: article.aiGenerated,
                published: true,
                publishedAt: new Date(),
                metadata: {},
            }
        })
        console.log(`Created article: ${article.title}`)
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
