// src/app/principal-dashboard/students/page.tsx

'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Filter, Users, Eye, TrendingDown, Award, RefreshCw, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import * as principalService from '@/services/principalService'

const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const SECTIONS = ['A', 'B', 'C', 'D', 'E']

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600" />
      <GraduationCap className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  </div>
)

// Tab Button Component (matching notices style)
function TabButton({ active, onClick, icon: Icon, label, badge }: {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          active ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'
        }`}>
          {badge}
        </span>
      )}
    </button>
  )
}

export default function StudentsPage() {
  const [students, setStudents] = useState<principalService.Student[]>([])
  const [filters, setFilters] = useState({ class: '', section: '', search: '', gender: '' })
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<principalService.Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'toppers' | 'lowAttendance'>('all')
  const [toppers, setToppers] = useState<any[]>([])
  const [lowAttendance, setLowAttendance] = useState<any[]>([])

  useEffect(() => {
    if (activeTab === 'all') {
      fetchStudents()
    } else if (activeTab === 'toppers') {
      fetchToppers()
    } else if (activeTab === 'lowAttendance') {
      fetchLowAttendance()
    }
  }, [page, filters, activeTab])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await principalService.getAllStudents({
        ...filters,
        page,
        limit: 20,
      })
      if (res.success) {
        setStudents(res.data)
        setPagination(res.pagination)
      }
    } catch (err) {
      console.error('Error fetching students:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchToppers = async () => {
    setLoading(true)
    try {
      const res = await principalService.getToppers({ limit: 5 })
      if (res.success) {
        setToppers(res.data)
      }
    } catch (err) {
      console.error('Error fetching toppers:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLowAttendance = async () => {
    setLoading(true)
    try {
      const res = await principalService.getLowAttendanceStudents({ threshold: 75 })
      if (res.success) {
        setLowAttendance(res.data.students)
      }
    } catch (err) {
      console.error('Error fetching low attendance:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    if (activeTab === 'all') fetchStudents()
    else if (activeTab === 'toppers') fetchToppers()
    else fetchLowAttendance()
  }

  return (
    <PrincipalLayout>
      <div className="space-y-6">
        {/* Header - Gradient Style */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <GraduationCap className="w-7 h-7" />
                Student Management
              </h2>
              <p className="text-indigo-100 mt-1">View and monitor all students across the school</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              {pagination && (
                <div className="px-4 py-2 bg-white/10 rounded-xl text-sm font-medium">
                  {pagination.total} Students
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs - Modern Style */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex flex-wrap gap-2">
          <TabButton 
            active={activeTab === 'all'} 
            onClick={() => { setActiveTab('all'); setPage(1) }} 
            icon={Users} 
            label="All Students"
            badge={pagination?.total}
          />
          <TabButton 
            active={activeTab === 'toppers'} 
            onClick={() => setActiveTab('toppers')} 
            icon={Award} 
            label="Class Toppers" 
          />
          <TabButton 
            active={activeTab === 'lowAttendance'} 
            onClick={() => setActiveTab('lowAttendance')} 
            icon={TrendingDown} 
            label="Low Attendance"
            badge={lowAttendance.length > 0 ? lowAttendance.length : undefined}
          />
        </div>

        {/* All Students Tab */}
        {activeTab === 'all' && (
          <>
            {/* Filters - Modern Style */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-slate-600">
                  <Filter className="w-5 h-5" />
                  <span className="font-medium text-sm">Filters:</span>
                </div>
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={filters.search}
                    onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1) }}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
                <select
                  value={filters.class}
                  onChange={e => { setFilters(f => ({ ...f, class: e.target.value })); setPage(1) }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                >
                  <option value="">All Classes</option>
                  {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <select
                  value={filters.section}
                  onChange={e => { setFilters(f => ({ ...f, section: e.target.value })); setPage(1) }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                >
                  <option value="">All Sections</option>
                  {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>
                <select
                  value={filters.gender}
                  onChange={e => { setFilters(f => ({ ...f, gender: e.target.value })); setPage(1) }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                >
                  <option value="">All Genders</option>
                  <option value="male">👦 Male</option>
                  <option value="female">👧 Female</option>
                </select>
              </div>
            </div>

            {/* Students Table - Modern Style */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {loading ? (
                <LoadingSpinner />
              ) : students.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <GraduationCap className="w-16 h-16 mx-auto mb-3 opacity-40" />
                  <p className="text-lg font-medium">No students found</p>
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Student</th>
                        <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Class</th>
                        <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Roll No</th>
                        <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Gender</th>
                        <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Father's Name</th>
                        <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Phone</th>
                        <th className="text-center px-4 py-3.5 font-semibold text-slate-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map(s => (
                        <tr key={s.admissionNumber} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                                s.gender === 'male' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-pink-500 to-purple-600'
                              }`}>
                                {s.firstName?.charAt(0)}{s.lastName?.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800">{s.firstName} {s.lastName}</div>
                                <div className="text-xs text-slate-400">{s.admissionNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
                              {s.currentClass}-{s.currentSection}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 font-medium">{s.rollNumber}</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              s.gender === 'male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                            }`}>
                              {s.gender === 'male' ? '👦 Male' : '👧 Female'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">{s.parents?.fatherName || '-'}</td>
                          <td className="px-4 py-3.5 text-slate-600">{s.phone || '-'}</td>
                          <td className="px-4 py-3.5 text-center">
                            <Link href={`/principal-dashboard/students/${s.admissionNumber}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-xs font-semibold hover:from-indigo-600 hover:to-purple-600 shadow-sm transition-all">
                              <Eye className="w-3.5 h-3.5" /> View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination - Modern Style */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-200 bg-slate-50">
                  <div className="text-sm text-slate-600">
                    Showing <span className="font-semibold text-slate-800">{(page - 1) * 20 + 1}</span> to <span className="font-semibold text-slate-800">{Math.min(page * 20, pagination.total)}</span> of <span className="font-semibold text-slate-800">{pagination.total}</span> students
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-3.5 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-white hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum = i + 1
                        if (pagination.pages > 5) {
                          if (page <= 3) pageNum = i + 1
                          else if (page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i
                          else pageNum = page - 2 + i
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                              page === pageNum
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      className="flex items-center gap-1 px-3.5 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-white hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Toppers Tab - Modern Style */}
        {activeTab === 'toppers' && (
          <div className="space-y-4">
            {loading ? (
              <LoadingSpinner />
            ) : toppers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16 text-slate-400">
                <Award className="w-16 h-16 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">No toppers data available</p>
                <p className="text-sm mt-1">Academic results will appear here</p>
              </div>
            ) : (
              toppers.map(classData => (
                <div key={classData.class} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-3 border-b border-amber-100">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      Class {classData.class} Toppers
                    </h3>
                  </div>
                  <div className="p-4 grid sm:grid-cols-3 gap-4">
                    {classData.toppers.map((topper: any, index: number) => (
                      <Link key={topper.admissionNumber} href={`/principal-dashboard/students/${topper.admissionNumber}`}
                        className={`relative p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                          index === 0 ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50' :
                          index === 1 ? 'border-slate-300 bg-gradient-to-br from-slate-50 to-gray-50' :
                          'border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50'
                        }`}>
                        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-slate-400 to-gray-500 text-white' :
                          'bg-gradient-to-br from-orange-400 to-amber-500 text-white'
                        }`}>
                          #{index + 1}
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-gradient-to-br from-amber-500 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-br from-slate-500 to-gray-600' :
                            'bg-gradient-to-br from-orange-500 to-amber-600'
                          }`}>
                            {topper.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{topper.name}</div>
                            <div className="text-xs text-slate-500">Section {topper.section}</div>
                          </div>
                        </div>
                        <div className={`text-2xl font-bold ${
                          index === 0 ? 'text-amber-600' :
                          index === 1 ? 'text-slate-600' :
                          'text-orange-600'
                        }`}>
                          {topper.percentage}%
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Academic Score</div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Low Attendance Tab - Modern Style */}
        {activeTab === 'lowAttendance' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-red-100 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Low Attendance Alert</h3>
                  <p className="text-sm text-red-600">Students with attendance below 75% threshold</p>
                </div>
              </div>
            </div>
            {loading ? (
              <LoadingSpinner />
            ) : lowAttendance.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <TrendingDown className="w-16 h-16 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium text-green-600">All students have good attendance! 🎉</p>
                <p className="text-sm mt-1 text-slate-400">No students below the 75% threshold</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Student</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Class</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Present/Total</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Attendance</th>
                      <th className="text-center px-4 py-3.5 font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lowAttendance.map((s: any) => (
                      <tr key={s.admissionNumber} className="hover:bg-red-50/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                              {s.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">{s.name}</div>
                              <div className="text-xs text-slate-400">{s.admissionNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
  {s.class}-{s.section}
</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-medium">{s.presentDays}/{s.totalDays} days</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  s.attendancePercentage < 50 ? 'bg-red-500' :
                                  s.attendancePercentage < 75 ? 'bg-amber-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${s.attendancePercentage}%` }}
                              />
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              s.attendancePercentage < 50 ? 'bg-red-100 text-red-700' :
                              s.attendancePercentage < 75 ? 'bg-amber-100 text-amber-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {s.attendancePercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <Link href={`/principal-dashboard/students/${s.admissionNumber}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-xs font-semibold hover:from-indigo-600 hover:to-purple-600 shadow-sm transition-all">
                            <Eye className="w-3.5 h-3.5" /> View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </PrincipalLayout>
  )
}
