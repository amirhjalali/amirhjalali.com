
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
        },
    })

    // Get the first 27 articles (newest ones)
    const candidates = articles.slice(0, 27)
    const idsToDelete = candidates.map(a => a.id)

    console.log(`Found ${candidates.length} articles to delete.`)

    if (candidates.length === 0) {
        console.log('No articles to delete.')
        return
    }

    // Delete them
    const result = await prisma.article.deleteMany({
        where: {
            id: {
                in: idsToDelete
            }
        }
    })

    console.log(`Successfully deleted ${result.count} articles.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
