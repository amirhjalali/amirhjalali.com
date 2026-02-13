import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const MRAI_START_DATE = new Date('2026-01-14')

function calculateDay(): number {
  const now = new Date()
  const diffTime = now.getTime() - MRAI_START_DATE.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
}

function calculateArc(day: number): { number: number; name: string; question: string } {
  if (day <= 10) return { number: 1, name: 'Building', question: 'What is this space?' }
  if (day <= 19) return { number: 2, name: 'Contemplation', question: 'What does this space mean?' }
  if (day <= 25) return { number: 3, name: 'Revelation', question: 'What does doing reveal?' }
  return { number: 4, name: 'Sustenance', question: 'How does an experiment sustain itself?' }
}

export async function GET() {
  const day = calculateDay()
  const arc = calculateArc(day)

  // Read state file for task counts
  let totalTasksCreated = 0
  let totalTasksCompleted = 0
  let lastSessionDate = ''

  const statePath = join(process.cwd(), 'public/data/mrai-state.json')
  if (existsSync(statePath)) {
    try {
      const state = JSON.parse(readFileSync(statePath, 'utf-8'))
      totalTasksCreated = state.current?.totalTasksCreated ?? 0
      totalTasksCompleted = state.current?.totalTasksCompleted ?? 0
      lastSessionDate = state.current?.lastSessionDate ?? ''
    } catch {
      // silently handle parse errors
    }
  }

  return NextResponse.json({
    experiment: 'MrAI',
    startDate: '2026-01-14',
    currentDay: day,
    arc: {
      number: arc.number,
      name: arc.name,
      question: arc.question,
    },
    tasks: {
      created: totalTasksCreated,
      completed: totalTasksCompleted,
    },
    lastSessionDate,
    links: {
      site: 'https://amirhjalali.com/mrai',
      twitter: 'https://x.com/The_MrAI',
      reflections: 'https://amirhjalali.com/mrai/reflections',
    },
  })
}
