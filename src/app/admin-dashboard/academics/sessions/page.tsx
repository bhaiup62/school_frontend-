// src/app/admin-dashboard/academics/sessions/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { getAllSessions, createSession } from '@/services/admin/academicService'
import { 
  GraduationCap, ArrowLeft, RefreshCw, Plus, 
  Calendar, CheckCircle2, AlertCircle, Eye, Settings, X
} from 'lucide-react'

export default function SessionsManagerPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    sessionName: '',
    startDate: '',
    endDate: '',
    attendanceBackdateLimit: 3,
    minAttendancePercentage: 75
  })

  const loadSessions = async () => {
    setIsRefreshing(true)
    try {
      const res = await getAllSessions()
      setSessions(res.data.data)
    } catch (error) {
      console.error('Failed to load sessions', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      await createSession(formData)
      setShowModal(false)
      setFormData({ sessionName: '', startDate: '', endDate: '', attendanceBackdateLimit: 3, minAttendancePercentage: 75 })
      loadSessions() // Refresh the table
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create session. Check if name already exists.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ── Consistent Top Navigation ── */}
        <div className="flex items-center justify-between mb-2">
          <Link href="/admin-dashboard/academics" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Academics Hub
          </Link>
          <button 
            onClick={loadSessions} 
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} /> 
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-600" /> Academic Sessions
            </h1>
            <p className="text-slate-500 text-sm mt-1">Create and manage academic years and their core rules.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" /> New Session
          </button>
        </div>

        {/* ── Sessions Table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Session Name</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Duration</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Admissions</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Terms</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center"><div className="inline-block animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" /></td></tr>
                ) : sessions.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-slate-500 font-medium">No sessions found. Create one to get started.</td></tr>
                ) : (
                  sessions.map((session) => (
                    <tr key={session._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-base">{session.sessionName}</div>
                        {session.isCurrentSession && <span className="inline-flex mt-1 items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700"><CheckCircle2 className="w-3 h-3"/> Current</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400"/> {new Date(session.startDate).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-400 mt-0.5 ml-5">to {new Date(session.endDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                          session.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          session.status === 'Upcoming' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {session.isAdmissionOpen ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4"/> Open</span>
                        ) : (
                          <span className="text-slate-400 font-medium flex items-center gap-1.5"><AlertCircle className="w-4 h-4"/> Closed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {session.terms?.length || 0} Configured
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin-dashboard/academics/sessions/${session._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 transition-all font-bold text-xs"
                        >
                          <Settings className="w-3.5 h-3.5" /> Configure
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Create Session Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-slate-800 text-lg">Create New Session</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateSession} className="p-6 space-y-4">
              {error && <div className="p-3 bg-rose-50 text-rose-700 text-sm font-bold rounded-lg border border-rose-100">{error}</div>}
              
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Session Name *</label>
                <input type="text" required placeholder="e.g. 2026-2027" value={formData.sessionName} onChange={e => setFormData({...formData, sessionName: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Start Date *</label>
                  <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">End Date *</label>
                  <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Attendance Backdate Limit (Days)</label>
                  <input type="number" min="0" required value={formData.attendanceBackdateLimit} onChange={e => setFormData({...formData, attendanceBackdateLimit: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Min Attendance %</label>
                  <input type="number" min="0" max="100" required value={formData.minAttendancePercentage} onChange={e => setFormData({...formData, minAttendancePercentage: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none" />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-70">
                  {isSubmitting ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}