'use client'
import { useEffect, useState } from 'react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import { Wallet, AlertTriangle, ChevronLeft, ChevronRight, X, CheckCircle, Ban, Eye, IndianRupee, Users, TrendingUp, Download, Filter, RefreshCw } from 'lucide-react'
import * as principalService from '@/services/principalService'

const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600" />
      <Wallet className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  </div>
)

export default function FinancePage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<principalService.FinanceSummary | null>(null)
  const [defaulters, setDefaulters] = useState<principalService.Defaulter[]>([])
  const [classWise, setClassWise] = useState<any[]>([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState({ class: '', minAmount: 0 })
  const [selectedDefaulters, setSelectedDefaulters] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [studentFees, setStudentFees] = useState<principalService.FeeRecord[]>([])
  const [selectedStudent, setSelectedStudent] = useState<principalService.Defaulter | null>(null)

  useEffect(() => { loadData() }, [filters.class, filters.minAmount, pagination.page])

  const loadData = async () => {
    setLoading(true)
    try {
      const [summaryRes, defaultersRes, classWiseRes] = await Promise.all([
        principalService.getFinanceSummary(),
        principalService.getDefaulters({ class: filters.class || undefined, minAmount: filters.minAmount || undefined, page: pagination.page, limit: 20 }),
        principalService.getClassWiseSummary()
      ])
      setSummary(summaryRes.data || null)
      setDefaulters(defaultersRes.data || [])
      setPagination(p => ({ ...p, pages: defaultersRes.pagination?.pages || 1, total: defaultersRes.pagination?.total || 0 }))
      setClassWise(classWiseRes.data || [])
    } catch (error) { console.error('Error:', error) }
    finally { setLoading(false) }
  }

  const viewStudentFees = async (defaulter: principalService.Defaulter) => {
    setSelectedStudent(defaulter)
    try {
      const res = await principalService.getStudentFees(defaulter.student.admissionNumber)
      setStudentFees(res.data || [])
      setShowStudentModal(true)
    } catch (error) { console.error('Error:', error) }
  }

  const toggleRestriction = async (feeId: string, currentRestrict: boolean) => {
    setSaving(true)
    try {
      await principalService.toggleReportCardRestriction(feeId, !currentRestrict)
      setMessage({ type: 'success', text: `Report card ${!currentRestrict ? 'restricted' : 'unrestricted'}` })
      loadData()
      if (selectedStudent) {
        const res = await principalService.getStudentFees(selectedStudent.student.admissionNumber)
        setStudentFees(res.data || [])
      }
    } catch (error: any) { setMessage({ type: 'error', text: error.response?.data?.message || 'Failed' }) }
    finally { setSaving(false) }
  }

  const handleBulkRestrict = async (restrict: boolean) => {
    if (!selectedDefaulters.length) { setMessage({ type: 'error', text: 'Select defaulters first' }); return }
    setSaving(true)
    try {
      const res = await principalService.bulkRestrictReportCards(selectedDefaulters, restrict)
      setMessage({ type: 'success', text: `${res.affectedCount} students ${restrict ? 'restricted' : 'unrestricted'}` })
      setSelectedDefaulters([])
      loadData()
    } catch (error: any) { setMessage({ type: 'error', text: error.response?.data?.message || 'Failed' }) }
    finally { setSaving(false) }
  }

  const toggleSelectAll = () => {
    if (selectedDefaulters.length === defaulters.length) {
      setSelectedDefaulters([])
    } else {
      setSelectedDefaulters(defaulters.map(d => d.student.admissionNumber))
    }
  }

  const formatCurrency = (amount?: number) => `₹${(amount || 0).toLocaleString('en-IN')}`

  return (
    <PrincipalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Wallet className="w-7 h-7" />
                Finance & Defaulters
              </h2>
              <p className="text-indigo-100 mt-1">Monitor fee collection and manage defaulters</p>
            </div>
            <button
              onClick={() => loadData()}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white self-start"
              title="Refresh"
            >
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
        {summary && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <IndianRupee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{formatCurrency(summary.totalCollection)}</div>
                  <div className="text-sm text-slate-500">Total Collection</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{formatCurrency(summary.pendingAmount)}</div>
                  <div className="text-sm text-slate-500">Pending Amount</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{summary.defaultersCount}</div>
                  <div className="text-sm text-slate-500">Defaulters</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Ban className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{summary.restrictedCount}</div>
                  <div className="text-sm text-slate-500">Restricted</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Class-wise Summary */}
        {classWise.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow">
                  <IndianRupee className="w-4 h-4 text-white" />
                </div>
                Class-wise Fee Summary
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-white">Class</th>
                    <th className="px-4 py-3 text-center font-semibold text-white">Students</th>
                    <th className="px-4 py-3 text-center font-semibold text-white">Paid</th>
                    <th className="px-4 py-3 text-center font-semibold text-white">Pending</th>
                    <th className="px-4 py-3 text-center font-semibold text-white">Defaulters</th>
                    <th className="px-4 py-3 text-right font-semibold text-white">Due Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classWise.map(item => (
                    <tr key={item.class} className="hover:bg-indigo-50/30 transition">
                      <td className="px-4 py-3 font-semibold text-slate-800">Class {item.class}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{item.totalStudents}</td>
                      <td className="px-4 py-3 text-center"><span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">{item.paidCount}</span></td>
                      <td className="px-4 py-3 text-center"><span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">{item.pendingCount}</span></td>
                      <td className="px-4 py-3 text-center"><span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold">{item.defaultersCount}</span></td>
                      <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(item.totalDue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filters & Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Filter className="w-5 h-5" />
              <span className="font-medium text-sm">Filters:</span>
            </div>
            <select value={filters.class} onChange={e => setFilters(f => ({ ...f, class: e.target.value }))} className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <option value="">All Classes</option>
              {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
            <select value={filters.minAmount} onChange={e => setFilters(f => ({ ...f, minAmount: parseInt(e.target.value) }))} className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <option value="0">Any Amount</option>
              <option value="1000">₹1,000+</option>
              <option value="5000">₹5,000+</option>
              <option value="10000">₹10,000+</option>
            </select>
            {selectedDefaulters.length > 0 && (
              <div className="flex gap-2 ml-auto">
                <button onClick={() => handleBulkRestrict(true)} disabled={saving} className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl text-sm font-semibold hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-500/25 disabled:opacity-50 transition">
                  <Ban className="w-4 h-4 inline mr-1.5" /> Restrict ({selectedDefaulters.length})
                </button>
                <button onClick={() => handleBulkRestrict(false)} disabled={saving} className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/25 disabled:opacity-50 transition">
                  <CheckCircle className="w-4 h-4 inline mr-1.5" /> Unrestrict
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Defaulters Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center shadow">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              Fee Defaulters List
            </h3>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : defaulters.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle className="w-16 h-16 text-green-200 mx-auto mb-3" />
              <p className="text-lg font-medium text-slate-400">No defaulters found!</p>
              <p className="text-sm text-slate-400 mt-1">All students have cleared their fees</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input type="checkbox" checked={selectedDefaulters.length === defaulters.length} onChange={toggleSelectAll} className="w-4 h-4 rounded border-white/30" />
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Student</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Class</th>
                    <th className="px-4 py-3 text-right font-semibold text-white">Total Due</th>
                    <th className="px-4 py-3 text-center font-semibold text-white">Overdue Days</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Parent Phone</th>
                    <th className="px-4 py-3 text-center font-semibold text-white">Restricted</th>
                    <th className="px-4 py-3 text-center font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {defaulters.map(defaulter => (
                    <tr key={defaulter.student.admissionNumber} className="hover:bg-indigo-50/30 transition">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedDefaulters.includes(defaulter.student.admissionNumber)} onChange={e => setSelectedDefaulters(e.target.checked ? [...selectedDefaulters, defaulter.student.admissionNumber] : selectedDefaulters.filter(id => id !== defaulter.student.admissionNumber))} className="w-4 h-4 rounded border-slate-300" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{defaulter.student.name}</div>
                        <div className="text-xs text-slate-500">{defaulter.student.admissionNumber}</div>
                      </td>
                      <td className="px-4 py-3"><span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold">{defaulter.student.class}-{defaulter.student.section}</span></td>
                      <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(defaulter.totalDue)}</td>
                      <td className="px-4 py-3 text-center"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${defaulter.overdueBy > 30 ? 'bg-red-100 text-red-700' : defaulter.overdueBy > 15 ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'}`}>{defaulter.overdueBy} DAYS</span></td>
                      <td className="px-4 py-3 text-slate-600">{defaulter.student.parentPhone || '-'}</td>
                      <td className="px-4 py-3 text-center">{defaulter.restrictReportCard ? <Ban className="w-5 h-5 text-red-500 mx-auto" /> : <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => viewStudentFees(defaulter)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-xl transition"><Eye className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pagination.pages > 1 && (
            <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-sm text-slate-500">Page {pagination.page} of {pagination.pages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1} className="p-2 rounded-xl border border-slate-200 hover:bg-white hover:border-indigo-300 disabled:opacity-50 transition"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.pages} className="p-2 rounded-xl border border-slate-200 hover:bg-white hover:border-indigo-300 disabled:opacity-50 transition"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>

        {/* Student Fees Modal */}
        {showStudentModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowStudentModal(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div className="text-white">
                  <h2 className="text-lg font-bold">{selectedStudent.student.name}</h2>
                  <p className="text-sm text-indigo-100">{selectedStudent.student.admissionNumber} | Class {selectedStudent.student.class}-{selectedStudent.student.section}</p>
                </div>
                <button onClick={() => setShowStudentModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6">
                <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-5 mb-6 border border-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-red-600 font-medium">Total Outstanding</span>
                      <div className="text-2xl font-bold text-red-700">{formatCurrency(selectedStudent.totalDue)}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-red-600 font-medium">Overdue</span>
                      <div className="text-lg font-bold text-red-700">{selectedStudent.overdueBy} days</div>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-indigo-600" />
                  Fee Records
                </h3>
                <div className="space-y-3">
                  {studentFees.map(fee => (
                    <div key={fee._id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-semibold text-slate-800 capitalize">{fee.feeType.replace('_', ' ')} Fee</span>
                          <span className="text-sm text-slate-500 ml-2">({fee.academicYear})</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${fee.status === 'paid' ? 'bg-green-100 text-green-700' : fee.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{fee.status}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div><span className="text-slate-500">Total:</span> <span className="font-semibold">{formatCurrency(fee.totalAmount)}</span></div>
                        <div><span className="text-slate-500">Paid:</span> <span className="font-semibold text-green-600">{formatCurrency(fee.paidAmount)}</span></div>
                        <div><span className="text-slate-500">Due:</span> <span className="font-semibold text-red-600">{formatCurrency(fee.dueAmount)}</span></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-500">Due: {new Date(fee.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <button onClick={() => toggleRestriction(fee._id, fee.restrictReportCard)} disabled={saving} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${fee.restrictReportCard ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                          {fee.restrictReportCard ? 'Remove Restriction' : 'Restrict Report Card'}
                        </button>
                      </div>
                      {fee.restrictReportCard && <div className="mt-3 text-xs text-red-600 flex items-center gap-1 bg-red-50 px-3 py-2 rounded-lg"><Ban className="w-3 h-3" /> Report card restricted</div>}
                    </div>
                  ))}
                  {!studentFees.length && <p className="text-center text-slate-400 py-8">No fee records found</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PrincipalLayout>
  )
}
