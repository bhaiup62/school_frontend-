// src/app/admin-dashboard/academics/calendar/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  getAllSessions, getEventsBySession, 
  createCalendarEvent, deleteCalendarEvent 
} from '@/services/admin/academicService'
import { 
  CalendarDays, ArrowLeft, RefreshCw, Plus, 
  Trash2, AlertCircle, Calendar as CalendarIcon, 
  BookOpen, Users, Building2, Coffee, X
} from 'lucide-react'

export default function AcademicCalendarPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    type: 'Holiday',
    description: ''
  })

  // 1. Load Sessions first to populate the dropdown
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await getAllSessions()
        const fetchedSessions = res.data.data
        setSessions(fetchedSessions)
        
        // Auto-select the current session, or the first one available
        const current = fetchedSessions.find((s: any) => s.isCurrentSession)
        if (current) setSelectedSessionId(current._id)
        else if (fetchedSessions.length > 0) setSelectedSessionId(fetchedSessions[0]._id)
      } catch (error) {
        console.error('Failed to load sessions', error)
      }
    }
    fetchSessions()
  }, [])

  // 2. Load Events whenever the selected session changes
  const loadEvents = async () => {
    if (!selectedSessionId) return
    setIsRefreshing(true)
    try {
      const res = await getEventsBySession(selectedSessionId)
      setEvents(res.data.data)
    } catch (error) {
      console.error('Failed to load events', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [selectedSessionId])

  // ── Actions ──
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createCalendarEvent({ ...formData, academicSession: selectedSessionId })
      setShowModal(false)
      setFormData({ title: '', startDate: '', endDate: '', type: 'Holiday', description: '' })
      loadEvents()
    } catch (error) {
      alert('Failed to create event.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return
    try {
      await deleteCalendarEvent(eventId)
      loadEvents()
    } catch (error) {
      alert('Failed to delete event.')
    }
  }

  // UI Helpers
  const getEventStyle = (type: string) => {
    switch (type) {
      case 'Holiday': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: <Coffee className="w-4 h-4 text-emerald-500" /> }
      case 'Exam': return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', icon: <BookOpen className="w-4 h-4 text-rose-500" /> }
      case 'PTM': return { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100', icon: <Users className="w-4 h-4 text-violet-500" /> }
      case 'Activity': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: <CalendarIcon className="w-4 h-4 text-amber-500" /> }
      case 'Administrative': return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', icon: <Building2 className="w-4 h-4 text-slate-500" /> }
      default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: <CalendarDays className="w-4 h-4" /> }
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ── Consistent Top Navigation ── */}
        <div className="flex items-center justify-between mb-2">
          <Link href="/admin-dashboard/academics" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Academics Hub
          </Link>
          <button onClick={loadEvents} disabled={isRefreshing} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} /> Refresh
          </button>
        </div>

        {/* ── Header & Filters ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-indigo-600" /> Master Calendar
            </h1>
            <p className="text-slate-500 text-sm mt-1">Plot the timeline for exams, holidays, and events.</p>
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
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>
        </div>

        {/* ── Timeline View ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          {loading ? (
             <div className="flex justify-center py-10"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <CalendarDays className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No events plotted</h3>
              <p className="text-slate-500 text-sm mt-1">The calendar for this session is completely empty.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 ml-3 md:ml-6 space-y-8 pb-4">
              {events.map((event) => {
                const style = getEventStyle(event.type)
                const isSingleDay = new Date(event.startDate).toDateString() === new Date(event.endDate).toDateString()

                return (
                  <div key={event._id} className="relative pl-6 md:pl-8 group">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${style.bg}`}>
                      {style.icon}
                    </div>

                    {/* Event Card */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm group-hover:shadow-md group-hover:border-slate-200 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
                              {event.type}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              {isSingleDay ? (
                                new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                              ) : (
                                `${new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                              )}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">{event.title}</h3>
                          {event.description && <p className="text-sm text-slate-500 mt-2">{event.description}</p>}
                        </div>

                        {/* Actions */}
                        <button 
                          onClick={() => handleDeleteEvent(event._id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all shrink-0"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── Add Event Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-slate-800">Add Calendar Event</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Event Title *</label>
                <input type="text" required placeholder="e.g. Diwali Break" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Event Type *</label>
                <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none bg-white">
                  <option value="Holiday">Holiday (School Closed)</option>
                  <option value="Exam">Examination</option>
                  <option value="PTM">Parent-Teacher Meeting</option>
                  <option value="Activity">School Activity / Event</option>
                  <option value="Administrative">Administrative Task</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Start Date *</label>
                  <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">End Date *</label>
                  <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Description (Optional)</label>
                <textarea rows={3} placeholder="Add any details..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none resize-none" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 border border-slate-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm disabled:opacity-70">
                  {isSubmitting ? 'Saving...' : 'Plot Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}