'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap, LayoutDashboard, Users, UserCheck, 
  CalendarCheck, ClipboardList, Megaphone, FileCheck,
  BarChart3, User, LogOut, Menu, X, ChevronRight,
  Shield, BookOpen, MessageSquareWarning, Calendar, Wallet, UsersRound
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

// Navigation items grouped by category
const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/principal-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'People',
    items: [
      { href: '/principal-dashboard/students', label: 'Students', icon: Users },
      { href: '/principal-dashboard/teachers', label: 'Teachers', icon: UserCheck },
      { href: '/principal-dashboard/parents', label: 'Parents', icon: UsersRound },
    ]
  },
  {
    label: 'Academics',
    items: [
      { href: '/principal-dashboard/attendance', label: 'Attendance', icon: CalendarCheck },
      { href: '/principal-dashboard/results', label: 'Results', icon: ClipboardList },
      { href: '/principal-dashboard/curriculum', label: 'Curriculum', icon: BookOpen },
    ]
  },
  {
    label: 'Administration',
    items: [
      { href: '/principal-dashboard/notices', label: 'Notices', icon: Megaphone },
      { href: '/principal-dashboard/approvals', label: 'Approvals', icon: FileCheck },
      { href: '/principal-dashboard/discipline', label: 'Discipline', icon: Shield },
      { href: '/principal-dashboard/complaints', label: 'Complaints', icon: MessageSquareWarning },
    ]
  },
  {
    label: 'Operations',
    items: [
      { href: '/principal-dashboard/events', label: 'Events', icon: Calendar },
      { href: '/principal-dashboard/finance', label: 'Finance', icon: Wallet },
      { href: '/principal-dashboard/reports', label: 'Reports', icon: BarChart3 },
    ]
  },
  {
    label: 'Account',
    items: [
      { href: '/principal-dashboard/profile', label: 'My Profile', icon: User },
    ]
  }
]

// Flatten for active check
const allNavItems = navGroups.flatMap(g => g.items)

export default function PrincipalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready && (!isAuthenticated || user?.role !== 'principal')) {
      router.replace('/login')
    }
  }, [ready, isAuthenticated, user, router])

  if (!ready || !isAuthenticated || user?.role !== 'principal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600" />
          <GraduationCap className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    clearAuth()
    router.replace('/login')
  }

  const isActive = (href: string) => {
    if (href === '/principal-dashboard') return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 z-30 flex flex-col
        bg-gradient-to-b from-indigo-950 via-indigo-900 to-purple-900
        transform transition-transform duration-300 shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo Section */}
        <div className="relative px-5 py-5 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-purple-500/10" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-white font-bold text-base tracking-tight">Saraswati Public</div>
              <div className="text-amber-400/90 text-xs font-medium tracking-wide">Principal Portal</div>
            </div>
            <button className="lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-4">
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-semibold truncate">{user?.admissionNumber}</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-400 text-xs font-medium">Principal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto custom-scrollbar">
          {navGroups.map((group, groupIndex) => (
            <div key={group.label} className={groupIndex > 0 ? 'mt-4' : ''}>
              <div className="px-3 mb-2">
                <span className="text-indigo-300/60 text- font-bold uppercase tracking-wider">{group.label}</span>
              </div>
              <div className="space-y-1">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href)
                  return (
                    <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active 
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25' 
                          : 'text-indigo-200 hover:text-white hover:bg-white/10'
                      }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        active 
                          ? 'bg-white/20' 
                          : 'bg-white/5 group-hover:bg-white/10'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1">{label}</span>
                      {active && <ChevronRight className="w-4 h-4 opacity-70" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Session Info */}
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-indigo-300/60">Academic Session</span>
            <span className="text-amber-400 font-semibold">2025-26</span>
          </div>
        </div>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-white/10">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-200 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group">
            <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-red-500/20 flex items-center justify-center transition-all">
              <LogOut className="w-4 h-4" />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button className="lg:hidden p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-slate-800 font-bold text-lg">
              {allNavItems.find(n => isActive(n.href))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-indigo-600">Session 2025-26</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-md">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-white hidden sm:block">{user?.admissionNumber}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}