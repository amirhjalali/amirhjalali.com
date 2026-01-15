'use client'

import { motion } from 'framer-motion'
import { Download, Mail, Github, Linkedin } from 'lucide-react'
import { MagneticWrapper } from '@/components/ui/magnetic-wrapper'
import './print.css'

const experience = [
  {
    id: 1,
    title: 'Co-Founder & CPO',
    company: 'Gabooja',
    period: '2025 – Present',
    description: 'Leading AI product strategy and building an agentic organization where AI agents handle core business functions alongside humans.',
    skills: ['AI Product', 'Agentic Systems', 'LLMs', 'Leadership'],
    type: 'work'
  },
  {
    id: 2,
    title: 'Chief Technology Officer',
    company: 'Avenu AI',
    period: '2023 – 2024',
    description: 'Led AI-first recruitment platform. Deployed LLM interview chatbot increasing hire ratio by 230%.',
    skills: ['LLMs', 'Python', 'AWS', 'Team Leadership'],
    type: 'work'
  },
  {
    id: 3,
    title: 'AI Consultant',
    company: 'Argumend / Plaiced',
    period: '2023',
    description: 'LLM-powered content moderation and generative AI for advertising optimization.',
    skills: ['OpenAI API', 'Content Moderation', 'Ad Tech'],
    type: 'work'
  },
  {
    id: 4,
    title: 'Senior Data Engineer',
    company: 'Equinox',
    period: '2012 – 2020',
    description: 'Enterprise data warehouse and BI solutions for the luxury fitness brand. Built analytics infrastructure supporting membership, operations, and marketing.',
    skills: ['Data Warehousing', 'Business Intelligence', 'ETL', 'Oracle'],
    type: 'work'
  },
  {
    id: 5,
    title: 'Senior Data Warehouse Developer',
    company: 'ING Direct',
    period: '2008 – 2012',
    description: 'Data warehouse development for one of North America\'s largest online banks. Financial reporting, SOX compliance.',
    skills: ['Oracle', 'Informatica', 'Financial Data', 'SOX'],
    type: 'work'
  },
  {
    id: 6,
    title: 'Independent Consultant',
    company: 'Data & AI',
    period: '2012 – Present',
    description: '14+ years delivering data warehouse implementations, BI solutions, and AI strategy for Fortune 500 companies.',
    skills: ['Data Architecture', 'ETL/ELT', 'Enterprise Integration'],
    type: 'work'
  },
  {
    id: 7,
    title: 'M.S. Computer Science',
    company: 'West Virginia University',
    period: '2008',
    description: 'Software Architecture & Data Mining. Thesis on product line architecture risk assessment.',
    skills: ['Software Architecture', 'Data Mining', 'Research'],
    type: 'education'
  },
  {
    id: 8,
    title: 'B.S. Computer Science',
    company: 'West Virginia University',
    period: '2005',
    description: 'Minor in History. Dean\'s List.',
    skills: ['CS Fundamentals', 'Algorithms'],
    type: 'education'
  }
]

const skills = {
  'AI & ML': ['LLMs', 'OpenAI', 'LangChain', 'RAG', 'Fine-tuning', 'Vector DBs'],
  'Data': ['Data Warehousing', 'ETL', 'Oracle', 'SQL Server', 'PostgreSQL', 'Data Modeling'],
  'Development': ['Python', 'TypeScript', 'React', 'Next.js', 'AWS', 'Docker'],
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
}

export default function AboutPageClient() {
  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />

      <div className="relative z-10 section-padding container-padding max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-page-title mb-8">About</h1>

          {/* Contact buttons with labels */}
          <div className="flex gap-6 justify-center flex-wrap">
            <MagneticWrapper magneticStrength={0.4}>
              <a
                href="https://github.com/amirhjalali"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 text-[#888888] hover:text-[#EAEAEA] transition-all group"
              >
                <span className="p-3 border border-white/10 rounded-full group-hover:bg-white/5 group-hover:border-white/20 transition-all">
                  <Github className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest">GitHub</span>
              </a>
            </MagneticWrapper>
            <MagneticWrapper magneticStrength={0.4}>
              <a
                href="https://linkedin.com/in/amirhjalali"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 text-[#888888] hover:text-[#EAEAEA] transition-all group"
              >
                <span className="p-3 border border-white/10 rounded-full group-hover:bg-white/5 group-hover:border-white/20 transition-all">
                  <Linkedin className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest">LinkedIn</span>
              </a>
            </MagneticWrapper>
            <MagneticWrapper magneticStrength={0.4}>
              <a
                href="mailto:amirhjalali@gmail.com"
                className="flex flex-col items-center gap-2 text-[#888888] hover:text-[#EAEAEA] transition-all group"
              >
                <span className="p-3 border border-white/10 rounded-full group-hover:bg-white/5 group-hover:border-white/20 transition-all">
                  <Mail className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest">Email</span>
              </a>
            </MagneticWrapper>
            <MagneticWrapper magneticStrength={0.4}>
              <a
                href="/AmirJalaliResume_04-01-2025.pdf"
                download="AmirJalaliResume_04-01-2025.pdf"
                className="flex flex-col items-center gap-2 text-[#888888] hover:text-[#EAEAEA] transition-all group no-print"
              >
                <span className="p-3 border border-white/10 rounded-full group-hover:bg-white/5 group-hover:border-white/20 transition-all">
                  <Download className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest">Resume</span>
              </a>
            </MagneticWrapper>
          </div>
        </motion.div>

        {/* Skills - Horizontal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(skills).map(([category, skillList]) => (
              skillList.map((skill) => (
                <span
                  key={skill}
                  className="text-[10px] px-3 py-1.5 border border-white/10 rounded-full font-mono uppercase tracking-widest text-[#888888] hover:border-white/20 hover:text-[#EAEAEA] transition-all cursor-default"
                >
                  {skill}
                </span>
              ))
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative"
        >
          <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5"></div>

          {experience.map((exp) => (
            <motion.div
              key={exp.id}
              variants={item}
              className="relative pl-12 pb-8"
            >
              <div className={`absolute left-[13px] top-1.5 w-1.5 h-1.5 rounded-full ${exp.type === 'work'
                ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                : 'bg-[#666666]'
                }`} />

              <div className="group">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-1">
                  <h2 className="text-base font-serif font-light text-[#EAEAEA] group-hover:text-white transition-colors">
                    {exp.title}
                  </h2>
                  <span className="text-xs font-mono text-[#666666]">
                    {exp.company} · {exp.period}
                  </span>
                </div>

                <p className="text-sm text-[#888888] leading-relaxed mb-2">
                  {exp.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {exp.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[9px] px-2 py-0.5 border border-white/5 rounded-full font-mono uppercase tracking-widest text-[#666666]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
