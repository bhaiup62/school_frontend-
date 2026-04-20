// src/app/teacher-dashboard/results/page.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import TeacherLayout from '@/components/teacher/TeacherLayout'
import { getProfile, getStudents } from '@/services/teacherService'
import type { TeacherProfile, Student } from '@/services/teacherService'
import { TrendingUp, Users, Award, ChevronRight, Plus, Filter, AlertTriangle } from 'lucide-react'

export default function ResultsDashboardPage() {
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile()
        setTeacher(res.data)
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
      } catch (err) {
        console.error(err)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) { setLoading(false); return }
      setLoading(true)
      setErrorMsg(null)
      try {
        const params: any = { class: selectedClass }
        if (selectedSection) params.section = selectedSection
        const res = await getStudents(params)
        setStudents(res.data || [])
      } catch (err: any) {
        if (err.response?.status === 403) {
          setErrorMsg("You are only assigned to specific sections of this class. Please select your section.")
        }
        setStudents([])
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [selectedClass, selectedSection])

  const assignedClassesRaw = (teacher as any)?.currentAssignedClasses || teacher?.assignedClasses || []
  const classTeacherInfo = (teacher as any)?.currentClassTeacherOf || teacher?.classTeacherOf
  let allAssigned = [...assignedClassesRaw]
  if (classTeacherInfo) allAssigned.push(`${classTeacherInfo.class}-${classTeacherInfo.section}`)

  const availableClasses = Array.from(new Set(allAssigned.map((c: string) => c.includes('-') ? c.split('-')[0] : c)))
  const allowedSections = Array.from(new Set(allAssigned.filter((c: string) => c.startsWith(`${selectedClass}-`)).map((c: string) => c.split('-')[1])))
  const hasFullClassAccess = assignedClassesRaw.includes(selectedClass)
  const sectionsToShow = hasFullClassAccess ? ['A', 'B', 'C', 'D', 'E'] : allowedSections

  return (
    <TeacherLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <TrendingUp className="w-7 h-7" />
                Results Dashboard
              </h2>
              <p className="text-blue-100 mt-1">View and enter student exam results</p>
            </div>
            <Link href="/teacher-dashboard/results/enter"
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-5 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-sm">
              <Plus className="w-5 h-5" /> Enter Results
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 text-slate-600 shrink-0">
              <Filter className="w-5 h-5" />
              <span className="font-medium text-sm">Filters:</span>
            </div>
            <div className="flex gap-3 w-full sm:w-auto shrink-0">
              <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(''); }}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-slate-700">
                <option value="">Select Class</option>
                {availableClasses.map((cls: any) => <option key={cls} value={cls}>Class {cls}</option>)}
              </select>
              <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} disabled={!selectedClass}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-slate-700 disabled:opacity-50">
                {hasFullClassAccess ? <option value="">All Sections</option> : <option value="">Select Section</option>}
                {sectionsToShow.map((sec: string) => <option key={sec} value={sec}>Section {sec}</option>)}
              </select>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center shadow-sm">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <p className="text-amber-700 font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-slate-800 leading-none">{students.length}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Students</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-slate-800 leading-none">{teacher?.subjects?.length || 0}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Subjects</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-slate-800 leading-none">{selectedClass ? `${selectedClass}${selectedSection ? `-${selectedSection}` : ''}` : '—'}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Class</p>
            </div>
          </div>
        </div>

        {/* Students List */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : !selectedClass ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 shadow-sm">
            <p className="text-lg font-medium text-slate-600">Please select a class to view students.</p>
          </div>
        ) : students.length === 0 && !errorMsg ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 shadow-sm">
            <p className="text-lg font-medium text-slate-600">No students found.</p>
          </div>
        ) : !errorMsg && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-6 py-4 text-slate-500 font-semibold uppercase tracking-wider">Roll</th>
                    <th className="text-left px-6 py-4 text-slate-500 font-semibold uppercase tracking-wider">Student</th>
                    <th className="text-left px-6 py-4 text-slate-500 font-semibold uppercase tracking-wider">Class</th>
                    <th className="text-right px-6 py-4 text-slate-500 font-semibold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.admissionNumber} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-6 py-4 text-slate-600 font-medium">{student.rollNumber}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{(student as any).name || student.fullName || `${student.firstName} ${student.lastName}`}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{student.admissionNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                          {student.class}-{student.section}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/teacher-dashboard/results/enter?student=${student.admissionNumber}&class=${selectedClass}&section=${selectedSection}`}
                          className="inline-flex items-center justify-end gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-bold shadow-sm">
                          Enter <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}