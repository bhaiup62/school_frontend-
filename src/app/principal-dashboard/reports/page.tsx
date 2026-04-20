// src/app/principal-dashboard/reports/page.tsx

'use client'
import { useState } from 'react'
import { FileText, Download, Users, GraduationCap, CalendarCheck, ClipboardList, BarChart3, RefreshCw, Filter } from 'lucide-react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import * as principalService from '@/services/principalService'

const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const SECTIONS = ['A', 'B', 'C', 'D', 'E']
const REPORT_TYPES = [
  { id: 'students', label: 'Students Report', icon: GraduationCap, description: 'Export student data with filters', color: 'from-indigo-500 to-purple-500' },
  { id: 'teachers', label: 'Teachers Report', icon: Users, description: 'Export teacher data with class assignments', color: 'from-blue-500 to-cyan-500' },
  { id: 'attendance', label: 'Attendance Report', icon: CalendarCheck, description: 'Monthly attendance summary', color: 'from-green-500 to-emerald-500' },
  { id: 'results', label: 'Results Report', icon: ClipboardList, description: 'Exam results and analysis', color: 'from-amber-500 to-orange-500' },
]

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600" />
      <BarChart3 className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  </div>
)

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    examType: 'half_yearly'
  })

  const generateReport = async () => {
    if (!selectedReport) return
    setLoading(true)
    setReportData(null)
    setRecords([])
    try {
      let res
      switch (selectedReport) {
        case 'students':
          res = await principalService.getStudentReport(filters)
          if (res?.success) {
            setReportData(res.data)
            setRecords(res.data.students || [])
          }
          break
        case 'teachers':
          res = await principalService.getTeacherReport()
          if (res?.success) {
            setReportData(res.data)
            setRecords(res.data.teachers || [])
          }
          break
        case 'attendance':
          res = await principalService.getAttendanceReport(filters)
          if (res?.success) {
            setReportData(res.data)
            setRecords(res.data.students || [])
          }
          break
        case 'results':
          res = await principalService.getResultsReport(filters)
          if (res?.success) {
            setReportData(res.data)
            setRecords(res.data.students || [])
          }
          break
      }
    } catch (err) {
      console.error('Error generating report:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!records || records.length === 0) return

    const headers = Object.keys(records[0])
    const csvContent = [
      headers.join(','),
      ...records.map((row: any) => headers.map(h => `"${row[h] ?? ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedReport}-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getReportTitle = () => {
    switch (selectedReport) {
      case 'students': return 'Students Report'
      case 'teachers': return 'Teachers Report'
      case 'attendance': return `Attendance Report - ${new Date(filters.year, filters.month - 1).toLocaleDateString('en', { month: 'long', year: 'numeric' })}`
      case 'results': return `Results Report - ${filters.examType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`
      default: return 'Report'
    }
  }

  return (
    <PrincipalLayout>
      <div className="space-y-6">
        {/* Header - Gradient Style */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <BarChart3 className="w-7 h-7" />
                Reports
              </h2>
              <p className="text-indigo-100 mt-1">Generate and export school reports</p>
            </div>
            {selectedReport && (
              <button
                onClick={generateReport}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REPORT_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => { setSelectedReport(type.id); setReportData(null); setRecords([]) }}
              className={`p-5 rounded-2xl border-2 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                selectedReport === type.id
                  ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 shadow-lg`}>
                <type.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-800">{type.label}</h3>
              <p className="text-xs text-slate-500 mt-1">{type.description}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        {selectedReport && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-500" />
                Filters
              </h3>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-4 items-end">
                {(selectedReport === 'students' || selectedReport === 'attendance' || selectedReport === 'results') && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Class</label>
                      <select
                        value={filters.class}
                        onChange={e => setFilters(f => ({ ...f, class: e.target.value }))}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      >
                        <option value="">All Classes</option>
                        {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Section</label>
                      <select
                        value={filters.section}
                        onChange={e => setFilters(f => ({ ...f, section: e.target.value }))}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      >
                        <option value="">All Sections</option>
                        {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {selectedReport === 'attendance' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Month</label>
                      <select
                        value={filters.month}
                        onChange={e => setFilters(f => ({ ...f, month: parseInt(e.target.value) }))}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(2000, i).toLocaleString('en', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Year</label>
                      <input
                        type="number"
                        value={filters.year}
                        onChange={e => setFilters(f => ({ ...f, year: parseInt(e.target.value) }))}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm w-24 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      />
                    </div>
                  </>
                )}

                {selectedReport === 'results' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Exam Type</label>
                    <select
                      value={filters.examType}
                      onChange={e => setFilters(f => ({ ...f, examType: e.target.value }))}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    >
                      <option value="quarterly">Quarterly</option>
                      <option value="half_yearly">Half Yearly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                )}

                <button
                  onClick={generateReport}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition text-sm font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                >
                  <BarChart3 className="w-4 h-4" />
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingSpinner />}

        {/* Report Results */}
        {reportData && !loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  {getReportTitle()}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {reportData.totalCount || records.length} records found
                  {reportData.generatedAt && ` • Generated: ${new Date(reportData.generatedAt).toLocaleString()}`}
                </p>
              </div>
              {records.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition text-sm font-semibold shadow-lg shadow-green-500/25"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              )}
            </div>

            {/* Summary Cards */}
            {reportData.summary && (
              <div className="p-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-b border-slate-200">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(reportData.summary).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">{key.replace(/([A-Z])/g, ' $1')}</div>
                      <div className="text-xl font-bold text-indigo-600 mt-1">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Table */}
            {records.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                    <tr>
                      {Object.keys(records[0]).map(key => (
                        <th key={key} className="text-left px-4 py-3 font-semibold text-white capitalize whitespace-nowrap">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.slice(0, 100).map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-indigo-50/30 transition">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            {String(value ?? '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {records.length > 100 && (
                  <div className="px-5 py-4 text-sm text-slate-500 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Showing first 100 of {records.length} records. Export CSV to see all.
                  </div>
                )}
              </div>
            )}

            {records.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <FileText className="w-16 h-16 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">No records found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PrincipalLayout>
  )
}
