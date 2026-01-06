# Quick Notes Capture - Chrome Extension

A Chrome extension for quickly capturing notes, links, and highlights from any webpage to your personal knowledge base.

## Features

- **Quick Capture**: Save links, text selections, and screenshots with one click
- **Context Menu**: Right-click to save selected text, links, or images
- **Keyboard Shortcuts**: `Ctrl+Shift+S` to quick save
- **Offline Support**: Saves locally when offline, syncs when connected
- **Multiple Note Types**: Link, Thought, or Highlight
- **Tag Support**: Organize captures with tags
- **Recent History**: Quick access to recent saves

## Installation

### Development Mode

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `browser-extension` directory

### Build for Production

```bash
# Install dependencies (if adding build tools)
npm install

# Create production zip
zip -r quick-notes-capture.zip browser-extension/
```

## Configuration

1. Click the extension icon
2. Go to Settings (gear icon) or right-click > Options
3. Enter your API URL and auth token
4. Test connection

### Getting Your Auth Token

1. Go to your Notes page at `https://amirhjalali.com/notes`
2. Open Settings
3. Copy your API token

## Usage

### Popup

1. Click the extension icon to open the popup
2. Use the capture buttons:
   - **Save Link**: Saves current page URL
   - **Save Selection**: Saves highlighted text
   - **Screenshot**: Captures visible area
3. Add notes and tags
4. Click "Save Note"

### Context Menu

Right-click on any webpage to access:
- **Save to Notes**: Saves selected text
- **Save Link to Notes**: Saves a link you're hovering over
- **Save Image to Notes**: Saves an image
- **Save Page to Notes**: Saves the current page URL

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+S` | Quick save selection or page |
| `Ctrl+Enter` | Save note in popup |

Customize shortcuts at `chrome://extensions/shortcuts`

## File Structure

```
browser-extension/
├── manifest.json           # Extension manifest (V3)
├── src/
│   ├── popup/             # Popup UI
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── background/        # Service worker
│   │   └── service-worker.js
│   ├── content/           # Content scripts
│   │   ├── content.js
│   │   └── content.css
│   ├── options/           # Options page
│   │   ├── options.html
│   │   ├── options.css
│   │   └── options.js
│   └── icons/             # Extension icons
│       ├── icon16.png
│       ├── icon32.png
│       ├── icon48.png
│       └── icon128.png
└── README.md
```

## API Integration

The extension communicates with the Notes API:

### Endpoints Used

- `POST /api/notes` - Create new note
- `GET /api/notes/health` - Check connection status

### Note Data Format

```json
{
  "content": "Note content or URL",
  "type": "link | thought | highlight",
  "sourceUrl": "Page URL where captured",
  "sourceTitle": "Page title",
  "tags": ["tag1", "tag2"],
  "screenshot": "data:image/png;base64,..."
}
```

## Offline Mode

When the API is unavailable:
1. Notes are saved to local storage
2. Badge shows "!" indicator
3. Auto-syncs when connection restored
4. Manual sync available in Options

## Permissions

- `activeTab`: Access current tab URL and content
- `storage`: Save settings and offline notes
- `contextMenus`: Add right-click menu items
- Host permissions for API communication

## Development

### Making Changes

1. Edit files in the `src/` directory
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

### Debugging

- Popup: Right-click popup > Inspect
- Background: Extensions page > "Service worker" link
- Content script: DevTools on the webpage

## Troubleshooting

### "Not connected" status
- Check API URL in settings
- Verify auth token is correct
- Ensure the Notes API is running

### Context menu not appearing
- Reload the extension
- Check "Show in right-click menu" in settings

### Offline notes not syncing
- Check internet connection
- Click "Sync Now" in Options
- Verify API is accessible

## Privacy

- No data is sent to third parties
- Notes are only sent to your configured API
- Offline data is stored locally in Chrome
- No analytics or tracking

## License

MIT License - See repository for details
