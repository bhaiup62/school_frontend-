// src/app/teacher-dashboard/profile/page.tsx

'use client'
import { useEffect, useState } from 'react'
import TeacherLayout from '@/components/teacher/TeacherLayout'
import { getProfile, updateProfile } from '@/services/teacherService'
import type { TeacherProfile } from '@/services/teacherService'
import { User, Phone, Mail, MapPin, Briefcase, GraduationCap, Calendar, BookOpen, Award, Save, X, CheckCircle, AlertTriangle } from 'lucide-react'

export default function TeacherProfilePage() {
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ phone: '', email: '', address: '', pincode: '' })
  
  // Added notification message state
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile()
        setTeacher(res.data)
        setForm({
          phone: res.data.phone || '',
          email: res.data.email || '',
          address: res.data.address || '',
          pincode: res.data.pincode || '',
        })
      } catch (err) {
        console.error(err)
        setMessage({ type: 'error', text: 'Failed to load profile data.' })
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await updateProfile(form)
      setTeacher(res.data)
      setEditing(false)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err: any) {
      console.error(err)
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
        </div>
      </TeacherLayout>
    )
  }

  if (!teacher) {
    return (
      <TeacherLayout>
        <div className="text-center py-10 text-slate-500">Profile not found.</div>
      </TeacherLayout>
    )
  }

  // Safely extract the new schema fields for rendering
  const classTeacherInfo = teacher.currentClassTeacherOf || teacher.classTeacherOf;
  const classesToRender = teacher.currentAssignedClasses || teacher.assignedClasses || [];

  return (
    <TeacherLayout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Success/Error Message Banner */}
        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 shadow-sm transition-all ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto hover:bg-white/50 rounded-lg p-1 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gold-500/20 rounded-full flex items-center justify-center border border-gold-500/30">
              <User className="w-8 h-8 text-gold-400" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">
                {teacher.fullName || `${teacher.firstName} ${teacher.lastName}`}
              </h2>
              <p className="text-purple-300 font-medium tracking-wide">{teacher.teacherId}</p>
              {teacher.isClassTeacher && classTeacherInfo && (
                <div className="inline-flex items-center gap-1.5 bg-gold-500/20 px-3 py-1 rounded-full mt-2 border border-gold-500/30">
                  <Award className="w-4 h-4 text-gold-400" />
                  <p className="text-gold-400 text-xs font-bold uppercase tracking-wider">
                    Class Teacher: {classTeacherInfo.class}-{classTeacherInfo.section}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-display font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={User} label="Full Name" value={`${teacher.firstName} ${teacher.lastName}`} />
            <InfoRow icon={Briefcase} label="Teacher ID" value={teacher.teacherId} />
            <InfoRow icon={GraduationCap} label="Qualification" value={teacher.qualification || '—'} />
            <InfoRow icon={Calendar} label="Experience" value={`${teacher.experience} years`} />
            <InfoRow icon={Calendar} label="Joining Date" value={new Date(teacher.joiningDate).toLocaleDateString()} />
            <InfoRow icon={BookOpen} label="Department" value={teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects[0] : '—'} />
          </div>
        </div>

        {/* Subjects & Classes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-display font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" /> Subjects & Classes
          </h3>
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subjects Taught</p>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects && teacher.subjects.length > 0 ? (
                  teacher.subjects.map((subject) => (
                    <span key={subject} className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-sm font-bold">
                      {subject}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm font-medium italic">No subjects assigned</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Classes</p>
              <div className="flex flex-wrap gap-2">
                {classesToRender && classesToRender.length > 0 ? (
                  classesToRender.map((cls: string) => (
                    <span key={cls} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm font-bold">
                      Class {cls}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm font-medium italic">No classes assigned</span>
                )}
              </div>
            </div>
            {(teacher as any).isDepartmentHead && (
              <div className="flex items-center gap-2 text-gold-600 bg-gold-50 p-3 rounded-xl border border-gold-100 inline-flex">
                <Award className="w-5 h-5" />
                <span className="font-bold text-sm uppercase tracking-wider">Department Head</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Info (Editable) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
              <Phone className="w-5 h-5 text-purple-600" /> Contact Information
            </h3>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-sm font-bold transition-colors">
                Edit Details
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Home Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pincode / Zip</label>
                <input type="text" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Phone} label="Phone" value={teacher.phone || '—'} />
              <InfoRow icon={Mail} label="Email" value={teacher.email || '—'} />
              <InfoRow icon={MapPin} label="Address" value={teacher.address || '—'} className="sm:col-span-2" />
              <InfoRow icon={MapPin} label="City & Pincode" value={`${teacher.city || '—'}, ${teacher.pincode || '—'}`} />
            </div>
          )}
        </div>

      </div>
    </TeacherLayout>
  )
}

function InfoRow({ icon: Icon, label, value, className = '' }: { icon: any; label: string; value: string; className?: string }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors ${className}`}>
      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
        <Icon className="w-5 h-5 text-slate-500" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  )
}