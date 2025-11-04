'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import type { Article } from '@/lib/articles'
import type { TrendingTopic } from '@/lib/server/topics'

const getImageUrl = (url: string | undefined) => {
  if (!url) return undefined
  const basePath = '/amirhjalali.com'
  return url.startsWith('/') ? `${basePath}${url}` : url
}

const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 }
}

interface ThoughtsPageClientProps {
  articles: Article[]
  topics?: TrendingTopic[]
}

export default function ThoughtsPageClient({ articles, topics = [] }: ThoughtsPageClientProps) {
  const sortedArticles = useMemo(
    () =>
      [...articles].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      ),
    [articles]
  )

  const [featuredArticle, ...remainingArticles] = sortedArticles

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-space mb-6">
            <span className="text-gradient">Thoughts</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Insights on AI trends, programming paradigms, and the future of technology
          </p>
        </motion.div>

        {topics.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="glass border border-border/80 rounded-3xl p-6 md:p-8 backdrop-blur">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-[0.3em]">
                    Today&apos;s Signals
                  </p>
                  <h2 className="text-2xl md:text-3xl font-semibold mt-2">
                    Headlines shaping the AI landscape right now
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground">
                  Sourced from industry feeds &nbsp;•&nbsp; Updated daily
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topics.slice(0, 6).map((topic) => (
                  <a
                    key={`${topic.topic}-${topic.url}`}
                    href={topic.url ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/60 p-4 hover:border-ai-teal/50 dark:hover:border-ai-green/50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wide">
                      <span>{topic.source ?? 'Trend'}</span>
                      {typeof topic.score === 'number' && (
                        <span className="font-mono text-ai-teal dark:text-ai-green">
                          {topic.score}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-base font-medium leading-6 group-hover:text-gradient transition-colors">
                      {topic.topic || topic.originalTitle}
                    </p>
                    {topic.fetchedAt && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        {new Date(topic.fetchedAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {featuredArticle && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <Link href={`/thoughts/${featuredArticle.id}`} className="group block">
              <div className="relative overflow-hidden rounded-[32px] border border-border/70 hover:border-ai-teal/40 dark:hover:border-ai-green/40 transition-all">
                <div className="relative h-[420px] md:h-[480px] lg:h-[520px]">
                  {featuredArticle.imageUrl && (
                    <LazyImage
                      src={getImageUrl(featuredArticle.imageUrl) || ''}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      wrapperClassName="w-full h-full"
                      aspectRatio="wide"
                      placeholder="skeleton"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/70 uppercase tracking-[0.3em] mb-6">
                    <span>Feature</span>
                    <span>•</span>
                    <span>{new Date(featuredArticle.publishedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{featuredArticle.readTime}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-space font-semibold text-white leading-tight mb-4 max-w-3xl">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-base md:text-lg text-white/80 max-w-2xl">
                    {featuredArticle.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          </motion.section>
        )}

        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {remainingArticles.map((article) => (
            <motion.div
              key={article.id}
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              className="group relative"
            >
              <Link href={`/thoughts/${article.id}`} className="block h-full">
                <div className="relative glass border border-border rounded-3xl overflow-hidden hover:border-ai-teal/30 dark:hover:border-ai-green/30 transition-all duration-300 h-full flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-ai-teal/5 via-transparent to-ai-cyan/5 dark:from-ai-green/5 dark:via-transparent dark:to-ai-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {article.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <LazyImage
                        src={getImageUrl(article.imageUrl) || ''}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        wrapperClassName="w-full h-full"
                        aspectRatio="wide"
                        placeholder="skeleton"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {article.aiGenerated && (
                        <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-ai-teal/90 dark:bg-ai-green/90 rounded-full text-xs font-medium text-white">
                          <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                          AI
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3 text-xs text-muted-foreground">
                      <span>{article.author}</span>
                      <span>{article.readTime}</span>
                    </div>

                    <h3 className="text-xl mb-3 group-hover:text-gradient transition-all duration-300 line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
                      {article.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-accent hover:bg-accent/80 rounded-full transition-all"
                        >
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-muted/20 rounded-full text-muted-foreground">
                          +{article.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      <span className="text-ai-teal dark:text-ai-green opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                        Read more →
                      </span>
                    </div>
                  </div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-ai-teal/10 to-ai-cyan/10 dark:from-ai-green/10 dark:to-ai-blue/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
