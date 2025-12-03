
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Fetch all published articles sorted by publishedAt descending (newest first)
    const articles = await prisma.article.findMany({
        where: {
            published: true,
        },
        orderBy: {
            publishedAt: 'desc',
        },
        select: {
            id: true,
            title: true,
            publishedAt: true,
        },
    })

    console.log(`Total published articles: ${articles.length}`)

    // Get the first 27 articles (newest ones)
    const candidates = articles.slice(0, 27)

    console.log('\n--- Candidates for Deletion (Newest 27) ---\n')
    candidates.forEach((article, index) => {
        console.log(`${index + 1}. [${article.publishedAt?.toISOString().split('T')[0]}] ${article.title} (ID: ${article.id})`)
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
