#!/bin/sh
# Start worker in background
echo "🚀 Starting Worker..."
npx tsx scripts/note-worker.js &

# Start Next.js server in foreground
echo "🚀 Starting Web Server..."
HOSTNAME="0.0.0.0" node .next/standalone/server.js
