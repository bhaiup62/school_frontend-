'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getLeaveRequests, updateLeaveStatus, getStaffOnLeaveToday, getLeaveBalances } from '@/services/admin/leaveService'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useToast } from '@/components/ui/ToastProvider'
import { CalendarOff, Clock, CheckCircle2, XCircle, History, Scale, Users, CalendarDays, FileText } from 'lucide-react'

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function LeaveManagementPage() {
  const { handleError } = useErrorHandler()
  const toast = useToast()

  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'balances'>('pending')
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  // NEW: Balance Filter State
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'has_balance' | 'zero_balance'>('all')

  // Data States
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [historyRequests, setHistoryRequests] = useState<any[]>([])
  const [onLeaveToday, setOnLeaveToday] = useState<any[]>([])
  const [balances, setBalances] = useState<any[]>([])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [pendingRes, historyRes, todayRes, balancesRes] = await Promise.all([
        getLeaveRequests({ status: 'Pending' }),
        getLeaveRequests(), // Fetch all for history (we'll filter out pending in UI)
        getStaffOnLeaveToday(),
        getLeaveBalances()
      ])

      setPendingRequests(pendingRes.data || [])
      setHistoryRequests((historyRes.data || []).filter((req: any) => req.status !== 'Pending'))
      setOnLeaveToday(todayRes.data || [])
      setBalances(balancesRes.data || [])
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleStatusAction = async (id: string, action: 'Approved' | 'Rejected') => {
    let remarks = ''
    if (action === 'Rejected') {
      const input = window.prompt("Reason for rejection (Optional):")
      if (input === null) return // Cancelled prompt
      remarks = input
    } else {
      if (!window.confirm("Approve this leave request? This will deduct the days from their balance.")) return
    }

    setProcessingId(id)
    try {
      await updateLeaveStatus(id, action, remarks)
      toast.success(`Leave request ${action} successfully!`)
      fetchDashboardData() // Refresh everything
    } catch (error) {
      handleError(error)
    } finally {
      setProcessingId(null)
    }
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'Sick': return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'Casual': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Earned': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Maternity': return 'bg-purple-50 text-purple-700 border-purple-200'
      default: return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  // ── FILTER LOGIC FOR BALANCES ──
  const filteredBalances = balances.filter(bal => {
    const clLeft = (bal.casualLeaves?.total || 0) - (bal.casualLeaves?.used || 0)
    const slLeft = (bal.sickLeaves?.total || 0) - (bal.sickLeaves?.used || 0)
    const elLeft = (bal.earnedLeaves?.total || 0) - (bal.earnedLeaves?.used || 0)
    const totalLeft = clLeft + slLeft + elLeft

    if (balanceFilter === 'has_balance') return totalLeft > 0
    if (balanceFilter === 'zero_balance') return totalLeft <= 0
    return true
  })

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarOff className="w-6 h-6 text-indigo-600" /> Staff Leave Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review requests, track attendance, and manage HR leave balances.</p>
        </div>

        {/* KPI Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-sm text-white flex items-center justify-between">
            <div>
              <p className="text-indigo-100 font-bold uppercase tracking-wider text-xs mb-1">Pending Approvals</p>
              <h2 className="text-4xl font-black">{pendingRequests.length}</h2>
              <p className="text-indigo-100 text-sm mt-1">Awaiting your review</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">On Leave Today</p>
              <h2 className="text-4xl font-black text-slate-800">{onLeaveToday.length}</h2>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Staff currently absent
              </p>
            </div>
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
              <CalendarDays className="w-8 h-8 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-2 overflow-x-auto">
            <button onClick={() => setActiveTab('pending')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'pending' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
              <Clock className="w-4 h-4" /> Pending Requests
              {pendingRequests.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingRequests.length}</span>}
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
              <History className="w-4 h-4" /> Leave History
            </button>
            <button onClick={() => setActiveTab('balances')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'balances' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
              <Scale className="w-4 h-4" /> Leave Balances
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
            ) : (
              <>
                {/* ── TAB 1: PENDING ── */}
                {activeTab === 'pending' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {pendingRequests.length === 0 ? (
                      <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                        <h3 className="font-bold text-lg text-slate-700">All caught up!</h3>
                        <p className="text-sm mt-1">There are no pending leave requests to review.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {pendingRequests.map(req => (
                          <div key={req._id} className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition-colors shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                  {req.staffId?.admissionNumber || 'Unknown Staff'}
                                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${getLeaveTypeColor(req.leaveType)}`}>
                                    {req.leaveType}
                                  </span>
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{req.staffId?.role}</p>
                              </div>
                              <div className="text-right">
                                <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Pending</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Dates</p>
                                <p className="text-sm font-semibold text-slate-800">{formatDate(req.startDate)} - {formatDate(req.endDate)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Days</p>
                                <p className="text-sm font-semibold text-slate-800">{req.totalDays} Days</p>
                              </div>
                            </div>

                            <div className="mb-5">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Reason</p>
                              <p className="text-sm text-slate-700 bg-white border border-slate-200 p-3 rounded-xl italic">"{req.reason}"</p>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                              <button 
                                onClick={() => handleStatusAction(req._id, 'Approved')}
                                disabled={processingId === req._id}
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Approve
                              </button>
                              <button 
                                onClick={() => handleStatusAction(req._id, 'Rejected')}
                                disabled={processingId === req._id}
                                className="flex-1 flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" /> Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB 2: HISTORY ── */}
                {activeTab === 'history' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-4">Staff ID</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Dates & Days</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Processed By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {historyRequests.length === 0 ? (
                          <tr><td colSpan={5} className="p-8 text-center text-slate-500">No leave history found.</td></tr>
                        ) : (
                          historyRequests.map((req, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-4 font-bold text-slate-800">{req.staffId?.admissionNumber || '-'}</td>
                              <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getLeaveTypeColor(req.leaveType)}`}>{req.leaveType}</span></td>
                              <td className="p-4">
                                <p className="font-semibold text-slate-700">{formatDate(req.startDate)} to {formatDate(req.endDate)}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{req.totalDays} Days</p>
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <p className="font-semibold text-slate-700">{req.approvedBy?.admissionNumber || 'Admin'}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(req.updatedAt)}</p>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ── TAB 3: BALANCES ── */}
                {activeTab === 'balances' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* NEW FILTER DROPDOWN */}
                    <div className="mb-4 flex justify-end">
                      <select 
                        value={balanceFilter}
                        onChange={(e: any) => setBalanceFilter(e.target.value)}
                        className="border border-slate-200 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500"
                      >
                        <option value="all">All Staff</option>
                        <option value="has_balance">Has Balance Left</option>
                        <option value="zero_balance">Out of Leaves (Zero Balance)</option>
                      </select>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-4">Staff ID</th>
                            <th className="p-4 text-center border-l border-slate-200">Casual Leave (CL)</th>
                            <th className="p-4 text-center border-l border-slate-200">Sick Leave (SL)</th>
                            <th className="p-4 text-center border-l border-slate-200">Earned Leave (EL)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredBalances.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-500">No balance records found for this filter.</td></tr>
                          ) : (
                            filteredBalances.map((bal, idx) => {
                              const clLeft = (bal.casualLeaves?.total || 0) - (bal.casualLeaves?.used || 0)
                              const slLeft = (bal.sickLeaves?.total || 0) - (bal.sickLeaves?.used || 0)
                              const elLeft = (bal.earnedLeaves?.total || 0) - (bal.earnedLeaves?.used || 0)

                              return (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="p-4 font-bold text-slate-800">{bal.staffId?.admissionNumber || 'Unknown'}</td>
                                  
                                  <td className={`p-4 text-center border-l border-slate-100 ${clLeft === 0 ? 'bg-rose-50/50' : ''}`}>
                                    <p className={`text-lg font-black ${clLeft === 0 ? 'text-rose-500' : 'text-blue-600'}`}>{clLeft}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Left of {bal.casualLeaves?.total || 0}</p>
                                  </td>
                                  <td className={`p-4 text-center border-l border-slate-100 ${slLeft === 0 ? 'bg-rose-50/50' : ''}`}>
                                    <p className={`text-lg font-black ${slLeft === 0 ? 'text-rose-500' : 'text-rose-600'}`}>{slLeft}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Left of {bal.sickLeaves?.total || 0}</p>
                                  </td>
                                  <td className={`p-4 text-center border-l border-slate-100 ${elLeft === 0 ? 'bg-rose-50/50' : ''}`}>
                                    <p className={`text-lg font-black ${elLeft === 0 ? 'text-rose-500' : 'text-emerald-600'}`}>{elLeft}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Left of {bal.earnedLeaves?.total || 0}</p>
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}