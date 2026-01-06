# Notes API Documentation

This document describes the REST API endpoints for the KnowNote application.

## Authentication

All endpoints require authentication via session cookie or Bearer token.

```
Authorization: Bearer <your-token>
```

## Rate Limiting

All endpoints are rate-limited. The following headers are returned with each response:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in the window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |
| `Retry-After` | Seconds to wait (only on 429 responses) |

### Rate Limit Presets

| Preset | Limit | Window | Use Case |
|--------|-------|--------|----------|
| standard | 60/min | 1 minute | Most endpoints |
| lenient | 120/min | 1 minute | Read-heavy endpoints |
| strict | 10/min | 1 minute | Write operations |
| ai | 5/min | 1 minute | AI-powered endpoints |
| auth | 5/15min | 15 minutes | Authentication |

---

## Notes Endpoints

### List Notes

```
GET /api/notes
```

Retrieves a paginated list of notes with optional filtering.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | - | Filter by note type: `LINK`, `TEXT`, `IMAGE`, `VIDEO` |
| `status` | string | - | Filter by process status: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `tags` | string | - | Comma-separated list of tags to filter by |
| `search` | string | - | Search in title, content, and excerpt |
| `limit` | number | 50 | Number of results (max 250) |
| `offset` | number | 0 | Pagination offset |
| `sortBy` | string | createdAt | Sort field |
| `order` | string | desc | Sort order: `asc` or `desc` |

**Response:**

```json
{
  "notes": [
    {
      "id": "string",
      "title": "string",
      "excerpt": "string",
      "tags": ["string"],
      "type": "LINK",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "processStatus": "COMPLETED",
      "imageUrl": "string",
      "topics": ["string"]
    }
  ],
  "total": 100,
  "hasMore": true
}
```

---

### Create Note

```
POST /api/notes
```

Creates a new note and optionally queues it for AI processing.

**Request Body:**

```json
{
  "type": "LINK",
  "content": "https://example.com/article",
  "title": "Optional title",
  "tags": ["tag1", "tag2"],
  "imageUrl": "data:image/png;base64,... or https://...",
  "autoProcess": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Note type: `LINK`, `TEXT`, `IMAGE`, `VIDEO` |
| `content` | string | Yes | Note content (URL, text, or base64 image) |
| `title` | string | No | Note title |
| `tags` | string[] | No | Array of tags |
| `imageUrl` | string | No | Thumbnail image (URL or base64) |
| `autoProcess` | boolean | No | Auto-process with AI (default: true) |

**Response (201):**

```json
{
  "note": {
    "id": "string",
    "type": "LINK",
    "content": "string",
    ...
  },
  "jobId": "string"
}
```

---

### Get Note

```
GET /api/notes/:id
```

Retrieves a single note by ID.

**Response:**

```json
{
  "id": "string",
  "type": "LINK",
  "content": "string",
  "title": "string",
  "excerpt": "string",
  "tags": ["string"],
  "topics": ["string"],
  "keyInsights": ["string"],
  "processStatus": "COMPLETED",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "imageUrl": "string",
  "metadata": {}
}
```

---

### Update Note

```
PATCH /api/notes/:id
```

Updates an existing note.

**Request Body:**

```json
{
  "title": "Updated title",
  "tags": ["new-tag"],
  "content": "Updated content"
}
```

---

### Delete Note

```
DELETE /api/notes/:id
```

Deletes a note.

**Response (200):**

```json
{
  "message": "Note deleted successfully"
}
```

---

## Processing Endpoints

### Process Note

```
POST /api/notes/:id/process
```

Manually triggers AI processing for a note.

**Response:**

```json
{
  "jobId": "string",
  "message": "Processing queued"
}
```

---

### Process Batch

```
POST /api/notes/process-batch
```

Process multiple notes at once.

**Request Body:**

```json
{
  "noteIds": ["id1", "id2", "id3"]
}
```

---

### Get Job Status

```
GET /api/notes/jobs/:jobId
```

Check the status of a processing job.

**Response:**

```json
{
  "id": "string",
  "status": "completed",
  "progress": 100,
  "result": {
    "noteId": "string",
    "title": "string",
    "topics": ["string"]
  }
}
```

---

## Tags Endpoints

### Get Tag Suggestions

```
GET /api/notes/:id/tags
```

Get AI-powered tag suggestions for a note.

**Response:**

```json
{
  "suggestions": [
    {
      "tag": "technology",
      "confidence": 0.95,
      "reason": "Similar to 5 other notes tagged 'technology'"
    }
  ]
}
```

---

### Add Tags

```
POST /api/notes/:id/tags
```

Add tags to a note.

**Request Body:**

```json
{
  "tags": ["tag1", "tag2"]
}
```

---

### Remove Tag

```
DELETE /api/notes/:id/tags
```

Remove a tag from a note.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tag` | string | Yes | Tag to remove |

