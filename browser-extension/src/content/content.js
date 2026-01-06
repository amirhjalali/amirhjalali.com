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

  return {
    isArticle: !!isArticle,
    hasVideo: !!hasVideo,
    wordCount,
    estimatedReadTime: Math.ceil(wordCount / 200),
  }
}

// Expose page analysis to popup
window.qncPageAnalysis = analyzePageContent()

console.log('Quick Notes Capture content script loaded')
