// src/app/principal-dashboard/approvals/page.tsx
// ═══════════════════════════════════════════════════════════════════════════════
// Production-ready with: AbortController, Optimistic UI, Custom Modal, Global Badges
// ═══════════════════════════════════════════════════════════════════════════════

'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { FileCheck, Calendar, CheckCircle, XCircle, Clock, FileText, Filter, RefreshCw, AlertTriangle, X } from 'lucide-react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import * as principalService from '@/services/principalService'
import { AxiosError } from 'axios'

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

// ═══════════════════════════════════════════════════════════════════════════════
// Type-safe error extraction
// ═══════════════════════════════════════════════════════════════════════════════
interface ApiErrorResponse {
  message?: string
  error?: string
}

function extractErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined
    return data?.message || data?.error || error.message || fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600" />
      <FileCheck className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  </div>
)

// Tab Button Component
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
          active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-600'
        }`}>
          {badge}
        </span>
      )}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIX #2: Custom Rejection Modal (replaces browser prompt())
// ═══════════════════════════════════════════════════════════════════════════════
interface RejectionModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  onSubmit: (reason: string) => void
  loading: boolean
}

function RejectionModal({ isOpen, title, onClose, onSubmit, loading }: RejectionModalProps) {
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    if (!reason.trim()) return
    onSubmit(reason.trim())
    setReason('')
  }

  const handleClose = () => {
    setReason('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {title}
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-lg text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1.5 block">Rejection Reason *</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={4}
              placeholder="Enter the reason for rejection..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none hover:border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
              autoFocus
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
          <button onClick={handleClose} disabled={loading} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-white transition disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl text-sm font-semibold hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/25 disabled:opacity-50 transition"
          >
            {loading ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<'certificates' | 'leaves'>('certificates')
  const [certificates, setCertificates] = useState<any[]>([])
  const [leaves, setLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')

  // FIX #1: Global pending counts from backend (not filtered local state)
  const [pendingCounts, setPendingCounts] = useState({ certificates: 0, leaves: 0, total: 0 })

  // FIX #2: Rejection modal state
  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean
    type: 'certificate' | 'leave'
    id: string
    title: string
  }>({ isOpen: false, type: 'certificate', id: '', title: '' })

  // FIX #3: AbortController ref for race condition prevention
  const abortControllerRef = useRef<AbortController | null>(null)

  // FIX #1: Fetch global pending counts on mount (independent of filters)
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await principalService.getApprovalsSummary()
        if (res.success && res.data?.pendingCounts) {
          setPendingCounts(res.data.pendingCounts)
        }
      } catch (err) {
        console.error('Failed to fetch summary:', err)
      }
    }
    fetchSummary()
  }, [])

  // ═══════════════════════════════════════════════════════════════════════════════
  // FIX #3: Data fetching with AbortController
  // ═══════════════════════════════════════════════════════════════════════════════
  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    try {
      const params = statusFilter === 'all' ? {} : { status: statusFilter }
      
      if (activeTab === 'certificates') {
        const res = await principalService.getCertificateRequests(params)
        if (signal?.aborted) return
        if (res.success) setCertificates(res.data)
      } else {
        const res = await principalService.getLeaveRequests(params)
        if (signal?.aborted) return
        if (res.success) setLeaves(res.data)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Error:', err)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [activeTab, statusFilter])

  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    fetchData(controller.signal)

    return () => controller.abort()
  }, [fetchData])

  // ═══════════════════════════════════════════════════════════════════════════════
  // FIX #4: Optimistic UI Updates
  // ═══════════════════════════════════════════════════════════════════════════════
  const handleApproveCertificate = useCallback(async (id: string) => {
    // Optimistic update
    const original = certificates.find(c => c._id === id)
    setCertificates(prev => prev.map(c => c._id === id ? { ...c, status: 'approved' } : c))
    setPendingCounts(prev => ({ ...prev, certificates: Math.max(0, prev.certificates - 1), total: Math.max(0, prev.total - 1) }))
    setMessage({ type: 'success', text: 'Certificate approved!' })

    try {
      const res = await principalService.approveCertificate(id)
      if (res.success && res.data?.certificateNumber) {
        // Update with server response (certificate number)
        setCertificates(prev => prev.map(c => c._id === id ? { ...c, ...res.data } : c))
      }
    } catch (err) {
      // Revert on failure
      if (original) setCertificates(prev => prev.map(c => c._id === id ? original : c))
      setPendingCounts(prev => ({ ...prev, certificates: prev.certificates + 1, total: prev.total + 1 }))
      setMessage({ type: 'error', text: extractErrorMessage(err, 'Failed to approve') })
    }
  }, [certificates])

  const handleRejectCertificate = useCallback(async (reason: string) => {
    const id = rejectionModal.id
    setActionLoading(id)
    
    // Optimistic update
    const original = certificates.find(c => c._id === id)
    setCertificates(prev => prev.map(c => c._id === id ? { ...c, status: 'rejected', rejectionReason: reason } : c))
    setPendingCounts(prev => ({ ...prev, certificates: Math.max(0, prev.certificates - 1), total: Math.max(0, prev.total - 1) }))
    setRejectionModal({ isOpen: false, type: 'certificate', id: '', title: '' })
    setMessage({ type: 'success', text: 'Certificate rejected' })

    try {
      await principalService.rejectCertificate(id, reason)
    } catch (err) {
      // Revert on failure
      if (original) setCertificates(prev => prev.map(c => c._id === id ? original : c))
      setPendingCounts(prev => ({ ...prev, certificates: prev.certificates + 1, total: prev.total + 1 }))
      setMessage({ type: 'error', text: extractErrorMessage(err, 'Failed to reject') })
    } finally {
      setActionLoading(null)
    }
  }, [certificates, rejectionModal.id])

  const handleApproveLeave = useCallback(async (id: string) => {
    // Optimistic update
    const original = leaves.find(l => l._id === id)
    setLeaves(prev => prev.map(l => l._id === id ? { ...l, status: 'approved' } : l))
    setPendingCounts(prev => ({ ...prev, leaves: Math.max(0, prev.leaves - 1), total: Math.max(0, prev.total - 1) }))
    setMessage({ type: 'success', text: 'Leave approved!' })

    try {
      await principalService.approveLeave(id)
    } catch (err) {
      // Revert on failure
      if (original) setLeaves(prev => prev.map(l => l._id === id ? original : l))
      setPendingCounts(prev => ({ ...prev, leaves: prev.leaves + 1, total: prev.total + 1 }))
      setMessage({ type: 'error', text: extractErrorMessage(err, 'Failed to approve') })
    }
  }, [leaves])

  const handleRejectLeave = useCallback(async (reason: string) => {
    const id = rejectionModal.id
    setActionLoading(id)
    
    // Optimistic update
    const original = leaves.find(l => l._id === id)
    setLeaves(prev => prev.map(l => l._id === id ? { ...l, status: 'rejected', rejectionReason: reason } : l))
    setPendingCounts(prev => ({ ...prev, leaves: Math.max(0, prev.leaves - 1), total: Math.max(0, prev.total - 1) }))
    setRejectionModal({ isOpen: false, type: 'leave', id: '', title: '' })
    setMessage({ type: 'success', text: 'Leave rejected' })

    try {
      await principalService.rejectLeave(id, reason)
    } catch (err) {
      // Revert on failure
      if (original) setLeaves(prev => prev.map(l => l._id === id ? original : l))
      setPendingCounts(prev => ({ ...prev, leaves: prev.leaves + 1, total: prev.total + 1 }))
      setMessage({ type: 'error', text: extractErrorMessage(err, 'Failed to reject') })
    } finally {
      setActionLoading(null)
    }
  }, [leaves, rejectionModal.id])

  // FIX #2: Open rejection modal instead of browser prompt
  const openRejectionModal = useCallback((type: 'certificate' | 'leave', id: string, itemName: string) => {
    setRejectionModal({
      isOpen: true,
      type,
      id,
      title: `Reject ${type === 'certificate' ? 'Certificate' : 'Leave'} Request`,
    })
  }, [])

  const getDaysCount = (from: string, to: string) => {
    const start = new Date(from)
    const end = new Date(to)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return diff
  }

  const handleRefresh = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    fetchData(controller.signal)
    
    // Also refresh summary counts
    principalService.getApprovalsSummary().then(res => {
      if (res.success && res.data?.pendingCounts) {
        setPendingCounts(res.data.pendingCounts)
      }
    }).catch(() => {})
  }, [fetchData])

  return (
    <PrincipalLayout>
      <div className="space-y-6">
        {/* Header - Gradient Style */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <FileCheck className="w-7 h-7" />
                Approvals
              </h2>
              <p className="text-indigo-100 mt-1">Manage certificate and leave requests</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              {pendingCounts.total > 0 && (
                <div className="px-4 py-2 bg-amber-400/20 border border-amber-400/30 rounded-xl text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {pendingCounts.total} Pending
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 shadow-sm ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex flex-wrap gap-2">
          <TabButton
            active={activeTab === 'certificates'}
            onClick={() => setActiveTab('certificates')}
            icon={FileText}
            label="Certificates"
            badge={pendingCounts.certificates}
          />
          <TabButton
            active={activeTab === 'leaves'}
            onClick={() => setActiveTab('leaves')}
            icon={Calendar}
            label="Leave Requests"
            badge={pendingCounts.leaves}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-slate-600">
              <Filter className="w-5 h-5" />
              <span className="font-medium text-sm">Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">⏳ Pending</option>
              <option value="approved">✅ Approved</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>
        </div>

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          loading ? <LoadingSpinner /> : certificates.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16 text-slate-400">
              <FileText className="w-16 h-16 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No {statusFilter === 'all' ? '' : statusFilter} certificate requests</p>
              <p className="text-sm mt-1">Certificate requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {certificates.map(cert => (
                <div key={cert._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
                  <div className={`h-1 ${
                    cert.status === 'pending' ? 'bg-amber-400' :
                    cert.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-800 capitalize">{cert.type} Certificate</h3>
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                cert.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                cert.status === 'approved' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {cert.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-0.5">Requested on {new Date(cert.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Student</p>
                            <p className="text-sm font-semibold text-slate-700 mt-1">{cert.studentName}</p>
                            <p className="text-xs text-slate-500">{cert.studentId}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Class</p>
                            <p className="text-sm font-semibold text-slate-700 mt-1">{cert.class}-{cert.section}</p>
                          </div>
                          {cert.reason && (
                            <div className="p-3 bg-slate-50 rounded-xl sm:col-span-2 lg:col-span-1">
                              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Reason</p>
                              <p className="text-sm text-slate-600 mt-1">{cert.reason}</p>
                            </div>
                          )}
                          {cert.certificateNumber && (
                            <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                              <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Certificate Number</p>
                              <p className="text-sm font-bold text-green-700 mt-1">{cert.certificateNumber}</p>
                            </div>
                          )}
                          {cert.rejectionReason && (
                            <div className="p-3 bg-red-50 rounded-xl border border-red-100 sm:col-span-2 lg:col-span-3">
                              <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Rejection Reason</p>
                              <p className="text-sm text-red-700 mt-1">{cert.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {cert.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveCertificate(cert._id)}
                            disabled={actionLoading === cert._id}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition text-sm font-semibold shadow-lg shadow-green-500/25 disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectionModal('certificate', cert._id, cert.type)}
                            disabled={actionLoading === cert._id}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition text-sm font-semibold shadow-lg shadow-red-500/25 disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Leaves Tab */}
        {activeTab === 'leaves' && (
          loading ? <LoadingSpinner /> : leaves.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16 text-slate-400">
              <Calendar className="w-16 h-16 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No {statusFilter === 'all' ? '' : statusFilter} leave requests</p>
              <p className="text-sm mt-1">Leave requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaves.map(leave => (
                <div key={leave._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
                  <div className={`h-1 ${
                    leave.status === 'pending' ? 'bg-amber-400' :
                    leave.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-800 capitalize">{leave.leaveType} Leave</h3>
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                leave.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {leave.status.toUpperCase()}
                              </span>
                              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold">
                                {getDaysCount(leave.fromDate, leave.toDate)} days
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-0.5">
                              {new Date(leave.fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(leave.toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide capitalize">{leave.requestorRole}</p>
                            <p className="text-sm font-semibold text-slate-700 mt-1">{leave.requestorName}</p>
                            <p className="text-xs text-slate-500">{leave.requestorId}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Department</p>
                            <p className="text-sm font-semibold text-slate-700 mt-1">{leave.department || 'N/A'}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl sm:col-span-2 lg:col-span-1">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Reason</p>
                            <p className="text-sm text-slate-600 mt-1">{leave.reason}</p>
                          </div>
                          {leave.approvedBy && (
                            <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                              <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Processed By</p>
                              <p className="text-sm font-semibold text-green-700 mt-1">{leave.approvedBy}</p>
                              {leave.approvedAt && (
                                <p className="text-xs text-green-600">{new Date(leave.approvedAt).toLocaleDateString()}</p>
                              )}
                            </div>
                          )}
                          {leave.rejectionReason && (
                            <div className="p-3 bg-red-50 rounded-xl border border-red-100 sm:col-span-2">
                              <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Rejection Reason</p>
                              <p className="text-sm text-red-700 mt-1">{leave.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {leave.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveLeave(leave._id)}
                            disabled={actionLoading === leave._id}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition text-sm font-semibold shadow-lg shadow-green-500/25 disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectionModal('leave', leave._id, leave.leaveType)}
                            disabled={actionLoading === leave._id}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition text-sm font-semibold shadow-lg shadow-red-500/25 disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* FIX #2: Rejection Modal */}
        <RejectionModal
          isOpen={rejectionModal.isOpen}
          title={rejectionModal.title}
          onClose={() => setRejectionModal({ isOpen: false, type: 'certificate', id: '', title: '' })}
          onSubmit={rejectionModal.type === 'certificate' ? handleRejectCertificate : handleRejectLeave}
          loading={actionLoading === rejectionModal.id}
        />
      </div>
    </PrincipalLayout>
  )
}
