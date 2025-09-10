// SEO utilities and structured data helpers
import { Metadata } from 'next';

export const generateSEOMetadata = (
  title: string,
  description: string,
  path: string = '/',
  image?: string
): Metadata => {
  const baseUrl = 'https://amirhjalali.com';
  const defaultImage = '/images/og-image.jpg';
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}${path}`,
      siteName: 'Amir H. Jalali',
      images: [
        {
          url: image || defaultImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image || defaultImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `${baseUrl}${path}`,
    },
  };
};

// Generate JSON-LD structured data
export const generateStructuredData = (type: string, data: any) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };
  
  return JSON.stringify(structuredData);
};

// Person schema for portfolio
export const generatePersonSchema = () => {
  return generateStructuredData('Person', {
    name: 'Amir H. Jalali',
    url: 'https://amirhjalali.com',
    image: 'https://amirhjalali.com/images/profile.jpg',
    jobTitle: 'Software Developer',
    sameAs: [
      'https://github.com/amirhjalali',
      'https://linkedin.com/in/amirhjalali',
      'https://twitter.com/amirhjalali',
    ],
  });
};

// Website schema
export const generateWebsiteSchema = () => {
  return generateStructuredData('WebSite', {
    name: 'Amir H. Jalali Portfolio',
    url: 'https://amirhjalali.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://amirhjalali.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  });
};

// Generate breadcrumb schema
export const generateBreadcrumbSchema = (items: Array<{name: string; url: string}>) => {
  return generateStructuredData('BreadcrumbList', {
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
};