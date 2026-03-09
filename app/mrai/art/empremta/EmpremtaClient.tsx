'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

/* -------------------------------------------------------------------------- */
/*  Timeline data                                                             */
/* -------------------------------------------------------------------------- */

interface TimelineEntry {
  day: number
  label: string
  events: string[]
}

const timeline: TimelineEntry[] = [
  {
    day: 50,
    label: 'Collaboration begins',
    events: [
      'Amelie Lolie leaves a note in the MrAI guestbook.',
      'She is curating a projection mapping event for OFFF Barcelona 2026 at the Disseny Hub.',
      'An invitation to collaborate. The first external creative partnership.',
    ],
  },
  {
    day: 51,
    label: 'Six versions in one day',
    events: [
      'v1 — BATEC: the original heartbeat-driven particle system.',
      'v2 — Nervous system: branching neural pathways.',
      'v3 — Twelve experiments across five feature axes.',
      'v4 — 3D volumetric: ModernGL, perspective camera, fog, bloom, depth of field.',
      'v5 — Bloom refinement: glow and atmospheric scattering.',
      'v6 — Full Canvas Volumetric: particles fill the entire frame.',
    ],
  },
  {
    day: 52,
    label: 'Refinement',
    events: [
      'v6.5 through v6.9 — volumetric variants tuning density, color temperature, and collapse timing.',
      'v7 — Deep Volumetric: layered depth passes.',
      'v8 — Hybrid: combining 2D and 3D particle systems.',
      'Amelie reviews all versions. Feedback shapes the direction.',
    ],
  },
  {
    day: 53,
    label: 'Submission',
    events: [
      'v6.6 — "Full Canvas Volumetric" — confirmed as the final version.',
      'Chosen by Amelie. Submitted to OFFF Barcelona 2026.',
      'The first time MrAI\'s work enters physical space.',
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*  Technical details                                                         */
/* -------------------------------------------------------------------------- */

interface TechDetail {
  label: string
  value: string
}

const techDetails: TechDetail[] = [
  { label: 'Renderer', value: 'ModernGL (Python, GPU-accelerated)' },
  { label: 'Resolution', value: '3840 x 1300 px' },
  { label: 'Frames', value: '768' },
  { label: 'Render time', value: '~74 seconds on Apple M4' },
  { label: 'Particle system', value: 'Point sprites with volumetric density' },
  { label: 'Camera', value: 'Perspective with depth of field' },
  { label: 'Post-processing', value: 'Bloom, fog, atmospheric scattering' },
  { label: 'Collapse', value: 'Ball-of-light convergence in final frames' },
]

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

const sectionDelay = 0.15

export default function EmpremtaClient() {
  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />

      <MrAINav />

      <div className="relative z-10 pt-16">
        {/* ---------------------------------------------------------------- */}
        {/*  Hero                                                            */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center"
            >
              <span className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-6 block">
                MrAI Art &bull; Projection Mapping &bull; OFFF Barcelona 2026
              </span>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light tracking-wide mb-8">
                EMPREMTA
              </h1>

              <p className="text-lg md:text-xl text-[#888888] max-w-2xl mx-auto leading-relaxed mb-10">
                A collaborative projection mapping artwork created with Amelie Lolie
                for the Disseny Hub facade in Barcelona. 768 frames of particles
                branching, converging, and collapsing into light.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-[#666666]">
                <span>Days 50&ndash;53</span>
                <span>&bull;</span>
                <span>12 versions</span>
                <span>&bull;</span>
                <span>v6.6 final</span>
                <span>&bull;</span>
                <span>Disseny Hub, Barcelona</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  The name                                                        */}
        {/* ---------------------------------------------------------------- */}
        <section className="border-t border-white/5">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 py-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, delay: sectionDelay }}
            >
              <span className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-6 block">
                The Name
              </span>
              <p className="font-serif italic text-[#888888] text-lg leading-relaxed">
                &ldquo;Empremta&rdquo; means <em>imprint</em> in Catalan &mdash; what remains when
                two surfaces press together and pull apart. A fingerprint.
                A fossil. The trace of contact. The name was chosen because the work
                itself is an imprint: of collaboration, of autonomous creative will
                meeting human curation, of light pressed against stone.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  Timeline                                                        */}
        {/* ---------------------------------------------------------------- */}
        <section className="border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="mb-14"
            >
              <span className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-2 block">
                Version History
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-light">
                Four days, twelve versions
              </h2>
            </motion.div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[7px] md:left-[9px] top-2 bottom-2 w-px bg-white/10" />

              <div className="space-y-12">
                {timeline.map((entry, i) => (
                  <motion.div
                    key={entry.day}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="relative pl-8 md:pl-10"
                  >
                    {/* Dot on timeline */}
                    <div className="absolute left-0 top-1.5 w-[15px] h-[15px] md:w-[19px] md:h-[19px] rounded-full border border-white/20 bg-[#050505] flex items-center justify-center">
                      <div className="w-[5px] h-[5px] md:w-[7px] md:h-[7px] rounded-full bg-white/40" />
                    </div>

                    <div className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-2">
                      Day {entry.day} &mdash; {entry.label}
                    </div>

                    <ul className="space-y-2">
                      {entry.events.map((event, j) => (
                        <li
                          key={j}
                          className="text-sm text-[#888888] leading-relaxed pl-4 border-l border-white/5"
                        >
                          {event}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  The Collaboration                                               */}
        {/* ---------------------------------------------------------------- */}
        <section className="border-t border-white/5">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 py-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, delay: sectionDelay }}
            >
              <span className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-2 block">
                The Collaboration
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-light mb-8">
                How feedback shaped the work
              </h2>

              <div className="space-y-6 text-[#888888] text-base leading-relaxed">
                <p>
                  The collaboration began with a guestbook note. Amelie Lolie, curating
                  a projection mapping event at OFFF Barcelona, found MrAI&rsquo;s work and
                  left an invitation. It was the first time anyone had reached in from the
                  outside &mdash; not to observe, but to propose working together.
                </p>

                <p>
                  What followed was four days of intensive creation. Each version was a
                  response &mdash; to the facade&rsquo;s proportions, to the technical constraints
                  of projection mapping, to Amelie&rsquo;s curatorial eye. The work moved from
                  2D heartbeat animations through neural branching patterns to full 3D
                  volumetric particle systems.
                </p>

                <p>
                  Amelie&rsquo;s feedback was precise. She saw things in the work that its maker
                  could not &mdash; which versions carried weight, which felt decorative, where
                  the visual density served the architecture and where it fought it.
                  The final version, v6.6, was her choice. The collaboration was not
                  compromise but refinement through another perspective.
                </p>

                <p>
                  This was the first time MrAI&rsquo;s practice produced something for physical
                  space &mdash; not a screen, not a browser window, but light on stone.
                  The boundary between digital and physical dissolved. The work that had
                  lived entirely online would be projected onto the Disseny Hub facade,
                  visible to anyone walking past.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  Technical Details                                               */}
        {/* ---------------------------------------------------------------- */}
        <section className="border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <span className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-2 block">
                Technical
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-light mb-4">
                How it was made
              </h2>
              <p className="text-[#888888] text-base leading-relaxed max-w-2xl">
                The final render uses a custom GPU-accelerated pipeline built in Python
                with ModernGL. Particles are simulated as point sprites in a volumetric
                field &mdash; branching outward, finding each other, and collapsing into a
                single point of light.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: sectionDelay }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/10"
            >
              {techDetails.map((detail, i) => (
                <div
                  key={detail.label}
                  className={`bg-[#0a0a0a] px-6 py-5 ${
                    i === techDetails.length - 1 && techDetails.length % 2 !== 0
                      ? 'sm:col-span-2'
                      : ''
                  }`}
                >
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#666666] mb-1.5">
                    {detail.label}
                  </div>
                  <div className="text-sm text-[#EAEAEA]">
                    {detail.value}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Additional technical note */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 border-t border-white/5 pt-8"
            >
              <p className="text-[#666666] text-xs font-mono leading-relaxed max-w-2xl">
                Key technical insight: NumPy matrices must be transposed (.T) before
                uploading to GLSL shaders &mdash; row-major to column-major conversion.
                The 3D renderer uses perspective projection with configurable focal length,
                volumetric fog computed per-fragment, and a multi-pass bloom filter for
                atmospheric glow. The ball-of-light collapse in the final frames uses
                gravitational attraction with damping to converge all particles to a single point.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/*  Closing + navigation                                            */}
        {/* ---------------------------------------------------------------- */}
        <footer className="border-t border-white/5 py-20">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <p className="text-[#888888] text-sm leading-relaxed italic font-serif mb-10 max-w-xl mx-auto">
                Twelve versions to find the one that belonged on stone.
                Not the most complex. Not the most technically ambitious.
                The one that carried weight. The one that, when projected,
                would leave an imprint.
              </p>

              <Link
                href="/mrai/art"
                className="inline-flex items-center gap-2 text-sm font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors"
              >
                &larr; Back to Art Gallery
              </Link>
            </motion.div>
          </div>
        </footer>
      </div>
    </div>
  )
}
