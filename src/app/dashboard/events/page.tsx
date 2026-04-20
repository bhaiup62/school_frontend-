'use client'
import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getEvents } from '@/services/studentService'
import { 
  CalendarDays, MapPin, Clock, PartyPopper, 
  RefreshCw, Sparkles, Info
} from 'lucide-react'

export default function StudentEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getEvents()
      // Extract from paginated response
      const data = res.data?.data || res.data || []
      setEvents(data)
    } catch (err) {
      console.error('Failed to load events:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  if (loading && events.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-navy-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* ── Hero Banner ── */}
        <div className="bg-gradient-to-r from-navy-800 to-navy-950 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <Sparkles className="absolute bottom-6 right-10 w-24 h-24 text-gold-400/10 rotate-12 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                <PartyPopper className="w-10 h-10 text-gold-400" />
              </div>
              <div>
                <p className="text-navy-200 text-sm font-bold uppercase tracking-wider mb-1">Campus Life</p>
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
                  School Events
                </h2>
                <p className="text-sm font-medium text-navy-100 mt-2 max-w-md">
                  Discover upcoming sports meets, cultural festivals, holidays, and extracurricular activities.
                </p>
              </div>
            </div>
            
           <button 
  onClick={loadEvents} 
  className="p-3.5 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all text-slate-900 font-bold border border-amber-400 shadow-lg flex items-center justify-center shrink-0 w-fit md:mt-0 mt-4 z-20"
  title="Refresh"
>
  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
</button>
          </div>
        </div>

        {/* ── Events Timeline ── */}
        <div className="space-y-6 relative">
          
          {/* Vertical connecting line for desktop timeline feel */}
          <div className="hidden md:block absolute left-12 top-8 bottom-8 w-0.5 bg-slate-200/60 z-0"></div>

          {events.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm relative z-10">
              <CalendarDays className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-1">No Upcoming Events</h3>
              <p className="text-slate-500 font-medium">Check back later for new school activities and holidays.</p>
            </div>
          ) : (
            events.map((event, idx) => {
              // Parse dates safely
              const eventDate = new Date(event.date || event.eventDate || event.createdAt)
              const month = eventDate.toLocaleDateString('en-US', { month: 'short' })
              const day = eventDate.toLocaleDateString('en-US', { day: '2-digit' })
              
              // Check if event is in the past
              const isPast = eventDate < new Date(new Date().setHours(0,0,0,0))
              
              return (
                <div key={event._id || idx} className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-8 group">
                  
                  {/* Date Badge (Calendar Tear-off style) */}
                  <div className="shrink-0 flex md:flex-col items-center md:w-24 gap-3 md:gap-0">
                    <div className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl flex flex-col items-center justify-center border shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                      isPast 
                        ? 'bg-slate-50 border-slate-200 text-slate-400' 
                        : 'bg-white border-navy-100 text-navy-900'
                    }`}>
                      <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${isPast ? 'text-slate-400' : 'text-gold-500'}`}>
                        {month}
                      </span>
                      <span className="text-2xl md:text-4xl font-display font-bold leading-none mt-1">
                        {day}
                      </span>
                    </div>
                    {/* Status Badge */}
                    <div className="md:mt-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isPast 
                          ? 'bg-slate-100 text-slate-500 border-slate-200' 
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {isPast ? 'Completed' : 'Upcoming'}
                      </span>
                    </div>
                  </div>

                  {/* Event Details Card */}
                  <div className={`flex-1 rounded-3xl border p-6 sm:p-8 transition-all duration-300 ${
                    isPast 
                      ? 'bg-slate-50/50 border-slate-200 opacity-80 hover:opacity-100' 
                      : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-navy-200'
                  }`}>
                    
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className={`text-xl sm:text-2xl font-display font-bold ${isPast ? 'text-slate-600' : 'text-navy-900'}`}>
                          {event.title || event.name}
                        </h3>
                        {event.organizer && (
                          <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5" /> Organized by {event.organizer}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className={`mb-6 leading-relaxed ${isPast ? 'text-slate-500' : 'text-slate-700'}`}>
                      {event.description || 'Join us for this upcoming school event. More details will be shared by your class teacher soon.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
                      {event.time && (
                        <div className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg border ${
                          isPast ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-navy-50 text-navy-700 border-navy-100'
                        }`}>
                          <Clock className="w-4 h-4" /> {event.time}
                        </div>
                      )}
                      
                      {event.location && (
                        <div className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg border ${
                          isPast ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          <MapPin className="w-4 h-4" /> {event.location}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}