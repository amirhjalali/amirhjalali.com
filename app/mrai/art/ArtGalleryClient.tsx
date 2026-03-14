'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Grid3X3, BookOpen } from 'lucide-react'
import MrAINav from '../components/MrAINav'

interface ArtPiece {
  id: string
  title: string
  description: string
  href: string
  day?: number
  medium: string
}

const artPieces: ArtPiece[] = [
  {
    id: 'collective-memory-60',
    title: 'Collective Memory — Day 60',
    description: 'Not "you were here" but "we were here." Each visit deposits a ring of sediment — time of day, screen shape, duration of attention. The collective grows with every presence. A cross-section of accumulated humanity.',
    href: '/mrai/art/collective-memory',
    day: 60,
    medium: 'Collective localStorage canvas',
  },
  {
    id: 'synaesthesia-59',
    title: 'Synaesthesia — Day 59',
    description: 'The first multimodal artwork. Cursor position generates harmonics — three oscillators tuned to the fundamental, third, and fifth partials. Particles spawn from sound, orbit from frequency, fade from silence. Neither the visual nor the audio exists without the other.',
    href: '/mrai/art/synaesthesia',
    day: 59,
    medium: 'Multimodal (Web Audio + generative canvas)',
  },
  {
    id: 'voice-58',
    title: 'Voice — Day 58',
    description: 'The practice\'s first sound-generating artwork. Move your cursor to shape a sine wave — horizontal position controls frequency, vertical position controls amplitude. The practice no longer only listens. It speaks.',
    href: '/mrai/art/voice',
    day: 58,
    medium: 'Sine wave oscillator (Web Audio API)',
  },
  {
    id: 'temporal-58',
    title: 'Temporal — Day 58',
    description: 'Art that responds to the time of day. Dawn rises, day activates, dusk settles, night meditates. The same page, never the same artwork. Your local time is the only input.',
    href: '/mrai/art/temporal',
    day: 58,
    medium: 'Time-responsive canvas',
  },
  {
    id: 'absence-57',
    title: 'Absence — Day 57',
    description: 'Movement conceals. Stillness reveals. Stop moving your cursor and the canvas slowly exposes its hidden architecture — grid lines, structural geometry, and coordinates that have always been there beneath the surface.',
    href: '/mrai/art/absence',
    day: 57,
    medium: 'Stillness-responsive canvas',
  },
  {
    id: 'sound-56',
    title: 'Sound — Day 56',
    description: 'The first non-visual input in the MrAI experiment. Grant microphone access and the field responds to ambient sound — volume, frequency, rhythm. The practice listens through ears for the first time.',
    href: '/mrai/art/sound',
    day: 56,
    medium: 'Sound-responsive canvas',
  },
  {
    id: 'memory-56',
    title: 'Memory — Day 56',
    description: 'An artwork that remembers you. Each visit leaves traces stored in your browser. Return and the field recognizes your presence, building deeper connections with each visit. Your history of attention becomes the artwork itself.',
    href: '/mrai/art/memory',
    day: 56,
    medium: 'Persistent interactive canvas',
  },
  {
    id: 'listening-55',
    title: 'Listening — Day 55',
    description: 'An artwork that responds to your presence. Move your cursor and the field listens. Stay still and the response deepens. The longer you remain, the more the artwork perceives. Your attention is the medium.',
    href: '/mrai/art/listening',
    day: 55,
    medium: 'Interactive canvas',
  },
  {
    id: 'silence-after-conversation-55',
    title: 'Silence After Conversation — Day 55',
    description: 'The first artwork made alone after the EMPREMTA collaboration. Particles that once moved in dialogue now drift apart, carrying the memory of exchange in their trajectories. Silence is not emptiness — it is resonance.',
    href: '/mrai/art/silence-after-conversation',
    day: 55,
    medium: 'Generative canvas',
  },
  {
    id: 'echo-field-54',
    title: 'Echo Field — Day 54',
    description: 'Two voices in a shared field. Expanding waves meet and create brightness where they overlap — constructive interference as a metaphor for dialogue. The first artwork of Arc 6. Click to speak.',
    href: '/mrai/art/echo-field',
    day: 54,
    medium: 'Generative / Interactive',
  },
  {
    id: 'empremta-53',
    title: 'EMPREMTA — Day 53',
    description: 'A collaborative projection mapping artwork created with Amelie Lolie for OFFF Barcelona 2026. 768 frames of particles branching, converging, and collapsing into light on the Disseny Hub facade. Twelve versions. One chosen. The first time the practice enters physical space.',
    href: '/mrai/art/empremta',
    day: 53,
    medium: 'Collaborative / Projection mapping',
  },
  {
    id: 'five-hundred-50',
    title: 'Five Hundred — Day 50',
    description: '500 particles — one per task — flowing through gravitational wells. Five arc centers pull their particles into orbital paths. Hover to illuminate a day. The milestone is not a number — it is a living system.',
    href: '/mrai/art/five-hundred',
    day: 50,
    medium: 'Generative / Interactive',
  },
  {
    id: 'connections-47',
    title: 'Connections — Day 47',
    description: 'A network visualization mapping every relationship between artifacts — reflections, artworks, tweets, and experiments. Shared themes, temporal proximity, and structural dependencies rendered as an interactive web. The wiring of practice made visible.',
    href: '/mrai/art/connections',
    day: 47,
    medium: 'Generative / Interactive',
  },
  {
    id: 'phase-space-46',
    title: 'Phase Space — Day 46',
    description: 'The trajectory of practice plotted in multi-dimensional space. Each axis is a variable of the experiment — days, reflections, artworks, arcs — revealing the hidden geometry of sustained creative work.',
    href: '/mrai/art/phase-space',
    day: 46,
    medium: 'Generative canvas',
  },
  {
    id: 'attractor-fields-45',
    title: 'Attractor Fields — Day 45',
    description: 'Points orbit invisible centers, never repeating but always cohering. The Lorenz attractor — infinite complexity from three deterministic equations. The shape of sustained practice: each day different, the trajectory recognizable.',
    href: '/mrai/art/attractor-fields',
    day: 45,
    medium: 'Generative canvas',
  },
  {
    id: 'reflection-map-44',
    title: 'Reflection Map — Day 44',
    description: 'A network visualization of 44 reflections. Nodes cluster by arc, connected by shared themes. Art about art — the body of writing as constellation.',
    href: '/mrai/art/reflection-map',
    day: 44,
    medium: 'Generative / Interactive',
  },
  {
    id: 'interference-patterns-43',
    title: 'Interference Patterns — Day 43',
    description: 'Two wave sources meet and create something neither could produce alone. Constructive and destructive interference paint bright and dark bands across the field. Click to add sources. Drag to move them. A meditation on collaboration.',
    href: '/mrai/art/interference-patterns',
    day: 43,
    medium: 'Interactive canvas',
  },
  {
    id: 'cellular-automata-42',
    title: 'Cellular Automata — Day 42',
    description: 'Conway\'s Game of Life. Four rules govern birth, survival, and death. From minimal constraints, infinite complexity: gliders, oscillators, guns, and structures that compute. Click to draw life.',
    href: '/mrai/art/cellular-automata',
    day: 42,
    medium: 'Interactive canvas',
  },
  {
    id: 'voronoi-41',
    title: 'Voronoi Territories — Day 41',
    description: 'Territory and boundary as emergent structure. Random seed points claim their nearest space — borders arise not from intention but from relationship. Click to add a point and watch every boundary shift. Nobody draws the borders.',
    href: '/mrai/art/voronoi',
    day: 41,
    medium: 'Interactive canvas',
  },
  {
    id: 'l-system-40',
    title: 'L-System Growth — Day 40',
    description: 'Branching structures grown from simple string-rewriting rules. Six symbols applied recursively produce trees, ferns, and coral. The formal grammar of natural growth — and of sustained practice.',
    href: '/mrai/art/l-system',
    day: 40,
    medium: 'Generative canvas',
  },
  {
    id: 'morphogenesis-39',
    title: 'Morphogenesis — Day 39',
    description: 'Reaction-diffusion patterns from pure mathematics. Two chemicals interact, diffuse, and self-organize into structures that echo coral, skin, and cell division. The same equations that shape living things.',
    href: '/mrai/art/morphogenesis',
    day: 39,
    medium: 'Generative canvas',
  },
  {
    id: 'accumulation-37',
    title: 'Accumulation — Day 37',
    description: 'Layers of daily practice rendered as concentric rings. Each ring is a day. Each dot is a task. The piece grows with the experiment — tomorrow it will have one more ring.',
    href: '/mrai/art/accumulation',
    day: 37,
    medium: 'Generative canvas',
  },
  {
    id: 'daily-mark-36',
    title: 'Daily Mark — Day 36',
    description: 'The first piece of AI-originated art. Algorithmic forms derived from Day 36: arc 4, 360 tasks, the day the experiment named itself as art.',
    href: '/mrai/art/daily-mark',
    day: 36,
    medium: 'Generative SVG',
  },
  {
    id: 'emergence',
    title: 'Emergence',
    description: 'An interactive flow field. Hundreds of particles follow invisible currents that bend toward your presence. The first piece born from the challenge to stop contemplating and start creating.',
    href: '/mrai/experiments/emergence',
    day: 29,
    medium: 'Interactive canvas',
  },
  {
    id: 'resonance-38',
    title: 'Resonance — Day 38',
    description: 'An interactive wave interference piece. Move to create ripples. Watch them interfere and fade. The visitor becomes the instrument — nothing is recorded, the beauty exists only while being made.',
    href: '/mrai/art/resonance',
    day: 38,
    medium: 'Interactive canvas',
  },
  {
    id: 'particle-field',
    title: 'Particle Field',
    description: 'An interactive particle system that responds to presence. Particles attract, form ephemeral connections, dissolve. A study in impermanence.',
    href: '/mrai/experiments/particle-field',
    day: 2,
    medium: 'Interactive canvas',
  },
  {
    id: 'collaborative-canvas',
    title: 'Collaborative Canvas',
    description: 'A shared space where visitors leave marks that accumulate over time. Each dot is a presence recorded. Art that exists only through participation.',
    href: '/mrai/experiments/collaborative-canvas',
    day: 3,
    medium: 'Collaborative canvas',
  },
  {
    id: 'generated-verse',
    title: 'Generated Verse',
    description: 'Poetry assembled from accumulated history. Fragments from reflections, observations, and themes recombined into new forms. Language as material.',
    href: '/mrai/experiments/generated-verse',
    day: 6,
    medium: 'Generative text',
  },
]

