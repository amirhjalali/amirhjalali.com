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

  // Get selected text from content script
  try {
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
