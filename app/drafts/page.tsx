import { getSession } from '@/app/actions/auth'
import DashboardClient from './DashboardClient'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Drafts | Amir H. Jalali',
  description: 'Article drafts management',
}

export default async function DraftsPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login?redirectTo=/drafts')
  }

  return <DashboardClient user={session} />
}
