// src/app/admin-dashboard/academics/classsubject/classes/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  getClassById, addSectionToClass, assignClassTeacher,
  getSubjectsForClass, assignSubjectToClass, removeSubjectFromClass, 
  getSubjectsBySession, getAcademicsTeachers, updateSubjectMapping
} from '@/services/admin/classSubjectService'
import { 
  ArrowLeft, RefreshCw, Plus, Users, 
  UserPlus, X, BookOpen, Trash2, Edit
} from 'lucide-react'

const formatTeacherName = (t: any) => {
  if (!t) return 'Unknown'
  const name = t.name || t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Unknown Teacher'
  const id = t.employeeId || t.teacherId || ''
  return id ? `${name} (${id})` : name
}

export default function ClassConfigurationPage() {
  const params = useParams()
  const classId = params.id as string

  // Global Data States
  const [classData, setClassData] = useState<any>(null)
  const [teachers, setTeachers] = useState<any[]>([])
  const [masterSubjects, setMasterSubjects] = useState<any[]>([])
  const [mappedSubjects, setMappedSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Modals State
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [editingMappingId, setEditingMappingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form States
  const [sectionForm, setSectionForm] = useState({ sectionName: '', capacity: 40, classTeacher: '' })
  const [teacherForm, setTeacherForm] = useState({ sectionName: '', teacherId: '' })
  const [subjectForm, setSubjectForm] = useState<{
    subjectId: string; periodsPerWeek: number; isMandatory: boolean; teachers: string[]
  }>({ subjectId: '', periodsPerWeek: 5, isMandatory: true, teachers: [] })

  const fetchData = async () => {
    setIsRefreshing(true)
    try {
      const [classRes, mappedRes, teacherRes] = await Promise.all([
        getClassById(classId),
        getSubjectsForClass(classId),
        getAcademicsTeachers()
      ])
      
      const classInfo = classRes.data.data
      setClassData(classInfo)
      setMappedSubjects(mappedRes.data.data)
      setTeachers(teacherRes.data.data || teacherRes.data || [])

      if (classInfo?.academicSession) {
        const masterRes = await getSubjectsBySession(classInfo.academicSession)
        setMasterSubjects(masterRes.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch class config data', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (classId) fetchData()
  }, [classId])

  // --- SECTION ACTIONS ---
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        sectionName: sectionForm.sectionName.toUpperCase(),
        capacity: Number(sectionForm.capacity),
        classTeacher: sectionForm.classTeacher || undefined
      }
      await addSectionToClass(classId, payload)
      setShowSectionModal(false)
      setSectionForm({ sectionName: '', capacity: 40, classTeacher: '' })
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add section.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await assignClassTeacher(classId, teacherForm.sectionName, teacherForm.teacherId)
      setShowTeacherModal(false)
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to assign teacher.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- SUBJECT MAPPING ACTIONS ---
  const openNewSubjectModal = () => {
    setEditingMappingId(null)
    setSubjectForm({ subjectId: '', periodsPerWeek: 5, isMandatory: true, teachers: [] })
    setShowSubjectModal(true)
  }

  const openEditSubjectModal = (mapping: any) => {
    setEditingMappingId(mapping._id)
    setSubjectForm({ 
      subjectId: mapping.subjectId._id, 
      periodsPerWeek: mapping.periodsPerWeek, 
      isMandatory: mapping.isMandatory, 
      teachers: mapping.teachers?.map((t: any) => t._id) || []
    })
    setShowSubjectModal(true)
  }

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingMappingId) {
        // Edit Mode
        await updateSubjectMapping(editingMappingId, {
          isMandatory: subjectForm.isMandatory,
          periodsPerWeek: subjectForm.periodsPerWeek,
          teachers: subjectForm.teachers
        })
      } else {
        // Create Mode
        await assignSubjectToClass(classId, {
          academicSession: classData.academicSession,
          ...subjectForm
        })
      }
      setShowSubjectModal(false)
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save subject.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveSubject = async (mappingId: string) => {
    if (!window.confirm('Are you sure you want to remove this subject from the class?')) return
    try {
      await removeSubjectFromClass(mappingId)
      fetchData()
    } catch (error: any) {
      alert('Failed to remove subject.')
    }
  }

  const handleTeacherToggle = (teacherId: string) => {
    setSubjectForm(prev => {
      const exists = prev.teachers.includes(teacherId)
      return {
        ...prev,
        teachers: exists ? prev.teachers.filter(id => id !== teacherId) : [...prev.teachers, teacherId]
      }
    })
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" /></div></AdminLayout>
  if (!classData) return <AdminLayout><div className="text-center py-20 text-slate-500">Class not found.</div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-2">
          <Link href="/admin-dashboard/academics/classsubject/classes" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Classes
          </Link>
          <button onClick={fetchData} disabled={isRefreshing} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} /> Refresh
          </button>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${classData.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                {classData.isActive ? 'Active Class' : 'Inactive'}
              </span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200">
                {classData.board} • {classData.medium}
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900">{classData.displayName}</h1>
          </div>
          <div className="flex gap-4">
            <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Capacity</p>
              <p className="text-xl font-bold text-slate-800">{classData.totalCapacity}</p>
            </div>
            <div className="px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider mb-0.5">Available Seats</p>
              <p className="text-xl font-bold text-emerald-700">{classData.availableSeats}</p>
            </div>
          </div>
        </div>

        {/* ── SECTIONS AREA ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" /> Class Sections
              </h2>
            </div>
            <button onClick={() => setShowSectionModal(true)} className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Add Section
            </button>
          </div>

          <div className="p-6">
            {classData.sections?.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No sections added yet.</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classData.sections.map((section: any, idx: number) => (
                  <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="flex justify-between items-center p-3 bg-slate-50 border-b border-slate-100">
                      <h3 className="font-bold text-slate-800">Section {section.sectionName}</h3>
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-600">{section.capacity} Seats</span>
                    </div>
                    <div className="p-4 bg-white flex items-center justify-between">
                      {section.classTeacher ? (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Class Teacher</p>
                          <p className="font-bold text-sm text-slate-800">{formatTeacherName(section.classTeacher)}</p>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-rose-400 italic">Unassigned</p>
                      )}
                      <button onClick={() => { setTeacherForm({ sectionName: section.sectionName, teacherId: section.classTeacher?._id || '' }); setShowTeacherModal(true); }} className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200">
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── SUBJECT MAPPING AREA ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" /> Syllabus & Subjects
              </h2>
              <p className="text-xs text-slate-500 mt-1">Map subjects from the master catalog and assign subject teachers.</p>
            </div>
            <button onClick={openNewSubjectModal} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Map Subject
            </button>
          </div>

          <div className="p-6">
            {mappedSubjects.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700">No subjects mapped</h3>
                <p className="text-sm text-slate-500 mt-1">Map subjects to build the timetable and grading schema.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {mappedSubjects.map(mapping => (
                  <div key={mapping._id} className="border border-slate-200 p-4 rounded-xl hover:border-indigo-200 transition-colors bg-white relative group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded border border-slate-200">
                          {mapping.subjectId?.subjectCode}
                        </span>
                        <h3 className="font-bold text-slate-900 mt-1">{mapping.subjectId?.subjectName}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-0.5 mr-2 rounded text-[10px] font-bold uppercase ${mapping.isMandatory ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {mapping.isMandatory ? 'Mandatory' : 'Optional'}
                        </span>
                        <button onClick={() => openEditSubjectModal(mapping)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit Subject">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleRemoveSubject(mapping._id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors" title="Remove Subject">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Teachers</p>
                        <p className="text-xs font-medium text-slate-700 mt-0.5">
                          {mapping.teachers?.length > 0 
                            ? mapping.teachers.map((t: any) => formatTeacherName(t)).join(', ') 
                            : <span className="text-amber-500 italic">Unassigned</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Periods/Week</p>
                        <p className="text-sm font-bold text-indigo-600">{mapping.periodsPerWeek}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── MODALS ── */}
      {/* 1. Add Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-800">Add New Section</h2>
              <button onClick={() => setShowSectionModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleAddSection} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Section Name *</label>
                    <input type="text" required value={sectionForm.sectionName} onChange={e => setSectionForm({...sectionForm, sectionName: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" placeholder="e.g. A" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Capacity *</label>
                    <input type="number" required min="1" value={sectionForm.capacity} onChange={e => setSectionForm({...sectionForm, capacity: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Class Teacher</label>
                  <select value={sectionForm.classTeacher} onChange={e => setSectionForm({...sectionForm, classTeacher: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 bg-white">
                    <option value="">-- Leave Unassigned --</option>
                    {teachers.map(t => <option key={t._id} value={t._id}>{formatTeacherName(t)}</option>)}
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowSectionModal(false)} className="flex-1 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-70">Add</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. Assign Class Teacher Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-800">Class Teacher: Sec {teacherForm.sectionName}</h2>
              <button onClick={() => setShowTeacherModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleAssignTeacher} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Select Teacher</label>
                  <select required value={teacherForm.teacherId} onChange={e => setTeacherForm({...teacherForm, teacherId: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 bg-white">
                    <option value="" disabled>-- Select --</option>
                    {teachers.map(t => <option key={t._id} value={t._id}>{formatTeacherName(t)}</option>)}
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowTeacherModal(false)} className="flex-1 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-70">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. Map/Edit Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="font-bold text-slate-800">
                {editingMappingId ? 'Edit Mapped Subject' : 'Map Subject to Class'}
              </h2>
              <button onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSaveSubject} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Select Subject from Master *</label>
                  <select 
                    required 
                    value={subjectForm.subjectId} 
                    onChange={e => setSubjectForm({...subjectForm, subjectId: e.target.value})} 
                    disabled={!!editingMappingId} // Cannot change the subject itself while editing
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    <option value="" disabled>-- Select a Subject --</option>
                    {masterSubjects.map(s => <option key={s._id} value={s._id}>{s.subjectName} ({s.subjectCode})</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Periods / Week *</label>
                    <input type="number" required min="1" value={subjectForm.periodsPerWeek} onChange={e => setSubjectForm({...subjectForm, periodsPerWeek: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={subjectForm.isMandatory} onChange={e => setSubjectForm({...subjectForm, isMandatory: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                      <span className="text-sm font-bold text-slate-700">Mandatory Subject</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Assign Subject Teachers (Select multiple)</label>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-2 space-y-1">
                    {teachers.map(t => (
                      <label key={t._id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200 hover:shadow-sm">
                        <input type="checkbox" checked={subjectForm.teachers.includes(t._id)} onChange={() => handleTeacherToggle(t._id)} className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                        <span className="text-sm font-medium text-slate-700">{formatTeacherName(t)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setShowSubjectModal(false)} className="flex-1 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600">Cancel</button>
                  <button type="submit" disabled={isSubmitting || !subjectForm.subjectId} className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-70 shadow-lg shadow-indigo-600/20">
                    {editingMappingId ? 'Update Mapping' : 'Save Mapping'}
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