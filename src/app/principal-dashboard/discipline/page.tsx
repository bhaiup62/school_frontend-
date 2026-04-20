'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import {
  Shield, AlertTriangle, Search, Edit2, Plus,
  ChevronLeft, ChevronRight, X, CheckCircle, Clock, User
} from 'lucide-react'
import * as principalService from '@/services/principalService'
import { DISCIPLINE_CATEGORIES } from '@/services/principalService'

const INCIDENT_TYPES = ['minor', 'moderate', 'severe', 'critical']
const STATUS_OPTIONS = ['pending', 'under_review', 'resolved', 'escalated']
const ACTION_OPTIONS = ['warning', 'detention', 'suspension', 'rustication', 'counseling', 'parent_meeting', 'other']

// Helper for safe error extraction
const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    return axiosError.response?.data?.message || 'An error occurred'
  }
  return error instanceof Error ? error.message : 'An error occurred'
}

export default function DisciplinePage() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<principalService.DisciplinaryRecord[]>([])
  const [summary, setSummary] = useState<principalService.DisciplineSummary | null>(null)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState({ incidentType: '', status: '', search: '' })
  const [selectedRecord, setSelectedRecord] = useState<principalService.DisciplinaryRecord | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    actionTaken: '', actionDetails: '', suspensionDays: 0, principalRemarks: '', parentNotified: false, status: ''
  })
  // FIX #1: Added 'category' field to createForm
  const [createForm, setCreateForm] = useState({
    studentAdmissionNumber: '', incidentDate: new Date().toISOString().split('T')[0],
    incidentType: 'minor', category: '' as principalService.DisciplineCategory | '', 
    description: '', location: '', witnesses: '',
    actionTaken: '', actionDetails: '', suspensionDays: 0, principalRemarks: '', parentNotified: false
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // FIX #2: AbortController ref for race condition prevention
  const abortControllerRef = useRef<AbortController | null>(null)

  // FIX #2: loadData with AbortController - cancels previous request on new call
  const loadData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    try {
      const [recordsRes, summaryRes] = await Promise.all([
        principalService.getDisciplineRecords({
          incidentType: filters.incidentType || undefined, 
          status: filters.status || undefined, 
          page: pagination.page, 
          limit: 15
        }),
        principalService.getDisciplineSummary()
      ])
      
      // FIX #2: Check if request was aborted before updating state
      if (signal?.aborted) return
      
      setRecords(recordsRes.data || [])
      setPagination(p => ({ ...p, pages: recordsRes.pagination?.pages || 1, total: recordsRes.pagination?.total || 0 }))
      setSummary(summaryRes.data || null)
    } catch (error: unknown) { 
      // FIX #2: Don't log abort errors
      if (error instanceof Error && error.name === 'AbortError') return
      console.error('Error loading discipline data:', error) 
    }
    finally { 
      if (!signal?.aborted) setLoading(false) 
    }
  }, [filters.incidentType, filters.status, pagination.page])

  // FIX #2: useEffect with AbortController cleanup
  useEffect(() => { 
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new AbortController for this request
    const controller = new AbortController()
    abortControllerRef.current = controller
    
    loadData(controller.signal)
    
    // Cleanup: abort on unmount or dependency change
    return () => controller.abort()
  }, [loadData])

  const openReviewModal = (record: principalService.DisciplinaryRecord) => {
    setSelectedRecord(record)
    setReviewForm({
      actionTaken: record.actionTaken || '', actionDetails: record.actionDetails || '',
      suspensionDays: record.suspensionDays || 0, principalRemarks: record.principalRemarks || '',
      parentNotified: record.parentNotified || false, status: record.status
    })
    setShowModal(true)
  }

  // FIX #3: handleReview with optimistic UI update
  const handleReview = async () => {
    if (!selectedRecord) return
    
    // Capture original state for rollback
    const originalRecord = { ...selectedRecord }
    const originalRecords = [...records]
    
    // Build optimistic update
    const optimisticUpdates: Partial<principalService.DisciplinaryRecord> = {
      actionTaken: reviewForm.actionTaken as principalService.DisciplinaryRecord['actionTaken'],
      actionDetails: reviewForm.actionDetails,
      suspensionDays: reviewForm.suspensionDays,
      principalRemarks: reviewForm.principalRemarks,
      parentNotified: reviewForm.parentNotified,
      status: reviewForm.status as principalService.DisciplinaryRecord['status'],
    }
    
    // FIX #3: Optimistically update the specific record in local state
    setRecords(prev => prev.map(r => 
      r._id === selectedRecord._id ? { ...r, ...optimisticUpdates } : r
    ))
    setMessage({ type: 'success', text: 'Record reviewed successfully' })
    setShowModal(false)
    setSaving(true)
    
    try {
      await principalService.reviewDisciplineRecord(selectedRecord._id, reviewForm)
      // API succeeded - optimistic update was correct, no action needed
    } catch (error: unknown) { 
      // FIX #3: Rollback on failure
      setRecords(originalRecords)
      setSelectedRecord(originalRecord)
      setShowModal(true)
      setMessage({ type: 'error', text: extractErrorMessage(error) }) 
    }
    finally { setSaving(false) }
  }

  // FIX #1: handleCreate with category validation
  const handleCreate = async () => {
    // FIX #1: Validate category is selected (required by backend)
    if (!createForm.studentAdmissionNumber || !createForm.description || !createForm.category) {
      setMessage({ type: 'error', text: 'Student ID, category, and description are required' }); return
    }
    setSaving(true)
    try {
      // FIX #1: Include category in API payload
      await principalService.createDisciplineRecord({
        studentAdmissionNumber: createForm.studentAdmissionNumber,
        incidentDate: createForm.incidentDate,
        incidentType: createForm.incidentType,
        category: createForm.category as principalService.DisciplineCategory,
        description: createForm.description,
        location: createForm.location || undefined,
        witnesses: createForm.witnesses ? createForm.witnesses.split(',').map(w => w.trim()) : undefined,
        actionTaken: createForm.actionTaken || undefined,
        actionDetails: createForm.actionDetails || undefined,
        suspensionDays: createForm.suspensionDays || undefined,
        principalRemarks: createForm.principalRemarks || undefined,
        parentNotified: createForm.parentNotified,
      })
      setMessage({ type: 'success', text: 'Record created successfully' })
      setShowCreateModal(false)
      // FIX #1: Reset form including category
      setCreateForm({ 
        studentAdmissionNumber: '', incidentDate: new Date().toISOString().split('T')[0], 
        incidentType: 'minor', category: '', 
        description: '', location: '', witnesses: '', 
        actionTaken: '', actionDetails: '', suspensionDays: 0, principalRemarks: '', parentNotified: false 
      })
      // Reload data to show new record
      if (abortControllerRef.current) abortControllerRef.current.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller
      loadData(controller.signal)
    } catch (error: unknown) { setMessage({ type: 'error', text: extractErrorMessage(error) }) }
    finally { setSaving(false) }
  }

  const getIncidentColor = (type: string) => ({ minor: 'bg-blue-100 text-blue-700', moderate: 'bg-yellow-100 text-yellow-700', severe: 'bg-orange-100 text-orange-700', critical: 'bg-red-100 text-red-700' }[type] || 'bg-gray-100 text-gray-700')
  const getStatusColor = (status: string) => ({ pending: 'bg-blue-100 text-blue-700', under_review: 'bg-yellow-100 text-yellow-700', resolved: 'bg-green-100 text-green-700', escalated: 'bg-red-100 text-red-700' }[status] || 'bg-gray-100 text-gray-700')

  return (
    <PrincipalLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Discipline Management</h1>
            <p className="text-slate-500 text-sm mt-1">Monitor and manage student behavior incidents</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Log Incident
          </button>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {summary && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center"><Shield className="w-6 h-6 text-indigo-600" /></div>
                <div><div className="text-2xl font-bold text-slate-800">{summary.totalRecords}</div><div className="text-sm text-slate-500">Total Records</div></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center"><Clock className="w-6 h-6 text-amber-600" /></div>
                <div><div className="text-2xl font-bold text-slate-800">{summary.pendingReview}</div><div className="text-sm text-slate-500">Pending Review</div></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="text-sm text-slate-500 mb-2">By Incident Type</div>
              <div className="space-y-1">{summary.byIncidentType?.slice(0, 3).map(item => (<div key={item.type} className="flex justify-between text-sm"><span className="capitalize">{item.type}</span><span className="font-semibold">{item.count}</span></div>))}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="text-sm text-slate-500 mb-2">By Status</div>
              <div className="space-y-1">{summary.byStatus?.slice(0, 3).map(item => (<div key={item.status} className="flex justify-between text-sm"><span className="capitalize">{item.status.replace('_', ' ')}</span><span className="font-semibold">{item.count}</span></div>))}</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <select value={filters.incidentType} onChange={e => setFilters(f => ({ ...f, incidentType: e.target.value }))} className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white">
              <option value="">All Types</option>
              {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white">
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" /><p className="text-slate-500">Loading...</p></div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center"><Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No records found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Record ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Student</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Action</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map(record => (
                    <tr key={record._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-indigo-600">{record.recordId}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{record.student?.firstName} {record.student?.lastName}</div>
                        <div className="text-xs text-slate-500">{record.student?.class}-{record.student?.section}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{new Date(record.incidentDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getIncidentColor(record.incidentType)}`}>{record.incidentType}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>{record.status.replace('_', ' ')}</span></td>
                      <td className="px-4 py-3 text-slate-600 capitalize">{record.actionTaken?.replace('_', ' ') || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => openReviewModal(record)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pagination.pages > 1 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">Page {pagination.page} of {pagination.pages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1} className="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.pages} className="p-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>

        {showModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Review Record</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-indigo-600" /></div>
                    <div>
                      <div className="font-semibold text-slate-800">{selectedRecord.student?.firstName} {selectedRecord.student?.lastName}</div>
                      <div className="text-sm text-slate-500">{selectedRecord.student?.class}-{selectedRecord.student?.section} | {selectedRecord.student?.admissionNumber}</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700"><strong>Description:</strong> {selectedRecord.description}</p>
                </div>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Action Taken</label>
                      <select value={reviewForm.actionTaken} onChange={e => setReviewForm(f => ({ ...f, actionTaken: e.target.value }))} className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white">
                        <option value="">Select</option>
                        {ACTION_OPTIONS.map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Status</label>
                      <select value={reviewForm.status} onChange={e => setReviewForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white">
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                  </div>
                  {reviewForm.actionTaken === 'suspension' && (
                    <div><label className="text-sm text-slate-600 mb-1 block">Suspension Days</label><input type="number" min="1" value={reviewForm.suspensionDays} onChange={e => setReviewForm(f => ({ ...f, suspensionDays: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2.5 border rounded-xl text-sm" /></div>
                  )}
                  <div><label className="text-sm text-slate-600 mb-1 block">Principal Remarks</label><textarea value={reviewForm.principalRemarks} onChange={e => setReviewForm(f => ({ ...f, principalRemarks: e.target.value }))} rows={3} className="w-full px-3 py-2.5 border rounded-xl text-sm resize-none" /></div>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={reviewForm.parentNotified} onChange={e => setReviewForm(f => ({ ...f, parentNotified: e.target.checked }))} className="w-4 h-4 rounded" /><span className="text-sm">Parent notified</span></label>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2.5 border rounded-xl text-sm hover:bg-slate-50">Cancel</button>
                <button onClick={handleReview} disabled={saving} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Log New Incident</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-sm text-slate-600 mb-1 block">Student Admission No *</label><input type="text" value={createForm.studentAdmissionNumber} onChange={e => setCreateForm(f => ({ ...f, studentAdmissionNumber: e.target.value }))} className="w-full px-3 py-2.5 border rounded-xl text-sm" placeholder="SPS-2024-0001" /></div>
                  <div><label className="text-sm text-slate-600 mb-1 block">Incident Date *</label><input type="date" value={createForm.incidentDate} onChange={e => setCreateForm(f => ({ ...f, incidentDate: e.target.value }))} className="w-full px-3 py-2.5 border rounded-xl text-sm" /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-sm text-slate-600 mb-1 block">Incident Type *</label><select value={createForm.incidentType} onChange={e => setCreateForm(f => ({ ...f, incidentType: e.target.value }))} className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white">{INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                  {/* FIX #1: Added category dropdown - required by backend */}
                  <div><label className="text-sm text-slate-600 mb-1 block">Category *</label>
                    <select 
                      value={createForm.category} 
                      onChange={e => setCreateForm(f => ({ ...f, category: e.target.value as principalService.DisciplineCategory }))} 
                      className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white ${!createForm.category ? 'text-slate-400' : ''}`}
                    >
                      <option value="">Select Category</option>
                      {DISCIPLINE_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-sm text-slate-600 mb-1 block">Location</label><input type="text" value={createForm.location} onChange={e => setCreateForm(f => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2.5 border rounded-xl text-sm" placeholder="Classroom, etc." /></div>
                  <div><label className="text-sm text-slate-600 mb-1 block">Witnesses (comma-separated)</label><input type="text" value={createForm.witnesses} onChange={e => setCreateForm(f => ({ ...f, witnesses: e.target.value }))} className="w-full px-3 py-2.5 border rounded-xl text-sm" /></div>
                </div>
                <div><label className="text-sm text-slate-600 mb-1 block">Description *</label><textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 border rounded-xl text-sm resize-none" /></div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-sm text-slate-600 mb-1 block">Action Taken</label><select value={createForm.actionTaken} onChange={e => setCreateForm(f => ({ ...f, actionTaken: e.target.value }))} className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white"><option value="">Select</option>{ACTION_OPTIONS.map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}</select></div>
                  {createForm.actionTaken === 'suspension' && <div><label className="text-sm text-slate-600 mb-1 block">Suspension Days</label><input type="number" min="1" value={createForm.suspensionDays} onChange={e => setCreateForm(f => ({ ...f, suspensionDays: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2.5 border rounded-xl text-sm" /></div>}
                </div>
                <div><label className="text-sm text-slate-600 mb-1 block">Principal Remarks</label><textarea value={createForm.principalRemarks} onChange={e => setCreateForm(f => ({ ...f, principalRemarks: e.target.value }))} rows={2} className="w-full px-3 py-2.5 border rounded-xl text-sm resize-none" /></div>
                <label className="flex items-center gap-2"><input type="checkbox" checked={createForm.parentNotified} onChange={e => setCreateForm(f => ({ ...f, parentNotified: e.target.checked }))} className="w-4 h-4 rounded" /><span className="text-sm">Parent notified</span></label>
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 border rounded-xl text-sm hover:bg-slate-50">Cancel</button>
                <button onClick={handleCreate} disabled={saving} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PrincipalLayout>
  )
}
