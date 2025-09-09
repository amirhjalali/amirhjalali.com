// Article management utilities using localStorage
// In a production app, this would use a database

export interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  tags: string[]
  imageUrl?: string
  aiGenerated: boolean
  author: string
  publishedAt: string
  readTime: string
  metadata?: {
    style?: string
    length?: string
    wordCount?: number
  }
}

const ARTICLES_KEY = 'portfolio_articles'

// Get all articles from localStorage
export function getArticles(): Article[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(ARTICLES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading articles:', error)
    return []
  }
}

// Save an article to localStorage
export function saveArticle(article: Omit<Article, 'id' | 'publishedAt' | 'readTime'>): Article {
  const articles = getArticles()
  
  const newArticle: Article = {
    ...article,
    id: Date.now().toString(),
    publishedAt: new Date().toISOString(),
    readTime: `${Math.ceil((article.content.split(' ').length || 0) / 200)} min read`
  }
  
  articles.unshift(newArticle) // Add to beginning
  
  try {
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles))
    return newArticle
  } catch (error) {
    console.error('Error saving article:', error)
    throw new Error('Failed to save article')
  }
}

// Get a single article by ID
export function getArticleById(id: string): Article | null {
  const articles = getArticles()
  return articles.find(article => article.id === id) || null
}

// Delete an article
export function deleteArticle(id: string): boolean {
  const articles = getArticles()
  const filtered = articles.filter(article => article.id !== id)
  
  try {
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Error deleting article:', error)
    return false
  }
}

// Update an article
export function updateArticle(id: string, updates: Partial<Article>): Article | null {
  const articles = getArticles()
  const index = articles.findIndex(article => article.id === id)
  
  if (index === -1) return null
  
  articles[index] = { ...articles[index], ...updates }
  
  try {
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles))
    return articles[index]
  } catch (error) {
    console.error('Error updating article:', error)
    return null
  }
}

