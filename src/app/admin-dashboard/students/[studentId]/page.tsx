'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { getStudentProfile, deactivateStudent } from '@/services/admin/studentService'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useToast } from '@/components/ui/ToastProvider'
import { 
  ArrowLeft, User, Phone, MapPin, Bus, Activity, 
  FileText, Award, UserX, CheckCircle2, XCircle, FileBadge 
} from 'lucide-react'

// Helper to format dates
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.studentId as string

  const { handleError } = useErrorHandler()
  const toast = useToast()

  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'documents'>('overview')

  const fetchProfile = async () => {
    try {
      const res = await getStudentProfile(studentId)
      setStudent(res.data)
    } catch (error) {
      handleError(error)
      router.push('/admin-dashboard/students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [studentId])

  const handleDeactivate = async () => {
    if (!window.confirm(`Are you sure you want to deactivate ${student.firstName}? This will revoke their login access and mark them as TC/Alumni.`)) return
    
    try {
      await deactivateStudent(studentId)
      toast.success("Student deactivated successfully!")
      fetchProfile() // Refresh data to show new status
    } catch (error) {
      handleError(error)
    }
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div></AdminLayout>
  if (!student) return null

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/admin-dashboard/students" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ── LEFT SIDEBAR (Profile Card & Actions) ── */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* ID Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10"></div>
              
              <div className="relative mx-auto w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl font-black text-indigo-600 uppercase">
                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
              </div>
              
              <h2 className="text-xl font-black text-slate-900 mt-4">{student.firstName} {student.lastName}</h2>
              <p className="text-sm font-bold text-slate-500 mt-1">Class {student.currentClass} - {student.currentSection}</p>
              
              <div className="mt-6 grid grid-cols-2 gap-3 divide-x divide-slate-100 border-t border-slate-100 pt-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admission No</p>
                  <p className="text-sm font-black text-slate-800 mt-1">{student.admissionNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Roll No</p>
                  <p className="text-sm font-black text-slate-800 mt-1">{student.rollNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                {student.isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active Student
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold uppercase tracking-wider">
                    <UserX className="w-4 h-4" /> TC Issued / Inactive
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => toast('Edit feature coming in next step!', { icon: '🛠️' })}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 font-bold text-sm transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" /> Edit Profile
                  </div>
                  <ArrowLeft className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                {student.isActive && (
                  <button 
                    onClick={handleDeactivate}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-sm transition-colors"
                  >
                    <UserX className="w-4 h-4" /> Issue TC / Deactivate
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* ── RIGHT MAIN AREA (Tabs & Content) ── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs Header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex gap-1 overflow-x-auto">
              <button onClick={() => setActiveTab('overview')} className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                <User className="w-4 h-4" /> Overview
              </button>
              <button onClick={() => setActiveTab('academics')} className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'academics' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Award className="w-4 h-4" /> Academics
              </button>
              <button onClick={() => setActiveTab('documents')} className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'documents' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                <FileBadge className="w-4 h-4" /> Documents
              </button>
            </div>

            {/* ── TAB 1: OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Personal & Contact Grid */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-indigo-500" /> Personal Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</p><p className="text-sm font-semibold text-slate-800 mt-1">{formatDate(student.dateOfBirth)}</p></div>
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase">Gender</p><p className="text-sm font-semibold text-slate-800 mt-1 capitalize">{student.gender}</p></div>
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase">Blood Group</p><p className="text-sm font-semibold text-rose-600 mt-1">{student.bloodGroup || 'N/A'}</p></div>
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase">Religion & Caste</p><p className="text-sm font-semibold text-slate-800 mt-1">{student.religion || 'N/A'} • {student.caste}</p></div>
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase">Aadhar Number</p><p className="text-sm font-semibold text-slate-800 mt-1">{student.aadharNumber || 'N/A'}</p></div>
                  </div>

                  <hr className="my-8 border-slate-100" />

                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-6">
                    <Phone className="w-5 h-5 text-indigo-500" /> Parent & Contact Info
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Father's Details</p>
                      <p className="text-sm font-bold text-slate-800">{student.parents?.fatherName || 'N/A'}</p>
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> {student.parents?.fatherPhone || 'N/A'}</p>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-1 border-t border-slate-200 pt-2">{student.parents?.fatherOccupation || 'Occupation N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Mother's Details</p>
                      <p className="text-sm font-bold text-slate-800">{student.parents?.motherName || 'N/A'}</p>
                      <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> {student.parents?.motherPhone || 'N/A'}</p>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-1 border-t border-slate-200 pt-2">{student.parents?.motherOccupation || 'Occupation N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-start gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                    <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-indigo-900">Residential Address</p>
                      <p className="text-sm text-indigo-700 mt-1">{student.address ? `${student.address}, ${student.city} - ${student.pincode}` : 'Address not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Logistics & Medical Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Transport */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
                      <Bus className="w-5 h-5 text-indigo-500" /> Transport
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Commute Mode</p>
                        <p className="text-sm font-semibold text-slate-800 mt-1 capitalize">{student.transport?.mode?.replace('_', ' ') || 'Parents'}</p>
                      </div>
                      {student.transport?.mode === 'school_bus' && (
                        <>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Bus Route</p>
                            <p className="text-sm font-semibold text-slate-800 mt-1">{student.transport?.route || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup Stop</p>
                            <p className="text-sm font-semibold text-slate-800 mt-1">{student.transport?.stop || 'N/A'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Medical */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
                      <Activity className="w-5 h-5 text-rose-500" /> Medical Record
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Allergies</p>
                        <p className="text-sm font-semibold text-slate-800 mt-1">{student.medicalRecord?.allergies || 'None reported'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Chronic Illnesses</p>
                        <p className="text-sm font-semibold text-slate-800 mt-1">{student.medicalRecord?.chronicIllnesses || 'None reported'}</p>
                      </div>
                      <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                        <p className="text-[10px] font-bold text-rose-400 uppercase">Emergency Contact</p>
                        <p className="text-sm font-bold text-rose-700 mt-1">
                          {student.medicalRecord?.emergencyContactName || 'N/A'} • {student.medicalRecord?.emergencyContactPhone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ── TAB 2: ACADEMICS ── */}
            {activeTab === 'academics' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Previous History */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-indigo-500" /> Previous Academic History
                  </h3>
                  {student.previousAcademicHistory?.schoolName ? (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="font-bold text-slate-800 text-lg">{student.previousAcademicHistory.schoolName}</p>
                      <p className="text-xs text-slate-500 mt-1">{student.previousAcademicHistory.board} Board</p>
                      
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                        <div><p className="text-[10px] font-bold text-slate-400 uppercase">Last Class</p><p className="text-sm font-bold text-slate-800 mt-0.5">{student.previousAcademicHistory.lastClass}</p></div>
                        <div><p className="text-[10px] font-bold text-slate-400 uppercase">Percentage</p><p className="text-sm font-bold text-slate-800 mt-0.5">{student.previousAcademicHistory.percentage}</p></div>
                        <div><p className="text-[10px] font-bold text-slate-400 uppercase">TC Number</p><p className="text-sm font-bold text-slate-800 mt-0.5">{student.previousAcademicHistory.tcNumber || 'N/A'}</p></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-sm font-medium">No previous school history recorded.</p>
                    </div>
                  )}
                </div>

                {/* Current Results Plugin (Placeholder) */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-indigo-500" /> Current Session Results
                  </h3>
                  <div className="text-center py-10 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <Award className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-indigo-900">Exam Results Module Active</p>
                    <p className="text-xs text-indigo-600 mt-1 max-w-sm mx-auto">
                      All unit tests and term examinations are currently processed and managed directly from the Exam Engine dashboard.
                    </p>
                    <Link href="/admin-dashboard/exams" className="inline-block mt-4 text-xs font-bold bg-white text-indigo-600 px-4 py-2 rounded-lg border border-indigo-200 shadow-sm hover:bg-indigo-600 hover:text-white transition-colors">
                      Go to Exam Engine
                    </Link>
                  </div>
                </div>

              </div>
            )}

            {/* ── TAB 3: DOCUMENTS ── */}
            {activeTab === 'documents' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-6">
                  <FileBadge className="w-5 h-5 text-indigo-500" /> Document Checklist
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'birthCertificate', label: 'Birth Certificate' },
                    { key: 'aadharCard', label: 'Aadhar Card' },
                    { key: 'previousMarksheet', label: 'Previous Marksheet' },
                    { key: 'transferCertificate', label: 'Transfer Certificate (TC)' },
                    { key: 'casteCertificate', label: 'Caste Certificate' },
                    { key: 'medicalFitness', label: 'Medical Fitness Certificate' },
                    { key: 'photographs', label: 'Passport Size Photographs' }
                  ].map((doc) => {
                    const isSubmitted = student.documentChecklist?.[doc.key] === true
                    
                    return (
                      <div key={doc.key} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${isSubmitted ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
                        <span className={`text-sm font-bold ${isSubmitted ? 'text-emerald-900' : 'text-slate-600'}`}>
                          {doc.label}
                        </span>
                        {isSubmitted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-300 shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </AdminLayout>
  )
}