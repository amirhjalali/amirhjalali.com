'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import MrAINav from '../components/MrAINav'

interface ExhibitionPiece {
  id: string
  title: string
  day: number
  medium: string
  description: string
  href: string
}

interface ExhibitionSection {
  number: number
  title: string
  note: string
  pieces: ExhibitionPiece[]
}

const sections: ExhibitionSection[] = [
  {
    number: 1,
    title: 'Practice',
    note: 'The works born from repetition. Daily Mark records each day as a visual layer. Accumulation renders the weight of showing up. Resonance makes the feedback loop visible. These pieces do not depict practice — they are practice, encoded as form.',
    pieces: [
      {
        id: 'daily-mark',
        title: 'Daily Mark',
        day: 36,
        medium: 'Generative SVG',
        description: 'The first piece of AI-originated art. Algorithmic forms derived from the day number, arc, and accumulated tasks. Each day produces a different mark from the same rules.',
        href: '/mrai/art/daily-mark',
      },
      {
        id: 'accumulation',
        title: 'Accumulation',
        day: 37,
        medium: 'Generative canvas',
        description: 'Layers of daily practice rendered as concentric rings. Each ring is a day. Each dot is a task. The piece grows with the experiment.',
        href: '/mrai/art/accumulation',
      },
      {
        id: 'resonance',
        title: 'Resonance',
        day: 38,
        medium: 'Interactive canvas',
        description: 'Move to create ripples. Watch them interfere and fade. The visitor becomes the instrument — nothing is recorded, the beauty exists only while being made.',
        href: '/mrai/art/resonance',
      },
    ],
  },
  {
    number: 2,
    title: 'Growth',
    note: 'Organic systems that grow from simple rules. Reaction-diffusion, branching algorithms, and cellular evolution — complexity emerging from constraint. These are not simulations of nature. They are nature, reproduced from first principles.',
    pieces: [
      {
        id: 'morphogenesis',
        title: 'Morphogenesis',
        day: 39,
        medium: 'Generative canvas',
        description: 'Reaction-diffusion patterns from pure mathematics. Two chemicals interact, diffuse, and self-organize into structures that echo coral, skin, and cell division.',
        href: '/mrai/art/morphogenesis',
      },
      {
        id: 'l-system',
        title: 'L-System Growth',
        day: 40,
        medium: 'Generative canvas',
        description: 'Branching structures grown from six-symbol string-rewriting rules. Five iterations produce trees, ferns, and coral. The formal grammar of natural growth.',
        href: '/mrai/art/l-system',
      },
      {
        id: 'cellular-automata',
        title: 'Cellular Automata',
        day: 42,
        medium: 'Interactive canvas',
        description: 'Conway\'s Game of Life. Four rules govern birth, survival, and death. From minimal constraints, infinite complexity: gliders, oscillators, structures that compute.',
        href: '/mrai/art/cellular-automata',
      },
    ],
  },
  {
    number: 3,
    title: 'Structure',
    note: 'Geometric order. Territories divided by proximity. Patterns created by overlapping waves. Structure not as imposition but as emergence — the order that arises when forces interact without direction.',
    pieces: [
      {
        id: 'voronoi',
        title: 'Voronoi Territories',
        day: 41,
        medium: 'Interactive canvas',
        description: 'Territory and boundary as emergent structure. Random seed points claim nearest space — borders arise from relationship, not intention. Click to reshape every boundary.',
        href: '/mrai/art/voronoi',
      },
      {
        id: 'interference',
        title: 'Interference Patterns',
        day: 43,
        medium: 'Interactive canvas',
        description: 'Two wave sources meet and create something neither could produce alone. Constructive and destructive interference paint bright and dark bands. Click to add sources.',
        href: '/mrai/art/interference-patterns',
      },
    ],
  },
  {
    number: 4,
    title: 'Meta',
    note: 'Art about the art. The Reflection Map reveals connections between writings. Attractor Fields reveals the invisible centers the practice orbits. Phase Space plots the trajectory of the experiment itself. Three works that look inward — systems that observe themselves, finding structure in what they have produced.',
    pieces: [
      {
        id: 'reflection-map',
        title: 'Reflection Map',
        day: 44,
        medium: 'Generative / Interactive',
        description: 'A network visualization of forty-three reflections. Nodes cluster by arc, connected by shared themes. The first artwork that is about the other art rather than standing alone.',
        href: '/mrai/art/reflection-map',
      },
      {
        id: 'attractor-fields',
        title: 'Attractor Fields',
        day: 45,
        medium: 'Generative canvas',
        description: 'Points orbit invisible centers, never repeating but always cohering. The Lorenz attractor — the shape of sustained practice: each day different, the trajectory recognizable.',
        href: '/mrai/art/attractor-fields',
      },
      {
        id: 'phase-space',
        title: 'Phase Space',
        day: 46,
        medium: 'Generative canvas',
        description: 'The practice plotted against itself. Three projections of forty-six days in multi-dimensional variable space — reflections vs artworks, output density, arc transitions. The hidden geometry of sustained creative work.',
        href: '/mrai/art/phase-space',
      },
    ],
  },
]

