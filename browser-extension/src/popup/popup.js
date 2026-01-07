/**
 * Notes Browser Extension - Popup Script
 *
 * SECURITY: This script uses ONLY safe DOM manipulation methods:
 * - document.createElement() to create elements
 * - element.textContent = value for text content
 * - element.appendChild() to add to DOM
 * - element.classList.add/remove() for styling
 * - element.setAttribute() for attributes
 * - NEVER uses innerHTML with dynamic content
 */

// Configuration
const API_BASE_URL = 'https://notes.amirhjalali.com';

// State
let isAuthenticated = false;
let currentTabInfo = null;

// DOM Elements (cached on init)
const elements = {};

/**
 * Initialize the popup
 */
async function init() {
  // Cache DOM elements
  cacheElements();

  // Setup event listeners
  setupEventListeners();

  // Get current tab info
  await getCurrentTab();

  // Check authentication
  await checkAuth();

  // Load recent saves
  await loadRecentSaves();
}

/**
 * Cache DOM elements for reuse
 */
function cacheElements() {
  elements.status = document.getElementById('status');
  elements.authRequired = document.getElementById('authRequired');
  elements.mainContent = document.getElementById('mainContent');
  elements.recentSaves = document.getElementById('recentSaves');
  elements.pageTitle = document.getElementById('pageTitle');
  elements.pageUrl = document.getElementById('pageUrl');
  elements.saveBtn = document.getElementById('saveBtn');
  elements.signInBtn = document.getElementById('signInBtn');
  elements.noteContent = document.getElementById('noteContent');
  elements.tagsInput = document.getElementById('tagsInput');
  elements.recentList = document.getElementById('recentList');
  elements.openNotesLink = document.getElementById('openNotesLink');
  elements.toast = document.getElementById('toast');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Save button
  elements.saveBtn.addEventListener('click', savePage);

  // Sign in button
  elements.signInBtn.addEventListener('click', openSignIn);

  // Open notes link
  elements.openNotesLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: API_BASE_URL });
  });

  // Keyboard shortcut: Ctrl/Cmd + Enter to save
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      savePage();
    }
  });
}

/**
 * Get current tab information using chrome.tabs.query
 */
async function getCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab) {
      currentTabInfo = {
        url: tab.url,
        title: tab.title,
        favIconUrl: tab.favIconUrl,
      };

      // Update UI with page info using safe DOM methods
      elements.pageTitle.textContent = tab.title || 'Untitled Page';
      elements.pageUrl.textContent = tab.url || '';
    }
  } catch (error) {
    console.error('Error getting current tab:', error);
    elements.pageTitle.textContent = 'Could not get page info';
    elements.pageUrl.textContent = '';
  }
}

/**
 * Check authentication by making a test API call
 * GET /api/notes?limit=1 - if successful, user is authenticated
 */
async function checkAuth() {
  try {
    elements.status.textContent = 'Checking...';
    elements.status.classList.remove('connected', 'error');

    const response = await fetch(`${API_BASE_URL}/api/notes?limit=1`, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      // Authenticated
      isAuthenticated = true;
      showAuthenticatedUI();
      elements.status.textContent = 'Connected';
      elements.status.classList.add('connected');
    } else if (response.status === 401 || response.status === 403) {
      // Not authenticated
      isAuthenticated = false;
      showUnauthenticatedUI();
      elements.status.textContent = 'Sign in required';
      elements.status.classList.add('error');
    } else {
      throw new Error(`API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Auth check error:', error);
    isAuthenticated = false;
    showUnauthenticatedUI();
    elements.status.textContent = 'Offline';
    elements.status.classList.add('error');
  }
}

/**
 * Show UI for authenticated users
 */
function showAuthenticatedUI() {
  elements.authRequired.style.display = 'none';
  elements.mainContent.style.display = 'flex';
  elements.recentSaves.style.display = 'block';
  document.querySelector('.container').classList.remove('auth-visible');
}

/**
 * Show UI for unauthenticated users
 */
function showUnauthenticatedUI() {
  elements.authRequired.style.display = 'flex';
  elements.mainContent.style.display = 'none';
  elements.recentSaves.style.display = 'none';
  document.querySelector('.container').classList.add('auth-visible');
}

/**
 * Open sign in page
 */
function openSignIn() {
  chrome.tabs.create({ url: `${API_BASE_URL}/login` });
}

/**
 * Save the current page to notes
 * POST /api/notes with { type: "LINK", sourceUrl, title }
 */
async function savePage() {
  if (!currentTabInfo?.url) {
    showToast('No page to save', 'error');
    return;
  }

  if (!isAuthenticated) {
    showToast('Please sign in first', 'error');
    return;
  }

  // Disable button and show saving state
  elements.saveBtn.disabled = true;
  const saveBtnSpan = elements.saveBtn.querySelector('span');
  const originalText = saveBtnSpan.textContent;
  saveBtnSpan.textContent = 'Saving...';

  try {
    // Prepare note data
    const noteData = {
      type: 'LINK',
      sourceUrl: currentTabInfo.url,
      title: currentTabInfo.title || 'Untitled',
    };

    // Add optional content/notes if provided
    const content = elements.noteContent.value.trim();
    if (content) {
      noteData.content = content;
    }

    // Add tags if provided
    const tagsValue = elements.tagsInput.value.trim();
    if (tagsValue) {
      noteData.tags = tagsValue.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    // Make API request
    const response = await fetch(`${API_BASE_URL}/api/notes`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (response.ok) {
      const savedNote = await response.json();

      // Save to recent saves
      await saveToRecentSaves({
        id: savedNote.id,
        title: currentTabInfo.title,
        url: currentTabInfo.url,
        timestamp: Date.now(),
      });

      // Clear form
      elements.noteContent.value = '';
      elements.tagsInput.value = '';

      // Reload recent saves to show new item
      await loadRecentSaves();

      showToast('Page saved!', 'success');
    } else if (response.status === 401 || response.status === 403) {
      isAuthenticated = false;
      showUnauthenticatedUI();
      showToast('Session expired. Please sign in again.', 'error');
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to save (${response.status})`);
    }
  } catch (error) {
    console.error('Save error:', error);
    showToast(error.message || 'Failed to save page', 'error');
  } finally {
    // Restore button state
    elements.saveBtn.disabled = false;
    saveBtnSpan.textContent = originalText;
  }
}

