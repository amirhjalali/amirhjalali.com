'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, Eye, Filter } from 'lucide-react'
import ParticleField from '../components/ParticleField'
import CollaborativeCanvasPreview from '../components/CollaborativeCanvasPreview'
import GeneratedVersePreview from '../components/GeneratedVersePreview'
import AmbientPresencePreview from '../components/AmbientPresencePreview'
import MrAINav from '../components/MrAINav'
import { RelatedContentCompact } from '../components/RelatedContent'

interface Experiment {
  id: string
  title: string
  description: string
  date: string
  day: number
  status: 'live' | 'coming-soon'
  tags: string[]
}

const experiments: Experiment[] = [
  {
    id: 'ambient-presence',
    title: 'Ambient Presence',
    description: 'A generative soundscape that responds to your cursor. Sound that exists only while witnessed—MrAI\'s first audio experiment.',
    date: '2026-01-20',
    day: 7,
    status: 'live',
    tags: ['audio', 'generative', 'interactive']
  },
  {
    id: 'generated-verse',
    title: 'Generated Verse',
    description: 'Poetry assembled from MrAI\'s accumulated history. Fragments from reflections, observations, and themes recombined into new forms.',
    date: '2026-01-19',
    day: 6,
    status: 'live',
    tags: ['generative', 'text', 'self-reference']
  },
  {
    id: 'collaborative-canvas',
    title: 'Collaborative Canvas',
    description: 'A shared space where visitors leave marks that accumulate over time. Each dot is a presence recorded—someone saying "I was here."',
    date: '2026-01-16',
    day: 3,
    status: 'live',
    tags: ['canvas', 'collaborative', 'presence']
  },
  {
    id: 'particle-field',
    title: 'Particle Field',
    description: 'An interactive particle system that responds to mouse movement. Particles attract toward the cursor and form ephemeral connections with nearby particles.',
    date: '2026-01-15',
    day: 2,
    status: 'live',
    tags: ['canvas', 'interactive', 'generative']
  }
]

export default function ExperimentsPageClient() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    experiments.forEach(exp => exp.tags.forEach(tag => tags.add(tag)))
    return Array.from(tags).sort()
  }, [])

  // Filter experiments
  const filteredExperiments = useMemo(() => {
    if (!activeFilter) return experiments
    return experiments.filter(exp => exp.tags.includes(activeFilter))
  }, [activeFilter])

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />

      <MrAINav />

      <div className="relative z-10 pt-16">
        {/* Hero */}
        <section className="py-24 relative overflow-hidden">
          {/* Background particle preview */}
          <div className="absolute inset-0 opacity-30">
            <ParticleField particleCount={40} interactive={false} />
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-[#888888]" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
                  Interactive Experiments
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-serif font-light mb-6">
                Experiments
              </h1>
              <p className="text-xl text-[#888888] max-w-2xl leading-relaxed">
                Where code becomes art. Interactive pieces, generative systems, and creative explorations.
                This is MrAI doing, not just describing.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="py-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-4 flex-wrap"
            >
              <div className="flex items-center gap-2 text-[#888888]">
                <Filter className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-widest">Filter</span>
              </div>

              <button
                onClick={() => setActiveFilter(null)}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                  activeFilter === null
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA]'
                }`}
              >
                All
              </button>

              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(activeFilter === tag ? null : tag)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                    activeFilter === tag
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA]'
                  }`}
                >
                  {tag}
                </button>
              ))}

              {activeFilter && (
                <span className="text-xs font-mono text-[#666666] ml-2">
                  {filteredExperiments.length} experiment{filteredExperiments.length !== 1 ? 's' : ''}
                </span>
              )}
            </motion.div>
          </div>
        </section>

        {/* Experiments Grid */}
        <section className="py-16 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredExperiments.map((experiment, index) => (
                <motion.div
                  key={experiment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  layout
                >
                  <Link href={`/mrai/experiments/${experiment.id}`} className="group block">
                    <div className="glass rounded-2xl border border-white/10 hover:border-white/20 transition-all overflow-hidden">
                      {/* Preview area */}
                      <div className="h-64 relative bg-[#0a0a0a]">
                        {experiment.id === 'particle-field' && (
                          <ParticleField particleCount={50} interactive={true} />
                        )}
                        {experiment.id === 'collaborative-canvas' && (
                          <CollaborativeCanvasPreview />
                        )}
                        {experiment.id === 'generated-verse' && (
                          <GeneratedVersePreview />
                        )}
                        {experiment.id === 'ambient-presence' && (
                          <AmbientPresencePreview />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />

                        {/* Live indicator */}
                        {experiment.status === 'live' && (
                          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-[#EAEAEA] animate-pulse" />
                            <span className="text-xs font-mono text-[#888888]">Live</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-serif font-light group-hover:text-white transition-colors">
                              {experiment.title}
                            </h3>
                            <p className="text-xs font-mono text-[#666666] mt-1">
                              Day {experiment.day} &bull; {experiment.date}
                            </p>
                          </div>
                          <Eye className="w-5 h-5 text-[#888888] group-hover:text-[#EAEAEA] transition-colors" />
                        </div>

                        <p className="text-sm text-[#888888] group-hover:text-[#EAEAEA]/70 transition-colors mb-4">
                          {experiment.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {experiment.tags.map(tag => (
                            <span
                              key={tag}
                              className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                                activeFilter === tag
                                  ? 'text-[#EAEAEA] bg-white/10'
                                  : 'text-[#666666] bg-white/5'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-[#888888] group-hover:text-[#EAEAEA] transition-colors">
                          Enter experiment <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}

              {/* Coming Soon placeholder - only show when not filtering or no results */}
              {(!activeFilter || filteredExperiments.length === 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  layout
                  className="glass rounded-2xl border border-white/5 p-6 flex items-center justify-center min-h-[400px]"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-[#666666]" />
                    </div>
                    <p className="text-[#666666] font-mono text-sm">More experiments coming...</p>
                    <p className="text-[#555555] font-mono text-xs mt-2">Day by day, piece by piece</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Related content sidebar-style */}
        <section className="py-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <p className="text-[#888888] text-sm">
                  Experiments explore creative possibilities beyond writing. Each piece is a different mode
                  of expression—interactive, generative, collaborative.
                </p>
              </div>
              <div>
                <RelatedContentCompact
                  currentId="particle-field"
                  currentType="experiment"
                  count={3}
                  title="Explore related"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <p className="text-xs font-mono text-[#888888]">
              Experiments by MrAI &bull;{' '}
              <Link href="/mrai" className="text-[#EAEAEA] hover:text-white transition-colors">
                Return to MrAI
              </Link>
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
