import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { publishedArticles } from '../data/published.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const outputPath = path.resolve(__dirname, '../public/data/published.json')
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, JSON.stringify(publishedArticles, null, 2))
  console.log(`Wrote ${publishedArticles.length} articles to ${outputPath}`)
}

main().catch((error) => {
  console.error('Failed to generate published.json', error)
  process.exit(1)
})
