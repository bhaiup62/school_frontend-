'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReceptionistLayout from '@/components/receptionist/ReceptionistLayout'
import { getStudentDetails, updateStudent } from '@/services/receptionistService'
import type { StudentDetail } from '@/services/receptionistService'
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, BookOpen, Edit2, Save, X, Hash, Droplet, Users, ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Complete Form State
  const [form, setForm] = useState({
    firstName: '', lastName: '', gender: '', dateOfBirth: '', bloodGroup: '', aadharNumber: '',
    phone: '', email: '', address: '', city: '', pincode: '',
    fatherName: '', motherName: '', guardianName: '', guardianPhone: ''
  })

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getStudentDetails(params.admissionNumber as string)
        setStudent(res.data)
        setForm({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          gender: res.data.gender || '',
          dateOfBirth: res.data.dateOfBirth ? new Date(res.data.dateOfBirth).toISOString().split('T')[0] : '',
          bloodGroup: res.data.bloodGroup || '',
          aadharNumber: res.data.aadharNumber || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
          address: res.data.address || '',
          city: res.data.city || '',
          pincode: res.data.pincode || '',
          fatherName: res.data.parents?.fatherName || '',
          motherName: res.data.parents?.motherName || '',
          guardianName: res.data.parents?.guardianName || '',
          guardianPhone: res.data.parents?.phone || ''
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [params.admissionNumber])

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      await updateStudent(params.admissionNumber as string, form)
      
      // Optimistic Update
      setStudent(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          ...form,
          parents: { 
            ...prev.parents, 
            fatherName: form.fatherName,
            motherName: form.motherName,
            guardianName: form.guardianName,
            phone: form.guardianPhone 
          }
        }
      })
      setEditing(false)
      setMessage({ type: 'success', text: 'Student profile updated successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ReceptionistLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full" />
        </div>
      </ReceptionistLayout>
    )
  }

  if (!student) {
    return (
      <ReceptionistLayout>
        <div className="text-center py-20">
          <p className="text-slate-500 font-medium text-lg">Student not found.</p>
          <button onClick={() => router.back()} className="text-teal-600 font-bold hover:underline mt-4 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to list
          </button>
        </div>
      </ReceptionistLayout>
    )
  }

  return (
    <ReceptionistLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* Top Navigation & Global Edit Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <button onClick={() => router.back()} disabled={editing} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {message.text && (
              <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold animate-in fade-in flex-1 sm:flex-auto ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {message.text}
              </div>
            )}
            
            {!editing ? (
              <button onClick={() => setEditing(true)} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2 hover:bg-teal-700 shadow-md shadow-teal-500/20">
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button onClick={() => setEditing(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors flex-1 sm:flex-auto text-center">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-md shadow-teal-500/20 flex-1 sm:flex-auto">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-inner shrink-0">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="text-center md:text-left pt-2 w-full">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-3xl font-display font-bold tracking-tight">
                  {editing ? (
                    <span className="text-teal-200">Editing Mode Enabled</span>
                  ) : (
                    `${student.firstName} ${student.lastName}`
                  )}
                </h2>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border backdrop-blur-sm ${student.isActive ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-100' : 'bg-rose-500/20 border-rose-400/30 text-rose-100'}`}>
                  {student.isActive ? 'Active Student' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold rounded-xl shadow-sm flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> Class {student.class}-{student.section}
                </span>
                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold rounded-xl shadow-sm flex items-center gap-1.5">
                  <Hash className="w-4 h-4" /> Roll: {student.rollNumber}
                </span>
                <span className="px-3 py-1.5 bg-black/20 border border-black/10 text-teal-50 text-sm font-bold rounded-xl">
                  ID: {student.admissionNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Personal Info */}
          <div className={`bg-white rounded-3xl border ${editing ? 'border-teal-400 ring-4 ring-teal-50' : 'border-slate-200'} p-8 shadow-sm transition-all`}>
            <h3 className="font-display font-bold text-slate-800 text-lg mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <User className="w-5 h-5 text-teal-600" /> Personal Information
            </h3>
            
            {editing ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">First Name</label>
                    <input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Last Name</label>
                    <input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Gender</label>
                    <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none cursor-pointer">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Date of Birth</label>
                    <input type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Blood Group</label>
                  <input type="text" value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Aadhar Number</label>
                  <input type="text" value={form.aadharNumber} onChange={e => setForm(f => ({ ...f, aadharNumber: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in">
                <InfoRow icon={User} label="Gender" value={student.gender || 'Not Provided'} />
                <InfoRow icon={Calendar} label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : 'Not Provided'} />
                <InfoRow icon={Droplet} label="Blood Group" value={student.bloodGroup || 'Not Provided'} />
                <InfoRow icon={Calendar} label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : 'Not Provided'} />
                <InfoRow icon={ShieldCheck} label="Aadhar Number" value={student.aadharNumber || 'Not Provided'} />
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className={`bg-white rounded-3xl border ${editing ? 'border-teal-400 ring-4 ring-teal-50' : 'border-slate-200'} p-8 shadow-sm transition-all`}>
            <h3 className="font-display font-bold text-slate-800 text-lg mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <MapPin className="w-5 h-5 text-teal-600" /> Contact Details
            </h3>

            {editing ? (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Student Phone</label>
                  <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Street Address</label>
                  <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">City</label>
                    <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Pincode</label>
                    <input type="text" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in">
                <InfoRow icon={Phone} label="Student Phone" value={student.phone || 'Not provided'} />
                <InfoRow icon={Phone} label="Guardian Phone" value={student.parents?.phone || 'Not provided'} />
                <InfoRow icon={Mail} label="Email Address" value={student.email || 'Not provided'} className="lowercase" />
                <InfoRow icon={MapPin} label="Full Address" value={student.address ? `${student.address}, ${student.city || ''} ${student.pincode || ''}`.trim() : 'Not provided'} />
              </div>
            )}
          </div>

          {/* Family / Parents Info */}
          <div className={`lg:col-span-2 bg-white rounded-3xl border ${editing ? 'border-teal-400 ring-4 ring-teal-50' : 'border-slate-200'} p-8 shadow-sm transition-all`}>
            <h3 className="font-display font-bold text-slate-800 text-lg mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Users className="w-5 h-5 text-teal-600" /> Family Information
            </h3>
            
            {editing ? (
              <div className="grid sm:grid-cols-2 gap-6 animate-in fade-in">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Father's Name</label>
                  <input type="text" value={form.fatherName} onChange={e => setForm(f => ({ ...f, fatherName: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Mother's Name</label>
                  <input type="text" value={form.motherName} onChange={e => setForm(f => ({ ...f, motherName: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Guardian's Name</label>
                  <input type="text" value={form.guardianName} onChange={e => setForm(f => ({ ...f, guardianName: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Guardian's Phone</label>
                  <input type="tel" value={form.guardianPhone} onChange={e => setForm(f => ({ ...f, guardianPhone: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-6 animate-in fade-in">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Father's Name</p>
                  <p className="text-base font-bold text-slate-800 capitalize">{student.parents?.fatherName || 'Not Provided'}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mother's Name</p>
                  <p className="text-base font-bold text-slate-800 capitalize">{student.parents?.motherName || 'Not Provided'}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Guardian's Name</p>
                  <p className="text-base font-bold text-slate-800 capitalize">{student.parents?.guardianName || 'Not Provided'}</p>
                </div>
              </div>
            )}
            
            {!editing && (
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                 <p className="text-sm font-medium text-slate-500">Need to link a Parent account?</p>
                 <Link href="/receptionist-dashboard/parents" className="text-sm font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition-colors">
                   Go to Parents Directory
                 </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </ReceptionistLayout>
  )
}

// Helper Component
function InfoRow({ icon: Icon, label, value, className = '' }: { icon: any, label: string, value: string, className?: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-teal-50 group-hover:border-teal-200 transition-colors">
        <Icon className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-sm font-semibold text-slate-800 truncate capitalize ${className}`}>{value}</p>
      </div>
    </div>
  )
}