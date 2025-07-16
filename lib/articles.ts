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
        content: 'In the world of Vibe Coding, we encounter fascinating challenges. Database integration creates friction, while file-based formats offer distinct advantages. The recommendation is clear: keep projects local as long as possible to maintain development velocity.',
        tags: ['Vibe Coding', 'AI Programming', 'Development'],
        author: 'Amir Jalali',
        aiGenerated: false,
      },
      {
        title: '4O Image Generation',
        excerpt: 'OpenAI\'s 4o image generation model represents a breakthrough with its multimodal-native, non-diffusion-based architecture.',
        content: 'OpenAI\'s 4o image generation model marks a significant advancement in AI image creation. With its multimodal-native architecture and non-diffusion-based approach, it delivers improved usability and enables better collaboration between different AI modalities.',
        tags: ['OpenAI', 'Image Generation', 'Multimodal AI'],
        author: 'Amir Jalali',
        aiGenerated: false,
      },
      {
        title: 'The ERA of VIBE CODING',
        excerpt: 'A new programming paradigm using LLMs to write software with AI assistance without manual coding, revolutionizing efficiency for all skill levels.',
        content: 'We are entering the era of Vibe Coding - a revolutionary programming paradigm where developers write software using LLM assistance without manual coding. This approach delivers significant efficiency gains for both experienced and junior programmers, similar to how MidJourney transformed image generation.',
        tags: ['Vibe Coding', 'LLMs', 'Programming Paradigm'],
        author: 'Amir Jalali',
        aiGenerated: false,
      }
    ]
    
    defaultArticles.forEach(article => saveArticle(article))
  }
}