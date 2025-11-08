const fs = require('fs');

// Read drafts
const drafts = JSON.parse(fs.readFileSync('./public/data/drafts.json', 'utf8'));
const published = JSON.parse(fs.readFileSync('./public/data/published.json', 'utf8'));

console.log(`Found ${drafts.length} drafts to migrate`);
console.log(`Currently ${published.length} published articles`);

// Remove the 'status' and 'metadata' fields from drafts before migrating  
const cleanedDrafts = drafts.map(({ status, metadata, ...article }) => article);

// Merge
const allPublished = [...published, ...cleanedDrafts];

console.log(`Total after merge: ${allPublished.length} articles`);

// Save to published.json
fs.writeFileSync(
  './public/data/published.json',
  JSON.stringify(allPublished, null, 2)
);

console.log('✓ Updated published.json');

// Clear drafts
fs.writeFileSync('./public/data/drafts.json', JSON.stringify([], null, 2));
console.log('✓ Cleared drafts.json');

console.log('\n✅ Migration complete! Now rebuild the site.');
