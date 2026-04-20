'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import ReceptionistLayout from '@/components/receptionist/ReceptionistLayout'
import { getAllStudents } from '@/services/receptionistService'
import type { Student } from '@/services/receptionistService'
import { Search, Filter, Eye, ChevronLeft, ChevronRight, Users, RefreshCw, UserPlus } from 'lucide-react'

const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const SECTIONS = ['A', 'B', 'C', 'D', 'E']

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ class: '', section: '', search: '' })
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 25

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, limit: perPage }
      if (filters.class) params.class = filters.class
      if (filters.section) params.section = filters.section
      if (filters.search) params.search = filters.search
      
      const res = await getAllStudents(params)
      setStudents(res.data || [])
      setTotal(res.pagination?.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, filters.class, filters.section, filters.search])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchStudents()
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <ReceptionistLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                <Users className="w-8 h-8" /> Student Directory
              </h1>
              <p className="text-teal-100 font-medium">
                Search, view, and manage enrolled students
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => fetchStudents()} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white border border-white/20 backdrop-blur-sm shadow-sm" title="Refresh">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {/* Registration Link mapped for later */}
              <Link href="/receptionist-dashboard/register" className="flex items-center gap-2 px-5 py-3 bg-white text-teal-700 rounded-xl hover:bg-teal-50 transition-colors font-bold shadow-sm">
                <UserPlus className="w-5 h-5" /> New Admission
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or father's name..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
            <select
              value={filters.class}
              onChange={(e) => { setFilters(f => ({ ...f, class: e.target.value })); setPage(1) }}
              className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer outline-none"
            >
              <option value="">All Classes</option>
              {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
            <select
              value={filters.section}
              onChange={(e) => { setFilters(f => ({ ...f, section: e.target.value })); setPage(1) }}
              className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer outline-none"
            >
              <option value="">All Sections</option>
              {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
            <button type="submit" className="bg-teal-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-teal-700 shadow-sm shadow-teal-500/20 transition-all flex items-center justify-center gap-2">
              <Filter className="w-4 h-4" /> Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-16 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : students.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-bold text-slate-600">No students found</p>
              <p className="text-sm font-medium mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">ID Number</th>
                      <th className="text-left px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Student Name</th>
                      <th className="text-center px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Class</th>
                      <th className="text-left px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Father's Name</th>
                      <th className="text-center px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                      <th className="text-center px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-teal-700">{s.admissionNumber}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {s.firstName} {s.lastName}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                            {s.class}-{s.section}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium capitalize">
                          {s.parents?.fatherName || '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${
                            s.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {s.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link href={`/receptionist-dashboard/students/${s.admissionNumber}`}
                            className="inline-flex items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-xl text-teal-600 hover:text-teal-700 hover:bg-teal-50 hover:border-teal-200 transition-all">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, total)} of {total}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="text-sm font-bold text-slate-600">Page {page} of {totalPages || 1}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ReceptionistLayout>
  )
}