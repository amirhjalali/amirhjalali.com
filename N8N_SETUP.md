# n8n Setup Guide for Coolify

## Overview

This guide will help you set up n8n (workflow automation) on your Coolify VPS to automate and enhance the AI article generation process. n8n will orchestrate the entire workflow, manage article drafts, and integrate with a database for better data management.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Coolify VPS                              │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Next.js    │◄───┤     n8n      │◄───┤  PostgreSQL  │  │
│  │   Website    │    │   Workflows  │    │   Database   │  │
│  │   (Port 3000)│    │  (Port 5678) │    │  (Port 5432) │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                    │          │
│         │                    │                    │          │
│         └────────────────────┴────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
              https://gaboojabrothers.cloud
              https://n8n.gaboojabrothers.cloud
```

## Benefits of n8n + Database Setup

### Current Limitations (JSON Files):
- ❌ Manual file editing for article management
- ❌ No versioning or audit trail
- ❌ Difficult to query and filter articles
- ❌ GitHub Actions limited scheduling options
- ❌ No webhook support for instant triggers

### With n8n + PostgreSQL:
- ✅ **Visual workflow builder** - Design complex article workflows
- ✅ **Database storage** - Structured data with relationships
- ✅ **Advanced scheduling** - Cron jobs, time-based triggers
- ✅ **Webhooks** - Trigger article generation from external sources
- ✅ **Version history** - Track changes to articles over time
- ✅ **Queue management** - Prioritize topics, schedule batches
- ✅ **Integration hub** - Connect to 400+ services (Twitter, RSS, etc.)
- ✅ **Error handling** - Retry logic, notifications on failures
- ✅ **Analytics** - Track generation metrics, costs, performance

---

## Part 1: Installing PostgreSQL on Coolify

### Step 1: Add PostgreSQL Database

1. **Open Coolify Dashboard** at your VPS
2. **Navigate to Databases** (or Services)
3. **Click "New Database"**
4. **Select "PostgreSQL"**

### Step 2: Configure PostgreSQL

**Database Settings:**
```yaml
Name: portfolio-database
PostgreSQL Version: 16 (latest)
Port: 5432
Database Name: portfolio
Username: portfolio_user
Password: [Generate secure password]
```

### Step 3: Create Database Schema

Once PostgreSQL is running, connect to it and create the schema:

```sql
-- Articles table
CREATE TABLE articles (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    readTime VARCHAR(50),
    tags TEXT[], -- Array of tags
    image VARCHAR(500),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft' or 'published'
    ai_generated BOOLEAN DEFAULT false,
    generation_prompt TEXT,
    generation_cost DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- Topics queue table
CREATE TABLE topics_queue (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(500) NOT NULL,
    source VARCHAR(100), -- 'manual', 'trending', 'rss', etc.
    priority INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    scheduled_for TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Generation logs table
CREATE TABLE generation_logs (
    id SERIAL PRIMARY KEY,
    article_id VARCHAR(255) REFERENCES articles(id),
    topic_id INTEGER REFERENCES topics_queue(id),
    status VARCHAR(50), -- 'success', 'failed'
    error_message TEXT,
    tokens_used INTEGER,
    cost DECIMAL(10, 4),
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_date ON articles(date DESC);
CREATE INDEX idx_topics_status ON topics_queue(status);
CREATE INDEX idx_topics_scheduled ON topics_queue(scheduled_for);
```

### Step 4: Note Database Connection Details

Save these connection details - you'll need them for n8n:

```bash
Host: postgres.coolify.internal (or IP of PostgreSQL container)
Port: 5432
Database: portfolio
Username: portfolio_user
Password: [your secure password]
```

---

## Part 2: Installing n8n on Coolify

### Step 1: Create n8n Service

1. **Open Coolify Dashboard**
2. **Click "New Service"** or "New Application"
3. **Select "Docker Image"** (not Git repository)

### Step 2: Configure n8n

**Container Settings:**
```yaml
Docker Image: n8nio/n8n:latest
Container Name: n8n-workflows
Port: 5678
```

**Environment Variables:**
```bash
# n8n Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=[secure password]

# Host Configuration
N8N_HOST=n8n.gaboojabrothers.cloud
N8N_PROTOCOL=https
N8N_PORT=5678

# Webhook URL
WEBHOOK_URL=https://n8n.gaboojabrothers.cloud/

# Database Connection (PostgreSQL for n8n workflows)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres.coolify.internal
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n_user
DB_POSTGRESDB_PASSWORD=[n8n database password]

# OpenAI API Key (for article generation)
OPENAI_API_KEY=[your OpenAI API key]

# Timezone
GENERIC_TIMEZONE=UTC
TZ=UTC
```

### Step 3: Configure Domain

**Subdomain Setup:**
- **Domain**: `n8n.gaboojabrothers.cloud`
- **SSL**: Enable automatic SSL with Let's Encrypt
- **Port**: 5678

### Step 4: Volume Mounts (Data Persistence)

Create a volume mount for n8n data:
```bash
Container Path: /home/node/.n8n
Host Path: /data/n8n (or Coolify managed volume)
```

### Step 5: Deploy n8n

1. Click **"Deploy"**
2. Wait 1-2 minutes for container to start
3. Access n8n at: `https://n8n.gaboojabrothers.cloud`
4. Login with credentials from environment variables

---

## Part 3: Setting Up n8n Workflows

### Workflow 1: Daily Article Generation

This workflow automatically generates articles daily.

**Trigger**: Schedule (Cron)
- Schedule: `0 9 * * *` (Every day at 9 AM UTC)

**Nodes**:

1. **Schedule Trigger** (Cron: 0 9 * * *)
   ↓
2. **PostgreSQL: Get Next Topic**
   ```sql
   SELECT * FROM topics_queue
   WHERE status = 'pending'
   ORDER BY priority DESC, scheduled_for ASC
   LIMIT 1
   ```
   ↓
3. **Set Variables** (Extract topic)
   - `topic`: `{{ $json.topic }}`
   - `topic_id`: `{{ $json.id }}`
   ↓
4. **PostgreSQL: Mark Topic Processing**
   ```sql
   UPDATE topics_queue
   SET status = 'processing', processed_at = NOW()
   WHERE id = {{ $json.topic_id }}
   ```
   ↓
5. **OpenAI: Generate Article Content**
   - Model: `gpt-4o-mini`
   - Prompt:
   ```
   Write a professional blog article about: {{ $node["Set Variables"].json["topic"] }}

   Format as JSON:
   {
     "title": "Article Title",
     "excerpt": "2-sentence summary",
     "content": "Full markdown content (500-800 words)",
     "tags": ["tag1", "tag2", "tag3"]
   }
   ```
   ↓
6. **OpenAI: Generate Image** (DALL-E 3)
   - Prompt: Based on article title
   - Size: 1024x1024
   - Quality: standard
   ↓
7. **HTTP Request: Download Image**
   - URL: `{{ $json.data[0].url }}`
   - Method: GET
   - Binary: true
   ↓
8. **Write Binary File**
   - File Path: `/public/images/thoughts/{{ $node["Set Variables"].json["topic_id"] }}.png`
   ↓
9. **PostgreSQL: Insert Article**
   ```sql
   INSERT INTO articles (
     id, title, excerpt, content, author, date, tags,
     image, status, ai_generated, generation_prompt
   ) VALUES (
     'article-{{ $now.toFormat("yyyyMMddHHmmss") }}',
     '{{ $node["OpenAI: Generate Article Content"].json.choices[0].message.content.title }}',
     '{{ $node["OpenAI: Generate Article Content"].json.choices[0].message.content.excerpt }}',
     '{{ $node["OpenAI: Generate Article Content"].json.choices[0].message.content.content }}',
     'Amir H. Jalali',
     NOW(),
     ARRAY[...]::TEXT[],
     '/images/thoughts/{{ $node["Set Variables"].json["topic_id"] }}.png',
     'draft',
     true,
     '{{ $node["Set Variables"].json["topic"] }}'
   )
   ```
   ↓
10. **PostgreSQL: Update Topic Status**
    ```sql
    UPDATE topics_queue
    SET status = 'completed'
    WHERE id = {{ $node["Set Variables"].json["topic_id"] }}
    ```
    ↓
11. **PostgreSQL: Log Generation**
    ```sql
    INSERT INTO generation_logs (
      topic_id, status, tokens_used, cost, duration_seconds
    ) VALUES (
      {{ $node["Set Variables"].json["topic_id"] }},
      'success',
      {{ $node["OpenAI: Generate Article Content"].json.usage.total_tokens }},
      {{ ... calculate cost ... }},
      {{ ... calculate duration ... }}
    )
    ```

### Workflow 2: Webhook for Manual Article Generation

**Trigger**: Webhook
- HTTP Method: POST
- Path: `/webhook/generate-article`

**Request Body**:
```json
{
  "topic": "The future of AI coding assistants"
}
```

This workflow is identical to Workflow 1, but triggered by webhook instead of schedule.

### Workflow 3: Publish Article from Admin Panel

**Trigger**: Webhook
- HTTP Method: POST
- Path: `/webhook/publish-article`

**Request Body**:
```json
{
  "article_id": "article-123"
}
```

**Nodes**:
1. Webhook Trigger
2. PostgreSQL: Update Article Status
   ```sql
   UPDATE articles
   SET status = 'published', published_at = NOW()
   WHERE id = '{{ $json.body.article_id }}'
   ```
3. PostgreSQL: Export Published Articles (for JSON file)
   ```sql
   SELECT * FROM articles WHERE status = 'published' ORDER BY date DESC
   ```
4. Write File: `/public/data/published.json`
5. HTTP Response: Success

### Workflow 4: Fetch Trending Topics (Daily)

**Trigger**: Schedule (Cron)
- Schedule: `0 8 * * *` (Every day at 8 AM UTC)

**Nodes**:
1. Schedule Trigger
2. HTTP Request: Fetch trending tech topics (from Hacker News API, Reddit API, etc.)
3. Code Node: Parse and filter topics
4. PostgreSQL: Insert topics into queue
   ```sql
   INSERT INTO topics_queue (topic, source, priority, scheduled_for)
   VALUES (
     '{{ $json.title }}',
     'hackernews',
     5,
     NOW() + INTERVAL '1 day'
   )
   ON CONFLICT DO NOTHING
   ```

---

## Part 4: Integrating with Next.js Website

### Update Article Functions

Create new database-backed article functions in `lib/articles.ts`:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export async function getPublishedArticles() {
  const result = await pool.query(
    'SELECT * FROM articles WHERE status = $1 ORDER BY date DESC',
    ['published']
  );
  return result.rows;
}

export async function getArticleById(id: string) {
  const result = await pool.query(
    'SELECT * FROM articles WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function getDraftArticles() {
  const result = await pool.query(
    'SELECT * FROM articles WHERE status = $1 ORDER BY date DESC',
    ['draft']
  );
  return result.rows;
}

export async function publishArticle(id: string) {
  const result = await pool.query(
    'UPDATE articles SET status = $1, published_at = NOW() WHERE id = $2 RETURNING *',
    ['published', id]
  );

  // Also trigger n8n webhook to regenerate published.json
  await fetch('https://n8n.gaboojabrothers.cloud/webhook/publish-article', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ article_id: id }),
  });

  return result.rows[0];
}
```

### Add Database Environment Variables to Coolify

Update Next.js environment variables in Coolify:

```bash
# PostgreSQL Connection
DB_HOST=postgres.coolify.internal
DB_PORT=5432
DB_DATABASE=portfolio
DB_USER=portfolio_user
DB_PASSWORD=[your password]
```

### Install PostgreSQL Client

```bash
npm install pg
npm install --save-dev @types/pg
```

---

## Part 5: Migration Plan (JSON → Database)

### Migration Script

Create `scripts/migrate-to-db.js`:

```javascript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  console.log('🚀 Starting migration from JSON to PostgreSQL...');

  // Read published articles
  const publishedPath = path.join(__dirname, '../public/data/published.json');
  const published = JSON.parse(fs.readFileSync(publishedPath, 'utf8'));

  // Read drafts
  const draftsPath = path.join(__dirname, '../public/data/drafts.json');
  const drafts = JSON.parse(fs.readFileSync(draftsPath, 'utf8'));

  // Migrate published articles
  for (const article of published) {
    await pool.query(`
      INSERT INTO articles (
        id, title, excerpt, content, author, date, readTime, tags, image, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO NOTHING
    `, [
      article.id,
      article.title,
      article.excerpt,
      article.content,
      article.author,
      article.date,
      article.readTime,
      article.tags,
      article.image,
      'published'
    ]);
    console.log(`✅ Migrated published article: ${article.id}`);
  }

  // Migrate drafts
  for (const article of drafts) {
    await pool.query(`
      INSERT INTO articles (
        id, title, excerpt, content, author, date, readTime, tags, image, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO NOTHING
    `, [
      article.id,
      article.title,
      article.excerpt,
      article.content,
      article.author,
      article.date,
      article.readTime,
      article.tags,
      article.image,
      'draft'
    ]);
    console.log(`✅ Migrated draft article: ${article.id}`);
  }

  console.log('🎉 Migration complete!');
  await pool.end();
}

