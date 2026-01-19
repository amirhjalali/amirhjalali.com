/**
 * GitHub Platform Extractor
 *
 * Handles:
 * - Repositories
 * - Issues
 * - Pull Requests
 * - Gists
 * - Discussions
 *
 * Uses GitHub's REST API (no auth required for public repos)
 */

import type { ExtractionResult, AuthorInfo, MediaItem } from '@/lib/types'
import {
  PlatformExtractor,
  EXTRACTOR_VERSION,
  createSuccessResult,
  createFailureResult,
  cleanText,
  generateExcerpt,
  extractUrls,
  fetchWithTimeout,
} from './base'

type GitHubContentType = 'repo' | 'issue' | 'pull' | 'gist' | 'discussion' | 'file' | 'unknown'

export class GitHubExtractor implements PlatformExtractor {
  platform = 'github' as const
  version = EXTRACTOR_VERSION

  canHandle(url: string): boolean {
    return /^https?:\/\/(www\.)?github\.com\//i.test(url) ||
           /^https?:\/\/gist\.github\.com\//i.test(url)
  }

  async extract(url: string): Promise<ExtractionResult> {
    try {
      const parsed = this.parseUrl(url)

      switch (parsed.type) {
        case 'repo':
          return this.extractRepo(parsed.owner, parsed.repo)
        case 'issue':
          return this.extractIssue(parsed.owner, parsed.repo, parsed.number!)
        case 'pull':
          return this.extractPullRequest(parsed.owner, parsed.repo, parsed.number!)
        case 'gist':
          return this.extractGist(parsed.gistId!)
        case 'file':
          return this.extractFile(parsed.owner, parsed.repo, parsed.path!)
        default:
          // Fall back to OG tags
          return this.extractViaOgTags(url)
      }
    } catch (error) {
      return createFailureResult('github', `Extraction failed: ${error}`)
    }
  }

  private parseUrl(url: string): {
    type: GitHubContentType
    owner: string
    repo: string
    number?: number
    gistId?: string
    path?: string
  } {
    // Gist URL
    const gistMatch = url.match(/gist\.github\.com\/([^/]+)\/([a-f0-9]+)/i)
    if (gistMatch) {
      return { type: 'gist', owner: gistMatch[1], repo: '', gistId: gistMatch[2] }
    }

    // Parse standard GitHub URL
    const parsed = new URL(url)
    const parts = parsed.pathname.split('/').filter(Boolean)

    if (parts.length < 2) {
      return { type: 'unknown', owner: parts[0] || '', repo: '' }
    }

    const owner = parts[0]
    const repo = parts[1]

    // Issue
    if (parts[2] === 'issues' && parts[3]) {
      return { type: 'issue', owner, repo, number: parseInt(parts[3], 10) }
    }

    // Pull request
    if (parts[2] === 'pull' && parts[3]) {
      return { type: 'pull', owner, repo, number: parseInt(parts[3], 10) }
    }

    // Discussion
    if (parts[2] === 'discussions' && parts[3]) {
      return { type: 'discussion', owner, repo, number: parseInt(parts[3], 10) }
    }

    // File
    if (parts[2] === 'blob' && parts.length > 3) {
      return { type: 'file', owner, repo, path: parts.slice(4).join('/') }
    }

    // Repository
    return { type: 'repo', owner, repo }
  }

