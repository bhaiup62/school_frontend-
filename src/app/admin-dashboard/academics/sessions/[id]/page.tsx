// src/app/admin-dashboard/academics/sessions/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  getSessionById, updateSessionStatus, 
  toggleAdmissionStatus, addTermToSession 
} from '@/services/admin/academicService'
import { 
  ArrowLeft, RefreshCw, Settings, Calendar, CheckCircle2, 
  AlertCircle, ShieldCheck, DoorOpen, DoorClosed, Power, 
  Archive, Plus, X
} from 'lucide-react'

export default function SessionConfigurationPage() {
  const params = useParams()
  const sessionId = params.id as string
  
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Modal State for Terms
  const [showTermModal, setShowTermModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [termFormData, setTermFormData] = useState({
    termName: '',
    startDate: '',
    endDate: ''
  })

  const loadSession = async () => {
    setIsRefreshing(true)
    try {
      const res = await getSessionById(sessionId)
      setSession(res.data.data)
    } catch (error) {
      console.error('Failed to load session details', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (sessionId) loadSession()
  }, [sessionId])

  // ── Actions ──
  const handleToggleAdmission = async () => {
    try {
      await toggleAdmissionStatus(sessionId)
      loadSession()
    } catch (error) {
      alert('Failed to toggle admission status.')
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'Active') {
      const confirm = window.confirm("WARNING: Activating this session will automatically deactivate the currently active session. Proceed?")
      if (!confirm) return
    }
    
    try {
      await updateSessionStatus(sessionId, newStatus)
      loadSession()
    } catch (error) {
      alert('Failed to update status.')
    }
  }

  const handleAddTerm = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await addTermToSession(sessionId, termFormData)
      setShowTermModal(false)
      setTermFormData({ termName: '', startDate: '', endDate: '' })
      loadSession()
    } catch (error) {
      alert('Failed to add term.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <AdminLayout><div className="flex items-center justify-center h-[60vh]"><div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" /></div></AdminLayout>
  }

  if (!session) {
    return <AdminLayout><div className="text-center py-20 text-slate-500">Session not found.</div></AdminLayout>
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ── Consistent Top Navigation ── */}
        <div className="flex items-center justify-between mb-2">
          <Link href="/admin-dashboard/academics/sessions" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Sessions List
          </Link>
          <button onClick={loadSession} disabled={isRefreshing} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} /> Refresh
          </button>
        </div>

        {/* ── Master Header Card ── */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                session.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                session.status === 'Upcoming' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {session.status} Status
              </span>
              {session.isCurrentSession && (
                <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Globally Active
                </span>
              )}
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900">{session.sessionName}</h1>
            <p className="text-slate-500 font-medium mt-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {new Date(session.startDate).toLocaleDateString()} — {new Date(session.endDate).toLocaleDateString()}
            </p>
          </div>

          {/* Core Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {session.status === 'Upcoming' && (
              <button onClick={() => handleStatusChange('Active')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-emerald-600/20">
                <Power className="w-4 h-4" /> Activate Year
              </button>
            )}
            {session.status === 'Active' && (
              <button onClick={() => handleStatusChange('Completed')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-600/20">
                <CheckCircle2 className="w-4 h-4" /> Mark Completed
              </button>
            )}
            {(session.status === 'Completed' || session.status === 'Upcoming') && (
              <button onClick={() => handleStatusChange('Archived')} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors border border-slate-200">
                <Archive className="w-4 h-4" /> Archive
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* ── Left Column: Config & Rules ── */}
          <div className="space-y-6 md:col-span-1">
            
            {/* Admissions Control */}
            <div className={`p-6 rounded-2xl border transition-colors ${session.isAdmissionOpen ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className={`font-bold flex items-center gap-2 ${session.isAdmissionOpen ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {session.isAdmissionOpen ? <DoorOpen className="w-5 h-5"/> : <DoorClosed className="w-5 h-5"/>} Admissions
                </h3>
              </div>
              <p className={`text-sm mb-6 ${session.isAdmissionOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
                {session.isAdmissionOpen 
                  ? 'The portal is currently accepting new student applications for this session.' 
                  : 'The application portal is closed for this session.'}
              </p>
              <button 
                onClick={handleToggleAdmission} 
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors border ${
                  session.isAdmissionOpen ? 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-white border-rose-200 text-rose-700 hover:bg-rose-100'
                }`}
              >
                {session.isAdmissionOpen ? 'Close Admissions' : 'Open Admissions'}
              </button>
            </div>

            {/* Strict Rules Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <ShieldCheck className="w-5 h-5 text-indigo-500" /> Enterprise Rules
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Attendance Backdate Limit</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{session.attendanceBackdateLimit} Days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Min. Promotion Attendance</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{session.minAttendancePercentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Defaulter Promotion</span>
                  {session.feeDefaulterPromotionLocked ? (
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Locked</span>
                  ) : (
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Allowed</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Terms Management ── */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-500" /> Session Terms Configuration
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Break the academic year into Terms or Semesters.</p>
                </div>
                <button onClick={() => setShowTermModal(true)} className="flex items-center gap-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                  <Plus className="w-4 h-4" /> Add Term
                </button>
              </div>

              <div className="p-6 flex-1">
                {session.terms?.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 font-medium">No terms configured yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Add "Term 1" or "Semester 1" to start grading.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {session.terms.map((term: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors group">
                        <div>
                          <h4 className="font-bold text-slate-800 text-base">{term.termName}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(term.startDate).toLocaleDateString()} — {new Date(term.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        {term.isCurrentTerm ? (
                          <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">Current Term</span>
                        ) : (
                          <span className="bg-slate-50 text-slate-500 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">Inactive</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Add Term Modal ── */}
      {showTermModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-slate-800">Add Academic Term</h2>
              <button onClick={() => setShowTermModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddTerm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Term Name *</label>
                <input type="text" required placeholder="e.g. Term 1" value={termFormData.termName} onChange={e => setTermFormData({...termFormData, termName: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Start Date *</label>
                  <input type="date" required value={termFormData.startDate} onChange={e => setTermFormData({...termFormData, startDate: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">End Date *</label>
                  <input type="date" required value={termFormData.endDate} onChange={e => setTermFormData({...termFormData, endDate: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowTermModal(false)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 border border-slate-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm disabled:opacity-70">
                  {isSubmitting ? 'Saving...' : 'Save Term'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}