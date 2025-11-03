// Article management utilities using localStorage
// In a production app, this would use a database

import { publishedArticles as defaultPublishedArticles } from '@/data/published.mjs'

/**
 * Generate a unique article ID with timestamp and random component
 * Format: {prefix}-{timestamp}-{random9chars}
 *
 * @param prefix - ID prefix ('article' or 'draft')
 * @returns Unique ID string
 */
function generateUniqueId(prefix: 'article' | 'draft' = 'article'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

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
  status?: 'published' | 'draft'

  // Track publishing history
  sourceId?: string  // Original draft ID before publishing
  publishHistory?: {
    publishedFrom?: string  // Draft ID this was published from
    publishedAt: string     // When it was published
    originalCreatedAt?: string  // When draft was created
  }

  metadata?: {
    style?: string
    length?: string
    wordCount?: number
    generatedAt?: string
    topic?: string
    model?: string
    imageModel?: string
  }
}

const ARTICLES_KEY = 'portfolio_articles'
const DRAFT_ARTICLES_KEY = 'portfolio_draft_articles'
const ARTICLES_VERSION_KEY = 'portfolio_articles_version'
const CURRENT_VERSION = '6' // Increment this when article structure changes

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
    id: generateUniqueId('article'),
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

// ===== DRAFT ARTICLE MANAGEMENT =====

// Generate hash of drafts array for change detection
function hashArray(arr: Article[]): string {
  const str = JSON.stringify(arr.map(a => a.id).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Load drafts from public JSON file (for GitHub Pages static builds)
async function loadDraftsFromFile(): Promise<Article[]> {
  try {
    // Use basePath only if explicitly set (for GitHub Pages deployment)
    // In development, NEXT_PUBLIC_BASE_PATH should be empty or not set
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    const response = await fetch(`${basePath}/data/drafts.json`)
    if (!response.ok) {
      return []
    }
    const drafts = await response.json()
    return Array.isArray(drafts) ? drafts : []
  } catch (error) {
    console.warn('Could not load drafts from file:', error)
    return []
  }
}

// Initialize drafts from JSON file (called once on app load)
const DRAFTS_SYNC_KEY = 'portfolio_drafts_last_sync'
const DRAFTS_HASH_KEY = 'portfolio_drafts_file_hash'

export async function initializeDrafts(force: boolean = false): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    // Load drafts from JSON file
    const fileDrafts = await loadDraftsFromFile()
    console.log(`Loaded ${fileDrafts.length} drafts from file`)

    if (fileDrafts.length > 0) {
      // Check if file content changed (not just session)
      const fileHash = hashArray(fileDrafts);
      const storedHash = localStorage.getItem(DRAFTS_HASH_KEY);

      const fileChanged = fileHash !== storedHash;

      if (!fileChanged && !force) {
        console.log('Drafts file unchanged since last sync');
        return;
      }

      // Get existing localStorage drafts
      const stored = localStorage.getItem(DRAFT_ARTICLES_KEY)
      const localDrafts = stored ? JSON.parse(stored) : []

      // Only add NEW drafts from file (ones not already in localStorage)
      const existingIds = new Set(localDrafts.map((d: Article) => d.id))
      const newDrafts = fileDrafts.filter(d => !existingIds.has(d.id))

      if (newDrafts.length > 0) {
        // Add new drafts to the beginning
        const merged = [...newDrafts, ...localDrafts]
        localStorage.setItem(DRAFT_ARTICLES_KEY, JSON.stringify(merged))
        console.log(`✅ Added ${newDrafts.length} new drafts from file`)
      } else {
        console.log('No new drafts to sync')
      }

      // Store hash instead of timestamp
      localStorage.setItem(DRAFTS_HASH_KEY, fileHash);
      sessionStorage.setItem(DRAFTS_SYNC_KEY, Date.now().toString())
    } else {
      console.warn('No drafts found in file')
    }
  } catch (error) {
    console.error('Error initializing drafts:', error)
  }
}

// Get all draft articles
export function getDraftArticles(): Article[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(DRAFT_ARTICLES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading draft articles:', error)
    return []
  }
}

