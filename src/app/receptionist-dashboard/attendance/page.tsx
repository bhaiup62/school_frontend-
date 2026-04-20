'use client'
import { useEffect, useState, useCallback } from 'react'
import ReceptionistLayout from '@/components/receptionist/ReceptionistLayout'
import { getAttendance } from '@/services/receptionistService'
import type { AttendanceRecord } from '@/services/receptionistService'
import { CalendarCheck, AlertTriangle, Search, CheckCircle, XCircle, Users, RefreshCw, Filter } from 'lucide-react'

const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const SECTIONS = ['A', 'B', 'C', 'D', 'E']

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [filters, setFilters] = useState({ class: '', section: '', month: '', year: new Date().getFullYear().toString() })

  const fetchAttendance = useCallback(async () => {
    if (!filters.class || !filters.section) return
    setLoading(true)
    setSearched(true)
    try {
      const params: any = { class: filters.class, section: filters.section }
      if (filters.month) params.month = filters.month
      if (filters.year) params.year = filters.year
      
      const res = await getAttendance(params)
      // FIX: Service returns { success, data, total }, so records are directly in res.data
      setRecords(res.data || [])
    } catch (err) {
      console.error(err)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchAttendance()
  }

  const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
    { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
    { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ]

  return (
    <ReceptionistLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                <CalendarCheck className="w-8 h-8" /> Class Attendance
              </h1>
              <p className="text-teal-100 font-medium">
                View-only access to class-wise student attendance reports
              </p>
            </div>
            {searched && (
              <button onClick={fetchAttendance} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white border border-white/20 backdrop-blur-sm shadow-sm flex items-center justify-center shrink-0 w-fit">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Filters Bento Box */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Class <span className="text-rose-500">*</span></label>
              <select value={filters.class} onChange={e => setFilters(f => ({ ...f, class: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all outline-none cursor-pointer" required>
                <option value="">Select</option>
                {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            
            <div className="lg:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Section <span className="text-rose-500">*</span></label>
              <select value={filters.section} onChange={e => setFilters(f => ({ ...f, section: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all outline-none cursor-pointer" required>
                <option value="">Select</option>
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="lg:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Month</label>
              <select value={filters.month} onChange={e => setFilters(f => ({ ...f, month: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all outline-none cursor-pointer">
                <option value="">All Year</option>
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div className="lg:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Year</label>
              <input type="number" value={filters.year} onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all outline-none"
                placeholder="YYYY" min="2020" max="2030" />
            </div>

            <div className="lg:col-span-1 flex items-end">
              <button type="submit" disabled={!filters.class || !filters.section || loading}
                className="w-full bg-teal-600 text-white h-[46px] rounded-xl text-sm font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-teal-500/20 flex items-center justify-center gap-2">
                <Filter className="w-4 h-4" /> View Report
              </button>
            </div>
          </form>
        </div>

        {/* Results Container */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="animate-spin w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-500 font-bold mt-4">Generating Report...</p>
          </div>
        ) : !searched ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
            <Search className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-1">Select a Class & Section</h3>
            <p className="text-slate-500 font-medium">Use the filters above to generate the attendance report.</p>
          </div>
        ) : records.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Users className="w-5 h-5 text-teal-600" /> Class {filters.class}-{filters.section} Roster
               </h3>
               <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm">
                 {records.length} Students
               </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="text-center px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Roll No.</th>
                    <th className="text-left px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Student Name</th>
                    <th className="text-center px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Total Days</th>
                    <th className="text-center px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Present</th>
                    <th className="text-center px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Absent</th>
                    <th className="text-center px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Percentage</th>
                    <th className="text-center px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 text-center font-mono font-bold text-slate-400">{r.rollNumber}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {r.fullName}
                        <div className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5">{r.admissionNumber}</div>
                      </td>
                      <td className="px-4 py-4 text-center font-bold text-slate-600">{r.totalDays}</td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-bold min-w-[2rem]">
                          {r.presentDays}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-block bg-rose-50 text-rose-700 px-2 py-1 rounded-md font-bold min-w-[2rem]">
                          {r.absentDays}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-base font-display font-bold ${r.percentage >= 75 ? 'text-emerald-600' : r.percentage >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {r.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {r.lowAttendance ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
                            <AlertTriangle className="w-3.5 h-3.5" /> Warning
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
                            <CheckCircle className="w-3.5 h-3.5" /> Good
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
            <CalendarCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-1">No Records Found</h3>
            <p className="text-slate-500 font-medium">No attendance has been marked for this class/section in the selected timeframe.</p>
          </div>
        )}
      </div>
    </ReceptionistLayout>
  )
}