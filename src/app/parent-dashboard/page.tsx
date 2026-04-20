'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import ParentLayout from '@/components/parent/ParentLayout'
import { getParentProfile, getChildren } from '@/services/parentService'
import { useSSE, AttendanceUpdateEvent, ResultUpdateEvent, NoticePostedEvent, RemarkUpdateEvent } from '@/services/sseService'
import { Users, BookOpen, CalendarCheck, Bell, ChevronRight, User, CalendarDays, Wifi, WifiOff, RefreshCw, GraduationCap, Clock, Sparkles } from 'lucide-react'

export default function ParentDashboardPage() {
  const [parent, setParent]     = useState<any>(null)
  const [children, setChildren] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [sseConnected, setSseConnected] = useState(false)
  const [liveUpdate, setLiveUpdate] = useState<string | null>(null)

  // SSE event handlers
  const handleAttendanceUpdate = useCallback((data: AttendanceUpdateEvent) => {
    const childName = children.find(c => c.admissionNumber === data.admissionNumber)?.firstName || 'Your child'
    setLiveUpdate(`${childName}'s attendance updated: ${data.status} on ${data.date}`)
    setTimeout(() => setLiveUpdate(null), 6000)
  }, [children])

  const handleResultUpdate = useCallback((data: ResultUpdateEvent) => {
    const childName = children.find(c => c.admissionNumber === data.admissionNumber)?.firstName || 'Your child'
    setLiveUpdate(`${childName}'s new result: ${data.examName} - ${data.percentage}%`)
    setTimeout(() => setLiveUpdate(null), 6000)
  }, [children])

  const handleNoticePosted = useCallback((data: NoticePostedEvent) => {
    setLiveUpdate(`New school notice: ${data.title}`)
    setTimeout(() => setLiveUpdate(null), 6000)
  }, [])

  const handleRemarkUpdate = useCallback((data: RemarkUpdateEvent) => {
    const childName = children.find(c => c.admissionNumber === data.admissionNumber)?.firstName || 'Your child'
    setLiveUpdate(`New remark for ${childName} from ${data.addedBy}`)
    setTimeout(() => setLiveUpdate(null), 6000)
  }, [children])

  // Connect to SSE after loading
  useSSE({
    onAttendanceUpdate: handleAttendanceUpdate,
    onResultUpdate: handleResultUpdate,
    onNoticePosted: handleNoticePosted,
    onRemarkUpdate: handleRemarkUpdate,
    onConnected: () => setSseConnected(true),
    onError: () => setSseConnected(false),
  }, !loading)

  const loadData = useCallback(() => {
    setLoading(true)
    Promise.all([getParentProfile(), getChildren()])
      .then(([parentRes, childrenRes]) => {
        setParent(parentRes.data)
        setChildren(childrenRes.data || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading && !parent) return (
    <ParentLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    </ParentLayout>
  )

  return (
    <ParentLayout>
      <div className="space-y-6 max-w-6xl mx-auto">

        {/* Live update toast */}
        {liveUpdate && (
          <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300">
            <span className="flex h-3 w-3 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span className="text-sm font-bold tracking-wide">{liveUpdate}</span>
          </div>
        )}

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <Sparkles className="absolute bottom-4 right-8 w-24 h-24 text-white/5 rotate-12" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-emerald-200 text-sm font-bold uppercase tracking-wider">Welcome Back</p>
                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${sseConnected ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30' : 'bg-red-500/20 text-red-100 border-red-400/30'}`}>
                  {sseConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {sseConnected ? 'Live Connection' : 'Offline'}
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
                {parent ? `${parent.firstName} ${parent.lastName}` : 'Parent Portal'}
              </h2>
              <p className="text-emerald-100 font-medium mt-2 flex items-center gap-2">
                {parent?.relation && <span className="capitalize bg-white/10 px-2 py-0.5 rounded-md">{parent.relation}</span>}
                Managing {children.length} {children.length === 1 ? 'Child' : 'Children'}
              </p>
            </div>
            
            <button 
              onClick={loadData} 
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white border border-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 w-fit shadow-sm"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Quick Links Bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users,        label: 'My Children',   value: children.length, color: 'text-emerald-600 bg-emerald-50', hover: 'hover:border-emerald-200', href: '/parent-dashboard/children' },
            { icon: Bell,         label: 'Notice Board',  value: 'Updates',       color: 'text-blue-600 bg-blue-50',       hover: 'hover:border-blue-200',    href: '/parent-dashboard/notices' },
            { icon: CalendarDays, label: 'School Events', value: 'Calendar',      color: 'text-amber-600 bg-amber-50',     hover: 'hover:border-amber-200',   href: '/parent-dashboard/events' },
            { icon: User,         label: 'My Profile',    value: 'Settings',      color: 'text-purple-600 bg-purple-50',   hover: 'hover:border-purple-200',  href: '/parent-dashboard/profile' },
          ].map(({ icon: Icon, label, value, color, hover, href }) => (
            <Link key={label} href={href} className={`bg-white rounded-3xl border border-slate-200 p-6 transition-all duration-300 shadow-sm hover:shadow-md group ${hover}`}>
              <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-display font-bold text-slate-800">{value}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">{label}</div>
            </Link>
          ))}
        </div>

        {/* Children Command Center */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-5 px-1">
            <h3 className="font-display font-bold text-slate-800 text-xl flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-emerald-600" /> Enrolled Children
            </h3>
            <Link href="/parent-dashboard/children" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {children.length === 0 && !loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
              <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">No Children Linked</h3>
              <p className="text-slate-500 font-medium">Please contact the school administration to link your children to this account.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {children.map((child: any) => (
                <div key={child.admissionNumber} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">

                  {/* Child ID Header */}
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-start gap-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-200 shadow-inner">
                      <User className="w-8 h-8 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h4 className="font-display font-bold text-slate-800 text-xl truncate">
                        {child.firstName} {child.lastName}
                      </h4>
                      <p className="text-slate-500 font-medium text-sm mt-0.5 truncate">
                        Class {child.class}-{child.section} <span className="mx-1 text-slate-300">|</span> Roll: {child.rollNumber}
                      </p>
                      <p className="text-emerald-600 font-bold text-xs mt-1.5 uppercase tracking-wider">{child.admissionNumber}</p>
                    </div>
                  </div>

                  {/* Child Specific Actions */}
                  <div className="p-5 bg-white grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                    {[
                      { label: 'Profile',    icon: User,          href: `/parent-dashboard/children/${child.admissionNumber}`,            color: 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300' },
                      { label: 'Results',    icon: BookOpen,      href: `/parent-dashboard/children/${child.admissionNumber}/results`,    color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300' },
                      { label: 'Attendance', icon: CalendarCheck, href: `/parent-dashboard/children/${child.admissionNumber}/attendance`, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300' },
                      { label: 'Timetable',  icon: Clock,         href: `/parent-dashboard/children/${child.admissionNumber}/timetable`,  color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300' },
                    ].map(({ label, icon: Icon, href, color }) => (
                      <Link key={label} href={href} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border border-transparent transition-all duration-300 ${color}`}>
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-bold">{label}</span>
                      </Link>
                    ))}
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </ParentLayout>
  )
}