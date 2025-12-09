# Notes Worker - Background Processing Setup

This document explains how to set up and run the background worker for processing notes with AI.

## Overview

The notes worker is a background process that:
- Listens to the Redis queue for note processing jobs
- Processes notes using OpenAI GPT-4o-mini for AI analysis
- Extracts metadata from URLs
- Generates summaries and insights
- Extracts topics and analyzes sentiment

## Prerequisites

1. **Redis**: Running Redis instance (local or remote)
2. **PostgreSQL**: Database for storing notes
3. **OpenAI API Key**: For AI processing

## Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-...

# Optional: Disable auto-processing (default: enabled)
ENABLE_AUTO_PROCESSING=true
```

## Local Development

### 1. Start Redis (if not running)

Using Docker:
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

Or using Homebrew (macOS):
```bash
brew services start redis
```

### 2. Run the Worker

```bash
# Make sure dependencies are installed
npm install

# Start the worker
node scripts/note-worker.js
```

You should see:
```
============================================================
📝 Note Processing Worker Starting...
============================================================

Environment: development
Redis URL: redis://localhost:6379
Database URL: ✓ Set
OpenAI API Key: ✓ Set

============================================================
✅ Worker started successfully!
============================================================

Worker is now listening for jobs...
Press Ctrl+C to stop
```

### 3. Test the Worker

Create a note through the UI or API:

```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "type": "LINK",
    "content": "https://example.com/article",
    "autoProcess": true
  }'
```

Watch the worker logs to see it process the note.

## Production Deployment (Coolify)

### Option 1: Single Service with Background Worker

Add a worker process to your existing service:

1. **Update package.json** with a worker script:
```json
{
  "scripts": {
    "start": "HOSTNAME=\"0.0.0.0\" node .next/standalone/server.js",
    "worker": "node scripts/note-worker.js"
  }
}
```

2. **Create Procfile** (optional, for process managers):
```
web: npm run start
worker: npm run worker
```

3. **Run both processes** using a process manager like PM2:
```bash
npm install -g pm2

# Start web server
pm2 start npm --name "web" -- run start

# Start worker
pm2 start npm --name "worker" -- run worker

# Save configuration
pm2 save
```

### Option 2: Separate Worker Service (Recommended)

Create a separate Coolify service for the worker:

1. **In Coolify Dashboard**:
   - Clone your existing application
   - Name it: `amirhjalali.com-worker`
   - Use the same repository and branch

2. **Configure Build Settings**:
   - Build Command: `npm install`
   - Start Command: `node scripts/note-worker.js`

3. **Environment Variables**:
   Copy all environment variables from main app:
   - `DATABASE_URL` - Same database as main app
   - `REDIS_URL` - Same Redis instance
   - `OPENAI_API_KEY` - OpenAI API key
   - `NODE_ENV=worker` - Optional identifier

4. **Deploy** the worker service

### Redis Setup in Coolify

#### Option A: Use Coolify's Built-in Redis

1. In Coolify Dashboard → Services
2. Create new Service → Redis
3. Name: `notes-redis`
4. Copy the connection URL
5. Add to both main app and worker as `REDIS_URL`

#### Option B: External Redis (Upstash/Redis Cloud)

1. Sign up for [Upstash](https://upstash.com) (free tier available)
2. Create a Redis database
3. Copy the connection URL
4. Add to environment variables in Coolify

## Monitoring

### Worker Logs

The worker outputs detailed logs:

- `📌 Processing Note: <id>` - Job started
- `✅ Successfully processed note <id>` - Job completed
- `❌ Failed to process note <id>` - Job failed
- `⚠️ Retrying...` - Retry attempt

### Health Checks

Monitor worker health by checking:

1. **Redis Queue Dashboard** (optional):
   - Install Bull Board: `npm install @bull-board/express`
   - Access at: `http://localhost:3000/admin/queues`

2. **Worker Process**:
   - Ensure the process is running
   - Check logs for errors
   - Monitor memory/CPU usage

3. **Note Processing Status**:
   - Check notes in database for `processStatus` field
   - `PENDING` - In queue
   - `PROCESSING` - Being processed
   - `COMPLETED` - Successfully processed
   - `FAILED` - Processing failed

## Troubleshooting

### Worker Not Processing Jobs

1. **Check Redis Connection**:
```bash
redis-cli -u $REDIS_URL ping
# Should return: PONG
```

2. **Check Environment Variables**:
```bash
node -e "console.log(process.env.REDIS_URL)"
node -e "console.log(process.env.OPENAI_API_KEY ? 'Set' : 'Missing')"
```

3. **Check Worker Logs**:
Look for connection errors or authentication failures

### Processing Failures

Common issues:

1. **OpenAI API Errors**:
   - Check API key is valid
   - Verify account has credits
   - Check rate limits

2. **Database Errors**:
   - Verify DATABASE_URL is correct
   - Check database connection
   - Ensure Prisma schema is up to date

3. **Memory Issues**:
   - Increase worker memory limit
   - Reduce concurrency in `note-queue.ts` (default: 5)

### Graceful Shutdown

The worker handles `SIGINT` and `SIGTERM` for graceful shutdown:

```bash
# Stop worker gracefully
kill -SIGTERM <worker-pid>

# Or use Ctrl+C in terminal
```

This ensures:
- Current jobs complete
- Queue connection closes properly
- No data loss

## Performance Tuning

### Concurrency

Adjust worker concurrency in `lib/queue/note-queue.ts`:

```typescript
noteWorker = new Worker('note-processing', processorFn, {
  connection,
  concurrency: 5, // Process 5 jobs simultaneously
  limiter: {
    max: 10,      // Max 10 jobs
    duration: 1000 // per second
  }
})
```

For high-volume processing:
- Increase `concurrency` (e.g., 10-20)
- Add more worker instances
- Use separate Redis instance for queue

### Rate Limiting

To avoid hitting OpenAI rate limits:

1. **Reduce Concurrency**: Lower concurrent jobs
2. **Add Delay**: Increase limiter duration
3. **Batch Processing**: Process notes in smaller batches

## Cost Optimization

### OpenAI Token Usage

The worker limits token usage:
- Summary/Insights: Max 2000 input tokens
- Topics: Max 2000 input tokens
- Sentiment: Max 1000 input tokens

Estimated cost per note (GPT-4o-mini):
- **Input**: ~3000 tokens ≈ $0.0005
- **Output**: ~500 tokens ≈ $0.0008
- **Total**: ~$0.0013 per note

For 1000 notes/month: ~$1.30

### Reduce Costs

1. **Skip Processing**: Set `autoProcess: false` for notes
2. **Batch Process**: Process notes during off-peak hours
3. **Selective Processing**: Only process important notes
4. **Use Shorter Content**: Truncate long content before processing

## Next Steps

- [Phase 2 Complete] Worker is ready for production
- [Phase 3] Add analytics dashboard to monitor processing
- [Phase 4] Integrate notes with article generation

## Support

For issues or questions:
- Check Coolify logs
- Review worker output
- Check Linear issues (AMI-14 through AMI-24)
