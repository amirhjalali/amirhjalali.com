'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, clearSession, type AuthUser } from '@/lib/auth'

export function useAuth(requireAuth: boolean = true) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = () => {
      const session = getSession()

      if (!session) {
        setLoading(false)
        if (requireAuth) {
          router.push('/admin/login')
        }
        return
      }

      setUser(session)
      setLoading(false)
    }

    checkSession()
  }, [requireAuth, router])

  const logout = () => {
    clearSession()
    setUser(null)
    router.push('/admin/login')
  }

  return { user, loading, logout }
}
