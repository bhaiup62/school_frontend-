'use client'

import { useState, useEffect, useCallback } from 'react'
import ReceptionistLayout from '@/components/receptionist/ReceptionistLayout'
import { Calendar, Plus, Clock, CheckCircle, XCircle, ChevronDown, Filter, RefreshCw, AlertTriangle, X } from 'lucide-react'
import * as receptionistService from '@/services/receptionistService'

type LeaveRequest = receptionistService.LeaveRequest

const leaveTypes = [
  { value: 'casual', label: 'Casual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'earned', label: 'Earned Leave' },
  { value: 'other', label: 'Other' },
]

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-700 border-rose-200',
}

export default function ReceptionistLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [form, setForm] = useState({
    leaveType: 'casual' as 'casual' | 'sick' | 'earned' | 'other',
    fromDate: '',
    toDate: '',
    reason: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await receptionistService.getMyLeaveRequests()
      // Fix: Safely access data array from the backend response
      const records = res.data || []
      
      let filtered = records
      if (filterStatus) {
        filtered = records.filter((l: LeaveRequest) => l.status === filterStatus)
      }
      setLeaves(filtered)
    } catch (err) {
      console.error('Failed to load leaves:', err)
      setMessage({ type: 'error', text: 'Failed to load leave history.' })
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fromDate || !form.toDate || !form.reason) return

    setSubmitting(true)
    setMessage({ type: '', text: '' })
    try {
      await receptionistService.submitLeaveRequest(form)
      setShowNewModal(false)
      setForm({ leaveType: 'casual', fromDate: '', toDate: '', reason: '' })
      setMessage({ type: 'success', text: 'Leave request submitted successfully!' })
      loadData()
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    } catch (err: any) {
      console.error('Failed to submit leave:', err)
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit leave request' })
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

  return (
    <ReceptionistLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Global Message */}
        {message.text && !showNewModal && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 shadow-sm font-bold text-sm animate-in fade-in ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                <Calendar className="w-8 h-8" /> Leave Requests
              </h1>
              <p className="text-teal-100 font-medium">Apply for and track your personal leave balance</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={loadData} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white border border-white/20 backdrop-blur-sm shadow-sm" title="Refresh">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 px-5 py-3 bg-white text-teal-700 rounded-xl hover:bg-teal-50 transition-colors font-bold shadow-sm">
                <Plus className="w-5 h-5" /> Apply for Leave
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-2xl"><Calendar className="w-6 h-6 text-slate-600" /></div>
            <div>
              <p className="text-3xl font-display font-bold text-slate-800">{stats.total}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-2xl"><Clock className="w-6 h-6 text-amber-600" /></div>
            <div>
              <p className="text-3xl font-display font-bold text-amber-700">{stats.pending}</p>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Pending</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-2xl"><CheckCircle className="w-6 h-6 text-emerald-600" /></div>
            <div>
              <p className="text-3xl font-display font-bold text-emerald-700">{stats.approved}</p>
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Approved</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-rose-100 rounded-2xl"><XCircle className="w-6 h-6 text-rose-600" /></div>
            <div>
              <p className="text-3xl font-display font-bold text-rose-700">{stats.rejected}</p>
              <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Rejected</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex justify-end">
          <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 inline-flex items-center">
            <Filter className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-10 py-2.5 bg-transparent appearance-none text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-4 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Leave Requests List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
             <div className="p-16 text-center">
               <div className="animate-spin w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
             </div>
          ) : leaves.length === 0 ? (
            <div className="p-16 text-center">
              <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-1">No leave requests found</h3>
              <p className="text-slate-500 font-medium">You haven&apos;t applied for any leaves matching this filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {leaves.map((leave) => (
                <div key={leave._id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${statusColors[leave.status]}`}>
                        {leave.status}
                      </span>
                      <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                        {leave.leaveType.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-lg mb-2">
                      <Calendar className="w-5 h-5 text-teal-600" />
                      {new Date(leave.fromDate).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})} 
                      <span className="text-slate-400 mx-1">→</span> 
                      {new Date(leave.toDate).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}
                      <span className="ml-2 text-sm font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md">
                        {getDaysCount(leave.fromDate, leave.toDate)} Day(s)
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium text-slate-600 mb-3 line-clamp-2">{leave.reason}</p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span>Applied: {new Date(leave.createdAt).toLocaleDateString()}</span>
                      {leave.approvedAt && (
                        <span>Processed: {new Date(leave.approvedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {leave.rejectionReason && (
                    <div className="md:max-w-xs w-full bg-rose-50 border border-rose-100 p-4 rounded-2xl shrink-0">
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Rejection Reason
                      </p>
                      <p className="text-sm font-semibold text-rose-800">{leave.rejectionReason}</p>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Leave Modal */}
        {showNewModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
                <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-teal-600" /> Apply for Leave
                </h2>
                <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {message.text && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {message.text}
                  </div>
                )}
                
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Leave Type <span className="text-rose-500">*</span></label>
                  <select
                    value={form.leaveType}
                    onChange={(e) => setForm({ ...form, leaveType: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                  >
                    {leaveTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">From Date <span className="text-rose-500">*</span></label>
                    <input
                      type="date"
                      value={form.fromDate}
                      onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">To Date <span className="text-rose-500">*</span></label>
                    <input
                      type="date"
                      value={form.toDate}
                      onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                      min={form.fromDate}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                      required
                    />
                  </div>
                </div>

                {form.fromDate && form.toDate && (
                  <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-sm font-bold text-teal-700 flex items-center justify-between">
                    <span>Total Duration:</span>
                    <span className="text-lg">{getDaysCount(form.fromDate, form.toDate)} Day(s)</span>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Reason <span className="text-rose-500">*</span></label>
                  <textarea
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Please specify the reason for your leave..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowNewModal(false)}
                    className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-[2] bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-md shadow-teal-500/20">
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ReceptionistLayout>
  )
}