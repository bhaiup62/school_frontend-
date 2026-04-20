// src/app/principal-dashboard/results/page.tsx

'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ClipboardList, Award, AlertTriangle, TrendingUp, Users, RefreshCw, Filter, CheckCircle } from 'lucide-react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import * as principalService from '@/services/principalService'

const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const SECTIONS = ['A', 'B', 'C', 'D', 'E']
const EXAM_TYPES = ['quarterly', 'half_yearly', 'annual']

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600" />
      <ClipboardList className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  </div>
)

// Tab Button Component
function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
        active
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

// Summary Card Component
function SummaryCard({ label, value, color, icon: Icon }: { label: string; value: string | number; color: string; icon?: React.ElementType }) {
  const colors: Record<string, string> = {
    green: 'from-green-500 to-emerald-500 shadow-green-500/25',
    red: 'from-red-500 to-rose-500 shadow-red-500/25',
    indigo: 'from-indigo-500 to-purple-500 shadow-indigo-500/25',
    purple: 'from-purple-500 to-pink-500 shadow-purple-500/25',
    amber: 'from-amber-500 to-orange-500 shadow-amber-500/25',
  }
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg`}>
          {Icon ? <Icon className="w-6 h-6 text-white" /> : <TrendingUp className="w-6 h-6 text-white" />}
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-800">{value}</div>
          <div className="text-sm text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  )
}

// No Data Component
function NoData() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16 text-slate-400">
      <ClipboardList className="w-16 h-16 mx-auto mb-3 opacity-40" />
      <p className="text-lg font-medium">No data available</p>
      <p className="text-sm mt-1">Try adjusting your filters</p>
    </div>
  )
}

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState<'analysis' | 'toppers' | 'failed' | 'classwise'>('analysis')
  const [examType, setExamType] = useState('half_yearly')
  const [loading, setLoading] = useState(true)
  
  const [analysis, setAnalysis] = useState<any>(null)
  const [toppers, setToppers] = useState<any>(null)
  const [failedStudents, setFailedStudents] = useState<any>(null)
  const [classResults, setClassResults] = useState<principalService.ClassResults | null>(null)
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')

  useEffect(() => {
    if (activeTab === 'analysis') {
      fetchAnalysis()
    } else if (activeTab === 'toppers') {
      fetchToppers()
    } else if (activeTab === 'failed') {
      fetchFailedStudents()
    }
  }, [activeTab, examType])

  useEffect(() => {
    if (activeTab === 'classwise' && selectedClass && selectedSection) {
      fetchClassResults()
    }
  }, [selectedClass, selectedSection, activeTab, examType])

  const fetchAnalysis = async () => {
    setLoading(true)
    try {
      const res = await principalService.getResultAnalysis({ examType })
      if (res.success) setAnalysis(res.data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchToppers = async () => {
    setLoading(true)
    try {
      const res = await principalService.getAllToppers({ examType, topN: 5 })
      if (res.success) setToppers(res.data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchFailedStudents = async () => {
    setLoading(true)
    try {
      const res = await principalService.getFailedStudents({ examType })
      if (res.success) setFailedStudents(res.data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchClassResults = async () => {
    setLoading(true)
    try {
      const res = await principalService.getClassResults(selectedClass, selectedSection, { examType })
      if (res.success) setClassResults(res.data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
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
                <ClipboardList className="w-7 h-7" />
                Results Management
              </h2>
              <p className="text-indigo-100 mt-1">View exam results and performance analysis</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (activeTab === 'analysis') fetchAnalysis()
                  else if (activeTab === 'toppers') fetchToppers()
                  else if (activeTab === 'failed') fetchFailedStudents()
                }}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex flex-wrap gap-2">
          <TabButton active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} icon={TrendingUp} label="Analysis" />
          <TabButton active={activeTab === 'toppers'} onClick={() => setActiveTab('toppers')} icon={Award} label="Toppers" />
          <TabButton active={activeTab === 'failed'} onClick={() => setActiveTab('failed')} icon={AlertTriangle} label="Failed Students" />
          <TabButton active={activeTab === 'classwise'} onClick={() => setActiveTab('classwise')} icon={Users} label="Class-wise" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-slate-600">
              <Filter className="w-5 h-5" />
              <span className="font-medium text-sm">Exam Type:</span>
            </div>
            <select
              value={examType}
              onChange={e => setExamType(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              {EXAM_TYPES.map(t => (
                <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          loading ? <LoadingSpinner /> : analysis ? (
            <div className="space-y-6">
              {/* School Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Total Examined" value={analysis.schoolSummary.totalExamined} color="indigo" icon={Users} />
                <SummaryCard label="Total Passed" value={analysis.schoolSummary.totalPassed} color="green" icon={CheckCircle} />
                <SummaryCard label="Total Failed" value={analysis.schoolSummary.totalFailed} color="red" icon={AlertTriangle} />
                <SummaryCard label="Pass Percentage" value={`${analysis.schoolSummary.passPercentage}%`} color="purple" icon={TrendingUp} />
              </div>

              {/* By Class */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    Results by Class
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-white">Class</th>
                        <th className="text-center px-4 py-3 font-semibold text-white">Total</th>
                        <th className="text-center px-4 py-3 font-semibold text-white">Passed</th>
                        <th className="text-center px-4 py-3 font-semibold text-white">Failed</th>
                        <th className="text-center px-4 py-3 font-semibold text-white">Pass %</th>
                        <th className="text-center px-4 py-3 font-semibold text-white">Avg %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analysis.byClass.map((c: any) => (
                        <tr key={c.class} className="hover:bg-indigo-50/30 transition">
                          <td className="px-4 py-3 font-semibold text-slate-800">Class {c.class}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{c.totalStudents}</td>
                          <td className="px-4 py-3 text-center text-green-600 font-semibold">{c.passCount}</td>
                          <td className="px-4 py-3 text-center text-red-600 font-semibold">{c.failCount}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    c.passPercentage >= 90 ? 'bg-green-500' :
                                    c.passPercentage >= 70 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${c.passPercentage}%` }}
                                />
                              </div>
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                                c.passPercentage >= 90 ? 'bg-green-100 text-green-700' :
                                c.passPercentage >= 70 ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {c.passPercentage}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-indigo-600">{c.avgPercentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : <NoData />
        )}

        {/* Toppers Tab */}
        {activeTab === 'toppers' && (
          loading ? <LoadingSpinner /> : toppers ? (
            <div className="space-y-6">
              {/* School Toppers */}
              {toppers.schoolToppers && toppers.schoolToppers.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                  </div>
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2 relative">
                    <Award className="w-6 h-6" />
                    🏆 School Toppers
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4 relative">
                    {toppers.schoolToppers.slice(0, 3).map((t: any, idx: number) => (
                      <div key={t.admissionNumber} className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-lg ${
                            idx === 0 ? 'bg-amber-400 text-amber-900' :
                            idx === 1 ? 'bg-slate-300 text-slate-700' :
                            'bg-orange-400 text-orange-900'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-lg">{t.name}</span>
                            <div className="text-sm text-white/80">Class {t.class}-{t.section}</div>
                          </div>
                        </div>
                        <div className="text-3xl font-bold">{t.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Class-wise Toppers */}
              {toppers.classWise && toppers.classWise.map((c: any) => (
                <div key={c.class} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      Class {c.class} Toppers
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {c.toppers.map((t: any, idx: number) => (
                        <Link key={t.admissionNumber} href={`/principal-dashboard/students/${t.admissionNumber}`}
                          className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                            idx === 0 ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50' :
                            idx === 1 ? 'border-slate-300 bg-gradient-to-br from-slate-50 to-gray-50' :
                            idx === 2 ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-rose-50' :
                            'border-slate-200 bg-white hover:border-indigo-300'
                          }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shadow ${
                              idx === 0 ? 'bg-amber-500 text-white' :
                              idx === 1 ? 'bg-slate-400 text-white' :
                              idx === 2 ? 'bg-orange-400 text-white' :
                              'bg-slate-200 text-slate-600'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="text-sm font-semibold text-slate-800 truncate">{t.name}</span>
                          </div>
                          <div className="text-xs text-slate-500">Section {t.section}</div>
                          <div className="text-xl font-bold text-indigo-600 mt-2">{t.percentage}%</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <NoData />
        )}

        {/* Failed Students Tab */}
        {activeTab === 'failed' && (
          loading ? <LoadingSpinner /> : failedStudents ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-rose-500 px-5 py-4 text-white">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Failed Students ({failedStudents.count} students)
                </h3>
              </div>
              {failedStudents.students.length === 0 ? (
                <div className="text-center py-16 text-green-600">
                  <Award className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No failed students!</p>
                  <p className="text-sm text-green-500 mt-1">All students have passed</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Student</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Class</th>
                        <th className="text-center px-4 py-3 font-semibold text-slate-600">Marks</th>
                        <th className="text-center px-4 py-3 font-semibold text-slate-600">%</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {failedStudents.students.map((s: any) => (
                        <tr key={s.admissionNumber} className="hover:bg-red-50/30 transition">
                          <td className="px-4 py-3">
                            <Link href={`/principal-dashboard/students/${s.admissionNumber}`} className="hover:text-indigo-600">
                              <div className="font-semibold text-slate-800">{s.name}</div>
                              <div className="text-xs text-slate-400">{s.admissionNumber}</div>
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-medium">{s.class}-{s.section}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{s.totalObtained}/{s.totalMarks}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700">
                              {s.percentage}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{s.phone || s.parentPhone || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : <NoData />
        )}

        {/* Class-wise Tab */}
        {activeTab === 'classwise' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-slate-600">
                  <Filter className="w-5 h-5" />
                  <span className="font-medium text-sm">Select:</span>
                </div>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                >
                  <option value="">Select Class</option>
                  {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <select
                  value={selectedSection}
                  onChange={e => setSelectedSection(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                >
                  <option value="">Select Section</option>
                  {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>
              </div>
            </div>

            {!selectedClass || !selectedSection ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16 text-slate-400">
                <Users className="w-16 h-16 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">Select class and section</p>
                <p className="text-sm mt-1">Choose a class and section to view results</p>
              </div>
            ) : loading ? (
              <LoadingSpinner />
            ) : classResults ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    Class {classResults.class}-{classResults.section} Results
                  </h3>
                </div>
                
                {/* Summary */}
                <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Total</span>
                        <p className="font-bold text-slate-800">{classResults.summary.totalStudents}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Passed</span>
                        <p className="font-bold text-green-600">{classResults.summary.passCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/25">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Failed</span>
                        <p className="font-bold text-red-600">{classResults.summary.failCount}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-white">Roll</th>
                        <th className="text-left px-4 py-3 font-semibold text-white">Student</th>
                        <th className="text-center px-4 py-3 font-semibold text-white">Marks</th>
                        <th className="text-center px-4 py-3 font-semibold text-white">%</th>
                        <th className="text-center px-4 py-3 font-semibold text-white">Rank</th>
                        <th className="text-center px-4 py-3 font-semibold text-white">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {classResults.students.map(s => (
                        <tr key={s.admissionNumber} className="hover:bg-indigo-50/30 transition">
                          <td className="px-4 py-3 text-slate-600 font-medium">{s.rollNumber}</td>
                          <td className="px-4 py-3">
                            <Link href={`/principal-dashboard/students/${s.admissionNumber}`} className="hover:text-indigo-600">
                              <div className="font-semibold text-slate-800">{s.name}</div>
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600">
                            {s.result ? `${s.result.totalObtained}/${s.result.totalMarks}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-indigo-600">
                            {s.result?.percentage || '-'}%
                          </td>
                          <td className="px-4 py-3 text-center">
                            {s.result?.rank && (
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                s.result.rank <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                #{s.result.rank}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {s.result && (
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                s.result.result === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {s.result.result.toUpperCase()}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : <NoData />
            }
          </div>
        )}
      </div>
    </PrincipalLayout>
  )
}
