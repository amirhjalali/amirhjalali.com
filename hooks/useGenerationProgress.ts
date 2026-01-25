'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ProgressEvent, GenerationStep } from '@/lib/types'

interface GenerationResult {
  success: boolean
  draft?: any
  article?: any
  topic?: string
  wordCount?: number
  message?: string
  imageUrl?: string
  error?: string
}

interface UseGenerationProgressReturn {
  isGenerating: boolean
  progress: number
  currentStep: GenerationStep | null
  message: string
  estimatedTimeRemaining?: number
  error: string | null
  result: GenerationResult | null
  startGeneration: (endpoint: string, options: any) => Promise<void>
  cancelGeneration: () => void
}

/**
 * React hook for consuming SSE progress events from article generation
 *
 * @example
 * ```tsx
 * const { isGenerating, progress, currentStep, message, startGeneration } = useGenerationProgress()
 *
 * const handleGenerate = async () => {
 *   await startGeneration('/api/generate-article?stream=true', {
 *     topic: 'AI and the future',
 *     textModel: 'gemini-2.0-flash'
 *   })
 * }
 * ```
 */
export function useGenerationProgress(): UseGenerationProgressReturn {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<GenerationStep | null>(null)
  const [message, setMessage] = useState('')
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number>()
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GenerationResult | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // Cancel generation
  const cancelGeneration = useCallback(() => {
    cleanup()
    setIsGenerating(false)
    setError('Generation cancelled by user')
  }, [cleanup])

  // Start generation with progress tracking
  const startGeneration = useCallback(async (endpoint: string, options: any) => {
    // Reset state
    setIsGenerating(true)
    setProgress(0)
    setCurrentStep(null)
    setMessage('')
    setError(null)
    setResult(null)
    setEstimatedTimeRemaining(undefined)

    cleanup()

    try {
      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController()

      // Make POST request to start generation
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Check if response is SSE stream
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('text/event-stream')) {
        // Fallback for non-streaming response
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        setResult(data)
        setProgress(100)
        setCurrentStep('completed')
        setMessage('Article generated successfully!')
        setIsGenerating(false)
        return
      }

      // Parse SSE stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Failed to get response reader')
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)

            // Check for completion signal
            if (data === '[DONE]') {
              setIsGenerating(false)
              continue
            }

            try {
              const event = JSON.parse(data)

              // Handle result data
              if (event.step === 'result') {
                setResult(event)
                continue
              }

              // Handle progress event
              const progressEvent = event as ProgressEvent

              if (progressEvent.error) {
                setError(progressEvent.error)
                setIsGenerating(false)
                break
              }

              setProgress(progressEvent.progress)
              setCurrentStep(progressEvent.step)
              setMessage(progressEvent.message)

              if (progressEvent.estimatedTimeRemaining !== undefined) {
                setEstimatedTimeRemaining(progressEvent.estimatedTimeRemaining)
              }

              if (progressEvent.step === 'completed') {
                // Capture result data from completed event (for image regeneration etc.)
                // The API may include draft/article/imageUrl in the completed event
                if (event.draft || event.article || event.imageUrl || event.success) {
                  setResult(event)
                }
                setIsGenerating(false)
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError, data)
            }
          }
        }
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled
        setError('Generation cancelled')
      } else {
        setError(err.message || 'Failed to generate article')
      }
      setIsGenerating(false)
    } finally {
      cleanup()
    }
  }, [cleanup])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return {
    isGenerating,
    progress,
    currentStep,
    message,
    estimatedTimeRemaining,
    error,
    result,
    startGeneration,
    cancelGeneration,
  }
}
