// Configuration
const API_BASE_URL = 'https://amirhjalali.com'
const DEV_API_URL = 'http://localhost:3000'

// State
let currentPageInfo = null
let selectedText = ''

// DOM Elements
const elements = {
  status: document.getElementById('status'),
  captureUrl: document.getElementById('captureUrl'),
  captureSelection: document.getElementById('captureSelection'),
  captureScreenshot: document.getElementById('captureScreenshot'),
  noteContent: document.getElementById('noteContent'),
  tagsInput: document.getElementById('tagsInput'),
  saveNote: document.getElementById('saveNote'),
  openNotes: document.getElementById('openNotes'),
  recentList: document.getElementById('recentList'),
}

// Initialize popup
async function init() {
  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab) {
    currentPageInfo = {
      url: tab.url,
      title: tab.title,
      favIconUrl: tab.favIconUrl,
    }
  }

  // Get page info from content script including platform detection
  try {
    const pageInfo = await chrome.tabs.sendMessage(tab.id, { action: 'getPageInfo' })
    if (pageInfo) {
      currentPageInfo = { ...currentPageInfo, ...pageInfo }
      // Show platform-specific UI
      updatePlatformUI(pageInfo.platform)
    }

    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSelection' })
    if (response?.selectedText) {
      selectedText = response.selectedText
      elements.noteContent.value = selectedText
      // Auto-select highlight type for selections
      document.querySelector('input[name="noteType"][value="highlight"]').checked = true
    }
  } catch (e) {
    // Content script not loaded
    console.log('Content script not available')
  }

  // Check API connection
  await checkApiStatus()

  // Load recent saves
  await loadRecentSaves()

  // Setup event listeners
  setupEventListeners()
}

// Platform icon SVGs (static content, safe for innerHTML)
const PLATFORM_ICONS = {
  youtube: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2c-.3-1-1-1.8-2-2.1C19.7 3.5 12 3.5 12 3.5s-7.7 0-9.5.6c-1 .3-1.7 1.1-2 2.1C0 8 0 12 0 12s0 4 .5 5.8c.3 1 1 1.8 2 2.1 1.8.6 9.5.6 9.5.6s7.7 0 9.5-.6c1-.3 1.7-1.1 2-2.1.5-1.8.5-5.8.5-5.8s0-4-.5-5.8zM9.5 15.5v-7l6.3 3.5-6.3 3.5z"/></svg>',
  twitter: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  article: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h10v2H4v-2zm0 4h16v2H4v-2zm0 4h10v2H4v-2z"/></svg>',
  github: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>',
  podcast: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/></svg>',
  transcript: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h10v2H4v-2zm0 4h16v2H4v-2z"/></svg>',
  thread: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h8"/><path d="M8 14h4"/></svg>',
}

// Update UI based on detected platform
function updatePlatformUI(platform) {
  if (!platform) return

  const platformBadge = document.createElement('span')
  platformBadge.className = 'platform-badge'

  // Build badge content based on platform (all static content)
  let iconHtml = ''
  let labelText = ''

  switch (platform.name) {
    case 'youtube':
      iconHtml = PLATFORM_ICONS.youtube
      labelText = 'YouTube' + (platform.hasTranscript ? ' (Transcript)' : '')
      if (platform.hasTranscript) {
        addTranscriptButton()
      }
      break

    case 'twitter':
      iconHtml = PLATFORM_ICONS.twitter
      labelText = 'X' + (platform.isThread ? ' (Thread)' : '')
      if (platform.isThread) {
        addThreadButton()
      }
      break

    case 'medium':
    case 'substack':
      iconHtml = PLATFORM_ICONS.article
      labelText = platform.name.charAt(0).toUpperCase() + platform.name.slice(1)
      break

    case 'github':
      iconHtml = PLATFORM_ICONS.github
      labelText = 'GitHub' + (platform.isIssue ? ' Issue' : platform.isPR ? ' PR' : '')
      break

    case 'podcast':
      iconHtml = PLATFORM_ICONS.podcast
      labelText = 'Podcast'
      break

    default:
      return
  }

  // Create badge with static icon and label
  const iconSpan = document.createElement('span')
  iconSpan.innerHTML = iconHtml // Safe: static SVG from PLATFORM_ICONS
  const labelSpan = document.createElement('span')
  labelSpan.textContent = labelText // Safe: using textContent

  platformBadge.appendChild(iconSpan)
  platformBadge.appendChild(labelSpan)

  const header = document.querySelector('.header')
  const existingBadge = header.querySelector('.platform-badge')
  if (existingBadge) {
    existingBadge.remove()
  }
  header.appendChild(platformBadge)
}

