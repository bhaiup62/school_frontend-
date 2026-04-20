'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ParentLayout from '@/components/parent/ParentLayout'
import { getChildProfile } from '@/services/parentService'
import { User, BookOpen, CalendarCheck, Clock, ChevronLeft, MapPin, Droplet, Hash, GraduationCap, RefreshCw } from 'lucide-react'

export default function ChildProfilePage() {
  const { admissionNumber } = useParams() as { admissionNumber: string }
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(() => {
    if (!admissionNumber) return
    setLoading(true)
    getChildProfile(admissionNumber)
      .then(res => setStudent(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [admissionNumber])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading && !student) return (
    <ParentLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    </ParentLayout>
  )

  if (!student && !loading) return (
    <ParentLayout>
      <div className="text-center text-slate-400 py-20 font-medium">Student not found.</div>
    </ParentLayout>
  )

  return (
    <ParentLayout>
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Back Navigation */}
        <Link href="/parent-dashboard/children" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to All Children
        </Link>

        {/* Hero Card with Refresh */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <button 
            onClick={loadData} 
            className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white border border-white/20 backdrop-blur-sm z-20"
            title="Refresh Profile"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-inner shrink-0 z-10">
            <User className="w-12 h-12 text-white" />
          </div>
          <div className="text-center md:text-left z-10">
            <h2 className="font-display font-bold text-3xl tracking-tight mb-2">{student.firstName} {student.lastName}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold rounded-lg shadow-sm">
                Class {student.class}-{student.section}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold rounded-lg shadow-sm">
                Roll No: {student.rollNumber}
              </span>
              <span className="px-3 py-1 bg-black/20 border border-black/10 text-emerald-50 text-sm font-semibold rounded-lg">
                ID: {student.admissionNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href={`/parent-dashboard/children/${admissionNumber}/results`} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 group transition-all">
             <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><BookOpen className="w-6 h-6 text-blue-600" /></div>
             <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">Exam Results</h3>
             <p className="text-sm text-slate-500 font-medium mt-1">View report cards & performance</p>
          </Link>
          <Link href={`/parent-dashboard/children/${admissionNumber}/attendance`} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 group transition-all">
             <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><CalendarCheck className="w-6 h-6 text-emerald-600" /></div>
             <h3 className="font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">Attendance</h3>
             <p className="text-sm text-slate-500 font-medium mt-1">Check daily presence & history</p>
          </Link>
          <Link href={`/parent-dashboard/children/${admissionNumber}/timetable`} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 group transition-all">
             <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Clock className="w-6 h-6 text-amber-600" /></div>
             <h3 className="font-bold text-slate-800 text-lg group-hover:text-amber-700 transition-colors">Timetable</h3>
             <p className="text-sm text-slate-500 font-medium mt-1">View weekly class schedule</p>
          </Link>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap className="w-5 h-5 text-emerald-600" /> Academic Details
            </h3>
            <div className="space-y-4">
              <InfoRow icon={Hash} label="Admission Number" value={student.admissionNumber} />
              <InfoRow icon={CalendarCheck} label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-IN') : '—'} />
              <InfoRow icon={BookOpen} label="Current Session" value={student.session} />
              <InfoRow icon={User} label="Class & Section" value={`Class ${student.class} — Section ${student.section}`} />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-emerald-600" /> Personal Details
            </h3>
            <div className="space-y-4">
              <InfoRow icon={User} label="Gender" value={student.gender} />
              <InfoRow icon={CalendarCheck} label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-IN') : '—'} />
              <InfoRow icon={Droplet} label="Blood Group" value={student.bloodGroup || '—'} />
              <InfoRow icon={MapPin} label="Address" value={student.address || '—'} />
            </div>
          </div>
        </div>

      </div>
    </ParentLayout>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-slate-800 capitalize">{value}</p>
      </div>
    </div>
  )
}