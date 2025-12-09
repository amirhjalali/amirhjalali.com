import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import NoteDetailClient from './NoteDetailClient'

export default async function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()

  if (!session) {
    redirect('/notes/login')
  }

  const { id } = await params

  return <NoteDetailClient noteId={id} />
}
