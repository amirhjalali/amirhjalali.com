import { prisma } from '../lib/db'

const articleDates: Record<string, string> = {
  // Original Google Sites articles - chronological by topic relevance
  "cmivzde0j0000jpp7l08ueo08": "2023-03-15T12:00:00Z", // Information
  "cmivzde200001jpp7yhi9lkyz": "2023-03-22T12:00:00Z", // Art
  "cmivzde2z0002jpp7ipp8qp2l": "2023-04-05T12:00:00Z", // Education
  "cmivzde400003jpp7r6s3mcfk": "2023-06-18T12:00:00Z", // AI revolution
  "cmivzde4z0004jpp7rzssu2yb": "2023-08-10T12:00:00Z", // Synthetic Data
  "cmivzde5w0005jpp7ejjt5zyq": "2023-09-25T12:00:00Z", // Are we our IDEAS?
  "cmivzde6t0006jpp7dqv2t3xi": "2023-11-12T12:00:00Z", // Data Crop
  "cmivzde8s0008jpp7n6fkykzd": "2024-01-20T12:00:00Z", // Chain of Thought
  "cmivzde7s0007jpp7x6xwx04d": "2024-04-22T12:00:00Z", // LLAMA3 (released April 2024)
  "cmivzde9m0009jpp70keg9hie": "2024-09-15T12:00:00Z", // Reasoning Models (o1 Sept 2024)
  "cmivzdel2000ljpp7igm5tzfa": "2024-10-08T12:00:00Z", // AI Videos
  "cmivzdem4000mjpp70hd3vxla": "2024-11-02T12:00:00Z", // AI and Creativity
  "cmivzdeaj000ajpp7nd6apflp": "2025-01-25T12:00:00Z", // DeepSeek (released Jan 2025)
  "cmivzdebf000bjpp72bcuaee8": "2025-02-18T12:00:00Z", // Era of Vibe Coding
  "cmivzdecg000cjpp72ukjjt2q": "2025-03-28T12:00:00Z", // 4O image generation
  "cmivzdedb000djpp7qg4quae3": "2025-04-15T12:00:00Z", // Edge of Vibe Coding
  "cmivzdeh0000hjpp76b1qosyu": "2025-05-10T12:00:00Z", // Claude Code Features
  "cmivzdehx000ijpp7s2nk416s": "2025-06-02T12:00:00Z", // Claude Debugging
  "cmjox2z9t0000qm0mutqp244j": "2025-07-20T12:00:00Z", // Evaluating AI
  "cmjoxd1220002o60lbw36o0o9": "2025-08-15T12:00:00Z", // Economy of AI Agents
}

async function fixArticleDates() {
  console.log('Updating article dates...\n')

  for (const [id, dateStr] of Object.entries(articleDates)) {
    try {
      const article = await prisma.article.findUnique({ where: { id } })
      if (!article) {
        console.log(`Article ${id} not found, skipping`)
        continue
      }

      await prisma.article.update({
        where: { id },
        data: { publishedAt: new Date(dateStr) }
      })

      console.log(`✓ ${article.title} → ${dateStr.split('T')[0]}`)
    } catch (error) {
      console.error(`✗ Error updating ${id}:`, error)
    }
  }

  console.log('\nDone!')
}

fixArticleDates()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
