'use client'

import { ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

// ═══════════════════════════════════════════════════════════════════════════════
// Global Providers Wrapper
// Wraps all client-side context providers for the application
// ═══════════════════════════════════════════════════════════════════════════════

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ErrorBoundary>
  )
}
