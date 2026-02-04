import Script from 'next/script'

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://amirhjalali.com/#person",
      "name": "Amir H. Jalali",
      "alternateName": "Amir Jalali",
      "jobTitle": "Co-Founder & Chief Product Officer",
      "description": "Generative AI consultant with 14+ years experience in Data Warehousing, Business Intelligence, and AI Strategy. Co-Founder and CPO at Gabooja.",
      "url": "https://amirhjalali.com",
      "image": "https://amirhjalali.com/og-image.webp",
      "sameAs": [
        "https://linkedin.com/in/amirhjalali",
        "https://twitter.com/amirhjalali",
        "https://github.com/amirhjalali"
      ],
      "knowsAbout": [
        "Artificial Intelligence",
        "Generative AI",
        "Large Language Models",
        "Data Engineering",
        "Business Intelligence",
        "Data Warehousing",
        "Machine Learning",
        "Prompt Engineering",
        "AI Strategy",
        "Product Strategy"
      ],
      "worksFor": {
        "@type": "Organization",
        "name": "Gabooja",
        "url": "https://gabooja.com"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://amirhjalali.com/#website",
      "url": "https://amirhjalali.com",
      "name": "Amir H. Jalali - AI Consultant",
      "description": "Portfolio and thoughts on AI, data engineering, and technology innovation",
      "publisher": {
        "@id": "https://amirhjalali.com/#person"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://amirhjalali.com/#organization",
      "name": "Amir H. Jalali Consulting",
      "url": "https://amirhjalali.com",
      "logo": "https://amirhjalali.com/og-image.webp",
      "founder": {
        "@id": "https://amirhjalali.com/#person"
      },
      "description": "AI consulting services specializing in generative AI, data engineering, and strategic AI implementation",
      "serviceType": [
        "AI Consulting",
        "Data Engineering",
        "Business Intelligence",
        "AI Strategy Development",
        "Machine Learning Implementation"
      ]
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://amirhjalali.com/#breadcrumbs",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://amirhjalali.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Work",
          "item": "https://amirhjalali.com/work"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Thoughts",
          "item": "https://amirhjalali.com/thoughts"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "About",
          "item": "https://amirhjalali.com/about"
        },
        {
          "@type": "ListItem",
          "position": 5,
          "name": "Contact",
          "item": "https://amirhjalali.com/contact"
        }
      ]
    }
  ]
}

export default function StructuredData() {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      strategy="afterInteractive"
    >
      {JSON.stringify(structuredData)}
    </Script>
  )
}