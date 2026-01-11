# AMI-93: Add Media Attachments Support to Notes

## Summary
Enhance the Notes feature to support better media handling, starting with clipboard paste for screenshots.

**Issue:** [AMI-93](https://linear.app/amirhjalali/issue/AMI-93)
**Effort:** M (1-2 days for all phases)
**Primary File:** `/app/notes/components/QuickAdd.tsx`

---

## Phase 1: Clipboard Paste Support (2-3 hours) - START HERE

**Goal:** Allow users to paste screenshots directly with Cmd+V / Ctrl+V.

### Step 1.1: Add Paste Handler

**File:** `/app/notes/components/QuickAdd.tsx`

Add to the textarea or form container:

```typescript
const handlePaste = (e: React.ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault() // Prevent default paste behavior
      const file = item.getAsFile()
      if (file) {
        handleFile(file) // Reuse existing file handler
      }
      return
    }
  }
  // If no image, allow normal text paste
}
```

### Step 1.2: Attach Handler to Textarea

Update the textarea (line 197):

```typescript
<textarea
  id="quick-add-input"
  placeholder="Drop images here, paste URLs, or type your thoughts... (Cmd+V for screenshots)"
  value={content}
  onChange={(e) => setContent(e.target.value)}
  onPaste={handlePaste}  // Add this
  className="w-full px-5 py-4 bg-transparent border-none focus:ring-0 text-[#EAEAEA] placeholder:text-[#666666] font-mono text-sm min-h-[120px] resize-y"
  disabled={isLoading}
  required={!imageUrl}
/>
```

### Step 1.3: Update Keyboard Shortcut Hint

Update the hint text (line 263-265):

```typescript
<span className="text-[#444444] font-mono hidden sm:inline">
  <kbd className="px-1.5 py-0.5 bg-white/5 rounded">⌘K</kbd> focus •
  <kbd className="px-1.5 py-0.5 bg-white/5 rounded">⌘V</kbd> paste image
</span>
```

### Testing Phase 1

- [ ] Take screenshot on Mac (Cmd+Shift+4) then Cmd+V in notes
- [ ] Take screenshot on Windows (Win+Shift+S) then Ctrl+V
- [ ] Paste image copied from browser
- [ ] Paste text still works normally
- [ ] Image preview shows after paste
- [ ] 5MB limit enforced on pasted images

---

## Phase 2: Multiple Images Per Note (4-6 hours)

**Goal:** Support multiple image attachments per note.

### Step 2.1: Update State

Change from single image to array:

```typescript
// Before
const [imageUrl, setImageUrl] = useState<string | null>(null)

// After
const [images, setImages] = useState<string[]>([])
```

### Step 2.2: Update handleFile

```typescript
const handleFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    setError('Only image files are supported currently.')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    setError('Image size should be less than 5MB.')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      setImages(prev => [...prev, e.target.result as string])
      setDetectedType('IMAGE')
      setError('')
    }
  }
  reader.readAsDataURL(file)
}
```

### Step 2.3: Update Image Preview

Replace single image preview with gallery:

```typescript
{images.length > 0 && (
  <div className="flex flex-wrap gap-2">
    {images.map((img, index) => (
      <div key={index} className="relative group">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10">
          <img
            src={img}
            alt={`Upload preview ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
```

### Step 2.4: Update API Call

```typescript
await apiClient.createNote({
  type: detectedType,
  content: content.trim() || 'Image Note',
  title: title.trim() || undefined,
  tags,
  imageUrl: images[0] || undefined, // Primary image (backward compatible)
  metadata: images.length > 1 ? { additionalImages: images.slice(1) } : undefined,
  autoProcess: true,
})
```

### Step 2.5: Update Note Detail View

**File:** `/app/notes/[id]/NoteDetailClient.tsx`

Add image gallery rendering for notes with multiple images stored in metadata.

---

## Phase 3: PDF/Document Upload (4-6 hours)

### Step 3.1: Extend handleFile

```typescript
const ALLOWED_TYPES = {
  'image/': { maxSize: 5 * 1024 * 1024, type: 'IMAGE' as NoteType },
  'application/pdf': { maxSize: 10 * 1024 * 1024, type: 'PDF' as NoteType },
  'application/msword': { maxSize: 10 * 1024 * 1024, type: 'DOCUMENT' as NoteType },
  'application/vnd.openxmlformats-officedocument': { maxSize: 10 * 1024 * 1024, type: 'DOCUMENT' as NoteType },
}
```

### Step 3.2: Update File Input

```typescript
<input
  type="file"
  ref={fileInputRef}
  onChange={handleFileSelect}
  accept="image/*,application/pdf,.doc,.docx"
  className="hidden"
/>
```

### Step 3.3: Add File Type Icons

For non-image files, show icon instead of preview:

```typescript
{file.type === 'pdf' && <FileText className="w-8 h-8" />}
{file.type === 'document' && <File className="w-8 h-8" />}
```

---

## Phase 4: Upload Progress (2-3 hours)

### Step 4.1: Add Progress State

```typescript
const [uploadProgress, setUploadProgress] = useState<number>(0)
```

### Step 4.2: Progress Bar Component

```typescript
{isLoading && uploadProgress > 0 && (
  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
    <div
      className="h-full bg-white transition-all duration-300"
      style={{ width: `${uploadProgress}%` }}
    />
  </div>
)}
```

### Step 4.3: Update API Client (if needed)

May need to modify `/lib/api-client.ts` to support progress callbacks using XMLHttpRequest instead of fetch, or use fetch with ReadableStream.

---

## Database Considerations (Future)

If multiple attachments become common, consider adding:

```prisma
model NoteAttachment {
  id        String   @id @default(cuid())
  noteId    String
  note      Note     @relation(fields: [noteId], references: [id], onDelete: Cascade)
  type      String   // image, pdf, document
  url       String
  filename  String?
  size      Int?
  mimeType  String?
  order     Int      @default(0)
  createdAt DateTime @default(now())
}
```

---

## Testing Checklist

### Phase 1
- [ ] Cmd+V pastes screenshot
- [ ] Ctrl+V pastes on Windows
- [ ] Image from clipboard shows preview
- [ ] Text paste still works
- [ ] Large images (>5MB) rejected with error

### Phase 2
- [ ] Can add multiple images
- [ ] Each image shows in gallery
- [ ] Can remove individual images
- [ ] Note created with all images
- [ ] Note detail shows all images

### Phase 3
- [ ] Can upload PDF files
- [ ] Can upload Word documents
- [ ] File icon shown for non-images
- [ ] 10MB limit for documents

### Phase 4
- [ ] Progress bar shows during upload
- [ ] Progress updates smoothly
- [ ] Large file uploads show meaningful progress
