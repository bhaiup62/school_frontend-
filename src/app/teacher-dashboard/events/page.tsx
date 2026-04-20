// src/app/teacher-dashboard/events/page.tsx

'use client'

import { useState, useEffect } from 'react'
import TeacherLayout from '@/components/teacher/TeacherLayout'
import { getEvents } from '@/services/teacherService'
import { Calendar as CalendarIcon, MapPin, Clock, Users, Bell, ChevronRight, CalendarDays, RefreshCw } from 'lucide-react'

interface SchoolEvent {
  _id: string
  title: string
  description: string
  eventType: string
  date: string
  endDate?: string
  startTime?: string
  endTime?: string
  venue?: string
  targetAudience: string
  targetClasses: string[]
  status: string
}

const eventTypeConfig: Record<string, { bg: string, text: string, border: string, label: string }> = {
  academic: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Academic' },
  cultural: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Cultural' },
  sports: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Sports' },
  ptm: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'PTM' },
  holiday: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Holiday' },
  examination: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Exam' },
  meeting: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Meeting' },
  default: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: 'Event' },
}

export default function TeacherEventsPage() {
  const [events, setEvents] = useState<SchoolEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming')

  const loadEvents = async () => {
    setLoading(true)
    try {
      const res = await getEvents()
      setEvents(res.data || [])
    } catch (err) {
      console.error('Failed to load events:', err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  // Safe date comparison
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filteredEvents = events.filter(e => {
    const eventDate = new Date(e.date)
    return filter === 'upcoming' ? eventDate >= today : eventDate < today
  }).sort((a, b) => {
    // Sort upcoming ascending (closest first), past descending (most recent first)
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return filter === 'upcoming' ? dateA - dateB : dateB - dateA
  })

  const upcomingCount = events.filter(e => new Date(e.date) >= today).length

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600" />
          </div>
        </div>
      </TeacherLayout>
    )
  }

  return (
    <TeacherLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold flex items-center gap-3">
                <CalendarDays className="w-7 h-7" />
                School Calendar
              </h2>
              <p className="text-purple-100 mt-1">Stay updated with upcoming events and activities</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={loadEvents} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white border border-white/20 backdrop-blur-sm" title="Refresh">
                <RefreshCw className="w-5 h-5" />
              </button>
              {upcomingCount > 0 && (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 rounded-xl font-bold shadow-sm">
                  <Bell className="w-5 h-5" />
                  <span>{upcomingCount} Upcoming</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex gap-2 w-fit">
          <button onClick={() => setFilter('upcoming')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              filter === 'upcoming' 
                ? 'bg-purple-50 text-purple-700 border border-purple-100 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 border border-transparent'
            }`}>
            Upcoming Events
          </button>
          <button onClick={() => setFilter('past')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              filter === 'past' 
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 border border-transparent'
            }`}>
            Past Events
          </button>
        </div>

        {/* Events Feed */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <CalendarIcon className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-700 mb-2">No events found</h3>
            <p className="text-slate-500 font-medium">
              {filter === 'upcoming' ? 'Your schedule is clear. There are no upcoming events.' : 'No past events found in the database.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const config = eventTypeConfig[event.eventType.toLowerCase()] || eventTypeConfig.default
              const eventDate = new Date(event.date)
              
              return (
                <div key={event._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group">
                  {/* Status Bar */}
                  <div className={`h-1.5 w-full ${config.bg} ${config.border} border-t`} />
                  
                  <div className="p-6 flex flex-col h-full">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}>
                          {config.label}
                        </span>
                        {event.targetAudience === 'teachers' && (
                          <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                            Staff Only
                          </span>
                        )}
                      </div>
                      
                      {/* Date Badge */}
                      <div className="text-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 shrink-0 group-hover:border-purple-200 transition-colors">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</div>
                        <div className="text-2xl font-display font-bold text-purple-700 leading-none my-0.5">{eventDate.getDate()}</div>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2">{event.title}</h3>
                    <p className="text-sm font-medium text-slate-500 mb-6 line-clamp-3 flex-1">{event.description}</p>
                    
                    {/* Metadata Footer */}
                    <div className="space-y-3 pt-5 border-t border-slate-100 mt-auto">
                      {event.startTime && (
                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                          <div className="p-1.5 bg-slate-100 rounded-lg"><Clock className="w-3.5 h-3.5 text-slate-500" /></div>
                          {event.startTime} {event.endTime ? `- ${event.endTime}` : ''}
                        </div>
                      )}
                      
                      {event.venue && (
                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                          <div className="p-1.5 bg-slate-100 rounded-lg"><MapPin className="w-3.5 h-3.5 text-slate-500" /></div>
                          <span className="truncate">{event.venue}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                        <div className="p-1.5 bg-slate-100 rounded-lg"><Users className="w-3.5 h-3.5 text-slate-500" /></div>
                        <span className="capitalize truncate">
                          {event.targetAudience === 'specific' && event.targetClasses.length > 0 
                            ? `Class: ${event.targetClasses.join(', ')}` 
                            : event.targetAudience}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}