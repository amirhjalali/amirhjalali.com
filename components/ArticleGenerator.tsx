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
    setIsGenerating(true);
    setStatus('generating');
    setMessage('Generating article with AI...');

    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'anthropic' // or 'openai'
        }),
      });

      const data: GenerationResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate article');
      }

      // Save as draft
      saveDraftArticle(data.article);
      setLastArticle(data.article);

      setStatus('success');
      setMessage(`✨ Generated "${data.article.title}" (${data.stats.wordCount} words)`);

      // Notify parent component
      if (onArticleGenerated) {
        onArticleGenerated();
      }

      // Reset after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);

    } catch (error: any) {
      console.error('Error generating article:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to generate article');

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <motion.button
        onClick={generateArticle}
        disabled={isGenerating}
        className={`
          relative overflow-hidden
          px-6 py-3 rounded-xl
          font-medium text-white
          transition-all duration-300
          ${isGenerating
            ? 'bg-purple-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:scale-105'
          }
        `}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          {status === 'generating' && (
            <Loader2 className="w-5 h-5 animate-spin" />
          )}
          {status === 'success' && (
            <Check className="w-5 h-5" />
          )}
          {status === 'error' && (
            <X className="w-5 h-5" />
          )}
          {status === 'idle' && (
            <Sparkles className="w-5 h-5" />
          )}
          <span>
            {isGenerating ? 'Generating...' : 'Generate AI Article'}
          </span>
        </div>

        {/* Animated gradient background */}
        {isGenerating && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ opacity: 0.5 }}
          />
        )}
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
      {status === 'idle' && (
        <div className="text-sm text-gray-600 space-y-2">
          <p>Click to generate a new AI article.</p>
          <p className="text-xs opacity-70">
            Articles are saved as drafts and can be reviewed before publishing.
          </p>
        </div>
      )}
    </div>
  );
}
