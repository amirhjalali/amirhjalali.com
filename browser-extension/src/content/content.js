// Content Script for Quick Notes Capture

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSelection') {
    const selectedText = window.getSelection().toString().trim()
    sendResponse({ selectedText })
  }

  if (message.action === 'getPageInfo') {
    sendResponse({
      url: window.location.href,
      title: document.title,
      description: getMetaDescription(),
      images: getPageImages(),
    })
  }

  if (message.action === 'highlightSaved') {
    showSaveIndicator(message.position)
  }

  return true
})

// Get meta description
function getMetaDescription() {
  const meta =
    document.querySelector('meta[name="description"]') ||
    document.querySelector('meta[property="og:description"]')
  return meta?.content || ''
}

// Get page images
function getPageImages() {
  const images = []

  // OG image
  const ogImage = document.querySelector('meta[property="og:image"]')
  if (ogImage?.content) {
    images.push({ url: ogImage.content, type: 'og' })
  }

  // Main content images
  const contentImages = document.querySelectorAll('article img, main img, .content img')
  contentImages.forEach((img) => {
    if (img.src && img.naturalWidth > 200) {
      images.push({ url: img.src, type: 'content' })
    }
  })

  return images.slice(0, 5)
}

// Show save indicator
function showSaveIndicator(position) {
  const indicator = document.createElement('div')
  indicator.className = 'qnc-save-indicator'
  indicator.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    <span>Saved!</span>
  `

  if (position) {
    indicator.style.left = `${position.x}px`
    indicator.style.top = `${position.y}px`
  } else {
    indicator.style.right = '20px'
    indicator.style.top = '20px'
  }

  document.body.appendChild(indicator)

  setTimeout(() => {
    indicator.classList.add('qnc-fade-out')
    setTimeout(() => indicator.remove(), 300)
  }, 1500)
}

// Add keyboard shortcut listener for quick capture
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Shift + S to quick save selection
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
    e.preventDefault()
    const selectedText = window.getSelection().toString().trim()

    if (selectedText) {
      chrome.runtime.sendMessage({
        action: 'quickSave',
        data: {
          content: selectedText,
          type: 'highlight',
          sourceUrl: window.location.href,
          sourceTitle: document.title,
        },
      })
    } else {
      // Open popup if no selection
      chrome.runtime.sendMessage({ action: 'openPopup' })
    }
  }
})

// Detect if page has interesting content to save
function analyzePageContent() {
  const isArticle =
    document.querySelector('article') ||
    document.querySelector('[role="article"]') ||
    document.querySelector('.post') ||
    document.querySelector('.article')

  const hasVideo =
    document.querySelector('video') ||
    document.querySelector('iframe[src*="youtube"]') ||
    document.querySelector('iframe[src*="vimeo"]')

  const wordCount = document.body.innerText.split(/\s+/).length

  // Platform detection
  const platform = detectPlatform()

  return {
    isArticle: !!isArticle,
    hasVideo: !!hasVideo,
    wordCount,
    estimatedReadTime: Math.ceil(wordCount / 200),
    platform,
  }
}

// Detect current platform for enhanced features
function detectPlatform() {
  const url = window.location.href
  const hostname = window.location.hostname

  // YouTube
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    return {
      name: 'youtube',
      type: 'video',
      videoId: getYouTubeVideoId(),
      hasTranscript: checkYouTubeTranscript(),
      channelName: getYouTubeChannelName(),
      videoTitle: document.querySelector('h1.ytd-watch-metadata')?.textContent?.trim() ||
                  document.querySelector('h1.title')?.textContent?.trim() ||
                  document.title,
    }
  }

  // Twitter/X
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return {
      name: 'twitter',
      type: 'social',
      isThread: checkIfTwitterThread(),
      tweetId: getTwitterTweetId(),
      author: getTwitterAuthor(),
    }
  }

  // Medium
  if (hostname.includes('medium.com') || document.querySelector('[data-post-id]')) {
    return {
      name: 'medium',
      type: 'article',
      author: document.querySelector('[data-testid="authorName"]')?.textContent ||
              document.querySelector('.author-name')?.textContent,
    }
  }

  // Substack
  if (hostname.includes('substack.com') || document.querySelector('[data-component="SubscribeButton"]')) {
    return {
      name: 'substack',
      type: 'article',
      author: document.querySelector('.byline-author')?.textContent,
    }
  }

  // GitHub
  if (hostname.includes('github.com')) {
    return {
      name: 'github',
      type: 'code',
      repo: getGitHubRepo(),
      isIssue: url.includes('/issues/'),
      isPR: url.includes('/pull/'),
    }
  }

  // Reddit
  if (hostname.includes('reddit.com')) {
    return {
      name: 'reddit',
      type: 'social',
      subreddit: getRedditSubreddit(),
    }
  }

  // Hacker News
  if (hostname.includes('news.ycombinator.com')) {
    return {
      name: 'hackernews',
      type: 'news',
    }
  }

  // Podcast platforms
  if (hostname.includes('podcasts.apple.com') ||
      hostname.includes('spotify.com') ||
      hostname.includes('overcast.fm') ||
      hostname.includes('pocketcasts.com')) {
    return {
      name: 'podcast',
      type: 'audio',
    }
  }

  return {
    name: 'generic',
    type: 'unknown',
  }
}

// YouTube helpers
function getYouTubeVideoId() {
  const url = new URL(window.location.href)
  return url.searchParams.get('v') || url.pathname.split('/').pop()
}

function checkYouTubeTranscript() {
  // Check if transcript button exists
  return !!(
    document.querySelector('button[aria-label*="transcript"]') ||
    document.querySelector('[data-service-endpoint*="transcript"]') ||
    document.querySelector('ytd-engagement-panel-section-list-renderer[target-id*="transcript"]')
  )
}

function getYouTubeChannelName() {
  return document.querySelector('#channel-name a')?.textContent?.trim() ||
         document.querySelector('ytd-channel-name a')?.textContent?.trim()
}

// Twitter helpers
function getTwitterTweetId() {
  const match = window.location.pathname.match(/\/status\/(\d+)/)
  return match ? match[1] : null
}

function checkIfTwitterThread() {
  // Check for thread indicators
  const tweets = document.querySelectorAll('[data-testid="tweet"]')
  if (tweets.length > 1) {
    // Check if tweets are from same author
    const authors = new Set()
    tweets.forEach(tweet => {
      const author = tweet.querySelector('[data-testid="User-Name"]')?.textContent
      if (author) authors.add(author)
    })
    return authors.size === 1 && tweets.length > 1
  }
  return false
}

function getTwitterAuthor() {
  return document.querySelector('[data-testid="User-Name"] span')?.textContent ||
         document.querySelector('.ProfileHeaderCard-nameLink')?.textContent
}

// GitHub helpers
function getGitHubRepo() {
  const match = window.location.pathname.match(/^\/([^/]+)\/([^/]+)/)
  return match ? `${match[1]}/${match[2]}` : null
}

// Reddit helpers
function getRedditSubreddit() {
  const match = window.location.pathname.match(/^\/r\/([^/]+)/)
  return match ? match[1] : null
}

// Extract Twitter thread content
async function extractTwitterThread() {
  if (detectPlatform().name !== 'twitter' || !checkIfTwitterThread()) {
    return null
  }

  const tweets = []
  document.querySelectorAll('[data-testid="tweet"]').forEach(tweet => {
    const tweetText = tweet.querySelector('[data-testid="tweetText"]')?.textContent
    const time = tweet.querySelector('time')?.getAttribute('datetime')
    const likes = tweet.querySelector('[data-testid="like"]')?.textContent
    const retweets = tweet.querySelector('[data-testid="retweet"]')?.textContent

    if (tweetText) {
      tweets.push({
        text: tweetText,
        time,
        likes,
        retweets,
      })
    }
  })

  return {
    author: getTwitterAuthor(),
    tweetCount: tweets.length,
    tweets,
    url: window.location.href,
  }
}

// Message handler for thread extraction
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSelection') {
    const selectedText = window.getSelection().toString().trim()
    sendResponse({ selectedText })
  }

  if (message.action === 'getPageInfo') {
    sendResponse({
      url: window.location.href,
      title: document.title,
      description: getMetaDescription(),
      images: getPageImages(),
      platform: detectPlatform(),
    })
  }

  if (message.action === 'extractTwitterThread') {
    extractTwitterThread().then(thread => {
      sendResponse({ thread })
    })
    return true // Keep channel open for async response
  }

  if (message.action === 'getYouTubeInfo') {
    sendResponse({
      videoId: getYouTubeVideoId(),
      title: document.querySelector('h1.ytd-watch-metadata')?.textContent?.trim() ||
             document.title,
      channel: getYouTubeChannelName(),
      hasTranscript: checkYouTubeTranscript(),
    })
  }

  if (message.action === 'highlightSaved') {
    showSaveIndicator(message.position)
  }

  return true
})

// Expose page analysis to popup
window.qncPageAnalysis = analyzePageContent()

console.log('KnowNote content script loaded', window.qncPageAnalysis)

// ===========================================
// Related Notes Sidebar Feature
// ===========================================

const NOTES_API_BASE_URL = 'https://notes.amirhjalali.com'

/**
 * Create the sidebar container using SAFE DOM methods only
 * SECURITY: Never use innerHTML with dynamic content
 */
function createSidebar() {
  // Check if sidebar already exists
  if (document.getElementById('notes-sidebar')) {
    return document.getElementById('notes-sidebar')
  }

  const sidebar = document.createElement('div')
  sidebar.id = 'notes-sidebar'

  // Header
  const header = document.createElement('div')
  header.className = 'sidebar-header'

  const title = document.createElement('h3')
  title.textContent = 'Related Notes'
  header.appendChild(title)

  const closeBtn = document.createElement('button')
  closeBtn.className = 'close-btn'
  closeBtn.textContent = '\u00D7' // Unicode multiplication sign (x)
  closeBtn.setAttribute('aria-label', 'Close sidebar')
  closeBtn.addEventListener('click', closeSidebar)
  header.appendChild(closeBtn)

  sidebar.appendChild(header)

  // Context info showing current page
  const contextInfo = document.createElement('div')
  contextInfo.className = 'context-info'

  const contextLabel = document.createElement('p')
  contextLabel.textContent = 'Showing notes related to:'

  const pageTitle = document.createElement('span')
  pageTitle.className = 'page-title'
  pageTitle.textContent = document.title || window.location.hostname

  contextLabel.appendChild(pageTitle)
  contextInfo.appendChild(contextLabel)
  sidebar.appendChild(contextInfo)

  // Search input
  const searchContainer = document.createElement('div')
  searchContainer.className = 'sidebar-search'

  const searchInput = document.createElement('input')
  searchInput.type = 'text'
  searchInput.className = 'search-input'
  searchInput.placeholder = 'Search your notes...'
  searchInput.setAttribute('aria-label', 'Search notes')

  // Debounced search on input
  let searchTimeout = null
  searchInput.addEventListener('input', (e) => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      const query = e.target.value.trim()
      if (query.length >= 2) {
        searchRelatedNotes(query).then(renderRelatedNotes)
      } else if (query.length === 0) {
        // Reset to page-based search
        searchRelatedNotes().then(renderRelatedNotes)
      }
    }, 300)
  })

  searchContainer.appendChild(searchInput)
  sidebar.appendChild(searchContainer)

  // Content area
  const content = document.createElement('div')
  content.id = 'sidebar-content'
  content.className = 'sidebar-content'
  sidebar.appendChild(content)

  document.body.appendChild(sidebar)
  return sidebar
}

/**
 * Show loading state in the sidebar
 */
function showLoadingState() {
  const content = document.getElementById('sidebar-content')
  if (!content) return

  // Clear content safely
  while (content.firstChild) {
    content.removeChild(content.firstChild)
  }

  const loadingContainer = document.createElement('div')
  loadingContainer.className = 'loading-state'

  const spinner = document.createElement('div')
  spinner.className = 'loading-spinner'
  loadingContainer.appendChild(spinner)

  const loadingText = document.createElement('span')
  loadingText.className = 'loading-text'
  loadingText.textContent = 'Finding related notes...'
  loadingContainer.appendChild(loadingText)

  content.appendChild(loadingContainer)
}

/**
 * Show error state with retry option
 */
function showErrorState(message, onRetry) {
  const content = document.getElementById('sidebar-content')
  if (!content) return

  // Clear content safely
  while (content.firstChild) {
    content.removeChild(content.firstChild)
  }

  const errorContainer = document.createElement('div')
  errorContainer.className = 'error-message'

  const errorTitle = document.createElement('div')
  errorTitle.className = 'error-title'
  errorTitle.textContent = 'Unable to load notes'
  errorContainer.appendChild(errorTitle)

  const errorText = document.createElement('p')
  errorText.textContent = message || 'Please check your connection and try again.'
  errorContainer.appendChild(errorText)

  if (onRetry) {
    const retryBtn = document.createElement('button')
    retryBtn.className = 'retry-btn'
    retryBtn.textContent = 'Try Again'
    retryBtn.addEventListener('click', onRetry)
    errorContainer.appendChild(retryBtn)
  }

  content.appendChild(errorContainer)
}

/**
 * Show sign-in prompt
 */
function showSignInPrompt() {
  const content = document.getElementById('sidebar-content')
  if (!content) return

  // Clear content safely
  while (content.firstChild) {
    content.removeChild(content.firstChild)
  }

  const promptContainer = document.createElement('div')
  promptContainer.className = 'signin-prompt'

  const promptText = document.createElement('p')
  promptText.textContent = 'Sign in to your Notes account to see related notes from your knowledge base.'
  promptContainer.appendChild(promptText)

  const signInBtn = document.createElement('button')
  signInBtn.className = 'signin-btn'
  signInBtn.textContent = 'Sign In'
  signInBtn.addEventListener('click', () => {
    // Sanitize URL before opening
    const signInUrl = NOTES_API_BASE_URL + '/auth/signin'
    if (signInUrl.startsWith('https://notes.amirhjalali.com')) {
      window.open(signInUrl, '_blank', 'noopener,noreferrer')
    }
  })
  promptContainer.appendChild(signInBtn)

  content.appendChild(promptContainer)
}

/**
 * Search for related notes based on current page or custom query
 * @param {string} customQuery - Optional custom search query
 * @returns {Promise<Array>} - Array of related notes
 */
async function searchRelatedNotes(customQuery = null) {
  const pageTitle = document.title || ''
  const pageUrl = window.location.href

  // Use custom query if provided, otherwise use page title
  const query = customQuery || pageTitle

  if (!query || query.trim().length === 0) {
    return []
  }

  try {
    const response = await fetch(`${NOTES_API_BASE_URL}/api/notes/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        query: query.slice(0, 200), // Limit query length for safety
        limit: 10,
        context: {
          url: pageUrl,
          title: pageTitle,
        },
      }),
    })

    if (response.status === 401 || response.status === 403) {
      // User not authenticated
      return { error: 'auth' }
    }

    if (!response.ok) {
      console.error('Notes search failed:', response.status)
      return { error: 'fetch' }
    }

    const data = await response.json()
    return data.results || data.notes || []
  } catch (error) {
    console.error('Failed to search notes:', error)
    return { error: 'network' }
  }
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatNoteDate(dateString) {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  } catch {
    return ''
  }
}

