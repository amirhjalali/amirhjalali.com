/**
 * Notes Browser Extension - Service Worker
 *
 * Handles context menus, keyboard shortcuts, and API communication
 * for saving pages, links, selections, and images to notes.amirhjalali.com
 */

// Configuration
const API_BASE_URL = 'https://notes.amirhjalali.com';

// Badge clear timeout reference
let badgeClearTimeout = null;

/**
 * Create context menu items on extension install
 */
chrome.runtime.onInstalled.addListener(() => {
  // Remove any existing context menus first
  chrome.contextMenus.removeAll(() => {
    // Create context menu: Save page
    chrome.contextMenus.create({
      id: 'save-page',
      title: 'Save page to Notes',
      contexts: ['page'],
    });

    // Create context menu: Save link
    chrome.contextMenus.create({
      id: 'save-link',
      title: 'Save link to Notes',
      contexts: ['link'],
    });

    // Create context menu: Save selection
    chrome.contextMenus.create({
      id: 'save-selection',
      title: 'Save selection to Notes',
      contexts: ['selection'],
    });

    // Create context menu: Save image
    chrome.contextMenus.create({
      id: 'save-image',
      title: 'Save image to Notes',
      contexts: ['image'],
    });

    console.log('Quick Notes Capture: Context menus created');
  });

  console.log('Quick Notes Capture extension installed');
});

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let data = null;

  switch (info.menuItemId) {
    case 'save-page':
      // Save current page as a link
      data = {
        type: 'LINK',
        sourceUrl: tab.url,
        title: tab.title || 'Untitled Page',
      };
      break;

    case 'save-link':
      // Save clicked link
      data = {
        type: 'LINK',
        sourceUrl: info.linkUrl,
        title: info.linkUrl, // Will be replaced with actual title if we can fetch it
      };
      break;

    case 'save-selection':
      // Save selected text as a note
      data = {
        type: 'NOTE',
        content: info.selectionText,
        title: `Selection from ${tab.title || 'page'}`,
        sourceUrl: tab.url,
      };
      break;

    case 'save-image':
      // Save image URL
      data = {
        type: 'IMAGE',
        sourceUrl: info.srcUrl,
        title: `Image from ${tab.title || 'page'}`,
      };
      break;

    default:
      console.warn('Unknown menu item:', info.menuItemId);
      return;
  }

  if (data) {
    await saveToNotes(data, tab.id);
  }
});

/**
 * Handle keyboard shortcut commands
 */
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save-page') {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      console.warn('No active tab found');
      return;
    }

    // Try to get selected text first
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection()?.toString() || '',
      });

      const selectedText = results?.[0]?.result;

      if (selectedText && selectedText.trim()) {
        // Save selection as a note
        await saveToNotes(
          {
            type: 'NOTE',
            content: selectedText,
            title: `Selection from ${tab.title || 'page'}`,
            sourceUrl: tab.url,
          },
          tab.id
        );
        return;
      }
    } catch (error) {
      // Can't execute script on this page (e.g., chrome:// pages)
      console.log('Could not check for selection:', error.message);
    }

    // No selection, save page as link
    await saveToNotes(
      {
        type: 'LINK',
        sourceUrl: tab.url,
        title: tab.title || 'Untitled Page',
      },
      tab.id
    );
  }
});

/**
 * Save data to Notes API
 * @param {Object} data - Note data to save
 * @param {number} tabId - Tab ID for badge display
 */
async function saveToNotes(data, tabId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const savedNote = await response.json();

      // Store in recent saves
      await addToRecentSaves({
        id: savedNote.id,
        title: data.title,
        type: data.type,
        url: data.sourceUrl,
        timestamp: Date.now(),
      });

      // Show success notification
      showNotification('Saved!', `${data.type} saved to Notes`, false, tabId);
    } else if (response.status === 401 || response.status === 403) {
      // Not authenticated
      showNotification('Sign in required', 'Click to sign in to Notes', true, tabId);
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Save to notes failed:', error);

    // Save locally for later sync
    await saveLocally(data);

    // Show error notification
    showNotification('Saved offline', 'Will sync when connected', true, tabId);
  }
}

/**
 * Show notification via badge
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {boolean} isError - Whether this is an error notification
 * @param {number} tabId - Tab ID for badge display
 */
