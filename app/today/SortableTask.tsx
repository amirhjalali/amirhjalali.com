'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Check, X, Trash2 } from 'lucide-react'

type Task = {
  id: string
  text: string
  staleDays: number
}

type Props = {
  task: Task
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, text: string) => void
}

function getStalenessColor(staleDays: number): string {
  if (staleDays === 0) return 'text-[#EAEAEA]'
  if (staleDays === 1) return 'text-[#BBBBBB]'
  if (staleDays <= 3) return 'text-[#888888]'
  return 'text-[#555555]'
}

const SWIPE_THRESHOLD = -80

export default function SortableTask({ task, onComplete, onDelete, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)
  const [showDelete, setShowDelete] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const x = useMotionValue(0)
  const deleteOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0])
  const deleteScale = useTransform(x, [-100, -50, 0], [1, 0.8, 0.5])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const trimmed = editText.trim()
    if (trimmed && trimmed !== task.text) {
      onUpdate(task.id, trimmed)
    } else {
      setEditText(task.text)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditText(task.text)
      setIsEditing(false)
    }
  }

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < SWIPE_THRESHOLD) {
      onDelete(task.id)
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <motion.div
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 rounded-xl bg-white/10"
        style={{ opacity: deleteOpacity }}
      >
        <motion.div style={{ scale: deleteScale }}>
          <Trash2 className="w-5 h-5 text-[#888888]" />
        </motion.div>
      </motion.div>

      <motion.div
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.2 }}
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl group relative ${
          isDragging ? 'shadow-lg shadow-white/5' : ''
        }`}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
      >
        <button
          {...attributes}
          {...listeners}
          className="touch-none p-1 text-[#555555] hover:text-[#888888] cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-b border-white/20 py-1 focus:outline-none focus:border-white/40 text-[#EAEAEA] font-mono text-sm"
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className={`flex-1 font-mono text-sm cursor-text ${getStalenessColor(task.staleDays)}`}
          >
            {task.text}
          </span>
        )}

        <button
          onClick={() => onDelete(task.id)}
          className={`p-1 text-[#555555] hover:text-[#888888] transition-opacity ${
            showDelete ? 'opacity-100' : 'opacity-0'
          } md:block hidden`}
        >
          <X className="w-4 h-4" />
        </button>

        <button
          onClick={() => onComplete(task.id)}
          className="p-2 border border-white/20 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all"
        >
          <Check className="w-4 h-4 text-[#888888]" />
        </button>
      </motion.div>
    </div>
  )
}