/**
 * Render notes in sidebar using SAFE DOM methods only
 * SECURITY: Never use innerHTML with any data from the API
 * @param {Array|Object} notes - Notes to render or error object
 */
function renderRelatedNotes(notes) {
  const content = document.getElementById('sidebar-content')
  if (!content) return

  // Clear content safely
  while (content.firstChild) {
    content.removeChild(content.firstChild)
  }

  // Handle error states
  if (notes && notes.error) {
    if (notes.error === 'auth') {
      showSignInPrompt()
    } else {
      showErrorState('Could not load notes.', () => {
        showLoadingState()
        searchRelatedNotes().then(renderRelatedNotes)
      })
    }
    return
  }

  // Handle empty results
  if (!Array.isArray(notes) || notes.length === 0) {
    const empty = document.createElement('p')
    empty.className = 'empty-message'
    empty.textContent = 'No related notes found. Save some notes first, or try a different search.'
    content.appendChild(empty)
    return
  }

  // Render each note using safe DOM methods
  notes.forEach((note) => {
    const item = document.createElement('div')
    item.className = 'note-item'
    item.setAttribute('role', 'button')
    item.setAttribute('tabindex', '0')

    // Title (safely set as textContent, never innerHTML)
    const itemTitle = document.createElement('h4')
    itemTitle.textContent = note.title || 'Untitled'
    item.appendChild(itemTitle)

    // Excerpt/content preview
    if (note.excerpt || note.content) {
      const excerpt = document.createElement('p')
      excerpt.className = 'note-excerpt'
      const excerptText = (note.excerpt || note.content || '').slice(0, 150)
      excerpt.textContent = excerptText + (excerptText.length >= 150 ? '...' : '')
      item.appendChild(excerpt)
    }

    // Meta info (type and date)
    const meta = document.createElement('div')
    meta.className = 'note-meta'

    if (note.type) {
      const typeLabel = document.createElement('span')
      typeLabel.className = 'note-type'
      typeLabel.textContent = note.type
      meta.appendChild(typeLabel)
    }

    const dateLabel = document.createElement('span')
    dateLabel.className = 'note-date'
    dateLabel.textContent = formatNoteDate(note.createdAt || note.updatedAt)
    if (dateLabel.textContent) {
      meta.appendChild(dateLabel)
    }

    if (meta.children.length > 0) {
      item.appendChild(meta)
    }

    // Click handler to open note
    const openNote = () => {
      // Validate and sanitize the note ID before constructing URL
      const noteId = String(note.id || '').replace(/[^a-zA-Z0-9_-]/g, '')
      if (noteId) {
        const noteUrl = `${NOTES_API_BASE_URL}/notes/${noteId}`
        // Additional URL validation
        if (noteUrl.startsWith('https://notes.amirhjalali.com/notes/')) {
          window.open(noteUrl, '_blank', 'noopener,noreferrer')
        }
      }
    }

    item.addEventListener('click', openNote)
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openNote()
      }
    })

    content.appendChild(item)
  })
}

