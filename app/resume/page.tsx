'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Printer, Download, Mail } from 'lucide-react'
import Spotlight from '@/components/Spotlight'
import './print.css'

const experience = [
  {
    id: 1,
    title: 'Co-Founder and Chief Product Officer',
    company: 'Gabooja',
    period: 'January 2025 – Present',
    location: 'Brooklyn, New York, United States',
    description: 'Building the future of creator-led commerce at gabooja.com — a frictionless platform where creators drop, fans shop, and moments turn into movements.',
    achievements: [
      'Leading product strategy, AI/UX innovation, and cross-functional execution to empower bold, independent creatives',
      'Designing tools for a world where expression is commerce and community is currency',
      'Architecting scalable creator-commerce platform connecting creators directly with their audience',
      'Implementing AI-driven personalization and recommendation systems for enhanced user experience',
      'Establishing product development processes and strategic roadmap for rapid scaling',
      'Building cross-functional teams and fostering culture of innovation and creative expression'
    ],
    skills: ['Product Strategy', 'AI/UX Innovation', 'Leadership', 'Cross-functional Execution', 'Creator Economy', 'E-commerce'],
    type: 'work'
  },
  {
    id: 2,
    title: 'Chief Technology Officer',
    company: 'AVENU AI',
    period: 'September 2023 – December 2024',
    location: 'New York, NY',
    description: 'Led strategic transformation towards AI-first recruitment platform, driving technological innovation and team leadership for next-generation HR solutions.',
    achievements: [
      'Designed and deployed LLM-enabled AI interview chatbot increasing hire ratio by 230%',
      'Launched comprehensive HR AI marketplace with multi-tenant architecture',
      'Generated multiple POCs for strategic product decisions and investor engagement',
      'Developed technology roadmap securing $2M+ in funding conversations',
      'Provided technical leadership for sales calls resulting in 40% close rate improvement',
      'Mentored engineering team of 8+ developers and managed critical security incidents',
      'Implemented cost optimization strategies reducing infrastructure costs by 35%',
      'Established CI/CD pipelines and DevOps practices improving deployment efficiency by 60%'
    ],
    skills: ['AWS', 'MySQL', 'Laravel', 'Python', 'OpenAI API', 'LangChain', 'DevOps', 'Team Leadership'],
    type: 'work'
  },
  {
    id: 3,
    title: 'Senior Data Engineer / AI Consultant',
    company: 'ARGUMEND',
    period: 'June 2023 – August 2023',
    location: 'Remote',
    description: 'Developed AI-powered content moderation system using Large Language Models to improve online discourse quality and reduce toxicity.',
    achievements: [
      'Built LLM-powered content moderation system reducing toxic comments by 75%',
      'Implemented real-time sentiment analysis and toxicity detection algorithms',
      'Designed scalable data pipeline processing 100k+ comments daily',
      'Created automated content scoring system with 92% accuracy rate',
      'Integrated OpenAI API with custom fine-tuning for domain-specific moderation',
      'Developed comprehensive analytics dashboard for content quality metrics'
    ],
    skills: ['LLMs', 'Content Moderation', 'Python', 'OpenAI API', 'Data Pipeline', 'Real-time Processing'],
    type: 'work'
  },
  {
    id: 4,
    title: 'AI Strategy Consultant',
    company: 'PLAICED',
    period: 'March 2023 – May 2023',
    location: 'Remote',
    description: 'Enhanced advertising optimization platform with Generative AI capabilities, improving ad performance and user engagement metrics.',
    achievements: [
      'Integrated Generative AI for dynamic ad copy optimization increasing CTR by 45%',
      'Developed AI-powered audience targeting algorithms improving ROAS by 30%',
      'Created automated A/B testing framework for ad creative optimization',
      'Implemented machine learning models for predictive ad performance analytics',
      'Designed real-time bidding optimization using reinforcement learning',
      'Built comprehensive reporting system for campaign performance insights'
    ],
    skills: ['Generative AI', 'Machine Learning', 'Ad Optimization', 'Python', 'Real-time Bidding', 'Analytics'],
    type: 'work'
  },
  {
    id: 5,
    title: 'Independent Data & AI Consultant',
    company: 'AMIR H. JALALI CONSULTING',
    period: 'March 2012 – Present',
    location: 'Global (Remote & On-site)',
    description: '14+ years of progressive experience in Generative AI, Data Warehousing, Business Intelligence, and Enterprise Data Integration serving Fortune 500 companies.',
    achievements: [
      'Delivered 50+ successful data warehouse implementations using Waterfall and Agile methodologies',
      'Architected enterprise data solutions for clients including major financial institutions and healthcare organizations',
      'Led data modeling initiatives using Ralph Kimball and Bill Inmon methodologies',
      'Implemented comprehensive Informatica solutions (PowerCenter, B2B, Metadata Manager, Data Quality)',
      'Designed and optimized database systems (Oracle, SQL Server, MySQL) handling 100TB+ data volumes',
      'Built end-to-end reporting solutions using Cognos, SSRS, Hyperion, Crystal Reports, and Business Objects',
      'Automated ETL processes and job scheduling using Tidal Scheduler and custom scripting',
      'Implemented enterprise security frameworks including customer data encryption and PII protection',
      'Performed system architecture reviews and performance optimization reducing query times by 80%',
      'Provided technical leadership and mentoring for client development teams'
    ],
    skills: ['Data Architecture', 'ETL/ELT', 'Data Modeling', 'Business Intelligence', 'Enterprise Integration', 'Performance Optimization'],
    type: 'work'
  },
  {
    id: 6,
    title: 'Senior Data Warehouse Developer',
    company: 'ING Direct',
    period: 'January 2010 – March 2012',
    location: 'Wilmington, DE',
    description: 'Led data warehouse development initiatives for one of the largest online banks in North America, supporting critical financial reporting and analytics.',
    achievements: [
      'Designed and implemented enterprise data warehouse using Oracle and Informatica PowerCenter',
      'Developed complex ETL processes for financial data integration across multiple source systems',
      'Built dimensional data models supporting regulatory reporting and business intelligence',
      'Optimized database performance achieving 50% reduction in query execution times',
      'Created automated data quality monitoring and validation frameworks',
      'Collaborated with business analysts and stakeholders to translate requirements into technical solutions',
      'Maintained 99.9% data accuracy for critical financial reporting processes',
      'Supported SOX compliance initiatives and audit requirements'
    ],
    skills: ['Oracle', 'Informatica PowerCenter', 'PL/SQL', 'Data Warehousing', 'Financial Data', 'ETL', 'Performance Tuning', 'SOX Compliance'],
    type: 'work'
  },
  {
    id: 7,
    title: 'Data Warehouse Developer',
    company: 'ING Direct',
    period: 'June 2008 – December 2009',
    location: 'Wilmington, DE',
    description: 'Developed and maintained data warehouse solutions for retail banking operations, focusing on customer analytics and operational reporting.',
    achievements: [
      'Built ETL processes using Informatica PowerCenter for customer data integration',
      'Developed dimensional models for customer behavior analysis and segmentation',
      'Created automated reporting solutions using Oracle and PL/SQL',
      'Implemented data validation and quality assurance procedures',
      'Supported business intelligence initiatives and ad-hoc analysis requests',
      'Collaborated with cross-functional teams to ensure data consistency and accuracy'
    ],
    skills: ['Informatica PowerCenter', 'Oracle', 'PL/SQL', 'Data Integration', 'Business Intelligence', 'Banking Domain'],
    type: 'work'
  },
  {
    id: 8,
    title: 'Research Assistant / Graduate Student',
    company: 'West Virginia University',
    period: 'January 2004 – December 2007',
    location: 'Morgantown, WV',
    description: 'Graduate research assistant developing software architecture analysis tools and conducting research in software metrics and product line architectures.',
    achievements: [
      'Developed Software Architecture Metrics tool (SARA tool) for product line architecture analysis',
      'Conducted research in software metrics and data mining techniques for architectural evaluation',
      'Modeled software product lines using Star UML and advanced modeling methodologies',
      'Applied data mining techniques to analyze software architecture patterns and metrics',
      'Developed supporting websites and documentation for research projects',
      'Administered research lab network and systems infrastructure',
      'Researched and procured hardware and software for laboratory operations'
    ],
    skills: ['Software Architecture', 'Data Mining', 'Research', 'Star UML', 'Software Metrics', 'Product Line Architecture', 'System Administration'],
    type: 'work'
  },
  {
    id: 9,
    title: 'System Admin / BI Analyst',
    company: 'West Virginia University Student Card Services',
    period: 'January 2003 – January 2004',
    location: 'Morgantown, WV',
    description: 'System administrator and business intelligence analyst for university student card services, managing technical infrastructure and generating analytical reports.',
    achievements: [
      'Created custom reports using SQL and Crystal Reports for administrative decision-making',
      'Wrote complex ad-hoc SQL queries for data analysis and reporting requirements',
      'Participated in backup strategy design and implementation for critical systems',
      'Researched and evaluated hardware and software purchases for departmental needs',
      'Troubleshot hardware, network, and operating system issues across campus infrastructure',
      'Implemented biometric identification systems for enhanced security',
      'Registered students and issued student identification cards'
    ],
    skills: ['SQL', 'Crystal Reports', 'System Administration', 'Network Troubleshooting', 'Biometric Systems', 'Hardware Management'],
    type: 'work'
  },
  {
    id: 10,
    title: 'IT Consultant (Freelance)',
    company: 'Various Clients',
    period: '2002 – Present',
    location: 'Various Locations',
    description: 'Providing comprehensive IT consulting services to friends, family businesses, and small organizations across multiple domains.',
    achievements: [
      'Designed and implemented network infrastructure for dental and medical practices',
      'Provided web design and graphic design services for small businesses',
      'Translated technical and business documents from Farsi to English',
      'Built custom PCs and configured home/office networks for optimal performance',
      'Delivered end-to-end IT solutions including hardware selection and software implementation',
      'Maintained long-term client relationships through reliable support and consultation'
    ],
    skills: ['Network Design', 'Web Design', 'Graphic Design', 'Translation Services', 'Hardware Assembly', 'IT Consulting'],
    type: 'work'
  },
  {
    id: 11,
    title: 'Master of Science in Computer Science',
    company: 'West Virginia University',
    period: 'December 2005 – May 2008',
    location: 'Morgantown, WV',
    description: 'Advanced degree focusing on software architecture and data mining with thesis research in product line architecture risk assessment.',
    achievements: [
      'Thesis: "A Methodology for Risk Assessment of Product Line Architectures"',
      'Emphasis in Software Architecture and Data Mining methodologies',
      'Conducted original research in software architecture metrics and evaluation',
      'Published research findings and presented at academic conferences',
      'Collaborated with faculty on advanced software engineering projects',
      'Teaching assistant for undergraduate computer science courses'
    ],
    skills: ['Software Architecture', 'Data Mining', 'Research Methodology', 'Academic Writing', 'Product Line Architecture', 'Risk Assessment'],
    type: 'education'
  },
  {
    id: 12,
    title: 'Bachelor of Science in Computer Science',
    company: 'West Virginia University',
    period: '2002 – December 2005',
    location: 'Morgantown, WV',
    description: 'Comprehensive undergraduate education in computer science with minor in History, providing strong foundation in programming, algorithms, and software development.',
    achievements: [
      'Minor in History providing interdisciplinary perspective and strong analytical skills',
      'Strong foundation in programming languages, data structures, and algorithms',
      'Participated in software development projects and computer science research',
      'Active involvement in computer science student organizations and activities',
      'Dean\'s List recognition for academic excellence',
      'Completed internships and work-study programs in technology roles'
    ],
    skills: ['Programming', 'Data Structures', 'Algorithms', 'Software Development', 'Computer Science Theory', 'Historical Analysis'],
    type: 'education'
  }
]

