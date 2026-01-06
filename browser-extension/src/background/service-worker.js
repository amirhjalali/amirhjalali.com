// Background Service Worker
const API_BASE_URL = 'https://amirhjalali.com'

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu items
  chrome.contextMenus.create({
    id: 'saveSelection',
    title: 'Save to Notes',
    contexts: ['selection'],
  })

  chrome.contextMenus.create({
    id: 'saveLink',
    title: 'Save Link to Notes',
    contexts: ['link'],
  })

  chrome.contextMenus.create({
    id: 'saveImage',
    title: 'Save Image to Notes',
    contexts: ['image'],
  })

  chrome.contextMenus.create({
    id: 'savePage',
    title: 'Save Page to Notes',
    contexts: ['page'],
  })

  console.log('Quick Notes Capture extension installed')
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let noteData = {
    sourceUrl: tab.url,
    sourceTitle: tab.title,
    timestamp: Date.now(),
  }

  switch (info.menuItemId) {
    case 'saveSelection':
      noteData.content = info.selectionText
      noteData.type = 'highlight'
      break

    case 'saveLink':
      noteData.content = info.linkUrl
      noteData.type = 'link'
      break

    case 'saveImage':
      noteData.content = info.srcUrl
      noteData.type = 'link'
      noteData.imageUrl = info.srcUrl
      break

    case 'savePage':
      noteData.content = tab.url
      noteData.type = 'link'
      break
  }

  await quickSave(noteData, tab)
})

// Quick save from context menu
async function quickSave(noteData, tab) {
  try {
    const settings = await chrome.storage.sync.get(['apiUrl', 'authToken'])
    const apiUrl = settings.apiUrl || API_BASE_URL

    const response = await fetch(`${apiUrl}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.authToken || ''}`,
      },
      body: JSON.stringify(noteData),
    })

    if (response.ok) {
      // Show success notification
      chrome.action.setBadgeText({ text: '✓', tabId: tab.id })
      chrome.action.setBadgeBackgroundColor({ color: '#FFFFFF' })

      setTimeout(() => {
        chrome.action.setBadgeText({ text: '', tabId: tab.id })
      }, 2000)

      // Add to recent saves
      const savedNote = await response.json()
      await addToRecentSaves(savedNote)
    } else {
      throw new Error('API error')
    }
  } catch (error) {
    console.error('Quick save failed:', error)

    // Save locally
    await saveLocally(noteData)

    // Show offline indicator
    chrome.action.setBadgeText({ text: '!', tabId: tab.id })
    chrome.action.setBadgeBackgroundColor({ color: '#888888' })

    setTimeout(() => {
      chrome.action.setBadgeText({ text: '', tabId: tab.id })
    }, 2000)
  }
}

// Save locally when offline
async function saveLocally(noteData) {
  const localNote = {
    id: `local_${Date.now()}`,
    ...noteData,
    createdAt: new Date().toISOString(),
    synced: false,
  }

  const { pendingNotes = [] } = await chrome.storage.local.get('pendingNotes')
  pendingNotes.push(localNote)
  await chrome.storage.local.set({ pendingNotes })

  await addToRecentSaves(localNote)
}

// Add to recent saves
async function addToRecentSaves(note) {
  const { recentSaves = [] } = await chrome.storage.local.get('recentSaves')

  const recentNote = {
    id: note.id,
    title: note.sourceTitle || note.content?.substring(0, 50) || 'Untitled',
    type: note.type,
    timestamp: Date.now(),
    synced: note.synced !== false,
  }

  recentSaves.unshift(recentNote)

  if (recentSaves.length > 10) {
    recentSaves.pop()
  }

  await chrome.storage.local.set({ recentSaves })
}

// Sync pending notes when online
async function syncPendingNotes() {
  const { pendingNotes = [] } = await chrome.storage.local.get('pendingNotes')
  if (!pendingNotes.length) return

  const settings = await chrome.storage.sync.get(['apiUrl', 'authToken'])
  const apiUrl = settings.apiUrl || API_BASE_URL

  const synced = []
  const failed = []

  for (const note of pendingNotes) {
    try {
      const response = await fetch(`${apiUrl}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.authToken || ''}`,
        },
        body: JSON.stringify(note),
      })

      if (response.ok) {
        synced.push(note.id)
      } else {
        failed.push(note)
      }
    } catch (error) {
      failed.push(note)
    }
  }

  // Update pending notes
  await chrome.storage.local.set({ pendingNotes: failed })

  if (synced.length > 0) {
    console.log(`Synced ${synced.length} notes`)
  }
}

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'syncNotes') {
    syncPendingNotes().then(() => sendResponse({ success: true }))
    return true
  }

  if (message.action === 'getTabInfo') {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      sendResponse({
        url: tab.url,
        title: tab.title,
        favIconUrl: tab.favIconUrl,
      })
    })
    return true
  }
})

// Keyboard shortcut handler
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'quick-save') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    // Try to get selection first
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSelection' })
      if (response?.selectedText) {
        await quickSave(
          {
            content: response.selectedText,
            type: 'highlight',
            sourceUrl: tab.url,
            sourceTitle: tab.title,
          },
          tab
        )
        return
      }
    } catch (e) {
      // No content script or no selection
    }

    // Save page URL as fallback
    await quickSave(
      {
        content: tab.url,
        type: 'link',
        sourceUrl: tab.url,
        sourceTitle: tab.title,
      },
      tab
    )
  }
})

// Attempt sync when extension starts
syncPendingNotes()

// Attempt sync periodically
chrome.alarms.create('syncNotes', { periodInMinutes: 5 })
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncNotes') {
    syncPendingNotes()
  }
})
