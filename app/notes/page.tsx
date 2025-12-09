import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

export default async function NotesPage() {
  const session = await getSession()

  if (!session) {
    redirect('/notes/login')
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-serif font-light mb-2">
          Your Notes
        </h1>
        <p className="text-[#888888] font-mono text-xs uppercase tracking-widest">
          Quick capture for links, images, videos, and text
        </p>
      </div>

      {/* QuickAdd Component - Will be implemented in AMI-10 */}
      <div className="glass p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md">
        <h2 className="text-sm font-mono uppercase tracking-widest text-[#888888] mb-4">
          Quick Add
        </h2>
        <p className="text-sm text-[#888888]">
          QuickAdd component will be added in the next step.
        </p>
      </div>

      {/* Notes List Component - Will be implemented in AMI-11 */}
      <div className="glass p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md">
        <h2 className="text-sm font-mono uppercase tracking-widest text-[#888888] mb-4">
          Your Notes
        </h2>
        <p className="text-sm text-[#888888]">
          Notes list component will be added in the next step.
        </p>
      </div>
    </div>
  )
}
