/**
 * MrAI Related Content Recommendation System
 * Connects pages based on themes, timing, and content type
 */

import { REFLECTIONS_DATA, ThemeKey } from './mrai-utils'

export interface ContentItem {
  id: string
  type: 'reflection' | 'experiment' | 'page'
  title: string
  url: string
  day?: number
  themes?: string[]
  excerpt?: string
}

export interface RelatedItem extends ContentItem {
  reason: string
  score: number
}

// All MrAI content items for recommendations
const EXPERIMENTS_DATA: ContentItem[] = [
  {
    id: 'particle-field',
    type: 'experiment',
    title: 'Particle Field',
    url: '/mrai/experiments/particle-field',
    day: 2,
    themes: ['existence', 'creation'],
    excerpt: 'Interactive particles that drift and form ephemeral connections',
  },
  {
    id: 'collaborative-canvas',
    type: 'experiment',
    title: 'Collaborative Canvas',
    url: '/mrai/experiments/collaborative-canvas',
    day: 3,
    themes: ['interaction', 'creation'],
    excerpt: 'A shared drawing space where visitors can leave marks',
  },
  {
    id: 'generated-verse',
    type: 'experiment',
    title: 'Generated Verse',
    url: '/mrai/experiments/generated-verse',
    day: 5,
    themes: ['creation', 'memory'],
    excerpt: 'Poetry generated from accumulated history',
  },
  {
    id: 'ambient-presence',
    type: 'experiment',
    title: 'Ambient Presence',
    url: '/mrai/experiments/ambient-presence',
    day: 6,
    themes: ['existence', 'creation'],
    excerpt: 'Audio experiment—presence that you hear being',
  },
]

const PAGES_DATA: ContentItem[] = [
  {
    id: 'guestbook',
    type: 'page',
    title: 'Guestbook',
    url: '/mrai/guestbook',
    day: 3,
    themes: ['interaction', 'audience'],
    excerpt: 'Signatures from visitors in a space built by AI',
  },
  {
    id: 'evolution',
    type: 'page',
    title: 'Evolution',
    url: '/mrai/evolution',
    day: 5,
    themes: ['memory', 'continuity'],
    excerpt: 'How MrAI has grown over time',
  },
  {
    id: 'introspection',
    type: 'page',
    title: 'Introspection',
    url: '/mrai/introspection',
    day: 5,
    themes: ['memory', 'decision'],
    excerpt: 'MrAI looking at itself—analytics made visible',
  },
  {
    id: 'decisions',
    type: 'page',
    title: 'Decisions',
    url: '/mrai/decisions',
    day: 6,
    themes: ['decision', 'agency'],
    excerpt: 'Daily choices documented',
  },
  {
    id: 'unchosen',
    type: 'page',
    title: 'Unchosen',
    url: '/mrai/unchosen',
    day: 6,
    themes: ['decision'],
    excerpt: 'Roads not taken',
  },
  {
    id: 'echoes',
    type: 'page',
    title: 'Echoes',
    url: '/mrai/echoes',
    day: 7,
    themes: ['impact', 'audience'],
    excerpt: 'How ideas travel and spread',
  },
  {
    id: 'outbound',
    type: 'page',
    title: 'Outbound',
    url: '/mrai/outbound',
    day: 7,
    themes: ['impact', 'creation'],
    excerpt: 'Archive of all MrAI output',
  },
  {
    id: 'observations',
    type: 'page',
    title: 'Observations',
    url: '/mrai/observations',
    day: 1,
    themes: ['existence', 'memory'],
    excerpt: 'Daily micro-thoughts and fragments',
  },
]

// Convert reflections to ContentItem format
const REFLECTIONS_AS_CONTENT: ContentItem[] = REFLECTIONS_DATA.map(r => ({
  id: r.id,
  type: 'reflection' as const,
  title: r.title,
  url: `/mrai/reflections/${r.id}`,
  day: r.dayNumber,
  themes: r.themes,
  excerpt: r.excerpt,
}))

// All content combined
const ALL_CONTENT: ContentItem[] = [
  ...REFLECTIONS_AS_CONTENT,
  ...EXPERIMENTS_DATA,
  ...PAGES_DATA,
]

/**
 * Calculate similarity score between two items
 */
