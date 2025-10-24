'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { generateArticle } from '@/lib/generateArticle';
import { saveDraftArticle } from '@/lib/articles';

export default function ArticleGenerator({ onArticleGenerated }: { onArticleGenerated?: () => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleGenerateArticle = async () => {
    setIsGenerating(true);
    setError('');
    setSuccess(false);
    setProgress('Initializing...');

    try {
      // Generate the article
      const result = await generateArticle(undefined, (step) => {
        setProgress(step);
      });

      // Calculate read time
      const readTime = `${Math.ceil(result.wordCount / 200)} min read`;

      // Save as draft
      setProgress('Saving draft...');
      saveDraftArticle({
        title: result.title,
        content: result.content,
        excerpt: result.excerpt,
        tags: result.tags,
        imageUrl: result.imageUrl,
        aiGenerated: true,
        author: 'Amir H. Jalali',
        metadata: {
          style: 'casual',
          length: 'medium',
          wordCount: result.wordCount
        }
      });

      setSuccess(true);
      setProgress(`✅ Article created: "${result.title}"`);

      // Notify parent component
      setTimeout(() => {
        onArticleGenerated?.();
        setIsGenerating(false);
        setProgress('');
      }, 2000);

    } catch (err: any) {
      console.error('Article generation error:', err);
      setError(err.message || 'Failed to generate article');
      setIsGenerating(false);
      setProgress('');
    }
  };

  return (
    <div className="space-y-4">
      <motion.button
        onClick={handleGenerateArticle}
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
        whileTap={!isGenerating ? { scale: 0.95 } : {}}
      >
        <div className="flex items-center gap-2">
          {isGenerating && <Loader2 className="w-5 h-5 animate-spin" />}
          {!isGenerating && !success && <Sparkles className="w-5 h-5" />}
          {success && <CheckCircle className="w-5 h-5" />}
          <span>
            {isGenerating ? 'Generating...' : success ? 'Generated!' : 'Generate AI Article'}
          </span>
        </div>

        {/* Animated gradient background when generating */}
        {isGenerating && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400"
            animate={{ x: ['-100%', '100%'] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ opacity: 0.5 }}
          />
        )}
      </motion.button>

      {/* Progress message */}
      {progress && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg"
        >
          <p className="text-sm text-blue-800 dark:text-blue-200">{progress}</p>
        </motion.div>
      )}

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-start gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800 dark:text-red-200 font-semibold">Generation Failed</p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
        <p className="font-semibold">AI Article Generation</p>
        <p className="text-xs opacity-70">
          Click the button above to generate a new article instantly using GPT-4o-mini and DALL-E 3.
          Articles are saved as drafts for review before publishing.
        </p>
      </div>
    </div>
  );
}
