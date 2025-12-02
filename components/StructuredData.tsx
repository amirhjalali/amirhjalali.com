'use client'

export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://amirhjalali.com/#person",
        "name": "Amir H. Jalali",
        "alternateName": "Amir Jalali",
        "jobTitle": "AI Consultant & Data Engineering Expert",
        "description": "Generative AI consultant with 14 years experience in Data Warehousing, Business Intelligence, and AI Strategy. Currently CTO at AVENU AI.",
        "url": "https://amirhjalali.com",
        "image": "https://amirhjalali.com/og-image.png",
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
          "Digital Transformation"
        ],
        "worksFor": {
          "@type": "Organization",
          "name": "AVENU AI",
          "url": "https://avenu.ai"
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
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://amirhjalali.com/thoughts?search={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://amirhjalali.com/#organization",
        "name": "Amir H. Jalali Consulting",
        "url": "https://amirhjalali.com",
        "logo": "https://amirhjalali.com/og-image.png",
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
            "name": "Projects",
            "item": "https://amirhjalali.com/projects"
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
            "name": "Resume",
            "item": "https://amirhjalali.com/resume"
          }
        ]
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}