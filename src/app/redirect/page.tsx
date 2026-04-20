// src/app/redirect/page.tsx

'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function RedirectPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }

    // Send to correct dashboard based on role
    switch (user.role) {
      case 'parent':
        router.replace('/parent-dashboard')
        break
      case 'student':
        router.replace('/dashboard')
        break
      case 'teacher':
        router.replace('/teacher-dashboard')
        break
      case 'admin':
        router.replace('/admin-dashboard') // 🛡️ FIXED: Changed from '/admin' to '/admin-dashboard'
        break
      case 'receptionist':
        router.replace('/receptionist-dashboard')
        break
      case 'principal':
        router.replace('/principal-dashboard')
        break
      default:
        router.replace('/login')
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-navy-700 border-t-transparent rounded-full" />
    </div>
  )
}