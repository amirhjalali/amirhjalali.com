'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import type { ProcessStatus } from '@/lib/types'
import { apiClient } from '@/lib/api-client'

interface ProcessingIndicatorProps {
  status: ProcessStatus
  jobId?: string | null
  onRetry?: (e: React.MouseEvent) => void
  onStatusChange?: (status: ProcessStatus) => void
  autoRefresh?: boolean
  compact?: boolean
}

export default function ProcessingIndicator({
  status,
  jobId,
  onRetry,
  onStatusChange,
  autoRefresh = true,
  compact = false,
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
          className: 'text-[#888888] bg-white/5 border-white/10',
          iconClassName: 'text-[#888888]',
        }
      case 'PROCESSING':
        return {
          icon: Loader2,
          label: 'Processing',
          className: 'text-[#EAEAEA] bg-white/5 border-white/20',
          iconClassName: 'text-[#EAEAEA] animate-spin',
        }
      case 'INDEXED':
        return {
          icon: CheckCircle2,
          label: 'Indexed',
          className: 'text-[#EAEAEA] bg-white/10 border-white/20',
          iconClassName: 'text-[#EAEAEA]',
        }
      case 'COMPLETED':
        return {
          icon: CheckCircle2,
          label: 'Completed',
          className: 'text-[#EAEAEA] bg-white/10 border-white/20',
          iconClassName: 'text-[#EAEAEA]',
        }
      case 'FAILED':
        return {
          icon: XCircle,
          label: 'Failed',
          className: 'text-[#888888] bg-white/5 border-white/10',
          iconClassName: 'text-[#888888]',
        }
      default:
        return {
          icon: Clock,
          label: 'Unknown',
          className: 'text-[#888888] bg-white/5 border-white/10',
          iconClassName: 'text-[#888888]',
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  // Compact mode - just show icon
  if (compact) {
    // Don't show anything for completed status in compact mode
    if (currentStatus === 'COMPLETED' || currentStatus === 'INDEXED') {
      return null
    }

    return (
      <div className="inline-flex items-center gap-1">
        <Icon className={`w-3.5 h-3.5 ${config.iconClassName}`} />
        {currentStatus === 'FAILED' && onRetry && (
          <button
            onClick={onRetry}
            className="p-0.5 hover:bg-white/10 rounded transition-colors"
            title={error || 'Retry processing'}
          >
            <RefreshCw className="w-3 h-3 text-[#888888]" />
          </button>
        )}
      </div>
    )
  }

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
            onRetry(e)
          }}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
          title={error || 'Retry processing'}
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#888888] group-hover:rotate-180 transition-transform duration-300" />
        </button>
      )}

      {error && (
        <span
          className="text-xs text-[#888888] max-w-[200px] truncate"
          title={error}
        >
          {error}
        </span>
      )}
    </div>
  )
}
