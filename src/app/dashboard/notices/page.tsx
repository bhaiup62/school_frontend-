'use client'
import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getNotices } from '@/services/studentService'
import { 
  Bell, Megaphone, CalendarDays, Users, 
  RefreshCw, Pin, FileText, Sparkles
} from 'lucide-react'

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadNotices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getNotices()
      // Support paginated data structure or flat array
      const data = res.data?.data || res.data || []
      setNotices(data)
    } catch (err) {
      console.error('Failed to load notices:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotices()
  }, [loadNotices])

  if (loading && notices.length === 0) {
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
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {/* ── Hero Banner ── */}
        <div className="bg-gradient-to-r from-navy-800 to-navy-950 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <Sparkles className="absolute bottom-6 right-10 w-24 h-24 text-gold-400/10 rotate-12 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                <Bell className="w-10 h-10 text-gold-400" />
              </div>
              <div>
                <p className="text-navy-200 text-sm font-bold uppercase tracking-wider mb-1">Stay Informed</p>
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
                  Notice Board
                </h2>
                <p className="text-sm font-medium text-navy-100 mt-2 max-w-md">
                  Official announcements, academic updates, and school-wide alerts.
                </p>
              </div>
            </div>
            
             <button 
  onClick={loadNotices} 
  className="p-3.5 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all text-slate-900 font-bold border border-amber-400 shadow-lg flex items-center justify-center shrink-0 w-fit md:mt-0 mt-4 z-20"
  title="Refresh"
>
  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
</button>
          </div>
        </div>

        {/* ── Notices List ── */}
        <div className="space-y-4">
          {notices.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
              <Megaphone className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-1">No Active Notices</h3>
              <p className="text-slate-500 font-medium">You're all caught up! There are no new announcements right now.</p>
            </div>
          ) : (
            notices.map((notice) => {
              const isSchoolWide = notice.targetClass === 'ALL'
              
              return (
                <div key={notice._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative">
                  
                  {/* Notice Type Indicator Strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${isSchoolWide ? 'bg-navy-600' : 'bg-gold-500'}`}></div>

                  <div className="p-6 sm:p-8 pl-8 sm:pl-10">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {isSchoolWide ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-navy-50 text-navy-700 border border-navy-100">
                              <Users className="w-3 h-3" /> School-Wide
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gold-500/10 text-gold-700 border border-gold-500/20">
                              <Pin className="w-3 h-3" /> Class Specific
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            <CalendarDays className="w-3 h-3" /> 
                            {new Date(notice.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        
                        <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-800 group-hover:text-navy-700 transition-colors">
                          {notice.title}
                        </h3>
                      </div>
                      
                      <div className="shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 shadow-sm">
                          By: {notice.createdByRole}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                        {notice.content}
                      </p>
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