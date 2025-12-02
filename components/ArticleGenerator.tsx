'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

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
      setProgress('Generating article content...');

      // Use apiClient which handles the API call and error parsing
      const draft = await apiClient.generateArticle();

      setSuccess(true);
      setProgress(`✅ Article created: "${draft.title}"`);

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
            ? 'bg-ai-teal/50 cursor-not-allowed'
            : 'bg-gradient-to-r from-ai-teal to-ai-cyan dark:from-ai-green dark:to-ai-blue hover:shadow-lg hover:scale-105'
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
            className="absolute inset-0 bg-gradient-to-r from-ai-teal via-ai-cyan to-ai-teal opacity-50"
            animate={{ x: ['-100%', '100%'] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
      </motion.button>

      {/* Progress message */}
      {progress && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-ai-teal/10 border border-ai-teal/20 rounded-lg"
        >
          <p className="text-sm text-ai-teal dark:text-ai-green">{progress}</p>
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
          <div className="flex-1">
            <p className="text-sm text-red-800 dark:text-red-200 font-semibold">Generation Failed</p>
            <pre className="text-xs text-red-700 dark:text-red-300 mt-1 whitespace-pre-wrap font-sans">{error}</pre>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="text-sm text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground">AI Article Generation</p>
        <p className="text-xs opacity-70">
          Click the button above to generate a new article instantly using GPT-4o-mini and DALL-E 3.
          Articles are saved as drafts for review before publishing.
          <span className="text-ai-teal dark:text-ai-green font-medium"> 🔒 API key secured server-side</span>
        </p>
      </div>
    </div>
  );
}
