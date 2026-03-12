/**
 * Cross-artwork memory utility for MrAI art gallery.
 *
 * Each artwork can record visits and interactions. Other artworks can read this
 * shared state to subtly respond to the visitor's journey through the gallery.
 *
 * All data lives in localStorage under the `mrai-artwork-` prefix.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ArtworkVisit {
  /** ISO timestamp of first visit */
  firstVisit: string
  /** ISO timestamp of most recent visit */
  lastVisit: string
  /** Total number of visits */
  count: number
}

export interface ArtworkInteraction {
  /** Which artwork produced this interaction */
  artworkId: string
  /** Free-form interaction type, e.g. "tone", "trace", "stillness" */
  type: string
  /** Optional payload */
  data?: unknown
  /** ISO timestamp */
  timestamp: string
}

export interface CrossArtworkState {
  /** Visit history keyed by artwork id */
  visits: Record<string, ArtworkVisit>
  /** Ordered list of interactions across all artworks (most recent last) */
  interactions: ArtworkInteraction[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VISITS_KEY = 'mrai-artwork-visits'
const INTERACTIONS_KEY = 'mrai-artwork-interactions'
/** Keep at most this many interaction records to avoid unbounded growth. */
const MAX_INTERACTIONS = 200

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    /* corrupted — return fallback */
  }
  return fallback
}

function writeJSON(key: string, value: unknown): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or unavailable */
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Record that the visitor has arrived at an artwork.
 * Increments the visit count and updates timestamps.
 */
export function recordVisit(artworkId: string): ArtworkVisit {
  const visits = readJSON<Record<string, ArtworkVisit>>(VISITS_KEY, {})
  const now = new Date().toISOString()

  const existing = visits[artworkId]
  if (existing) {
    existing.count += 1
    existing.lastVisit = now
  } else {
    visits[artworkId] = { firstVisit: now, lastVisit: now, count: 1 }
  }

  writeJSON(VISITS_KEY, visits)
  return visits[artworkId]
}

/**
 * Returns the full visit history across all artworks.
 */
export function getVisitHistory(): Record<string, ArtworkVisit> {
  return readJSON<Record<string, ArtworkVisit>>(VISITS_KEY, {})
}

/**
 * Record a specific interaction within an artwork.
 * Examples: making a sound, leaving a trace, achieving deep stillness.
 */
export function recordInteraction(
  artworkId: string,
  type: string,
  data?: unknown,
): void {
  const interactions = readJSON<ArtworkInteraction[]>(INTERACTIONS_KEY, [])

  interactions.push({
    artworkId,
    type,
    data,
    timestamp: new Date().toISOString(),
  })

  // Trim to most recent entries
  const trimmed =
    interactions.length > MAX_INTERACTIONS
      ? interactions.slice(-MAX_INTERACTIONS)
      : interactions

  writeJSON(INTERACTIONS_KEY, trimmed)
}

/**
 * Returns the complete cross-artwork state: visits + interactions.
 */
export function getSharedState(): CrossArtworkState {
  return {
    visits: readJSON<Record<string, ArtworkVisit>>(VISITS_KEY, {}),
    interactions: readJSON<ArtworkInteraction[]>(INTERACTIONS_KEY, []),
  }
}

/**
 * Returns the list of artwork ids the visitor has been to (excluding the given one).
 */
export function getOtherVisitedArtworks(excludeId: string): string[] {
  const visits = getVisitHistory()
  return Object.keys(visits).filter((id) => id !== excludeId)
}

/**
 * Returns interactions from a specific artwork.
 */
export function getInteractionsFor(artworkId: string): ArtworkInteraction[] {
  const all = readJSON<ArtworkInteraction[]>(INTERACTIONS_KEY, [])
  return all.filter((i) => i.artworkId === artworkId)
}