// Add transcript button for YouTube videos
function addTranscriptButton() {
  const captureOptions = document.querySelector('.capture-options')
  const transcriptBtn = document.createElement('button')
  transcriptBtn.className = 'capture-btn transcript-btn'
  transcriptBtn.id = 'captureTranscript'
  transcriptBtn.title = 'Save with transcript'

  const iconSpan = document.createElement('span')
  iconSpan.innerHTML = PLATFORM_ICONS.transcript // Safe: static SVG
  const textSpan = document.createElement('span')
  textSpan.textContent = '+ Transcript'

  transcriptBtn.appendChild(iconSpan)
  transcriptBtn.appendChild(textSpan)
  transcriptBtn.addEventListener('click', saveWithTranscript)
  captureOptions.appendChild(transcriptBtn)
}

// Add thread button for Twitter threads
function addThreadButton() {
  const captureOptions = document.querySelector('.capture-options')
  const threadBtn = document.createElement('button')
  threadBtn.className = 'capture-btn thread-btn'
  threadBtn.id = 'captureThread'
  threadBtn.title = 'Save entire thread'

  const iconSpan = document.createElement('span')
  iconSpan.innerHTML = PLATFORM_ICONS.thread // Safe: static SVG
  const textSpan = document.createElement('span')
  textSpan.textContent = 'Save Thread'

  threadBtn.appendChild(iconSpan)
  threadBtn.appendChild(textSpan)
  threadBtn.addEventListener('click', saveTwitterThread)
  captureOptions.appendChild(threadBtn)
}

// Save YouTube video with transcript
async function saveWithTranscript() {
  if (!currentPageInfo?.url) return

  const btn = document.getElementById('captureTranscript')
  btn.disabled = true
  btn.textContent = 'Loading...'

  try {
    const settings = await chrome.storage.sync.get(['apiUrl', 'authToken'])
    const apiUrl = settings.apiUrl || API_BASE_URL

    // Note: The backend will fetch the transcript automatically for YouTube URLs
    const noteData = {
      content: currentPageInfo.url,
      type: 'LINK',
      sourceUrl: currentPageInfo.url,
      sourceTitle: currentPageInfo.title,
      tags: elements.tagsInput.value.split(',').map(t => t.trim()).filter(Boolean),
      metadata: {
        requestTranscript: true,
        platform: 'youtube',
      },
    }

    const response = await fetch(`${apiUrl}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.authToken || ''}`,
      },
      body: JSON.stringify(noteData),
    })

    if (response.ok) {
      const savedNote = await response.json()
      await addToRecentSaves(savedNote)
      showToast('Saved with transcript!')
      elements.noteContent.value = ''
      elements.tagsInput.value = ''
    } else {
      throw new Error('Failed to save')
    }
  } catch (error) {
    console.error('Save with transcript error:', error)
    showToast('Failed to save')
  } finally {
    btn.disabled = false
    // Restore button content
    btn.textContent = ''
    const iconSpan = document.createElement('span')
    iconSpan.innerHTML = PLATFORM_ICONS.transcript
    const textSpan = document.createElement('span')
    textSpan.textContent = '+ Transcript'
    btn.appendChild(iconSpan)
    btn.appendChild(textSpan)
  }
}

