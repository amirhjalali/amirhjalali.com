# API Documentation

Complete REST API for article and draft management.

## Base URL
- Local: `http://localhost:3000/api`
- Production: `https://gaboojabrothers.cloud/api`

---

## Articles API

### List Articles
```http
GET /api/articles
GET /api/articles?published=true
```

**Query Parameters:**
- `published` (optional): Filter by published status

**Response:**
```json
[
  {
    "id": "article-123",
    "title": "Article Title",
    "slug": "article-title",
    "excerpt": "Brief summary",
    "content": "Full content...",
    "author": "Amir H. Jalali",
    "tags": ["AI", "Tech"],
    "imageUrl": "/images/...",
    "readTime": "5 min read",
    "aiGenerated": false,
    "published": true,
    "publishedAt": "2025-01-15T10:00:00.000Z",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
]
```

### Create Article
```http
POST /api/articles
Content-Type: application/json
```

**Body:**
```json
{
  "title": "New Article",
  "content": "Article content...",
  "excerpt": "Brief summary",
  "tags": ["AI", "Tech"],
  "imageUrl": "/images/...",
  "author": "Amir H. Jalali",
  "aiGenerated": false,
  "published": false
}
```

**Notes:**
- `slug` auto-generated from title
- `readTime` auto-calculated from content
- Duplicate slugs automatically numbered

### Get Single Article
```http
GET /api/articles/:id
```

**Response:** Single article object

### Update Article
```http
PATCH /api/articles/:id
Content-Type: application/json
```

**Body:** Any article fields to update
```json
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

**Notes:**
- Slug regenerated if title changes
- Read time recalculated if content changes

### Delete Article
```http
DELETE /api/articles/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Article deleted"
}
```

### Publish/Unpublish Article
```http
POST /api/articles/:id/publish
Content-Type: application/json
```

**Body:**
```json
{
  "publish": true  // or false to unpublish
}
```

**Response:**
```json
{
  "success": true,
  "article": { /* updated article */ },
  "message": "Article published"
}
```

**Notes:**
- Creates version snapshot on publish
- Sets `publishedAt` timestamp
- `publish: false` unpublishes without deleting

---

## Drafts API

### List Drafts
```http
GET /api/drafts
```

**Response:**
```json
[
  {
    "id": "draft-123",
    "title": "Draft Title",
    "content": "Draft content...",
    "excerpt": "Brief summary",
    "tags": ["AI"],
    "imageUrl": null,
    "aiGenerated": true,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
]
```

### Create Draft
```http
POST /api/drafts
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Draft Title",
  "content": "Draft content...",
  "excerpt": "Brief summary",
  "tags": ["AI"],
  "imageUrl": null,
  "aiGenerated": false
}
```

### Get Single Draft
```http
GET /api/drafts/:id
```

### Update Draft
```http
PATCH /api/drafts/:id
Content-Type: application/json
```

**Body:** Any draft fields to update

### Delete Draft
```http
DELETE /api/drafts/:id
```

### Publish Draft
```http
POST /api/drafts/:id/publish
```

**Response:**
```json
{
  "success": true,
  "article": { /* created article */ },
  "message": "Draft published successfully"
}
```

**Notes:**
- Converts draft to published article
- Generates slug and calculates read time
- Deletes draft after successful publish
- Sets `publishedAt` to current time

---

## AI Article Generation

### Generate Article
```http
POST /api/generate-article
Content-Type: application/json
```

**Body:**
```json
{
  "customTopic": "Optional custom topic"
}
```

**Response:**
```json
{
  "success": true,
  "draft": { /* created draft */ },
  "topic": "Generated topic",
  "wordCount": 650,
  "message": "Article generated and saved as draft"
}
```

**Notes:**
- Requires `OPENAI_API_KEY` environment variable
- Uses GPT-4o-mini for content
- Uses DALL-E 3 for images
- Images stored as base64 data URLs
- Automatically saves as draft

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `404` - Not found
- `500` - Server error

---

## Examples

### Publishing Workflow

1. Generate draft:
```bash
curl -X POST http://localhost:3000/api/generate-article \
  -H "Content-Type: application/json" \
  -d '{"customTopic": "AI in education"}'
```

2. Edit draft:
```bash
curl -X PATCH http://localhost:3000/api/drafts/draft-123 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

3. Publish draft:
```bash
curl -X POST http://localhost:3000/api/drafts/draft-123/publish
```

### Bulk Operations

Get all unpublished articles:
```bash
curl "http://localhost:3000/api/articles" | \
  jq '.[] | select(.published == false)'
```

Count published articles:
```bash
curl "http://localhost:3000/api/articles?published=true" | \
  jq 'length'
```

---

## Database Schema

Articles stored in PostgreSQL with Prisma ORM:

**Article:**
- Auto-generated slugs (unique)
- Version history tracking
- Published/unpublished states
- Timestamps (created, updated, published)

**Draft:**
- Simpler schema
- No slugs (generated on publish)
- Converted to articles on publish

**ArticleVersion:**
- Snapshots of article state
- Created on publish
- Tracks version numbers
