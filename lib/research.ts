import fs from 'fs'
import path from 'path'

// Types
export interface ResearchItem {
  title: string
  source: string
  url: string
  summary: string
  significance: 'high' | 'medium' | 'low'
  tags: string[]
}

export interface ResearchCategory {
  name: string
  slug: string
  items: ResearchItem[]
}

export interface TopStory {
  title: string
  source: string
  url: string
  summary: string
  analysis: string
}

export interface ResearchBriefing {
  date: string
  generatedAt: string
  briefingSummary: string
  topStory: TopStory
  categories: ResearchCategory[]
  metadata: {
    sourcesChecked: number
    articlesFound: number
    articlesIncluded: number
    model: string
    processingTime: number
  }
}

const DATA_DIR = path.join(process.cwd(), 'public', 'data', 'ai-research')

/**
 * Get a research briefing for a specific date.
 * Returns null if the file doesn't exist or is invalid.
 */
export async function getResearchBriefing(date: string): Promise<ResearchBriefing | null> {
  try {
    const filePath = path.join(DATA_DIR, `${date}.json`)
    if (!fs.existsSync(filePath)) {
      return null
    }
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as ResearchBriefing
  } catch (error) {
    console.error(`Error reading research briefing for ${date}:`, error)
    return null
  }
}

/**
 * Get the most recent research briefing available.
 * Returns null if no briefings exist.
 */
export async function getLatestResearchBriefing(): Promise<ResearchBriefing | null> {
  try {
    const dates = await getAvailableDates()
    if (dates.length === 0) {
      return null
    }
    return getResearchBriefing(dates[0])
  } catch (error) {
    console.error('Error getting latest research briefing:', error)
    return null
  }
}

/**
 * List all available briefing dates, sorted newest first.
 * Returns an empty array if the directory doesn't exist or contains no valid files.
 */
export async function getAvailableDates(): Promise<string[]> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      return []
    }
    const files = fs.readdirSync(DATA_DIR)
    const dates = files
      .filter((f) => f.endsWith('.json') && /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .map((f) => f.replace('.json', ''))
      .sort((a, b) => b.localeCompare(a)) // newest first
    return dates
  } catch (error) {
    console.error('Error listing available research dates:', error)
    return []
  }
}
