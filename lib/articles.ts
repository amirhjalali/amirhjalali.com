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
    // Add the thoughts/blog posts as default articles
    const defaultArticles = [
      {
        title: 'THE EDGE OF VIBE CODING',
        excerpt: 'Exploring the limits and challenges of AI-assisted programming, including database integration friction and the advantages of file-based formats.',
        content: `# The Edge of Vibe Coding

In the world of **Vibe Coding**, we encounter fascinating challenges that push the boundaries of AI-assisted development.

## Database Integration Friction

One of the most significant challenges in modern development is the friction created by database integration. Traditional database setups often slow down the development process, requiring:

- Complex schema migrations
- Intricate ORM configurations  
- Database-specific optimization concerns
- Connection management overhead

## File-Based Advantages

In contrast, file-based formats offer distinct advantages:

- **Simplicity**: Direct file manipulation without database layers
- **Portability**: Easy to move, backup, and version control
- **Development Speed**: Immediate access without connection setup
- **Debugging**: Human-readable format for easier troubleshooting

## The Recommendation

The recommendation is clear: **keep projects local as long as possible** to maintain development velocity. This approach allows developers to:

1. Focus on core functionality first
2. Iterate rapidly without infrastructure concerns
3. Deploy to production only when absolutely necessary
4. Maintain the flow state that makes vibe coding so effective

*The future of development lies in removing friction, not adding complexity.*`,
        tags: ['Vibe Coding', 'AI Programming', 'Development'],
        author: 'Amir Jalali',
        aiGenerated: false,
        imageUrl: '/images/thoughts/05eff1ae41fa152d2508f92f91da1645.jpg',
      },
      {
        title: '4O Image Generation',
        excerpt: 'OpenAI\'s 4o image generation model represents a breakthrough with its multimodal-native, non-diffusion-based architecture.',
        content: `# 4O Image Generation: A New Era

OpenAI's **4o image generation model** marks a significant advancement in AI image creation technology.

## Breakthrough Architecture

This model represents a departure from traditional approaches:

### Multimodal-Native Design
- Built from the ground up to handle multiple modalities
- Seamless integration between text, image, and audio processing
- Native understanding of cross-modal relationships

### Non-Diffusion-Based Approach
Unlike previous models that rely on diffusion processes, 4o uses:
- Direct generation techniques
- Improved speed and efficiency  
- Better consistency across generations
- Reduced computational overhead

## Improved Usability

The 4o model delivers enhanced usability through:

- **Faster generation times**
- **More intuitive prompting**
- **Better prompt adherence**
- **Consistent style maintenance**

## Collaboration Benefits

This architecture enables better collaboration between different AI modalities:

1. **Text-to-image** with improved context understanding
2. **Image-to-text** with better descriptive capabilities
3. **Cross-modal reasoning** for complex tasks
4. **Unified workflows** across different content types

The implications for creative workflows and AI-assisted design are profound.`,
        tags: ['OpenAI', 'Image Generation', 'Multimodal AI'],
        author: 'Amir Jalali',
        aiGenerated: false,
        imageUrl: '/images/thoughts/144dae3b2051b115fb0666fd5153c509.jpg',
      },
      {
        title: 'The ERA of VIBE CODING',
        excerpt: 'A new programming paradigm using LLMs to write software with AI assistance without manual coding, revolutionizing efficiency for all skill levels.',
        content: `# The Era of Vibe Coding

We are entering the **era of Vibe Coding** - a revolutionary programming paradigm that's transforming how we build software.

## What is Vibe Coding?

Vibe Coding is a development approach where programmers write software using **LLM assistance** without traditional manual coding. Think of it as the programming equivalent of how MidJourney transformed image generation.

## The Paradigm Shift

This represents a fundamental change in how we approach software development:

### Traditional Coding
- Manual syntax writing
- Debugging line by line
- Extensive documentation reading
- Time-intensive iteration cycles

### Vibe Coding
- **Natural language descriptions** of desired functionality
- **AI-assisted implementation** with immediate feedback
- **Rapid prototyping** and iteration
- **Intent-driven development**

## Efficiency Gains

The benefits are significant for developers at all levels:

### For Experienced Programmers
- **10x faster prototyping**
- Focus on architecture over syntax
- Rapid exploration of ideas
- More time for creative problem-solving

### For Junior Developers
- **Reduced learning curve**
- Access to best practices through AI
- Immediate feedback and suggestions
- Faster skill development

## The MidJourney Parallel

Just as MidJourney democratized image creation by allowing anyone to generate professional-quality images through text prompts, Vibe Coding is democratizing software development.

**The future is about expressing intent, not memorizing syntax.**

## Implementation Strategy

To embrace Vibe Coding effectively:

1. **Start with clear intent** - Know what you want to build
2. **Iterate quickly** - Let AI handle the implementation details  
3. **Review and refine** - Maintain quality through human oversight
4. **Learn continuously** - Understand the generated code to improve prompts

*This is not just a tool change—it's a fundamental shift in how we think about programming.*`,
        tags: ['Vibe Coding', 'LLMs', 'Programming Paradigm'],
        author: 'Amir Jalali',
        aiGenerated: false,
        imageUrl: '/images/thoughts/1ce1404d710ca9693dae0848c6a902c7.jpg',
      }
    ]
    
    defaultArticles.forEach(article => saveArticle(article))
  }
}