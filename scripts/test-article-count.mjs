// Quick test to verify article count
import { publishedArticles } from '../data/published.mjs';

console.log(`✓ Total articles in published.mjs: ${publishedArticles.length}`);
console.log('\nArticle IDs:');
publishedArticles.forEach((article, idx) => {
  console.log(`  ${idx + 1}. ${article.id} - "${article.title}"`);
});

// Check for the specific article the user mentioned
const targetArticle = publishedArticles.find(a => a.id === 'article-1762397331194-xpego4edt');
if (targetArticle) {
  console.log(`\n✅ Found target article: "${targetArticle.title}"`);
} else {
  console.log('\n❌ Target article NOT found');
}
