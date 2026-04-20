'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import ReceptionistLayout from '@/components/receptionist/ReceptionistLayout'
import { getAllParents, linkChildToParent, getStudentDetails } from '@/services/receptionistService'
import type { Parent } from '@/services/receptionistService'
import { Search, Eye, Link2, ChevronLeft, ChevronRight, Users, User, X, Loader2, GraduationCap, UserPlus, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'
interface ChildInfo {
  admissionNumber: string
  firstName: string
  lastName: string
  class: string
  section: string
  rollNumber: string
}

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 25
  
  const [linkModal, setLinkModal] = useState<{ open: boolean; parentId: string; parentName: string }>({ open: false, parentId: '', parentName: '' })
  const [linkAdmissionNo, setLinkAdmissionNo] = useState('')
  const [linking, setLinking] = useState(false)
  const [linkMessage, setLinkMessage] = useState({ type: '', text: '' })
  
  // Children modal state
  const [childrenModal, setChildrenModal] = useState<{ open: boolean; parentName: string; children: string[] }>({ open: false, parentName: '', children: [] })
  const [childrenDetails, setChildrenDetails] = useState<ChildInfo[]>([])
  const [loadingChildren, setLoadingChildren] = useState(false)

  const fetchParents = useCallback(async () => {
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
  }, [page, search])

  useEffect(() => {
    fetchParents()
  }, [fetchParents])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchParents()
  }

  const handleLinkChild = async () => {
    if (!linkAdmissionNo.trim()) {
      setLinkMessage({ type: 'error', text: 'Enter admission number' })
      return
    }
    setLinking(true)
    setLinkMessage({ type: '', text: '' })
    try {
      await linkChildToParent(linkModal.parentId, linkAdmissionNo.trim())
      setLinkMessage({ type: 'success', text: 'Child linked successfully!' })
      setLinkAdmissionNo('')
      setTimeout(() => {
        setLinkModal({ open: false, parentId: '', parentName: '' })
        setLinkMessage({ type: '', text: '' })
        fetchParents()
      }, 1500)
    } catch (err: any) {
      setLinkMessage({ type: 'error', text: err.response?.data?.message || 'Failed to link' })
    } finally {
      setLinking(false)
    }
  }

  const handleViewChildren = async (parentName: string, children: string[]) => {
    setChildrenModal({ open: true, parentName, children })
    setChildrenDetails([])
    setLoadingChildren(true)
    
    try {
      const details: ChildInfo[] = []
      for (const admNo of children) {
        try {
          const res = await getStudentDetails(admNo)
          if (res.data) {
            details.push({
              admissionNumber: res.data.admissionNumber,
              firstName: res.data.firstName,
              lastName: res.data.lastName,
              class: res.data.class, // Mapped in backend
              section: res.data.section, // Mapped in backend
              rollNumber: res.data.rollNumber,
            })
          }
        } catch {
          details.push({
            admissionNumber: admNo,
            firstName: 'Unknown Student',
            lastName: '',
            class: '-',
            section: '-',
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
    <ReceptionistLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                <Users className="w-8 h-8" /> Parents Directory
              </h1>
              <p className="text-teal-100 font-medium">
                Search, view, and manage parent profiles
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => fetchParents()} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white border border-white/20 backdrop-blur-sm shadow-sm" title="Refresh">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link href="/receptionist-dashboard/register" className="flex items-center gap-2 px-5 py-3 bg-white text-teal-700 rounded-xl hover:bg-teal-50 transition-colors font-bold shadow-sm">
                <UserPlus className="w-5 h-5" /> New Registration
              </Link>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by parent name or ID (e.g. PAR-2024-0001)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
            <button type="submit" className="bg-teal-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-teal-700 shadow-sm shadow-teal-500/20 transition-all">
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-16 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : parents.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-bold text-slate-600">No parents found</p>
              <p className="text-sm font-medium mt-1">Try adjusting your search query.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Parent ID</th>
                      <th className="text-left px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Name & Relation</th>
                      <th className="text-left px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Contact Info</th>
                      <th className="text-center px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Linked Children</th>
                      <th className="text-center px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parents.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-teal-700">{p.parentId}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{p.firstName} {p.lastName}</div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{p.relation}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-700">{p.phone || '-'}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{p.email || '-'}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {(p.children?.length || 0) > 0 ? (
                            <button 
                              onClick={() => handleViewChildren(`${p.firstName} ${p.lastName}`, p.children || [])}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 hover:border-emerald-200 text-emerald-700 transition-colors group mx-auto"
                            >
                              <GraduationCap className="w-4 h-4" />
                              <span className="font-bold">{p.children?.length} Linked</span>
                              <Eye className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 mx-auto font-medium text-xs">
                              <AlertTriangle className="w-3.5 h-3.5" /> 0 Linked
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => setLinkModal({ open: true, parentId: p.parentId, parentName: `${p.firstName} ${p.lastName}` })}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-teal-600 hover:text-white hover:bg-teal-600 hover:border-teal-600 transition-all font-bold text-xs shadow-sm">
                            <Link2 className="w-3.5 h-3.5" /> Link Child
                          </button>
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

      {/* Link Child Modal */}
      {linkModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-slate-800 text-xl flex items-center gap-2">
                <Link2 className="w-5 h-5 text-teal-600" /> Link Child Profile
              </h3>
              <button onClick={() => { setLinkModal({ open: false, parentId: '', parentName: '' }); setLinkMessage({ type: '', text: '' }) }} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6">
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-0.5">Target Parent</p>
              <p className="font-bold text-teal-900">{linkModal.parentName} <span className="text-teal-600 font-mono text-xs ml-2 bg-teal-100 px-1.5 py-0.5 rounded">{linkModal.parentId}</span></p>
            </div>

            {linkMessage.text && (
              <div className={`p-4 rounded-xl text-sm font-bold mb-6 flex items-center gap-2 animate-in fade-in ${linkMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {linkMessage.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                {linkMessage.text}
              </div>
            )}
            
            <div className="mb-6">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Student Admission Number</label>
              <input
                type="text"
                placeholder="e.g., SPS-2024-0001"
                value={linkAdmissionNo}
                onChange={e => setLinkAdmissionNo(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setLinkModal({ open: false, parentId: '', parentName: '' }); setLinkMessage({ type: '', text: '' }) }}
                className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                Cancel
              </button>
              <button onClick={handleLinkChild} disabled={linking}
                className="flex-[2] bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-md shadow-teal-500/20">
                {linking ? 'Processing...' : 'Confirm Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Children Modal */}
      {childrenModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-teal-600" />
                  Linked Children
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Parent: {childrenModal.parentName}</p>
              </div>
              <button 
                onClick={() => setChildrenModal({ open: false, parentName: '', children: [] })} 
                className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 p-2 rounded-xl transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {loadingChildren ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-500 mt-3">Loading student profiles...</p>
                </div>
              ) : childrenDetails.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-bold">No valid children linked to this parent.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {childrenDetails.map((child, idx) => (
                    <Link 
                      key={child.admissionNumber}
                      href={`/receptionist-dashboard/students/${child.admissionNumber}`}
                      className="block bg-white rounded-2xl p-4 hover:bg-teal-50 transition-colors border border-slate-200 shadow-sm group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center border border-teal-200">
                            <User className="w-6 h-6 text-teal-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-lg group-hover:text-teal-700 transition-colors">
                              {child.firstName} {child.lastName}
                            </p>
                            <p className="text-xs font-bold text-slate-400 font-mono tracking-wider mt-0.5">{child.admissionNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg mb-1">
                            Class {child.class}-{child.section}
                          </span>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Roll: {child.rollNumber}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-white shrink-0">
              <button 
                onClick={() => setChildrenModal({ open: false, parentName: '', children: [] })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-sm"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </ReceptionistLayout>
  )
}