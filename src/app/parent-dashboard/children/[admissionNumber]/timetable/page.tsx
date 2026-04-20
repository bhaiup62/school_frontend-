'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ParentLayout from '@/components/parent/ParentLayout'
import { getChildTimetable } from '@/services/parentService'
import { ChevronLeft, Clock, CalendarDays, RefreshCw } from 'lucide-react'

const subjectColors: Record<string, string> = {
  English:          'bg-blue-50 text-blue-700 border-blue-200',
  Mathematics:      'bg-purple-50 text-purple-700 border-purple-200',
  Science:          'bg-emerald-50 text-emerald-700 border-emerald-200',
  Hindi:            'bg-orange-50 text-orange-700 border-orange-200',
  'Social Studies': 'bg-amber-50 text-amber-700 border-amber-200',
  Computer:         'bg-cyan-50 text-cyan-700 border-cyan-200',
  Sports:           'bg-rose-50 text-rose-700 border-rose-200',
  Art:              'bg-pink-50 text-pink-700 border-pink-200',
  Library:          'bg-indigo-50 text-indigo-700 border-indigo-200',
  Music:            'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  Sanskrit:         'bg-violet-50 text-violet-700 border-violet-200',
  GK:               'bg-teal-50 text-teal-700 border-teal-200',
}

const PERIODS = [
  { p: 'P1', time: '8:00 AM' },
  { p: 'P2', time: '8:45 AM' },
  { p: 'P3', time: '9:30 AM' },
  { p: 'P4', time: '10:30 AM' },
  { p: 'P5', time: '11:15 AM' },
  { p: 'P6', time: '12:00 PM' },
  { p: 'P7', time: '12:45 PM' }
]

export default function ChildTimetablePage() {
  const { admissionNumber } = useParams() as { admissionNumber: string }
  const [timetable, setTimetable] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  const loadData = useCallback(() => {
    if (!admissionNumber) return
    setLoading(true)
    getChildTimetable(admissionNumber)
      .then(res => setTimetable(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [admissionNumber])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading && timetable.length === 0) return (
    <ParentLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    </ParentLayout>
  )

  const todaySchedule = timetable.find(t => t.day === today)

  return (
    <ParentLayout>
      <div className="space-y-6 max-w-6xl mx-auto">

        {/* Header & Nav with Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link href={`/parent-dashboard/children/${admissionNumber}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-amber-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 transition-colors w-fit">
            <ChevronLeft className="w-4 h-4" /> Back to Profile
          </Link>
          <button 
            onClick={loadData}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-200 rounded-xl transition-all shadow-sm shrink-0 w-fit"
            title="Refresh Timetable"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>

        {/* Today's Highlights */}
        {todaySchedule && (
          <div className="bg-gradient-to-r from-slate-800 to-navy-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">Today's Schedule</h2>
                <p className="text-sm font-medium text-slate-400">{today}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 relative z-10">
              {todaySchedule.periods.map((period: string, i: number) => (
                <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center hover:bg-white/20 transition-colors">
                  <div className="text-amber-400 text-xs font-bold mb-1 uppercase tracking-wider">Period {i + 1}</div>
                  <div className="text-white text-sm font-bold truncate px-1" title={period}>{period}</div>
                  <div className="text-slate-400 text-[10px] mt-1 font-medium">{PERIODS[i]?.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Weekly Table (Desktop) */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hidden md:block">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 flex items-center gap-3">
             <CalendarDays className="w-5 h-5 text-slate-500" />
             <h3 className="font-bold text-slate-800 text-lg">Weekly Timetable</h3>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-sm border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="text-left px-4 py-2 text-slate-400 font-bold text-xs uppercase tracking-wider w-32">Day</th>
                  {PERIODS.map((p, i) => (
                    <th key={i} className="text-center px-3 py-2">
                      <div className="text-slate-800 font-bold">{p.p}</div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{p.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetable.map((row: any, i: number) => (
                  <tr key={i} className={`${row.day === today ? 'bg-amber-50/50' : 'hover:bg-slate-50'} transition-colors`}>
                    <td className="px-4 py-4 rounded-l-2xl">
                      <div className={`font-bold text-sm flex items-center gap-2 ${row.day === today ? 'text-amber-700' : 'text-slate-700'}`}>
                        {row.day} {row.day === today && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                      </div>
                    </td>
                    {row.periods.map((subject: string, j: number) => {
                       const isLast = j === row.periods.length - 1;
                       return (
                        <td key={j} className={`text-center px-2 py-4 ${isLast ? 'rounded-r-2xl' : ''}`}>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border inline-block w-full max-w-[110px] truncate ${subjectColors[subject] || 'bg-slate-50 text-slate-600 border-slate-200'}`} title={subject}>
                            {subject}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View */}
        <div className="space-y-4 md:hidden">
           <div className="flex items-center gap-2 text-slate-800 font-bold text-lg px-2">
              <CalendarDays className="w-5 h-5 text-slate-500" /> Weekly Timetable
           </div>
          {timetable.map((row: any, i: number) => (
            <div key={i} className={`bg-white rounded-3xl border shadow-sm overflow-hidden ${row.day === today ? 'border-amber-300 ring-1 ring-amber-300/30' : 'border-slate-200'}`}>
              <div className={`px-5 py-3 text-sm font-bold flex justify-between items-center ${row.day === today ? 'bg-amber-50 text-amber-800 border-b border-amber-100' : 'bg-slate-50 text-slate-800 border-b border-slate-100'}`}>
                {row.day}
                {row.day === today && <span className="text-[10px] uppercase tracking-wider bg-amber-200 text-amber-800 px-2 py-0.5 rounded-md">Today</span>}
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                {row.periods.map((subject: string, j: number) => (
                  <div key={j} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 mb-0.5">PERIOD {j + 1}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{PERIODS[j]?.time}</div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border max-w-[90px] truncate text-center ${subjectColors[subject] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {subject}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </ParentLayout>
  )
}