'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface AuthUser {
  username: string
  role: string
}

export function useAuth(requireAuth: boolean = true) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('admin_token')

      if (!token) {
        setLoading(false)
        if (requireAuth) {
          router.push('/admin/login')
        }
        return
      }

      try {
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          // Token is invalid or expired
          localStorage.removeItem('admin_token')
          setUser(null)
          if (requireAuth) {
            router.push('/admin/login')
          }
          return
        }

        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error('Auth verification error:', error)
        localStorage.removeItem('admin_token')
        setUser(null)
        if (requireAuth) {
          router.push('/admin/login')
        }
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [requireAuth, router])

  const logout = () => {
    localStorage.removeItem('admin_token')
    setUser(null)
    router.push('/admin/login')
  }

  return { user, loading, logout }
}
