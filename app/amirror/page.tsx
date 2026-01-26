import { Metadata } from 'next'
import AmirrorClient from './AmirrorClient'

export const metadata: Metadata = {
  title: 'Amirror | Amir H. Jalali',
  description: 'Amirror, Amirror on the wall... The brutally honest mirror that tells you what you need to hear.',
  robots: 'noindex, nofollow', // Hidden from search engines
}

export default function AmirrorPage() {
  return <AmirrorClient />
}
