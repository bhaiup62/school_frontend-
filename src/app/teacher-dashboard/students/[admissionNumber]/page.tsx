// src/app/teacher-dashboard/students/[admissionNumber]/page.tsx

'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import TeacherLayout from '@/components/teacher/TeacherLayout'
import { getStudentDetail } from '@/services/teacherService'
import type { Student } from '@/services/teacherService'
import { 
  User, Users, Phone, Mail, Calendar, BookOpen, ArrowLeft, Award, 
  TrendingUp, CalendarCheck, MessageSquare, MapPin 
} from 'lucide-react'

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const admissionNumber = params.admissionNumber as string
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await getStudentDetail(admissionNumber)
        setStudent(res.data)
      } catch (err: any) {
        console.error(err)
        // If it's a 403, we know it's a permission issue, not a missing student
        if (err.response?.status === 403) {
           setStudent(null) 
        }
      } finally {
        setLoading(false)
      }
    }
    if (admissionNumber) fetchStudent()
  }, [admissionNumber])

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

  if (!student) {
    return (
      <TeacherLayout>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 text-center py-16 max-w-2xl mx-auto mt-10">
          <User className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold text-slate-700">Student Not Found</h3>
          <p className="text-slate-500 mt-2 mb-6">This student does not exist or you do not have permission to view their profile.</p>
          <button onClick={() => router.back()} className="px-6 py-2.5 bg-purple-50 text-purple-700 font-semibold rounded-xl hover:bg-purple-100 transition-colors">
            Go Back
          </button>
        </div>
      </TeacherLayout>
    )
  }

  const overallAttendance = student.attendance?.reduce((acc, month) => {
    return { total: acc.total + (month.totalDays || 0), present: acc.present + (month.presentDays || 0) }
  }, { total: 0, present: 0 })
  
  const attendancePercent = overallAttendance && overallAttendance.total > 0
    ? Math.round((overallAttendance.present / overallAttendance.total) * 100) : 0

  const latestResult = student.results && student.results.length > 0
    ? student.results[student.results.length - 1] : null
    
  const displayName = (student as any).name || student.fullName || `${student.firstName} ${student.lastName}`

  return (
    <TeacherLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-800">Student Profile</h2>
            <p className="text-sm font-medium text-slate-500">Detailed view and academic records</p>
          </div>
        </div>

        {/* Hero Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Gradient Banner */}
          <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          </div>
          
          <div className="px-6 sm:px-10 pb-8">
            {/* Overlapping Avatar & Badges */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6 relative z-10">
              <div className="flex items-end gap-5">
                <div className="w-24 h-24 bg-white p-1.5 rounded-2xl shadow-md shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <span className="text-3xl font-display font-bold text-purple-700">
                      {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="mb-1">
                  <h2 className="text-3xl font-display font-bold text-slate-800 leading-tight">{displayName}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 font-semibold text-xs rounded-lg border border-slate-200">
                      ID: {student.admissionNumber}
                    </span>
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 font-semibold text-xs rounded-lg border border-purple-100 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> Class {student.class}-{student.section}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100">
              <StatBadge 
                icon={CalendarCheck} label="Attendance" 
                value={`${attendancePercent}%`} 
                color={attendancePercent < 75 ? 'red' : 'green'} 
              />
              <StatBadge 
                icon={TrendingUp} label="Last Exam" 
                value={latestResult ? `${latestResult.percentage}%` : '—'} 
                color="blue" 
              />
              <StatBadge 
                icon={Award} label="Class Rank" 
                value={latestResult?.rank ? `#${latestResult.rank}` : '—'} 
                color="purple" 
              />
              <StatBadge 
                icon={BookOpen} label="Total Exams" 
                value={student.results?.length || 0} 
                color="orange" 
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Info) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="font-display font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <InfoItem icon={User} label="Full Name" value={displayName} />
                <InfoItem icon={Calendar} label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '—'} />
                <InfoItem icon={User} label="Gender" value={student.gender || '—'} className="capitalize" />
                <InfoItem icon={Award} label="Roll Number" value={student.rollNumber} />
                <InfoItem icon={Phone} label="Phone Number" value={student.phone || '—'} />
                <InfoItem icon={Mail} label="Email Address" value={student.email || '—'} />
                <InfoItem icon={MapPin} label="Home Address" value={`${student.address || '—'}, ${student.city || ''}`} className="sm:col-span-2" />
              </div>
            </div>

            {student.parents && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h3 className="font-display font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Parent Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                  <InfoItem icon={User} label="Father's Name" value={student.parents.fatherName || '—'} />
                  <InfoItem icon={User} label="Mother's Name" value={student.parents.motherName || '—'} />
                  <InfoItem icon={Phone} label="Primary Contact" value={student.parents.phone || '—'} />
                  <InfoItem icon={Mail} label="Parent Email" value={student.parents.email || '—'} />
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Results & Remarks) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Results Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h3 className="font-display font-bold text-slate-800">Recent Results</h3>
              </div>
              <div className="p-6">
                {student.results && student.results.length > 0 ? (
                  <div className="space-y-4">
                    {student.results.slice(-3).reverse().map((result, i) => (
                      <div key={i} className="group p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-slate-800 text-sm capitalize">{result.examType.replace('_', ' ')} Exam</p>
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{result.session}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            result.result === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {result.result}
                          </span>
                        </div>
                        <div className="flex items-end justify-between mt-4 pt-4 border-t border-slate-100">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Score</p>
                            <p className="text-lg font-display font-bold text-indigo-600 leading-none">
                              {result.totalObtained} <span className="text-sm text-slate-400 font-medium">/ {result.totalMarks}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Percentage</p>
                            <p className="text-lg font-display font-bold text-slate-800 leading-none">{result.percentage}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm font-medium text-slate-500">No exam results recorded yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Remarks Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="font-display font-bold text-slate-800">Teacher Remarks</h3>
              </div>
              <div className="p-6">
                {student.classTeacherRemarks && student.classTeacherRemarks.length > 0 ? (
                  <div className="space-y-4">
                    {student.classTeacherRemarks.slice(-3).reverse().map((remark, i) => (
                      <div key={i} className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl relative">
                        <MessageSquare className="absolute top-4 right-4 w-4 h-4 text-purple-200" />
                        <p className="text-sm font-medium text-slate-700 leading-relaxed relative z-10">"{remark.remark}"</p>
                        <div className="mt-3 pt-3 border-t border-purple-100/50 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-purple-600/60">
                          <span>{remark.addedBy}</span>
                          <span>{new Date(remark.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm font-medium text-slate-500">No remarks added yet.</p>
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

// Sub-components

function InfoItem({ icon: Icon, label, value, className = '' }: { icon: any; label: string; value: string | number; className?: string }) {
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="pt-0.5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  )
}

function StatBadge({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: 'red' | 'green' | 'blue' | 'purple' | 'orange' }) {
  const styles = {
    red: 'bg-red-50 text-red-600 border-red-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-amber-50 text-amber-600 border-amber-100',
  }
  
  return (
    <div className={`flex items-center gap-3 p-3 sm:p-4 rounded-2xl border ${styles[color]}`}>
      <div className="p-2 bg-white/60 rounded-xl shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-0.5">{label}</p>
        <p className="text-xl font-display font-bold leading-none">{value}</p>
      </div>
    </div>
  )
}