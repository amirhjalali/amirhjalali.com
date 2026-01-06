'use client'

import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface ExpandableContentProps {
  children: ReactNode
  previewLines?: number
  previewHeight?: string
  showMoreText?: string
  showLessText?: string
}

export function ExpandableContent({
  children,
  previewLines = 2,
  previewHeight,
  showMoreText = 'Show more',
  showLessText = 'Show less',
}: ExpandableContentProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const collapsedHeight = previewHeight || `${previewLines * 1.5}rem`

  return (
    <div>
      <AnimatePresence initial={false}>
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? 'auto' : collapsedHeight }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 mt-4 text-label text-[#666666] hover:text-[#EAEAEA] transition-colors group"
        aria-expanded={isExpanded}
      >
        <span className="border-b border-dashed border-current pb-0.5">
          {isExpanded ? showLessText : showMoreText}
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="transition-transform"
        >
          <ChevronDown className="w-3 h-3" />
        </motion.div>
      </button>
    </div>
  )
}

// Simplified version for lists with "Show N more" functionality
interface ExpandableListProps<T> {
  items: T[]
  previewCount?: number
  renderItem: (item: T, index: number) => ReactNode
  className?: string
}

export function ExpandableList<T>({
  items,
  previewCount = 3,
  renderItem,
  className = '',
}: ExpandableListProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false)

  const visibleItems = isExpanded ? items : items.slice(0, previewCount)
  const hiddenCount = items.length - previewCount

  return (
    <div className={className}>
      <AnimatePresence mode="popLayout">
        {visibleItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, delay: index >= previewCount ? (index - previewCount) * 0.05 : 0 }}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>

      {hiddenCount > 0 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 mt-4 text-label text-[#666666] hover:text-[#EAEAEA] transition-colors group"
          aria-expanded={isExpanded}
        >
          <span className="border-b border-dashed border-current pb-0.5">
            {isExpanded ? 'Show less' : `Show ${hiddenCount} more`}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="transition-transform"
          >
            <ChevronDown className="w-3 h-3" />
          </motion.div>
        </button>
      )}
    </div>
  )
}

export default ExpandableContent