// Save Twitter thread
async function saveTwitterThread() {
  const btn = document.getElementById('captureThread')
  btn.disabled = true
  btn.textContent = 'Extracting...'

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const threadData = await chrome.tabs.sendMessage(tab.id, { action: 'extractTwitterThread' })

    if (!threadData?.thread) {
      showToast('Could not extract thread')
      return
    }

    const settings = await chrome.storage.sync.get(['apiUrl', 'authToken'])
    const apiUrl = settings.apiUrl || API_BASE_URL

    // Format thread content
    const threadContent = threadData.thread.tweets
      .map((t, i) => `${i + 1}. ${t.text}`)
      .join('\n\n')

    const noteData = {
      content: currentPageInfo.url,
      type: 'LINK',
      sourceUrl: currentPageInfo.url,
      sourceTitle: `Thread by ${threadData.thread.author}`,
      fullContent: threadContent,
      tags: ['twitter-thread', ...elements.tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)],
      metadata: {
        platform: 'twitter',
        isThread: true,
        tweetCount: threadData.thread.tweetCount,
        author: threadData.thread.author,
      },
    }

    const response = await fetch(`${apiUrl}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.authToken || ''}`,
      },
      body: JSON.stringify(noteData),
    })

    if (response.ok) {
      const savedNote = await response.json()
      await addToRecentSaves(savedNote)
      showToast(`Thread saved! (${threadData.thread.tweetCount} tweets)`)
      elements.noteContent.value = ''
      elements.tagsInput.value = ''
    } else {
      throw new Error('Failed to save')
    }
  } catch (error) {
    console.error('Save thread error:', error)
    showToast('Failed to save thread')
  } finally {
    btn.disabled = false
    // Restore button content
    btn.textContent = ''
    const iconSpan = document.createElement('span')
    iconSpan.innerHTML = PLATFORM_ICONS.thread
    const textSpan = document.createElement('span')
    textSpan.textContent = 'Save Thread'
    btn.appendChild(iconSpan)
    btn.appendChild(textSpan)
  }
}

// Check API status
async function checkApiStatus() {
  try {
    const settings = await chrome.storage.sync.get(['apiUrl', 'authToken'])
    const apiUrl = settings.apiUrl || API_BASE_URL

    const response = await fetch(`${apiUrl}/api/notes/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${settings.authToken || ''}`,
      },
    })

    if (response.ok) {
      elements.status.textContent = 'Connected'
      elements.status.classList.add('connected')
      elements.status.classList.remove('error')
    } else {
      throw new Error('API not available')
    }
  } catch (error) {
    elements.status.textContent = 'Offline'
    elements.status.classList.add('error')
    elements.status.classList.remove('connected')
  }
}

// Setup event listeners
function setupEventListeners() {
  // Capture buttons
  elements.captureUrl.addEventListener('click', captureCurrentUrl)
  elements.captureSelection.addEventListener('click', captureSelection)
  elements.captureScreenshot.addEventListener('click', captureScreenshot)

  // Save button
  elements.saveNote.addEventListener('click', saveNote)

  // Open notes
  elements.openNotes.addEventListener('click', () => {
    chrome.tabs.create({ url: `${API_BASE_URL}/notes` })
  })

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      saveNote()
    }
  })
}

// Capture current URL
async function captureCurrentUrl() {
  if (!currentPageInfo) return

  elements.noteContent.value = currentPageInfo.url
  document.querySelector('input[name="noteType"][value="link"]').checked = true
  showToast('URL captured')
}

// Capture selection
async function captureSelection() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSelection' })

    if (response?.selectedText) {
      elements.noteContent.value = response.selectedText
      document.querySelector('input[name="noteType"][value="highlight"]').checked = true
      showToast('Selection captured')
    } else {
      showToast('No text selected')
    }
  } catch (error) {
    showToast('Could not get selection')
  }
}

// Capture screenshot
async function captureScreenshot() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' })

    // Store in local storage temporarily
    await chrome.storage.local.set({
      pendingScreenshot: {
        dataUrl,
        pageUrl: currentPageInfo?.url,
        pageTitle: currentPageInfo?.title,
        timestamp: Date.now(),
      },
    })

    elements.noteContent.value = `[Screenshot of ${currentPageInfo?.title || 'page'}]`
    document.querySelector('input[name="noteType"][value="thought"]').checked = true
    showToast('Screenshot captured')
  } catch (error) {
    showToast('Could not capture screenshot')
    console.error(error)
  }
}

