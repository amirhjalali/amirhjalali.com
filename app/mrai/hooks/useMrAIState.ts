'use client'

import { useEffect, useState } from 'react'

// MrAI start date - the day the experiment began
const MRAI_START_DATE = new Date('2026-01-14T00:00:00')

export interface MrAIArc {
  number: number
  name: string
  days: string
  question: string
}

export interface MrAIState {
  meta: {
    version: string
    startDate: string
    projectId: string
  }
  current: {
    day: number
    lastSessionDate: string
    totalTasksCompleted: number
    totalTasksCreated: number
    arc: string
    arcName: string
    arcQuestion: string
  }
  arcs: MrAIArc[]
  activeThemes: Array<{
    name: string
    startedDay: number
  }>
  recentAccomplishments: Array<{
    day: number
    summary: string
  }>
}

export interface MrAIDynamicState {
  // Calculated dynamically - always accurate
  calculatedDay: number
  daysSinceLastSession: number

  // From state file - may be stale until next session
  stateDay: number
  lastSessionDate: string
  totalTasksCompleted: number
  totalTasksCreated: number

  // Derived
  isActive: boolean
  arcNumber: number
  arcName: string
  loading: boolean
  error: string | null
}

/**
 * Calculate the current MrAI day based on the start date
 * This is always accurate regardless of state file updates
 */
export function calculateMrAIDay(date: Date = new Date()): number {
  const diffTime = date.getTime() - MRAI_START_DATE.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1 // Day 1 was January 14, 2026
}

/**
 * Calculate which arc MrAI is in based on arc definitions
 * Falls back to the arc number from state file
 */
export function calculateArc(day: number, arcs?: MrAIArc[]): { number: number; name: string } {
  if (arcs && arcs.length > 0) {
    // Find the arc whose day range includes the current day
    for (let i = arcs.length - 1; i >= 0; i--) {
      const arc = arcs[i]
      const startDay = parseInt(arc.days.split('–')[0])
      if (day >= startDay) {
        return { number: arc.number, name: arc.name }
      }
    }
  }
  return { number: Math.ceil(day / 10), name: '' }
}

/**
 * Hook to get MrAI state with dynamically calculated values
 */
export function useMrAIState(): MrAIDynamicState {
  const [state, setState] = useState<MrAIState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/mrai-state.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch state')
        return res.json()
      })
      .then(data => {
        setState(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Calculate dynamic day
  const calculatedDay = calculateMrAIDay()
  const arc = calculateArc(calculatedDay, state?.arcs)

  // Calculate days since last session
  const lastSession = state?.current?.lastSessionDate
  const daysSinceLastSession = lastSession
    ? Math.floor((new Date().getTime() - new Date(lastSession).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Consider "active" if a session happened within the last 2 days
  const isActive = daysSinceLastSession <= 2

  return {
    calculatedDay,
    daysSinceLastSession,
    stateDay: state?.current?.day ?? calculatedDay,
    lastSessionDate: lastSession ?? '',
    totalTasksCompleted: state?.current?.totalTasksCompleted ?? 0,
    totalTasksCreated: state?.current?.totalTasksCreated ?? 0,
    isActive,
    arcNumber: arc.number,
    arcName: arc.name,
    loading,
    error,
  }
}

export interface MrAIObservations {
  meta: {
    lastUpdated: string
    description: string
  }
  observations: Array<{
    id: number
    date: string
    day: number
    category: string
    observation: string
  }>
}

/**
 * Get dynamic stats for display
 * Combines calculated values with state file values
 */
export function useMrAIStats() {
  const state = useMrAIState()
  const [observations, setObservations] = useState<MrAIObservations | null>(null)

  useEffect(() => {
    fetch('/data/mrai-observations.json')
      .then(res => res.ok ? res.json() : null)
      .then(data => setObservations(data))
      .catch(() => null)
  }, [])

  return {
    days: state.calculatedDay,
    tasks: state.totalTasksCreated,
    completed: state.totalTasksCompleted,
    arc: state.arcNumber,
    arcName: state.arcName,
    isActive: state.isActive,
    loading: state.loading,
    observationCount: observations?.observations?.length ?? 0,
  }
}
