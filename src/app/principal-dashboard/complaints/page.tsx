'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import { MessageSquareWarning, AlertTriangle, Search, Eye, Edit2, ChevronLeft, ChevronRight, X, CheckCircle, Clock, Send, MessageCircle, Filter, RefreshCw, User } from 'lucide-react'
import * as principalService from '@/services/principalService'

// ALIGNED WITH NEW DB ENUMS
const CATEGORIES = ['academic', 'behavioral', 'infrastructure', 'staff', 'fees', 'transport', 'safety', 'bullying', 'other']
const STATUS_OPTIONS = ['open', 'in_progress', 'escalated', 'resolved', 'closed', 'rejected']
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent']

// Helper for safe error extraction
const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    return axiosError.response?.data?.message || 'An error occurred'
  }
  return error instanceof Error ? error.message : 'An error occurred'
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600" />
      <MessageSquareWarning className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  </div>
)

export default function ComplaintsPage() {
  const [loading, setLoading] = useState(true)
  const [complaints, setComplaints] = useState<principalService.Complaint[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState({ category: '', status: '', priority: '' })
  const [selectedComplaint, setSelectedComplaint] = useState<principalService.Complaint | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [updateForm, setUpdateForm] = useState({ status: '', priority: '', assignedTo: '' })
  const [comment, setComment] = useState('')
  const [resolutionSummary, setResolutionSummary] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const abortControllerRef = useRef<AbortController | null>(null)

  const loadData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    try {
      const [complaintsRes, summaryRes] = await Promise.all([
        principalService.getComplaints({
          category: filters.category || undefined, 
          status: filters.status || undefined,
          priority: filters.priority || undefined, 
          page: pagination.page, 
          limit: 15
        }),
        principalService.getComplaintsSummary()
      ])
      
      if (signal?.aborted) return
      
      setComplaints(complaintsRes.data || [])
      setPagination(p => ({ ...p, pages: complaintsRes.pagination?.pages || 1, total: complaintsRes.pagination?.total || 0 }))
      setSummary(summaryRes.data || null)
    } catch (error: unknown) { 
      if (error instanceof Error && error.name === 'AbortError') return
      console.error('Error:', error) 
    }
    finally { 
      if (!signal?.aborted) setLoading(false) 
    }
  }, [filters.category, filters.status, filters.priority, pagination.page])

  useEffect(() => { 
    if (abortControllerRef.current) abortControllerRef.current.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    loadData(controller.signal)
    return () => controller.abort()
  }, [loadData])

  const openDetailModal = async (complaint: principalService.Complaint) => {
    try {
      const res = await principalService.getComplaintDetail(complaint._id)
      setSelectedComplaint(res.data)
      setUpdateForm({ status: res.data.status, priority: res.data.priority, assignedTo: '' })
      setComment('')
      setResolutionSummary('')
      setShowModal(true)
    } catch (error) { console.error('Error:', error) }
  }

  const handleUpdate = async () => {
    if (!selectedComplaint) return
    const originalComplaint = { ...selectedComplaint }
    const originalComplaints = [...complaints]
    
    const optimisticUpdates: Partial<principalService.Complaint> = {
      status: updateForm.status as any,
      priority: updateForm.priority as any,
    }
    
    setSelectedComplaint(prev => prev ? { ...prev, ...optimisticUpdates } : prev)
    setComplaints(prev => prev.map(c => c._id === selectedComplaint._id ? { ...c, ...optimisticUpdates } : c))
    setMessage({ type: 'success', text: 'Complaint updated' })
    setSaving(true)
    
    try {
      const res = await principalService.updateComplaint(selectedComplaint._id, {
        status: updateForm.status, 
        priority: updateForm.priority
      })
      setSelectedComplaint(res.data)
      setComplaints(prev => prev.map(c => c._id === selectedComplaint._id ? res.data : c))
    } catch (error: unknown) { 
      setSelectedComplaint(originalComplaint)
      setComplaints(originalComplaints)
      setMessage({ type: 'error', text: extractErrorMessage(error) }) 
    }
    finally { setSaving(false) }
  }

  const handleAddComment = async () => {
    if (!selectedComplaint || !comment.trim()) return
    setSaving(true)
    try {
      const res = await principalService.addComplaintComment(selectedComplaint._id, { message: comment })
      setSelectedComplaint(res.data)
      setComment('')
      setMessage({ type: 'success', text: 'Comment added' })
    } catch (error: unknown) { setMessage({ type: 'error', text: extractErrorMessage(error) }) }
    finally { setSaving(false) }
  }

  const handleResolve = async () => {
    if (!selectedComplaint || !resolutionSummary.trim()) return
    const originalComplaint = { ...selectedComplaint }
    const originalComplaints = [...complaints]
    
    const optimisticUpdates: Partial<principalService.Complaint> = {
      status: 'resolved' as any,
      resolution: {
        summary: resolutionSummary,
        resolvedByName: 'Principal',
        resolvedDate: new Date().toISOString(),
      }
    }
    
    setComplaints(prev => prev.map(c => c._id === selectedComplaint._id ? { ...c, ...optimisticUpdates } : c))
    setMessage({ type: 'success', text: 'Complaint resolved' })
    setShowModal(false)
    setSaving(true)
    
    try {
      await principalService.resolveComplaint(selectedComplaint._id, { resolution: resolutionSummary })
    } catch (error: unknown) { 
      setComplaints(originalComplaints)
      setSelectedComplaint(originalComplaint)
      setShowModal(true)
      setMessage({ type: 'error', text: extractErrorMessage(error) }) 
    }
    finally { setSaving(false) }
  }

  const handleRefresh = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    loadData(controller.signal)
  }

  const getPriorityColor = (priority: string) => ({ low: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700' }[priority] || 'bg-gray-100 text-gray-700')
  const getStatusColor = (status: string) => ({ open: 'bg-blue-100 text-blue-700', in_progress: 'bg-yellow-100 text-yellow-700', escalated: 'bg-orange-100 text-orange-700', resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-700', rejected: 'bg-red-100 text-red-700' }[status] || 'bg-gray-100 text-gray-700')

  return (
    <PrincipalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <MessageSquareWarning className="w-7 h-7" />
                Complaints & Grievances
              </h2>
              <p className="text-indigo-100 mt-1">Manage and resolve complaints from parents and teachers</p>
            </div>
            <button onClick={handleRefresh} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white self-start" title="Refresh">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto hover:bg-white/50 rounded-lg p-1 transition"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Summary Cards */}
        {summary && summary.summary && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <MessageSquareWarning className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{summary.summary.open + summary.summary.inProgress + summary.summary.resolved}</div>
                  <div className="text-sm text-slate-500">Total</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{summary.summary.open}</div>
                  <div className="text-sm text-slate-500">Open</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{summary.summary.inProgress}</div>
                  <div className="text-sm text-slate-500">In Progress</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{summary.summary.resolved}</div>
                  <div className="text-sm text-slate-500">Resolved</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Filter className="w-5 h-5" />
              <span className="font-medium text-sm">Filters:</span>
            </div>
            <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <select value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))} className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <option value="">All Priorities</option>
              {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <LoadingSpinner />
          ) : complaints.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <MessageSquareWarning className="w-16 h-16 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No complaints found</p>
              <p className="text-sm mt-1">Adjust filters to see results</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-white">Ticket #</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Subject</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">From</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Category</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Priority</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Date</th>
                    <th className="px-4 py-3 text-center font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.map(complaint => (
                    <tr key={complaint._id} className="hover:bg-indigo-50/30 transition">
                      <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-semibold">{complaint.ticketNumber}</td>
                      <td className="px-4 py-3"><div className="font-semibold text-slate-800 truncate max-w-[200px]">{complaint.subject}</div></td>
                      
                      {/* FIX: USING raisedByName */}
                      <td className="px-4 py-3">
                        <div className="text-slate-700 font-medium">{complaint.raisedByName}</div>
                        <div className="text-xs text-slate-500 capitalize">{complaint.raisedByRole}</div>
                      </td>
                      
                      <td className="px-4 py-3 text-slate-600 capitalize">{complaint.category?.replace('_', ' ')}</td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getPriorityColor(complaint.priority)}`}>{complaint.priority.toUpperCase()}</span></td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(complaint.status)}`}>{complaint.status.replace('_', ' ').toUpperCase()}</span></td>
                      <td className="px-4 py-3 text-slate-600">{new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => openDetailModal(complaint)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-sm text-slate-600">Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} 
                  disabled={pagination.page === 1} 
                  className="p-2 rounded-lg border border-slate-200 hover:bg-white hover:border-indigo-300 disabled:opacity-50 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} 
                  disabled={pagination.page === pagination.pages} 
                  className="p-2 rounded-lg border border-slate-200 hover:bg-white hover:border-indigo-300 disabled:opacity-50 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquareWarning className="w-5 h-5" />
                    {selectedComplaint.ticketNumber}
                  </h2>
                  <p className="text-indigo-100 text-sm mt-0.5">{selectedComplaint.subject}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Complaint Info */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    
                    {/* FIX: USING raisedByName */}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">From:</span>
                      <span className="font-semibold text-slate-800">{selectedComplaint.raisedByName} ({selectedComplaint.raisedByRole})</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Category:</span>
                      <span className="font-semibold text-slate-800 capitalize">{selectedComplaint.category?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Priority:</span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getPriorityColor(selectedComplaint.priority)}`}>{selectedComplaint.priority.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Status:</span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(selectedComplaint.status)}`}>{selectedComplaint.status.replace('_', ' ').toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-indigo-100">
                    <span className="text-slate-500 text-sm font-medium">Description:</span>
                    <p className="mt-2 text-slate-800">{selectedComplaint.description}</p>
                  </div>
                </div>

                {/* Update Form */}
                {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'closed' && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-indigo-600" />
                      Update Status
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600 mb-1.5 block">Status</label>
                        <select value={updateForm.status} onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 mb-1.5 block">Priority</label>
                        <select value={updateForm.priority} onChange={e => setUpdateForm(f => ({ ...f, priority: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
                          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button onClick={handleUpdate} disabled={saving} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition">
                        {saving ? 'Updating...' : 'Update Status'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Comments */}
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-indigo-600" />
                    Comments ({selectedComplaint.comments?.length || 0})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                    
                    {/* FIX: USING authorName AND createdAt */}
                    {selectedComplaint.comments?.map((c, i) => (
                      <div key={i} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800 text-sm">{c.authorName} <span className="text-slate-400 font-normal">({c.authorRole})</span></span>
                          <span className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-600">{c.message}</p>
                      </div>
                    ))}
                    
                    {!selectedComplaint.comments?.length && <p className="text-sm text-slate-400 text-center py-4">No comments yet</p>}
                  </div>
                  {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'closed' && (
                    <div className="flex gap-2">
                      <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
                      <button onClick={handleAddComment} disabled={saving || !comment.trim()} className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Resolve Section */}
                {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'closed' && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Resolve Complaint
                    </h3>
                    <textarea value={resolutionSummary} onChange={e => setResolutionSummary(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-green-200 rounded-xl text-sm resize-none mb-3 bg-white hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" placeholder="Enter resolution summary..." />
                    <button onClick={handleResolve} disabled={saving || !resolutionSummary.trim()} className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/25 disabled:opacity-50 transition">
                      {saving ? 'Resolving...' : 'Mark as Resolved'}
                    </button>
                  </div>
                )}

                {/* Resolution Info */}
                {selectedComplaint.status === 'resolved' && selectedComplaint.resolution?.summary && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Resolution
                    </h3>
                    <p className="text-sm text-green-700">{selectedComplaint.resolution.summary}</p>
                    
                    {/* FIX: USING resolvedByName */}
                    <p className="text-xs text-green-600 mt-3 pt-3 border-t border-green-200">Resolved by {selectedComplaint.resolution.resolvedByName} on {new Date(selectedComplaint.resolution.resolvedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PrincipalLayout>
  )
}