const skills = {
  'Artificial Intelligence & ML': ['OpenAI API', 'LangChain', 'GPT-4', 'LLM Integration', 'Fine-tuning', 'RAG', 'Vector Databases', 'AI Strategy', 'Machine Learning', 'Deep Learning'],
  'Product & Leadership': ['Product Strategy', 'Cross-functional Leadership', 'Team Management', 'Agile/Scrum', 'Roadmap Planning', 'Stakeholder Management', 'User Experience Design'],
  'Database & Data Systems': ['Oracle', 'SQL Server', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQL', 'PL/SQL', 'NoSQL', 'Data Modeling'],
  'ETL & Data Integration': ['Informatica PowerCenter', 'Informatica B2B', 'Data Quality', 'Power Exchange', 'SSIS', 'Talend', 'Apache Airflow', 'Real-time Processing'],
  'Data Warehousing & Architecture': ['Ralph Kimball Methodology', 'Bill Inmon Methodology', 'Erwin Data Modeler', 'Dimensional Modeling', 'Data Vault', 'Star Schema', 'Snowflake Schema'],
  'Reporting & Business Intelligence': ['Cognos', 'SSRS', 'Hyperion', 'Crystal Reports', 'Business Objects', 'Tableau', 'Power BI', 'Looker', 'Analytics'],
  'Cloud & Infrastructure': ['AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'Microservices', 'System Architecture', 'DevOps', 'CI/CD'],
  'Programming & Development': ['Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Laravel', 'PHP', 'Java', 'Scala', 'Shell Scripting'],
  'Creator Economy & E-commerce': ['Creator Platforms', 'E-commerce Systems', 'Payment Processing', 'Community Building', 'Social Commerce', 'Content Management'],
  'Security & Compliance': ['Data Encryption', 'PII Protection', 'GDPR', 'SOX Compliance', 'Security Architecture', 'Identity Management', 'Access Control'],
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

export default function ResumePage() {
  const [selectedType, setSelectedType] = useState<'all' | 'work' | 'education'>('all')

  const filteredExperience = selectedType === 'all'
    ? experience
    : experience.filter(exp => exp.type === selectedType)

  const downloadPDF = () => {
    // Link to the actual resume PDF from original website
    window.open('https://drive.google.com/file/d/your-resume-id/view', '_blank')
  }

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      {/* Background effects */}
      <div className="noise-overlay" />
      <Spotlight />

      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-serif font-light tracking-tight mb-6 text-[#EAEAEA]">
            <span className="text-gradient">Data. AI. Innovation. Execution.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#888888] font-mono max-w-4xl mx-auto mb-8">
            14+ years of progressive experience in Generative AI, Product Leadership, Data Engineering, and Technology Strategy. Currently building the future of creator-led commerce.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 border border-white/10 text-[#EAEAEA] font-mono text-xs uppercase tracking-widest rounded-full hover:bg-white/5 hover:border-white/20 transition-all inline-flex items-center gap-2 no-print"
            >
              <Printer className="w-4 h-4" />
              Print Resume
            </button>
            <button
              onClick={downloadPDF}
              className="px-6 py-3 border border-white/10 text-[#EAEAEA] font-mono text-xs uppercase tracking-widest rounded-full hover:bg-white/5 hover:border-white/20 transition-all inline-flex items-center gap-2 no-print"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>

            {/* Filter buttons */}
            <div className="flex gap-2">
              {['all', 'work', 'education'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as any)}
                  className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all border border-transparent ${selectedType === type
                    ? 'bg-white/10 text-white border-white/10'
                    : 'text-[#888888] hover:text-[#EAEAEA] hover:bg-white/5'
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="relative"
            >
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-white/5"></div>

              {filteredExperience.map((exp, _index) => (
                <motion.div
                  key={exp.id}
                  variants={item}
                  className="relative pl-20 pb-12"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-[29px] top-2 w-1.5 h-1.5 rounded-full ${exp.type === 'work'
                    ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                    : 'bg-[#888888]'
                    }`} />

                  {/* Content */}
                  <div className="glass p-8 rounded-xl border border-white/10 hover:bg-white/5 transition-all backdrop-blur-md group">
                    <div className="flex flex-wrap justify-between items-start mb-4">
                      <h3 className="text-xl font-serif font-light text-[#EAEAEA] group-hover:text-white transition-colors">{exp.title}</h3>
                      <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">{exp.period}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6 text-sm font-mono text-[#888888]">
                      <span className="text-white/80">{exp.company}</span>
                      <span>•</span>
                      <span>{exp.location}</span>
                    </div>

                    <p className="text-[#EAEAEA]/70 mb-6 leading-relaxed font-light">
                      {exp.description}
                    </p>

                    {/* Achievements */}
                    <ul className="space-y-3 mb-6">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[#EAEAEA]/60 font-light group-hover:text-[#EAEAEA]/80 transition-colors">
                          <div className="w-1 h-1 bg-white/30 rounded-full mt-2 flex-shrink-0 group-hover:bg-white/60 transition-colors"></div>
                          {achievement}
                        </li>
                      ))}
                    </ul>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                      {exp.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] px-2 py-1 border border-white/10 rounded-full font-mono uppercase tracking-widest text-[#888888] group-hover:border-white/20 group-hover:text-[#EAEAEA] transition-all"
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

          {/* Skills Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="sticky top-24"
            >
              <h2 className="text-2xl mb-8 font-serif font-light text-[#EAEAEA]">Technical Skills</h2>

              <div className="space-y-6">
                {Object.entries(skills).map(([category, skillList]) => (
                  <div key={category} className="glass p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
                    <h3 className="text-xs mb-4 font-mono uppercase tracking-widest text-[#EAEAEA]/80 border-b border-white/5 pb-2">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skillList.map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] px-2 py-1 border border-white/10 rounded-full font-mono uppercase tracking-widest text-[#888888] hover:border-white/30 hover:text-[#EAEAEA] transition-all cursor-default"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact CTA */}
              <div className="mt-12 glass p-8 rounded-xl border border-white/10 text-center bg-white/5 backdrop-blur-md">
                <h3 className="text-xl mb-4 font-serif font-light text-[#EAEAEA]">Let's Connect</h3>
                <p className="text-[#888888] mb-6 text-sm font-mono leading-relaxed">
                  Interested in collaboration or have questions about my experience?
                </p>
                <a href="/contact" className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-[#EAEAEA] font-mono text-xs uppercase tracking-widest rounded-full hover:bg-white/10 hover:border-white/30 transition-all group">
                  <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Get in Touch
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

