'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function ArticleGenerator({ onArticleGenerated }: { onArticleGenerated?: () => void }) {

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
