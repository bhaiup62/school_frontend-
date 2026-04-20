'use client'

import { useState, useEffect, useCallback } from 'react'
import ParentLayout from '@/components/parent/ParentLayout'
import { getUpcomingEvents } from '@/services/parentService'
import { Calendar, MapPin, Clock, Users, Tag, RefreshCw, CalendarDays, Sparkles } from 'lucide-react'

interface Event {
  _id: string
  title: string
  description: string
  eventType: string
  date: string
  startTime?: string
  endTime?: string
  venue?: string
  targetAudience: string
  targetClasses: string[]
  status: string
  createdAt: string
}

// Modern color mapping for different event types
const eventTypeColors: Record<string, string> = {
  academic: 'bg-blue-100 text-blue-700 border-blue-200',
  cultural: 'bg-purple-100 text-purple-700 border-purple-200',
  sports: 'bg-orange-100 text-orange-700 border-orange-200',
  ptm: 'bg-amber-100 text-amber-700 border-amber-200',
  holiday: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  exam: 'bg-rose-100 text-rose-700 border-rose-200',
  field_trip: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  competition: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
}

export default function ParentEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming')

  const loadData = useCallback(() => {
    setLoading(true)
    getUpcomingEvents()
      .then(res => setEvents(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Date comparison logic for the tabs
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filteredEvents = events.filter(e => {
    const eventDate = new Date(e.date)
    return filter === 'upcoming' ? eventDate >= today : eventDate < today
  }).sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return filter === 'upcoming' ? dateA - dateB : dateB - dateA
  })

  if (loading && events.length === 0) return (
    <ParentLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    </ParentLayout>
  )

  return (
    <ParentLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* Hero Header with Refresh */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                <CalendarDays className="w-8 h-8" /> School Calendar
              </h1>
              <p className="text-emerald-100 font-medium">
                Stay updated with school activities, holidays, and meetings
              </p>
            </div>
            <button 
              onClick={loadData}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white border border-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 w-fit shadow-sm"
              title="Refresh Events"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex gap-2 w-fit">
          <button onClick={() => setFilter('upcoming')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              filter === 'upcoming' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm' 
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

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-emerald-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-1">No {filter === 'upcoming' ? 'Upcoming' : 'Past'} Events</h3>
            <p className="text-slate-500 font-medium">
              {filter === 'upcoming' ? 'Your schedule is clear. There are no events scheduled for the near future.' : 'No past events found.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredEvents.map((event) => {
              const eventDate = new Date(event.date);
              const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
              const day = eventDate.getDate();
              const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'long' });

              return (
                <div key={event._id} className={`bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-6 group overflow-hidden relative ${filter === 'past' ? 'opacity-80 hover:opacity-100' : ''}`}>
                  
                  {/* Left Calendar Block */}
                  <div className="shrink-0 flex flex-col items-center justify-center w-24 h-28 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-600">{month}</span>
                    <span className="text-4xl font-display font-bold text-navy-900 my-1 group-hover:text-emerald-700">{day}</span>
                    <span className="text-xs font-semibold text-slate-500">{dayName}</span>
                  </div>

                  {/* Right Details Block */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${eventTypeColors[event.eventType?.toLowerCase()] || eventTypeColors.other}`}>
                        {event.eventType.replace('_', ' ')}
                      </span>
                      {event.targetAudience === 'parents' && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Parents Only
                        </span>
                      )}
                      {filter === 'past' && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                          Completed
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-slate-600 font-medium leading-relaxed mb-5">
                      {event.description || 'No description provided.'}
                    </p>
                    
                    {/* Info Pills */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {event.startTime && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 font-semibold">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{event.startTime} {event.endTime ? `- ${event.endTime}` : ''}</span>
                        </div>
                      )}
                      
                      {event.venue && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 font-semibold">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="truncate max-w-[200px]">{event.venue}</span>
                        </div>
                      )}

                      {event.targetClasses && event.targetClasses.length > 0 && event.targetClasses[0] !== 'ALL' && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 font-semibold">
                          <Tag className="w-4 h-4 text-slate-400" />
                          <span className="truncate max-w-[150px]">Classes: {event.targetClasses.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Decorative Background Element */}
                  {filter === 'upcoming' && (
                    <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-slate-50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 rotate-12" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ParentLayout>
  )
}