  private async extractRepo(owner: string, repo: string): Promise<ExtractionResult> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`
    const response = await fetchWithTimeout(apiUrl, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    })

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`)
    }

    const data = await response.json()

    // Get README content
    let readmeContent = ''
    try {
      const readmeResponse = await fetchWithTimeout(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        { headers: { 'Accept': 'application/vnd.github.v3.raw' } }
      )
      if (readmeResponse.ok) {
        readmeContent = await readmeResponse.text()
      }
    } catch {
      // README is optional
    }

    const author: AuthorInfo = {
      name: data.owner?.login,
      handle: data.owner?.login,
      avatarUrl: data.owner?.avatar_url,
      profileUrl: data.owner?.html_url,
    }

    const content = cleanText(data.description || '') + (readmeContent ? '\n\n' + cleanText(readmeContent) : '')

    return createSuccessResult('github', {
      title: data.full_name,
      content,
      excerpt: generateExcerpt(data.description || readmeContent),
      author,
      thumbnailUrl: data.owner?.avatar_url,
      engagement: {
        stars: data.stargazers_count,
        forks: data.forks_count,
        views: data.watchers_count,
      },
      mentionedLinks: extractUrls(content),
      platformData: {
        repository: data.full_name,
        language: data.language,
        license: data.license?.name,
        isPrivate: data.private,
        isFork: data.fork,
        isArchived: data.archived,
        defaultBranch: data.default_branch,
        openIssues: data.open_issues_count,
        topics: data.topics,
        publishedAt: data.created_at,
        editedAt: data.pushed_at,
        homepage: data.homepage,
      },
    })
  }

  private async extractIssue(owner: string, repo: string, number: number): Promise<ExtractionResult> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${number}`
    const response = await fetchWithTimeout(apiUrl, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    })

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`)
    }

    const data = await response.json()

    const author: AuthorInfo = {
      name: data.user?.login,
      handle: data.user?.login,
      avatarUrl: data.user?.avatar_url,
      profileUrl: data.user?.html_url,
    }

    const content = cleanText(data.body || '')

    return createSuccessResult('github', {
      title: `#${number}: ${data.title}`,
      content,
      excerpt: generateExcerpt(content),
      author,
      thumbnailUrl: data.user?.avatar_url,
      engagement: {
        comments: data.comments,
        likes: data.reactions?.['+1'] || 0,
      },
      mentionedLinks: extractUrls(content),
      platformData: {
        postId: `${number}`,
        repository: `${owner}/${repo}`,
        state: data.state,
        labels: data.labels?.map((l: any) => l.name),
        milestone: data.milestone?.title,
        assignees: data.assignees?.map((a: any) => a.login),
        isPullRequest: !!data.pull_request,
        publishedAt: data.created_at,
        editedAt: data.updated_at,
        closedAt: data.closed_at,
      },
    })
  }

  private async extractPullRequest(owner: string, repo: string, number: number): Promise<ExtractionResult> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`
    const response = await fetchWithTimeout(apiUrl, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    })

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`)
    }

    const data = await response.json()

    const author: AuthorInfo = {
      name: data.user?.login,
      handle: data.user?.login,
      avatarUrl: data.user?.avatar_url,
      profileUrl: data.user?.html_url,
    }

    const content = cleanText(data.body || '')

    return createSuccessResult('github', {
      title: `#${number}: ${data.title}`,
      content,
      excerpt: generateExcerpt(content),
      author,
      thumbnailUrl: data.user?.avatar_url,
      engagement: {
        comments: data.comments,
        likes: data.reactions?.['+1'] || 0,
      },
      mentionedLinks: extractUrls(content),
      platformData: {
        postId: `${number}`,
        repository: `${owner}/${repo}`,
        state: data.state,
        merged: data.merged,
        draft: data.draft,
        additions: data.additions,
        deletions: data.deletions,
        changedFiles: data.changed_files,
        baseBranch: data.base?.ref,
        headBranch: data.head?.ref,
        labels: data.labels?.map((l: any) => l.name),
        reviewers: data.requested_reviewers?.map((r: any) => r.login),
        publishedAt: data.created_at,
        editedAt: data.updated_at,
        mergedAt: data.merged_at,
        closedAt: data.closed_at,
      },
    })
  }

  private async extractGist(gistId: string): Promise<ExtractionResult> {
    const apiUrl = `https://api.github.com/gists/${gistId}`
    const response = await fetchWithTimeout(apiUrl, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    })

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`)
    }

    const data = await response.json()

    const author: AuthorInfo = {
      name: data.owner?.login,
      handle: data.owner?.login,
      avatarUrl: data.owner?.avatar_url,
      profileUrl: data.owner?.html_url,
    }

    // Get content from files
    const files = Object.values(data.files || {}) as any[]
    const firstFile = files[0]
    const content = firstFile?.content || ''

    return createSuccessResult('github', {
      title: data.description || `Gist by ${author.name}`,
      content: cleanText(content),
      excerpt: generateExcerpt(data.description || content),
      author,
      thumbnailUrl: author.avatarUrl,
      engagement: {
        forks: data.forks?.length || 0,
        comments: data.comments,
      },
      platformData: {
        postId: gistId,
        isPublic: data.public,
        files: files.map((f: any) => ({
          filename: f.filename,
          language: f.language,
          size: f.size,
        })),
        publishedAt: data.created_at,
        editedAt: data.updated_at,
      },
    })
  }

  private async extractFile(owner: string, repo: string, path: string): Promise<ExtractionResult> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
    const response = await fetchWithTimeout(apiUrl, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    })

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`)
    }

    const data = await response.json()

    // Decode base64 content
    let content = ''
    if (data.content && data.encoding === 'base64') {
      content = Buffer.from(data.content, 'base64').toString('utf-8')
    }

    return createSuccessResult('github', {
      title: `${repo}/${path}`,
      content: cleanText(content),
      excerpt: generateExcerpt(content),
      platformData: {
        repository: `${owner}/${repo}`,
        path,
        size: data.size,
        sha: data.sha,
      },
    })
  }

  private async extractViaOgTags(url: string): Promise<ExtractionResult> {
    const response = await fetchWithTimeout(url)

    if (!response.ok) {
      throw new Error(`Request returned ${response.status}`)
    }

    const html = await response.text()

    const getMetaContent = (property: string): string | undefined => {
      const patterns = [
        new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
      ]

      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match) return match[1]
      }
      return undefined
    }

    return createSuccessResult('github', {
      title: getMetaContent('og:title'),
      content: getMetaContent('og:description') || '',
      excerpt: generateExcerpt(getMetaContent('og:description') || ''),
      thumbnailUrl: getMetaContent('og:image'),
    })
  }
}

export const githubExtractor = new GitHubExtractor()
