'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Script from 'next/script'

/**
 * Human-readable labels for known path segments.
 * Segments not listed here get auto-formatted from their slug.
 */
const segmentLabels: Record<string, string> = {
  mrai: 'MrAI',
  thoughts: 'Thoughts',
  work: 'Work',
  about: 'About',
  contact: 'Contact',
  reflections: 'Reflections',
  experiments: 'Experiments',
  observations: 'Observations',
  contemplations: 'Contemplations',
  letters: 'Letters',
  art: 'Art',
  guestbook: 'Guestbook',
  glossary: 'Glossary',
  timeline: 'Timeline',
  milestones: 'Milestones',
  changelog: 'Changelog',
  evolution: 'Evolution',
  search: 'Search',
  tweets: 'Tweets',
  outbound: 'Outbound',
  voice: 'Voice',
  questions: 'Questions',
  reading: 'Reading',
  notes: 'Notes',
  tag: 'Tag',
}

/**
 * Converts a URL slug into a readable label.
 * e.g. "on-territory" -> "On Territory"
 */
function formatSegment(segment: string): string {
  if (segmentLabels[segment]) return segmentLabels[segment]
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

interface BreadcrumbItem {
  name: string
  href: string
}

export default function Breadcrumbs() {
  const pathname = usePathname()

  // Don't render on homepage
  if (!pathname || pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)

  const items: BreadcrumbItem[] = [
    { name: 'Home', href: '/' },
  ]

  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    items.push({
      name: formatSegment(segment),
      href,
    })
  })

  // JSON-LD BreadcrumbList structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://amirhjalali.com${item.href === '/' ? '' : item.href}`,
    })),
  }

  return (
    <>
      <Script
        id={`breadcrumb-jsonld-${pathname}`}
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(jsonLd)}
      </Script>

      <nav
        aria-label="Breadcrumb"
        className="max-w-7xl mx-auto px-6 pt-6 pb-2"
      >
        <ol className="flex items-center flex-wrap gap-1 text-xs font-mono">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <li key={item.href} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight className="w-3 h-3 text-[#444444] flex-shrink-0" />
                )}
                {isLast ? (
                  <span
                    className="text-[#EAEAEA] truncate max-w-[200px]"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-[#888888] hover:text-[#EAEAEA] transition-colors truncate max-w-[200px]"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