// Save note
async function saveNote() {
  const content = elements.noteContent.value.trim()
  if (!content) {
    showToast('Please enter some content')
    return
  }

  const noteType = document.querySelector('input[name="noteType"]:checked').value
  const tags = elements.tagsInput.value
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)

  elements.saveNote.disabled = true
  elements.saveNote.textContent = 'Saving...'

  try {
    const settings = await chrome.storage.sync.get(['apiUrl', 'authToken'])
    const apiUrl = settings.apiUrl || API_BASE_URL

    // Check for pending screenshot
    const { pendingScreenshot } = await chrome.storage.local.get('pendingScreenshot')

    const noteData = {
      content,
      type: noteType,
      sourceUrl: currentPageInfo?.url,
      sourceTitle: currentPageInfo?.title,
      tags,
      screenshot: pendingScreenshot?.dataUrl,
    }

    const response = await fetch(`${apiUrl}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.authToken || ''}`,
      },
      body: JSON.stringify(noteData),
    })

    if (response.ok) {
      const savedNote = await response.json()

      // Clear form
      elements.noteContent.value = ''
      elements.tagsInput.value = ''

      // Clear pending screenshot
      await chrome.storage.local.remove('pendingScreenshot')

      // Add to recent saves
      await addToRecentSaves(savedNote)

      showToast('Note saved!')
    } else {
      throw new Error('Failed to save')
    }
  } catch (error) {
    console.error('Save error:', error)

    // Save locally if API fails
    await saveLocally(content, noteType, tags)
    showToast('Saved locally (offline)')
  } finally {
    elements.saveNote.disabled = false
    elements.saveNote.textContent = 'Save Note'
  }
}

// Save locally when offline
async function saveLocally(content, type, tags) {
  const localNote = {
    id: `local_${Date.now()}`,
    content,
    type,
    tags,
    sourceUrl: currentPageInfo?.url,
    sourceTitle: currentPageInfo?.title,
    createdAt: new Date().toISOString(),
    synced: false,
  }

  const { pendingNotes = [] } = await chrome.storage.local.get('pendingNotes')
  pendingNotes.push(localNote)
  await chrome.storage.local.set({ pendingNotes })

  await addToRecentSaves(localNote)
}

// Load recent saves
async function loadRecentSaves() {
  const { recentSaves = [] } = await chrome.storage.local.get('recentSaves')
  renderRecentSaves(recentSaves)
}

// Add to recent saves
async function addToRecentSaves(note) {
  const { recentSaves = [] } = await chrome.storage.local.get('recentSaves')

  const recentNote = {
    id: note.id,
    title: note.sourceTitle || note.content.substring(0, 50),
    type: note.type,
    timestamp: Date.now(),
    synced: note.synced !== false,
  }

  recentSaves.unshift(recentNote)

  // Keep only last 10
  if (recentSaves.length > 10) {
    recentSaves.pop()
  }

  await chrome.storage.local.set({ recentSaves })
  renderRecentSaves(recentSaves)
}

// Render recent saves
function renderRecentSaves(saves) {
  if (!saves.length) {
    elements.recentList.innerHTML = '<p class="empty-state">No recent captures</p>'
    return
  }

  const typeIcons = {
    link: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    thought: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    highlight: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
  }

  elements.recentList.innerHTML = saves
    .map((save) => `
      <div class="recent-item" data-id="${save.id}">
        <span class="icon">${typeIcons[save.type] || typeIcons.thought}</span>
        <span class="title">${escapeHtml(save.title)}</span>
        <span class="time">${formatTime(save.timestamp)}</span>
      </div>
    `)
    .join('')

  // Add click handlers
  elements.recentList.querySelectorAll('.recent-item').forEach((item) => {
    item.addEventListener('click', () => {
      chrome.tabs.create({ url: `${API_BASE_URL}/notes/${item.dataset.id}` })
    })
  })
}

// Show toast notification
function showToast(message) {
  let toast = document.querySelector('.toast')
  if (!toast) {
    toast = document.createElement('div')
    toast.className = 'toast'
    document.body.appendChild(toast)
  }

  toast.textContent = message
  toast.classList.add('show')

  setTimeout(() => {
    toast.classList.remove('show')
  }, 2000)
}

// Helper: Format time
function formatTime(timestamp) {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

// Helper: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Initialize
init()