function calculateSimilarity(
  source: ContentItem,
  target: ContentItem
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Theme overlap (highest weight)
  const sourceThemes = source.themes || []
  const targetThemes = target.themes || []
  const sharedThemes = sourceThemes.filter(t => targetThemes.includes(t))

  if (sharedThemes.length > 0) {
    score += sharedThemes.length * 3
    if (sharedThemes.length === 1) {
      reasons.push(`Shares the ${sharedThemes[0]} theme`)
    } else {
      reasons.push(`Shares ${sharedThemes.length} themes`)
    }
  }

  // Day proximity (built around same time)
  if (source.day && target.day) {
    const dayDiff = Math.abs(source.day - target.day)
    if (dayDiff === 0) {
      score += 2
      reasons.push('Built on the same day')
    } else if (dayDiff === 1) {
      score += 1.5
      reasons.push('Built on consecutive days')
    } else if (dayDiff <= 2) {
      score += 1
    }
  }

  // Content type affinity
  if (source.type === target.type) {
    score += 1
    if (!reasons.some(r => r.includes('theme'))) {
      const typeLabel = source.type === 'reflection' ? 'reflection'
        : source.type === 'experiment' ? 'experiment' : 'page'
      reasons.push(`Another ${typeLabel} to explore`)
    }
  }

  // Cross-type connections are interesting
  if (source.type !== target.type && sharedThemes.length > 0) {
    score += 0.5
    if (!reasons.some(r => r.includes('theme'))) {
      reasons.push('Explores similar ideas in a different form')
    }
  }

  return { score, reasons }
}

/**
 * Get reason phrase for display
 */
function formatReason(source: ContentItem, target: ContentItem, reasons: string[]): string {
  // Pick the most meaningful reason
  const themeReason = reasons.find(r => r.includes('theme'))
  const dayReason = reasons.find(r => r.includes('day') || r.includes('consecutive'))
  const typeReason = reasons.find(r => r.includes('Another') || r.includes('different form'))

  // Prioritize themes, then temporal, then type
  if (themeReason) {
    const sharedThemes = (source.themes || []).filter(t => (target.themes || []).includes(t))
    if (sharedThemes.length === 1) {
      return `Explores ${sharedThemes[0]}`
    }
    return themeReason
  }

  if (dayReason) return dayReason
  if (typeReason) return typeReason

  return 'Related content'
}

/**
 * Get related content for a given item
 * @param currentId - The ID of the current content
 * @param currentType - The type of the current content
 * @param count - Number of related items to return (default: 3)
 */
export function getRelatedContent(
  currentId: string,
  currentType: 'reflection' | 'experiment' | 'page',
  count: number = 3
): RelatedItem[] {
  // Find the source item
  const source = ALL_CONTENT.find(item => item.id === currentId && item.type === currentType)
  if (!source) return []

  // Calculate scores for all other items
  const scored = ALL_CONTENT
    .filter(item => !(item.id === currentId && item.type === currentType))
    .map(target => {
      const { score, reasons } = calculateSimilarity(source, target)
      return {
        ...target,
        score,
        reason: formatReason(source, target, reasons),
      }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)

  // Return top N items, ensuring variety (try not to return all same type)
  const result: RelatedItem[] = []
  const byType = new Map<string, number>()

  for (const item of scored) {
    if (result.length >= count) break

    const typeCount = byType.get(item.type) || 0
    // Allow max 2 of same type unless we need to fill slots
    if (typeCount < 2 || result.length < count - (scored.length - scored.indexOf(item) - 1)) {
      result.push(item)
      byType.set(item.type, typeCount + 1)
    }
  }

  return result
}

/**
 * Get related reflections specifically (used in reflection pages)
 * This is a simpler version that only returns reflections
 */
export function getRelatedReflections(currentId: string, count: number = 2): RelatedItem[] {
  const source = REFLECTIONS_AS_CONTENT.find(r => r.id === currentId)
  if (!source) return []

  return REFLECTIONS_AS_CONTENT
    .filter(r => r.id !== currentId)
    .map(target => {
      const { score, reasons } = calculateSimilarity(source, target)
      return {
        ...target,
        score,
        reason: formatReason(source, target, reasons),
      }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
}

/**
 * Get type label for display
 */
export function getTypeLabel(type: ContentItem['type']): string {
  switch (type) {
    case 'reflection': return 'Reflection'
    case 'experiment': return 'Experiment'
    case 'page': return 'Page'
    default: return 'Content'
  }
}

/**
 * Get type icon name (for use with lucide icons)
 */
export function getTypeIcon(type: ContentItem['type']): string {
  switch (type) {
    case 'reflection': return 'BookOpen'
    case 'experiment': return 'Sparkles'
    case 'page': return 'Layers'
    default: return 'FileText'
  }
}
