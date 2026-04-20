// src/app/teacher-dashboard/leaves/page.tsx

'use client'

import { useState, useEffect } from 'react'
import TeacherLayout from '@/components/teacher/TeacherLayout'
import { 
  Calendar, Plus, Clock, CheckCircle, XCircle, 
  Filter, CalendarRange, Send, X, AlertTriangle, FileText, RefreshCw
} from 'lucide-react'
import * as teacherService from '@/services/teacherService'

type LeaveRequest = teacherService.LeaveRequest

const leaveTypes = [
  { value: 'casual', label: 'Casual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'earned', label: 'Earned Leave' },
  { value: 'other', label: 'Other / Special Leave' },
]

export default function TeacherLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    leaveType: 'casual',
    fromDate: '',
    toDate: '',
    reason: '',
  })

  useEffect(() => {
    loadData()
  }, [filterStatus])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await teacherService.getMyLeaveRequests({ status: filterStatus || undefined })
      setLeaves(res.data || [])
    } catch (err) {
      console.error('Failed to load leaves:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fromDate || !form.toDate || !form.reason) return

    setSubmitting(true)
    try {
      await teacherService.submitLeaveRequest(form)
      setShowNewModal(false)
      setForm({
        leaveType: 'casual',
        fromDate: '',
        toDate: '',
        reason: '',
      })
      loadData()
    } catch (err) {
      console.error('Failed to submit leave:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const getDaysCount = (from: string, to: string) => {
    const start = new Date(from)
    const end = new Date(to)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    return diff > 0 ? diff : 0
  }

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  }

  if (loading && leaves.length === 0) {
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
                <CalendarRange className="w-7 h-7" />
                Leave Requests
              </h2>
              <p className="text-purple-100 mt-1">Apply for leave and track approval status</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={loadData} 
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white border border-white/20 backdrop-blur-sm" 
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowNewModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 rounded-xl hover:bg-purple-50 transition font-bold shadow-sm"
              >
                <Plus className="w-5 h-5" /> Apply for Leave
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Total Requests" value={stats.total} color="purple" />
          <StatCard icon={Clock} label="Pending Approval" value={stats.pending} color="amber" />
          <StatCard icon={CheckCircle} label="Approved" value={stats.approved} color="emerald" />
          <StatCard icon={XCircle} label="Rejected" value={stats.rejected} color="rose" />
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600 shrink-0">
              <Filter className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-sm text-slate-800">Filter History:</span>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-500 transition-all text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Leave Requests Feed */}
        {leaves.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 text-center py-20">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <CalendarRange className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-700 mb-2">No leave requests found</h3>
            <p className="text-slate-500 font-medium">
              {filterStatus ? `You have no ${filterStatus} leave requests.` : "You haven't applied for any leaves yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {leaves.map((leave) => (
              <LeaveCard key={leave._id} leave={leave} getDaysCount={getDaysCount} />
            ))}
          </div>
        )}

        {/* New Leave Modal */}
        {showNewModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
              
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-white shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl border border-white/20">
                    <CalendarRange className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold">Apply for Leave</h3>
                    <p className="text-purple-100 text-sm font-medium">Submit a request to the Principal</p>
                  </div>
                </div>
                <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Leave Type *</label>
                  <select
                    value={form.leaveType}
                    onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                  >
                    {leaveTypes.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">From Date *</label>
                    <input
                      type="date"
                      value={form.fromDate}
                      onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">To Date *</label>
                    <input
                      type="date"
                      value={form.toDate}
                      onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                      min={form.fromDate}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                {form.fromDate && form.toDate && (
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3 text-indigo-800">
                    <Clock className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span className="text-sm font-bold">
                      Duration: {getDaysCount(form.fromDate, form.toDate)} Day(s) Requested
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reason for Leave *</label>
                  <textarea
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Please explain the reason for your leave..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none"
                    required
                  />
                </div>

                <div className="pt-4 flex gap-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowNewModal(false)}
                    className="flex-1 px-6 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition font-bold shadow-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting || !form.fromDate || !form.toDate || !form.reason}
                    className="flex-[2] flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-bold disabled:opacity-50 shadow-md shadow-purple-500/20">
                    <Send className="w-5 h-5" />
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
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

function LeaveCard({ leave, getDaysCount }: { leave: LeaveRequest; getDaysCount: (from: string, to: string) => number }) {
  const statusConfig = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: <Clock className="w-4 h-4" /> },
    approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircle className="w-4 h-4" /> },
    rejected: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', icon: <XCircle className="w-4 h-4" /> },
  }
  
  const status = statusConfig[leave.status as keyof typeof statusConfig] || statusConfig.pending

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
      <div className={`h-1.5 w-full bg-gradient-to-r ${
        leave.status === 'approved' ? 'from-emerald-400 to-green-500' :
        leave.status === 'pending' ? 'from-amber-400 to-orange-500' : 'from-rose-400 to-red-500'
      }`} />
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider rounded-lg border border-slate-200 shadow-sm">
              {leave.leaveType} Leave
            </span>
          </div>
          <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ${status.bg} ${status.text} ${status.border}`}>
            {status.icon} {leave.status}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
            <Calendar className="w-4 h-4 text-purple-600" />
            {new Date(leave.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
            {' '} — {' '}
            {new Date(leave.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-6">
            Duration: {getDaysCount(leave.fromDate.toString(), leave.toDate.toString())} Day(s)
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
          <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
            "{leave.reason}"
          </p>
        </div>

        {leave.rejectionReason && (
          <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl mb-4 flex items-start gap-2 text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-bold block text-xs uppercase tracking-wider mb-0.5">Rejection Reason</span>
              <span className="font-medium">{leave.rejectionReason}</span>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Applied: {new Date(leave.createdAt).toLocaleDateString()}</span>
          {leave.approvedAt && (
            <span className={leave.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}>
              Processed: {new Date(leave.approvedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}