---

## Search & Discovery

### Semantic Search

```
GET /api/notes/search
```

Search notes using semantic similarity.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | - | Search query |
| `limit` | number | 20 | Max results |
| `threshold` | number | 0.7 | Similarity threshold (0-1) |

**Response:**

```json
{
  "results": [
    {
      "note": { ... },
      "similarity": 0.92
    }
  ]
}
```

---

### Related Notes

```
GET /api/notes/:id/related
```

Get notes related to a specific note.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 5 | Max results |

---

### Knowledge Graph

```
GET /api/notes/graph
```

Get the knowledge graph for visualization.

**Response:**

```json
{
  "nodes": [
    { "id": "string", "label": "string", "type": "topic" }
  ],
  "edges": [
    { "source": "string", "target": "string", "weight": 1 }
  ]
}
```

---

## Chat Endpoints

### Send Message

```
POST /api/notes/chat
```

Chat with your notes using RAG (Retrieval Augmented Generation).

**Rate Limit:** 5 requests/minute

**Request Body:**

```json
{
  "message": "What did I save about machine learning?",
  "chatId": "optional-chat-id",
  "notebookId": "optional-notebook-id"
}
```

**Response:**

```json
{
  "message": "Based on your notes, you have saved...",
  "chatId": "string",
  "sources": [
    { "noteId": "string", "title": "string" }
  ]
}
```

---

### List Chats

```
GET /api/notes/chat
```

List chat sessions.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `notebookId` | string | - | Filter by notebook |
| `limit` | number | 20 | Max results |

---

## Health & Status

### Health Check

```
GET /api/notes/health
```

Check API health status.

**Response:**

```json
{
  "status": "ok",
  "database": "connected",
  "queue": "connected"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `AUTHENTICATION_ERROR` | 401 | Not authenticated |
| `AUTHORIZATION_ERROR` | 403 | Not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `EXTERNAL_SERVICE_ERROR` | 502 | External service failure |

---

## Notebooks

### List Notebooks

```
GET /api/notebooks
```

List all notebooks.

---

### Create Notebook

```
POST /api/notebooks
```

Create a new notebook.

**Request Body:**

```json
{
  "title": "My Notebook",
  "description": "Optional description"
}
```

---

## Review Queue

### Get Review Items

```
GET /api/notes/review
```

Get notes flagged for review (spaced repetition).

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 10 | Max items to review |

---

## Webhooks & Events

The API supports real-time updates via Server-Sent Events (SSE) for long-running operations like article generation.

### Article Generation (SSE)

```
POST /api/generate-article?stream=true
```

Generate an AI article with real-time progress updates.

**Events:**

```
data: {"step":"initializing","progress":0,"message":"Starting..."}
data: {"step":"generating_content","progress":10,"message":"Generating..."}
data: {"step":"generating_image","progress":70,"message":"Creating image..."}
data: {"step":"completed","progress":100,"message":"Done!"}
data: {"step":"result","success":true,"draft":{...}}
```
