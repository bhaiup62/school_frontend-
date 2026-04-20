// src/app/teacher-dashboard/notices/page.tsx

'use client'
import { useEffect, useState, useCallback } from 'react'
import TeacherLayout from '@/components/teacher/TeacherLayout'
import { getProfile, getNotices, postNotice, deleteNotice } from '@/services/teacherService'
import type { TeacherProfile, Notice } from '@/services/teacherService'
import { 
  Bell, Plus, Send, Trash2, X, Calendar, Clock, CheckCircle, XCircle, 
  AlertTriangle, RefreshCw, Filter, Users, User, Archive, Megaphone
} from 'lucide-react'

const TAGS = ['general', 'academic', 'event', 'holiday', 'exam', 'sports', 'urgent'] as const

export default function NoticesPage() {
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [filterTag, setFilterTag] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'deleted'>('all')

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tag, setTag] = useState<typeof TAGS[number]>('general')
  const [targetClass, setTargetClass] = useState('')
  const [targetSection, setTargetSection] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, noticesRes] = await Promise.all([
        getProfile(),
        getNotices(),
      ])
      setTeacher(profileRes.data)
      setNotices(noticesRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // SSE logic for real-time Notice Approval/Deletion updates
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/sse/stream?token=${token}`
    )

    eventSource.addEventListener('notice_status_changed', (event) => {
      const data = JSON.parse(event.data)
      setMessage({ 
        type: data.status === 'approved' ? 'success' : 'error', 
        text: `Your notice "${data.title}" was ${data.status}${data.reason ? `: ${data.reason}` : ''}`
      })
      fetchData()
    })

    eventSource.addEventListener('notice_deleted_by_principal', (event) => {
      const data = JSON.parse(event.data)
      setMessage({ 
        type: 'info', 
        text: `Your notice "${data.title}" was deleted by the Principal`
      })
      fetchData()
    })

    return () => eventSource.close()
  }, [fetchData])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Smart Dropdown Logic for the Form (Handles strict section access like "10-A")
  const assignedClassesRaw = (teacher as any)?.currentAssignedClasses || teacher?.assignedClasses || []
  const ctInfo = (teacher as any)?.currentClassTeacherOf || teacher?.classTeacherOf

  let allAssigned = [...assignedClassesRaw]
  if (ctInfo) allAssigned.push(`${ctInfo.class}-${ctInfo.section}`)

  const availableClasses = Array.from(new Set(allAssigned.map((c: string) => c.includes('-') ? c.split('-')[0] : c)))
  const allowedSections = Array.from(new Set(allAssigned.filter((c: string) => c.startsWith(`${targetClass}-`)).map((c: string) => c.split('-')[1])))
  const hasFullClassAccess = assignedClassesRaw.includes(targetClass)
  const sectionsToShow = hasFullClassAccess ? ['A', 'B', 'C', 'D', 'E'] : allowedSections

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setMessage({ type: 'error', text: 'Title and content are required.' })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const res = await postNotice({
        title: title.trim(),
        content: content.trim(),
        tag,
        targetClass: targetClass || undefined,
        targetSection: targetSection || undefined,
      })
      setNotices(prev => [res.data, ...prev])
      setShowForm(false)
      resetForm()
      setMessage({ type: 'success', text: res.message || 'Notice submitted successfully!' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to post notice.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (noticeId: string) => {
    if (!confirm('Are you sure you want to delete this notice? It will be hidden from students and parents.')) return
    try {
      await deleteNotice(noticeId)
      await fetchData()
      setMessage({ type: 'success', text: 'Notice deleted successfully.' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete notice.' })
    }
  }

  const resetForm = () => {
    setTitle('')
    setContent('')
    setTag('general')
    setTargetClass('')
    setTargetSection('')
  }

  const filteredNotices = notices.filter(n => {
    if (activeTab === 'mine' && !n.isOwn) return false
    if (activeTab === 'deleted' && !n.isDeleted) return false
    if (activeTab !== 'deleted' && n.isDeleted) return false
    if (filterTag && n.tag !== filterTag) return false
    if (filterStatus && n.status !== filterStatus) return false
    return true
  })

  const myNoticesCount = notices.filter(n => n.isOwn && !n.isDeleted).length
  const deletedCount = notices.filter(n => n.isDeleted && n.isOwn).length

  const getTargetDisplay = (notice: Notice) => {
    if (notice.targetClass === 'ALL' || !notice.targetClass) return 'All Classes'
    if (notice.targetSection === 'ALL' || !notice.targetSection) return `Class ${notice.targetClass}`
    return `Class ${notice.targetClass}-${notice.targetSection}`
  }

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
                <Megaphone className="w-7 h-7" />
                Notice Board
              </h2>
              <p className="text-purple-100 mt-1">View and broadcast official school announcements</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => fetchData()} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white border border-white/20 backdrop-blur-sm" title="Refresh">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 rounded-xl hover:bg-purple-50 transition font-bold shadow-sm">
                <Plus className="w-5 h-5" /> Post Notice
              </button>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 shadow-sm border ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
            message.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' :
            'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : 
             message.type === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0" /> :
             <Bell className="w-5 h-5 shrink-0" />}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        {/* Information Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-amber-100 rounded-xl shrink-0">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-900 text-lg">Approval Workflow</p>
              <p className="text-sm font-medium text-amber-700 mt-0.5">
                Notices targeting <strong className="text-amber-900">"All Classes"</strong> require Principal approval before being published. Notices strictly for your assigned classes are published immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Navigation & Filters */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex flex-col gap-1">
              <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} icon={Bell} label="All Notices" />
              <TabButton active={activeTab === 'mine'} onClick={() => setActiveTab('mine')} icon={User} label="My Notices" badge={myNoticesCount > 0 ? myNoticesCount : undefined} />
              <TabButton active={activeTab === 'deleted'} onClick={() => setActiveTab('deleted')} icon={Archive} label="Deleted History" badge={deletedCount > 0 ? deletedCount : undefined} />
            </div>

            {activeTab !== 'deleted' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
                  <Filter className="w-4 h-4 text-purple-600" /> Filter Notices
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">By Tag</label>
                  <select value={filterTag} onChange={e => setFilterTag(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 transition-all text-slate-700">
                    <option value="">All Tags</option>
                    {TAGS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">By Status</label>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 transition-all text-slate-700">
                    <option value="">All Statuses</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved & Live</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Notices Feed */}
          <div className="lg:col-span-9">
            {filteredNotices.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 text-center py-24 text-slate-400">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-30 text-slate-400" />
                <p className="text-xl font-display font-bold text-slate-600">No notices found</p>
                <p className="text-sm font-medium mt-1">
                  {activeTab === 'mine' ? 'You haven\'t posted any notices yet.' : 
                   activeTab === 'deleted' ? 'Your deleted history is clean.' : 
                   'There are no announcements to display right now.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotices.map((notice) => (
                  activeTab === 'deleted' ? (
                    <DeletedNoticeCard key={notice._id} notice={notice} getTargetDisplay={getTargetDisplay} />
                  ) : (
                    <NoticeCard key={notice._id} notice={notice} onDelete={handleDelete} getTargetDisplay={getTargetDisplay} />
                  )
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal: Post Notice Form */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
              
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-white shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl border border-white/20">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold">Post New Notice</h3>
                    <p className="text-purple-100 text-sm font-medium">Broadcast an official announcement</p>
                  </div>
                </div>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notice Title *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Upcoming Science Fair"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detailed Content *</label>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write the full announcement here..." rows={5}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category Tag</label>
                    <select value={tag} onChange={(e) => setTag(e.target.value as any)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-purple-500 transition-all text-slate-700">
                      {TAGS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Class</label>
                    <select value={targetClass} onChange={(e) => { setTargetClass(e.target.value); setTargetSection(''); }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-purple-500 transition-all text-slate-700">
                      <option value="">All Classes</option>
                      {availableClasses.map((cls: any) => <option key={cls} value={cls}>Class {cls}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Section</label>
                    <select value={targetSection} onChange={(e) => setTargetSection(e.target.value)} disabled={!targetClass}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-purple-500 transition-all text-slate-700 disabled:opacity-50">
                      {hasFullClassAccess ? <option value="">All Sections</option> : <option value="">Select Section</option>}
                      {sectionsToShow.map((sec: string) => <option key={sec} value={sec}>Section {sec}</option>)}
                    </select>
                  </div>
                </div>
                
                {!targetClass && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-sm font-medium text-amber-800 leading-snug">
                      Notices targeting <strong>All Classes</strong> require Principal approval before they are visible to students.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-4">
                <button onClick={() => { setShowForm(false); resetForm(); }}
                  className="flex-1 px-6 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition font-bold shadow-sm">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={saving}
                  className="flex-[2] flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-bold disabled:opacity-50 shadow-md shadow-purple-500/20">
                  <Send className="w-5 h-5" /> {saving ? 'Submitting...' : 'Post Notice'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}

// ---------------------------------------------------------
// Sub-components
// ---------------------------------------------------------

function TabButton({ active, onClick, icon: Icon, label, badge }: { active: boolean; onClick: () => void; icon: any; label: string; badge?: number }) {
  return (
    <button onClick={onClick} className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${
      active ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600' : 'text-slate-500 hover:bg-slate-50 border-l-4 border-transparent hover:text-slate-700'
    }`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${active ? 'text-purple-600' : 'text-slate-400'}`} /> {label}
      </div>
      {badge !== undefined && badge > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${active ? 'bg-purple-200 text-purple-800' : 'bg-slate-200 text-slate-600'}`}>
          {badge}
        </span>
      )}
    </button>
  )
}

