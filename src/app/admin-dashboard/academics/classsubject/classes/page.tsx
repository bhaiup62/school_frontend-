// src/app/admin-dashboard/academics/classes/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { getClassesBySession, createClass } from '@/services/admin/classSubjectService'
import { getAllSessions } from '@/services/admin/academicService'
import { 
  GraduationCap, ArrowLeft, RefreshCw, Plus, 
  Users, Settings, LayoutGrid, AlertCircle, X 
} from 'lucide-react'

export default function ClassManagerPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    className: '',
    displayName: '',
    board: 'CBSE',
    medium: 'English',
    applicationFeeAmount: 0,
    minAge: '',
    maxAge: ''
  })

  // 1. Load Sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await getAllSessions()
        setSessions(res.data.data)
        const current = res.data.data.find((s: any) => s.isCurrentSession)
        if (current) setSelectedSessionId(current._id)
        else if (res.data.data.length > 0) setSelectedSessionId(res.data.data[0]._id)
      } catch (error) {
        console.error('Failed to load sessions', error)
      }
    }
    fetchSessions()
  }, [])

  // 2. Load Classes
  const loadClasses = async () => {
    if (!selectedSessionId) return
    setIsRefreshing(true)
    try {
      const res = await getClassesBySession(selectedSessionId)
      setClasses(res.data.data)
    } catch (error) {
      console.error('Failed to load classes', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadClasses()
  }, [selectedSessionId])

  // Actions
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Clean up empty age fields before sending to API
      const payload: any = { 
        ...formData, 
        academicSession: selectedSessionId,
        minAge: formData.minAge ? Number(formData.minAge) : undefined,
        maxAge: formData.maxAge ? Number(formData.maxAge) : undefined,
      }

      await createClass(payload)
      setShowModal(false)
      setFormData({ className: '', displayName: '', board: 'CBSE', medium: 'English', applicationFeeAmount: 0, minAge: '', maxAge: '' })
      loadClasses()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create class. Check if class name already exists for this session.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-2">
          <Link href="/admin-dashboard/academics/classsubject" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Classes & Subjects
          </Link>
          <button onClick={loadClasses} disabled={isRefreshing} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} /> Refresh
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-600" /> Class Manager
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage school classes, capacities, and base fees.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select 
              value={selectedSessionId} 
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="flex-1 md:flex-none border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none bg-slate-50"
            >
              {sessions.map(s => (
                <option key={s._id} value={s._id}>{s.sessionName} {s.isCurrentSession ? '(Active)' : ''}</option>
              ))}
            </select>
            
            <button 
              onClick={() => setShowModal(true)}
              disabled={!selectedSessionId}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> New Class
            </button>
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full flex justify-center py-10"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
          ) : classes.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <LayoutGrid className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No classes configured</h3>
              <p className="text-slate-500 text-sm mt-1">Add your first class (e.g., "Class 1") to this session.</p>
            </div>
          ) : (
            classes.map(cls => (
              <div key={cls._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col">
                <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{cls.displayName}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{cls.board} • {cls.medium}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    cls.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    {cls.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="p-5 flex-1 space-y-4">
                  {/* Capacity Overview */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-500">Total Seats</span>
                      <span className="text-slate-900">{cls.totalCapacity}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-500">Available</span>
                      <span className={cls.availableSeats > 0 ? 'text-emerald-600' : 'text-rose-600'}>{cls.availableSeats}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Sections</p>
                      <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-400" /> {cls.sections?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Application Fee</p>
                      <p className="text-sm font-bold text-slate-700">₹{cls.applicationFeeAmount}</p>
                    </div>
                  </div>
                  
                  {cls.sections?.length === 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-amber-700">No sections added. Capacity is 0.</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
                  <Link 
                    href={`/admin-dashboard/academics/classsubject/classes/${cls._id}`}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Manage Sections & Teachers
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Class Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-slate-800">Create New Class</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreateClass} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Class Identifier *</label>
                  <input type="text" required placeholder="e.g. 10" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                  <p className="text-[10px] text-slate-400 mt-1">Unique ID for the database (e.g., 10, UKG, 11-SCI)</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Display Name *</label>
                  <input type="text" required placeholder="e.g. Class 10" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Board</label>
                  <input type="text" required value={formData.board} onChange={e => setFormData({...formData, board: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Medium</label>
                  <input type="text" required value={formData.medium} onChange={e => setFormData({...formData, medium: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Application Fee (₹) *</label>
                  <input type="number" required min="0" value={formData.applicationFeeAmount} onChange={e => setFormData({...formData, applicationFeeAmount: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Min Age (Optional)</label>
                  <input type="number" min="0" placeholder="e.g. 5" value={formData.minAge} onChange={e => setFormData({...formData, minAge: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Max Age (Optional)</label>
                  <input type="number" min="0" placeholder="e.g. 7" value={formData.maxAge} onChange={e => setFormData({...formData, maxAge: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm disabled:opacity-70 transition-colors shadow-lg shadow-indigo-600/20">
                  {isSubmitting ? 'Saving...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