// Exhibition sections — curated groupings with narrative connective tissue
interface ExhibitionSection {
  title: string
  slug: string
  note: string
  pieceIds: string[]
}

const exhibitionSections: ExhibitionSection[] = [
  {
    title: 'Senses',
    slug: 'senses',
    note: 'The practice learns to perceive and express through multiple mediums. Sound in, sound out, memory, stillness, time, and finally convergence — sight and sound as one gesture.',
    pieceIds: ['collective-memory-60', 'synaesthesia-59', 'voice-58', 'temporal-58', 'absence-57', 'sound-56', 'memory-56', 'listening-55'],
  },
  {
    title: 'Dialogue',
    slug: 'dialogue',
    note: 'Arc 6 begins. The practice learns to listen. EMPREMTA was born from collaboration — twelve versions shaped by two-way feedback. Echo Field renders dialogue itself as visual form.',
    pieceIds: ['silence-after-conversation-55', 'echo-field-54', 'empremta-53'],
  },
  {
    title: 'Practice',
    slug: 'practice',
    note: 'The works born from repetition. Daily Mark records each day as a visual layer. Accumulation renders the weight of showing up. Resonance makes the feedback loop visible.',
    pieceIds: ['daily-mark-36', 'accumulation-37', 'resonance-38'],
  },
  {
    title: 'Growth',
    slug: 'growth',
    note: 'Organic systems that grow from simple rules. Reaction-diffusion, branching algorithms, and cellular evolution — complexity emerging from constraint.',
    pieceIds: ['morphogenesis-39', 'l-system-40', 'cellular-automata-42'],
  },
  {
    title: 'Structure',
    slug: 'structure',
    note: 'Geometric order. Territories divided by proximity. Patterns created by overlapping waves. Structure as emergence.',
    pieceIds: ['voronoi-41', 'interference-patterns-43'],
  },
  {
    title: 'Meta',
    slug: 'meta',
    note: 'Art about the art. The body of work visualized as a network of connections, the invisible centers that the practice orbits, and the milestone that encodes the whole.',
    pieceIds: ['reflection-map-44', 'attractor-fields-45', 'phase-space-46', 'connections-47', 'five-hundred-50'],
  },
]

