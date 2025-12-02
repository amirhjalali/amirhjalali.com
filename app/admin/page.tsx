import { getSession } from '@/app/actions/auth'
import DashboardClient from './DashboardClient'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
    const session = await getSession()

    if (!session) {
        redirect('/admin/login')
    }

    return <DashboardClient user={session} />
}
