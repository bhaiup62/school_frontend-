// src/app/teacher-dashboard/remarks/page.tsx

'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import TeacherLayout from '@/components/teacher/TeacherLayout'
import { getProfile, getStudents, addRemark, getRemarks } from '@/services/teacherService'
import type { TeacherProfile, Student, ClassTeacherRemark } from '@/services/teacherService'
import { MessageSquare, User, Send, AlertCircle, ArrowLeft, CheckCircle, Clock } from 'lucide-react'

export default function RemarksPage() {
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [studentRemarks, setStudentRemarks] = useState<ClassTeacherRemark[]>([])
  const [newRemark, setNewRemark] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await getProfile()
        setTeacher(profileRes.data)

        const ctInfo = (profileRes.data as any)?.currentClassTeacherOf || profileRes.data.classTeacherOf

        // Only class teachers can add remarks
        if (profileRes.data.isClassTeacher && ctInfo) {
          const studentsRes = await getStudents({
            class: ctInfo.class,
            section: ctInfo.section,
          })
          setStudents(studentsRes.data || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchRemarks = async () => {
      if (!selectedStudent) { setStudentRemarks([]); return }
      try {
        const res = await getRemarks(selectedStudent)
        setStudentRemarks(res.data.remarks || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchRemarks()
  }, [selectedStudent])

  const handleSubmit = async () => {
    if (!selectedStudent || !newRemark.trim()) {
      setMessage({ type: 'error', text: 'Please select a student and enter a remark.' })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const res = await addRemark(selectedStudent, { remark: newRemark.trim() })
      // Put the new remark at the top of the list
      setStudentRemarks(prev => [res.data, ...prev])
      setNewRemark('')
      setMessage({ type: 'success', text: 'Remark added successfully!' })
      // Auto clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add remark.' })
    } finally {
      setSaving(false)
    }
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

  const ctInfo = (teacher as any)?.currentClassTeacherOf || teacher?.classTeacherOf

  // Not a class teacher
  if (!teacher?.isClassTeacher || !ctInfo) {
    return (
      <TeacherLayout>
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-10 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-800 mb-2">Access Restricted</h3>
            <p className="text-slate-500 mb-8">
              Only designated Class Teachers can add official remarks to student profiles. You are currently logged in as a Subject Teacher.
            </p>
            <Link href="/teacher-dashboard" className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-sm">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </TeacherLayout>
    )
  }

  const selectedStudentData = students.find(s => s.admissionNumber === selectedStudent)

  return (
    <TeacherLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Header */}
        <div className="flex items-center gap-4">
          <Link href="/teacher-dashboard" className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-800">Class Remarks</h2>
            <p className="text-sm font-medium text-slate-500">Record official notes for Class {ctInfo.class}-{ctInfo.section}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Selection & Entry */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Student Selection */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" /> Select Student
              </h3>
              <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-slate-700">
                <option value="">Choose a student...</option>
                {students.map((s) => (
                  <option key={s.admissionNumber} value={s.admissionNumber}>
                    Roll {s.rollNumber} - {(s as any).name || s.fullName || `${s.firstName} ${s.lastName}`}
                  </option>
                ))}
              </select>

              {selectedStudentData && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 border border-purple-100 text-purple-700 font-bold">
                    {selectedStudentData.firstName.charAt(0)}{selectedStudentData.lastName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      {(selectedStudentData as any).name || selectedStudentData.fullName || `${selectedStudentData.firstName} ${selectedStudentData.lastName}`}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      ID: {selectedStudentData.admissionNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Remark Entry Form */}
            <div className={`transition-all duration-300 ${selectedStudent ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" /> New Remark
                </h3>
                
                {message && (
                  <div className={`p-3 mb-4 rounded-xl flex items-center gap-2 text-sm font-semibold border shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {message.text}
                  </div>
                )}

                <textarea
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                  placeholder="Type your official remark here..."
                  rows={6}
                  disabled={!selectedStudent}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-slate-700 resize-none mb-4"
                />
                
                <button onClick={handleSubmit} disabled={saving || !newRemark.trim() || !selectedStudent}
                  className="w-full px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:shadow-none">
                  <Send className="w-4 h-4" />
                  {saving ? 'Saving to Database...' : 'Submit Official Remark'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: History */}
          <div className="md:col-span-7">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
              <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" /> Remarks History
                </h3>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 shadow-sm">
                  {studentRemarks.length} Records
                </span>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto bg-slate-50/30">
                {!selectedStudent ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-10">
                    <User className="w-16 h-16 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">Select a student from the left<br/>to view their remark history.</p>
                  </div>
                ) : studentRemarks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-60 py-10">
                    <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No remarks found for this student.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentRemarks.map((remark, i) => (
                      <div key={i} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-purple-200 hover:shadow-md transition-all relative group">
                        <MessageSquare className="absolute top-5 right-5 w-5 h-5 text-slate-100 group-hover:text-purple-100 transition-colors" />
                        <p className="text-sm font-medium text-slate-700 leading-relaxed pr-8">
                          "{remark.remark}"
                        </p>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {remark.addedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(remark.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </TeacherLayout>
  )
}