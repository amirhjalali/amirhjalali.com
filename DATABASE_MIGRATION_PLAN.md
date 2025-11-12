# Database Migration Plan

## Current Architecture
- **Storage**: Static JSON files (`published.json`, `drafts.json`)
- **Read**: Files synced to `.mjs` for server-side rendering
- **Issues**:
  - Requires rebuild for every content change
  - No dynamic updates
  - Manual JSON editing prone to errors
  - No proper version control for articles

## Target Architecture
- **Database**: PostgreSQL on Hostinger VPS
- **ORM**: Prisma (TypeScript-native, great DX)
- **Deployment**: Coolify handles database + app
- **Benefits**:
  - Dynamic content updates (no rebuild needed)
  - Proper admin panel with real CRUD operations
  - Easy AI article generation workflow
  - Article versioning/history
  - Better search and filtering

---

## Phase 1: Database Setup

### 1.1 Choose Database
**Recommended: PostgreSQL**
- Included with Hostinger VPS
- Excellent JSON support (for metadata)
- Battle-tested, reliable
- Works great with Prisma

**Alternative: MongoDB**
- More flexible schema
- Natural fit for JSON documents
- But PostgreSQL + Prisma is better long-term

### 1.2 Install on Coolify
```bash
# Coolify provides PostgreSQL as a service
# Add database service to your Coolify project:
# - Name: amirhjalali-db
# - Type: PostgreSQL 16
# - Generate strong password
# - Note connection string
```

### 1.3 Environment Variables
```env
# .env (local dev)
DATABASE_URL="postgresql://user:password@localhost:5432/amirhjalali_dev"

# Coolify (production)
DATABASE_URL="postgresql://user:password@postgres:5432/amirhjalali_prod"
```

---

## Phase 2: Schema Design

### 2.1 Install Prisma
```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

### 2.2 Define Schema
```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Article {
  id            String   @id @default(cuid())

  // Content
  title         String
  slug          String   @unique // URL-friendly version
  excerpt       String
  content       String   @db.Text // Markdown

  // Metadata
  author        String   @default("Amir H. Jalali")
  tags          String[] // Array of tags
  imageUrl      String?
  readTime      String

  // Classification
  aiGenerated   Boolean  @default(false)
  published     Boolean  @default(false)
  featured      Boolean  @default(false)

  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  publishedAt   DateTime?

  // Relations
  versions      ArticleVersion[]

  @@index([published, publishedAt])
  @@index([slug])
}

model ArticleVersion {
  id          String   @id @default(cuid())
  articleId   String
  article     Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)

  // Versioned content
  title       String
  content     String   @db.Text
  excerpt     String

  // Version metadata
  versionNumber Int
  createdAt   DateTime @default(now())
  createdBy   String   @default("system")
  changeNote  String?

  @@index([articleId, versionNumber])
}

model Draft {
  id          String   @id @default(cuid())
  title       String
  content     String   @db.Text
  excerpt     String?
  tags        String[]
  imageUrl    String?
  aiGenerated Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## Phase 3: Data Migration

### 3.1 Migration Script
```typescript
// scripts/migrate-to-db.ts

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function migrateArticles() {
  // Read existing JSON
  const publishedJson = JSON.parse(
    readFileSync(join(process.cwd(), 'public/data/published.json'), 'utf-8')
  )

  const draftsJson = JSON.parse(
    readFileSync(join(process.cwd(), 'public/data/drafts.json'), 'utf-8')
  )

  console.log(`Migrating ${publishedJson.length} published articles...`)

  // Migrate published articles
  for (const article of publishedJson) {
    await prisma.article.create({
      data: {
        id: article.id,
        title: article.title,
        slug: slugify(article.title),
        excerpt: article.excerpt,
        content: article.content,
        author: article.author,
        tags: article.tags,
        imageUrl: article.imageUrl,
        readTime: article.readTime,
        aiGenerated: article.aiGenerated || false,
        published: true,
        publishedAt: new Date(article.publishedAt),
      }
    })
  }

  console.log(`Migrating ${draftsJson.length} drafts...`)

  // Migrate drafts
  for (const draft of draftsJson) {
    await prisma.draft.create({
      data: {
        id: draft.id,
        title: draft.title,
        content: draft.content,
        excerpt: draft.excerpt,
        tags: draft.tags || [],
        imageUrl: draft.imageUrl,
        aiGenerated: draft.aiGenerated || false,
      }
    })
  }

  console.log('✅ Migration complete!')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

migrateArticles()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

### 3.2 Run Migration
```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Migrate data from JSON
npx tsx scripts/migrate-to-db.ts

# Verify
npx prisma studio
```

---

## Phase 4: Update Application Code

### 4.1 Database Client
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 4.2 Update Article Queries
```typescript
// lib/server/articles.ts (NEW VERSION)
import { prisma } from '@/lib/db'

export async function getPublishedArticles() {
  return await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      author: true,
      tags: true,
      imageUrl: true,
      readTime: true,
      aiGenerated: true,
      publishedAt: true,
    }
  })
}