migrate().catch(console.error);
```

### Run Migration

```bash
node scripts/migrate-to-db.js
```

---

## Part 6: Testing the Setup

### 1. Test PostgreSQL Connection

```bash
# From Coolify server or container
psql -h postgres.coolify.internal -U portfolio_user -d portfolio
```

### 2. Test n8n Access

Visit: `https://n8n.gaboojabrothers.cloud`

### 3. Test Webhook Manually

```bash
curl -X POST https://n8n.gaboojabrothers.cloud/webhook/generate-article \
  -H "Content-Type: application/json" \
  -d '{"topic": "Test Article Generation"}'
```

### 4. Test Database Queries

```sql
-- Check articles
SELECT id, title, status FROM articles ORDER BY date DESC LIMIT 10;

-- Check topics queue
SELECT * FROM topics_queue WHERE status = 'pending';

-- Check generation logs
SELECT * FROM generation_logs ORDER BY created_at DESC LIMIT 10;
```

---

## Benefits Summary

### Before (JSON Files + GitHub Actions):
- Manual JSON editing
- Limited scheduling (GitHub Actions cron)
- No webhook support
- Difficult to track metrics
- No audit trail

### After (n8n + PostgreSQL):
- ✅ Visual workflow builder
- ✅ Database-backed storage
- ✅ Advanced scheduling & webhooks
- ✅ Comprehensive logging & analytics
- ✅ Integration with 400+ services
- ✅ Error handling & retry logic
- ✅ Topic queue management
- ✅ Cost tracking per article

---

## Next Steps

1. **Install PostgreSQL in Coolify** (Part 1)
2. **Deploy n8n in Coolify** (Part 2)
3. **Create workflows in n8n** (Part 3)
4. **Update Next.js code** (Part 4)
5. **Run migration script** (Part 5)
6. **Test everything** (Part 6)

---

## Cost Estimate

- **Hostinger VPS**: $4-8/month (existing)
- **PostgreSQL**: Free (runs on same VPS)
- **n8n**: Free and open-source
- **OpenAI API**: ~$0.14 per article (existing)

**Total Additional Cost**: $0 (just using existing VPS resources)

---

## Support Resources

- **n8n Documentation**: https://docs.n8n.io
- **n8n Community**: https://community.n8n.io
- **Coolify Docs**: https://coolify.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs

---

**Ready to automate your article generation workflow!** 🚀
