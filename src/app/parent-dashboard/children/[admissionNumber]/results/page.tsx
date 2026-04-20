'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ParentLayout from '@/components/parent/ParentLayout'
import { getChildResults } from '@/services/parentService'
import { BookOpen, TrendingUp, Award, ChevronLeft, Target, RefreshCw } from 'lucide-react'

const gradeColor: Record<string, string> = {
  'A+': 'text-emerald-700 bg-emerald-100 border-emerald-200',
  'A':  'text-blue-700 bg-blue-100 border-blue-200',
  'B+': 'text-indigo-700 bg-indigo-100 border-indigo-200',
  'B':  'text-purple-700 bg-purple-100 border-purple-200',
  'C':  'text-amber-700 bg-amber-100 border-amber-200',
  'D':  'text-rose-700 bg-rose-100 border-rose-200',
}

export default function ChildResultsPage() {
  const { admissionNumber } = useParams() as { admissionNumber: string }
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  const loadData = useCallback(() => {
    if (!admissionNumber) return
    setLoading(true)
    getChildResults(admissionNumber)
      .then(res => {
        setData(res.data)
        if (res.data?.results?.length) setSelected(res.data.results[0])
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
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    </ParentLayout>
  )

  return (
    <ParentLayout>
      <div className="space-y-6 max-w-6xl mx-auto">

        {/* Header & Nav with Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link href={`/parent-dashboard/children/${admissionNumber}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 transition-colors w-fit">
            <ChevronLeft className="w-4 h-4" /> Back to Profile
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center">
              <p className="text-sm font-bold text-slate-800">
                <span className="text-slate-400 font-medium mr-2">Student:</span> 
                {data?.student?.name} <span className="text-slate-300 mx-2">|</span> Class {data?.student?.class}-{data?.student?.section}
              </p>
            </div>
            <button 
              onClick={loadData}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all shadow-sm shrink-0"
              title="Refresh Results"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {!data?.results?.length ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-1">No Results Published</h3>
            <p className="text-slate-500 font-medium">Exam results will appear here once declared by the teachers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Sidebar: Exam List */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> All Examinations
              </h3>
              <div className="space-y-3">
                {data.results.map((result: any, i: number) => (
                  <button key={i} onClick={() => setSelected(result)}
                    className={`w-full text-left rounded-2xl border p-5 transition-all duration-300 ${
                      selected?._id === result._id 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md ring-1 ring-blue-500/20' 
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className={`font-bold text-lg ${selected?._id === result._id ? 'text-blue-900' : 'text-slate-800'}`}>{result.examName}</div>
                        <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-1">{result.examType?.replace('_', ' ')} • {result.session}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border ${result.result === 'pass' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                        {result.result}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/60">
                      <span className="text-sm font-semibold text-slate-600">Score</span>
                      <span className={`font-display font-bold text-xl ${selected?._id === result._id ? 'text-blue-700' : 'text-slate-700'}`}>{result.percentage}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side: Detail View */}
            {selected && (
              <div className="lg:col-span-8 space-y-6">
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-5 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100"><TrendingUp className="w-7 h-7" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Score</p>
                      <p className="text-3xl font-display font-bold text-slate-800">{selected.percentage}%</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-5 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100"><Award className="w-7 h-7" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Rank</p>
                      <p className="text-3xl font-display font-bold text-slate-800">{selected.rank ? `#${selected.rank}` : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-5 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100"><Target className="w-7 h-7" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Marks</p>
                      <p className="text-3xl font-display font-bold text-slate-800">{selected.totalObtained}<span className="text-lg text-slate-400">/{selected.totalMarks}</span></p>
                    </div>
                  </div>
                </div>

                {/* Marks Table */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Subject Breakdown</h3>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Declared: {selected.declaredOn ? new Date(selected.declaredOn).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-white text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <th className="text-left font-bold px-6 py-4">Subject</th>
                          <th className="text-center font-bold px-4 py-4">Max Marks</th>
                          <th className="text-center font-bold px-4 py-4">Obtained</th>
                          <th className="text-center font-bold px-4 py-4">Grade</th>
                          <th className="text-right font-bold px-6 py-4">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selected.subjects?.map((s: any, i: number) => {
                          const pct = Math.round((s.marksObtained / s.maxMarks) * 100);
                          return (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 text-sm font-bold text-slate-800">{s.subject}</td>
                              <td className="text-center px-4 py-4 text-sm font-medium text-slate-500">{s.maxMarks}</td>
                              <td className="text-center px-4 py-4 text-sm font-bold text-slate-800">{s.marksObtained}</td>
                              <td className="text-center px-4 py-4">
                                <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${gradeColor[s.grade] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                  {s.grade || '—'}
                                </span>
                              </td>
                              <td className="text-right px-6 py-4 text-sm font-bold text-slate-600">
                                {pct}%
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ParentLayout>
  )
}