'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

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
    title: 'Bachelor of Science in Information Systems',
    company: 'Drexel University',
    period: '2004 – 2008',
    location: 'Philadelphia, PA',
    description: 'Comprehensive education in information systems, database management, and business technology with focus on enterprise systems and data management.',
    achievements: [
      'Graduated with concentration in Database Management and Business Intelligence',
      'Completed cooperative education program with hands-on industry experience',
      'Relevant coursework: Database Design, Systems Analysis, Data Structures, Business Intelligence',
      'Senior capstone project: Enterprise Data Warehouse Design for Financial Services',
      'Dean\'s List recognition for academic excellence',
      'Active member of Information Systems Student Association'
    ],
    skills: ['Database Design', 'Systems Analysis', 'Business Intelligence', 'Data Structures', 'Project Management', 'Academic Research'],
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
    <div className="min-h-screen relative">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
      
      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-space font-black mb-6">
            <span className="text-gradient">TransformING Data into OpportunitY WITH AI</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed mb-8">
14+ years of progressive experience in Generative AI, Product Leadership, Data Engineering, and Technology Strategy. Currently building the future of creator-led commerce.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={downloadPDF}
              className="px-6 py-3 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold rounded-full hover:scale-105 transition-transform inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
            
            {/* Filter buttons */}
            <div className="flex gap-2">
              {['all', 'work', 'education'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as any)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedType === type
                      ? 'bg-white/20 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
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
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-ai-green via-ai-blue to-transparent"></div>
              
              {filteredExperience.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  variants={item}
                  className="relative pl-20 pb-12"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-6 w-4 h-4 rounded-full border-2 ${
                    exp.type === 'work' 
                      ? 'bg-ai-green border-ai-green/50' 
                      : 'bg-ai-blue border-ai-blue/50'
                  }`}>
                    <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-current"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="glass p-6 rounded-2xl border border-white/10 hover:border-ai-green/30 transition-all">
                    <div className="flex flex-wrap justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-white">{exp.title}</h3>
                      <span className="text-sm text-gray-400">{exp.period}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-ai-green font-medium">{exp.company}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{exp.location}</span>
                    </div>
                    
                    <p className="text-gray-400 mb-4 leading-relaxed">
                      {exp.description}
                    </p>
                    
                    {/* Achievements */}
                    <ul className="space-y-2 mb-4">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <div className="w-1.5 h-1.5 bg-ai-green rounded-full mt-2 flex-shrink-0"></div>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                    
                    {/* Skills */}
                    <div className="flex flex-wrap gap-1">
                      {exp.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-2 py-1 bg-white/5 rounded-md text-gray-400"
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
              <h2 className="text-2xl font-bold mb-6">Technical Skills</h2>
              
              <div className="space-y-6">
                {Object.entries(skills).map(([category, skillList]) => (
                  <div key={category} className="glass p-4 rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold mb-3 text-ai-green">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skillList.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Contact CTA */}
              <div className="mt-8 glass p-6 rounded-xl border border-white/10 text-center">
                <h3 className="text-lg font-bold mb-3">Let's Connect</h3>
                <p className="text-gray-400 mb-4 text-sm">
                  Interested in collaboration or have questions about my experience?
                </p>
                <a href="/contact" className="block w-full px-4 py-3 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold rounded-full hover:scale-105 transition-transform text-center">
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