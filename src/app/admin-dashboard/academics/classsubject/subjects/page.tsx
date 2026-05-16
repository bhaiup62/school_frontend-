// src/app/admin-dashboard/academics/subjects/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { getSubjectsBySession, createSubject, toggleSubjectStatus } from '@/services/admin/classSubjectService'
import { getAllSessions } from '@/services/admin/academicService'
import { 
  BookOpen, ArrowLeft, RefreshCw, Plus, 
  CheckCircle2, XCircle, Search, Settings, X
} from 'lucide-react'

export default function SubjectMasterPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectName: '',
    type: 'Core',
    maxMarks: 100,
    passMarks: 33,
    hasPractical: false
  })

  // 1. Load Sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await getAllSessions()
        setSessions(res.data.data)
        const current = res.data.data.find((s: any) => s.isCurrentSession)
        if (current) setSelectedSessionId(current._id)
        else if (res.data.data.length > 0) setSelectedSessionId(res.data.data[0]._id)
      } catch (error) {
        console.error('Failed to load sessions', error)
      }
    }
    fetchSessions()
  }, [])

  // 2. Load Subjects
  const loadSubjects = async () => {
    if (!selectedSessionId) return
    setIsRefreshing(true)
    try {
      const res = await getSubjectsBySession(selectedSessionId)
      setSubjects(res.data.data)
    } catch (error) {
      console.error('Failed to load subjects', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadSubjects()
  }, [selectedSessionId])

  // Actions
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createSubject({ ...formData, academicSession: selectedSessionId })
      setShowModal(false)
      setFormData({ subjectCode: '', subjectName: '', type: 'Core', maxMarks: 100, passMarks: 33, hasPractical: false })
      loadSubjects()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create subject.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleSubjectStatus(id)
      loadSubjects()
    } catch (error) {
      alert('Failed to toggle status.')
    }
  }

  const filteredSubjects = subjects.filter(sub => 
    sub.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sub.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-2">
          <Link href="/admin-dashboard/academics/classsubject" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Classes & Subjects
          </Link>
          <button onClick={loadSubjects} disabled={isRefreshing} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} /> Refresh
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" /> Subject Master
            </h1>
            <p className="text-slate-500 text-sm mt-1">Define the global syllabus catalog for the academic year.</p>
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
              <Plus className="w-4 h-4" /> New Subject
            </button>
          </div>
        </div>

        {/* Toolbar & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by code or name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition-colors"
            />
          </div>
          <div className="text-sm font-bold text-slate-500">
            Total: {filteredSubjects.length}
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
             <div className="col-span-full flex justify-center py-10"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
          ) : filteredSubjects.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No subjects found</h3>
              <p className="text-slate-500 text-sm mt-1">Create your first subject to start building the syllabus.</p>
            </div>
          ) : (
            filteredSubjects.map(sub => (
              <div key={sub._id} className={`bg-white rounded-2xl border ${sub.isActive ? 'border-slate-200 hover:border-indigo-300 hover:shadow-md' : 'border-slate-200 opacity-60'} p-5 transition-all relative overflow-hidden group`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200">
                      {sub.subjectCode}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{sub.subjectName}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    sub.type === 'Core' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                    sub.type === 'Elective' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    sub.type === 'Optional' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    {sub.type}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-sm">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Max Marks</p>
                    <p className="font-medium text-slate-700">{sub.maxMarks}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Pass Marks</p>
                    <p className="font-medium text-slate-700">{sub.passMarks}</p>
                  </div>
                  <div className="col-span-2 flex items-center justify-between mt-2">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      {sub.hasPractical ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> : <XCircle className="w-3.5 h-3.5 text-slate-300"/>} 
                      Practical Included
                    </span>
                    
                    <button 
                      onClick={() => handleToggleStatus(sub._id)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${sub.isActive ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                    >
                      {sub.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-slate-800">Add New Subject</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreateSubject} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Subject Name *</label>
                  <input type="text" required placeholder="e.g. Mathematics" value={formData.subjectName} onChange={e => setFormData({...formData, subjectName: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Subject Code *</label>
                  <input type="text" required placeholder="e.g. MATH-101" value={formData.subjectCode} onChange={e => setFormData({...formData, subjectCode: e.target.value.toUpperCase()})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Type *</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="Core">Core</option>
                    <option value="Elective">Elective</option>
                    <option value="Optional">Optional</option>
                    <option value="Co-Scholastic">Co-Scholastic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Max Marks *</label>
                  <input type="number" required min="1" value={formData.maxMarks} onChange={e => setFormData({...formData, maxMarks: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Pass Marks *</label>
                  <input type="number" required min="1" value={formData.passMarks} onChange={e => setFormData({...formData, passMarks: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <input type="checkbox" id="practical" checked={formData.hasPractical} onChange={e => setFormData({...formData, hasPractical: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                  <label htmlFor="practical" className="text-sm font-bold text-slate-700 cursor-pointer">This subject includes practical exams/labs</label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm disabled:opacity-70 transition-colors shadow-lg shadow-indigo-600/20">
                  {isSubmitting ? 'Saving...' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