/**
 * Toggle the sidebar open/closed
 */
function toggleSidebar() {
  let sidebar = document.getElementById('notes-sidebar')

  if (!sidebar) {
    sidebar = createSidebar()
  }

  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open')
  } else {
    sidebar.classList.add('open')
    // Show loading and fetch notes
    showLoadingState()
    searchRelatedNotes().then(renderRelatedNotes)
  }
}

/**
 * Close the sidebar
 */
function closeSidebar() {
  const sidebar = document.getElementById('notes-sidebar')
  if (sidebar) {
    sidebar.classList.remove('open')
  }
}

/**
 * Open the sidebar (used by service worker)
 */
function openSidebar() {
  let sidebar = document.getElementById('notes-sidebar')

  if (!sidebar) {
    sidebar = createSidebar()
  }

  if (!sidebar.classList.contains('open')) {
    sidebar.classList.add('open')
    showLoadingState()
    searchRelatedNotes().then(renderRelatedNotes)
  }
}

// Listen for messages from service worker to toggle sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle-sidebar') {
    toggleSidebar()
    sendResponse({ success: true })
    return true
  }

  if (request.action === 'open-sidebar') {
    openSidebar()
    sendResponse({ success: true })
    return true
  }

  if (request.action === 'close-sidebar') {
    closeSidebar()
    sendResponse({ success: true })
    return true
  }
})

// Keyboard shortcut for sidebar (Alt+Shift+N)
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'n') {
    e.preventDefault()
    toggleSidebar()
  }
})

console.log('KnowNote sidebar feature initialized')
