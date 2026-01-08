'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Clock,
  CheckCircle,
  BarChart3,
  Loader2,
  Trash2,
  Eye,
  Trophy,
} from 'lucide-react'
import { apiClient, Draft } from '@/lib/api-client'
import { EVAL_TEXT_MODELS } from '@/lib/eval-models'
import EvalGeneratorModal from './EvalGeneratorModal'
import EvalComparisonView from './EvalComparisonView'

interface EvalComparison {
  id: string
  topic: string
  modelA: string
  modelB: string
  winner?: string
  winnerReason?: string
  status: string
  createdAt: string
  evaluatedAt?: string
  draftA?: Draft
  draftB?: Draft
}

interface ModelStat {
  model: string
  modelName: string
  wins: number
  losses: number
  ties: number
  total: number
  winRate: number
}

interface Analytics {
  summary: {
    totalEvaluated: number
    pendingEvaluations: number
    uniqueModels: number
  }
  modelStats: ModelStat[]
  headToHead: any[]
  recentEvaluations: any[]
}

export default function EvalDashboard() {
  const [showGeneratorModal, setShowGeneratorModal] = useState(false)
  const [selectedComparison, setSelectedComparison] = useState<EvalComparison | null>(null)
  const [comparisons, setComparisons] = useState<EvalComparison[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'evaluated' | 'analytics'>('pending')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [pairsData, analyticsData] = await Promise.all([
        apiClient.getEvalPairs(),
        apiClient.getEvalAnalytics(),
      ])
      setComparisons(pairsData.comparisons)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error loading eval data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleGenerated = (_comparison: any, _draftA: Draft, _draftB: Draft) => {
    loadData()
    setShowGeneratorModal(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this evaluation? The drafts will be kept.')) return

    setDeletingId(id)
    try {
      await apiClient.deleteEvalPair(id)
      await loadData()
    } catch (error) {
      console.error('Error deleting eval:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const getModelName = (modelId: string) => {
    return EVAL_TEXT_MODELS[modelId]?.name || modelId
  }

  const pendingComparisons = comparisons.filter((c) => c.status === 'pending')
  const evaluatedComparisons = comparisons.filter((c) => c.status === 'evaluated')

  const renderComparisonCard = (comparison: EvalComparison) => (
    <motion.div
      key={comparison.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-white/10 rounded-xl hover:border-white/20 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-light mb-1 truncate">
            {comparison.topic}
          </h3>
          <div className="flex items-center gap-2 text-xs font-mono text-[#888888]">
            <span>{getModelName(comparison.modelA)}</span>
            <span>vs</span>
            <span>{getModelName(comparison.modelB)}</span>
          </div>
          {comparison.winner && (
            <div className="mt-2 flex items-center gap-1 text-xs font-mono text-[#EAEAEA]">
              <Trophy className="w-3 h-3" />
              Winner: {getModelName(
                comparison.winner === 'A' ? comparison.modelA : comparison.modelB
              )}
              {comparison.winner === 'tie' && 'Tie'}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedComparison(comparison)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="View comparison"
          >
            <Eye className="w-4 h-4 text-[#888888]" />
          </button>
          <button
            onClick={() => handleDelete(comparison.id)}
            disabled={deletingId === comparison.id}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Delete"
          >
            {deletingId === comparison.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#888888]" />
            ) : (
              <Trash2 className="w-4 h-4 text-[#888888]" />
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 text-[10px] font-mono uppercase tracking-widest text-[#666666]">
        {new Date(comparison.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  )

  const renderAnalytics = () => {
    if (!analytics) return null

    return (
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-white/10 rounded-xl">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#888888] mb-2">
              Total Evaluated
            </h4>
            <p className="text-3xl font-serif font-light">{analytics.summary.totalEvaluated}</p>
          </div>
          <div className="p-4 border border-white/10 rounded-xl">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#888888] mb-2">
              Pending
            </h4>
            <p className="text-3xl font-serif font-light">{analytics.summary.pendingEvaluations}</p>
          </div>
          <div className="p-4 border border-white/10 rounded-xl">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#888888] mb-2">
              Models Tested
            </h4>
            <p className="text-3xl font-serif font-light">{analytics.summary.uniqueModels}</p>
          </div>
        </div>

        {/* Model Leaderboard */}
        {analytics.modelStats.length > 0 && (
          <div className="p-6 border border-white/10 rounded-xl">
            <h3 className="font-serif text-xl font-light mb-4">Model Leaderboard</h3>
            <div className="space-y-3">
              {analytics.modelStats.map((stat, index) => (
                <div
                  key={stat.model}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-full font-mono text-xs">
                      {index + 1}
                    </span>
                    <span className="font-mono text-sm">{stat.modelName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-mono text-[#888888]">
                      {stat.wins}W / {stat.losses}L / {stat.ties}T
                    </div>
                    <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white"
                        style={{ width: `${stat.winRate}%` }}
                      />
                    </div>
                    <span className="font-mono text-sm w-12 text-right">
                      {stat.winRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Head to Head */}
        {analytics.headToHead.length > 0 && (
          <div className="p-6 border border-white/10 rounded-xl">
            <h3 className="font-serif text-xl font-light mb-4">Head-to-Head Records</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-mono uppercase tracking-widest text-[#888888]">
                    <th className="text-left p-2">Matchup</th>
                    <th className="text-center p-2">A Wins</th>
                    <th className="text-center p-2">B Wins</th>
                    <th className="text-center p-2">Ties</th>
                    <th className="text-center p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.headToHead.map((h2h, index) => (
                    <tr key={index} className="border-t border-white/5">
                      <td className="p-2">
                        <span className="font-mono text-xs">
                          {getModelName(h2h.modelA)} vs {getModelName(h2h.modelB)}
                        </span>
                      </td>
                      <td className="text-center p-2 font-mono">{h2h.modelAWins}</td>
                      <td className="text-center p-2 font-mono">{h2h.modelBWins}</td>
                      <td className="text-center p-2 font-mono">{h2h.ties}</td>
                      <td className="text-center p-2 font-mono">{h2h.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-light">Evals</h2>
          <p className="text-xs font-mono uppercase tracking-widest text-[#888888] mt-1">
            A/B Testing AI Models
          </p>
        </div>
        <button
          onClick={() => setShowGeneratorModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-[#EAEAEA] transition-colors font-mono text-xs uppercase tracking-widest font-medium"
        >
          <Plus className="w-4 h-4" />
          New Eval
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-xs uppercase tracking-widest transition-all ${
            activeTab === 'pending' ? 'bg-white text-black' : 'text-[#888888] hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending ({pendingComparisons.length})
        </button>
        <button
          onClick={() => setActiveTab('evaluated')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-xs uppercase tracking-widest transition-all ${
            activeTab === 'evaluated' ? 'bg-white text-black' : 'text-[#888888] hover:text-white'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Evaluated ({evaluatedComparisons.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-xs uppercase tracking-widest transition-all ${
            activeTab === 'analytics' ? 'bg-white text-black' : 'text-[#888888] hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#888888]" />
        </div>
      ) : (
        <>
          {activeTab === 'pending' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingComparisons.length === 0 ? (
                <div className="col-span-2 p-12 border border-white/10 rounded-xl text-center">
                  <p className="font-mono text-xs uppercase tracking-widest text-[#888888]">
                    No pending evaluations
                  </p>
                  <button
                    onClick={() => setShowGeneratorModal(true)}
                    className="mt-4 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors font-mono text-xs uppercase tracking-widest"
                  >
                    Generate your first eval
                  </button>
                </div>
              ) : (
                pendingComparisons.map(renderComparisonCard)
              )}
            </div>
          )}

          {activeTab === 'evaluated' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluatedComparisons.length === 0 ? (
                <div className="col-span-2 p-12 border border-white/10 rounded-xl text-center">
                  <p className="font-mono text-xs uppercase tracking-widest text-[#888888]">
                    No completed evaluations yet
                  </p>
                </div>
              ) : (
                evaluatedComparisons.map(renderComparisonCard)
              )}
            </div>
          )}

          {activeTab === 'analytics' && renderAnalytics()}
        </>
      )}

      {/* Modals */}
      <EvalGeneratorModal
        isOpen={showGeneratorModal}
        onClose={() => setShowGeneratorModal(false)}
        onGenerated={handleGenerated}
      />

      <AnimatePresence>
        {selectedComparison && (
          <EvalComparisonView
            comparison={selectedComparison}
            draftA={selectedComparison.draftA || null}
            draftB={selectedComparison.draftB || null}
            onClose={() => setSelectedComparison(null)}
            onEvaluated={() => {
              setSelectedComparison(null)
              loadData()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
