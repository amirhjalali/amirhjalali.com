'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, Sparkles, Layers, ArrowRight } from 'lucide-react'
import { getRelatedContent, RelatedItem, getTypeLabel } from '@/lib/mrai-related'

const TYPE_ICONS = {
  reflection: BookOpen,
  experiment: Sparkles,
  page: Layers,
}

interface RelatedContentProps {
  currentId: string
  currentType: 'reflection' | 'experiment' | 'page'
  count?: number
  title?: string
  className?: string
}

export default function RelatedContent({
  currentId,
  currentType,
  count = 3,
  title = 'You might also explore',
  className = '',
}: RelatedContentProps) {
  const related = getRelatedContent(currentId, currentType, count)

  if (related.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`mt-16 pt-8 border-t border-white/10 ${className}`}
    >
      <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#888888] mb-6">
        {title}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {related.map((item, index) => (
          <RelatedItemCard key={`${item.type}-${item.id}`} item={item} index={index} />
        ))}
      </div>
    </motion.div>
  )
}

function RelatedItemCard({ item, index }: { item: RelatedItem; index: number }) {
  const Icon = TYPE_ICONS[item.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.1 }}
    >
      <Link href={item.url}>
        <div className="group glass p-5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all h-full flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-[#888888]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                {getTypeLabel(item.type)}
              </span>
            </div>
            <ArrowRight className="w-3 h-3 text-[#666666] group-hover:text-[#888888] transition-colors" />
          </div>

          <h4 className="font-serif font-light text-lg mb-2 group-hover:text-[#EAEAEA] transition-colors">
            {item.title}
          </h4>

          {item.excerpt && (
            <p className="text-sm text-[#888888] line-clamp-2 flex-1">
              {item.excerpt}
            </p>
          )}

          <div className="mt-3 pt-3 border-t border-white/5">
            <span className="text-xs text-[#666666] italic">
              {item.reason}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/**
 * Compact version for sidebars or smaller spaces
 */
export function RelatedContentCompact({
  currentId,
  currentType,
  count = 3,
  title = 'Related',
}: RelatedContentProps) {
  const related = getRelatedContent(currentId, currentType, count)

  if (related.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
        {title}
      </h4>
      <ul className="space-y-2">
        {related.map(item => {
          const Icon = TYPE_ICONS[item.type]
          return (
            <li key={`${item.type}-${item.id}`}>
              <Link
                href={item.url}
                className="flex items-center gap-2 text-sm text-[#888888] hover:text-[#EAEAEA] transition-colors"
              >
                <Icon className="w-3 h-3" />
                <span>{item.title}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
