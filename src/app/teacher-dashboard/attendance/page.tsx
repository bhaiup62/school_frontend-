// src/app/teacher-dashboard/attendance/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import TeacherLayout from '@/components/teacher/TeacherLayout'
import { getProfile, getAttendanceReport } from '@/services/teacherService'
import type { TeacherProfile, AttendanceReportStudent } from '@/services/teacherService'
import { CalendarCheck, Users, AlertTriangle, ChevronDown, ChevronUp, Calendar } from 'lucide-react'

export default function AttendanceDashboardPage() {
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
  const [report, setReport] = useState<AttendanceReportStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  // State to track which student row is expanded to show daily details
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)

  // Safe fallback to handle both legacy and new schema
  const classTeacherInfo = (teacher as any)?.currentClassTeacherOf || teacher?.classTeacherOf
  const isClassTeacher = teacher?.isClassTeacher && !!classTeacherInfo

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile()
        setTeacher(res.data)
        
        // Only class teachers can access attendance - auto-select their class using safe fallback
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
    const fetchReport = async () => {
      if (!selectedClass) { 
        setLoading(false)
        return 
      }
      setLoading(true)
      setExpandedStudent(null) // Close any open details when filters change
      try {
        const res = await getAttendanceReport({
          class: selectedClass,
          section: selectedSection || undefined,
          month: selectedMonth,
          year: selectedYear,
        })
        setReport(res.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [selectedClass, selectedSection, selectedMonth, selectedYear])

  const lowAttendanceCount = report.filter(s => s.lowAttendance).length
  const avgAttendance = report.length > 0
    ? Math.round(report.reduce((sum, s) => sum + s.percentage, 0) / report.length) : 0

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ]

  const toggleExpand = (admissionNumber: string) => {
    if (expandedStudent === admissionNumber) {
      setExpandedStudent(null)
    } else {
      setExpandedStudent(admissionNumber)
    }
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-800">Attendance Dashboard</h2>
            <p className="text-sm text-slate-500">
              {isClassTeacher
                ? `Class Teacher of ${classTeacherInfo?.class}-${classTeacherInfo?.section}`
                : 'View class attendance reports'}
            </p>
          </div>
          {isClassTeacher && (
            <Link href="/teacher-dashboard/attendance/mark"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm">
              <CalendarCheck className="w-5 h-5" /> Mark Attendance
            </Link>
          )}
        </div>

        {/* Not a class teacher warning */}
        {teacher && !isClassTeacher && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-amber-800 mb-2">Access Restricted</h3>
            <p className="text-amber-600">
              Attendance management is only available for Class Teachers.
              You are currently a Subject Teacher and can only view notices and student details.
            </p>
          </div>
        )}

        {/* Class Teacher View - Show attendance */}
        {isClassTeacher && (
          <>
            {/* Filters - Locked to Class Teacher's class */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-wrap gap-4 items-center">
              <div className="bg-purple-50 px-4 py-2.5 rounded-xl border border-purple-100">
                <span className="text-sm text-purple-700 font-bold">
                  Class {classTeacherInfo?.class}-{classTeacherInfo?.section}
                </span>
              </div>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white font-medium text-slate-700 hover:border-purple-300 transition-colors">
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white font-medium text-slate-700 hover:border-purple-300 transition-colors">
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-slate-800 leading-none">{report.length}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Total Students</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-green-600 leading-none">{avgAttendance}%</p>
                    <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Avg Attendance</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-red-600 leading-none">{lowAttendanceCount}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Low Attendance</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold text-slate-800 leading-tight">
                      {months.find(m => m.value === selectedMonth)?.label}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{selectedYear}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Table */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full" />
              </div>
            ) : report.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 shadow-sm">
                <CalendarCheck className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-slate-600">No attendance data found</p>
                <p className="text-sm mt-1 text-slate-400">Try adjusting your month or year filters.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-6 py-4 text-slate-500 font-semibold uppercase tracking-wider">Student</th>
                        <th className="text-center px-6 py-4 text-slate-500 font-semibold uppercase tracking-wider">Roll</th>
                        <th className="text-center px-6 py-4 text-slate-500 font-semibold uppercase tracking-wider">Present</th>
                        <th className="text-center px-6 py-4 text-slate-500 font-semibold uppercase tracking-wider">Absent</th>
                        <th className="text-center px-6 py-4 text-slate-500 font-semibold uppercase tracking-wider">Total</th>
                        <th className="text-center px-6 py-4 text-slate-500 font-semibold uppercase tracking-wider">%</th>
                        <th className="text-right px-6 py-4 text-slate-500 font-semibold uppercase tracking-wider">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.map((student, i) => (
                        <React.Fragment key={student.admissionNumber}>
                          {/* Main Row */}
                          <tr 
                            onClick={() => toggleExpand(student.admissionNumber)}
                            className={`cursor-pointer hover:bg-purple-50/50 transition-colors group ${student.lowAttendance ? 'bg-red-50/30' : ''}`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {student.lowAttendance ? (
                                  <div className="p-2 bg-red-100 rounded-lg shrink-0">
                                    <AlertTriangle className="w-4 h-4 text-red-600" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-purple-100 text-purple-700 font-bold flex items-center justify-center rounded-full shrink-0">
                                    {((student as any).name || student.fullName || 'S').charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                                    {(student as any).name || student.fullName || `${student.firstName} ${student.lastName}`}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-0.5">{student.admissionNumber}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center font-medium text-slate-600">{student.rollNumber}</td>
                            <td className="px-6 py-4 text-center text-green-600 font-bold">{student.presentDays}</td>
                            <td className="px-6 py-4 text-center text-red-600 font-bold">{student.absentDays}</td>
                            <td className="px-6 py-4 text-center font-medium text-slate-600">{student.totalDays}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-lg font-bold ${student.percentage < 75 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {student.percentage}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="p-2 rounded-lg text-slate-400 hover:bg-purple-100 hover:text-purple-600 transition-colors">
                                {expandedStudent === student.admissionNumber ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </td>
                          </tr>

                          {/* Expandable Daily Breakdown Row */}
                          {expandedStudent === student.admissionNumber && (
                            <tr className="bg-slate-50 border-t border-slate-100">
                              <td colSpan={7} className="px-6 py-6">
                                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-purple-600" />
                                  Daily Attendance Breakdown ({months.find(m => m.value === selectedMonth)?.label})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {(student as any).monthlyBreakdown?.[0]?.records?.length > 0 ? (
                                    (student as any).monthlyBreakdown[0].records
                                      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                      .map((record: any, idx: number) => {
                                        const d = new Date(record.date);
                                        const dayNum = d.getDate();
                                        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
                                        
                                        let bg = 'bg-slate-100 text-slate-600 border-slate-200';
                                        if (record.status === 'present') bg = 'bg-green-50 text-green-700 border-green-200';
                                        if (record.status === 'absent') bg = 'bg-red-50 text-red-700 border-red-200';
                                        if (record.status === 'late') bg = 'bg-orange-50 text-orange-700 border-orange-200';

                                        return (
                                          <div key={idx} className={`border px-3 py-2 rounded-xl flex flex-col items-center justify-center min-w-[60px] shadow-sm ${bg}`} title={record.remarks || record.status}>
                                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5">{dayStr}</span>
                                            <span className="text-lg font-bold leading-none mb-1">{dayNum}</span>
                                            <span className="text-[10px] font-bold uppercase">{record.status.charAt(0)}</span>
                                          </div>
                                        );
                                      })
                                  ) : (
                                    <span className="text-sm text-slate-500 italic bg-white px-4 py-2 rounded-lg border border-slate-200">
                                      No daily records logged for this month yet.
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </TeacherLayout>
  )
}