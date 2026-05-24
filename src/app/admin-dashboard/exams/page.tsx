'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { getActiveExams, createExam, updateExamStatus } from '@/services/admin/examService'
import { getClasses } from '@/services/admin/academicService'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useToast } from '@/components/ui/ToastProvider'
import { Award, Plus, Calendar as CalendarIcon, CheckCircle2, FileText, Settings, X, ChevronRight } from 'lucide-react'

export default function ExamDashboardPage() {
  const { handleError } = useErrorHandler()
  const toast = useToast()

  const [exams, setExams] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Unit Test',
    startDate: '',
    endDate: '',
    selectedClasses: [] as string[]
  })

  const loadData = async () => {
    setIsRefreshing(true)
    try {
      const [examsRes, classesRes] = await Promise.all([
        getActiveExams(),
        getClasses()
      ])
      setExams(examsRes.data || [])
      
      // Handle the Axios wrapper for classes
      const classesData = classesRes.data?.data || classesRes.data || classesRes
      setClasses(Array.isArray(classesData) ? classesData : [])
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.selectedClasses.length === 0) {
      toast.error('Please select at least one class for this exam.')
      return
    }

    setIsSubmitting(true)
    try {
      await createExam({
        name: formData.name,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        classes: formData.selectedClasses
      })
      toast.success('Exam created successfully!')
      setShowModal(false)
      setFormData({ name: '', type: 'Unit Test', startDate: '', endDate: '', selectedClasses: [] })
      loadData()
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleClassSelection = (classId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(classId)
        ? prev.selectedClasses.filter(id => id !== classId)
        : [...prev.selectedClasses, classId]
    }))
  }

  const handleStatusChange = async (examId: string, newStatus: string) => {
    try {
      await updateExamStatus(examId, newStatus)
      toast.success(`Exam status updated to ${newStatus}`)
      loadData()
    } catch (error) {
      handleError(error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Ongoing': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Results Published': return 'bg-purple-50 text-purple-700 border-purple-200'
      default: return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-600" /> Exam Engine Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage examinations, scheduling, grading, and result generation.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Create New Exam
          </button>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
             <div className="col-span-full flex justify-center py-10"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
          ) : exams.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Award className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No Exams Found</h3>
              <p className="text-slate-500 text-sm mt-1">Click "Create New Exam" to schedule your first examination.</p>
            </div>
          ) : (
            exams.map(exam => (
              <div key={exam._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200">
                      {exam.type}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{exam.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5" /> 
                      {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <select 
                    value={exam.status}
                    onChange={(e) => handleStatusChange(exam._id, e.target.value)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer appearance-none ${getStatusColor(exam.status)}`}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Results Published">Results Published</option>
                  </select>
                </div>

                <div className="p-5 bg-slate-50 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Participating Classes</p>
                  <div className="flex flex-wrap gap-2">
                    {exam.classes?.map((c: any) => (
                      <span key={c._id} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-md">
                        {c.className}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white mt-auto">
                  <Link href={`/admin-dashboard/exams/${exam._id}/schedule`} className="flex flex-col items-center justify-center p-4 hover:bg-slate-50 transition-colors group">
                    <CalendarIcon className="w-5 h-5 text-indigo-500 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-600">Scheduler</span>
                  </Link>
                  <Link href={`/admin-dashboard/exams/${exam._id}/marks`} className="flex flex-col items-center justify-center p-4 hover:bg-slate-50 transition-colors group">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-600">Marks Entry</span>
                  </Link>
                  <Link href={`/admin-dashboard/exams/${exam._id}/results`} className="flex flex-col items-center justify-center p-4 hover:bg-slate-50 transition-colors group">
                    <FileText className="w-5 h-5 text-amber-500 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-600">Results</span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE EXAM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-800">Create New Exam</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleCreateExam} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Exam Name *</label>
                  <input type="text" required placeholder="e.g. Half-Yearly Examination 2026" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Exam Type *</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="Unit Test">Unit Test</option>
                    <option value="Mid Term">Mid Term</option>
                    <option value="Final">Final</option>
                    <option value="Practical">Practical</option>
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
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Select Participating Classes *</label>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-2 grid grid-cols-2 gap-2">
                    {classes.map(c => (
                      <label key={c._id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${formData.selectedClasses.includes(c._id) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                        <input type="checkbox" checked={formData.selectedClasses.includes(c._id)} onChange={() => toggleClassSelection(c._id)} className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                        <span className="text-sm font-bold text-slate-700">{c.className}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm disabled:opacity-70 transition-colors shadow-lg shadow-indigo-600/20">
                    {isSubmitting ? 'Creating...' : 'Create Exam'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}