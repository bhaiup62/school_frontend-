'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import { Calendar, Plus, ChevronLeft, ChevronRight, X, Clock, Eye, Users, Filter, RefreshCw } from 'lucide-react'
import * as principalService from '@/services/principalService'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { isAbortError } from '@/lib/errorUtils'

const EVENT_TYPES = ['cultural', 'sports', 'academic', 'holiday', 'ptm', 'exam', 'competition', 'field_trip', 'other']
const STATUS_OPTIONS = ['draft', 'pending_approval', 'approved', 'rejected', 'cancelled', 'completed']
const AUDIENCES = ['all', 'students', 'teachers', 'parents', 'specific_classes']
const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600" />
      <Calendar className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  </div>
)

export default function EventsPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<principalService.SchoolEvent[]>([])
  // Calendar is stored as object keyed by date string (YYYY-MM-DD)
  const [calendar, setCalendar] = useState<Record<string, principalService.CalendarEvent[]>>({})
  const [pendingEvents, setPendingEvents] = useState<principalService.SchoolEvent[]>([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState({ eventType: '', status: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() })
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [selectedEvent, setSelectedEvent] = useState<principalService.SchoolEvent | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPTMModal, setShowPTMModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '', description: '', eventType: 'cultural', startDate: '', endDate: '', startTime: '', endTime: '',
    venue: '', targetAudience: 'all', targetClasses: [] as string[], budget: 0
  })
  const [ptmForm, setPtmForm] = useState({ title: '', description: '', startDate: '', classes: [] as string[], agenda: '', venue: '' })
  const [saving, setSaving] = useState(false)

  // Global error handler
  const { handleError, showSuccess, showError, showWarning } = useErrorHandler()

  // FIX #1: AbortController ref for race condition prevention
  const abortControllerRef = useRef<AbortController | null>(null)

  // FIX #1: loadData with AbortSignal support
  const loadData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    try {
      const [eventsRes, calendarRes, pendingRes] = await Promise.all([
        principalService.getEvents({ eventType: filters.eventType || undefined, status: filters.status || undefined, page: pagination.page, limit: 15 }, signal),
        principalService.getCalendar({ month: filters.month, year: filters.year }, signal),
        principalService.getPendingEvents(signal)
      ])
      
      // FIX #1: Check if aborted before updating state
      if (signal?.aborted) return
      
      setEvents(eventsRes.data || [])
      setPagination(p => ({ ...p, pages: eventsRes.pagination?.pages || 1, total: eventsRes.pagination?.total || 0 }))
      // Calendar API returns { month, year, totalEvents, calendar: { 'YYYY-MM-DD': [...events] } }
      setCalendar((calendarRes.data as any)?.calendar || {})
      setPendingEvents(pendingRes.data || [])
    } catch (error) {
      // Ignore abort errors
      if (isAbortError(error)) {
        return
      }
      handleError(error, 'Loading events')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [filters.eventType, filters.status, filters.month, filters.year, pagination.page, handleError])

  // FIX #1: useEffect with AbortController
  useEffect(() => {
    // Abort previous request
    abortControllerRef.current?.abort()
    
    // Create new controller
    const controller = new AbortController()
    abortControllerRef.current = controller
    
    loadData(controller.signal)
    
    // Cleanup on unmount or dependency change
    return () => controller.abort()
  }, [loadData])

  // Manual refresh handler
  const handleRefresh = () => {
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    loadData(controller.signal)
  }

  const openDetailModal = async (event: principalService.SchoolEvent) => {
    try {
      const res = await principalService.getEventDetail(event._id)
      setSelectedEvent(res.data)
      setShowModal(true)
    } catch (error) { console.error('Error:', error) }
  }

  // FIX #2: Optimistic UI for approve
  const handleApprove = async (eventId: string) => {
    // Capture original state for rollback
    const originalEvents = [...events]
    const originalPendingEvents = [...pendingEvents]
    const originalCalendar = { ...calendar }
    
    // Optimistically update local state
    const updatedEvent = events.find(e => e._id === eventId) || pendingEvents.find(e => e._id === eventId)
    if (updatedEvent) {
      const approvedEvent = { ...updatedEvent, status: 'approved' as const }
      
      // Update events list
      setEvents(prev => prev.map(e => e._id === eventId ? approvedEvent : e))
      
      // Remove from pending
      setPendingEvents(prev => prev.filter(e => e._id !== eventId))
      
      // Add to calendar if approved (grouped by date)
      const dateKey = new Date(approvedEvent.startDate).toISOString().split('T')[0]
      const calendarEntry: principalService.CalendarEvent = {
        _id: approvedEvent._id,
        eventId: approvedEvent.eventId,
        title: approvedEvent.title,
        eventType: approvedEvent.eventType,
        startTime: approvedEvent.startTime,
        endTime: approvedEvent.endTime,
        venue: approvedEvent.venue,
        priority: 'normal',
        isPTM: approvedEvent.isPTM
      }
      setCalendar(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), calendarEntry]
      }))
    }
    
    setShowModal(false)
    setSaving(true)
    
    try {
      await principalService.approveEvent(eventId)
      showSuccess('Event approved')
    } catch (error) {
      // Rollback on failure
      setEvents(originalEvents)
      setPendingEvents(originalPendingEvents)
      setCalendar(originalCalendar)
      handleError(error, 'Approving event')
    } finally {
      setSaving(false)
    }
  }

  // FIX #2: Optimistic UI for reject
  const handleReject = async (eventId: string, reason: string) => {
    if (!reason) { showWarning('Rejection reason required'); return }
    
    // Capture original state for rollback
    const originalEvents = [...events]
    const originalPendingEvents = [...pendingEvents]
    
    // Optimistically update local state
    const updatedEvent = events.find(e => e._id === eventId) || pendingEvents.find(e => e._id === eventId)
    if (updatedEvent) {
      const rejectedEvent = { ...updatedEvent, status: 'rejected' as const }
      
      // Update events list
      setEvents(prev => prev.map(e => e._id === eventId ? rejectedEvent : e))
      
      // Remove from pending
      setPendingEvents(prev => prev.filter(e => e._id !== eventId))
    }
    
    setShowModal(false)
    setSaving(true)
    
    try {
      await principalService.rejectEvent(eventId, reason)
      showSuccess('Event rejected')
    } catch (error) {
      // Rollback on failure
      setEvents(originalEvents)
      setPendingEvents(originalPendingEvents)
      handleError(error, 'Rejecting event')
    } finally {
      setSaving(false)
    }
  }

  // FIX #3: Optimistic creation - push new event directly to state
  const handleCreate = async () => {
    if (!createForm.title || !createForm.startDate) { showWarning('Title and date are required'); return }
    setSaving(true)
    
    try {
      const result = await principalService.createEvent({
        ...createForm,
        targetClasses: createForm.targetAudience === 'specific_classes' ? createForm.targetClasses : undefined
      })
      
      // FIX #3: Push newly created event to local state instead of refetching
      if (result.data) {
        setEvents(prev => [result.data, ...prev])
        setPagination(p => ({ ...p, total: p.total + 1 }))
        
        // Add to calendar if within current view (calendar is object keyed by date)
        const eventDate = new Date(result.data.startDate)
        if (eventDate.getMonth() + 1 === filters.month && eventDate.getFullYear() === filters.year) {
          const dateKey = eventDate.toISOString().split('T')[0]
          const calendarEntry: principalService.CalendarEvent = {
            _id: result.data._id,
            eventId: result.data.eventId,
            title: result.data.title,
            eventType: result.data.eventType,
            startTime: result.data.startTime,
            endTime: result.data.endTime,
            venue: result.data.venue,
            priority: 'normal',
            isPTM: result.data.isPTM
          }
          setCalendar(prev => ({
            ...prev,
            [dateKey]: [...(prev[dateKey] || []), calendarEntry]
          }))
        }
      }
      
      showSuccess('Event created')
      setShowCreateModal(false)
      setCreateForm({ title: '', description: '', eventType: 'cultural', startDate: '', endDate: '', startTime: '', endTime: '', venue: '', targetAudience: 'all', targetClasses: [], budget: 0 })
    } catch (error) {
      handleError(error, 'Creating event')
    } finally {
      setSaving(false)
    }
  }

  // FIX #3: Optimistic creation for PTM
  const handleCreatePTM = async () => {
    if (!ptmForm.title || !ptmForm.startDate || !ptmForm.classes.length) { showWarning('Title, date, and classes are required'); return }
    setSaving(true)
    
    try {
      const result = await principalService.createPTM(ptmForm)
      
      // FIX #3: Push newly created PTM to local state
      if (result.data) {
        setEvents(prev => [result.data, ...prev])
        setPagination(p => ({ ...p, total: p.total + 1 }))
        
        // Add to calendar if within current view (calendar is object keyed by date)
        const eventDate = new Date(result.data.startDate)
        if (eventDate.getMonth() + 1 === filters.month && eventDate.getFullYear() === filters.year) {
          const dateKey = eventDate.toISOString().split('T')[0]
          const calendarEntry: principalService.CalendarEvent = {
            _id: result.data._id,
            eventId: result.data.eventId,
            title: result.data.title,
            eventType: result.data.eventType,
            startTime: result.data.startTime,
            endTime: result.data.endTime,
            venue: result.data.venue,
            priority: 'high',
            isPTM: true
          }
          setCalendar(prev => ({
            ...prev,
            [dateKey]: [...(prev[dateKey] || []), calendarEntry]
          }))
        }
      }
      
      showSuccess('PTM created')
      setShowPTMModal(false)
      setPtmForm({ title: '', description: '', startDate: '', classes: [], agenda: '', venue: '' })
    } catch (error) {
      handleError(error, 'Creating PTM')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => ({
    draft: 'bg-gray-100 text-gray-700', pending_approval: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-700', completed: 'bg-blue-100 text-blue-700'
  }[status] || 'bg-gray-100 text-gray-700')

  const getTypeColor = (type: string) => ({
    cultural: 'bg-purple-100 text-purple-700', sports: 'bg-green-100 text-green-700', academic: 'bg-blue-100 text-blue-700',
    holiday: 'bg-red-100 text-red-700', ptm: 'bg-indigo-100 text-indigo-700', exam: 'bg-orange-100 text-orange-700',
    competition: 'bg-yellow-100 text-yellow-700', field_trip: 'bg-teal-100 text-teal-700'
  }[type] || 'bg-gray-100 text-gray-700')

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <PrincipalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Calendar className="w-7 h-7" />
                Events & Calendar
              </h2>
              <p className="text-indigo-100 mt-1">Schedule and manage school events and PTMs</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowPTMModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition"
              >
                <Users className="w-4 h-4" />
                Schedule PTM
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition text-sm font-semibold shadow-md"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            </div>
          </div>
        </div>

        {/* Pending Approvals Alert */}
        {pendingEvents.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2 text-lg">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow">
                <Clock className="w-4 h-4 text-white" />
              </div>
              Pending Approvals ({pendingEvents.length})
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingEvents.slice(0, 6).map(event => (
                <div key={event._id} className="bg-white rounded-xl p-4 border border-amber-100 shadow-sm cursor-pointer hover:shadow-md hover:border-amber-300 transition" onClick={() => openDetailModal(event)}>
                  <div className="font-semibold text-slate-800 truncate">{event.title}</div>
                  <div className="text-sm text-slate-500 mt-1">{new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  <span className={`inline-block mt-2 px-2.5 py-1 rounded-lg text-xs font-bold ${getTypeColor(event.eventType)}`}>{event.eventType.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters & View Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Filter className="w-5 h-5" />
              <span className="font-medium text-sm">View:</span>
            </div>
            <div className="flex rounded-xl border border-slate-200 overflow-hidden">
              <button onClick={() => setView('list')} className={`px-4 py-2 text-sm font-medium transition ${view === 'list' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>List</button>
              <button onClick={() => setView('calendar')} className={`px-4 py-2 text-sm font-medium transition ${view === 'calendar' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>Calendar</button>
            </div>
            <select value={filters.eventType} onChange={e => setFilters(f => ({ ...f, eventType: e.target.value }))} className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <option value="">All Types</option>
              {EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => setFilters(f => ({ ...f, month: f.month === 1 ? 12 : f.month - 1, year: f.month === 1 ? f.year - 1 : f.year }))} className="p-2 rounded-lg border border-slate-200 hover:bg-white hover:border-indigo-300 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-slate-700 min-w-[100px] text-center">{monthNames[filters.month - 1]} {filters.year}</span>
              <button onClick={() => setFilters(f => ({ ...f, month: f.month === 12 ? 1 : f.month + 1, year: f.month === 12 ? f.year + 1 : f.year }))} className="p-2 rounded-lg border border-slate-200 hover:bg-white hover:border-indigo-300 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* List View */}
        {view === 'list' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <LoadingSpinner />
            ) : events.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Calendar className="w-16 h-16 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">No events found</p>
                <p className="text-sm mt-1">Create a new event to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-white">Event</th>
                      <th className="px-4 py-3 text-left font-semibold text-white">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-white">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-white">Venue</th>
                      <th className="px-4 py-3 text-left font-semibold text-white">Audience</th>
                      <th className="px-4 py-3 text-left font-semibold text-white">Status</th>
                      <th className="px-4 py-3 text-center font-semibold text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.map(event => (
                      <tr key={event._id} className="hover:bg-indigo-50/30 transition">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{event.title}</div>
                          {event.isPTM && <span className="text-xs text-indigo-600 font-bold">PTM</span>}
                        </td>
                        <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getTypeColor(event.eventType)}`}>{event.eventType.toUpperCase()}</span></td>
                        <td className="px-4 py-3 text-slate-600">{new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}{event.startTime && ` • ${event.startTime}`}</td>
                        <td className="px-4 py-3 text-slate-600">{event.venue || '-'}</td>
                        <td className="px-4 py-3 text-slate-600 capitalize">{event.targetAudience?.replace('_', ' ')}</td>
                        <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(event.status)}`}>{event.status.replace('_', ' ').toUpperCase()}</span></td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => openDetailModal(event)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                <span className="text-sm text-slate-600">Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} 
                    disabled={pagination.page === 1} 
                    className="p-2 rounded-lg border border-slate-200 hover:bg-white hover:border-indigo-300 disabled:opacity-50 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} 
                    disabled={pagination.page === pagination.pages} 
                    className="p-2 rounded-lg border border-slate-200 hover:bg-white hover:border-indigo-300 disabled:opacity-50 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Calendar View */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-sm font-bold text-slate-600 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }, (_, i) => {
                const firstDay = new Date(filters.year, filters.month - 1, 1).getDay()
                const daysInMonth = new Date(filters.year, filters.month, 0).getDate()
                const day = i - firstDay + 1
                const isValidDay = day > 0 && day <= daysInMonth
                const dateStr = isValidDay ? `${filters.year}-${String(filters.month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : ''
                // Get events for this date from the calendar object
                const dayEvents = calendar[dateStr] || []
                const isToday = isValidDay && new Date().toDateString() === new Date(filters.year, filters.month - 1, day).toDateString()
                return (
                  <div key={i} className={`min-h-[90px] p-2 rounded-xl border ${isValidDay ? (isToday ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200') : 'bg-slate-50 border-slate-100'}`}>
                    {isValidDay && (
                      <>
                        <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-indigo-600' : 'text-slate-600'}`}>{day}</div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((e: any) => (
                            <div key={e._id || e.eventId} className={`text-xs px-1.5 py-0.5 rounded-md truncate font-medium ${e.isPTM ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>{e.title}</div>
                          ))}
                          {dayEvents.length > 2 && <div className="text-xs text-indigo-600 font-medium">+{dayEvents.length - 2} more</div>}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Event Detail Modal */}
        {showModal && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {selectedEvent.title}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getTypeColor(selectedEvent.eventType)}`}>{selectedEvent.eventType.toUpperCase()}</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(selectedEvent.status)}`}>{selectedEvent.status.replace('_', ' ').toUpperCase()}</span>
                  {selectedEvent.isPTM && <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700">PTM</span>}
                </div>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 grid sm:grid-cols-2 gap-4 text-sm border border-indigo-100">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Date:</span>
                    <span className="font-semibold text-slate-800">{new Date(selectedEvent.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {selectedEvent.endDate && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">End Date:</span>
                      <span className="font-semibold text-slate-800">{new Date(selectedEvent.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                  {selectedEvent.startTime && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Time:</span>
                      <span className="font-semibold text-slate-800">{selectedEvent.startTime} - {selectedEvent.endTime || 'TBD'}</span>
                    </div>
                  )}
                  {selectedEvent.venue && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Venue:</span>
                      <span className="font-semibold text-slate-800">{selectedEvent.venue}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Audience:</span>
                    <span className="font-semibold text-slate-800 capitalize">{selectedEvent.targetAudience?.replace('_', ' ')}</span>
                  </div>
                  {selectedEvent.budget && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Budget:</span>
                      <span className="font-semibold text-slate-800">₹{selectedEvent.budget.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-800 mb-2">Description</h4>
                  <p className="text-sm text-slate-600">{selectedEvent.description || 'No description'}</p>
                </div>
                {selectedEvent.ptmDetails && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
                    <h4 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      PTM Details
                    </h4>
                    <div className="text-sm text-indigo-700 space-y-2">
                      <p><strong>Classes:</strong> {selectedEvent.ptmDetails.classes?.join(', ')}</p>
                      <p><strong>Agenda:</strong> {selectedEvent.ptmDetails.agenda}</p>
                    </div>
                  </div>
                )}
                {selectedEvent.status === 'pending_approval' && (
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button onClick={() => handleApprove(selectedEvent._id)} disabled={saving} className="flex-1 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/25 disabled:opacity-50 transition">
                      {saving ? 'Processing...' : 'Approve'}
                    </button>
                    <button onClick={() => { const reason = prompt('Rejection reason:'); if (reason) handleReject(selectedEvent._id, reason) }} disabled={saving} className="flex-1 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-500/25 disabled:opacity-50 transition">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Event
                </h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/20 rounded-lg text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1.5 block">Title *</label>
                  <input type="text" value={createForm.title} onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Event Type *</label>
                    <select value={createForm.eventType} onChange={e => setCreateForm(f => ({ ...f, eventType: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
                      {EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Target Audience</label>
                    <select value={createForm.targetAudience} onChange={e => setCreateForm(f => ({ ...f, targetAudience: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all">
                      {AUDIENCES.map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>
                {createForm.targetAudience === 'specific_classes' && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Select Classes</label>
                    <div className="flex flex-wrap gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {CLASSES.map(c => (
                        <label key={c} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={createForm.targetClasses.includes(c)} onChange={e => setCreateForm(f => ({ ...f, targetClasses: e.target.checked ? [...f.targetClasses, c] : f.targetClasses.filter(x => x !== c) }))} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-sm font-medium text-slate-700">Class {c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Start Date *</label>
                    <input type="date" value={createForm.startDate} onChange={e => setCreateForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">End Date</label>
                    <input type="date" value={createForm.endDate} onChange={e => setCreateForm(f => ({ ...f, endDate: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Start Time</label>
                    <input type="time" value={createForm.startTime} onChange={e => setCreateForm(f => ({ ...f, startTime: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">End Time</label>
                    <input type="time" value={createForm.endTime} onChange={e => setCreateForm(f => ({ ...f, endTime: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Venue</label>
                    <input type="text" value={createForm.venue} onChange={e => setCreateForm(f => ({ ...f, venue: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Budget (₹)</label>
                    <input type="number" value={createForm.budget} onChange={e => setCreateForm(f => ({ ...f, budget: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1.5 block">Description</label>
                  <textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-white transition">Cancel</button>
                <button onClick={handleCreate} disabled={saving} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition">
                  {saving ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PTM Modal */}
        {showPTMModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPTMModal(false)}>
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Schedule PTM
                </h2>
                <button onClick={() => setShowPTMModal(false)} className="p-2 hover:bg-white/20 rounded-lg text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1.5 block">Title *</label>
                  <input type="text" value={ptmForm.title} onChange={e => setPtmForm(f => ({ ...f, title: e.target.value }))} placeholder="Parent-Teacher Meeting - April" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1.5 block">Date *</label>
                  <input type="date" value={ptmForm.startDate} onChange={e => setPtmForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1.5 block">Classes *</label>
                  <div className="flex flex-wrap gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {CLASSES.map(c => (
                      <label key={c} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={ptmForm.classes.includes(c)} onChange={e => setPtmForm(f => ({ ...f, classes: e.target.checked ? [...f.classes, c] : f.classes.filter(x => x !== c) }))} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm font-medium text-slate-700">Class {c}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1.5 block">Agenda</label>
                  <textarea value={ptmForm.agenda} onChange={e => setPtmForm(f => ({ ...f, agenda: e.target.value }))} rows={3} placeholder="Discussion points..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1.5 block">Venue</label>
                  <input type="text" value={ptmForm.venue} onChange={e => setPtmForm(f => ({ ...f, venue: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                <button onClick={() => setShowPTMModal(false)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-white transition">Cancel</button>
                <button onClick={handleCreatePTM} disabled={saving} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition">
                  {saving ? 'Creating...' : 'Schedule PTM'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PrincipalLayout>
  )
}
