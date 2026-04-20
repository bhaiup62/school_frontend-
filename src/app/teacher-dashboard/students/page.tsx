// src/app/teacher-dashboard/students/page.tsx

'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import TeacherLayout from '@/components/teacher/TeacherLayout'
import { getProfile, getStudents } from '@/services/teacherService'
import type { TeacherProfile, Student } from '@/services/teacherService'
import { Users, Search, ChevronRight, Filter, GraduationCap, AlertTriangle } from 'lucide-react'

export default function StudentsPage() {
  const searchParams = useSearchParams()
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState(searchParams.get('class') || '')
  const [selectedSection, setSelectedSection] = useState(searchParams.get('section') || '')

  // 1. Fetch Profile & Initialize Smart Defaults
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile()
        setTeacher(res.data)
        
        // Only set default if nothing is in the URL
        if (!selectedClass) {
          const classTeacherInfo = (res.data as any)?.currentClassTeacherOf || res.data?.classTeacherOf
          const firstAssigned = (res.data as any)?.currentAssignedClasses?.[0] || res.data?.assignedClasses?.[0]

          if (classTeacherInfo) {
            setSelectedClass(classTeacherInfo.class)
            setSelectedSection(classTeacherInfo.section)
          } else if (firstAssigned) {
            // Smart split: If assigned is "10-A", set class to "10" and section to "A"
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

  // 2. Fetch Students based on strict Class & Section
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) {
        setLoading(false)
        return
      }
      setLoading(true)
      setErrorMsg(null)
      
      try {
        const params: any = { class: selectedClass }
        if (selectedSection) params.section = selectedSection
        
        const res = await getStudents(params)
        setStudents(res.data || [])
      } catch (err: any) {
        console.error(err)
        if (err.response?.status === 403) {
          setErrorMsg("You are only assigned to specific sections of this class. Please select your section from the dropdown.")
        } else {
          setErrorMsg("Failed to load students.")
        }
        setStudents([])
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [selectedClass, selectedSection])

  // 3. Dynamic Dropdown Logic
  const assignedClassesRaw = (teacher as any)?.currentAssignedClasses || teacher?.assignedClasses || []
  const classTeacherInfo = (teacher as any)?.currentClassTeacherOf || teacher?.classTeacherOf

  // Combine subject classes and class teacher class for the dropdown menu
  let allAssigned = [...assignedClassesRaw]
  if (classTeacherInfo) {
    allAssigned.push(`${classTeacherInfo.class}-${classTeacherInfo.section}`)
  }

  // Extract unique classes (e.g., ["10-A", "10-B", "11"] -> ["10", "11"])
  const availableClasses = Array.from(new Set(
    allAssigned.map((c: string) => c.includes('-') ? c.split('-')[0] : c)
  ))

  // Find which specific sections the teacher is allowed to see for the selected class
  const allowedSections = Array.from(new Set(
    allAssigned
      .filter((c: string) => c.startsWith(`${selectedClass}-`))
      .map((c: string) => c.split('-')[1])
  ))

  // A teacher only has "Full Class Access" if the class number itself (e.g., "10") is in their assigned array without a section.
  const hasFullClassAccess = assignedClassesRaw.includes(selectedClass)

  // Standard fallback sections if they have full access
  const allSections = ['A', 'B', 'C', 'D', 'E']
  const sectionsToShow = hasFullClassAccess ? allSections : allowedSections

  const filteredStudents = students.filter((s) => {
    const name = `${s.firstName} ${s.lastName}`.toLowerCase()
    const search = searchTerm.toLowerCase()
    return name.includes(search) || s.admissionNumber.toLowerCase().includes(search) || s.rollNumber.includes(search)
  })

  return (
    <TeacherLayout>
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Users className="w-7 h-7" />
                Students
              </h2>
              <p className="text-purple-100 mt-1">View and manage students in your assigned classes</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-5 py-2.5 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">
                <div className="p-2 bg-white/20 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold leading-none text-white">{filteredStudents.length}</p>
                  <p className="text-[10px] text-purple-200 uppercase tracking-wider font-bold mt-1">Total Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            
            <div className="flex items-center gap-2 text-slate-600 w-full sm:w-auto shrink-0">
              <Filter className="w-5 h-5" />
              <span className="font-medium text-sm hidden sm:inline">Filters:</span>
            </div>

            {/* Search */}
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, admission no, or roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>

            {/* Class & Section Dropdowns */}
            <div className="flex gap-3 w-full sm:w-auto shrink-0">
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  setSelectedSection('') // Reset section when class changes
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-slate-700"
              >
                <option value="">Select Class</option>
                {availableClasses.map((cls: any) => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>

              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClass}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-slate-700 disabled:opacity-50"
              >
                {hasFullClassAccess ? <option value="">All Sections</option> : <option value="">Select Section</option>}
                {sectionsToShow.map((sec: string) => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 403 Error / Security Message */}
        {errorMsg && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center shadow-sm">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-amber-800 mb-1">Access Restricted</h3>
            <p className="text-amber-600">{errorMsg}</p>
          </div>
        )}

        {/* Students List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full" />
          </div>
        ) : !errorMsg && filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16 text-slate-400">
            <Users className="w-16 h-16 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium text-slate-600">No students found</p>
            <p className="text-sm mt-1 text-slate-400">Please select a valid class and section from the dropdown.</p>
          </div>
        ) : !errorMsg && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-6 py-4 text-slate-500 font-semibold uppercase tracking-wider">Student</th>
                    <th className="text-left px-6 py-4 text-slate-500 font-semibold uppercase tracking-wider">Admission No.</th>
                    <th className="text-left px-6 py-4 text-slate-500 font-semibold uppercase tracking-wider">Class</th>
                    <th className="text-left px-6 py-4 text-slate-500 font-semibold uppercase tracking-wider">Roll No.</th>
                    <th className="text-right px-6 py-4 text-slate-500 font-semibold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <tr key={student.admissionNumber} className="hover:bg-purple-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-purple-700 font-bold text-sm">
                              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">
                              {(student as any).name || student.fullName || `${student.firstName} ${student.lastName}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {student.admissionNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                          {student.class}-{student.section}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/teacher-dashboard/students/${student.admissionNumber}`}
                          className="inline-flex items-center justify-end gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 hover:text-purple-700 transition-colors font-semibold shadow-sm"
                        >
                          View <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <Link key={student.admissionNumber} href={`/teacher-dashboard/students/${student.admissionNumber}`}
                  className="flex items-center gap-4 p-5 hover:bg-purple-50 transition-colors group"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-purple-700 font-bold">
                      {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate group-hover:text-purple-700 transition-colors">
                      {(student as any).name || student.fullName || `${student.firstName} ${student.lastName}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {student.admissionNumber}
                      </span>
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        Class {student.class}-{student.section}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600" />
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </TeacherLayout>
  )
}