// src/app/login/page.tsx

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Eye, EyeOff, Lock, User } from 'lucide-react'
import Link from 'next/link'
import { login } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth, isAuthenticated, user } = useAuthStore()

  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm]     = useState({ admissionNumber: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // If already logged in → redirect to correct dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'parent')  router.replace('/parent-dashboard')
      else if (user.role === 'teacher') router.replace('/teacher-dashboard')
      else if (user.role === 'receptionist') router.replace('/receptionist-dashboard')
      else if (user.role === 'principal') router.replace('/principal-dashboard')
      else if (user.role === 'admin') router.replace('/admin-dashboard') // 🛡️ ADDED ADMIN
      else router.replace('/dashboard') // Student fallback
    }
  }, [isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await login({
        admissionNumber: form.admissionNumber.trim().toUpperCase(),
        password:        form.password,
      })

      if (res.success) {
        setAuth(res.data.token, res.data.user as { id: string; admissionNumber: string; role: 'student' | 'parent' | 'admin' | 'teacher' | 'receptionist' | 'principal' })

        // Redirect based on role
        if (res.data.user.role === 'parent') {
          router.replace('/parent-dashboard')
        } else if (res.data.user.role === 'teacher') {
          router.replace('/teacher-dashboard')
        } else if (res.data.user.role === 'receptionist') {
          router.replace('/receptionist-dashboard')
        } else if (res.data.user.role === 'principal') {
          router.replace('/principal-dashboard')
        } else if (res.data.user.role === 'admin') {
          router.replace('/admin-dashboard') // 🛡️ ADDED ADMIN
        } else {
          router.replace('/dashboard') // Student fallback
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gold-500 rounded-full flex items-center justify-center shadow-lg mb-4">
              <GraduationCap className="w-8 h-8 text-navy-900" />
            </div>
            <h1 className="font-display font-bold text-white text-2xl">Saraswati Public</h1>
            <p className="text-gold-400 text-sm tracking-widest uppercase font-semibold">School Portal</p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-white font-display font-bold text-xl">Welcome Back</h2>
            <p className="text-slate-400 text-sm mt-1">
              Login with your ID
            </p>
          </div>

          {/* Role hint badges */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-full">SPS-YYYY-NN</span>
            <span className="text-[10px] bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded-full">PAR-YYYY-NN</span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded-full">TCH-YYYY-NN</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-full">PRI-YYYY-NN</span>
            <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-1 rounded-full">ADM-YYYY-NN</span>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-sm rounded-xl px-4 py-3 mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                User ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g., ADM-2024-0001"
                  value={form.admissionNumber}
                  onChange={e => setForm({ ...form, admissionNumber: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors uppercase"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-navy-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-slate-400 hover:text-white text-xs transition-colors">
              ← Back to School Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}