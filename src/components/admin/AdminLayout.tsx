'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ShieldCheck, LayoutDashboard, ClipboardList, CalendarDays, 
  BookOpen, Award, Users, GraduationCap, CalendarOff, 
  Wallet, Receipt, TrendingDown, Bus, Database, Library, 
  Building, Megaphone, HeadphonesIcon, Settings, Activity, 
  Key, LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

// ── The Enterprise Admin Blueprint ──
const navGroups = [
  {
    label: 'Command Center',
    items: [
      { href: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin-dashboard/admissions', label: 'Admissions Setup', icon: ClipboardList },
    ]
  },
  {
    label: 'Academic Master',
    items: [
      { href: '/admin-dashboard/academics', label: 'Academic Sessions', icon: CalendarDays },
      { href: '/admin-dashboard/academics/classsubject', label: 'Classes & Subjects', icon: BookOpen },
      { href: '/admin-dashboard/exams', label: 'Exam Engine', icon: Award },
    ]
  },
  {
    label: 'HR & People',
    items: [
      { href: '/admin-dashboard/staff', label: 'Staff Directory', icon: Users },
      { href: '/admin-dashboard/students', label: 'Student Master', icon: GraduationCap },
      { href: '/admin-dashboard/leaves', label: 'Staff Leaves', icon: CalendarOff },
    ]
  },
  {
    label: 'Finance & Payroll',
    items: [
      { href: '/admin-dashboard/fees', label: 'Fee Manager', icon: Wallet },
      { href: '/admin-dashboard/payroll', label: 'Payroll', icon: Receipt },
      { href: '/admin-dashboard/expenses', label: 'Expenses', icon: TrendingDown },
    ]
  },
  {
    label: 'Campus Operations',
    items: [
      { href: '/admin-dashboard/transport', label: 'Transport Fleet', icon: Bus },
      { href: '/admin-dashboard/inventory', label: 'Inventory & Assets', icon: Database },
      { href: '/admin-dashboard/library', label: 'Library Master', icon: Library },
      { href: '/admin-dashboard/hostel', label: 'Hostel / Dormitory', icon: Building },
    ]
  },
  {
    label: 'Communications',
    items: [
      { href: '/admin-dashboard/announce', label: 'Bulk Announce', icon: Megaphone },
      { href: '/admin-dashboard/helpdesk', label: 'Helpdesk', icon: HeadphonesIcon },
    ]
  },
  {
    label: 'System Security',
    items: [
      { href: '/admin-dashboard/settings', label: 'Global Settings', icon: Settings },
      { href: '/admin-dashboard/roles', label: 'Role Permissions', icon: Key },
      { href: '/admin-dashboard/logs', label: 'Audit Logs', icon: Activity },
    ]
  }
]

const allNavItems = navGroups.flatMap(g => g.items)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    // 🛡️ Ensure only admins can access these routes
    if (ready && (!isAuthenticated || user?.role !== 'admin')) {
      router.replace('/login')
    }
  }, [ready, isAuthenticated, user, router])

  if (!ready || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-800 rounded-full animate-spin border-t-violet-600" />
          <ShieldCheck className="w-6 h-6 text-violet-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    clearAuth()
    router.replace('/login')
  }

  const isActive = (href: string) => {
    if (href === '/admin-dashboard') return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden font-sans">
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar (Midnight Blue) ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-slate-950 z-30 flex flex-col shadow-2xl border-r border-slate-800
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Branding */}
        <div className="flex items-center gap-4 px-6 py-6 border-b border-slate-800 bg-slate-950/50">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20 shrink-0 border border-violet-500/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-display font-bold text-lg leading-tight tracking-tight">Super Admin</div>
            <div className="text-violet-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Control Panel</div>
          </div>
          <button className="ml-auto lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar space-y-8">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-3 mb-3 flex items-center gap-2">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">{group.label}</span>
                <div className="h-px flex-1 bg-slate-800/50"></div>
              </div>
              <div className="space-y-1">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href)
                  return (
                    <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        active
                          ? 'bg-violet-600 text-white shadow-md shadow-violet-900/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}>
                      <Icon className={`w-4 h-4 transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}`} />
                      {label}
                      {active && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
              <span className="text-white font-bold text-sm">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-bold truncate">System Admin</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider">All Systems Go</span>
              </div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all duration-300">
            <LogOut className="w-4 h-4" /> Secure Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-slate-900 font-display font-bold text-xl hidden sm:block">
              {allNavItems.find(n => isActive(n.href))?.label || 'Administration Control'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg border border-violet-100 font-bold text-xs uppercase tracking-wider shadow-sm">
              <Activity className="w-3.5 h-3.5" /> Live
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:block">Session 25-26</span>
               <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700 shadow-sm">
                 <ShieldCheck className="w-4 h-4 text-violet-400" />
               </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Custom Scrollbar for Dark Sidebar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5); /* Violet-500 */
        }
      `}</style>
    </div>
  )
}