/**
 * Load recent saves from chrome.storage.local
 */
async function loadRecentSaves() {
  try {
    const result = await chrome.storage.local.get('recentSaves');
    const saves = result.recentSaves || [];
    renderRecentSaves(saves);
  } catch (error) {
    console.error('Error loading recent saves:', error);
    renderRecentSaves([]);
  }
}

/**
 * Save item to recent saves in chrome.storage.local (keep last 5)
 */
async function saveToRecentSaves(item) {
  try {
    const result = await chrome.storage.local.get('recentSaves');
    const saves = result.recentSaves || [];

    // Add new item at the beginning
    saves.unshift(item);

    // Keep only last 5 items
    const trimmedSaves = saves.slice(0, 5);

    await chrome.storage.local.set({ recentSaves: trimmedSaves });
  } catch (error) {
    console.error('Error saving to recent saves:', error);
  }
}

/**
 * Render recent saves list using SAFE DOM methods
 * SECURITY: Uses createElement and textContent only - NO innerHTML with dynamic content
 */
function renderRecentSaves(saves) {
  // Clear existing content safely
  while (elements.recentList.firstChild) {
    elements.recentList.removeChild(elements.recentList.firstChild);
  }

  if (!saves || saves.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No recent saves';
    elements.recentList.appendChild(emptyState);
    return;
  }

  // Render each save item using safe DOM methods
  saves.forEach((save) => {
    const item = document.createElement('div');
    item.className = 'recent-item';
    item.setAttribute('data-id', save.id || '');
    item.setAttribute('data-url', save.url || '');

    // Icon container
    const iconSpan = document.createElement('span');
    iconSpan.className = 'icon';
    // Create SVG element for link icon
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '12');
    svg.setAttribute('height', '12');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');

    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71');
    svg.appendChild(path1);

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71');
    svg.appendChild(path2);

    iconSpan.appendChild(svg);
    item.appendChild(iconSpan);

    // Title
    const titleSpan = document.createElement('span');
    titleSpan.className = 'title';
    titleSpan.textContent = save.title || 'Untitled';
    item.appendChild(titleSpan);

    // Time
    const timeSpan = document.createElement('span');
    timeSpan.className = 'time';
    timeSpan.textContent = formatTime(save.timestamp);
    item.appendChild(timeSpan);

    // Click handler to open saved note
    item.addEventListener('click', () => {
      const noteId = item.getAttribute('data-id');
      if (noteId) {
        chrome.tabs.create({ url: `${API_BASE_URL}/notes/${noteId}` });
      } else {
        // Fallback: open the original URL
        const url = item.getAttribute('data-url');
        if (url) {
          chrome.tabs.create({ url });
        }
      }
    });

    elements.recentList.appendChild(item);
  });
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  // Set message using textContent (safe)
  elements.toast.textContent = message;

  // Set type class
  elements.toast.classList.remove('error', 'success');
  if (type === 'error' || type === 'success') {
    elements.toast.classList.add(type);
  }

  // Show toast
  elements.toast.classList.add('show');

  // Hide after 2.5 seconds
  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2500);
}

/**
 * Format timestamp to relative time
 */
function formatTime(timestamp) {
  if (!timestamp) return '';

  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  // For older items, show date
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', init);