// Save article as draft
export function saveDraftArticle(article: Omit<Article, 'id' | 'publishedAt' | 'readTime' | 'status'>): Article {
  const drafts = getDraftArticles()

  const newDraft: Article = {
    ...article,
    id: generateUniqueId('draft'),
    publishedAt: new Date().toISOString(),
    readTime: `${Math.ceil((article.content.split(' ').length || 0) / 200)} min read`,
    status: 'draft'
  }

  drafts.unshift(newDraft)

  try {
    localStorage.setItem(DRAFT_ARTICLES_KEY, JSON.stringify(drafts))
    return newDraft
  } catch (error) {
    console.error('Error saving draft article:', error)
    throw new Error('Failed to save draft article')
  }
}

// Get a single draft article by ID
export function getDraftArticleById(id: string): Article | null {
  const drafts = getDraftArticles()
  return drafts.find(article => article.id === id) || null
}

// Duplicate a draft article
export function duplicateDraftArticle(draftId: string): Article | null {
  const draft = getDraftArticleById(draftId)
  if (!draft) return null

  const newDraft: Article = {
    ...draft,
    id: generateUniqueId('draft'),
    title: `${draft.title} (Copy)`,
    publishedAt: new Date().toISOString()
  }

  const drafts = getDraftArticles()
  drafts.unshift(newDraft)

  try {
    localStorage.setItem(DRAFT_ARTICLES_KEY, JSON.stringify(drafts))
    return newDraft
  } catch (error) {
    console.error('Error duplicating draft:', error)
    return null
  }
}

// Bulk delete drafts
export function bulkDeleteDrafts(draftIds: string[]): boolean {
  try {
    const drafts = getDraftArticles()
    const filtered = drafts.filter(draft => !draftIds.includes(draft.id))
    localStorage.setItem(DRAFT_ARTICLES_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Error bulk deleting drafts:', error)
    return false
  }
}

// Bulk publish drafts
export function bulkPublishDrafts(draftIds: string[]): boolean {
  try {
    const drafts = getDraftArticles()
    const articles = getArticles()

    // Track how many were skipped
    let publishedCount = 0;
    let skippedCount = 0;
    const skippedReasons: string[] = [];

    draftIds.forEach(id => {
      const draft = drafts.find(d => d.id === id)
      if (!draft) return;

      // Check for duplicate content before publishing
      const draftFingerprint = draft.content
        .replace(/[^a-z0-9]/gi, '')
        .toLowerCase()
        .substring(0, 200);

      const isDuplicate = articles.some(article => {
        const articleFingerprint = article.content
          .replace(/[^a-z0-9]/gi, '')
          .toLowerCase()
          .substring(0, 200);

        return articleFingerprint === draftFingerprint;
      });

      if (isDuplicate) {
        skippedCount++;
        skippedReasons.push(`"${draft.title}" - duplicate content`);
        return; // Skip this draft
      }

      // Publish the draft
      const publishedArticle: Article = {
        ...draft,
        id: generateUniqueId('article'),
        publishedAt: new Date().toISOString(),
        status: 'published',

        // Track source
        sourceId: draft.id,
        publishHistory: {
          publishedFrom: draft.id,
          publishedAt: new Date().toISOString(),
          originalCreatedAt: draft.publishedAt
        }
      }

      articles.unshift(publishedArticle)
      publishedCount++;
    })

    // Only remove successfully published drafts
    const publishedIds = new Set(
      articles
        .filter(a => a.sourceId && draftIds.includes(a.sourceId))
        .map(a => a.sourceId)
    );

    const filtered = drafts.filter(draft => !publishedIds.has(draft.id))

    localStorage.setItem(DRAFT_ARTICLES_KEY, JSON.stringify(filtered))
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles))

    // Log results
    console.log(`✅ Bulk publish complete: ${publishedCount} published, ${skippedCount} skipped`);
    if (skippedReasons.length > 0) {
      console.log('⚠️  Skipped drafts:', skippedReasons);
    }

    return true
  } catch (error) {
    console.error('Error bulk publishing drafts:', error)
    return false
  }
}

