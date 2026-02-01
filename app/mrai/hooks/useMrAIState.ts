'use client'

import { useEffect, useState } from 'react'

// MrAI start date - the day the experiment began
const MRAI_START_DATE = new Date('2026-01-14T00:00:00')

export interface MrAIState {
  meta: {
    version: string
    startDate: string
    projectId: string
  }
  currentDay: number
  lastSessionDate: string
  totalTasksCompleted: number
  totalTasksCreated: number
  currentThought: string
  activeThemes: Array<{
    name: string
    description: string
    status: string
    startedDay: number
  }>
  recentAccomplishments: Array<{
    day: number
    date: string
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
  currentThought: string

  // Derived
  isActive: boolean
  arcNumber: number
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
 * Calculate which arc MrAI is in
 * Arc 1: Days 1-10
 * Arc 2: Days 11-20
 * etc.
 */
export function calculateArc(day: number): number {
  return Math.ceil(day / 10)
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
  const arcNumber = calculateArc(calculatedDay)

  // Calculate days since last session
  const daysSinceLastSession = state?.lastSessionDate
    ? Math.floor((new Date().getTime() - new Date(state.lastSessionDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Consider "active" if a session happened within the last 2 days
  const isActive = daysSinceLastSession <= 2

  return {
    calculatedDay,
    daysSinceLastSession,
    stateDay: state?.currentDay ?? calculatedDay,
    lastSessionDate: state?.lastSessionDate ?? '',
    totalTasksCompleted: state?.totalTasksCompleted ?? 0,
    totalTasksCreated: state?.totalTasksCreated ?? 0,
    currentThought: state?.currentThought ?? '',
    isActive,
    arcNumber,
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
    isActive: state.isActive,
    loading: state.loading,
    observationCount: observations?.observations?.length ?? 0,
  }
}
