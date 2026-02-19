'use client'

import { useEffect, useState } from 'react'

interface DayEntry {
  day: number
  date: string
  arc: number
  tasks: number
  reflection: string | null
  summary: string
}

interface DayHistoryData {
  meta: {
    totalDays: number
    lastUpdated: string
  }
  days: DayEntry[]
}

interface LatestReflection {
  slug: string
  title: string
  day: number
  date: string
  summary: string
}

interface DerivedStats {
  reflections: number
  letters: number
  totalTasks: number
  arcs: number
}

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((w, i) =>
      i === 0
        ? w.charAt(0).toUpperCase() + w.slice(1)
        : ['the', 'a', 'an', 'and', 'of', 'in', 'vs', 'into', 'beyond'].includes(w)
          ? w
          : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(' ')
}

export function useDayHistory() {
  const [data, setData] = useState<DayHistoryData | null>(null)

  useEffect(() => {
    fetch('/data/mrai-day-history.json')
      .then(res => res.json())
      .then(setData)
      .catch(() => null)
  }, [])

  return data
}

export function useDerivedStats() {
  const history = useDayHistory()
  const [letterCount, setLetterCount] = useState(3)

  // Letters are in a separate directory — count is relatively stable
  // but we can update this if needed
  useEffect(() => {
    fetch('/api/mrai/stats')
      .then(res => res.json())
      .catch(() => null)
  }, [])

  if (!history) {
    return {
      latestReflection: null,
      stats: { reflections: 0, letters: letterCount, totalTasks: 0, arcs: 0 } as DerivedStats,
      recentDays: [] as DayEntry[],
    }
  }

  const days = history.days

  // Count reflections from day history
  const reflectionCount = days.filter(d => d.reflection !== null).length

  // Total tasks from day history
  const totalTasks = days.reduce((sum, d) => sum + d.tasks, 0)

  // Number of distinct arcs
  const arcs = new Set(days.map(d => d.arc)).size

  // Find latest reflection (last day with a non-null reflection)
  const daysWithReflections = days.filter(d => d.reflection !== null)
  const latestDay = daysWithReflections[daysWithReflections.length - 1]
  const latestReflection: LatestReflection | null = latestDay
    ? {
        slug: latestDay.reflection!,
        title: slugToTitle(latestDay.reflection!),
        day: latestDay.day,
        date: latestDay.date,
        summary: latestDay.summary,
      }
    : null

  // Recent days (last 8, reversed for display)
  const recentDays = days.slice(-8).reverse()

  return {
    latestReflection,
    stats: { reflections: reflectionCount, letters: letterCount, totalTasks, arcs },
    recentDays,
  }
}