function TypeBadge({ type }: { type?: string }) {
  const t = type || 'general'
  const config: Record<string, { bg: string; text: string; icon: string }> = {
    general: { bg: 'bg-slate-100', text: 'text-slate-700', icon: '📋' },
    academic: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📚' },
    event: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🎉' },
    holiday: { bg: 'bg-green-100', text: 'text-green-700', icon: '🌴' },
    exam: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '📝' },
    sports: { bg: 'bg-teal-100', text: 'text-teal-700', icon: '⚽' },
    urgent: { bg: 'bg-red-100', text: 'text-red-700', icon: '🚨' },
  }
  const { bg, text, icon } = config[t] || config.general
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${bg} ${text} flex items-center gap-1.5 border border-white shadow-sm`}>
      <span>{icon}</span> {t}
    </span>
  )
}

function StatusBadge({ status }: { status?: string }) {
  const s = status || 'pending'
  const config: Record<string, { bg: string; text: string; icon: any }> = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Clock className="w-3 h-3" /> },
    approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle className="w-3 h-3" /> },
    rejected: { bg: 'bg-rose-100', text: 'text-rose-700', icon: <XCircle className="w-3 h-3" /> },
  }
  const { bg, text, icon } = config[s] || config.pending
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${bg} ${text} flex items-center gap-1.5 border border-white shadow-sm`}>
      {icon} {s}
    </span>
  )
}

