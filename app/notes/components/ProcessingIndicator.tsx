'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import type { ProcessStatus } from '@/lib/types'
import { apiClient } from '@/lib/api-client'

interface ProcessingIndicatorProps {
  status: ProcessStatus
  jobId?: string | null
  onRetry?: () => void
  onStatusChange?: (status: ProcessStatus) => void
  autoRefresh?: boolean
}

export default function ProcessingIndicator({
  status,
  jobId,
  onRetry,
  onStatusChange,
  autoRefresh = true,
}: ProcessingIndicatorProps) {
  const [currentStatus, setCurrentStatus] = useState<ProcessStatus>(status)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCurrentStatus(status)
  }, [status])

  useEffect(() => {
    if (!autoRefresh || !jobId || currentStatus === 'COMPLETED' || currentStatus === 'FAILED') {
      return
    }

    let intervalId: NodeJS.Timeout

    const pollJobStatus = async () => {
      try {
        const jobStatus = await apiClient.getJobStatus(jobId)

        // Map job status to ProcessStatus
        const statusMap: Record<string, ProcessStatus> = {
          pending: 'PENDING',
          processing: 'PROCESSING',
          completed: 'COMPLETED',
          failed: 'FAILED',
        }

        const newStatus = statusMap[jobStatus.status] || currentStatus

        setCurrentStatus(newStatus)
        setProgress(jobStatus.progress || 0)

        if (jobStatus.error) {
          setError(jobStatus.error)
        }

        if (onStatusChange && newStatus !== currentStatus) {
          onStatusChange(newStatus)
        }

        // Stop polling if completed or failed
        if (newStatus === 'COMPLETED' || newStatus === 'FAILED') {
          clearInterval(intervalId)
        }
      } catch (err) {
        console.error('Failed to poll job status:', err)
      }
    }

    // Initial poll
    pollJobStatus()

    // Poll every 2 seconds
    intervalId = setInterval(pollJobStatus, 2000)

    return () => clearInterval(intervalId)
  }, [jobId, autoRefresh, currentStatus, onStatusChange])

  const getStatusConfig = () => {
    switch (currentStatus) {
      case 'PENDING':
        return {
          icon: Clock,
          label: 'Pending',
          className: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
          iconClassName: 'text-yellow-500',
        }
      case 'PROCESSING':
        return {
          icon: Loader2,
          label: 'Processing',
          className: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
          iconClassName: 'text-blue-500 animate-spin',
        }
      case 'COMPLETED':
        return {
          icon: CheckCircle2,
          label: 'Completed',
          className: 'text-green-500 bg-green-500/10 border-green-500/20',
          iconClassName: 'text-green-500',
        }
      case 'FAILED':
        return {
          icon: XCircle,
          label: 'Failed',
          className: 'text-red-500 bg-red-500/10 border-red-500/20',
          iconClassName: 'text-red-500',
        }
      default:
        return {
          icon: Clock,
          label: 'Unknown',
          className: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
          iconClassName: 'text-gray-500',
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className="inline-flex items-center gap-2">
      <div className={`px-3 py-1 rounded-lg text-xs font-mono border ${config.className} flex items-center gap-2`}>
        <Icon className={`w-3.5 h-3.5 ${config.iconClassName}`} />
        <span>{config.label}</span>
        {currentStatus === 'PROCESSING' && progress > 0 && (
          <span className="text-xs opacity-70">({progress}%)</span>
        )}
      </div>

      {currentStatus === 'FAILED' && onRetry && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRetry()
          }}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
          title={error || 'Retry processing'}
        >
          <RefreshCw className="w-3.5 h-3.5 text-red-400 group-hover:rotate-180 transition-transform duration-300" />
        </button>
      )}

      {error && (
        <span
          className="text-xs text-red-400 max-w-[200px] truncate"
          title={error}
        >
          {error}
        </span>
      )}
    </div>
  )
}
