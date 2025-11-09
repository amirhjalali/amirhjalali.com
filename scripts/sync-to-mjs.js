const fs = require('fs');

// Read published.json
const published = JSON.parse(fs.readFileSync('./public/data/published.json', 'utf8'));

console.log(`Syncing ${published.length} articles to published.mjs...`);

// Generate the baseArticles array in .mjs format
const mjsContent = `// Auto-generated from published.json
// DO NOT EDIT MANUALLY - Run 'node scripts/sync-to-mjs.js' to regenerate

export const baseArticles = [
${published.map((article, idx) => {
  const content = article.content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
  const title = article.title.replace(/'/g, "\\'");
  const excerpt = article.excerpt.replace(/'/g, "\\'");
  const author = article.author.replace(/'/g, "\\'");

  return `{
  title: '${title}',
  excerpt: '${excerpt}',
  content: \`${content}\`,
  tags: ${JSON.stringify(article.tags)},
  author: '${author}',
  aiGenerated: ${article.aiGenerated},
  imageUrl: '${article.imageUrl}',
}`;
}).join(',\n')}
];

export const publishedArticles = baseArticles.map((article, index) => ({
  ...article,
  publishedAt: ${JSON.stringify(published.map(a => a.publishedAt))}[index],
  readTime: ${JSON.stringify(published.map(a => a.readTime))}[index],
  id: ${JSON.stringify(published.map(a => a.id))}[index],
}));
`;

fs.writeFileSync('./data/published.mjs', mjsContent);
console.log('✓ Generated data/published.mjs');
console.log('✅ Sync complete!');