// Search articles by title or content
export function searchArticles(query: string): Article[] {
  const articles = getArticles()
  const lowercaseQuery = query.toLowerCase()
  
  return articles.filter(article => 
    article.title.toLowerCase().includes(lowercaseQuery) ||
    article.content.toLowerCase().includes(lowercaseQuery) ||
    article.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

// Get articles by tag
export function getArticlesByTag(tag: string): Article[] {
  const articles = getArticles()
  return articles.filter(article => 
    article.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  )
}

// Initialize with default articles if none exist
export function initializeDefaultArticles() {
  const articles = getArticles()
  
  if (articles.length === 0) {
    // Add the thoughts/blog posts as default articles - matching live site exactly (10 posts)
    const defaultArticles = [
      {
        title: 'THE EDGE OF VIBE CODING',
        excerpt: 'A few months back, I wrote about the promise of vibe coding. Now, 2.5 months into practicing it daily, I still believe the nature of programming has shifted. But I\'m also seeing the current limits more clearly.',
        content: `# THE EDGE OF VIBE CODING

A few months back, I wrote about the promise of vibe coding. Now, 2.5 months into practicing it daily, I still believe the nature of programming has shifted. But I'm also seeing the current limits more clearly.

The biggest friction point comes when a project needs to interact with external data. Whether it's a database or API calls, progress slows down significantly. This happens regardless of the model being used.

Right now, the best move is to delay database integration. In the early stages, the data model needs to stay flexible. File-based formats like JSON work better and are easier for the LLM to navigate. Once you involve a real database, errors become more frequent and the process becomes much harder to manage.

Keep it local as long as possible. That's where vibe coding still flows.`,
        tags: ['Vibe Coding', 'AI Programming', 'Development'],
        author: 'Amir Jalali',
        aiGenerated: false,
        imageUrl: '/images/thoughts/6b601f2d7cb379805aedd07a0e277481.jpg',
      },
      {
        title: '4O image generation',
        excerpt: 'Open AI recently released their 4o image generation model. GPT-4o image model differs from previous diffusion models in that it is multimodal-native and non-diffusion-based.',
        content: `# 4O image generation

Open AI recently released their 4o image generation model. GPT-4o image model differs from previous diffusion models in that it is:

• **Multimodal-native**: Unlike diffusion models that generate images from text prompts only, 4o can directly understand and generate across text, images, and audio in a unified architecture.

• **Non-diffusion-based**: It doesn't use a step-by-step denoising process like Stable Diffusion or DALL·E 2. Instead, image reasoning and generation are integrated more like language modeling, allowing for faster and more flexible interaction.

This has led to a giant step up in usability of this model. The long prompts of Midjourney days are gone and we can now collaborate more closely with the model for our desired outputs.

<div class="article-gallery">
<img src="/images/thoughts/7264b5e3b125e813672005946c3c5aaa.jpg" alt="A eye" class="gallery-image" />
<img src="/images/thoughts/8aad15df78b35b18407b13491f2fb679.jpg" alt="A short story" class="gallery-image" />
<img src="/images/thoughts/af1f40ed256ca9b8452ce17e43c971b6.jpg" alt="Of immortality" class="gallery-image" />
</div>`,
        tags: ['OpenAI', 'Image Generation', 'GPT-4o', 'Multimodal AI'],
        author: 'Amir Jalali',
        aiGenerated: false,
        imageUrl: '/images/thoughts/1bb76e5ef6679ef24c4951efaf1e0e4f.jpg',
      },
      {
        title: 'THE ERA OF VIBE CODING',
        excerpt: 'Vibe coding is a new paradigm from early 2025 which essentially refers to writing software with the help of LLMs, without actually writing any of the code yourself.',
        content: `# THE ERA OF VIBE CODING

Vibe coding is a new paradigm from early 2025 which essentially refers to writing software with the help of LLMS, without actually writing any of the code yourself.

As the videos below demonstrate, this is not something that is just for a junior programmer. Many seasoned programmers are moving over to this paradigm as the efficiency gains are just incomparable to writing code by themselves.

<div class="article-videos">
<iframe width="560" height="315" src="https://www.youtube.com/embed/h2EJXKpv6zs" title="Vibe Coding in Action - Building Apps with AI" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
<iframe width="560" height="315" src="https://www.youtube.com/embed/7QcW8Bdy5eM" title="AI-Assisted Development Workflow" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
</div>

As of current, a technical background and systems thinking is still helpful to guide the development process. Nonetheless the difference between what it meant to be a programmer 2 years ago till today is quite whiplash inducing.

Vibe Coding in 2025 will do to software what MidJourney has done for image generation since 2023. Meaning there will be a massive amount of output, but getting to a final shippable product will still required tenacity and reliance on traditional skills.`,
        tags: ['Vibe Coding', 'LLMs', 'Programming Paradigm'],
        author: 'Amir Jalali',
        aiGenerated: false,
        imageUrl: '/images/thoughts/1ce1404d710ca9693dae0848c6a902c7.jpg',
      },
      {
        title: 'DeepSEEK',
        excerpt: 'DeepSeek-R1 represents a major breakthrough in AI development, not just for its impressive performance but for the significant cost reductions it introduces.',
        content: `# DeepSEEK

DeepSeek-R1 represents a major breakthrough in AI development, not just for its impressive performance but for the significant cost reductions it introduces. Unlike many large-scale models that require massive computational resources, DeepSeek has managed to develop a model on par with OpenAI's leading systems at a fraction of the cost. This efficiency makes high-performance AI more accessible, opening doors for businesses, researchers, and developers who previously faced prohibitive expenses when integrating advanced AI into their work.

By dramatically lowering the cost of AI inference and training, DeepSeek-R1 could drive widespread adoption across industries, from healthcare and finance to education and creative fields. Companies that once relied on expensive proprietary models may now have access to open-source alternatives without compromising on quality. This shift not only democratizes AI but also increases competition, pushing the industry toward more sustainable and cost-effective innovation. If this trend continues, AI deployment could become significantly cheaper, leading to a future where high-quality AI assistance is a standard tool rather than a luxury reserved for the largest tech companies.

The immediate takeaway is that many use cases that were not deemed viable just recently, are immediately much more feasible.`,
        tags: ['DeepSEEK', 'Cost Reduction', 'AI Democratization'],
        author: 'Amir Jalali',
        aiGenerated: false,
        imageUrl: '/images/thoughts/3b6f928513916a5117c99c4a8408aec1.jpg',
      },
      {
        title: 'REASONING MODELS',
        excerpt: 'Chain of Thought (CoT) prompting has already proven to be a powerful method for improving the reasoning capabilities of large language models by breaking down complex problems into intermediate logical steps.',
        content: `# REASONING MODELS

Chain of Thought (CoT) prompting has already proven to be a powerful method for improving the reasoning capabilities of large language models (LLMs) by breaking down complex problems into intermediate logical steps. This approach not only enhances accuracy but also makes AI decision-making more transparent and interpretable.

OpenAI's latest research on Learning to Reason with LLMs builds on this idea, demonstrating that explicit reasoning techniques—such as self-reflection, verification, and structured problem-solving—can further optimize AI performance. Instead of merely predicting an answer based on surface-level patterns, LLMs can be trained to reason step by step, much like a human working through a problem.

By integrating reasoning models with CoT, we move toward AI systems that don't just generate responses but actively "think" through challenges in a structured way. This has major implications for fields that require rigorous logical processing, such as mathematics, scientific research, law, and medical diagnostics. More importantly, these techniques reduce hallucinations, improve reliability, and offer insights into how AI reaches its conclusions, making AI systems more trustworthy and effective for complex tasks.

The concept of Test-Time Compute (TTC) allows AI more processing time to refine reasoning during inference, optimizing processing depth rather than relying solely on model size.`,
        tags: ['Reasoning Models', 'Chain of Thought', 'AI Reliability'],
        author: 'Amir Jalali',
        aiGenerated: false,
        imageUrl: '/images/thoughts/0e0b53ff910f76d9ae0dd610714526f8.jpg',
      },
      {
        title: 'CHAIN OF THOUGHT',
        excerpt: 'Chain of Thought (CoT) is a prompting technique that guides language models to solve complex problems by breaking them down into intermediate reasoning steps.',
        content: `# CHAIN OF THOUGHT

Chain of Thought (CoT) is a prompting technique that guides language models to solve complex problems by breaking them down into intermediate reasoning steps. This approach improves AI accuracy by providing structured logical deduction and makes AI decision-making more transparent and interpretable.

The technique allows models to process complex queries more effectively and can help smaller models outperform larger ones through better reasoning. Rather than jumping directly to conclusions, CoT prompting encourages the AI to show its work, much like a student solving a math problem step by step.

This pedagogical approach to AI interaction represents a shift toward more collaborative and understandable AI systems, where the reasoning process becomes as important as the final answer.`,
        tags: ['Chain of Thought', 'Problem Solving', 'AI Transparency'],
        author: 'Amir Jalali',
        aiGenerated: false,
        imageUrl: '/images/thoughts/2be8b86373c179455ea2e2c9a24ee0d8.jpg',
      },
      {
        title: 'LLAMA3 and the era of abundant ai',
        excerpt: 'The release of Meta\'s LLAMA3 represents a potential democratization of AI intelligence, dramatically lowering computational costs and increasing accessibility.',
        content: `# LLAMA3 and the era of abundant ai

The release of Meta's LLAMA3 represents a potential democratization of AI intelligence, dramatically lowering computational costs and increasing accessibility of high-performance AI. This shift presents both tremendous opportunities and significant risks for society.

The accessibility of advanced AI technology could either leverage the decency in humanity, empowering creativity, education, and problem-solving across all sectors, or magnify the evil capacity of our species through misuse and malicious applications.

As we enter this era of abundant artificial intelligence, the question becomes not whether we can build these systems, but whether we can build them responsibly and distribute their benefits equitably. The hope is that increased access to intelligence might contribute to increased wisdom in how we use it.`,
        tags: ['LLAMA3', 'AI Accessibility', 'Societal Impact'],
        author: 'Amir Jalali',
        aiGenerated: false,
        imageUrl: '/images/thoughts/05eff1ae41fa152d2508f92f91da1645.jpg',
      },
      {
        title: 'THE NEXT GREAT DATA CROP',
        excerpt: 'Exploring personal data value and AI training quality concerns, including bot-generated content diluting data quality and economic models.',
        content: `# The Next Great Data Crop

The **next great data crop** focuses on personal data value and AI training quality in an era of increasing data scarcity.

## The Data Quality Crisis

We face unprecedented challenges in data quality:

### Bot-Generated Content Dilution
The internet is increasingly filled with AI-generated content:
- **Synthetic Articles**: AI-written blog posts and news
- **Generated Social Media**: Bot-created posts and comments
- **Artificial Reviews**: Fake product and service reviews
- **Automated Responses**: Bot-generated customer service interactions

### Training Data Contamination
This creates a feedback loop problem:
- **Model Training on AI Output**: Future models trained on synthetic data
- **Quality Degradation**: Progressive decline in model performance
- **Authenticity Loss**: Difficulty distinguishing real from synthetic
- **Information Ecosystem Pollution**: Degraded information environment

## Economic Models for Quality Data

New economic frameworks are emerging:

### Data Provenance Systems
- **Verification Chains**: Blockchain-based data authenticity
- **Human Certification**: Verified human-created content
- **Quality Scoring**: Metrics for data reliability
- **Source Attribution**: Clear origin tracking

### Incentive Structures
- **Quality Rewards**: Payment for high-quality data contribution
- **Expertise Premiums**: Higher value for specialized knowledge
- **Curation Services**: Professional data cleaning and verification
- **Community Validation**: Crowd-sourced quality assessment

## Preservation Strategies

Maintaining AI system effectiveness requires:

### High-Quality Data Creation
- **Expert Knowledge Capture**: Specialized domain expertise
- **Real-World Interactions**: Authentic human conversations
- **Creative Content**: Original artistic and literary works
- **Scientific Data**: Empirical research and observations

### Data Ecosystem Health
- **Diversity Maintenance**: Varied perspectives and voices
- **Cultural Preservation**: Indigenous knowledge and traditions
- **Temporal Snapshots**: Historical data preservation
- **Cross-Domain Integration**: Interdisciplinary knowledge connections

## Future Implications

The data landscape is evolving toward:

1. **Quality Over Quantity**: Premium on verified, high-quality data
2. **Human-Centric Value**: Increased value of authentic human insight
3. **Collaborative Systems**: Shared responsibility for data quality
4. **Sustainable Practices**: Long-term data ecosystem health

*The next gold rush isn't for more data—it's for better data.*`,
        tags: ['Data Quality', 'AI Training', 'Economic Models'],
        author: 'Amir Jalali',
        aiGenerated: false,
        imageUrl: '/images/thoughts/aaa58ccf777376f0c314629c6bab53df.jpg',
      },
      {
        title: 'Are we our IDEAS?',
        excerpt: 'A philosophical exploration of identity, creativity, and the relationship between our thoughts and our sense of self.',
        content: `# Are We Our Ideas?

This **philosophical exploration** delves into the fundamental question of identity: are we defined by our ideas?

## The Nature of Self

The relationship between thoughts and identity is complex:

### Ideas as Extension of Self
Our ideas might be more than mere thoughts:
- **Creative Expression**: Ideas as manifestations of our inner world
- **Problem-Solving Approaches**: How we think reveals who we are
- **Value Systems**: Our ideas reflect our deepest beliefs
- **Innovation Patterns**: Consistent creative approaches define us

### The Fluidity of Thought
Yet ideas are also ephemeral:
- **Evolving Perspectives**: Our ideas change over time
- **External Influences**: Ideas shaped by environment and experience
- **Collaborative Creation**: Ideas built on others' work
- **Cultural Context**: Ideas influenced by societal frameworks

## Identity and Creativity

The intersection of self and creativity raises questions:

### Individual vs. Collective
- **Original Thoughts**: Do truly original ideas exist?
- **Collective Intelligence**: How much do we owe to others?
- **Cultural Heritage**: Ideas inherited from our communities
- **Shared Knowledge**: Building on humanity's intellectual foundation

### Temporal Considerations
- **Past Self**: Are we the same person who had different ideas?
- **Future Evolution**: How will our ideas change us?
- **Memory and Identity**: The role of remembered thoughts
- **Continuity of Self**: What remains constant through change?

## Modern Implications

In an AI-assisted world, these questions become more pressing:

### Human-AI Collaboration
- **Augmented Creativity**: AI-enhanced human thinking
- **Idea Ownership**: Who owns AI-assisted thoughts?
- **Authenticity Questions**: What makes an idea authentically human?
- **Creative Partnership**: The evolving nature of human creativity

### Digital Identity
- **Online Personas**: How digital expression shapes identity
- **Algorithm Influence**: How recommendation systems shape our thoughts
- **Data-Driven Self**: Identity reflected in digital footprints
- **Virtual Creativity**: Creative expression in digital spaces

## Philosophical Perspectives

Different frameworks offer various answers:

### Essentialist View
- **Core Self**: Unchanging essence beyond ideas
- **Fundamental Nature**: Identity rooted in being, not thinking
- **Spiritual Dimensions**: Non-material aspects of self
- **Inherent Qualities**: Traits that persist through change

### Constructivist View
- **Emergent Identity**: Self constructed through ideas and experiences
- **Narrative Self**: Identity as ongoing story we tell ourselves
- **Social Construction**: Self shaped by interactions and ideas
- **Dynamic Nature**: Identity as process rather than thing

## Living the Question

Perhaps the answer lies not in resolution but in the questioning itself:

1. **Embrace Uncertainty**: Accept the mystery of identity
2. **Value Growth**: See identity evolution as positive
3. **Honor Creativity**: Recognize ideas as part of our humanity
4. **Stay Open**: Remain curious about self and others

*The question "Are we our ideas?" may be more important than any answer we could give.*`,
        tags: ['Philosophy', 'Identity', 'Creativity'],
        author: 'Amir Jalali',
        aiGenerated: false,
        imageUrl: '/images/thoughts/1bb76e5ef6679ef24c4951efaf1e0e4f.jpg',
      },
      {
        title: 'Synthetic Data vs \'Real\' DATA',
        excerpt: 'Comparing synthetic and real data in AI training, exploring quality, authenticity, and the implications for model performance.',
        content: `# Synthetic Data vs 'Real' Data

The debate between **synthetic and real data** in AI training raises fundamental questions about quality, authenticity, and model performance.

## Understanding the Distinction

The line between synthetic and real data is increasingly blurred:

### What is "Real" Data?
Traditional notions of real data include:
- **Direct Observations**: Measurements from physical sensors
- **Human Interactions**: Authentic user behavior and communications
- **Natural Phenomena**: Unprocessed environmental data
- **Organic Creation**: Human-generated content and artifacts

### Synthetic Data Spectrum
Synthetic data exists on a continuum:
- **Algorithmically Generated**: Purely mathematical constructions
- **AI-Created Content**: Large language model outputs
- **Simulation Data**: Physics-based virtual environments
- **Augmented Reality**: Enhanced or modified real data

## Quality Considerations

Each data type presents unique advantages and challenges:

### Real Data Strengths
- **Authenticity**: Genuine representation of actual phenomena
- **Complexity**: Natural variations and edge cases
- **Context**: Rich environmental and situational factors
- **Validation**: Ground truth verification possible

### Real Data Limitations
- **Scarcity**: Limited availability in some domains
- **Privacy Concerns**: Ethical constraints on collection
- **Bias**: Historical prejudices embedded in data
- **Cost**: Expensive collection and curation processes

### Synthetic Data Advantages
- **Scalability**: Generate unlimited quantities
- **Control**: Precise parameter manipulation
- **Safety**: No privacy or ethical concerns
- **Balance**: Eliminate historical biases and gaps

### Synthetic Data Challenges
- **Authenticity**: May lack real-world complexity
- **Distribution Shift**: Potential mismatch with reality
- **Validation**: Difficult to verify against truth
- **Feedback Loops**: Risk of compounding errors

## Model Performance Implications

The choice impacts AI system capabilities:

### Training Effectiveness
- **Generalization**: How well models perform on new data
- **Robustness**: Resilience to unexpected inputs
- **Bias Mitigation**: Fairness across different populations
- **Domain Transfer**: Ability to apply learning to new contexts

### Use Case Optimization
Different applications require different approaches:

### Safety-Critical Systems
- **Medical AI**: Real patient data for accurate diagnosis
- **Autonomous Vehicles**: Real-world driving scenarios
- **Financial Systems**: Actual market behavior patterns
- **Infrastructure**: Real sensor data from physical systems

### Creative Applications
- **Content Generation**: Synthetic data for style transfer
- **Game Development**: Procedural generation techniques
- **Art Creation**: AI-assisted creative processes
- **Entertainment**: Virtual environment generation

## Hybrid Approaches

The future likely involves strategic combinations:

### Synthetic-Real Fusion
- **Data Augmentation**: Synthetic data to enhance real datasets
- **Gap Filling**: Synthetic data for underrepresented scenarios
- **Privacy Preservation**: Synthetic alternatives to sensitive data
- **Rapid Prototyping**: Synthetic data for early development

### Quality Frameworks
- **Validation Metrics**: Measuring synthetic data quality
- **Fitness Functions**: Optimizing synthetic data generation
- **Human Evaluation**: Expert assessment of data quality
- **Benchmark Standards**: Industry-wide quality measures

## Strategic Decision Making

Choosing between synthetic and real data requires considering:

1. **Application Requirements**: Mission-critical vs. experimental use
2. **Available Resources**: Time, budget, and expertise constraints
3. **Ethical Implications**: Privacy, consent, and fairness concerns
4. **Performance Targets**: Accuracy and reliability requirements
5. **Regulatory Environment**: Compliance and audit requirements

*The future of AI training isn't about choosing synthetic or real data—it's about combining them intelligently.*`,
        tags: ['Synthetic Data', 'AI Training', 'Data Strategy'],
        author: 'Amir Jalali',
        aiGenerated: false,
        imageUrl: '/images/thoughts/3b6f928513916a5117c99c4a8408aec1.jpg',
      }
    ]
    
    // Map articles with estimated publication dates (in chronological order)
    const articlesWithDates = [
      // Latest: The Edge of Vibe Coding (most recent - December 2024)
      { ...defaultArticles[0], publishedAt: '2024-12-15T10:00:00.000Z', readTime: '3 min read' },
      // 4O Image Generation (November 2024)
      { ...defaultArticles[1], publishedAt: '2024-11-20T10:00:00.000Z', readTime: '4 min read' },
      // The ERA of VIBE CODING (October 2024)
      { ...defaultArticles[2], publishedAt: '2024-10-15T10:00:00.000Z', readTime: '5 min read' },
      // DeepSEEK (September 2024)
      { ...defaultArticles[3], publishedAt: '2024-09-10T10:00:00.000Z', readTime: '3 min read' },
      // REASONING MODELS (August 2024)
      { ...defaultArticles[4], publishedAt: '2024-08-25T10:00:00.000Z', readTime: '4 min read' },
      // CHAIN OF THOUGHT (August 2024)
      { ...defaultArticles[5], publishedAt: '2024-08-05T10:00:00.000Z', readTime: '3 min read' },
      // LLAMA3 and the era of abundant ai (July 2024)
      { ...defaultArticles[6], publishedAt: '2024-07-15T10:00:00.000Z', readTime: '5 min read' },
      // THE NEXT GREAT DATA CROP (June 2024)
      { ...defaultArticles[7], publishedAt: '2024-06-20T10:00:00.000Z', readTime: '4 min read' },
      // Are we our IDEAS? (May 2024)
      { ...defaultArticles[8], publishedAt: '2024-05-10T10:00:00.000Z', readTime: '6 min read' },
      // Synthetic Data vs 'Real' DATA (April 2024)
      { ...defaultArticles[9], publishedAt: '2024-04-15T10:00:00.000Z', readTime: '5 min read' },
    ]
    
    // Create articles with consistent IDs
    const articlesToSave = articlesWithDates.map((article, index) => ({
      ...article,
      id: `article-${index + 1}` // Consistent IDs that won't change
    }))
    
    try {
      localStorage.setItem(ARTICLES_KEY, JSON.stringify(articlesToSave))
    } catch (error) {
      console.error('Error saving articles:', error)
    }
  }
}