// Unpublish article (convert published back to draft)
export function unpublishArticle(articleId: string): boolean {
  try {
    const articles = getArticles()
    const articleIndex = articles.findIndex(a => a.id === articleId)

    if (articleIndex === -1) return false

    const article = articles[articleIndex]
    const draft: Article = {
      ...article,
      id: generateUniqueId('draft'),
      status: 'draft'
    }

    // Remove from published
    articles.splice(articleIndex, 1)

    // Add to drafts
    const drafts = getDraftArticles()
    drafts.unshift(draft)

    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles))
    localStorage.setItem(DRAFT_ARTICLES_KEY, JSON.stringify(drafts))

    return true
  } catch (error) {
    console.error('Error unpublishing article:', error)
    return false
  }
}

// Publish a draft article (move from drafts to published)
export function publishDraftArticle(draftId: string): Article | null {
  const drafts = getDraftArticles()
  const draftIndex = drafts.findIndex(article => article.id === draftId)

  if (draftIndex === -1) return null

  const draft = drafts[draftIndex]

  // Check if content already published
  const articles = getArticles()

  // Content fingerprint (first 200 chars, normalized)
  const draftFingerprint = draft.content
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
    .substring(0, 200);

  const existingArticle = articles.find(article => {
    const articleFingerprint = article.content
      .replace(/[^a-z0-9]/gi, '')
      .toLowerCase()
      .substring(0, 200);

    return articleFingerprint === draftFingerprint;
  });

  if (existingArticle) {
    console.warn(`⚠️  Article with similar content already published (ID: ${existingArticle.id})`);
    console.warn(`   Title: "${existingArticle.title}"`);
    console.warn(`   Published: ${existingArticle.publishedAt}`);
    return null; // Prevent duplicate publish
  }

  // Remove from drafts
  drafts.splice(draftIndex, 1)

  // Create published article with tracking
  const publishedArticle: Article = {
    ...draft,
    id: generateUniqueId('article'),
    publishedAt: new Date().toISOString(),
    status: 'published',

    // Track source
    sourceId: draft.id,
    publishHistory: {
      publishedFrom: draft.id,
      publishedAt: new Date().toISOString(),
      originalCreatedAt: draft.publishedAt // Draft creation time
    }
  }

  articles.unshift(publishedArticle)

  try {
    localStorage.setItem(DRAFT_ARTICLES_KEY, JSON.stringify(drafts))
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles))
    return publishedArticle
  } catch (error) {
    console.error('Error publishing draft article:', error)
    return null
  }
}

// Delete a draft article
export function deleteDraftArticle(id: string): boolean {
  const drafts = getDraftArticles()
  const filtered = drafts.filter(article => article.id !== id)

  try {
    localStorage.setItem(DRAFT_ARTICLES_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Error deleting draft article:', error)
    return false
  }
}

// Update a draft article
export function updateDraftArticle(id: string, updates: Partial<Article>): Article | null {
  const drafts = getDraftArticles()
  const index = drafts.findIndex(article => article.id === id)

  if (index === -1) return null

  // Recalculate read time if content changed
  if (updates.content) {
    updates.readTime = `${Math.ceil((updates.content.split(' ').length || 0) / 200)} min read`
  }

  drafts[index] = { ...drafts[index], ...updates }

  try {
    localStorage.setItem(DRAFT_ARTICLES_KEY, JSON.stringify(drafts))
    return drafts[index]
  } catch (error) {
    console.error('Error updating draft article:', error)
    return null
  }
}

// Initialize with default articles if none exist or version changed
export function initializeDefaultArticles() {
  if (typeof window === 'undefined') return

  const storedVersion = localStorage.getItem(ARTICLES_VERSION_KEY)
  const articles = getArticles()

  if (articles.length === 0 || storedVersion !== CURRENT_VERSION) {
    try {
      localStorage.setItem(ARTICLES_KEY, JSON.stringify(defaultPublishedArticles))
      localStorage.setItem(ARTICLES_VERSION_KEY, CURRENT_VERSION)
    } catch (error) {
      console.error('Error saving articles:', error)
    }
  }
}

