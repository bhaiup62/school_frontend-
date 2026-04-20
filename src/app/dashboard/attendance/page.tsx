'use client'
import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getAttendance } from '@/services/studentService'
import { 
  CalendarCheck, TrendingUp, CheckCircle, XCircle, 
  Calendar, Filter, AlertTriangle, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react'

const MONTHS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
  { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
  { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
]

export default function StudentAttendancePage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [months, setMonths] = useState<any[]>([])
  
  // Filters
  const currentYear = new Date().getFullYear().toString()
  const [filterYear, setFilterYear] = useState(currentYear)
  const [filterMonth, setFilterMonth] = useState('')
  
  // UI State
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)

  const loadAttendance = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filterYear) params.year = filterYear
      if (filterMonth) params.month = filterMonth
      
      const res = await getAttendance(params)
      // Standardize response extraction based on the service
      const data = res.data || res
      setSummary(data.summary)
      setMonths(data.attendance || [])
    } catch (err) {
      console.error('Failed to load attendance:', err)
    } finally {
      setLoading(false)
    }
  }, [filterYear, filterMonth])

  useEffect(() => {
    loadAttendance()
  }, [loadAttendance])

  const toggleMonth = (id: string) => {
    setExpandedMonth(expandedMonth === id ? null : id)
  }

  const getMonthName = (monthNum: number) => {
    return MONTHS.find(m => m.value === monthNum.toString())?.label || 'Unknown'
  }

  if (loading && !summary) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-navy-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    )
  }

  const isGoodAttendance = (summary?.overallPercentage || 0) >= 75

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {/* ── Hero Summary Banner ── */}
        <div className={`rounded-3xl p-8 text-white shadow-lg overflow-hidden relative flex flex-col md:flex-row items-center justify-between gap-8 ${isGoodAttendance ? 'bg-gradient-to-r from-emerald-700 to-teal-800' : 'bg-gradient-to-r from-rose-700 to-red-800'}`}>
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <button 
  onClick={loadAttendance} 
  className="p-3.5 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all text-slate-900 font-bold border border-amber-400 shadow-lg flex items-center justify-center shrink-0 w-fit md:mt-0 mt-4 z-20"
  title="Refresh"
>
  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
</button>

          <div className="flex items-center gap-6 relative z-10 w-full">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/30 shadow-inner shrink-0">
              <span className="text-3xl font-display font-bold">{summary?.overallPercentage || 0}%</span>
            </div>
            <div>
              <p className="text-white/80 text-sm font-bold uppercase tracking-wider mb-1">Academic Session 2025-26</p>
              <h2 className="text-3xl font-display font-bold tracking-tight">Overall Attendance</h2>
              <div className="flex items-center gap-2 mt-2">
                {isGoodAttendance ? (
                  <span className="px-3 py-1 bg-white/20 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <CheckCircle className="w-4 h-4" /> Good Standing
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-black/20 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm text-rose-100 border border-rose-500/30">
                    <AlertTriangle className="w-4 h-4" /> Warning: Below 75%
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto relative z-10">
             <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex-1 md:flex-none min-w-[100px] text-center">
                <p className="text-2xl font-bold">{summary?.totalDays || 0}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-1">Total Days</p>
             </div>
             <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex-1 md:flex-none min-w-[100px] text-center">
                <p className="text-2xl font-bold">{summary?.presentDays || 0}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-1">Present</p>
             </div>
             <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex-1 md:flex-none min-w-[100px] text-center">
                <p className="text-2xl font-bold">{summary?.absentDays || 0}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-1">Absent</p>
             </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Filter className="w-5 h-5 text-navy-600" /> Filter Records
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(e.target.value)}
              className="flex-1 sm:w-40 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-navy-500 outline-none cursor-pointer"
            >
              <option value="">All Months</option>
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select 
              value={filterYear} 
              onChange={(e) => setFilterYear(e.target.value)}
              className="flex-1 sm:w-32 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-navy-500 outline-none cursor-pointer"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>

        {/* ── Monthly Breakdown ── */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-slate-800 text-xl px-2">Month-by-Month Breakdown</h3>
          
          {months.length === 0 ? (
             <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
               <CalendarCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-slate-700 mb-1">No Records Found</h3>
               <p className="text-slate-500 font-medium">No attendance data is available for the selected timeframe.</p>
             </div>
          ) : (
            months.map((monthData) => {
              const monthId = `${monthData.year}-${monthData.month}`
              const isExpanded = expandedMonth === monthId
              const monthPct = monthData.percentage || 0
              
              return (
                <div key={monthId} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                  {/* Month Header (Clickable) */}
                  <div 
                    onClick={() => toggleMonth(monthId)}
                    className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${monthPct >= 75 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                        {monthPct}%
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-slate-800 text-xl">{getMonthName(monthData.month)} {monthData.year}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{monthData.totalDays} Total Working Days</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex gap-4 text-center">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{monthData.presentDays}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Present</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{monthData.absentDays}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absent</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Daily Records */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-in slide-in-from-top-4 duration-300">
                      {monthData.records && monthData.records.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                          {monthData.records
                            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((record: any, idx: number) => {
                              const day = new Date(record.date).getDate()
                              const status = record.status.toLowerCase()
                              const isPresent = status === 'present'
                              const isLate = status === 'late'
                              const isHoliday = status === 'holiday'
                              
                              return (
                                <div key={idx} title={record.remarks || status} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${
                                  isPresent ? 'bg-emerald-50 border-emerald-100' : 
                                  isLate ? 'bg-amber-50 border-amber-100' :
                                  isHoliday ? 'bg-slate-100 border-slate-200' :
                                  'bg-rose-50 border-rose-100'
                                }`}>
                                  <span className="text-lg font-bold text-slate-700">{day}</span>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${
                                    isPresent ? 'text-emerald-600' : 
                                    isLate ? 'text-amber-600' :
                                    isHoliday ? 'text-slate-500' :
                                    'text-rose-600'
                                  }`}>
                                    {status.substring(0, 3)}
                                  </span>
                                </div>
                              )
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-sm font-medium text-slate-500 py-4">Daily breakdown not available for this month.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}