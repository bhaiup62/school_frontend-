'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import ReceptionistLayout from '@/components/receptionist/ReceptionistLayout'
import { getDashboardStats, getProfile } from '@/services/receptionistService'
import type { DashboardStats, ReceptionistProfile } from '@/services/receptionistService'
import { Users, UsersRound, UserPlus, TrendingUp, FileText, GraduationCap, Search, RefreshCw, CalendarDays, Sparkles } from 'lucide-react'

export default function ReceptionistDashboardPage() {
  const [profile, setProfile] = useState<ReceptionistProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [profileRes, statsRes] = await Promise.all([
        getProfile(),
        getDashboardStats(),
      ])
      setProfile(profileRes.data)
      setStats(statsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading && !profile) {
    return (
      <ReceptionistLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full" />
        </div>
      </ReceptionistLayout>
    )
  }

  // Helper to nicely sort classes containing Roman numerals or letters (if any)
  const sortClasses = (a: string, b: string) => {
    const numA = parseInt(a)
    const numB = parseInt(b)
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB
    return a.localeCompare(b)
  }

  return (
    <ReceptionistLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {/* Welcome Hero Banner */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <Sparkles className="absolute bottom-6 right-10 w-24 h-24 text-white/5 rotate-12 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="text-teal-200 text-sm font-bold uppercase tracking-wider mb-1">Reception Command Center</p>
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
                  Welcome, {profile?.firstName}!
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <CalendarDays className="w-3.5 h-3.5" /> 
                    {profile?.shift?.replace('_', ' ') || 'Full Day'} Shift
                  </span>
                  <span className="px-3 py-1 bg-black/20 border border-black/10 rounded-lg text-xs font-bold text-teal-50 uppercase tracking-wider shadow-sm">
                    ID: {profile?.receptionistId}
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={fetchData} 
              className="p-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white border border-white/20 backdrop-blur-sm shadow-sm flex items-center justify-center shrink-0 w-fit md:mt-0 mt-4"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Statistics Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-slate-800">{stats?.totalStudents || 0}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <UsersRound className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-slate-800">{stats?.totalParents || 0}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Parents</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-emerald-600">{stats?.recentRegistrations || 0}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">New (Last 30 Days)</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all duration-300">
            <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-slate-800">{stats?.studentsByClass?.length || 0}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Classes</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions (Takes up 2 columns on large screens) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h3 className="font-display font-bold text-slate-800 text-xl mb-6">Quick Actions</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              
              <Link href="/receptionist-dashboard/register" className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl hover:bg-emerald-100 hover:border-emerald-200 transition-all group">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-emerald-200 shadow-sm group-hover:scale-105 transition-transform">
                  <UserPlus className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">New Admission</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Register student & parent</p>
                </div>
              </Link>

              <Link href="/receptionist-dashboard/students" className="flex items-center gap-4 p-5 bg-teal-50 border border-teal-100 rounded-2xl hover:bg-teal-100 hover:border-teal-200 transition-all group">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-teal-200 shadow-sm group-hover:scale-105 transition-transform">
                  <Search className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors">Find Student</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Search records & directory</p>
                </div>
              </Link>

              <Link href="/receptionist-dashboard/parents" className="flex items-center gap-4 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl hover:bg-indigo-100 hover:border-indigo-200 transition-all group">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-indigo-200 shadow-sm group-hover:scale-105 transition-transform">
                  <UsersRound className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Parents</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">View profiles & link children</p>
                </div>
              </Link>

              <Link href="/receptionist-dashboard/certificates" className="flex items-center gap-4 p-5 bg-amber-50 border border-amber-100 rounded-2xl hover:bg-amber-100 hover:border-amber-200 transition-all group">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-amber-200 shadow-sm group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 group-hover:text-amber-700 transition-colors">Certificates</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Generate Bonafide & Character</p>
                </div>
              </Link>

            </div>
          </div>

          {/* Students by Class (Right Sidebar on large screens) */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-display font-bold text-slate-800 text-xl">Active Enrollment</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">Student count by Class</p>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white">
              {stats?.studentsByClass && stats.studentsByClass.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {stats.studentsByClass
                    .sort((a, b) => sortClasses(a._id, b._id))
                    .map((item) => (
                    <div key={item._id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-teal-50 hover:border-teal-100 transition-colors group">
                      <p className="text-2xl font-display font-bold text-teal-700 group-hover:scale-110 transition-transform">{item.count}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 group-hover:text-teal-600 transition-colors">Class {item._id}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                   <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                     <GraduationCap className="w-6 h-6 text-slate-400" />
                   </div>
                   <p className="text-sm font-bold text-slate-600">No Data Available</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </ReceptionistLayout>
  )
}