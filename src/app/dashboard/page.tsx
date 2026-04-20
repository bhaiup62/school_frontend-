'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getProfile, getAttendance, getNotices, getTimetable } from '@/services/studentService'
import { 
  GraduationCap, CalendarCheck, Bell, Clock, User,
  ChevronRight, Sparkles, BookOpen, AlertCircle, RefreshCw 
} from 'lucide-react'

export default function StudentDashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [attendanceStat, setAttendanceStat] = useState<number | null>(null)
  const [notices, setNotices] = useState<any[]>([])
  const [todaySchedule, setTodaySchedule] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch everything concurrently for speed
      const [profileRes, attRes, noticeRes, timeRes] = await Promise.all([
        getProfile().catch(() => ({ data: null })),
        getAttendance().catch(() => ({ data: { summary: { overallPercentage: 0 } } })),
        getNotices().catch(() => ({ data: [] })),
        getTimetable().catch(() => ({ data: [] }))
      ])

      setProfile(profileRes.data)
      setAttendanceStat(attRes.data?.summary?.overallPercentage || 0)
      
      // Get top 3 recent notices
      setNotices(noticeRes.data?.slice(0, 3) || [])

      // Extract Today's Timetable
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const todayString = days[new Date().getDay()]
      
      const timetableData = timeRes.data || []
      const todayData = timetableData.find((d: any) => d.day === todayString)
      
      // If today is Sunday or no schedule, it will be empty
      setTodaySchedule(todayData ? todayData.periods : [])

    } catch (err) {
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  if (loading && !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-navy-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    )
  }

  // Get current date formatted
  const todayDateFormatted = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  })

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {/* ── Hero Welcome Banner ── */}
        <div className="bg-gradient-to-r from-navy-800 to-navy-950 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <Sparkles className="absolute bottom-6 right-10 w-24 h-24 text-gold-400/10 rotate-12 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                <GraduationCap className="w-10 h-10 text-gold-400" />
              </div>
              <div>
                <p className="text-navy-200 text-sm font-bold uppercase tracking-wider mb-1">{todayDateFormatted}</p>
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
                  Welcome back, {profile?.firstName}!
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="px-3 py-1 bg-gold-500 text-navy-950 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                    Class {profile?.currentClass}-{profile?.currentSection}
                  </span>
                  <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-xs font-bold text-navy-50 uppercase tracking-wider shadow-sm">
                    Roll No: {profile?.rollNumber}
                  </span>
                </div>
              </div>
            </div>
            
             <button 
              onClick={loadDashboardData} 
              className="p-3.5 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all text-slate-900 font-bold border border-amber-400 shadow-lg flex items-center justify-center shrink-0 w-fit md:mt-0 mt-4 z-20"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* ── Left Column: Stats & Notices ── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Stats */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Attendance Stat */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all duration-300">
                <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <CalendarCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className={`text-3xl font-display font-bold ${
                    (attendanceStat || 0) >= 75 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {attendanceStat}%
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Overall Attendance</p>
                </div>
              </div>

              {/* Assignments / Status Stat */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all duration-300">
                <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-slate-800">Active</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Academic Status</p>
                </div>
              </div>
            </div>

            {/* Recent Notices */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-display font-bold text-slate-800 text-xl flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" /> Recent Announcements
                </h3>
                <Link href="/dashboard/notices" className="text-xs font-bold text-navy-600 hover:text-navy-800 uppercase tracking-wider flex items-center gap-1 bg-navy-50 px-3 py-1.5 rounded-lg transition-colors">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              
              <div className="p-6">
                {notices.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500">No new announcements right now.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notices.map((notice) => (
                      <Link key={notice._id} href="/dashboard/notices" className="block group">
                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-navy-50 hover:border-navy-100 transition-all">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h4 className="font-bold text-slate-800 group-hover:text-navy-700 transition-colors line-clamp-1">{notice.title}</h4>
                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">
                              {new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-500 line-clamp-2">{notice.content}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
          </div>

          {/* ── Right Column: Today's Timetable ── */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-navy-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <h3 className="font-display font-bold text-xl flex items-center gap-2 relative z-10">
                <Clock className="w-5 h-5 text-gold-400" /> Today's Classes
              </h3>
              <p className="text-xs font-medium text-navy-200 mt-1 relative z-10">Your schedule for {todayDateFormatted.split(',')[0]}</p>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
              {todaySchedule.length === 0 ? (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-inner">
                     <Clock className="w-8 h-8 text-slate-400" />
                   </div>
                   <p className="text-base font-bold text-slate-700">No Classes Today!</p>
                   <p className="text-sm font-medium text-slate-500 mt-1">Enjoy your day off or use this time to study.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-4">
                  {todaySchedule.map((period: any, idx: number) => {
                    // Check if the subject is a string (fallback array) or an object (DB Timetable)
                    const isFallback = typeof period === 'string';
                    const subject = isFallback ? period : period.subject;
                    const isBreak = isFallback ? period === '—' : period.isBreak;
                    const periodNum = isFallback ? idx + 1 : period.periodNumber;

                    if (isBreak || subject === '—') {
                      return (
                        <div key={idx} className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-amber-400 rounded-full -left-[7px] top-2 ring-4 ring-white"></div>
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 shadow-sm">
                            <p className="text-sm font-bold text-amber-700 uppercase tracking-widest text-center">Recess / Break</p>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={idx} className="relative pl-6 group">
                        <div className="absolute w-3 h-3 bg-navy-400 rounded-full -left-[7px] top-3 ring-4 ring-white group-hover:bg-gold-500 transition-colors"></div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group-hover:border-navy-200 group-hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Period {periodNum}</p>
                            {!isFallback && period.startTime && (
                              <p className="text-[10px] font-bold text-navy-600 bg-navy-50 px-2 py-0.5 rounded-md">{period.startTime} - {period.endTime}</p>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-800 text-base">{subject}</h4>
                          {!isFallback && period.teacher && (
                            <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                              <User className="w-3 h-3" /> {period.teacher}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}