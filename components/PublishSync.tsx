'use client'

import { useState } from 'react'
import { Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export default function PublishSync() {
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const syncToRepository = async () => {
    setSyncing(true)
    setMessage(null)

    try {
      // Get published articles from localStorage
      const publishedData = localStorage.getItem('published-articles')
      const draftsData = localStorage.getItem('draft-articles')

      if (!publishedData && !draftsData) {
        setMessage({ type: 'error', text: 'No articles found in localStorage to sync' })
        setSyncing(false)
        return
      }

      // Download as JSON files for manual commit
      const downloadFile = (data: string, filename: string) => {
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      if (publishedData) {
        const formatted = JSON.stringify(JSON.parse(publishedData), null, 2)
        downloadFile(formatted, 'published.json')
      }

      if (draftsData) {
        const formatted = JSON.stringify(JSON.parse(draftsData), null, 2)
        downloadFile(formatted, 'drafts.json')
      }

      setMessage({
        type: 'success',
        text: 'Files downloaded! Now commit them:\n1. Replace files in public/data/\n2. git add public/data/*.json\n3. git commit -m "sync: publish articles"\n4. git push'
      })
    } catch (error) {
      setMessage({ type: 'error', text: `Sync failed: ${error}` })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="mb-6 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-500 mb-2">
            ⚠️ Static Site Limitation
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Publishing here only saves to your browser's localStorage. For articles to appear on the live site,
            you must sync them to the repository and deploy.
          </p>
          <button
            onClick={syncToRepository}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Export & Sync to Repository
              </>
            )}
          </button>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg flex items-start gap-3 ${
                message.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-red-500/10 border border-red-500/30'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <pre className="text-xs whitespace-pre-wrap font-mono">{message.text}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
