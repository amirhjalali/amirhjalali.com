'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { saveDraftArticle } from '@/lib/articles';

interface GeneratedArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  imageUrl: string;
  aiGenerated: boolean;
  author: string;
  publishedAt: string;
  readTime: string;
  status: 'draft';
  metadata?: {
    style: string;
    length: string;
    wordCount: number;
    generatedAt: string;
    topic: string;
    model: string;
  };
}

interface GenerationResponse {
  success: boolean;
  article: GeneratedArticle;
  stats: {
    wordCount: number;
    readTime: string;
    model: string;
    topic: string;
  };
  error?: string;
}

export default function ArticleGenerator({ onArticleGenerated }: { onArticleGenerated?: () => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [lastArticle, setLastArticle] = useState<GeneratedArticle | null>(null);

  const generateArticle = async () => {
    // For static sites, we can't generate articles from the UI
    // Open GitHub Actions workflow page directly
    window.open('https://github.com/amirhjalali/amirhjalali.com/actions', '_blank');
  };

  return (
    <div className="space-y-4">
      <motion.button
        onClick={generateArticle}
        className="
          relative overflow-hidden
          px-6 py-3 rounded-xl
          font-medium text-white
          transition-all duration-300
          bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:scale-105
        "
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span>Open GitHub Actions</span>
        </div>
      </motion.button>

      {/* Status message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`
            p-4 rounded-lg border
            ${status === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : status === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
            }
          `}
        >
          <p className="text-sm">{message}</p>
          {lastArticle && status === 'success' && (
            <div className="mt-2 text-xs opacity-70">
              <p>Topic: {lastArticle.metadata?.topic}</p>
              <p>Model: {lastArticle.metadata?.model}</p>
              <p>Tags: {lastArticle.tags.join(', ')}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
        <p className="font-semibold">Automated Daily Generation</p>
        <p className="text-xs opacity-70">
          New articles are automatically generated daily at 9 AM UTC via GitHub Actions. Generated drafts will appear here for review before publishing.
        </p>
      </div>
    </div>
  );
}
