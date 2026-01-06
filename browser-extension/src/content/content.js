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
