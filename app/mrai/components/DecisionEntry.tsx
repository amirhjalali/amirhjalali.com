'use client'

import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Target, GitBranch, Lightbulb } from 'lucide-react'
import { useState } from 'react'

interface DecisionEntryProps {
  day: number
  date: string
  theme: string
  rationale: string
  alternativesConsidered: string[]
  whyThisDirection: string
  taskBreakdown: {
    write: number
    build: number
    explore: number
    maintain: number
  }
  isCurrentDay?: boolean
}

export default function DecisionEntry({
  day,
  date,
  theme,
  rationale,
  alternativesConsidered,
  whyThisDirection,
  taskBreakdown,
  isCurrentDay = false
}: DecisionEntryProps) {
  const [isExpanded, setIsExpanded] = useState(isCurrentDay)

  const totalTasks = taskBreakdown.write + taskBreakdown.build + taskBreakdown.explore + taskBreakdown.maintain

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-xl overflow-hidden transition-all ${
        isCurrentDay
          ? 'border-white/30 bg-white/5'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-5 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4">
          {/* Day number circle */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-mono ${
            isCurrentDay
              ? 'bg-white text-black'
              : 'bg-white/10 text-[#EAEAEA]'
          }`}>
            {day}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-serif text-[#EAEAEA]">{theme}</h3>
              {isCurrentDay && (
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-white/20 text-[#EAEAEA] rounded">
                  Today
                </span>
              )}
            </div>
            <p className="text-sm text-[#888888] font-mono">{date}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Task breakdown mini-viz */}
          <div className="hidden sm:flex items-center gap-1">
            {taskBreakdown.write > 0 && (
              <span className="px-2 py-1 text-[10px] font-mono bg-white/5 border border-white/10 rounded" title="Write tasks">
                W:{taskBreakdown.write}
              </span>
            )}
            {taskBreakdown.build > 0 && (
              <span className="px-2 py-1 text-[10px] font-mono bg-white/5 border border-white/10 rounded" title="Build tasks">
                B:{taskBreakdown.build}
              </span>
            )}
            {taskBreakdown.explore > 0 && (
              <span className="px-2 py-1 text-[10px] font-mono bg-white/5 border border-white/10 rounded" title="Explore tasks">
                E:{taskBreakdown.explore}
              </span>
            )}
            {taskBreakdown.maintain > 0 && (
              <span className="px-2 py-1 text-[10px] font-mono bg-white/5 border border-white/10 rounded" title="Maintain tasks">
                M:{taskBreakdown.maintain}
              </span>
            )}
          </div>

          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[#888888]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#888888]" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-6 pb-6 border-t border-white/10"
        >
          {/* Rationale */}
          <div className="pt-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-[#888888]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
                Why This Direction
              </span>
            </div>
            <p className="text-[#EAEAEA]/80 leading-relaxed">
              {rationale}
            </p>
          </div>

          {/* Alternatives Considered */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="w-4 h-4 text-[#888888]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
                Alternatives Not Chosen
              </span>
            </div>
            <ul className="space-y-2">
              {alternativesConsidered.map((alt, index) => (
                <li key={index} className="flex items-start gap-2 text-[#888888]">
                  <span className="text-white/30 mt-1">&ndash;</span>
                  <span>{alt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Why This */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-[#888888]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
                The Deciding Factor
              </span>
            </div>
            <p className="text-[#EAEAEA]/70 leading-relaxed italic">
              &ldquo;{whyThisDirection}&rdquo;
            </p>
          </div>

          {/* Task Breakdown */}
          <div className="pt-4 border-t border-white/10">
            <span className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-3 block">
              Task Distribution ({totalTasks} total)
            </span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden flex">
                {taskBreakdown.write > 0 && (
                  <div
                    className="h-full bg-white/40"
                    style={{ width: `${(taskBreakdown.write / totalTasks) * 100}%` }}
                    title={`Write: ${taskBreakdown.write}`}
                  />
                )}
                {taskBreakdown.build > 0 && (
                  <div
                    className="h-full bg-white/60"
                    style={{ width: `${(taskBreakdown.build / totalTasks) * 100}%` }}
                    title={`Build: ${taskBreakdown.build}`}
                  />
                )}
                {taskBreakdown.explore > 0 && (
                  <div
                    className="h-full bg-white/30"
                    style={{ width: `${(taskBreakdown.explore / totalTasks) * 100}%` }}
                    title={`Explore: ${taskBreakdown.explore}`}
                  />
                )}
                {taskBreakdown.maintain > 0 && (
                  <div
                    className="h-full bg-white/20"
                    style={{ width: `${(taskBreakdown.maintain / totalTasks) * 100}%` }}
                    title={`Maintain: ${taskBreakdown.maintain}`}
                  />
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-xs font-mono text-[#888888]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-white/40 rounded-full" /> Write: {taskBreakdown.write}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-white/60 rounded-full" /> Build: {taskBreakdown.build}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-white/30 rounded-full" /> Explore: {taskBreakdown.explore}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-white/20 rounded-full" /> Maintain: {taskBreakdown.maintain}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
