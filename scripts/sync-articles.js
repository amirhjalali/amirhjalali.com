#!/usr/bin/env node

/**
 * Sync Script for Articles
 * 
 * This script helps sync articles from browser localStorage to repository files.
 * 
 * Usage:
 * 1. In browser console, run: copy(localStorage.getItem('published-articles'))
 * 2. Run: node scripts/sync-articles.js --published '<paste-content>'
 * 
 * OR for drafts:
 * 1. In browser console, run: copy(localStorage.getItem('draft-articles'))
 * 2. Run: node scripts/sync-articles.js --drafts '<paste-content>'
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const isDrafts = args[0] === '--drafts';
const isPublished = args[0] === '--published';
const data = args[1];

if (!data || (!isDrafts && !isPublished)) {
  console.log('Usage:');
  console.log('  node scripts/sync-articles.js --published \'<json-data>\'');
  console.log('  node scripts/sync-articles.js --drafts \'<json-data>\'');
  process.exit(1);
}

try {
  const articles = JSON.parse(data);
  const fileName = isDrafts ? 'drafts.json' : 'published.json';
  const filePath = path.join(__dirname, '..', 'public', 'data', fileName);
  
  fs.writeFileSync(filePath, JSON.stringify(articles, null, 2));
  console.log(`✅ Successfully saved ${articles.length} articles to ${fileName}`);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
