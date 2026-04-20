'use client'
import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getResults } from '@/services/studentService'
import { 
  Award, BookOpen, Calendar, Filter, RefreshCw, 
  CheckCircle, AlertTriangle, ChevronDown, ChevronUp, GraduationCap
} from 'lucide-react'

const EXAM_TYPES = [
  { value: 'unit_test', label: 'Unit Test' },
  { value: 'half_yearly', label: 'Half Yearly' },
  { value: 'pre_board', label: 'Pre-Board' },
  { value: 'annual', label: 'Annual Examination' },
]

const SESSIONS = ['2024-25', '2025-26']

export default function StudentResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [studentInfo, setStudentInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedExam, setExpandedMonth] = useState<string | null>(null)
  
  // Filters
  const [filterExam, setFilterExam] = useState('')
  const [filterSession, setFilterSession] = useState(SESSIONS[1]) // Default to latest

  const loadResults = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filterExam) params.examType = filterExam
      if (filterSession) params.session = filterSession
      
      const res = await getResults(params)
      // Extract data safely
      const data = res.data || res
      setResults(data.results || [])
      setStudentInfo(data.student)
      
      // Auto-expand the first result if available
      if (data.results && data.results.length > 0) {
        setExpandedMonth(data.results[0]._id)
      }
    } catch (err) {
      console.error('Failed to load results:', err)
    } finally {
      setLoading(false)
    }
  }, [filterExam, filterSession])

  useEffect(() => {
    loadResults()
  }, [loadResults])

  const toggleExam = (id: string) => {
    setExpandedMonth(expandedExam === id ? null : id)
  }

  if (loading && !studentInfo) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-navy-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {/* ── Hero Banner ── */}
        <div className="bg-gradient-to-r from-navy-800 to-navy-950 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                <Award className="w-10 h-10 text-gold-400" />
              </div>
              <div>
                <p className="text-navy-200 text-sm font-bold uppercase tracking-wider mb-1">Academic Performance</p>
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
                  Examination Results
                </h2>
                {studentInfo && (
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="px-3 py-1 bg-gold-500 text-navy-950 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">
                      Class {studentInfo.class}-{studentInfo.section}
                    </span>
                    <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-xs font-bold text-navy-50 uppercase tracking-wider shadow-sm">
                      Session {studentInfo.session}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <button 
  onClick={loadResults} 
  className="p-3.5 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all text-slate-900 font-bold border border-amber-400 shadow-lg flex items-center justify-center shrink-0 w-fit md:mt-0 mt-4 z-20"
  title="Refresh"
>
  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
</button>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Filter className="w-5 h-5 text-navy-600" /> Filter Exams
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              value={filterExam} 
              onChange={(e) => setFilterExam(e.target.value)}
              className="flex-1 sm:w-48 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-navy-500 outline-none cursor-pointer"
            >
              <option value="">All Exam Types</option>
              {EXAM_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
            <select 
              value={filterSession} 
              onChange={(e) => setFilterSession(e.target.value)}
              className="flex-1 sm:w-32 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-navy-500 outline-none cursor-pointer"
            >
              <option value="">All Sessions</option>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* ── Results List ── */}
        <div className="space-y-6">
          {results.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
              <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-1">No Results Published</h3>
              <p className="text-slate-500 font-medium">There are no exam results matching your current filters.</p>
            </div>
          ) : (
            results.map((exam) => {
              const isExpanded = expandedExam === exam._id
              const isPass = exam.result.toLowerCase() === 'pass'
              
              return (
                <div key={exam._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                  
                  {/* Exam Header (Clickable) */}
                  <div 
                    onClick={() => toggleExam(exam._id)}
                    className="p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isPass ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'
                      }`}>
                        {isPass ? <CheckCircle className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-slate-800 text-2xl">{exam.examName}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> 
                            {exam.declaredOn ? new Date(exam.declaredOn).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                          </span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded-md">
                            {exam.examType.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0">
                      <div className="flex gap-6 text-center">
                        <div>
                          <p className="text-xl font-display font-bold text-slate-800">{exam.totalObtained} <span className="text-sm text-slate-400">/ {exam.totalMarks}</span></p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total Score</p>
                        </div>
                        <div className="w-px h-10 bg-slate-200"></div>
                        <div>
                          <p className={`text-xl font-display font-bold ${isPass ? 'text-emerald-600' : 'text-rose-600'}`}>{exam.percentage.toFixed(1)}%</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Percentage</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Report Card */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-6 sm:p-8 animate-in slide-in-from-top-4 duration-300">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Subject</th>
                              <th className="text-center py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Max Marks</th>
                              <th className="text-center py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Obtained</th>
                              <th className="text-center py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Grade</th>
                              <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Remarks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {exam.subjects.map((sub: any, idx: number) => {
                              const pct = (sub.marksObtained / sub.maxMarks) * 100;
                              const isLow = pct < 40; // Assuming < 40% is poor
                              
                              return (
                                <tr key={idx} className="hover:bg-white transition-colors">
                                  <td className="py-4 px-4 font-bold text-slate-800">{sub.subject}</td>
                                  <td className="py-4 px-4 text-center font-semibold text-slate-500">{sub.maxMarks}</td>
                                  <td className="py-4 px-4 text-center">
                                    <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                                      {sub.marksObtained}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                                      sub.grade === 'A+' || sub.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                                      sub.grade === 'B+' || sub.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                      sub.grade === 'C' || sub.grade === 'D' ? 'bg-amber-100 text-amber-700' :
                                      'bg-rose-100 text-rose-700'
                                    }`}>
                                      {sub.grade || '-'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-slate-600 font-medium italic">{sub.remarks || '-'}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {exam.rank && (
                        <div className="mt-6 bg-gold-500/10 border border-gold-500/20 rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <GraduationCap className="w-5 h-5 text-gold-600" />
                            <span className="font-bold text-navy-900">Class Rank Achieved</span>
                          </div>
                          <span className="text-xl font-display font-bold text-gold-600">#{exam.rank}</span>
                        </div>
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