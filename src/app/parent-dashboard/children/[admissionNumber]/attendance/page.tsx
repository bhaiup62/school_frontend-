'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ParentLayout from '@/components/parent/ParentLayout'
import { getChildAttendance } from '@/services/parentService'
import { CalendarCheck, CalendarX, Calendar, ChevronLeft, CalendarDays, RefreshCw } from 'lucide-react'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function ChildAttendancePage() {
  const { admissionNumber } = useParams() as { admissionNumber: string }
  const [data, setData]           = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<any>(null)

  const loadData = useCallback(() => {
    if (!admissionNumber) return
    setLoading(true)
    getChildAttendance(admissionNumber)
      .then(res => {
        setData(res.data)
        if (res.data?.attendance?.length) setSelectedMonth(res.data.attendance[0])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [admissionNumber])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading && !data) return (
    <ParentLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    </ParentLayout>
  )

  const pct      = data?.summary?.overallPercentage || 0
  const isGood   = pct >= 75;
  const pctColor = isGood ? 'text-emerald-600' : 'text-rose-600'
  const barColor = isGood ? 'bg-emerald-500' : 'bg-rose-500'

  return (
    <ParentLayout>
      <div className="space-y-6 max-w-6xl mx-auto">

        {/* Header & Nav with Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link href={`/parent-dashboard/children/${admissionNumber}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 transition-colors w-fit">
            <ChevronLeft className="w-4 h-4" /> Back to Profile
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm font-bold text-slate-800">
                <span className="text-slate-400 font-medium mr-2">Student:</span> 
                {data?.student?.name} <span className="text-slate-300 mx-2">|</span> Class {data?.student?.class}-{data?.student?.section}
              </p>
            </div>
            <button 
              onClick={loadData}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 rounded-xl transition-all shadow-sm shrink-0"
              title="Refresh Attendance"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Top Summary Block */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Progress Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Overall Attendance</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Total academic session presence</p>
              </div>
              <span className={`text-5xl font-display font-bold tracking-tight ${pctColor}`}>{pct}%</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden mt-2">
              <div className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
            </div>
            {!isGood && (
              <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-3">
                <CalendarX className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700 font-medium">Warning: Attendance has fallen below the 75% requirement. Please ensure regular attendance to avoid academic penalties.</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-rows-3 gap-3">
             <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600"><CalendarDays className="w-5 h-5" /></div>
                  <span className="font-bold text-slate-600 text-sm uppercase tracking-wider">Total Days</span>
                </div>
                <span className="text-2xl font-bold text-slate-800">{data?.summary?.totalDays || 0}</span>
             </div>
             <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600"><CalendarCheck className="w-5 h-5" /></div>
                  <span className="font-bold text-emerald-800 text-sm uppercase tracking-wider">Present</span>
                </div>
                <span className="text-2xl font-bold text-emerald-700">{data?.summary?.presentDays || 0}</span>
             </div>
             <div className="bg-rose-50/50 rounded-2xl border border-rose-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600"><CalendarX className="w-5 h-5" /></div>
                  <span className="font-bold text-rose-800 text-sm uppercase tracking-wider">Absent</span>
                </div>
                <span className="text-2xl font-bold text-rose-700">{data?.summary?.absentDays || 0}</span>
             </div>
          </div>
        </div>

        {/* Monthly breakdown */}
        {!data?.attendance?.length ? (
           <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
             <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-slate-700 mb-1">No Records Found</h3>
             <p className="text-slate-500 font-medium">Daily attendance records have not been published yet.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Month Selector */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-600" /> Monthly History
              </h3>
              <div className="space-y-3">
                {data.attendance.map((m: any, i: number) => (
                  <button key={i} onClick={() => setSelectedMonth(m)}
                    className={`w-full text-left rounded-2xl border p-4 transition-all duration-300 flex items-center justify-between ${
                      selectedMonth?.month === m.month && selectedMonth?.year === m.year
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm'
                    }`}>
                    <div>
                      <div className={`font-bold text-base ${selectedMonth?.month === m.month ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {MONTHS[m.month - 1]} {m.year}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                        {m.presentDays} / {m.totalDays} Days Present
                      </div>
                    </div>
                    <div className={`text-lg font-display font-bold ${selectedMonth?.month === m.month ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {m.percentage}%
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Daily Detail */}
            {selectedMonth && (
              <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-lg">
                    {MONTHS[selectedMonth.month - 1]} {selectedMonth.year} Log
                  </h3>
                </div>
                
                {selectedMonth.records?.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {selectedMonth.records.map((r: any, i: number) => {
                       const isPresent = r.status === 'present';
                       const isAbsent = r.status === 'absent';
                       const isLate = r.status === 'late';
                       
                       return (
                         <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                             isPresent ? 'bg-emerald-50 border-emerald-100' :
                             isAbsent  ? 'bg-rose-50 border-rose-100' :
                             isLate    ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-200'
                           }`}>
                             <div className="text-center leading-none">
                               <div className={`text-xs font-bold uppercase tracking-wider ${
                                 isPresent ? 'text-emerald-500' : isAbsent ? 'text-rose-500' : isLate ? 'text-amber-500' : 'text-slate-400'
                               }`}>{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                               <div className={`text-lg font-bold ${
                                 isPresent ? 'text-emerald-700' : isAbsent ? 'text-rose-700' : isLate ? 'text-amber-700' : 'text-slate-600'
                               }`}>{new Date(r.date).getDate()}</div>
                             </div>
                           </div>
                           
                           <div className="flex-1">
                             <p className="text-sm font-bold text-slate-800">{new Date(r.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                             {r.remarks && <p className="text-xs text-slate-500 mt-1 font-medium">{r.remarks}</p>}
                           </div>
                           
                           <span className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider border ${
                             isPresent ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                             isAbsent  ? 'bg-rose-100 text-rose-700 border-rose-200'    :
                             isLate    ? 'bg-amber-100 text-amber-700 border-amber-200' :
                             'bg-slate-100 text-slate-600 border-slate-200'
                           }`}>
                             {r.status}
                           </span>
                         </div>
                       )
                    })}
                  </div>
                ) : (
                  <div className="p-16 text-center text-slate-400">
                    <CalendarX className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="font-semibold">No daily records for this month.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ParentLayout>
  )
}