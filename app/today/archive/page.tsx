import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import ArchiveClient from './ArchiveClient'

export const metadata = {
  title: 'Archive | Today',
  description: 'Completed tasks history',
}

export default async function ArchivePage() {
  const session = await getSession()

  if (!session) {
    redirect('/login?redirectTo=/today/archive')
  }

  return <ArchiveClient />
}
