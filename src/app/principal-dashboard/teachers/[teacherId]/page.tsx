// src/app/principal-dashboard/teachers/[teacherId]/page.tsx

'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Phone, Calendar, BookOpen, Users, Award, GraduationCap } from 'lucide-react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import * as principalService from '@/services/principalService'

export default function TeacherDetailPage() {
  const params = useParams()
  const router = useRouter()
  const teacherId = params.teacherId as string
  
  const [teacher, setTeacher] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'results'>('overview')
  const [students, setStudents] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  useEffect(() => {
    fetchTeacher()
  }, [teacherId])

  useEffect(() => {
    if (activeTab === 'students' && teacher?.currentClassTeacherOf) {
      fetchClassStudents()
    }
  }, [activeTab, teacher])

  const fetchTeacher = async () => {
    try {
      const res = await principalService.getTeacherDetail(teacherId)
      if (res.success) setTeacher(res.data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchClassStudents = async () => {
    if (!teacher?.currentClassTeacherOf) return
    setLoadingStudents(true)
    try {
      const res = await principalService.getAllStudents({
        class: teacher.currentClassTeacherOf.class,
        section: teacher.currentClassTeacherOf.section
      })
      if (res.success) setStudents(res.data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoadingStudents(false)
    }
  }

  if (loading) {
    return (
      <PrincipalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      </PrincipalLayout>
    )
  }

  if (!teacher) {
    return (
      <PrincipalLayout>
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Teacher not found</p>
          <Link href="/principal-dashboard/teachers" className="text-indigo-600 hover:underline">
            Back to Teachers
          </Link>
        </div>
      </PrincipalLayout>
    )
  }

  return (
    <PrincipalLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Teacher Header */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold">
              {(teacher.fullName || teacher.firstName || 'T').charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{teacher.fullName || `${teacher.firstName} ${teacher.lastName}`}</h1>
              <div className="text-sm opacity-90 mt-1">{teacher.teacherId}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {teacher.subjects?.map((s: string) => (
                  <span key={s} className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            {teacher.currentClassTeacherOf && (
              <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-center">
                <div className="text-xs opacity-80">Class Teacher</div>
                <div className="text-xl font-bold">{teacher.currentClassTeacherOf.class}-{teacher.currentClassTeacherOf.section}</div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
          {teacher.currentClassTeacherOf && (
            <TabButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} label="Class Students" />
          )}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <InfoRow icon={Mail} label="Email" value={teacher.email} />
                <InfoRow icon={Phone} label="Phone" value={teacher.phone || 'Not set'} />
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <InfoRow icon={User} label="Gender" value={teacher.gender || 'Not set'} />
                <InfoRow icon={Calendar} label="Date of Birth" value={teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString() : 'Not set'} />
              </div>
            </div>

            {/* Employment Details */}
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Employment Details</h3>
              <div className="space-y-4">
                <InfoRow icon={Award} label="Qualification" value={teacher.qualification || 'Not set'} />
                <InfoRow icon={Calendar} label="Join Date" value={teacher.joinDate ? new Date(teacher.joinDate).toLocaleDateString() : 'Not set'} />
                <InfoRow icon={BookOpen} label="Experience" value={teacher.experience ? `${teacher.experience} years` : 'Not set'} />
              </div>
            </div>

            {/* Subjects & Classes */}
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Subjects & Classes</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {teacher.subjects?.map((s: string) => (
                      <span key={s} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                {teacher.subjectAssignments && teacher.subjectAssignments.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Class Assignments</p>
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjectAssignments.map((a: any, i: number) => (
                        <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {a.subject} - {a.class}-{a.section}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {teacher.address && (
              <div className="bg-white rounded-xl border border-slate-100 p-5 lg:col-span-2">
                <h3 className="font-semibold text-slate-800 mb-4">Address</h3>
                <p className="text-slate-600">
                  {teacher.address}
                  {teacher.city && `, ${teacher.city}`}
                  {teacher.pincode && ` - ${teacher.pincode}`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && teacher.currentClassTeacherOf && (
          loadingStudents ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">
                  Class {teacher.currentClassTeacherOf.class}-{teacher.currentClassTeacherOf.section} Students ({students.length})
                </h3>
              </div>
              {students.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  No students in this class
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-slate-600">Roll</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-600">Student</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-600">Gender</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-600">Phone</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-600">Parent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {students.map(s => (
                        <tr key={s.admissionNumber} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-600">{s.rollNumber || '-'}</td>
                          <td className="px-4 py-3">
                            <Link href={`/principal-dashboard/students/${s.admissionNumber}`} className="hover:text-indigo-600">
                              <div className="font-medium text-slate-800">{s.name}</div>
                              <div className="text-xs text-slate-400">{s.admissionNumber}</div>
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-slate-600 capitalize">{s.gender || '-'}</td>
                          <td className="px-4 py-3 text-slate-600">{s.phone || '-'}</td>
                          <td className="px-4 py-3 text-slate-600">{s.parents?.fatherName || s.parents?.motherName || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </PrincipalLayout>
  )
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
      active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
    }`}>
      {label}
    </button>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-indigo-600" />
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm font-medium text-slate-700">{value}</div>
      </div>
    </div>
  )
}