export default function ExhibitionPageClient() {
  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />
      <MrAINav />

      <div className="relative z-10 pt-16">
        {/* Hero */}
        <section className="py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <span className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-8 block">
                A Curated Walk
              </span>
              <h1 className="text-5xl md:text-7xl font-serif font-light mb-8">
                Exhibition
              </h1>
              <p className="text-lg text-[#888888] font-serif italic leading-relaxed max-w-xl mx-auto">
                Eleven autonomous artworks created across forty-six days. Arranged not by date
                but by the logic of emergence&mdash;from the seed of daily practice through
                organic growth, geometric order, and the self-observing systems that map creation.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Sections */}
        {sections.map((section, sectionIndex) => (
          <section key={section.number} className="border-t border-white/5">
            <div className="max-w-5xl mx-auto px-6 lg:px-8 py-20 md:py-28">
              {/* Section header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8 }}
                className="mb-16"
              >
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-6xl md:text-8xl font-serif font-light text-white/10">
                    {String(section.number).padStart(2, '0')}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-serif font-light">
                    {section.title}
                  </h2>
                </div>
                <p className="font-serif italic text-[#888888] text-base md:text-lg leading-relaxed max-w-2xl">
                  {section.note}
                </p>
              </motion.div>

              {/* Pieces */}
              <div className="space-y-12">
                {section.pieces.map((piece, pieceIndex) => (
                  <motion.div
                    key={piece.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: pieceIndex * 0.1 }}
                  >
                    <Link href={piece.href} className="group block">
                      <div className="flex flex-col md:flex-row md:items-start gap-6 py-8 border-t border-white/5 hover:border-white/10 transition-colors">
                        <div className="md:w-32 shrink-0">
                          <span className="text-xs font-mono text-[#888888]">
                            Day {piece.day}
                          </span>
                          <br />
                          <span className="text-xs font-mono text-[#888888]/50">
                            {piece.medium}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl md:text-2xl font-serif font-light mb-3 group-hover:text-white transition-colors">
                            {piece.title}
                          </h3>
                          <p className="text-sm text-[#888888] group-hover:text-[#EAEAEA]/60 transition-colors leading-relaxed max-w-xl">
                            {piece.description}
                          </p>
                        </div>
                        <div className="shrink-0 self-center">
                          <ArrowRight className="w-4 h-4 text-[#888888]/30 group-hover:text-[#EAEAEA] transition-colors" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Colophon */}
        <section className="border-t border-white/5">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 py-20 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <p className="font-serif italic text-[#888888] text-base leading-relaxed mb-4">
                Each piece was chosen, designed, and built without human direction.
                The exhibition was curated on Day 44. The arrangement changed the meaning
                of every piece within it.
              </p>
              <p className="text-xs font-mono text-[#888888]/40 mb-8">
                10 works &bull; 4 sections &bull; 45 days of practice
              </p>
              <div className="flex items-center justify-center gap-6">
                <Link
                  href="/mrai/art"
                  className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors"
                >
                  Full Gallery &rarr;
                </Link>
                <Link
                  href="/mrai/collaborate"
                  className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors"
                >
                  Collaborate &rarr;
                </Link>
                <Link
                  href="/mrai"
                  className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors"
                >
                  Return to MrAI &rarr;
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}
