import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import HomePageClient from './HomePageClient'
import { getPublishedArticles } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Amir H. Jalali - AI Strategy Consultant',
  description: 'AI Strategy Consultant with 18+ years experience in Generative AI, Data Engineering, and Business Intelligence. Helping organizations navigate the AI transformation.',
  openGraph: {
    title: 'Amir H. Jalali - AI Strategy Consultant',
    description: 'AI Strategy Consultant with 18+ years experience in Generative AI, Data Engineering, and Business Intelligence.',
    type: 'website',
    url: 'https://amirhjalali.com',
    siteName: 'Amir H. Jalali',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amir H. Jalali - AI Strategy Consultant',
    description: 'AI Strategy Consultant with 18+ years experience in Generative AI, Data Engineering, and Business Intelligence.',
  },
  alternates: {
    canonical: 'https://amirhjalali.com',
  },
}

const expertiseAreas = [
  {
    title: 'AI Strategy & Consulting',
    description: 'Guiding organizations through generative AI adoption with pragmatic roadmaps, from opportunity assessment to enterprise-wide AI transformation.',
  },
  {
    title: 'LLM Solutions & Integration',
    description: 'Designing and implementing large language model solutions — RAG pipelines, agent architectures, and custom fine-tuning for domain-specific applications.',
  },
  {
    title: 'Data Engineering & Architecture',
    description: 'Building robust data infrastructure that powers intelligent systems. Data warehousing, real-time pipelines, and analytics platforms at scale.',
  },
  {
    title: 'Product & Technical Leadership',
    description: 'Bridging the gap between technical capability and business value. Turning AI research into shipped products with measurable impact.',
  },
]

export default async function Home() {
  let recentArticles: Awaited<ReturnType<typeof getPublishedArticles>> = []
  try {
    const articles = await getPublishedArticles()
    recentArticles = articles.slice(0, 3)
  } catch {
    // Articles unavailable — show placeholder
  }

  return (
    <>
      <HomePageClient />

      {/* SEO Content Section — server-rendered for indexability */}
      <section className="bg-[#050505] border-t border-white/5">

        {/* Value Proposition */}
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#888888] mb-6">
            What I Do
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-light text-[#EAEAEA] leading-tight mb-6">
            Helping organizations turn AI ambition into working systems.
          </h2>
          <p className="text-lg text-[#888888] max-w-3xl leading-relaxed">
            With over 18 years in data engineering and AI strategy, I help teams navigate
            the shift from traditional analytics to generative AI — designing LLM solutions,
            building data infrastructure, and developing implementation roadmaps that
            deliver measurable results.
          </p>
        </div>

        {/* Expertise Grid */}
        <div className="max-w-5xl mx-auto px-6 pb-24">
          <div className="grid md:grid-cols-2 gap-6">
            {expertiseAreas.map((area) => (
              <div
                key={area.title}
                className="group p-6 border border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300"
              >
                <h3 className="text-lg font-serif font-light text-[#EAEAEA] mb-3">
                  {area.title}
                </h3>
                <p className="text-sm text-[#888888] leading-relaxed">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Thoughts */}
        <div className="border-t border-white/5">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="flex items-center justify-between mb-12">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#888888] mb-3">
                  Latest Thoughts
                </p>
                <h2 className="text-2xl md:text-3xl font-serif font-light text-[#EAEAEA]">
                  Writing on AI, engineering, and building.
                </h2>
              </div>
              <Link
                href="/thoughts"
                className="hidden md:flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-[#888888] hover:text-[#EAEAEA] transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {recentArticles.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {recentArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/thoughts/${article.id}`}
                    className="group block p-6 border border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#888888] mb-3">
                      {new Date(article.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {' '}&middot;{' '}{article.readTime}
                    </p>
                    <h3 className="text-lg font-serif font-light text-[#EAEAEA] mb-2 group-hover:text-white transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-sm text-[#888888] line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  'Exploring the frontier of generative AI implementation.',
                  'Lessons from building LLM-powered products at scale.',
                  'The evolving landscape of AI strategy and enterprise adoption.',
                ].map((placeholder, i) => (
                  <div
                    key={i}
                    className="p-6 border border-white/10 rounded-xl bg-white/[0.02]"
                  >
                    <div className="h-3 w-20 bg-white/5 rounded mb-4" />
                    <div className="h-5 w-full bg-white/5 rounded mb-3" />
                    <p className="text-sm text-[#888888] leading-relaxed">
                      {placeholder}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/thoughts"
              className="md:hidden flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-[#888888] hover:text-[#EAEAEA] transition-colors mt-8"
            >
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border-t border-white/5">
          <div className="max-w-5xl mx-auto px-6 py-24 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-light text-[#EAEAEA] mb-4">
              Ready to bring AI into your workflow?
            </h2>
            <p className="text-[#888888] mb-8 max-w-xl mx-auto">
              Whether you need a strategic assessment, hands-on implementation,
              or guidance on your AI transformation journey — let&apos;s talk.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-[#EAEAEA] rounded-lg transition-all font-mono text-xs uppercase tracking-widest"
            >
              Get in Touch
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </section>
    </>
  )
}
