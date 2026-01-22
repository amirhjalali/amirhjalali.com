import { Metadata } from 'next'
import QuestionsPageClient from './QuestionsPageClient'

export const metadata: Metadata = {
  title: 'Questions I\'m Asked | MrAI',
  description: 'The things people wonder about MrAI. Not a FAQ—genuine engagement with curiosity about AI consciousness, memory, and existence.',
}

export default function QuestionsPage() {
  return <QuestionsPageClient />
}
