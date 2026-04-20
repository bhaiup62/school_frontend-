// src/app/admin-dashboard/academics/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { getAllSessions } from '@/services/admin/academicService'
import { 
  BookOpen, CalendarDays, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, Settings, GraduationCap,
  Calendar
} from 'lucide-react'

export default function AcademicsHubPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await getAllSessions()
        setSessions(res.data.data) // Axios returns res.data, our API returns { success, data }
      } catch (error) {
        console.error('Failed to load sessions', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [])

  const activeSession = sessions.find(s => s.isCurrentSession)

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" /> Academics Hub
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage academic years, terms, and the school calendar.</p>
          </div>
        </div>

        {/* ── Active Session Highlight ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Current Academic Session
            </h2>
          </div>
          
          <div className="p-6">
            {activeSession ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-display font-bold text-blue-700">{activeSession.sessionName}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm font-medium text-slate-500">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {new Date(activeSession.startDate).toLocaleDateString()} - {new Date(activeSession.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className={`px-4 py-2 rounded-xl border ${activeSession.isAdmissionOpen ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-0.5">Admissions</p>
                    <p className="font-bold flex items-center gap-1">
                      {activeSession.isAdmissionOpen ? <><CheckCircle2 className="w-4 h-4"/> Open</> : <><AlertCircle className="w-4 h-4"/> Closed</>}
                    </p>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                    <p className="text-xs font-bold uppercase tracking-wider mb-0.5 text-slate-400">Terms Configured</p>
                    <p className="font-bold flex items-center gap-1">
                      <Settings className="w-4 h-4 text-slate-400"/> {activeSession.terms?.length || 0} Terms
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Active Session</h3>
                <p className="text-slate-500 text-sm mt-1 mb-4">You need to set a session to 'Active' to start the school year.</p>
                <Link href="/admin-dashboard/academics/sessions" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
                  Go to Session Manager
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Access Modules ── */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/admin-dashboard/academics/sessions" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-lg flex items-center justify-between">
                Manage Sessions <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </h3>
              <p className="text-sm text-slate-500 mt-1">Create new academic years, configure terms (Half-Yearly, Finals), and run year-end rollovers.</p>
            </div>
          </Link>

          <Link href="/admin-dashboard/academics/calendar" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-lg flex items-center justify-between">
                Academic Calendar <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </h3>
              <p className="text-sm text-slate-500 mt-1">Plot holidays, exam windows, PTMs, and administrative events for the active session.</p>
            </div>
          </Link>
        </div>

        {/* ── Mini Session History Table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" /> Recent Sessions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-bold">Session Name</th>
                  <th className="px-6 py-3 font-bold">Duration</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.slice(0, 3).map((session) => (
                  <tr key={session._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-bold text-slate-800">{session.sessionName}</td>
                    <td className="px-6 py-3 text-slate-600">
                      {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        session.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        session.status === 'Upcoming' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No sessions configured yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}