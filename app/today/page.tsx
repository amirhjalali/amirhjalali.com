import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import TodayClient from './TodayClient'

export const metadata = {
  title: 'Today | Amir H. Jalali',
  description: 'Daily task management',
}

export default async function TodayPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login?redirectTo=/today')
  }

  return <TodayClient />
}
