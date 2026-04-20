// src/app/principal-dashboard/notices/page.tsx

'use client'
import { useEffect, useState, useCallback } from 'react'
import { 
  Bell, Plus, Send, Trash2, Clock, CheckCircle, XCircle, Users, 
  Eye, RefreshCw, Filter, Archive, RotateCcw, AlertTriangle,
  X, User, Mail, Phone, BookOpen, GraduationCap, Calendar
} from 'lucide-react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import * as principalService from '@/services/principalService'

const AUDIENCES = ['all', 'students', 'teachers', 'parents', 'staff']
const PRIORITY_OPTIONS = ['general', 'academic', 'event', 'holiday', 'exam', 'sports', 'high', 'normal', 'urgent']
const CLASSES = ['ALL', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const SECTIONS = ['ALL', 'A', 'B', 'C', 'D']

interface Notice {
  _id: string
  title: string
  content: string
  priority: string
  tag: string
  targetClass: string
  targetSection: string
  targetAudience: string | { class?: string; section?: string; _id?: string }
  targetDisplay?: string | { class?: string; section?: string; _id?: string }
  postedBy: string
  postedById: string
  postedByRole: string
  status: string
  isDeleted: boolean
  deletedBy?: string
  deletedByRole?: string
  deletedAt?: string
  createdAt: string
  updatedAt: string
  approvedBy?: string
  approvedAt?: string
  expiresAt?: string
}

interface CreatorDetails {
  id: string
  name: string
  email?: string
  phone?: string
  role: string
  subjects?: string[]
  assignedClasses?: (string | { class?: string; section?: string; _id?: string })[]
  classTeacherOf?: string | { class?: string; section?: string; _id?: string }
}

export default function NoticesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'deleted' | 'mine'>('all')
  const [notices, setNotices] = useState<Notice[]>([])
  const [pendingNotices, setPendingNotices] = useState<Notice[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [deletedCount, setDeletedCount] = useState(0)
  const [myNoticesCount, setMyNoticesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  
  // Creator detail modal
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  const [creatorDetails, setCreatorDetails] = useState<CreatorDetails | null>(null)
  const [showCreatorModal, setShowCreatorModal] = useState(false)
  
  const [form, setForm] = useState({
    title: '',
    content: '',
    targetAudience: 'all',
    targetClass: 'ALL',
    targetSection: 'ALL',
    priority: 'normal',
    expiryDate: ''
  })

  // SSE for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/sse/stream?token=${token}`
    )

    eventSource.addEventListener('notice_pending_approval', (event) => {
      const data = JSON.parse(event.data)
      setMessage({ type: 'success', text: `New notice pending: "${data.title}"` })
      fetchPendingNotices()
      fetchNotices()
    })

    eventSource.addEventListener('notice_created', () => {
      fetchNotices()
    })

    eventSource.addEventListener('notice_deleted', () => {
      fetchNotices()
    })

    eventSource.addEventListener('notice_approved', () => {
      fetchNotices()
      fetchPendingNotices()
    })

    return () => eventSource.close()
  }, [])

  const fetchNotices = useCallback(async () => {
    setLoading(true)
    try {
      const showDeleted = activeTab === 'deleted' ? 'only' : 'false'
      const res = await principalService.getAllNotices({ 
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        showDeleted 
      })
      if (res.success) {
        setNotices(res.data)
        setPendingCount(res.pendingCount || 0)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }, [activeTab, statusFilter, priorityFilter])

  // Fetch all counts on mount and when data changes
  const fetchCounts = useCallback(async () => {
    try {
      // Fetch deleted count
      const deletedRes = await principalService.getAllNotices({ showDeleted: 'only' })
      if (deletedRes.success) {
        setDeletedCount(deletedRes.data.length)
      }
      
      // Fetch my notices count (posted by principal)
      const allRes = await principalService.getAllNotices({ showDeleted: 'false' })
      if (allRes.success) {
        const myCount = allRes.data.filter((n: Notice) => n.postedByRole === 'principal').length
        setMyNoticesCount(myCount)
      }
    } catch (err) {
      console.error('Error fetching counts:', err)
    }
  }, [])

  const fetchPendingNotices = async () => {
    try {
      const res = await principalService.getPendingNotices()
      if (res.success) {
        setPendingNotices(res.data)
        setPendingCount(res.count || res.data.length)
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingNotices()
      setLoading(false)
    } else {
      fetchNotices()
    }
    // Refresh counts when tab changes
    fetchCounts()
  }, [activeTab, fetchNotices, fetchCounts])

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading('create')
    try {
      const res = await principalService.createNotice(form)
      if (res.success) {
        setMessage({ type: 'success', text: 'Notice created successfully!' })
        setForm({ title: '', content: '', targetAudience: 'all', targetClass: 'ALL', targetSection: 'ALL', priority: 'normal', expiryDate: '' })
        setShowForm(false)
        fetchNotices()
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create notice' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleApprove = async (noticeId: string) => {
    setActionLoading(noticeId)
    try {
      const res = await principalService.approveNotice(noticeId)
      if (res.success) {
        setMessage({ type: 'success', text: 'Notice approved!' })
        fetchPendingNotices()
        fetchNotices()
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to approve' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (noticeId: string) => {
    const reason = prompt('Enter rejection reason (optional):')
    if (reason === null) return

    setActionLoading(noticeId)
    try {
      const res = await principalService.rejectNotice(noticeId, reason)
      if (res.success) {
        setMessage({ type: 'success', text: 'Notice rejected' })
        fetchPendingNotices()
        fetchNotices()
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to reject' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (noticeId: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return

    setActionLoading(noticeId)
    try {
      const res = await principalService.deleteNotice(noticeId)
      if (res.success) {
        setMessage({ type: 'success', text: 'Notice deleted' })
        fetchNotices()
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRestore = async (noticeId: string) => {
    setActionLoading(noticeId)
    try {
      const res = await principalService.restoreNotice(noticeId)
      if (res.success) {
        setMessage({ type: 'success', text: 'Notice restored' })
        fetchNotices()
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to restore' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleViewCreator = async (notice: Notice) => {
    setSelectedNotice(notice)
    setShowCreatorModal(true)
    try {
      const res = await principalService.getNoticeDetail(notice._id)
      if (res.success && res.data.creatorDetails) {
        setCreatorDetails(res.data.creatorDetails)
      }
    } catch (err) {
      console.error('Error fetching creator details:', err)
    }
  }

  const getTargetDisplay = (notice: Notice) => {
    // Handle targetDisplay if it's an object with class/section keys
    if (notice.targetDisplay) {
      if (typeof notice.targetDisplay === 'string') {
        return notice.targetDisplay
      }
      // If it's an object, format it properly
      if (typeof notice.targetDisplay === 'object') {
        const td = notice.targetDisplay as { class?: string; section?: string }
        if (td.class && td.section) {
          return `Class ${td.class}-${td.section}`
        }
        if (td.class) {
          return `Class ${td.class}`
        }
      }
    }
    
    // Handle targetAudience if it's an object
    if (notice.targetAudience) {
      if (typeof notice.targetAudience === 'string') {
        if (notice.targetAudience === 'ALL' || notice.targetAudience.toLowerCase() === 'all') {
          return 'All Classes'
        }
      }
      if (typeof notice.targetAudience === 'object') {
        const ta = notice.targetAudience as unknown as { class?: string; section?: string }
        if (ta.class && ta.section) {
          return `Class ${ta.class}-${ta.section}`
        }
        if (ta.class) {
          return `Class ${ta.class}`
        }
      }
    }
    
    // Fallback to targetClass/targetSection
    if (notice.targetClass === 'ALL') return 'All Classes'
    if (notice.targetSection === 'ALL') return `Class ${notice.targetClass} (All Sections)`
    if (notice.targetClass && notice.targetSection) {
      return `Class ${notice.targetClass}-${notice.targetSection}`
    }
    if (notice.targetClass) {
      return `Class ${notice.targetClass}`
    }
    
    return 'All Classes'
  }

  return (
    <PrincipalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Bell className="w-7 h-7" />
                Notice Management
              </h2>
              <p className="text-indigo-100 mt-1">Manage school notices and announcements</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchNotices()}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition text-sm font-semibold shadow-md"
              >
                <Plus className="w-4 h-4" />
                Create Notice
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex flex-wrap gap-2">
          <TabButton 
            active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')} 
            icon={Bell} 
            label="All Notices" 
          />
          <TabButton 
            active={activeTab === 'mine'} 
            onClick={() => setActiveTab('mine')} 
            icon={User} 
            label="My Notices"
            badge={myNoticesCount > 0 ? myNoticesCount : undefined}
          />
          <TabButton 
            active={activeTab === 'pending'} 
            onClick={() => setActiveTab('pending')} 
            icon={Clock} 
            label="Pending Approval"
            badge={pendingCount > 0 ? pendingCount : undefined}
          />
          <TabButton 
            active={activeTab === 'deleted'} 
            onClick={() => setActiveTab('deleted')} 
            icon={Archive} 
            label="Deleted"
            badge={deletedCount > 0 ? deletedCount : undefined}
          />
        </div>

        {/* Filters (for all notices tab) */}
        {(activeTab === 'all' || activeTab === 'mine') && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 text-slate-600">
                <Filter className="w-5 h-5" />
                <span className="font-medium text-sm">Filters:</span>
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="approved">✅ Approved</option>
                <option value="pending">⏳ Pending</option>
                <option value="rejected">❌ Rejected</option>
              </select>
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="all">All Priorities</option>
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* All Notices Tab */}
        {activeTab === 'all' && (
          loading ? <LoadingSpinner /> : notices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16 text-slate-400">
              <Bell className="w-16 h-16 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No notices found</p>
              <p className="text-sm mt-1">Create a new notice to get started</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {notices.map(notice => (
                <NoticeCard 
                  key={notice._id} 
                  notice={notice} 
                  onDelete={handleDelete}
                  onViewCreator={handleViewCreator}
                  getTargetDisplay={getTargetDisplay}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )
        )}

        {/* My Notices Tab */}
        {activeTab === 'mine' && (
          loading ? <LoadingSpinner /> : notices.filter(n => n.postedByRole === 'principal').length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16 text-slate-400">
              <User className="w-16 h-16 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No notices posted yet</p>
              <p className="text-sm mt-1">Create your first notice</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {notices.filter(n => n.postedByRole === 'principal').map(notice => (
                <NoticeCard 
                  key={notice._id} 
                  notice={notice} 
                  onDelete={handleDelete}
                  onViewCreator={handleViewCreator}
                  getTargetDisplay={getTargetDisplay}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )
        )}

        {/* Pending Notices Tab */}
        {activeTab === 'pending' && (
          loading ? <LoadingSpinner /> : pendingNotices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16 text-green-600">
              <CheckCircle className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm mt-1 text-slate-500">No pending notices to approve</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingNotices.map(notice => (
                <PendingNoticeCard 
                  key={notice._id} 
                  notice={notice}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onViewCreator={handleViewCreator}
                  getTargetDisplay={getTargetDisplay}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )
        )}

        {/* Deleted Notices Tab */}
        {activeTab === 'deleted' && (
          loading ? <LoadingSpinner /> : notices.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16 text-slate-400">
              <Archive className="w-16 h-16 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No deleted notices</p>
              <p className="text-sm mt-1">Deleted notices will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {notices.map(notice => (
                <DeletedNoticeCard 
                  key={notice._id} 
                  notice={notice}
                  onRestore={handleRestore}
                  onViewCreator={handleViewCreator}
                  getTargetDisplay={getTargetDisplay}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )
        )}

        {/* Create Notice Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Create New Notice</h3>
                      <p className="text-indigo-100 text-sm">Fill in the details below</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="p-6">
                <form onSubmit={handleCreateNotice} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Enter notice title"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Content *</label>
                    <textarea
                      value={form.content}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      placeholder="Enter notice content..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition h-32 resize-none"
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
                      <select
                        value={form.targetAudience}
                        onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      >
                        {AUDIENCES.map(a => (
                          <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                      <select
                        value={form.priority}
                        onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      >
                        {PRIORITY_OPTIONS.map(p => (
                          <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Target Class</label>
                      <select
                        value={form.targetClass}
                        onChange={e => setForm(f => ({ ...f, targetClass: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      >
                        {CLASSES.map(c => (
                          <option key={c} value={c}>{c === 'ALL' ? 'All Classes' : `Class ${c}`}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Target Section</label>
                      <select
                        value={form.targetSection}
                        onChange={e => setForm(f => ({ ...f, targetSection: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-slate-100 disabled:text-slate-400"
                        disabled={form.targetClass === 'ALL'}
                      >
                        {SECTIONS.map(s => (
                          <option key={s} value={s}>{s === 'ALL' ? 'All Sections' : `Section ${s}`}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date (optional)</label>
                    <input
                      type="date"
                      value={form.expiryDate}
                      onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading === 'create'}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition text-sm font-semibold disabled:opacity-50 shadow-md shadow-indigo-200"
                    >
                      <Send className="w-4 h-4" />
                      Create Notice
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Creator Detail Modal */}
        {showCreatorModal && selectedNotice && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Notice Creator</h3>
                      <p className="text-indigo-100 text-sm">View creator details</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowCreatorModal(false); setCreatorDetails(null); setSelectedNotice(null) }}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="p-6">
                {creatorDetails ? (
                  <div className="space-y-5">
                    {/* Creator Avatar & Name */}
                    <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                        <span className="text-3xl font-bold text-white">
                          {creatorDetails.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-800">{creatorDetails.name}</p>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mt-1">
                          <User className="w-3.5 h-3.5" />
                          {creatorDetails.role}
                        </span>
                      </div>
                    </div>
                    
                    {/* Creator Details */}
                    <div className="space-y-3">
                      {creatorDetails.email && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Mail className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Email</p>
                            <p className="text-sm font-medium text-slate-700">{creatorDetails.email}</p>
                          </div>
                        </div>
                      )}
                      {creatorDetails.phone && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Phone className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Phone</p>
                            <p className="text-sm font-medium text-slate-700">{creatorDetails.phone}</p>
                          </div>
                        </div>
                      )}
                      {creatorDetails.subjects && creatorDetails.subjects.length > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Subjects</p>
                            <p className="text-sm font-medium text-slate-700">
                              {creatorDetails.subjects.map(s => typeof s === 'string' ? s : String(s)).join(', ')}
                            </p>
                          </div>
                        </div>
                      )}
                      {creatorDetails.classTeacherOf && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Users className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Class Teacher</p>
                            <p className="text-sm font-medium text-slate-700">
                              {typeof creatorDetails.classTeacherOf === 'string' 
                                ? `Class ${creatorDetails.classTeacherOf}`
                                : creatorDetails.classTeacherOf.class && creatorDetails.classTeacherOf.section
                                  ? `Class ${creatorDetails.classTeacherOf.class}-${creatorDetails.classTeacherOf.section}`
                                  : creatorDetails.classTeacherOf.class
                                    ? `Class ${creatorDetails.classTeacherOf.class}`
                                    : 'N/A'
                              }
                            </p>
                          </div>
                        </div>
                      )}
                      {creatorDetails.assignedClasses && creatorDetails.assignedClasses.length > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <GraduationCap className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Assigned Classes</p>
                            <p className="text-sm font-medium text-slate-700">
                              {creatorDetails.assignedClasses.map(ac => {
                                if (typeof ac === 'string') return ac
                                if (ac.class && ac.section) return `${ac.class}-${ac.section}`
                                if (ac.class) return ac.class
                                return ''
                              }).filter(Boolean).join(', ') || 'N/A'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                    <p className="text-sm text-slate-500 mt-4">Loading creator details...</p>
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

function NoticeCard({ 
  notice, 
  onDelete, 
  onViewCreator,
  getTargetDisplay,
  actionLoading 
}: { 
  notice: Notice
  onDelete: (id: string) => void
  onViewCreator: (notice: Notice) => void
  getTargetDisplay: (notice: Notice) => string
  actionLoading: string | null
}) {
  const statusBorderColors: Record<string, string> = {
    approved: 'border-l-green-500',
    pending: 'border-l-amber-500',
    rejected: 'border-l-red-500',
  }
  
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden`}>
      {/* Status Indicator Bar */}
      <div className={`h-1 bg-gradient-to-r ${
        notice.status === 'approved' ? 'from-green-400 to-emerald-500' :
        notice.status === 'pending' ? 'from-amber-400 to-orange-500' :
        notice.status === 'rejected' ? 'from-red-400 to-rose-500' :
        'from-slate-300 to-slate-400'
      }`} />
      
      <div className="p-6">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <TypeBadge type={notice.tag} />
          <PriorityBadge priority={notice.priority} />
          <StatusBadge status={notice.status} />
          <TargetBadge target={getTargetDisplay(notice)} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-800 mb-3 leading-tight">{notice.title}</h3>
        
        {/* Content */}
        <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap line-clamp-3 mb-5 bg-slate-50 p-4 rounded-xl">
          {notice.content}
        </p>

        {/* Metadata Section */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4 border-t border-slate-100 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <User className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <span className="font-medium">{notice.postedBy}</span>
            <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">{notice.postedByRole}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span>{new Date(notice.createdAt).toLocaleDateString('en-US', { 
              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}</span>
          </div>
          {notice.expiresAt && (
            <div className="flex items-center gap-2 text-slate-500">
              <div className="p-1.5 bg-orange-100 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <span>Expires: {new Date(notice.expiresAt).toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', year: 'numeric' 
              })}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={() => onViewCreator(notice)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <button
            onClick={() => onDelete(notice._id)}
            disabled={actionLoading === notice._id}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-100"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function PendingNoticeCard({ 
  notice, 
  onApprove, 
  onReject,
  onViewCreator,
  getTargetDisplay,
  actionLoading 
}: { 
  notice: Notice
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onViewCreator: (notice: Notice) => void
  getTargetDisplay: (notice: Notice) => string
  actionLoading: string | null
}) {
  return (
    <div className="bg-white rounded-2xl border border-amber-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Pending Status Bar */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 animate-pulse" />
      
      {/* Warning Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-3 flex items-center gap-3 border-b border-amber-100">
        <div className="p-2 bg-amber-500 rounded-xl shadow-sm">
          <Clock className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-700">Awaiting Your Approval</p>
          <p className="text-xs text-amber-600">Review this notice and take action</p>
        </div>
      </div>
      
      <div className="p-6">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <TypeBadge type={notice.tag} />
          <PriorityBadge priority={notice.priority} />
          <TargetBadge target={getTargetDisplay(notice)} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-800 mb-3 leading-tight">{notice.title}</h3>
        
        {/* Content */}
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mb-5 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
          {notice.content}
        </p>

        {/* Metadata Section */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4 border-t border-slate-100 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <User className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <span className="font-medium">{notice.postedBy}</span>
            <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">{notice.postedByRole}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span>{new Date(notice.createdAt).toLocaleDateString('en-US', { 
              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={() => onViewCreator(notice)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100"
          >
            <Eye className="w-4 h-4" />
            View Creator
          </button>
          <div className="flex-1" />
          <button
            onClick={() => onReject(notice._id)}
            disabled={actionLoading === notice._id}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
          <button
            onClick={() => onApprove(notice._id)}
            disabled={actionLoading === notice._id}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-md shadow-green-200 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </button>
        </div>
      </div>
    </div>
  )
}

function DeletedNoticeCard({ 
  notice, 
  onRestore,
  onViewCreator,
  getTargetDisplay,
  actionLoading 
}: { 
  notice: Notice
  onRestore: (id: string) => void
  onViewCreator: (notice: Notice) => void
  getTargetDisplay: (notice: Notice) => string
  actionLoading: string | null
}) {
  return (
    <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 border-dashed overflow-hidden opacity-85 hover:opacity-100 transition-all duration-300">
      {/* Deleted Status Bar */}
      <div className="h-1 bg-gradient-to-r from-slate-300 to-slate-400" />
      
      {/* Deleted Banner */}
      <div className="bg-slate-200/50 px-6 py-3 flex items-center gap-3 border-b border-slate-200">
        <div className="p-2 bg-slate-500 rounded-xl">
          <Archive className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-600">Deleted Notice</p>
          <p className="text-xs text-slate-500">This notice has been removed from public view</p>
        </div>
      </div>
      
      <div className="p-6">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <TypeBadge type={notice.tag} />
          <PriorityBadge priority={notice.priority} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-400 mb-3 leading-tight line-through">{notice.title}</h3>
        
        {/* Content */}
        <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap line-clamp-2 mb-5 bg-white/50 p-4 rounded-xl">
          {notice.content}
        </p>

        {/* Metadata Section */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4 border-t border-slate-200 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="p-1.5 bg-slate-200 rounded-lg">
              <User className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <span>{notice.postedBy}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </div>
            <span>Deleted: {notice.deletedAt ? new Date(notice.deletedAt).toLocaleDateString('en-US', { 
              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            }) : 'N/A'}</span>
          </div>
          {notice.deletedByRole && (
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${notice.deletedByRole === 'principal' ? 'bg-indigo-100' : 'bg-purple-100'}`}>
                <User className={`w-3.5 h-3.5 ${notice.deletedByRole === 'principal' ? 'text-indigo-600' : 'text-purple-600'}`} />
              </div>
              <span className={`text-sm font-medium ${notice.deletedByRole === 'principal' ? 'text-indigo-600' : 'text-purple-600'}`}>
                Deleted by: {notice.deletedByRole === 'principal' ? 'Principal' : 
                  notice.deletedByRole === 'teacher' ? `Teacher (${notice.postedBy})` : notice.deletedByRole}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={() => onViewCreator(notice)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <div className="flex-1" />
          <button
            onClick={() => onRestore(notice._id)}
            disabled={actionLoading === notice._id}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            Restore Notice
          </button>
        </div>
      </div>
    </div>
  )
}

function TypeBadge({ type }: { type?: string }) {
  const t = type || 'general'
  const config: Record<string, { bg: string; text: string; icon: string }> = {
    general: { bg: 'bg-slate-100', text: 'text-slate-700', icon: '📋' },
    academic: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📚' },
    event: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🎉' },
    holiday: { bg: 'bg-green-100', text: 'text-green-700', icon: '🌴' },
    exam: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '📝' },
    sports: { bg: 'bg-teal-100', text: 'text-teal-700', icon: '⚽' },
    urgent: { bg: 'bg-red-100', text: 'text-red-700', icon: '🚨' },
    fee: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '💰' },
    meeting: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '👥' },
  }
  const { bg, text, icon } = config[t] || config.general
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${bg} ${text} flex items-center gap-1`}>
      <span>{icon}</span>
      {t.charAt(0).toUpperCase() + t.slice(1)}
    </span>
  )
}

function PriorityBadge({ priority }: { priority?: string }) {
  const p = priority || 'normal'
  const config: Record<string, { bg: string; text: string; border: string }> = {
    general: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
    academic: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    event: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    holiday: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    exam: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    sports: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
    high: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    normal: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    urgent: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  }
  const { bg, text, border } = config[p] || config.normal
  
  const priorityIcon = p === 'urgent' ? '🔴' : p === 'high' ? '🟠' : p === 'normal' ? '🔵' : '⚪'
  
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${bg} ${text} border ${border} flex items-center gap-1`}>
      <span className="text-[10px]">{priorityIcon}</span>
      {p.toUpperCase()}
    </span>
  )
}

function TargetBadge({ target }: { target: string | { class?: string; section?: string; _id?: string } | undefined | null }) {
  // Ensure we always render a string
  let displayText = 'All Classes'
  if (typeof target === 'string') {
    displayText = target
  } else if (target && typeof target === 'object') {
    if (target.class && target.section) {
      displayText = `Class ${target.class}-${target.section}`
    } else if (target.class) {
      displayText = `Class ${target.class}`
    }
  }
  
  return (
    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
      <Users className="w-3.5 h-3.5" />
      {displayText}
    </span>
  )
}

function StatusBadge({ status }: { status?: string }) {
  const s = status || 'pending'
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    pending: { 
      bg: 'bg-amber-100', 
      text: 'text-amber-700',
      icon: <Clock className="w-3.5 h-3.5" />
    },
    approved: { 
      bg: 'bg-green-100', 
      text: 'text-green-700',
      icon: <CheckCircle className="w-3.5 h-3.5" />
    },
    rejected: { 
      bg: 'bg-red-100', 
      text: 'text-red-700',
      icon: <XCircle className="w-3.5 h-3.5" />
    },
  }
  const { bg, text, icon } = config[s] || config.pending
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${bg} ${text} flex items-center gap-1`}>
      {icon}
      {s.toUpperCase()}
    </span>
  )
}

function TabButton({ active, onClick, icon: Icon, label, badge }: { 
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
  badge?: number
}) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
      active 
        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
    }`}>
      <Icon className="w-4 h-4" />
      {label}
      {badge !== undefined && badge > 0 && (
        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
          active ? 'bg-white/25 text-white' : 'bg-amber-500 text-white animate-pulse'
        }`}>
          {badge}
        </span>
      )}
    </button>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  )
}
