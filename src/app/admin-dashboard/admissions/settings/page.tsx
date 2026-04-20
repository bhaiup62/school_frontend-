'use client'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { 
  getSessions, createSession, toggleSessionStatus,
  getClasses, createClass 
} from '@/services/admin/admissionService'
import { 
  Settings, CalendarDays, BookOpen, Plus, 
  ToggleRight, ToggleLeft, AlertCircle, X,
  CheckCircle2, Building2, Users, ArrowLeft
} from 'lucide-react'

export default function AdmissionSettingsPage() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'classes'>('sessions')
  
  // Data State
  const [sessions, setSessions] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [showClassModal, setShowClassModal] = useState(false)

  // Form States
  const [sessionForm, setSessionForm] = useState({ sessionName: '', startDate: '', endDate: '' })
  const [classForm, setClassForm] = useState({ className: '', totalCapacity: 40, minimumAgeCutoffDate: '', applicationFeeAmount: 500 })

  // Load Data
  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'sessions') {
        const res = await getSessions()
        setSessions(res.data)
      } else {
        const res = await getClasses()
        setClasses(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab])

  // Handlers
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSession(sessionForm)
      setShowSessionModal(false)
      setSessionForm({ sessionName: '', startDate: '', endDate: '' })
      fetchData()
    } catch (error) {
      alert('Failed to create session')
    }
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createClass(classForm)
      setShowClassModal(false)
      setClassForm({ className: '', totalCapacity: 40, minimumAgeCutoffDate: '', applicationFeeAmount: 500 })
      fetchData()
    } catch (error) {
      alert('Failed to create class')
    }
  }

  const handleToggle = async (id: string, field: 'isCurrentSession' | 'isAdmissionOpen') => {
    try {
      await toggleSessionStatus(id, field)
      fetchData() // Refresh to reflect rules (like auto-toggling other sessions off)
    } catch (error) {
      alert('Failed to toggle status')
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-4">
          <Link href="/admin-dashboard/admissions" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Admissions Hub
          </Link>
        </div>
        
        {/* ── Header ── */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-violet-600" /> Master Rules Engine
            </h1>
            <p className="text-slate-500 text-sm mt-1">Configure academic years, open/close admissions, and define class seat matrix.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('sessions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'sessions' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CalendarDays className="w-4 h-4" /> Academic Sessions
            </button>
            <button 
              onClick={() => setActiveTab('classes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'classes' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Building2 className="w-4 h-4" /> Class Master
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" /></div>
        ) : (
          <>
            {/* ── TAB 1: ACADEMIC SESSIONS ── */}
            {activeTab === 'sessions' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800">Session List</h2>
                  <button onClick={() => setShowSessionModal(true)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> New Session
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Session Name</th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Timeline</th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Current Active Session</th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Admissions Open</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sessions.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-500">No sessions configured yet.</td></tr>
                      ) : (
                        sessions.map((session) => (
                          <tr key={session._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{session.sessionName}</td>
                            <td className="px-6 py-4 text-slate-500">
                              {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button onClick={() => handleToggle(session._id, 'isCurrentSession')} className="inline-flex items-center justify-center">
                                {session.isCurrentSession ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button onClick={() => handleToggle(session._id, 'isAdmissionOpen')} className="inline-flex items-center justify-center">
                                {session.isAdmissionOpen ? <ToggleRight className="w-8 h-8 text-violet-600" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── TAB 2: CLASS MASTER ── */}
            {activeTab === 'classes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800">Seat Matrix & Class Rules</h2>
                  <button onClick={() => setShowClassModal(true)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm">
                    <Plus className="w-4 h-4" /> New Class
                  </button>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {classes.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">No classes configured yet.</div>
                  ) : (
                    classes.map((cls) => (
                      <div key={cls._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-violet-300 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <h3 className="font-display font-bold text-slate-900 text-lg">{cls.className}</h3>
                          </div>
                          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-100">
                            {cls.availableSeats} Seats Left
                          </span>
                        </div>
                        
                        <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-medium">Total Capacity</span>
                            <span className="font-bold text-slate-800">{cls.totalCapacity} Students</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-medium">Application Fee</span>
                            <span className="font-bold text-slate-800">₹{cls.applicationFeeAmount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> Cutoff DOB
                            </span>
                            <span className="font-bold text-rose-600">{new Date(cls.minimumAgeCutoffDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── MODALS ── */}
      {/* Create Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Create Academic Session</h3>
              <button onClick={() => setShowSessionModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateSession} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Session Name</label>
                <input type="text" required placeholder="e.g., 2026-2027" value={sessionForm.sessionName} onChange={e => setSessionForm({...sessionForm, sessionName: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Start Date</label>
                  <input type="date" required value={sessionForm.startDate} onChange={e => setSessionForm({...sessionForm, startDate: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">End Date</label>
                  <input type="date" required value={sessionForm.endDate} onChange={e => setSessionForm({...sessionForm, endDate: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl transition-colors mt-2">Save Session</button>
            </form>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Configure New Class</h3>
              <button onClick={() => setShowClassModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateClass} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Class Name</label>
                <input type="text" required placeholder="e.g., Class 1" value={classForm.className} onChange={e => setClassForm({...classForm, className: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Total Capacity (Seats)</label>
                  <input type="number" required min="1" value={classForm.totalCapacity} onChange={e => setClassForm({...classForm, totalCapacity: parseInt(e.target.value)})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-violet-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Application Fee (₹)</label>
                  <input type="number" required min="0" value={classForm.applicationFeeAmount} onChange={e => setClassForm({...classForm, applicationFeeAmount: parseInt(e.target.value)})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-violet-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Minimum Age Cutoff (Must be born BEFORE)</label>
                <input type="date" required value={classForm.minimumAgeCutoffDate} onChange={e => setClassForm({...classForm, minimumAgeCutoffDate: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-violet-500 outline-none" />
              </div>
              <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl transition-colors mt-2">Save Class Rules</button>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  )
}
