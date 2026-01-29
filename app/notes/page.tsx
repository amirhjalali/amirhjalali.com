import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import NotesPageClient from './NotesPageClient'

export const metadata = {
  title: 'Notes | Amir H. Jalali',
  description: 'Personal notes and knowledge base',
}

export default async function NotesPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login?redirectTo=/notes')
  }

  return <NotesPageClient />
}
