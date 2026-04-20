'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import TeacherLayout from '@/components/teacher/TeacherLayout'
import { getProfile, getStudents, markBulkAttendance } from '@/services/teacherService'
import type { TeacherProfile, Student } from '@/services/teacherService'
import { CalendarCheck, ArrowLeft, Check, X, Clock, Save, Users } from 'lucide-react'

type AttendanceStatus = 'present' | 'absent' | 'late' | 'holiday'

interface AttendanceRecord {
  admissionNumber: string
  status: AttendanceStatus
  remarks: string
}

export default function MarkAttendancePage() {
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Only class teachers can mark attendance
  const classTeacherInfo = (teacher as any)?.currentClassTeacherOf || teacher?.classTeacherOf
  const isClassTeacher = teacher?.isClassTeacher &&!!classTeacherInfo

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile()
        setTeacher(res.data)
        // Auto-select class teacher's class (locked)
        const info = (res.data as any).currentClassTeacherOf || res.data.classTeacherOf
        if (info) {
          setSelectedClass(info.class)
          setSelectedSection(info.section)
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
      try {
        const res = await getStudents({ class: selectedClass, section: selectedSection || undefined })
        setStudents(res.data || [])
        // Initialize attendance with all present
        const initial: Record<string, AttendanceRecord> = {}
        res.data?.forEach((s: Student) => {
          initial[s.admissionNumber] = { admissionNumber: s.admissionNumber, status: 'present', remarks: '' }
        })
        setAttendance(initial)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [selectedClass, selectedSection])

  const updateStatus = (admissionNumber: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
     ...prev,
      [admissionNumber]: {...prev[admissionNumber], status }
    }))
  }

  const markAllAs = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceRecord> = {}
    students.forEach(s => {
      updated[s.admissionNumber] = { admissionNumber: s.admissionNumber, status, remarks: '' }
    })
    setAttendance(updated)
  }

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSection) {
      setMessage({ type: 'error', text: 'Please select both class and section.' })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const records = Object.values(attendance)
      const res = await markBulkAttendance({
        class: selectedClass,
        section: selectedSection,
        date: selectedDate,
        records,
      })
      
      // FIX: Use the actual message from the backend or a safe fallback
      setMessage({ type: 'success', text: res.message || `Attendance successfully saved for ${records.length} students.` })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save attendance.' })
    } finally {
      setSaving(false)
    }
  }

  const presentCount = Object.values(attendance).filter(a => a.status === 'present').length
  const absentCount = Object.values(attendance).filter(a => a.status === 'absent').length
  const lateCount = Object.values(attendance).filter(a => a.status === 'late').length

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/teacher-dashboard/attendance"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-xl font-display font-bold text-slate-800">Mark Attendance</h2>
              <p className="text-sm text-slate-500">
                {isClassTeacher
                 ? `Class ${classTeacherInfo?.class}-${classTeacherInfo?.section}`
                  : 'Record daily attendance for your class'}
              </p>
            </div>
          </div>
        </div>

        {/* Not a class teacher warning */}
        {teacher &&!isClassTeacher && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <X className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-amber-800 mb-2">Access Restricted</h3>
            <p className="text-amber-600">
              Only Class Teachers can mark attendance.
              You are currently a Subject Teacher.
            </p>
            <Link href="/teacher-dashboard/attendance"
              className="inline-flex items-center gap-2 mt-4 text-purple-600 hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to Attendance Dashboard
            </Link>
          </div>
        )}

        {/* Class Teacher View */}
        {isClassTeacher && (
          <>
            {/* Filters - Class locked */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Date</label>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Class (Locked)</label>
                  <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl text-purple-700 font-medium">
                    Class {classTeacherInfo?.class}-{classTeacherInfo?.section}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button onClick={() => markAllAs('present')}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors flex items-center gap-2">
                <Check className="w-4 h-4" /> Mark All Present
              </button>
              <button onClick={() => markAllAs('absent')}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors flex items-center gap-2">
                <X className="w-4 h-4" /> Mark All Absent
              </button>
              <div className="flex-1" />
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600 font-medium">{presentCount} Present</span>
                <span className="text-red-600 font-medium">{absentCount} Absent</span>
                <span className="text-orange-600 font-medium">{lateCount} Late</span>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-xl ${message.type === 'success'? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            {/* Students List */}
            {loading? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
              </div>
            ) : students.length === 0? (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
                No students found.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-5 py-3 text-slate-500 font-semibold text-sm">Roll</th>
                        <th className="text-left px-5 py-3 text-slate-500 font-semibold text-sm">Student</th>
                        <th className="text-center px-5 py-3 text-slate-500 font-semibold text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, i) => {
                    const record = attendance[student.admissionNumber]
                    return (
                      <tr key={student.admissionNumber} className={`border-t border-slate-50 ${i % 2 === 0? 'bg-white' : 'bg-slate-50/50'}`}>
                        <td className="px-5 py-3 text-slate-600 font-medium">{student.rollNumber}</td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-800">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-slate-400">{student.admissionNumber}</p>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => updateStatus(student.admissionNumber, 'present')}
                              className={`p-2 rounded-lg transition-colors ${record?.status === 'present'? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600'}`}>
                              <Check className="w-5 h-5" />
                            </button>
                            <button onClick={() => updateStatus(student.admissionNumber, 'absent')}
                              className={`p-2 rounded-lg transition-colors ${record?.status === 'absent'? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600'}`}>
                              <X className="w-5 h-5" />
                            </button>
                            <button onClick={() => updateStatus(student.admissionNumber, 'late')}
                              className={`p-2 rounded-lg transition-colors ${record?.status === 'late'? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-orange-100 hover:text-orange-600'}`}>
                              <Clock className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

            {/* Submit Button */}
            {students.length > 0 && (
              <div className="flex justify-end">
                <button onClick={handleSubmit} disabled={saving}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50">
                  <Save className="w-5 h-5" />
                  {saving? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </TeacherLayout>
  )
}
