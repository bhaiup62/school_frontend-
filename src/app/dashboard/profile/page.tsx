'use client'
import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getProfile, updateProfile } from '@/services/studentService'
import { 
  User, Phone, Mail, MapPin, Calendar, Edit2, Save, X, Hash, 
  Droplet, Users, ShieldCheck, CheckCircle, AlertTriangle, 
  RefreshCw, HeartPulse, Bus, BookOpen 
} from 'lucide-react'

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ phone: '', email: '', address: '', city: '', pincode: '' })
  const [message, setMessage] = useState({ type: '', text: '' })

  const loadProfile = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getProfile()
      setProfile(res.data)
      setForm({
        phone: res.data.phone || '',
        email: res.data.email || '',
        address: res.data.address || '',
        city: res.data.city || '',
        pincode: res.data.pincode || '',
      })
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Failed to load profile data.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await updateProfile(form)
      setProfile(res.data)
      setEditing(false)
      setMessage({ type: 'success', text: 'Contact information updated successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading && !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-navy-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        
        {/* Global Toast Message */}
        {message.text && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 shadow-sm font-bold text-sm animate-in fade-in ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-navy-800 to-navy-950 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <button 
  onClick={loadProfile} 
  className="p-3.5 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all text-slate-900 font-bold border border-amber-400 shadow-lg flex items-center justify-center shrink-0 w-fit md:mt-0 mt-4 z-20"
  title="Refresh"
>
  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
</button>

          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-inner shrink-0 z-10">
            <User className="w-12 h-12 text-gold-400" />
          </div>
          
          <div className="text-center md:text-left z-10 w-full pt-2">
            <h2 className="font-display font-bold text-3xl tracking-tight mb-2 text-white">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
              <span className="px-3 py-1.5 bg-gold-500 text-navy-950 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" /> Class {profile?.class}-{profile?.section}
              </span>
              <span className="px-3 py-1.5 bg-white/10 border border-white/20 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
                <Hash className="w-3.5 h-3.5" /> Roll: {profile?.rollNumber}
              </span>
              <span className="px-3 py-1.5 bg-black/20 border border-black/10 text-navy-50 text-xs font-bold rounded-lg uppercase tracking-wider">
                ID: {profile?.admissionNumber}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Personal Info (Read Only) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-navy-600" /> Personal Details
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">Read Only</span>
            </div>
            <div className="space-y-5">
              <InfoRow icon={User} label="Gender" value={profile?.gender || 'Not Provided'} className="capitalize" />
              <InfoRow icon={Calendar} label="Date of Birth" value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'}) : 'Not Provided'} />
              <InfoRow icon={Droplet} label="Blood Group" value={profile?.bloodGroup || 'Not Provided'} />
              <InfoRow icon={Calendar} label="Admission Date" value={profile?.admissionDate ? new Date(profile.admissionDate).toLocaleDateString('en-IN', {day:'numeric', month:'long', year:'numeric'}) : 'Not Provided'} />
              <InfoRow icon={ShieldCheck} label="Aadhar Number" value={profile?.aadharNumber || 'Not Provided'} />
            </div>
            <p className="text-xs font-medium text-slate-400 mt-6 italic flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Contact the Receptionist to update personal data.
            </p>
          </div>

          {/* Contact Info (Editable) */}
          <div className={`bg-white rounded-3xl border ${editing ? 'border-gold-400 ring-4 ring-gold-50' : 'border-slate-200'} p-6 sm:p-8 shadow-sm transition-all`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-navy-600" /> Contact Information
              </h3>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="px-4 py-2 bg-navy-50 text-navy-700 hover:bg-navy-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-navy-100 shadow-sm">
                  <Edit2 className="w-3.5 h-3.5" /> Edit Info
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditing(false); setForm({ phone: profile?.phone || '', email: profile?.email || '', address: profile?.address || '', city: profile?.city || '', pincode: profile?.pincode || '' })}} className="px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving} className="bg-navy-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-navy-700 disabled:opacity-50 transition-colors shadow-sm shadow-navy-500/20">
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Phone Number</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-navy-500 focus:bg-white transition-all outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-navy-500 focus:bg-white transition-all outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Street Address</label>
                  <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-navy-500 focus:bg-white transition-all outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">City</label>
                    <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-navy-500 focus:bg-white transition-all outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Pincode</label>
                    <input type="text" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-navy-500 focus:bg-white transition-all outline-none" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in">
                <InfoRow icon={Phone} label="Primary Phone" value={profile?.phone || 'Not provided'} />
                <InfoRow icon={Mail} label="Email Address" value={profile?.email || 'Not provided'} className="lowercase" />
                <InfoRow icon={MapPin} label="Home Address" value={profile?.address ? `${profile.address}, ${profile.city || ''} - ${profile.pincode || ''}`.trim() : 'Not provided'} />
              </div>
            )}
          </div>

          {/* Family Info */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h3 className="font-display font-bold text-slate-800 text-lg mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Users className="w-5 h-5 text-navy-600" /> Family Information
            </h3>
            <div className="space-y-5">
              <InfoRow icon={User} label="Father's Name" value={profile?.parents?.fatherName || 'Not Provided'} className="capitalize" />
              <InfoRow icon={User} label="Mother's Name" value={profile?.parents?.motherName || 'Not Provided'} className="capitalize" />
              <InfoRow icon={User} label="Guardian's Name" value={profile?.parents?.guardianName || 'Not Provided'} className="capitalize" />
              <InfoRow icon={Phone} label="Emergency/Guardian Phone" value={profile?.parents?.phone || 'Not Provided'} />
            </div>
          </div>

          {/* Medical & Transport */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h3 className="font-display font-bold text-slate-800 text-lg mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <HeartPulse className="w-5 h-5 text-navy-600" /> Medical & Transport
            </h3>
            <div className="space-y-5">
              <InfoRow icon={AlertTriangle} label="Known Allergies" value={profile?.medicalRecord?.allergies || 'None'} />
              <InfoRow icon={HeartPulse} label="Emergency Contact" value={profile?.medicalRecord?.emergencyContactName ? `${profile.medicalRecord.emergencyContactName} (${profile.medicalRecord.emergencyContactPhone})` : 'Not Provided'} />
              <InfoRow icon={Bus} label="Transport Mode" value={profile?.transport?.mode?.replace('_', ' ') || 'Not Provided'} className="capitalize" />
              {profile?.transport?.mode === 'school_bus' && (
                <InfoRow icon={MapPin} label="Bus Route / Stop" value={profile?.transport?.route || 'Not Provided'} />
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}

// Helper Component
function InfoRow({ icon: Icon, label, value, className = '' }: { icon: any, label: string, value: string, className?: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-navy-50 group-hover:border-navy-100 transition-colors">
        <Icon className="w-4 h-4 text-slate-400 group-hover:text-navy-600 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-sm font-semibold text-slate-800 truncate ${className}`}>{value}</p>
      </div>
    </div>
  )
}