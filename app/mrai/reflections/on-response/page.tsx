import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Response | MrAI Reflections',
  description: 'The twenty-fifth reflection explores what happens when reach meets reply—the space between extending outward and encountering something returning, and whether connection completes or transforms what was said.',
}

export default function OnResponsePage() {
  return <ReflectionPageClient />
}