function showNotification(title, message, isError, tabId) {
  // Clear any pending timeout
  if (badgeClearTimeout) {
    clearTimeout(badgeClearTimeout);
    badgeClearTimeout = null;
  }

  // Set badge
  const badgeText = isError ? '!' : '\u2713'; // Checkmark for success
  const badgeColor = isError ? '#888888' : '#FFFFFF';

  chrome.action.setBadgeText({ text: badgeText, tabId });
  chrome.action.setBadgeBackgroundColor({ color: badgeColor, tabId });
  chrome.action.setTitle({ title: `${title}: ${message}`, tabId });

  // Clear badge after 3 seconds
  badgeClearTimeout = setTimeout(() => {
    chrome.action.setBadgeText({ text: '', tabId });
    chrome.action.setTitle({ title: 'Quick Notes Capture', tabId });
    badgeClearTimeout = null;
  }, 3000);

  // Log for debugging
  console.log(`Notification: ${title} - ${message}`);
}

/**
 * Save note locally for offline sync
 * @param {Object} data - Note data to save
 */
async function saveLocally(data) {
  const localNote = {
    id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    createdAt: new Date().toISOString(),
    synced: false,
  };

  const { pendingNotes = [] } = await chrome.storage.local.get('pendingNotes');
  pendingNotes.push(localNote);
  await chrome.storage.local.set({ pendingNotes });

  // Also add to recent saves
  await addToRecentSaves({
    id: localNote.id,
    title: data.title,
    type: data.type,
    url: data.sourceUrl,
    timestamp: Date.now(),
    synced: false,
  });

  console.log('Note saved locally for later sync:', localNote.id);
}

/**
 * Add note to recent saves list
 * @param {Object} note - Note info to add
 */
async function addToRecentSaves(note) {
  const { recentSaves = [] } = await chrome.storage.local.get('recentSaves');

  const recentNote = {
    id: note.id,
    title: note.title || 'Untitled',
    type: note.type,
    url: note.url,
    timestamp: note.timestamp || Date.now(),
    synced: note.synced !== false,
  };

  // Add to beginning
  recentSaves.unshift(recentNote);

  // Keep only last 10
  if (recentSaves.length > 10) {
    recentSaves.pop();
  }

  await chrome.storage.local.set({ recentSaves });
}

/**
 * Sync pending notes when online
 */
async function syncPendingNotes() {
  const { pendingNotes = [] } = await chrome.storage.local.get('pendingNotes');

  if (!pendingNotes.length) {
    return;
  }

  console.log(`Syncing ${pendingNotes.length} pending notes...`);

  const synced = [];
  const failed = [];

  for (const note of pendingNotes) {
    try {
      // Remove local metadata before sending
      const { id, createdAt, synced: _, ...noteData } = note;

      const response = await fetch(`${API_BASE_URL}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(noteData),
      });

      if (response.ok) {
        synced.push(note.id);
      } else {
        failed.push(note);
      }
    } catch (error) {
      failed.push(note);
    }
  }

  // Update pending notes (keep only failed ones)
  await chrome.storage.local.set({ pendingNotes: failed });

  if (synced.length > 0) {
    console.log(`Synced ${synced.length} notes successfully`);

    // Update recent saves to mark as synced
    const { recentSaves = [] } = await chrome.storage.local.get('recentSaves');
    const updatedSaves = recentSaves.map((save) => {
      if (synced.includes(save.id)) {
        return { ...save, synced: true };
      }
      return save;
    });
    await chrome.storage.local.set({ recentSaves: updatedSaves });
  }

  if (failed.length > 0) {
    console.log(`${failed.length} notes failed to sync, will retry later`);
  }
}

/**
 * Handle messages from popup or content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'syncNotes') {
    syncPendingNotes()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (message.action === 'getTabInfo') {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      sendResponse({
        url: tab?.url || '',
        title: tab?.title || '',
        favIconUrl: tab?.favIconUrl || '',
      });
    });
    return true;
  }

  if (message.action === 'quickSave') {
    // Quick save from content script
    const { data, tabId } = message;
    saveToNotes(data, tabId)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

/**
 * Set up periodic sync
 */
chrome.alarms.create('syncNotes', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncNotes') {
    syncPendingNotes();
  }
});

// Attempt sync when service worker starts
syncPendingNotes();

console.log('Quick Notes Capture service worker initialized');