export async function getArticleBySlug(slug: string) {
  return await prisma.article.findUnique({
    where: { slug, published: true }
  })
}

export async function getDrafts() {
  return await prisma.draft.findMany({
    orderBy: { updatedAt: 'desc' }
  })
}
```

### 4.3 Update Page Routes
```typescript
// app/thoughts/[slug]/page.tsx
import { getArticleBySlug, getPublishedArticles } from '@/lib/server/articles'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const articles = await getPublishedArticles()
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string }
}) {
  const article = await getArticleBySlug(params.slug)

  if (!article) {
    notFound()
  }

  return <ArticlePageClient article={article} />
}
```

---

## Phase 5: Admin Panel Improvements

### 5.1 API Routes for CRUD
```typescript
// app/api/articles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const article = await prisma.article.create({
    data: {
      title: body.title,
      slug: slugify(body.title),
      content: body.content,
      excerpt: body.excerpt,
      tags: body.tags,
      imageUrl: body.imageUrl,
      readTime: calculateReadTime(body.content),
      aiGenerated: body.aiGenerated || false,
      published: false,
    }
  })

  return NextResponse.json(article)
}

// app/api/articles/[id]/route.ts
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  const article = await prisma.article.update({
    where: { id: params.id },
    data: body,
  })

  return NextResponse.json(article)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.article.delete({
    where: { id: params.id }
  })

  return NextResponse.json({ success: true })
}
```

### 5.2 Publish Workflow
```typescript
// app/api/articles/[id]/publish/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Create version snapshot
  const article = await prisma.article.findUnique({
    where: { id: params.id }
  })

  if (!article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Save version
  await prisma.articleVersion.create({
    data: {
      articleId: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      versionNumber: await getNextVersionNumber(article.id),
      changeNote: 'Published',
    }
  })

  // Publish article
  const published = await prisma.article.update({
    where: { id: params.id },
    data: {
      published: true,
      publishedAt: new Date(),
    }
  })

  return NextResponse.json(published)
}
```

---

## Phase 6: AI Article Generation

### 6.1 Generate Directly to Database
```typescript
// app/api/generate-article/route.ts
import { OpenAI } from 'openai'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const { topic } = await request.json()

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  // Generate article content
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: ARTICLE_PROMPT },
      { role: "user", content: topic }
    ]
  })

  const articleData = JSON.parse(completion.choices[0].message.content)

  // Generate image
  const imageResponse = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Abstract professional illustration for article: ${articleData.title}`,
    size: "1024x1024",
    quality: "standard",
  })

  // Save directly to database as draft
  const draft = await prisma.draft.create({
    data: {
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt,
      tags: articleData.tags,
      imageUrl: imageResponse.data[0].url,
      aiGenerated: true,
    }
  })

  return NextResponse.json(draft)
}
```

---

## Phase 7: Deployment

### 7.1 Coolify Configuration
```yaml
# Update Coolify environment variables:
DATABASE_URL=postgresql://user:pass@postgres:5432/amirhjalali
OPENAI_API_KEY=sk-...
```

### 7.2 Build Script
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate deploy"
  }
}
```

### 7.3 Coolify Build Commands
```bash
# Build Command:
npm install && npm run build

# Start Command:
npx prisma migrate deploy && npm run start
```

---

## Phase 8: Cleanup

### 8.1 Remove Old System
```bash
# After successful migration:
rm -rf public/data/published.json
rm -rf public/data/drafts.json
rm -rf data/published.mjs
rm -rf scripts/sync-to-mjs.js
```

### 8.2 Update .gitignore
```
# Database
prisma/migrations/
.env
.env.local

# Keep schema
!prisma/schema.prisma
```

---

## Benefits Summary

### Before (JSON Files)
- ❌ Requires rebuild for every change
- ❌ Manual JSON editing (error-prone)
- ❌ No version history
- ❌ Static generation delays
- ❌ Complex sync process

### After (Database)
- ✅ Instant content updates
- ✅ Proper admin UI with forms
- ✅ Version history tracking
- ✅ Dynamic ISR/SSR
- ✅ Direct AI generation
- ✅ Better search/filtering
- ✅ Scalable for future features

---

## Timeline Estimate

**Phase 1-2: Setup & Schema** - 1 hour
**Phase 3: Data Migration** - 1 hour
**Phase 4: Code Updates** - 2-3 hours
**Phase 5: Admin Panel** - 2-3 hours
**Phase 6: AI Integration** - 1-2 hours
**Phase 7: Deployment** - 1 hour
**Phase 8: Cleanup & Testing** - 1 hour

**Total: 9-12 hours**

---

## Next Steps

1. Approve plan
2. Set up PostgreSQL in Coolify
3. Run migration script
4. Test locally
5. Deploy to production
6. Monitor and iterate

**Ready to start?**
