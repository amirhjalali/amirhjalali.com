import Link from 'next/link'
import { getRelatedArticles } from '@/lib/data'
import { ArrowUpRight } from 'lucide-react'

interface RelatedArticlesProps {
  articleId: string
  tags: string[]
}

export default async function RelatedArticles({ articleId, tags }: RelatedArticlesProps) {
  const related = await getRelatedArticles(articleId, tags, 3)

  if (related.length === 0) return null

  return (
    <section className="mt-16 pt-12 border-t border-white/10">
      <h2 className="text-sm font-mono uppercase tracking-widest text-[#888888] mb-8">
        Related Articles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((article) => (
          <Link
            key={article.id}
            href={`/thoughts/${article.id}`}
            className="group block p-5 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.03] transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-3 text-[10px] font-mono uppercase tracking-widest text-[#666666]">
              <span>{article.readTime}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#888888] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
            </div>
            <h3 className="text-base font-serif font-light text-[#EAEAEA] group-hover:text-white transition-colors line-clamp-2 mb-2">
              {article.title}
            </h3>
            <p className="text-[#888888] text-xs line-clamp-2">
              {article.excerpt}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {article.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] px-1.5 py-0.5 border border-white/10 rounded-full font-mono uppercase tracking-widest text-[#888888]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
