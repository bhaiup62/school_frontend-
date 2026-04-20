'use client'
import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getTimetable } from '@/services/studentService'
import { 
  Clock, Calendar, BookOpen, User, MapPin, 
  Coffee, RefreshCw, AlertTriangle 
} from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function StudentTimetablePage() {
  const [schedule, setSchedule] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)
  const [activeDay, setActiveDay] = useState('Monday')

  const loadTimetable = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getTimetable()
      const data = res.data || res
      setSchedule(data || [])
      setIsFallback(res.fallback || false)

      // Default to today if it's a weekday
      const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' })
      if (DAYS.includes(todayStr)) {
        setActiveDay(todayStr)
      }
    } catch (err) {
      console.error('Failed to load timetable:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTimetable()
  }, [loadTimetable])

  if (loading && schedule.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-navy-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    )
  }

  const activeSchedule = schedule.find(s => s.day === activeDay)?.periods || []

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* ── Hero Banner ── */}
        <div className="bg-gradient-to-r from-navy-800 to-navy-950 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                <Calendar className="w-10 h-10 text-gold-400" />
              </div>
              <div>
                <p className="text-navy-200 text-sm font-bold uppercase tracking-wider mb-1">Academic Planner</p>
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
                  Class Timetable
                </h2>
                {isFallback && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 bg-amber-500/20 border border-amber-500/30 text-amber-200 rounded-lg text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5" /> Showing Default Schedule
                  </div>
                )}
              </div>
            </div>
            
             <button 
  onClick={loadTimetable} 
  className="p-3.5 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all text-slate-900 font-bold border border-amber-400 shadow-lg flex items-center justify-center shrink-0 w-fit md:mt-0 mt-4 z-20"
  title="Refresh"
>
  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
</button>
          </div>
        </div>

        {/* ── Days Navigation Tabs ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm overflow-x-auto flex gap-2 hide-scrollbar">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeDay === day 
                  ? 'bg-navy-900 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-navy-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* ── Timeline View ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
            <Clock className="w-6 h-6 text-navy-600" />
            <h3 className="text-2xl font-display font-bold text-slate-800">{activeDay}'s Schedule</h3>
          </div>

          {activeSchedule.length === 0 ? (
            <div className="text-center py-16">
              <Coffee className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-1">No Classes Scheduled</h3>
              <p className="text-slate-500 font-medium">Enjoy your day off!</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 space-y-8 pb-4">
              {activeSchedule.map((period: any, idx: number) => {
                
                // Unified Data Handling (Supports both old fallback strings and new DB objects)
                const isStringFallback = typeof period === 'string';
                const subject = isStringFallback ? period : period.subject;
                const isBreak = isStringFallback ? period === '—' : period.isBreak;
                const periodNum = isStringFallback ? idx + 1 : period.periodNumber;

                // Render Break/Recess Card
                if (isBreak || subject === '—') {
                  return (
                    <div key={idx} className="relative pl-6 sm:pl-8">
                      <div className="absolute w-4 h-4 bg-amber-400 rounded-full -left-[9px] top-4 ring-4 ring-white"></div>
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 justify-center sm:justify-start text-amber-700">
                          <Coffee className="w-5 h-5" />
                          <p className="text-sm font-bold uppercase tracking-widest">Recess / Break</p>
                        </div>
                        {!isStringFallback && period.startTime && (
                          <p className="text-center sm:text-left text-xs font-bold text-amber-600 mt-2 opacity-80">
                            {period.startTime} - {period.endTime}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                }

                // Render Standard Class Card
                return (
                  <div key={idx} className="relative pl-6 sm:pl-8 group">
                    <div className="absolute w-4 h-4 bg-navy-300 rounded-full -left-[9px] top-5 ring-4 ring-white group-hover:bg-gold-500 transition-colors duration-300"></div>
                    
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm group-hover:border-navy-300 group-hover:shadow-md transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-navy-50 text-navy-700 font-bold flex items-center justify-center text-sm border border-navy-100">
                            {periodNum}
                          </span>
                          <h4 className="font-bold text-slate-800 text-lg sm:text-xl">{subject}</h4>
                        </div>
                        
                        {!isStringFallback && period.startTime && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-600 bg-navy-50 px-3 py-1.5 rounded-lg border border-navy-100">
                            <Clock className="w-3.5 h-3.5" />
                            {period.startTime} - {period.endTime}
                          </span>
                        )}
                      </div>

                      {/* Display extra DB fields if available */}
                      {!isStringFallback && (period.teacher || period.room) && (
                        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100">
                          {period.teacher && (
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                              <User className="w-4 h-4 text-slate-400" />
                              {period.teacher}
                            </div>
                          )}
                          {period.room && (
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              Room: {period.room}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* Hide scrollbar for tabs */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </DashboardLayout>
  )
}