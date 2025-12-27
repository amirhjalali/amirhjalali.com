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
          font-mono text-xs uppercase tracking-widest
          transition-all duration-300
          ${isGenerating
            ? 'bg-white/20 text-[#888888] cursor-not-allowed'
            : 'bg-white text-black hover:bg-[#EAEAEA] hover:scale-105'
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

        {/* Animated shimmer when generating */}
        {isGenerating && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
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
          className="p-3 bg-white/5 border border-white/10 rounded-lg"
        >
          <p className="text-sm text-[#EAEAEA]">{progress}</p>
        </motion.div>
      )}

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-white/5 border border-white/20 rounded-lg flex items-start gap-2"
        >
          <AlertCircle className="w-5 h-5 text-[#888888] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-[#EAEAEA] font-semibold">Generation Failed</p>
            <pre className="text-xs text-[#888888] mt-1 whitespace-pre-wrap font-sans">{error}</pre>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="text-sm text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground">AI Article Generation</p>
        <p className="text-xs opacity-70">
          Click the button above to generate a new article instantly using GPT-4o-mini and DALL-E 3.
          Articles are saved as drafts for review before publishing.
          <span className="text-[#EAEAEA] font-medium"> 🔒 API key secured server-side</span>
        </p>
      </div>
    </div>
  );
}
