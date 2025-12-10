'use client'

import { useActionState } from 'react'
import { motion } from 'framer-motion'
import { Lock, User } from 'lucide-react'
import Spotlight from '@/components/Spotlight'
import { login } from '@/app/actions/auth'

const initialState = {
  error: '',
}

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#050505] text-[#EAEAEA]">
      {/* Background effects */}
      <div className="noise-overlay" />
      <Spotlight />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="glass p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border border-white/20 mb-4">
              <Lock className="w-8 h-8 text-[#EAEAEA]" />
            </div>
            <h1 className="text-3xl font-serif font-light mb-2 text-[#EAEAEA]">
              Admin Login
            </h1>
            <p className="text-[#888888] font-mono text-xs uppercase tracking-widest">
              Sign in to access the admin panel
            </p>
          </div>

          {/* Login Form */}
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="redirectTo" value="/admin" />
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-xs font-mono uppercase tracking-widest mb-2 text-[#888888]">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-[#EAEAEA] placeholder:text-[#888888]/50 transition-all font-mono"
                  placeholder="Enter username"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-mono uppercase tracking-widest mb-2 text-[#888888]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-[#EAEAEA] placeholder:text-[#888888]/50 transition-all font-mono"
                  placeholder="Enter password"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Error Message */}
            {state?.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-mono"
              >
                {state.error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-[#EAEAEA] text-[#050505] font-mono text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-white active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#050505]/30 border-t-[#050505] rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-[10px] font-mono uppercase tracking-widest text-[#888888]">
            <p>Protected admin area</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

