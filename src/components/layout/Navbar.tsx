// src/components/layout/Navbar.tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, GraduationCap, ChevronDown, LogIn, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

// helper fucntions meriji kya kr loge be tum ye helper function hai jo ki routes dega accoding to kon login kiya hai nhi diya toh kya kr loge mera 
const getDashboardRoute = (role?: string) => {
  switch (role) {
    case 'parent': return '/parent-dashboard'
    case 'teacher': return '/teacher-dashboard'
    case 'admin': return '/admin-dashboard' // FIXED: was '/admin'
    case 'receptionist': return '/receptionist-dashboard'
    case 'principal': return '/principal-dashboard'
    case 'student': return '/dashboard'
    default: return '/'
  }
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  {
    label: 'Academics', href: '/academics',
    children: [
      { href: '/academics', label: 'Curriculum' },
      { href: '/academics/results', label: 'Results' }, // FIXED: was '/results'
    ]
  },
  { href: '/admissions', label: 'Admissions' },
  { href: '/faculty', label: 'Faculty' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/events', label: 'Events' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdown, setDropdown] = useState<string | null>(null)
  const [userMenu, setUserMenu] = useState(false)
  const [mounted, setMounted] = useState(false)

  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, clearAuth } = useAuthStore()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-user-menu]')) {
        setUserMenu(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation()
    clearAuth()
    router.push('/')
  }

  return (
    <>
      <div className="bg-navy-900 text-white text-xs py-1.5 px-4 hidden md:flex justify-between items-center">
        <span>📞 +91 98765 43210 &nbsp;|&nbsp; ✉ info@saraswatischool.edu.in</span>
        <span>📍 Civil Lines, Varanasi, UP — 221001</span>
      </div>

      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white border-b border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center shadow-md group-hover:bg-gold-500 transition-colors">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-navy-800 text-sm leading-tight">Saraswati Public</div>
              <div className="text-xs text-gold-600 font-semibold tracking-wide">SCHOOL</div>
            </div>
          </Link>

          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.label} className="relative"
                onMouseEnter={() => link.children && setDropdown(link.label)}
                onMouseLeave={() => setDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === link.href
                      ? 'text-navy-700 bg-navy-50'
                      : 'text-slate-600 hover:text-navy-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                  {link.children && <ChevronDown className="w-3 h-3" />}
                </Link>
                {link.children && dropdown === link.label && (
                  <div className="absolute top-full left-0 bg-white shadow-xl rounded-xl border border-slate-100 py-2 min-w-40 animate-fade-up">
                    {link.children.map(child => (
                      <Link key={child.href} href={child.href}
                        className="block px-4 py-2 text-sm text-slate-600 hover:bg-navy-50 hover:text-navy-700 transition-colors">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-3">
            {mounted && isAuthenticated && user ? (
              <div className="relative" data-user-menu>
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2.5 bg-navy-50 hover:bg-navy-100 border border-navy-200 px-3 py-2 rounded-xl transition-colors"
                >
                  <div className="w-7 h-7 bg-navy-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-navy-800 leading-tight">{user.admissionNumber}</div>
                    <div className="text-xs text-slate-400 capitalize leading-tight">{user.role}</div>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${userMenu ? 'rotate-180' : ''}`} />
                </button>

                {userMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white shadow-xl rounded-2xl border border-slate-100 py-2 min-w-48 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-navy-800">{user.admissionNumber}</div>
                          <div className="text-xs text-slate-400 capitalize">{user.role}</div>
                        </div>
                      </div>
                    </div>

                    <Link href={getDashboardRoute(user.role)}
                      onClick={() => setUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-navy-50 hover:text-navy-700 transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                      My Dashboard
                    </Link>
                    <Link href={`${getDashboardRoute(user.role)}/profile`} // FIXED: role-based profile
                      onClick={() => setUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-navy-50 hover:text-navy-700 transition-colors">
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login"
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-navy-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}

            <Link href="/admissions" className="btn-gold text-sm py-2 px-4">
              Apply Now
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-lg text-navy-700">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden bg-white border-t border-slate-100 px-4 pb-4">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-medium text-slate-700 border-b border-slate-50 hover:text-navy-700">
                {link.label}
              </Link>
            ))}

            {mounted && isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 py-3 border-b border-slate-50">
                  <div className="w-8 h-8 bg-navy-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-navy-800">{user.admissionNumber}</div>
                    <div className="text-xs text-slate-400 capitalize">{user.role}</div>
                  </div>
                </div>
                <Link href={getDashboardRoute(user.role)} onClick={() => setOpen(false)}
                  className="flex items-center gap-2 py-2.5 text-sm font-medium text-slate-700 border-b border-slate-50 hover:text-navy-700">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center gap-2 py-2.5 text-sm font-medium text-red-500 w-full border-b border-slate-50">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}
                className="flex items-center gap-2 py-2.5 text-sm font-medium text-slate-700 border-b border-slate-50 hover:text-navy-700">
                <LogIn className="w-4 h-4" /> Login
              </Link>
            )}

            <Link href="/admissions" onClick={() => setOpen(false)}
              className="mt-3 btn-gold text-sm w-full justify-center">
              Apply Now
            </Link>
          </div>
        )}
      </nav>
    </>
  )
}