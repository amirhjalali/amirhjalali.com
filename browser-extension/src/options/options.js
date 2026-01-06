// Options Page Script
const DEFAULT_API_URL = 'https://amirhjalali.com'

// DOM Elements
const elements = {
  form: document.getElementById('settingsForm'),
  apiUrl: document.getElementById('apiUrl'),
  authToken: document.getElementById('authToken'),
  connectionStatus: document.getElementById('connectionStatus'),
  testConnection: document.getElementById('testConnection'),
  showContextMenu: document.getElementById('showContextMenu'),
  autoSync: document.getElementById('autoSync'),
  defaultType: document.getElementById('defaultType'),
  offlineCount: document.getElementById('offlineCount'),
  syncNow: document.getElementById('syncNow'),
  recentCount: document.getElementById('recentCount'),
  clearRecent: document.getElementById('clearRecent'),
  resetSettings: document.getElementById('resetSettings'),
}

// Load settings
async function loadSettings() {
  const settings = await chrome.storage.sync.get([
    'apiUrl',
    'authToken',
    'showContextMenu',
    'autoSync',
    'defaultType',
  ])

  elements.apiUrl.value = settings.apiUrl || ''
  elements.authToken.value = settings.authToken || ''
  elements.showContextMenu.checked = settings.showContextMenu !== false
  elements.autoSync.checked = settings.autoSync !== false
  elements.defaultType.value = settings.defaultType || 'auto'

  await updateDataCounts()
  await testConnectionStatus()
}

// Save settings
async function saveSettings(e) {
  e.preventDefault()

  const settings = {
    apiUrl: elements.apiUrl.value.trim() || '',
    authToken: elements.authToken.value.trim() || '',
    showContextMenu: elements.showContextMenu.checked,
    autoSync: elements.autoSync.checked,
    defaultType: elements.defaultType.value,
  }

  await chrome.storage.sync.set(settings)

  showToast('Settings saved!')
  await testConnectionStatus()
}

// Test connection
async function testConnectionStatus() {
  const status = elements.connectionStatus
  status.textContent = 'Testing...'
  status.className = 'status testing'

  try {
    const settings = await chrome.storage.sync.get(['apiUrl', 'authToken'])
    const apiUrl = settings.apiUrl || DEFAULT_API_URL

    const response = await fetch(`${apiUrl}/api/notes/health`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${settings.authToken || ''}`,
      },
    })

    if (response.ok) {
      status.textContent = 'Connected'
      status.className = 'status connected'
    } else {
      throw new Error('Auth failed')
    }
  } catch (error) {
    status.textContent = 'Not connected'
    status.className = 'status disconnected'
  }
}

// Update data counts
async function updateDataCounts() {
  const { pendingNotes = [], recentSaves = [] } = await chrome.storage.local.get([
    'pendingNotes',
    'recentSaves',
  ])

  elements.offlineCount.textContent = pendingNotes.length
  elements.recentCount.textContent = recentSaves.length

  elements.syncNow.disabled = pendingNotes.length === 0
}

// Sync offline notes
async function syncOfflineNotes() {
  elements.syncNow.textContent = 'Syncing...'
  elements.syncNow.disabled = true

  await chrome.runtime.sendMessage({ action: 'syncNotes' })

  elements.syncNow.textContent = 'Sync Now'
  await updateDataCounts()
  showToast('Sync complete!')
}

// Clear recent history
async function clearRecentHistory() {
  await chrome.storage.local.set({ recentSaves: [] })
  await updateDataCounts()
  showToast('History cleared!')
}

// Reset to defaults
async function resetToDefaults() {
  if (!confirm('Reset all settings to defaults?')) return

  await chrome.storage.sync.clear()
  await loadSettings()
  showToast('Settings reset!')
}

// Show toast notification
function showToast(message) {
  let toast = document.querySelector('.toast')
  if (!toast) {
    toast = document.createElement('div')
    toast.className = 'toast'
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      padding: 12px 24px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: #EAEAEA;
      font-size: 13px;
      opacity: 0;
      transition: all 0.3s;
    `
    document.body.appendChild(toast)
  }

  toast.textContent = message
  toast.style.transform = 'translateX(-50%) translateY(0)'
  toast.style.opacity = '1'

  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)'
    toast.style.opacity = '0'
  }, 2000)
}

// Event listeners
elements.form.addEventListener('submit', saveSettings)
elements.testConnection.addEventListener('click', testConnectionStatus)
elements.syncNow.addEventListener('click', syncOfflineNotes)
elements.clearRecent.addEventListener('click', clearRecentHistory)
elements.resetSettings.addEventListener('click', resetToDefaults)

// Initialize
loadSettings()
