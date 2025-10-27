# Admin Panel Guide

Complete guide to using the enhanced admin panel for managing articles on amirhjalali.com.

## Getting Started

**Access**: Navigate to `/admin` and login with your credentials.

**Default Credentials** (if not configured):
- Username: `admin`
- Password: `changeme`

> ⚠️ **Important**: Set custom credentials via GitHub Secrets (`ADMIN_USERNAME` and `ADMIN_PASSWORD`)

## Features Overview

### 🎨 Article Editor (20+ Features)

#### Basic Editing
1. **Title Editor** - Edit article titles inline
2. **Excerpt Editor** - Multi-line excerpt editing
3. **Content Editor** - Full markdown editor for article body
4. **Tag Manager** - Add/remove tags with Enter key
5. **Author Editor** - Change article author name
6. **Image Upload** - Replace featured images with drag-and-drop

#### Advanced Features
7. **Auto-Save** - Saves automatically after 2 seconds of inactivity
8. **Undo/Redo** - Full history tracking (up to 50 steps)
9. **Statistics Panel** - Real-time word count, character count, read time
10. **Export to Markdown** - Download articles as .md files
11. **Import from Markdown** - Upload .md files to create articles

#### Keyboard Shortcuts
- `Cmd/Ctrl + S` - Save manually
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Shift + Z` - Redo
- `Escape` - Close editor (warns if unsaved changes)

### 📦 Bulk Operations

12. **Bulk Select** - Click checkboxes to select multiple drafts
13. **Select All** - Toggle selection of all visible drafts
14. **Bulk Publish** - Publish multiple drafts at once
15. **Bulk Delete** - Delete multiple drafts simultaneously
16. **Duplicate Article** - Clone any draft with one click

### 🔍 Organization

17. **Search** - Real-time search across titles, excerpts, and tags
18. **Sort Options** - Sort by date (newest first) or alphabetically
19. **Filter Views** - Toggle between Drafts and Published articles
20. **Unpublish** - Move published articles back to drafts

## AI Article Generation

### Using the Generator

1. Click **"Generate AI Article"** button
2. Watch real-time progress:
   - Generating article content...
   - Creating featured image...
   - Processing image...
   - Saving draft...
3. Article appears in drafts list automatically

### Features
- Uses GPT-4o-mini for content (~$0.10 per article)
- DALL-E 3 for images (~$0.04 per image)
- Images stored as base64 (never expire)
- Random topic selection from 15+ categories
- 600-800 word articles with proper formatting

### Topics Include
- AI and creativity
- Future of work with AI
- Ethics in AI development
- Programming paradigms
- Developer productivity
- Tech industry trends
- And more...

## Workflow Examples

### Creating a New Article

1. **Generate AI Content**
   ```
   Click "Generate AI Article" → Wait 20-30 seconds → Review draft
   ```

2. **Edit the Draft**
   ```
   Select draft → Click "Edit" → Modify content → Auto-saves
   ```

3. **Publish**
   ```
   Click "Publish Article" → Article goes live
   ```

### Managing Multiple Drafts

1. **Search for Specific Drafts**
   ```
   Type in search box → Results filter in real-time
   ```

2. **Bulk Publish**
   ```
   Select multiple drafts → Click "Publish X" → Confirm
   ```

3. **Clean Up**
   ```
   Select unwanted drafts → Click "Delete X" → Confirm
   ```

### Editing Published Articles

1. **View Published**
   ```
   Click "Published" stat card → See all published articles
   ```

2. **Unpublish**
   ```
   Find article → Click "Unpublish" → Moves to drafts
   ```

3. **Edit & Republish**
   ```
   Edit in drafts → Click "Publish Article" again
   ```

## Tips & Best Practices

### Editing
- Use markdown headers (`##` for H2, `###` for H3)
- Press Enter when adding tags
- Click the chart icon to see article statistics
- Export before major changes as backup

### Organization
- Use descriptive titles for easy searching
- Add relevant tags for better filtering
- Sort by date to find recent drafts quickly
- Use bulk operations to save time

### AI Generation
- Review AI content before publishing
- Edit titles and excerpts to match your voice
- Add personal insights to AI-generated content
- Use as a starting point, not final copy

## Troubleshooting

### Article Not Showing After Publish
- **Issue**: Newly published article shows 404
- **Solution**: Clear browser cache or wait for next deployment

### Changes Not Saving
- **Issue**: Auto-save indicator shows "unsaved changes"
- **Solution**: Press `Cmd/Ctrl + S` to force save

### Image Upload Failed
- **Issue**: Image won't upload
- **Solution**: Check file size (max 5MB recommended) and format (JPG/PNG)

### AI Generation Error
- **Issue**: "Failed to generate article"
- **Solution**: Check OpenAI API key is configured in GitHub Secrets

## Technical Details

### Storage
- **Drafts**: Stored in `localStorage` (browser)
- **Published**: Stored in `localStorage` + static site rebuild
- **Images**: Base64 embedded or saved to `/public/images/thoughts/`

### Build Process
- Publishing triggers a static site rebuild
- New articles become available after deployment (~2 minutes)
- Draft changes are immediate (client-side only)

### API Keys Required
- `NEXT_PUBLIC_OPENAI_API_KEY` - For AI generation
- `ADMIN_USERNAME` - Login username
- `ADMIN_PASSWORD` - Login password

## Security Notes

⚠️ **Client-Side Authentication**
- Admin panel uses client-side auth (necessary for static sites)
- Credentials are embedded in build
- Not suitable for highly sensitive content
- Consider moving to server-side auth for production

🔒 **Best Practices**
- Use strong passwords
- Don't commit credentials to repository
- Use GitHub Secrets for all sensitive data
- Regularly update credentials

## Support

For issues or feature requests:
- Check [AI_GENERATION_README.md](./AI_GENERATION_README.md) for generation details
- Check [AI_THOUGHTS.md](./AI_THOUGHTS.md) for system architecture
- Open an issue on GitHub repository

---

**Last Updated**: October 26, 2025
**Version**: 2.0.0
