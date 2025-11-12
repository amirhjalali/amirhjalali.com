/**
 * API Client for admin panel operations
 * Replaces localStorage with database-backed API calls
 */

export interface Article {
  id: string
  title: string
  slug?: string
  content: string
  excerpt: string
  tags: string[]
  imageUrl?: string
  aiGenerated: boolean
  author: string
  publishedAt: string
  readTime: string
  published?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Draft {
  id: string
  title: string
  content: string
  excerpt?: string
  tags: string[]
  imageUrl?: string
  aiGenerated: boolean
  createdAt: string
  updatedAt: string
}

class APIClient {
  private baseUrl = '/api'

  // Articles
  async getArticles(publishedOnly = false): Promise<Article[]> {
    const url = publishedOnly
      ? `${this.baseUrl}/articles?published=true`
      : `${this.baseUrl}/articles`

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch articles')
    return response.json()
  }

  async getArticle(id: string): Promise<Article> {
    const response = await fetch(`${this.baseUrl}/articles/${id}`)
    if (!response.ok) throw new Error('Failed to fetch article')
    return response.json()
  }

  async createArticle(data: Partial<Article>): Promise<Article> {
    const response = await fetch(`${this.baseUrl}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create article')
    return response.json()
  }

  async updateArticle(id: string, data: Partial<Article>): Promise<Article> {
    const response = await fetch(`${this.baseUrl}/articles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update article')
    return response.json()
  }

  async deleteArticle(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/articles/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete article')
  }

  async publishArticle(id: string, publish = true): Promise<Article> {
    const response = await fetch(`${this.baseUrl}/articles/${id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publish }),
    })
    if (!response.ok) throw new Error('Failed to publish/unpublish article')
    const result = await response.json()
    return result.article
  }

  // Drafts
  async getDrafts(): Promise<Draft[]> {
    const response = await fetch(`${this.baseUrl}/drafts`)
    if (!response.ok) throw new Error('Failed to fetch drafts')
    return response.json()
  }

  async getDraft(id: string): Promise<Draft> {
    const response = await fetch(`${this.baseUrl}/drafts/${id}`)
    if (!response.ok) throw new Error('Failed to fetch draft')
    return response.json()
  }

  async createDraft(data: Partial<Draft>): Promise<Draft> {
    const response = await fetch(`${this.baseUrl}/drafts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create draft')
    return response.json()
  }

  async updateDraft(id: string, data: Partial<Draft>): Promise<Draft> {
    const response = await fetch(`${this.baseUrl}/drafts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update draft')
    return response.json()
  }

  async deleteDraft(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/drafts/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete draft')
  }

  async publishDraft(id: string): Promise<Article> {
    const response = await fetch(`${this.baseUrl}/drafts/${id}/publish`, {
      method: 'POST',
    })
    if (!response.ok) throw new Error('Failed to publish draft')
    const result = await response.json()
    return result.article
  }

  // Bulk operations
  async bulkDeleteDrafts(ids: string[]): Promise<void> {
    await Promise.all(ids.map(id => this.deleteDraft(id)))
  }

  async bulkPublishDrafts(ids: string[]): Promise<Article[]> {
    const results = await Promise.all(ids.map(id => this.publishDraft(id)))
    return results
  }

  // AI Generation
  async generateArticle(customTopic?: string): Promise<Draft> {
    const response = await fetch(`${this.baseUrl}/generate-article`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customTopic }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to generate article')
    }
    const result = await response.json()
    return result.draft
  }
}

// Export singleton instance
export const apiClient = new APIClient()
