// src/components/teacher/TeacherLayout.tsx

'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap, LayoutDashboard, Users, CalendarCheck,
  TrendingUp, MessageSquare, Bell, User, LogOut, Menu, X, ChevronRight,
  Calendar, FileText
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { href: '/teacher-dashboard',            label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/teacher-dashboard/students',   label: 'Students',    icon: Users },
  { href: '/teacher-dashboard/attendance', label: 'Attendance',  icon: CalendarCheck },
  { href: '/teacher-dashboard/results',    label: 'Results',     icon: TrendingUp },
  { href: '/teacher-dashboard/remarks',    label: 'Remarks',     icon: MessageSquare },
  { href: '/teacher-dashboard/notices',    label: 'Notices',     icon: Bell },
  { href: '/teacher-dashboard/events',     label: 'Events',      icon: Calendar },
  { href: '/teacher-dashboard/leaves',     label: 'Leave Requests', icon: FileText },
  { href: '/teacher-dashboard/complaints', label: 'Complaints',  icon: MessageSquare },
  { href: '/teacher-dashboard/profile',    label: 'My Profile',  icon: User },
]

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready && (!isAuthenticated || user?.role !== 'teacher')) {
      router.replace('/login')
    }
  }, [ready, isAuthenticated, user, router])

  if (!ready || !isAuthenticated || user?.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-700 border-t-transparent rounded-full" />
      </div>
    )
  }

  const handleLogout = () => {
    clearAuth()
    router.replace('/login')
  }

  const isActive = (href: string) => {
    if (href === '/teacher-dashboard') return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-purple-900 z-30 flex flex-col
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-purple-800">
          <div className="w-9 h-9 bg-gold-500 rounded-full flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-purple-900" />
          </div>
          <div>
            <div className="text-white font-display font-bold text-sm leading-tight">Saraswati Public</div>
            <div className="text-gold-400 text-xs tracking-wide">Teacher Portal</div>
          </div>
          <button className="ml-auto lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-500/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <div className="text-white text-sm font-semibold">{user?.admissionNumber}</div>
              <div className="text-purple-300 text-xs capitalize">{user?.role}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-gold-500 text-purple-900' : 'text-purple-300 hover:text-white hover:bg-purple-800'
                }`}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-purple-800">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-purple-300 hover:text-red-400 hover:bg-purple-800 transition-all">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-lg text-purple-700 hover:bg-slate-50" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-purple-900 font-display font-bold text-lg">
              {navItems.find(n => isActive(n.href))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="text-xs text-slate-400 hidden sm:block">Session: 2024-25</div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-purple-700" />
            </div>
            <span className="text-sm font-medium text-purple-700 hidden sm:block">{user?.admissionNumber}</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
