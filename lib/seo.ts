// SEO utilities and metadata generation

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export const generateMetadata = (metadata: SEOMetadata) => {
  const {
    title,
    description,
    keywords = [],
    ogImage = '/og-image.png',
    canonicalUrl,
    author = 'Amir H. Jalali',
    publishedTime,
    modifiedTime,
  } = metadata;

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: author }],
    openGraph: {
      title,
      description,
      images: [ogImage],
      type: 'website',
      ...(canonicalUrl && { url: canonicalUrl }),
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@amirhjalali',
    },
    alternates: {
      ...(canonicalUrl && { canonical: canonicalUrl }),
    },
  };
};

// Generate JSON-LD structured data for articles
export const generateArticleSchema = (article: any) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.summary,
    image: article.image,
    datePublished: article.date,
    dateModified: article.updatedDate || article.date,
    author: {
      '@type': 'Person',
      name: 'Amir H. Jalali',
      url: 'https://amirhjalali.com',
    },
    publisher: {
      '@type': 'Person',
      name: 'Amir H. Jalali',
      logo: {
        '@type': 'ImageObject',
        url: 'https://amirhjalali.com/og-image.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://amirhjalali.com/thoughts/${article.id}`,
    },
  };
};

// Generate breadcrumb schema
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

// Common keywords for the site
export const siteKeywords = [
  'AI Consultant',
  'Generative AI',
  'Machine Learning',
  'Data Engineering',
  'AI Strategy',
  'LLMs',
  'GPT',
  'AI Implementation',
  'Business Intelligence',
  'Data Warehousing',
  'Technology Consulting',
  'AI Advisory',
];