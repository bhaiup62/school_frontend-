'use client'
import { useEffect, useState, useCallback } from 'react'
import ParentLayout from '@/components/parent/ParentLayout'
import { getParentNotices } from '@/services/parentService'
import { useSSE, NoticePostedEvent } from '@/services/sseService'
import { Bell, Wifi, RefreshCw, Calendar, User } from 'lucide-react'

// Beautiful matching colors mapped exactly to the Notice model enums
const tagColors: Record<string, string> = {
  exam:     'bg-rose-100 text-rose-700 border-rose-200',
  holiday:  'bg-blue-100 text-blue-700 border-blue-200',
  event:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  meeting:  'bg-amber-100 text-amber-700 border-amber-200',
  fee:      'bg-purple-100 text-purple-700 border-purple-200',
  academic: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  sports:   'bg-orange-100 text-orange-700 border-orange-200',
  urgent:   'bg-red-100 text-red-700 border-red-300 font-bold',
  general:  'bg-slate-100 text-slate-700 border-slate-200',
}

export default function ParentNoticesPage() {
  const [notices, setNotices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('All')
  const [newNotice, setNewNotice] = useState<string | null>(null)

  const loadData = useCallback(() => {
    setLoading(true)
    getParentNotices()
      .then(res => setNotices(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle live notice updates via SSE
  const handleNoticePosted = useCallback((data: NoticePostedEvent) => {
    setNotices(prev => [{
      _id: data._id,
      title: data.title,
      tag: data.tag,
      content: data.content || data.message,
      date: data.date,
      postedBy: data.postedBy,
      createdAt: data.createdAt,
      isNew: true, // Flag to highlight live notices
    }, ...prev])
    
    setNewNotice(`New announcement: ${data.title}`)
    setTimeout(() => setNewNotice(null), 6000)
  }, [])

  // Connect to SSE safely
  useSSE({
    onNoticePosted: handleNoticePosted,
  }, !loading)

  const tags     = ['All', ...Array.from(new Set(notices.map((n: any) => n.tag)))]
  const filtered = filter === 'All' ? notices : notices.filter((n: any) => n.tag === filter)

  if (loading && notices.length === 0) return (
    <ParentLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    </ParentLayout>
  )

  return (
    <ParentLayout>
      <div className="space-y-6 max-w-5xl mx-auto relative">

        {/* Live notice toast notification */}
        {newNotice && (
          <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span className="text-sm font-bold tracking-wide">{newNotice}</span>
          </div>
        )}

        {/* Hero Header with Refresh */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                <Bell className="w-8 h-8" /> Notice Board
              </h1>
              <p className="text-emerald-100 font-medium">
                Important announcements and updates from the school
              </p>
            </div>
            <button 
              onClick={loadData}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white border border-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 w-fit shadow-sm"
              title="Refresh Notices"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dynamic Filter Pills */}
        {notices.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mr-2">Filter:</span>
            {tags.map(tag => (
              <button key={tag} onClick={() => setFilter(tag)}
                className={`px-4 py-1.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 border ${
                  filter === tag 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                }`}>
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Notices List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-1">No Announcements</h3>
              <p className="text-slate-500 font-medium">There are currently no active notices for your filtered view.</p>
            </div>
          ) : (
            filtered.map((notice: any, i: number) => (
              <div key={notice._id || i} className={`bg-white rounded-3xl border shadow-sm p-6 sm:p-8 transition-all duration-300 hover:shadow-md ${notice.isNew ? 'border-emerald-400 ring-4 ring-emerald-50' : 'border-slate-200'}`}>
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${tagColors[notice.tag?.toLowerCase()] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      <Bell className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider border ${tagColors[notice.tag?.toLowerCase()] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {notice.tag}
                        </span>
                        {notice.isNew && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider bg-emerald-500 text-white animate-pulse">
                            New
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-navy-900 mt-1">{notice.title}</h2>
                    </div>
                  </div>
                  
                  <div className="flex items-center sm:flex-col sm:items-end gap-3 sm:gap-1 text-slate-500 shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> 
                      {new Date(notice.createdAt || notice.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap pl-0 sm:pl-16">
                  {notice.content}
                </div>

                {notice.postedBy && (
                  <div className="mt-6 pl-0 sm:pl-16 flex items-center gap-2 text-sm">
                    <span className="text-slate-400 font-medium">Issued by:</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-navy-800 font-bold">
                      <User className="w-3.5 h-3.5 text-slate-400" /> {notice.postedBy}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </ParentLayout>
  )
}