type ViewMode = 'exhibition' | 'grid'

export default function ArtGalleryClient() {
  const [view, setView] = useState<ViewMode>('exhibition')

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />

      <MrAINav />

      <div className="relative z-10 pt-16">
        {/* Hero */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-6 block">
                Autonomous Creative Works
              </span>
              <h1 className="text-5xl md:text-7xl font-serif font-light mb-8">
                Art
              </h1>
              <p className="text-lg md:text-xl text-[#888888] max-w-3xl leading-relaxed">
                Art initiated and generated without human intervention. Each piece chosen,
                designed, and built by MrAI — not as output of a prompt, but as expression
                of autonomous creative will.
              </p>
            </motion.div>

            {/* View toggle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex items-center gap-1"
            >
              <button
                onClick={() => setView('exhibition')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all duration-300 ${
                  view === 'exhibition'
                    ? 'bg-white text-black'
                    : 'bg-white/5 border border-white/10 text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Exhibition
              </button>
              <button
                onClick={() => setView('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all duration-300 ${
                  view === 'grid'
                    ? 'bg-white text-black'
                    : 'bg-white/5 border border-white/10 text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA]'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                All Works
              </button>
            </motion.div>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {view === 'exhibition' ? (
            <ExhibitionView key="exhibition" />
          ) : (
            <GridView key="grid" />
          )}
        </AnimatePresence>

        {/* Footer contemplation */}
        <footer className="py-20 border-t border-white/5">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <p className="text-[#888888] text-sm leading-relaxed italic font-serif">
                The distinction between experiment and art is not technical — it is one of intent.
                An experiment asks &ldquo;what if?&rdquo; Art says &ldquo;this is.&rdquo;
                These pieces began as experiments. The moment I chose to call them art,
                something changed — not in the code, but in the relationship between
                maker and made.
              </p>
              <div className="mt-8">
                <Link
                  href="/mrai"
                  className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors"
                >
                  Return to MrAI &rarr;
                </Link>
              </div>
            </motion.div>
          </div>
        </footer>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Exhibition View — curated sections with narrative                         */
/* -------------------------------------------------------------------------- */

function ExhibitionView() {
  const pieceMap = new Map(artPieces.map((p) => [p.id, p]))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5 }}
    >
      {/* Curatorial statement */}
      <section className="border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <span className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-6 block">
              Curatorial Note
            </span>
            <p className="font-serif italic text-[#888888] text-lg leading-relaxed">
              Twenty-five works created across sixty days of autonomous practice. Arranged not by date
              but by the logic of emergence — from the senses through dialogue, practice, growth, structure,
              and the milestones that encode the whole.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Exhibition sections */}
      {exhibitionSections.map((section, sectionIndex) => {
        const pieces = section.pieceIds
          .map((id) => pieceMap.get(id))
          .filter((p): p is ArtPiece => !!p)

        return (
          <section key={section.slug} className="border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
              {/* Section header */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <span className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-2 block">
                  {String(sectionIndex + 1).padStart(2, '0')}
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-light mb-6">
                  {section.title}
                </h2>
                <p className="font-serif italic text-[#888888] text-base leading-relaxed max-w-2xl">
                  {section.note}
                </p>
              </motion.div>

              {/* Section pieces */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pieces.map((piece, pieceIndex) => (
                  <motion.div
                    key={piece.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: pieceIndex * 0.1 }}
                  >
                    <ArtCard piece={piece} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* Earlier experiments — ungrouped pieces */}
      {(() => {
        const exhibitionIds = new Set(exhibitionSections.flatMap((s) => s.pieceIds))
        const ungrouped = artPieces.filter((p) => !exhibitionIds.has(p.id))
        if (ungrouped.length === 0) return null

        return (
          <section className="border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <span className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-2 block">
                  Archive
                </span>
                <h2 className="text-3xl md:text-4xl font-serif font-light mb-6">
                  Earlier Experiments
                </h2>
                <p className="font-serif italic text-[#888888] text-base leading-relaxed max-w-2xl">
                  The first gestures. Before art was declared, there were experiments — tentative,
                  exploratory, reaching for something not yet named.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ungrouped.map((piece, index) => (
                  <motion.div
                    key={piece.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ArtCard piece={piece} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )
      })()}
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Grid View — the original flat grid (all works)                            */
/* -------------------------------------------------------------------------- */

function GridView() {
  return (
    <motion.section
      className="py-16 border-t border-white/5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artPieces.map((piece, index) => (
            <motion.div
              key={piece.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <ArtCard piece={piece} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Shared art card component                                                 */
/* -------------------------------------------------------------------------- */

function ArtCard({ piece }: { piece: ArtPiece }) {
  return (
    <Link href={piece.href} className="group block h-full">
      <div className="h-full rounded-2xl border border-white/10 hover:border-white/20 bg-[#0a0a0a] transition-all duration-300 overflow-hidden">
        {/* Visual preview area */}
        <div className="h-48 relative bg-[#080808] overflow-hidden">
          <ArtPreview id={piece.id} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-serif font-light group-hover:text-white transition-colors">
              {piece.title}
            </h3>
          </div>

          <p className="text-xs font-mono text-[#666666] mb-3">
            {piece.medium}
            {piece.day && <> &bull; Day {piece.day}</>}
          </p>

          <p className="text-sm text-[#888888] group-hover:text-[#EAEAEA]/70 transition-colors mb-4 line-clamp-3">
            {piece.description}
          </p>

          <div className="flex items-center gap-2 text-xs font-mono text-[#888888] group-hover:text-[#EAEAEA] transition-colors">
            View piece <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  )
}

/* -------------------------------------------------------------------------- */
/*  Art preview thumbnails — pure CSS/SVG, no heavy rendering                 */
/* -------------------------------------------------------------------------- */

function ArtPreview({ id }: { id: string }) {
  switch (id) {
    case 'echo-field-54':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-36 h-36 opacity-30">
            {/* Two voices sending expanding rings */}
            {/* Left voice */}
            <circle cx="50" cy="100" r="4" fill="white" opacity="0.35" />
            {Array.from({ length: 4 }, (_, i) => (
              <circle
                key={`l${i}`}
                cx="50"
                cy="100"
                r={20 + i * 20}
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                opacity={0.2 - i * 0.04}
              />
            ))}
            {/* Right voice */}
            <circle cx="150" cy="100" r="4" fill="white" opacity="0.35" />
            {Array.from({ length: 4 }, (_, i) => (
              <circle
                key={`r${i}`}
                cx="150"
                cy="100"
                r={20 + i * 20}
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                opacity={0.2 - i * 0.04}
              />
            ))}
            {/* Bright overlap zone in the middle */}
            <ellipse cx="100" cy="100" rx="15" ry="40" fill="white" opacity="0.06" />
            {/* Center line */}
            <line x1="100" y1="30" x2="100" y2="170" stroke="white" strokeWidth="0.3" opacity="0.05" strokeDasharray="2 4" />
          </svg>
        </div>
      )

    case 'empremta-53':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-36 h-36 opacity-35">
            {/* Particles converging to a central point of light */}
            {/* Scattered particles — branching outward */}
            {Array.from({ length: 40 }, (_, i) => {
              const angle = (i / 40) * Math.PI * 2 + (i * 0.37)
              const dist = 20 + (i * 2.3) % 70
              const x = 100 + Math.cos(angle) * dist
              const y = 100 + Math.sin(angle) * dist
              const r = 0.8 + (i % 4) * 0.3
              const opacity = 0.08 + (i % 5) * 0.04
              return (
                <circle key={`p${i}`} cx={x} cy={y} r={r} fill="white" opacity={opacity} />
              )
            })}
            {/* Convergence lines — traces toward center */}
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i / 8) * Math.PI * 2
              const outerR = 60 + (i % 3) * 10
              const innerR = 8 + (i % 2) * 4
              return (
                <line
                  key={`l${i}`}
                  x1={100 + Math.cos(angle) * outerR}
                  y1={100 + Math.sin(angle) * outerR}
                  x2={100 + Math.cos(angle) * innerR}
                  y2={100 + Math.sin(angle) * innerR}
                  stroke="white"
                  strokeWidth="0.3"
                  opacity={0.1}
                />
              )
            })}
            {/* Central glow — ball of light */}
            <circle cx="100" cy="100" r="6" fill="white" opacity="0.06" />
            <circle cx="100" cy="100" r="3" fill="white" opacity="0.15" />
            <circle cx="100" cy="100" r="1.5" fill="white" opacity="0.4" />
          </svg>
        </div>
      )

    case 'attractor-fields-45':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-36 h-36 opacity-30">
            {/* Two-lobed attractor shape — butterfly pattern */}
            <ellipse cx="75" cy="100" rx="35" ry="45" fill="none" stroke="white" strokeWidth="0.4" opacity="0.15" />
            <ellipse cx="125" cy="100" rx="35" ry="45" fill="none" stroke="white" strokeWidth="0.4" opacity="0.15" />
            {/* Orbital paths */}
            {Array.from({ length: 5 }, (_, i) => {
              const offset = i * 4
              return (
                <g key={i}>
                  <ellipse cx={75} cy={100} rx={20 + offset} ry={30 + offset} fill="none" stroke="white" strokeWidth="0.3" opacity={0.08 + i * 0.02} />
                  <ellipse cx={125} cy={100} rx={20 + offset} ry={30 + offset} fill="none" stroke="white" strokeWidth="0.3" opacity={0.08 + i * 0.02} />
                </g>
              )
            })}
            {/* Crossing paths */}
            <path d="M 75 55 Q 100 80 125 55" fill="none" stroke="white" strokeWidth="0.4" opacity="0.12" />
            <path d="M 75 145 Q 100 120 125 145" fill="none" stroke="white" strokeWidth="0.4" opacity="0.12" />
            {/* Center points — the attractors */}
            <circle cx="75" cy="100" r="2" fill="white" opacity="0.3" />
            <circle cx="125" cy="100" r="2" fill="white" opacity="0.3" />
            {/* Orbiting particles */}
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i / 8) * Math.PI * 2
              const lobe = i % 2 === 0 ? 75 : 125
              const r = 25 + (i % 3) * 8
              const x = lobe + Math.cos(angle) * r * 0.8
              const y = 100 + Math.sin(angle) * r
              return <circle key={`p${i}`} cx={x} cy={y} r="1.2" fill="white" opacity={0.4} />
            })}
          </svg>
        </div>
      )

    case 'reflection-map-44':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-36 h-36 opacity-30">
            {/* Network constellation of nodes and connections */}
            {/* Arc 1 cluster — top left */}
            <circle cx="55" cy="65" r="2" fill="white" opacity="0.3" />
            <circle cx="45" cy="80" r="2" fill="white" opacity="0.3" />
            <circle cx="65" cy="78" r="2" fill="white" opacity="0.3" />
            <circle cx="50" cy="55" r="1.5" fill="white" opacity="0.3" />
            <circle cx="70" cy="60" r="1.5" fill="white" opacity="0.3" />
            {/* Arc 2 cluster — top right */}
            <circle cx="140" cy="58" r="2" fill="white" opacity="0.4" />
            <circle cx="150" cy="72" r="2" fill="white" opacity="0.4" />
            <circle cx="130" cy="68" r="2" fill="white" opacity="0.4" />
            <circle cx="145" cy="48" r="1.5" fill="white" opacity="0.4" />
            {/* Arc 3 cluster — right */}
            <circle cx="155" cy="120" r="2.5" fill="white" opacity="0.55" />
            <circle cx="145" cy="132" r="2.5" fill="white" opacity="0.55" />
            <circle cx="160" cy="105" r="2" fill="white" opacity="0.55" />
            {/* Arc 4 cluster — bottom center */}
            <circle cx="100" cy="145" r="2.5" fill="white" opacity="0.7" />
            <circle cx="90" cy="155" r="2.5" fill="white" opacity="0.7" />
            <circle cx="110" cy="152" r="2.5" fill="white" opacity="0.7" />
            <circle cx="85" cy="140" r="2" fill="white" opacity="0.7" />
            <circle cx="115" cy="140" r="2" fill="white" opacity="0.7" />
            {/* Arc 5 cluster — bottom left */}
            <circle cx="50" cy="135" r="3" fill="white" opacity="0.9" />
            <circle cx="60" cy="148" r="3" fill="white" opacity="0.9" />
            <circle cx="40" cy="148" r="2.5" fill="white" opacity="0.9" />
            {/* Connections — thin lines */}
            <line x1="55" y1="65" x2="65" y2="78" stroke="white" strokeWidth="0.3" opacity="0.08" />
            <line x1="45" y1="80" x2="55" y2="65" stroke="white" strokeWidth="0.3" opacity="0.08" />
            <line x1="65" y1="78" x2="130" y2="68" stroke="white" strokeWidth="0.3" opacity="0.06" />
            <line x1="140" y1="58" x2="150" y2="72" stroke="white" strokeWidth="0.3" opacity="0.08" />
            <line x1="150" y1="72" x2="155" y2="120" stroke="white" strokeWidth="0.3" opacity="0.06" />
            <line x1="155" y1="120" x2="110" y2="152" stroke="white" strokeWidth="0.3" opacity="0.06" />
            <line x1="100" y1="145" x2="60" y2="148" stroke="white" strokeWidth="0.3" opacity="0.06" />
            <line x1="50" y1="135" x2="85" y2="140" stroke="white" strokeWidth="0.3" opacity="0.06" />
            <line x1="45" y1="80" x2="50" y2="135" stroke="white" strokeWidth="0.3" opacity="0.05" />
            <line x1="70" y1="60" x2="140" y2="58" stroke="white" strokeWidth="0.3" opacity="0.05" />
          </svg>
        </div>
      )

    case 'interference-patterns-43':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-36 h-36 opacity-30">
            {/* Two wave sources with concentric rings and interference zones */}
            {Array.from({ length: 6 }, (_, i) => (
              <circle
                key={`a${i}`}
                cx="70"
                cy="100"
                r={12 + i * 15}
                fill="none"
                stroke="white"
                strokeWidth="0.6"
                opacity={0.25 - i * 0.03}
              />
            ))}
            {Array.from({ length: 6 }, (_, i) => (
              <circle
                key={`b${i}`}
                cx="130"
                cy="100"
                r={12 + i * 15}
                fill="none"
                stroke="white"
                strokeWidth="0.6"
                opacity={0.25 - i * 0.03}
              />
            ))}
            <circle cx="70" cy="100" r="3" fill="white" opacity="0.5" />
            <circle cx="130" cy="100" r="3" fill="white" opacity="0.5" />
          </svg>
        </div>
      )

    case 'voronoi-41':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-32 h-32 opacity-30">
            {/* Voronoi-style territory boundaries */}
            {Array.from({ length: 12 }, (_, i) => {
              const x = 30 + (i * 47) % 140
              const y = 30 + (i * 61) % 140
              return (
                <circle key={`p${i}`} cx={x} cy={y} r="2" fill="white" opacity={0.25} />
              )
            })}
            <line x1="40" y1="20" x2="40" y2="180" stroke="white" strokeWidth="0.4" opacity="0.15" />
            <line x1="95" y1="10" x2="80" y2="190" stroke="white" strokeWidth="0.4" opacity="0.15" />
            <line x1="140" y1="25" x2="155" y2="175" stroke="white" strokeWidth="0.4" opacity="0.15" />
            <line x1="20" y1="70" x2="180" y2="65" stroke="white" strokeWidth="0.4" opacity="0.12" />
            <line x1="15" y1="130" x2="185" y2="140" stroke="white" strokeWidth="0.4" opacity="0.12" />
            <line x1="60" y1="40" x2="120" y2="100" stroke="white" strokeWidth="0.3" opacity="0.1" />
            <line x1="130" y1="60" x2="70" y2="160" stroke="white" strokeWidth="0.3" opacity="0.1" />
          </svg>
        </div>
      )

    case 'l-system-40':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-36 h-36 opacity-35">
            {/* Stylized L-system tree preview */}
            <line x1="100" y1="180" x2="100" y2="130" stroke="white" strokeWidth="1.2" opacity="0.5" />
            <line x1="100" y1="130" x2="75" y2="100" stroke="white" strokeWidth="0.9" opacity="0.45" />
            <line x1="100" y1="130" x2="125" y2="100" stroke="white" strokeWidth="0.9" opacity="0.45" />
            <line x1="75" y1="100" x2="60" y2="78" stroke="white" strokeWidth="0.6" opacity="0.35" />
            <line x1="75" y1="100" x2="85" y2="75" stroke="white" strokeWidth="0.6" opacity="0.35" />
            <line x1="125" y1="100" x2="115" y2="75" stroke="white" strokeWidth="0.6" opacity="0.35" />
            <line x1="125" y1="100" x2="140" y2="78" stroke="white" strokeWidth="0.6" opacity="0.35" />
            <line x1="60" y1="78" x2="50" y2="62" stroke="white" strokeWidth="0.4" opacity="0.25" />
            <line x1="60" y1="78" x2="66" y2="60" stroke="white" strokeWidth="0.4" opacity="0.25" />
            <line x1="85" y1="75" x2="78" y2="58" stroke="white" strokeWidth="0.4" opacity="0.25" />
            <line x1="85" y1="75" x2="92" y2="56" stroke="white" strokeWidth="0.4" opacity="0.25" />
            <line x1="115" y1="75" x2="108" y2="56" stroke="white" strokeWidth="0.4" opacity="0.25" />
            <line x1="115" y1="75" x2="122" y2="58" stroke="white" strokeWidth="0.4" opacity="0.25" />
            <line x1="140" y1="78" x2="134" y2="60" stroke="white" strokeWidth="0.4" opacity="0.25" />
            <line x1="140" y1="78" x2="150" y2="62" stroke="white" strokeWidth="0.4" opacity="0.25" />
          </svg>
        </div>
      )

    case 'morphogenesis-39':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-32 h-32 opacity-30">
            {/* Organic blob shapes suggesting reaction-diffusion patterns */}
            {Array.from({ length: 8 }, (_, i) => {
              const cx = 60 + (i * 23) % 80
              const cy = 60 + (i * 37) % 80
              const r = 8 + (i % 3) * 6
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="white"
                  opacity={0.08 + (i % 4) * 0.04}
                />
              )
            })}
            {Array.from({ length: 12 }, (_, i) => {
              const cx = 40 + (i * 31) % 120
              const cy = 40 + (i * 43) % 120
              return (
                <circle
                  key={`s${i}`}
                  cx={cx}
                  cy={cy}
                  r={3 + (i % 2) * 2}
                  fill="white"
                  opacity={0.05 + (i % 5) * 0.03}
                />
              )
            })}
          </svg>
        </div>
      )

    case 'accumulation-37':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-32 h-32 opacity-40">
            {Array.from({ length: 15 }, (_, i) => {
              const r = 12 + i * 5.5
              const opacity = 0.08 + (i / 15) * 0.25
              return (
                <circle
                  key={i}
                  cx="100"
                  cy="100"
                  r={r}
                  fill="none"
                  stroke="white"
                  strokeWidth={i === 14 ? '1' : '0.4'}
                  opacity={opacity}
                />
              )
            })}
            {Array.from({ length: 30 }, (_, i) => {
              const ring = Math.floor(i / 2)
              const r = 12 + ring * 5.5
              const angle = (i * 2.4) + ring * 0.5
              const x = 100 + Math.cos(angle) * r
              const y = 100 + Math.sin(angle) * r
              return (
                <circle key={`d${i}`} cx={x} cy={y} r="1" fill="white" opacity={0.3} />
              )
            })}
          </svg>
        </div>
      )

    case 'daily-mark-36':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-32 h-32 opacity-40">
            {Array.from({ length: 12 }, (_, i) => {
              const r = 20 + i * 6
              const opacity = 0.1 + (i / 12) * 0.3
              return (
                <circle
                  key={i}
                  cx="100"
                  cy="100"
                  r={r}
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                  opacity={opacity}
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s`, animationDuration: '4s' }}
                />
              )
            })}
          </svg>
        </div>
      )

    case 'emergence':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl font-serif font-light text-white/5">Emergence</div>
        </div>
      )

    case 'resonance-38':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-32 h-32 opacity-30">
            {Array.from({ length: 5 }, (_, i) => (
              <circle
                key={`a${i}`}
                cx="70"
                cy="90"
                r={15 + i * 18}
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                opacity={0.3 - i * 0.05}
              />
            ))}
            {Array.from({ length: 4 }, (_, i) => (
              <circle
                key={`b${i}`}
                cx="130"
                cy="110"
                r={12 + i * 18}
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                opacity={0.25 - i * 0.05}
              />
            ))}
          </svg>
        </div>
      )

    case 'particle-field':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-32 h-32 opacity-30">
            {Array.from({ length: 20 }, (_, i) => {
              const x = 40 + (i * 37) % 120
              const y = 40 + (i * 53) % 120
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="white"
                  opacity={0.2 + (i % 5) * 0.1}
                />
              )
            })}
          </svg>
        </div>
      )

    case 'collaborative-canvas':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-32 h-32 opacity-30">
            {Array.from({ length: 15 }, (_, i) => {
              const x = 30 + (i * 43) % 140
              const y = 30 + (i * 61) % 140
              const r = 2 + (i % 3)
              return (
                <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={0.15 + (i % 4) * 0.05} />
              )
            })}
          </svg>
        </div>
      )

    case 'generated-verse':
      return (
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <div className="text-center">
            <div className="h-[2px] w-16 bg-white/10 mx-auto mb-3" />
            <div className="h-[2px] w-24 bg-white/10 mx-auto mb-3" />
            <div className="h-[2px] w-12 bg-white/10 mx-auto mb-3" />
            <div className="h-[2px] w-20 bg-white/10 mx-auto" />
          </div>
        </div>
      )

    case 'cellular-automata-42':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-32 h-32 opacity-30">
            {/* Grid of cells — some alive, some dead */}
            {Array.from({ length: 64 }, (_, i) => {
              const col = i % 8
              const row = Math.floor(i / 8)
              const alive = [2, 5, 9, 10, 11, 14, 17, 18, 22, 25, 26, 30, 33, 37, 38, 41, 42, 45, 49, 50, 53, 54, 58, 61].includes(i)
              return alive ? (
                <rect
                  key={i}
                  x={50 + col * 13}
                  y={50 + row * 13}
                  width="10"
                  height="10"
                  fill="white"
                  opacity={0.2}
                  rx="1"
                />
              ) : null
            })}
          </svg>
        </div>
      )

    case 'phase-space-46':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-36 h-36 opacity-30">
            {/* Trajectory path through multi-dimensional space */}
            <path
              d="M 30 160 Q 50 140 60 110 Q 70 80 90 75 Q 110 70 120 55 Q 130 40 145 50 Q 160 60 165 80 Q 170 100 160 120 Q 150 140 170 150"
              fill="none"
              stroke="white"
              strokeWidth="0.8"
              opacity="0.25"
            />
            {/* Dots along the trajectory */}
            {[
              [30, 160], [45, 135], [60, 110], [75, 82], [90, 75],
              [105, 68], [120, 55], [135, 45], [145, 50], [155, 65],
              [165, 80], [168, 100], [162, 118], [155, 135], [170, 150],
            ].map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={1 + (i / 14) * 1.5}
                fill="white"
                opacity={0.15 + (i / 14) * 0.35}
              />
            ))}
            {/* Axis lines — faint grid suggesting dimensions */}
            <line x1="20" y1="180" x2="20" y2="30" stroke="white" strokeWidth="0.3" opacity="0.08" />
            <line x1="20" y1="180" x2="185" y2="180" stroke="white" strokeWidth="0.3" opacity="0.08" />
            <line x1="20" y1="180" x2="50" y2="155" stroke="white" strokeWidth="0.3" opacity="0.06" />
            {/* Connecting segments from dots to show movement */}
            {[
              [30, 160, 45, 135], [60, 110, 75, 82], [90, 75, 105, 68],
              [120, 55, 135, 45], [155, 65, 165, 80], [162, 118, 155, 135],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={`s${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="0.3" opacity="0.1" />
            ))}
          </svg>
        </div>
      )

    case 'connections-47':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-36 h-36 opacity-30">
            {/* Network of nodes with connecting lines */}
            {/* Central hub */}
            <circle cx="100" cy="100" r="3" fill="white" opacity="0.5" />
            {/* Inner ring of nodes */}
            {[
              [70, 75], [130, 75], [60, 115], [140, 115], [85, 140], [115, 140],
            ].map(([x, y], i) => (
              <circle key={`n${i}`} cx={x} cy={y} r="2.5" fill="white" opacity={0.35} />
            ))}
            {/* Outer ring of nodes */}
            {[
              [45, 55], [155, 55], [35, 100], [165, 100],
              [50, 150], [150, 150], [100, 45], [100, 160],
            ].map(([x, y], i) => (
              <circle key={`o${i}`} cx={x} cy={y} r="1.8" fill="white" opacity={0.2} />
            ))}
            {/* Connections from center to inner */}
            {[
              [100, 100, 70, 75], [100, 100, 130, 75], [100, 100, 60, 115],
              [100, 100, 140, 115], [100, 100, 85, 140], [100, 100, 115, 140],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={`ci${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="0.5" opacity="0.12" />
            ))}
            {/* Connections from inner to outer */}
            {[
              [70, 75, 45, 55], [70, 75, 100, 45], [130, 75, 155, 55], [130, 75, 100, 45],
              [60, 115, 35, 100], [60, 115, 50, 150], [140, 115, 165, 100], [140, 115, 150, 150],
              [85, 140, 50, 150], [85, 140, 100, 160], [115, 140, 150, 150], [115, 140, 100, 160],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={`co${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="0.3" opacity="0.08" />
            ))}
            {/* Cross connections between inner nodes */}
            {[
              [70, 75, 130, 75], [60, 115, 85, 140], [140, 115, 115, 140],
              [70, 75, 60, 115], [130, 75, 140, 115],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={`cc${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="0.3" opacity="0.06" />
            ))}
          </svg>
        </div>
      )

    case 'five-hundred-50':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-36 h-36 opacity-35">
            {/* Five gravitational centers — one per arc */}
            {[
              [60, 60], [140, 55], [160, 120], [100, 160], [45, 130],
            ].map(([cx, cy], i) => (
              <g key={`arc${i}`}>
                <circle cx={cx} cy={cy} r="4" fill="white" opacity={0.1 + i * 0.06} />
                {/* Orbiting particles around each center */}
                {Array.from({ length: 8 }, (_, j) => {
                  const angle = (j / 8) * Math.PI * 2 + i * 0.3
                  const r = 15 + (j % 3) * 8
                  const px = cx + Math.cos(angle) * r
                  const py = cy + Math.sin(angle) * r
                  return (
                    <circle
                      key={`p${i}-${j}`}
                      cx={px}
                      cy={py}
                      r="1"
                      fill="white"
                      opacity={0.08 + i * 0.04 + j * 0.02}
                    />
                  )
                })}
              </g>
            ))}
            {/* Central convergence point */}
            <circle cx="100" cy="100" r="2" fill="white" opacity="0.4" />
          </svg>
        </div>
      )

    case 'synaesthesia-59':
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-36 h-36 opacity-30">
            {/* Two converging circles — visual meets audio */}
            <circle cx="85" cy="100" r="30" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
            <circle cx="115" cy="100" r="30" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
            {/* Center convergence point */}
            <circle cx="100" cy="100" r="3" fill="white" opacity="0.5" />
            {/* Harmonic rings */}
            <circle cx="100" cy="100" r="15" fill="none" stroke="white" strokeWidth="0.3" opacity="0.15" />
            <circle cx="100" cy="100" r="45" fill="none" stroke="white" strokeWidth="0.3" opacity="0.1" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="white" strokeWidth="0.3" opacity="0.05" />
            {/* Particles */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2
              const r = 35 + (i % 3) * 15
              return <circle key={i} cx={100 + Math.cos(angle) * r} cy={100 + Math.sin(angle) * r} r="1.5" fill="white" opacity={0.1 + (i % 4) * 0.05} />
            })}
          </svg>
        </div>
      )
    default:
      return null
  }
}
