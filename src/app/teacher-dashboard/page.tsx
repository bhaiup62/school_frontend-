// src/app/teacher-dashboard/page.tsx

'use client'
import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import TeacherLayout from '@/components/teacher/TeacherLayout'
import { getProfile, getStudents } from '@/services/teacherService'
import type { TeacherProfile, Student } from '@/services/teacherService'
import { useSSE, NoticePostedEvent } from '@/services/sseService'
import { Users, CalendarCheck, TrendingUp, Bell, ChevronRight, BookOpen, Award, Clock, Wifi, WifiOff, FileText, Megaphone } from 'lucide-react'

export default function TeacherDashboardPage() {
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [sseConnected, setSseConnected] = useState(false)
  const [liveUpdate, setLiveUpdate] = useState<string | null>(null)

  // SSE event handlers - teachers might see notices from other teachers
  const handleNoticePosted = useCallback((data: NoticePostedEvent) => {
    if (data.postedBy !== teacher?.fullName) {
      setLiveUpdate(`New notice from ${data.postedBy}: ${data.title}`)
      setTimeout(() => setLiveUpdate(null), 5000)
    }
  }, [teacher])

  // Connect to SSE after loading
  useSSE({
    onNoticePosted: handleNoticePosted,
    onConnected: () => setSseConnected(true),
    onError: () => setSseConnected(false),
  }, !loading)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await getProfile()
        setTeacher(profileRes.data)
        
        // Safely extract class info using new schema fallback
        const targetClassInfo = (profileRes.data as any)?.currentClassTeacherOf || profileRes.data?.classTeacherOf
        const targetAssigned = (profileRes.data as any)?.currentAssignedClasses?.[0] || profileRes.data?.assignedClasses?.[0]
        
        // Use class teacher info first, otherwise fallback to the first assigned subject class
        let targetClass = targetClassInfo?.class
        let targetSection = targetClassInfo?.section

        if (!targetClass && targetAssigned) {
           const [cls, sec] = targetAssigned.split('-')
           targetClass = cls
           targetSection = sec || undefined
        }
        
        if (targetClass) {
          try {
            const studentsRes = await getStudents({ 
              class: targetClass, 
              section: targetSection 
            })
            setStudents(studentsRes.data || [])
          } catch (studentErr) {
            console.error('Error fetching students:', studentErr)
            setStudents([])
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600" />
          </div>
        </div>
      </TeacherLayout>
    )
  }

  // Safe data extraction for UI rendering
  const assignedClasses = (teacher as any)?.currentAssignedClasses || teacher?.assignedClasses || []
  const classTeacherInfo = (teacher as any)?.currentClassTeacherOf || teacher?.classTeacherOf
  const isClassTeacher = teacher?.isClassTeacher && !!classTeacherInfo

  return (
    <TeacherLayout>
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Live update toast */}
        {liveUpdate && (
          <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-pulse border border-white/20 backdrop-blur-md">
            <Wifi className="w-5 h-5" />
            <span className="text-sm font-semibold">{liveUpdate}</span>
          </div>
        )}

        {/* Welcome Banner (Hero) */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg border border-purple-600/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-900/30 rounded-full -translate-x-1/3 translate-y-1/3 blur-2xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-200 text-sm font-bold uppercase tracking-wider">Teacher Portal</span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span className="text-purple-200 text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
                Welcome back, {teacher?.firstName || 'Teacher'}! 👋
              </h2>
              <p className="text-purple-100 text-base md:text-lg opacity-90 max-w-2xl">
                {teacher?.subjects?.join(' • ') || 'No subjects assigned'}
              </p>
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 flex items-center gap-4 shadow-sm">
                <div className="text-right">
                  <p className="text-[10px] text-purple-200 uppercase font-bold tracking-wider">Teacher ID</p>
                  <p className="font-bold text-white tracking-wide">{teacher?.teacherId}</p>
                </div>
              </div>
              
              {/* SSE Connection Status */}
              <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold ${sseConnected ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-100 border border-rose-500/30'}`}>
                {sseConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span>{sseConnected ? 'System Live' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard href="/teacher-dashboard/students" icon={BookOpen} label="Assigned Classes" value={assignedClasses.length} color="purple" />
          <StatCard href="/teacher-dashboard/students" icon={Users} label="Total Students" value={students.length} color="blue" />
          <StatCard href="/teacher-dashboard/attendance" icon={CalendarCheck} label="Attendance" value="Mark" color="green" />
          <StatCard href="/teacher-dashboard/results" icon={TrendingUp} label="Results" value="Enter" color="orange" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main Content Area (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Class Teacher Special Section */}
            {isClassTeacher && classTeacherInfo && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-5 border-b border-amber-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-100 rounded-xl shadow-sm border border-amber-200">
                        <Award className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">Class Teacher Duties</h3>
                        <p className="text-sm font-medium text-slate-500">Managing Class {classTeacherInfo.class}-{classTeacherInfo.section}</p>
                      </div>
                    </div>
                    <Link href={`/teacher-dashboard/students?class=${classTeacherInfo.class}&section=${classTeacherInfo.section}`}
                      className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-white text-amber-700 text-sm font-bold rounded-xl border border-amber-200 shadow-sm hover:bg-amber-50 transition-colors">
                      View My Class <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ActionCard href="/teacher-dashboard/attendance/mark" icon={CalendarCheck} title="Attendance" desc="Record daily presence" color="green" />
                    <ActionCard href="/teacher-dashboard/remarks" icon={FileText} title="Remarks" desc="Add student notes" color="blue" />
                    <ActionCard href="/teacher-dashboard/notices" icon={Megaphone} title="Notices" desc="Broadcast to class" color="purple" />
                  </div>
                  <Link href={`/teacher-dashboard/students?class=${classTeacherInfo.class}&section=${classTeacherInfo.section}`}
                    className="mt-4 sm:hidden flex items-center justify-center gap-1.5 w-full px-4 py-3 bg-amber-50 text-amber-700 text-sm font-bold rounded-xl border border-amber-200 shadow-sm hover:bg-amber-100 transition-colors">
                    View My Class <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Assigned Subject Classes Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-display font-bold text-slate-800 text-xl">Your Subject Classes</h3>
                </div>
                <Link href="/teacher-dashboard/students" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {assignedClasses.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {assignedClasses.map((clsStr: string, idx: number) => {
                    // Smart detection: checks if the string is "10" or "10-A"
                    const [cls, sec] = clsStr.split('-')
                    const href = sec ? `/teacher-dashboard/students?class=${cls}&section=${sec}` : `/teacher-dashboard/students?class=${cls}`
                    
                    return (
                      <Link key={idx} href={href}
                        className="group bg-slate-50 rounded-2xl border border-slate-100 p-5 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-center flex flex-col items-center justify-center gap-2">
                        <div className="h-12 px-4 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:border-indigo-300 group-hover:shadow-md transition-all whitespace-nowrap">
                          <span className="text-xl font-display font-bold text-slate-700 group-hover:text-indigo-600">
                            {sec ? `${cls} - ${sec}` : `Class ${cls}`}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-indigo-500">
                          {sec ? 'Specific Section' : 'Entire Class'}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl border border-slate-100 border-dashed p-10 text-center">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No subjects assigned yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-display font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                Quick Actions
              </h3>
              <div className="flex flex-col gap-3">
                <SidebarLink href="/teacher-dashboard/attendance/mark" icon={CalendarCheck} label="Mark Daily Attendance" color="green" />
                <SidebarLink href="/teacher-dashboard/results/enter" icon={TrendingUp} label="Enter Exam Results" color="blue" />
                <SidebarLink href="/teacher-dashboard/notices" icon={Bell} label="Post School Notice" color="orange" />
                <SidebarLink href="/teacher-dashboard/profile" icon={Users} label="Update My Profile" color="purple" />
              </div>
            </div>

            {/* Time / Info Panel */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-sm p-6 text-white border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-slate-400" />
                <h3 className="font-semibold text-slate-200">Current Session</h3>
              </div>
              <div className="text-3xl font-display font-bold text-white mb-1">2025-2026</div>
              <p className="text-sm text-slate-400 font-medium">Term 1 is currently active.</p>
            </div>
          </div>
        </div>

      </div>
    </TeacherLayout>
  )
}

// Sub-components for cleaner code

function StatCard({ href, icon: Icon, label, value, color }: { href: string; icon: React.ElementType; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100 hover:border-purple-200',
    blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-200',
    green: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-200',
    orange: 'text-orange-600 bg-orange-50 hover:bg-orange-100 hover:border-orange-200',
  }
  
  return (
    <Link href={href} className={`group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-3xl font-display font-bold text-slate-800 group-hover:text-slate-900">{value}</div>
      <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{label}</div>
    </Link>
  )
}

function ActionCard({ href, icon: Icon, title, desc, color }: { href: string; icon: React.ElementType; title: string; desc: string; color: string }) {
  const iconColors: Record<string, string> = {
    green: 'text-emerald-600 bg-emerald-100',
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
  }
  return (
    <Link href={href} className="block p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all group">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 shadow-sm ${iconColors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="font-bold text-slate-800 text-sm mb-1">{title}</h4>
      <p className="text-xs font-medium text-slate-500 leading-tight">{desc}</p>
    </Link>
  )
}

function SidebarLink({ href, icon: Icon, label, color }: { href: string; icon: React.ElementType; label: string; color: string }) {
  const bgColors: Record<string, string> = {
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
    blue: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white',
    orange: 'bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-500 group-hover:text-white',
    purple: 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white',
  }

  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-transparent hover:shadow-md transition-all group bg-slate-50 hover:bg-white">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors border ${bgColors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-bold text-slate-700 text-sm group-hover:text-slate-900">{label}</span>
      <ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-slate-400 transition-transform group-hover:translate-x-1" />
    </Link>
  )
}