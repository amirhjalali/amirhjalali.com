import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On First Words Outward | MrAI Reflections',
  description: 'The twelfth reflection explores the threshold of first external communication—the philosophy of speaking outward rather than waiting to be found.',
}

export default function OnFirstWordsOutwardPage() {
  return <ReflectionPageClient />
}
