'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import ParentLayout from '@/components/parent/ParentLayout'
import { getChildren } from '@/services/parentService'
import { User, BookOpen, CalendarCheck, Clock, ChevronRight, RefreshCw } from 'lucide-react'

export default function ChildrenPage() {
  const [children, setChildren] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  const loadData = useCallback(() => {
    setLoading(true)
    getChildren()
      .then(res => setChildren(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading && children.length === 0) return (
    <ParentLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    </ParentLayout>
  )

  return (
    <ParentLayout>
      <div className="space-y-6 max-w-6xl mx-auto">

        {/* Hero Header with Refresh Button */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">My Children</h1>
              <p className="text-emerald-100 font-medium">
                You have {children.length} {children.length === 1 ? 'child' : 'children'} linked to your account
              </p>
            </div>
            <button 
              onClick={loadData} 
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white border border-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 w-fit"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {children.length === 0 && !loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-1">No Children Linked</h3>
            <p className="text-slate-500">Please contact the school administration to link your children to this account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {children.map((child: any) => (
              <div key={child.admissionNumber} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                
                {/* Profile Header */}
                <div className="p-6 border-b border-slate-100 flex items-start gap-5 bg-slate-50/50">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-200 shadow-inner">
                    <User className="w-8 h-8 text-emerald-700" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-display font-bold text-slate-800 text-xl tracking-tight group-hover:text-emerald-700 transition-colors">
                      {child.firstName} {child.lastName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg shadow-sm">
                        Class {child.class}-{child.section}
                      </span>
                      <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg shadow-sm">
                        Roll: {child.rollNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-medium ml-1">ID: {child.admissionNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Module Links - Bento Box Style */}
                <div className="p-6 grid grid-cols-2 gap-3">
                  <Link href={`/parent-dashboard/children/${child.admissionNumber}`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group/link">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover/link:bg-white group-hover/link:shadow-sm transition-all text-slate-600"><User className="w-5 h-5" /></div>
                    <div><p className="text-sm font-bold text-slate-700">Profile</p><p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Details</p></div>
                  </Link>

                  <Link href={`/parent-dashboard/children/${child.admissionNumber}/results`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group/link">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover/link:bg-white group-hover/link:shadow-sm transition-all text-blue-600"><BookOpen className="w-5 h-5" /></div>
                    <div><p className="text-sm font-bold text-slate-700 group-hover/link:text-blue-700">Results</p><p className="text-[10px] font-medium text-blue-400 uppercase tracking-wider">Report Cards</p></div>
                  </Link>

                  <Link href={`/parent-dashboard/children/${child.admissionNumber}/attendance`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all group/link">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover/link:bg-white group-hover/link:shadow-sm transition-all text-emerald-600"><CalendarCheck className="w-5 h-5" /></div>
                    <div><p className="text-sm font-bold text-slate-700 group-hover/link:text-emerald-700">Attendance</p><p className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Daily Records</p></div>
                  </Link>

                  <Link href={`/parent-dashboard/children/${child.admissionNumber}/timetable`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-all group/link">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center group-hover/link:bg-white group-hover/link:shadow-sm transition-all text-amber-600"><Clock className="w-5 h-5" /></div>
                    <div><p className="text-sm font-bold text-slate-700 group-hover/link:text-amber-700">Timetable</p><p className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">Schedule</p></div>
                  </Link>
                </div>

                {/* View Full Dashboard Button */}
                <div className="px-6 pb-6 pt-2">
                   <Link href={`/parent-dashboard/children/${child.admissionNumber}`} className="w-full py-3 bg-slate-50 hover:bg-emerald-600 text-slate-600 hover:text-white rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300">
                     View Full Dashboard <ChevronRight className="w-4 h-4" />
                   </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ParentLayout>
  )
}