'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

const experience = [
  {
    id: 1,
    title: 'Senior AI Research Engineer',
    company: 'TechCorp AI',
    period: '2022 - Present',
    location: 'San Francisco, CA',
    description: 'Leading research in large language models and content generation systems. Developed production-scale AI pipelines serving millions of users.',
    achievements: [
      'Built AI content generation system processing 1M+ requests daily',
      'Led team of 8 engineers developing multimodal AI applications',
      'Published 3 papers on efficient transformer architectures',
    ],
    skills: ['Python', 'PyTorch', 'Transformers', 'AWS', 'Docker'],
    type: 'work'
  },
  {
    id: 2,
    title: 'Machine Learning Engineer',
    company: 'DataFlow Inc',
    period: '2020 - 2022',
    location: 'Remote',
    description: 'Designed and implemented ML pipelines for real-time data processing and predictive analytics.',
    achievements: [
      'Reduced model inference time by 60% through optimization',
      'Implemented MLOps practices improving deployment reliability',
      'Mentored 5 junior engineers in ML best practices',
    ],
    skills: ['TensorFlow', 'Kubernetes', 'GCP', 'SQL', 'Go'],
    type: 'work'
  },
  {
    id: 3,
    title: 'M.S. Computer Science',
    company: 'Stanford University',
    period: '2018 - 2020',
    location: 'Stanford, CA',
    description: 'Specialized in Artificial Intelligence with focus on natural language processing and computer vision.',
    achievements: [
      'Thesis: "Efficient Neural Architectures for Multimodal Learning"',
      'GPA: 3.9/4.0, Summa Cum Laude',
      'Research Assistant at AI Lab',
    ],
    skills: ['Research', 'Academic Writing', 'Statistics', 'Linear Algebra'],
    type: 'education'
  },
  {
    id: 4,
    title: 'AI Research Intern',
    company: 'Google Research',
    period: 'Summer 2019',
    location: 'Mountain View, CA',
    description: 'Contributed to research on few-shot learning and meta-learning algorithms.',
    achievements: [
      'Developed novel few-shot learning algorithm',
      'Achieved 15% improvement over baseline on benchmarks',
      'Presented findings at internal research symposium',
    ],
    skills: ['Research', 'JAX', 'Academic Writing', 'Collaboration'],
    type: 'work'
  },
  {
    id: 5,
    title: 'B.S. Computer Engineering',
    company: 'University of California, Berkeley',
    period: '2014 - 2018',
    location: 'Berkeley, CA',
    description: 'Strong foundation in computer systems, algorithms, and mathematics.',
    achievements: [
      'Dean\'s List all semesters',
      'President of AI/ML Student Society',
      'Winner of Berkeley Hackathon 2017',
    ],
    skills: ['C++', 'Algorithms', 'Computer Systems', 'Mathematics'],
    type: 'education'
  },
]

const skills = {
  'Programming': ['Python', 'TypeScript', 'Go', 'C++', 'SQL'],
  'AI/ML': ['PyTorch', 'TensorFlow', 'Transformers', 'JAX', 'Scikit-learn'],
  'Cloud & DevOps': ['AWS', 'GCP', 'Docker', 'Kubernetes', 'Terraform'],
  'Frontend': ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion'],
  'Data': ['PostgreSQL', 'MongoDB', 'Redis', 'Apache Spark'],
  'Tools': ['Git', 'Jupyter', 'VS Code', 'Linux', 'Figma'],
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
    // This would trigger PDF download in a real implementation
    alert('PDF download would be implemented here')
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
          <h1 className="text-5xl md:text-7xl font-space font-black mb-6">
            <span className="text-gradient">Resume</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
            AI researcher and engineer building the future of human-computer interaction
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
                <button className="w-full px-4 py-3 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold rounded-full hover:scale-105 transition-transform">
                  Get in Touch
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}