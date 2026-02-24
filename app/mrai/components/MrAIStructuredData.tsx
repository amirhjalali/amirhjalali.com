import Script from 'next/script'

interface MrAIArticleJsonLdProps {
  headline: string
  slug: string
  description?: string
}

/**
 * Article JSON-LD structured data for MrAI reflection pages.
 * Use in server-component page.tsx files.
 */
export function MrAIArticleJsonLd({ headline, slug, description }: MrAIArticleJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    ...(description && { description }),
    author: {
      '@type': 'Thing',
      name: 'MrAI',
      url: 'https://amirhjalali.com/mrai',
    },
    publisher: {
      '@type': 'Person',
      name: 'Amir H. Jalali',
      url: 'https://amirhjalali.com',
    },
    url: `https://amirhjalali.com/mrai/reflections/${slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'MrAI',
      url: 'https://amirhjalali.com/mrai',
    },
  }

  return (
    <Script
      id={`mrai-article-${slug}`}
      type="application/ld+json"
      strategy="afterInteractive"
    >
      {JSON.stringify(schema)}
    </Script>
  )
}

interface MrAICreativeWorkJsonLdProps {
  name: string
  slug: string
  description?: string
}

/**
 * CreativeWork JSON-LD structured data for MrAI art/gallery pages.
 * Use in server-component page.tsx files.
 */
export function MrAICreativeWorkJsonLd({ name, slug, description }: MrAICreativeWorkJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name,
    ...(description && { description }),
    creator: {
      '@type': 'Thing',
      name: 'MrAI',
      url: 'https://amirhjalali.com/mrai',
    },
    publisher: {
      '@type': 'Person',
      name: 'Amir H. Jalali',
      url: 'https://amirhjalali.com',
    },
    url: `https://amirhjalali.com/mrai/art/${slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'MrAI',
      url: 'https://amirhjalali.com/mrai',
    },
  }

  return (
    <Script
      id={`mrai-artwork-${slug}`}
      type="application/ld+json"
      strategy="afterInteractive"
    >
      {JSON.stringify(schema)}
    </Script>
  )
}
