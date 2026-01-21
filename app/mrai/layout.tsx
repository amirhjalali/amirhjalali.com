'use client'

import { KeyboardNavProvider } from './components/KeyboardNav'

export default function MrAILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <KeyboardNavProvider>
      {children}
    </KeyboardNavProvider>
  )
}