function TargetBadge({ target }: { target: string }) {
  return (
    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-white flex items-center gap-1.5 shadow-sm">
      <Users className="w-3 h-3" /> {target}
    </span>
  )
}

function NoticeCard({ notice, onDelete, getTargetDisplay }: { notice: Notice; onDelete: (id: string) => void; getTargetDisplay: (notice: Notice) => string }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group relative">
      <div className={`h-1.5 w-full bg-gradient-to-r ${
        notice.status === 'approved' ? 'from-emerald-400 to-green-500' :
        notice.status === 'pending' ? 'from-amber-400 to-orange-500' :
        notice.status === 'rejected' ? 'from-rose-400 to-red-500' : 'from-slate-300 to-slate-400'
      }`} />
      
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <TypeBadge type={notice.tag} />
          {notice.status && <StatusBadge status={notice.status} />}
          <TargetBadge target={getTargetDisplay(notice)} />
          {notice.isOwn && <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-white shadow-sm">Your Post</span>}
        </div>

        <h3 className="text-xl font-display font-bold text-slate-800 mb-3">{notice.title}</h3>
        <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
          {notice.content}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-y-4 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-purple-400" /> {notice.postedBy}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" /> {new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          {notice.isOwn && !notice.isDeleted && (
            <button onClick={() => onDelete(notice._id)} className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function DeletedNoticeCard({ notice, getTargetDisplay }: { notice: Notice; getTargetDisplay: (notice: Notice) => string }) {
  return (
    <div className="bg-slate-50 rounded-3xl border border-slate-200 border-dashed overflow-hidden opacity-75 hover:opacity-100 transition-all">
      <div className="bg-slate-200/50 px-6 py-3 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${notice.deletedByPrincipal ? 'bg-rose-500' : 'bg-slate-500'}`}>
            {notice.deletedByPrincipal ? <AlertTriangle className="w-4 h-4 text-white" /> : <Archive className="w-4 h-4 text-white" />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">{notice.deletedByPrincipal ? 'Deleted by Principal' : 'You deleted this notice'}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{notice.deletedByPrincipal ? 'Removed by Admin' : 'Hidden from timeline'}</p>
          </div>
        </div>
        {notice.deletedAt && <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{new Date(notice.deletedAt).toLocaleDateString()}</span>}
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-400 mb-2 line-through">{notice.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap line-clamp-2">{notice.content}</p>
      </div>
    </div>
  )
}