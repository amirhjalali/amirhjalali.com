import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import NotesPageClient from './NotesPageClient'

export default async function NotesPage() {
  const session = await getSession()

  if (!session) {
    redirect('/notes/login')
  }

  return <NotesPageClient />
}
