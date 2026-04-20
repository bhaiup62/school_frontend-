// src/app/teacher-dashboard/results/enter/page.tsx

'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import TeacherLayout from '@/components/teacher/TeacherLayout'
import { getProfile, getStudents, enterResult } from '@/services/teacherService'
import type { TeacherProfile, Student } from '@/services/teacherService'
import { ArrowLeft, Save, Plus, Trash2, TrendingUp, BookOpen, User, CheckCircle, AlertTriangle } from 'lucide-react'

interface SubjectMark {
  subject: string
  maxMarks: number
  marksObtained: number
  grade: string
}

export default function EnterResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Pre-fill from URL if coming from the Results table
  const preSelectedStudent = searchParams.get('student')
  const preSelectedClass = searchParams.get('class')
  const preSelectedSection = searchParams.get('section')

  const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [selectedClass, setSelectedClass] = useState(preSelectedClass || '')
  const [selectedSection, setSelectedSection] = useState(preSelectedSection || '')
  const [selectedStudent, setSelectedStudent] = useState(preSelectedStudent || '')
  
  const [examName, setExamName] = useState('')
  const [examType, setExamType] = useState<'unit_test' | 'half_yearly' | 'annual' | 'pre_board'>('unit_test')
  const [session, setSession] = useState('2024-25') // You can make this dynamic based on current year
  const [subjects, setSubjects] = useState<SubjectMark[]>([{ subject: '', maxMarks: 100, marksObtained: 0, grade: '' }])

  // 1. Fetch Profile & Setup Defaults
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile()
        setTeacher(res.data)
        
        // If no class is selected in URL, use smart defaults
        if (!selectedClass) {
          const classTeacherInfo = (res.data as any)?.currentClassTeacherOf || res.data?.classTeacherOf
          const firstAssigned = (res.data as any)?.currentAssignedClasses?.[0] || res.data?.assignedClasses?.[0]

          if (classTeacherInfo) {
            setSelectedClass(classTeacherInfo.class)
            setSelectedSection(classTeacherInfo.section)
          } else if (firstAssigned) {
            if (firstAssigned.includes('-')) {
              const [cls, sec] = firstAssigned.split('-')
              setSelectedClass(cls)
              setSelectedSection(sec)
            } else {
              setSelectedClass(firstAssigned)
            }
          }
        }

        // Pre-fill subjects from teacher's profile subjects to save them time
        if (res.data.subjects?.length > 0) {
          setSubjects(res.data.subjects.map((s: string) => ({ subject: s, maxMarks: 100, marksObtained: 0, grade: '' })))
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchProfile()
  }, [])

  // 2. Fetch Students for Dropdown
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) { setLoading(false); return }
      setLoading(true)
      try {
        const params: any = { class: selectedClass }
        if (selectedSection) params.section = selectedSection
        const res = await getStudents(params)
        setStudents(res.data || [])
      } catch (err) {
        console.error(err)
        setStudents([])
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [selectedClass, selectedSection])

  // 3. Dropdown Security Logic
  const assignedClassesRaw = (teacher as any)?.currentAssignedClasses || teacher?.assignedClasses || []
  const classTeacherInfo = (teacher as any)?.currentClassTeacherOf || teacher?.classTeacherOf

  let allAssigned = [...assignedClassesRaw]
  if (classTeacherInfo) {
    allAssigned.push(`${classTeacherInfo.class}-${classTeacherInfo.section}`)
  }

  const availableClasses = Array.from(new Set(allAssigned.map((c: string) => c.includes('-') ? c.split('-')[0] : c)))
  const allowedSections = Array.from(new Set(allAssigned.filter((c: string) => c.startsWith(`${selectedClass}-`)).map((c: string) => c.split('-')[1])))
  const hasFullClassAccess = assignedClassesRaw.includes(selectedClass)
  const sectionsToShow = hasFullClassAccess ? ['A', 'B', 'C', 'D', 'E'] : allowedSections

  // Handlers
  const calculateGrade = (marks: number, max: number): string => {
    if (!max || max <= 0) return ''
    const percent = (marks / max) * 100
    if (percent >= 90) return 'A+'
    if (percent >= 80) return 'A'
    if (percent >= 70) return 'B+'
    if (percent >= 60) return 'B'
    if (percent >= 50) return 'C'
    if (percent >= 33) return 'D'
    return 'F'
  }

  const updateSubject = (index: number, field: keyof SubjectMark, value: string | number) => {
    setSubjects(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      
      if (field === 'marksObtained' || field === 'maxMarks') {
        const marks = field === 'marksObtained' ? Number(value) : updated[index].marksObtained
        const max = field === 'maxMarks' ? Number(value) : updated[index].maxMarks
        updated[index].grade = calculateGrade(marks, max)
      }
      return updated
    })
  }

  const addSubject = () => {
    setSubjects(prev => [...prev, { subject: '', maxMarks: 100, marksObtained: 0, grade: '' }])
  }

  const removeSubject = (index: number) => {
    setSubjects(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!selectedStudent || !examName || subjects.some(s => !s.subject || s.maxMarks <= 0)) {
      setMessage({ type: 'error', text: 'Please fill all required fields and ensure Max Marks are valid.' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSaving(true)
    setMessage(null)
    
    try {
      await enterResult({
        admissionNumber: selectedStudent,
        examName,
        examType,
        session,
        subjects: subjects.map(s => ({
          subject: s.subject,
          maxMarks: Number(s.maxMarks),
          marksObtained: Number(s.marksObtained),
          grade: s.grade,
        })),
      })
      
      setMessage({ type: 'success', text: 'Results saved successfully!' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      // Auto-reset form for next student, keeping exam details intact
      setSelectedStudent('')
      setSubjects(teacher?.subjects?.map(s => ({ subject: s, maxMarks: 100, marksObtained: 0, grade: '' })) || [{ subject: '', maxMarks: 100, marksObtained: 0, grade: '' }])
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save results. Ensure you have permission for this student.' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  const totalMarks = subjects.reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0)
  const totalObtained = subjects.reduce((sum, s) => sum + (Number(s.marksObtained) || 0), 0)
  const percentage = totalMarks > 0 ? Math.round((totalObtained / totalMarks) * 100) : 0

  return (
    <TeacherLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-800">Enter Results</h2>
            <p className="text-sm font-medium text-slate-500">Record academic performance for your students</p>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 shadow-sm border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Context Setup */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Student Selection */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Identity
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Class</label>
                  <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(''); setSelectedSection(''); }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all">
                    <option value="">Select Class</option>
                    {availableClasses.map((cls: any) => <option key={cls} value={cls}>Class {cls}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Section</label>
                  <select value={selectedSection} onChange={(e) => { setSelectedSection(e.target.value); setSelectedStudent(''); }} disabled={!selectedClass}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50">
                    {hasFullClassAccess ? <option value="">All Sections</option> : <option value="">Select Section</option>}
                    {sectionsToShow.map((sec: string) => <option key={sec} value={sec}>Section {sec}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Student *</label>
                  <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} disabled={loading || students.length === 0}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50">
                    <option value="">Select Student</option>
                    {students.map((s) => (
                      <option key={s.admissionNumber} value={s.admissionNumber}>
                        {s.rollNumber} - {(s as any).name || s.fullName || `${s.firstName} ${s.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Exam Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" /> Exam Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Exam Name *</label>
                  <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g., Unit Test 1"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Exam Type *</label>
                  <select value={examType} onChange={(e) => setExamType(e.target.value as any)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all">
                    <option value="unit_test">Unit Test</option>
                    <option value="half_yearly">Half Yearly</option>
                    <option value="annual">Annual</option>
                    <option value="pre_board">Pre Board</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Academic Session *</label>
                  <input type="text" value={session} onChange={(e) => setSession(e.target.value)}
                    placeholder="e.g., 2024-25"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Marks Entry */}
          <div className="md:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" /> Subject Marks
                </h3>
                <button onClick={addSubject}
                  className="text-sm bg-white border border-slate-200 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 font-bold flex items-center gap-1.5 shadow-sm transition-colors">
                  <Plus className="w-4 h-4" /> Add Row
                </button>
              </div>

              <div className="p-6 flex-1">
                <div className="space-y-3">
                  {/* Table Header for Desktop */}
                  <div className="hidden sm:flex items-center gap-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <div className="flex-1">Subject</div>
                    <div className="w-20 text-center">Max</div>
                    <div className="w-24 text-center">Obtained</div>
                    <div className="w-16 text-center">Grade</div>
                    <div className="w-10"></div>
                  </div>

                  {subjects.map((subj, i) => (
                    <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 sm:p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors">
                      <div className="w-full sm:flex-1">
                        <label className="sm:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">Subject</label>
                        <input type="text" value={subj.subject} onChange={(e) => updateSubject(i, 'subject', e.target.value)}
                          placeholder="e.g., Mathematics"
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-all" />
                      </div>
                      <div className="w-24 sm:w-20">
                        <label className="sm:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">Max</label>
                        <input type="number" value={subj.maxMarks} onChange={(e) => updateSubject(i, 'maxMarks', e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 text-center transition-all bg-white" />
                      </div>
                      <div className="w-24 flex-1 sm:flex-none">
                        <label className="sm:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">Obtained</label>
                        <input type="number" value={subj.marksObtained} onChange={(e) => updateSubject(i, 'marksObtained', e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 text-center transition-all bg-white shadow-inner" />
                      </div>
                      <div className="w-16 text-center shrink-0">
                        <label className="sm:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">Grade</label>
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm border ${
                          subj.grade === 'F' ? 'bg-red-50 text-red-600 border-red-100' : 
                          subj.grade ? 'bg-green-50 text-green-600 border-green-100' : 
                          'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                          {subj.grade || '-'}
                        </span>
                      </div>
                      <div className="w-10 flex justify-end shrink-0 sm:mt-0 mt-4">
                        <button onClick={() => removeSubject(i)} disabled={subjects.length === 1}
                          className="p-2.5 text-slate-400 bg-white border border-slate-200 rounded-lg hover:text-red-500 hover:border-red-200 hover:bg-red-50 disabled:opacity-30 transition-all shadow-sm">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Footer */}
              <div className="bg-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Grand Total</p>
                    <p className="text-2xl font-display font-bold text-white">
                      {totalObtained} <span className="text-lg text-slate-500">/ {totalMarks}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Overall Rate</p>
                    <p className={`text-2xl font-display font-bold ${percentage < 33 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {percentage}%
                    </p>
                  </div>
                </div>

                <button onClick={handleSubmit} disabled={saving}
                  className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-500/30">
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving to Database...' : 'Save Student Results'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  )
}