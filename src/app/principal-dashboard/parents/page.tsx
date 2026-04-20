'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import { getAllParents, getStudentDetail } from '@/services/principalService'
import type { Parent } from '@/services/principalService'
import { Search, Eye, ChevronLeft, ChevronRight, Users, X, Loader2, GraduationCap, Phone, Mail, Briefcase, RefreshCw} from 'lucide-react'

interface ChildInfo {
  admissionNumber: string
  firstName: string
  lastName: string
  currentClass: string
  currentSection: string
  rollNumber: string
}

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 25

  // Children modal state
  const [childrenModal, setChildrenModal] = useState<{ open: boolean; parentName: string; children: string[] }>({ open: false, parentName: '', children: [] })
  const [childrenDetails, setChildrenDetails] = useState<ChildInfo[]>([])
  const [loadingChildren, setLoadingChildren] = useState(false)

  const fetchParents = async () => {
    setLoading(true)
    try {
      const params: any = { page, limit: perPage }
      if (search) params.search = search
      const res = await getAllParents(params)
      setParents(res.data || [])
      setTotal(res.pagination?.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParents()
  }, [page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchParents()
  }

  // Fetch children details when modal opens
  const handleViewChildren = async (parentName: string, children: string[]) => {
    setChildrenModal({ open: true, parentName, children })
    setChildrenDetails([])
    setLoadingChildren(true)

    try {
      const details: ChildInfo[] = []
      for (const admNo of children) {
        try {
          const res = await getStudentDetail(admNo)
          if (res.data) {
            details.push({
              admissionNumber: res.data.admissionNumber,
              firstName: res.data.firstName,
              lastName: res.data.lastName,
              currentClass: res.data.currentClass,
              currentSection: res.data.currentSection,
              rollNumber: res.data.rollNumber,
            })
          }
        } catch {
          // Student not found, add placeholder
            details.push({
              admissionNumber: admNo,
              firstName: 'Unknown',
              lastName: '',
              currentClass: '-',
              currentSection: '-',
              rollNumber: '-',
            })
        }
      }
      setChildrenDetails(details)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingChildren(false)
    }
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <PrincipalLayout>
      <div className="space-y-6">
        {/* Header - Gradient Style */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Users className="w-7 h-7" />
                Parent Management
              </h2>
              <p className="text-indigo-100 mt-1">View and manage all registered parents</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchParents()}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="px-4 py-2 bg-white/10 rounded-xl text-sm font-medium">
                {total} Parents
              </div>
            </div>
          </div>
        </div>

        {/* Search - Modern Style */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-slate-600">
              <Search className="w-5 h-5" />
              <span className="font-medium text-sm">Search:</span>
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, parent ID, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
            <button type="submit" className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all">
              Search
            </button>
          </form>
        </div>

        {/* Table - Modern Style */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading? (
            <div className="flex items-center justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600" />
                <Users className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          ) : parents.length === 0? (
            <div className="text-center py-16 text-slate-400">
              <Users className="w-16 h-16 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No parents found</p>
              <p className="text-sm mt-1">Try adjusting your search</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Parent ID</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Name</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Relation</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Contact</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-slate-700">Children</th>
                      <th className="text-center px-4 py-3.5 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parents.map((p) => (
                      <tr key={p._id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">{p.parentId}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-slate-800">{p.firstName} {p.lastName}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${
                            p.relation === 'father'? 'bg-blue-50 text-blue-700' :
                            p.relation === 'mother'? 'bg-pink-50 text-pink-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {p.relation}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            {p.phone && (
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Phone className="w-3 h-3" />
                                <span className="text-xs">{p.phone}</span>
                              </div>
                            )}
                            {p.email && (
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Mail className="w-3 h-3" />
                               <span className="text-xs truncate max-w-[150px]">{p.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {(p.children?.length || 0) > 0? (
                            <button
                              onClick={() => handleViewChildren(`${p.firstName} ${p.lastName}`, p.children || [])}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors group"
                            >
                              <Users className="w-4 h-4" />
                              <span className="font-medium">{p.children?.length}</span>
                              <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 text-slate-400">
                              <Users className="w-4 h-4" />
                              <span>0</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => handleViewChildren(`${p.firstName} ${p.lastName}`, p.children || [])}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-xs font-semibold hover:from-indigo-600 hover:to-purple-600 shadow-sm transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Modern Style */}
              <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-200 bg-slate-50">
                <div className="text-sm text-slate-600">
                  Showing <span className="font-semibold text-slate-800">{(page - 1) * perPage + 1}</span> to <span className="font-semibold text-slate-800">{Math.min(page * perPage, total)}</span> of <span className="font-semibold text-slate-800">{total}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3.5 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-white hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 px-3.5 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-white hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* View Children Modal - Premium Style */}
      {childrenModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                </div>
                Children of {childrenModal.parentName}
              </h3>
              <button
                onClick={() => setChildrenModal({ open: false, parentName: '', children: [] })}
                className="p-2 hover:bg-white/60 rounded-xl transition text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {loadingChildren? (
                <div className="py-8 text-center">
                  <div className="relative w-12 h-12 mx-auto">
                    <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600" />
                    <Loader2 className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-sm text-slate-500 mt-3">Loading children details...</p>
                </div>
              ) : childrenDetails.length === 0? (
                <div className="py-8 text-center text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No children linked to this parent.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {childrenDetails.map((child, idx) => (
                    <Link
                      key={child.admissionNumber}
                      href={`/principal-dashboard/students/${child.admissionNumber}`}
                      className="block p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-300 bg-gradient-to-br from-slate-50 to-white hover:from-indigo-50 hover:to-purple-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {child.firstName} {child.lastName}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">{child.admissionNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-indigo-700">
                            Class {child.currentClass}-{child.currentSection}
                          </p>
                          <p className="text-xs text-slate-500">Roll No: {child.rollNumber}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 py-4 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => setChildrenModal({ open: false, parentName: '', children: [] })}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PrincipalLayout>
  )
}