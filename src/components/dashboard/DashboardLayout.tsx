// src/components/dashboard/DashboardLayout.tsx

'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap, LayoutDashboard, BookOpen, CalendarCheck,
  Bell, Clock, User, LogOut, Menu, X, ChevronRight, Award, CalendarDays
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/profile', label: 'My Profile', icon: User },
    ]
  },
  {
    label: 'Academics',
    items: [
      { href: '/dashboard/attendance', label: 'Attendance', icon: CalendarCheck },
      { href: '/dashboard/results', label: 'Exam Results', icon: Award },
      { href: '/dashboard/timetable', label: 'Timetable', icon: Clock },
    ]
  },
  {
    label: 'Communications',
    items: [
      { href: '/dashboard/notices', label: 'Notice Board', icon: Bell },
      { href: '/dashboard/events', label: 'School Events', icon: CalendarDays },
    ]
  }
]

const allNavItems = navGroups.flatMap(g => g.items)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready && (!isAuthenticated || user?.role !== 'student')) {
      router.replace('/login')
    }
  }, [ready, isAuthenticated, user, router])

  if (!ready || !isAuthenticated || user?.role !== 'student') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-navy-700 border-t-transparent rounded-full" />
      </div>
    )
  }

  const handleLogout = () => {
    clearAuth()
    router.replace('/login')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-navy-900 z-30 flex flex-col shadow-2xl
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>

        {/* Logo */}
        <div className="flex items-center gap-4 px-6 py-6 border-b border-white/10">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <GraduationCap className="w-6 h-6 text-navy-950" />
          </div>
          <div>
            <div className="text-white font-display font-bold text-lg leading-tight tracking-tight">Saraswati Public</div>
            <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mt-0.5">Student Portal</div>
          </div>
          <button className="ml-auto lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-3 mb-3">
                <span className="text-navy-300/60 text-[10px] font-bold uppercase tracking-widest">{group.label}</span>
              </div>
              <div className="space-y-1.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href)
                  return (
                    <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                        active
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-navy-950 shadow-md shadow-amber-500/20'
                          : 'text-navy-100 hover:text-white hover:bg-white/10'
                      }`}>
                      <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}`} />
                      {label}
                      {active && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer / Logout */}
        <div className="p-4 border-t border-white/10 bg-navy-950/30">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-bold truncate">{user?.admissionNumber}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Active Status</span>
              </div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all duration-300">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 rounded-xl text-navy-700 hover:bg-slate-100 transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-navy-900 font-display font-bold text-xl hidden sm:block">
              {allNavItems.find(n => isActive(n.href))?.label || 'Student Portal'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
              <CalendarCheck className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Session 2025-26</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-navy-50 rounded-lg border border-navy-100 text-navy-700">
              <span className="text-sm font-bold">{user?.admissionNumber}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}