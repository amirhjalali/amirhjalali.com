import { promises as fs } from 'fs'
import path from 'path'

export interface TrendingTopic {
  topic: string
  originalTitle?: string
  source?: string
  url?: string
  score?: number
  fetchedAt?: string
}

interface TopicsFile {
  topics: TrendingTopic[]
  lastUpdated?: string
}

const TOPICS_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'topics-queue.json')

export async function getTrendingTopics(limit = 5): Promise<TrendingTopic[]> {
  try {
    const raw = await fs.readFile(TOPICS_FILE_PATH, 'utf-8')
    const payload: TopicsFile = JSON.parse(raw)
    const topics = Array.isArray(payload.topics) ? payload.topics : []

    return topics
      .slice()
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, limit)
  } catch (error) {
    console.warn('Could not load topics queue:', error)
    return []
  }
}
