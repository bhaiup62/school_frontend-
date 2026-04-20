// src/app/teacher-dashboard/complaints/page.tsx

'use client'

import { useState, useEffect } from 'react'
import TeacherLayout from '@/components/teacher/TeacherLayout'
import { 
  MessageSquare, Plus, Clock, CheckCircle, AlertCircle, 
  Send, ChevronDown, Filter, Search, X, RefreshCw, Ticket, FileText
} from 'lucide-react'
import * as teacherService from '@/services/teacherService'

type Complaint = teacherService.Complaint

// STRICTLY MATCHES NEW SCHEMA
const categoryOptions = [
  { value: 'academic', label: 'Academic Issues' },
  { value: 'infrastructure', label: 'Infrastructure & Facilities' },
  { value: 'behavioral', label: 'Student Behavioral' },
  { value: 'staff', label: 'Staff/Colleague Issues' },
  { value: 'transport', label: 'Transport' },
  { value: 'fees', label: 'Fees & Accounts' },
  { value: 'safety', label: 'Safety & Security' },
  { value: 'bullying', label: 'Bullying' },
  { value: 'other', label: 'Other' },
]

// STRICTLY MATCHES NEW SCHEMA
const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-700' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-rose-100 text-rose-700' },
]

export default function TeacherComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // DEFAULTING TO NEW SCHEMA VALUES
  const [form, setForm] = useState({
    category: 'infrastructure',
    subject: '',
    description: '',
    relatedStudent: '',
    priority: 'medium',
  })

  useEffect(() => {
    loadData()
  }, [filterStatus])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await teacherService.getMyComplaints({ status: filterStatus || undefined })
      setComplaints(res.data || [])
    } catch (err) {
      console.error('Failed to load complaints:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject || !form.description) return

    setSubmitting(true)
    try {
      await teacherService.submitComplaint(form)
      setShowNewModal(false)
      // RESET TO NEW SCHEMA VALUES
      setForm({
        category: 'infrastructure',
        subject: '',
        description: '',
        relatedStudent: '',
        priority: 'medium',
      })
      loadData()
    } catch (err) {
      console.error('Failed to submit complaint:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddComment = async () => {
    if (!selectedComplaint || !newComment.trim()) return

    setSubmitting(true)
    try {
      const res = await teacherService.addComplaintComment(selectedComplaint.ticketNumber, newComment)
      setSelectedComplaint(res.data)
      setNewComment('')
      loadData()
    } catch (err) {
      console.error('Failed to add comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredComplaints = complaints.filter(c =>
    c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
  }

  if (loading && complaints.length === 0) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600" />
          </div>
        </div>
      </TeacherLayout>
    )
  }

  return (
    <TeacherLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold flex items-center gap-3">
                <Ticket className="w-7 h-7" />
                Grievances & Complaints
              </h2>
              <p className="text-purple-100 mt-1">Submit and track official complaints to administration</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={loadData} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white border border-white/20 backdrop-blur-sm" title="Refresh">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 rounded-xl hover:bg-purple-50 transition font-bold shadow-sm">
                <Plus className="w-5 h-5" /> New Complaint
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Total Raised" value={stats.total} color="purple" />
          <StatCard icon={AlertCircle} label="Open" value={stats.open} color="rose" />
          <StatCard icon={Clock} label="In Progress" value={stats.inProgress} color="amber" />
          <StatCard icon={CheckCircle} label="Resolved" value={stats.resolved} color="emerald" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search by Ticket # or Subject..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all" />
            </div>
            <div className="relative w-full sm:w-auto shrink-0 flex items-center gap-3">
              <Filter className="w-5 h-5 text-purple-600 hidden sm:block" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-48 pl-4 pr-8 py-2.5 border border-slate-200 rounded-xl appearance-none bg-slate-50 text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all">
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Complaints List */}
        {filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 text-center py-20">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <MessageSquare className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-700 mb-2">No complaints found</h3>
            <p className="text-slate-500 font-medium">You haven't submitted any complaints matching this criteria.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredComplaints.map((complaint) => (
                <div key={complaint._id} onClick={() => setSelectedComplaint(complaint)}
                  className="p-5 hover:bg-slate-50 cursor-pointer transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">{complaint.ticketNumber}</span>
                      <StatusBadge status={complaint.status} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200 px-2 py-0.5 rounded bg-white">
                        {complaint.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg truncate group-hover:text-purple-700 transition-colors">{complaint.subject}</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-1">{complaint.description}</p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <PriorityBadge priority={complaint.priority} />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Complaint Modal */}
        {showNewModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
              
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-white shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl border border-white/20">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold">Raise a Complaint</h3>
                    <p className="text-purple-100 text-sm font-medium">Submit to school administration</p>
                  </div>
                </div>
                <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category *</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 transition-all">
                      {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority Level *</label>
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 transition-all">
                      {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject *</label>
                  <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief summary of the issue"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 transition-all" required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detailed Description *</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Provide full details here..." rows={5}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-purple-500 transition-all resize-none" required />
                </div>

                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl">
                  <label className="block text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">Related Student ID (Optional)</label>
                  <input type="text" value={form.relatedStudent} onChange={(e) => setForm({ ...form, relatedStudent: e.target.value })} placeholder="e.g., SPS-2025-001"
                    className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all" />
                  <p className="text-[10px] text-indigo-600 font-medium mt-2">Only fill this if the complaint is specifically regarding a student.</p>
                </div>

                <div className="pt-4 flex gap-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowNewModal(false)}
                    className="flex-1 px-6 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition font-bold shadow-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting || !form.subject || !form.description}
                    className="flex-[2] flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-bold disabled:opacity-50 shadow-md shadow-purple-500/20">
                    <Send className="w-5 h-5" /> {submitting ? 'Submitting...' : 'Submit Complaint'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Complaint Detail Modal */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              
              {/* Header */}
              <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex items-start justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-100 px-2.5 py-0.5 rounded uppercase tracking-wider">{selectedComplaint.ticketNumber}</span>
                    <StatusBadge status={selectedComplaint.status} />
                    <PriorityBadge priority={selectedComplaint.priority} />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-slate-800">{selectedComplaint.subject}</h2>
                </div>
                <button onClick={() => setSelectedComplaint(null)} className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-sm">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-slate-50/50">
                
                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Original Description</h3>
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedComplaint.description}
                  </div>
                </div>

                {/* Resolution Block (TypeScript Fix Applied) */}
                {(selectedComplaint as any).resolution?.summary && (
                  <div>
                    <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Official Resolution
                    </h3>
                    <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-emerald-800 text-sm leading-relaxed font-medium">
                      {(selectedComplaint as any).resolution.summary}
                    </div>
                  </div>
                )}

                {/* Communication Thread (TypeScript Fix Applied) */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Communication Thread</h3>
                  <div className="space-y-4">
                    {selectedComplaint.comments.map((comment: any, i) => {
                      const isTeacher = comment.authorRole === 'teacher'
                      return (
                        <div key={i} className={`flex flex-col ${isTeacher ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-2xl ${
                            isTeacher 
                              ? 'bg-purple-600 text-white rounded-tr-sm shadow-md shadow-purple-200' 
                              : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                          }`}>
                            <p className="text-sm font-medium">{comment.message}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 px-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{comment.authorName} ({comment.authorRole})</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] font-bold text-slate-400">{new Date(comment.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                        </div>
                      )
                    })}
                    {selectedComplaint.comments.length === 0 && (
                      <p className="text-center text-sm font-medium text-slate-400 py-4 italic">No comments yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Add Comment Footer */}
              {selectedComplaint.status !== 'closed' && selectedComplaint.status !== 'resolved' && (
                <div className="p-6 bg-white border-t border-slate-200 shrink-0">
                  <div className="flex gap-3">
                    <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Type a follow-up comment..."
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment() }} />
                    <button onClick={handleAddComment} disabled={!newComment.trim() || submitting}
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2">
                      <Send className="w-4 h-4" /> Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}

// ---------------------------------------------------------
// Sub-components
// ---------------------------------------------------------

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: 'purple' | 'amber' | 'emerald' | 'rose' }) {
  const styles = {
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${styles[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string, text: string }> = {
    open: { bg: 'bg-amber-100', text: 'text-amber-800' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-800' },
    resolved: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    closed: { bg: 'bg-slate-200', text: 'text-slate-700' },
  }
  const style = config[status] || config.open
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { bg: string, text: string, border: string }> = {
    low: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' },
    medium: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    high: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    urgent: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
  }
  const style = config[priority] || config.medium
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
      {priority} Priority
    </span>
  )
}