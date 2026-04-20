'use client'
import { useEffect, useState, useCallback } from 'react'
import ReceptionistLayout from '@/components/receptionist/ReceptionistLayout'
import { getProfile, updateProfile } from '@/services/receptionistService'
import type { ReceptionistProfile } from '@/services/receptionistService'
import { User, Phone, Mail, MapPin, Calendar, Clock, Edit2, Save, X, RefreshCw, CheckCircle, AlertTriangle, Briefcase, GraduationCap } from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState<ReceptionistProfile | null>(null)
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
      // FIX: Backend maps updated doc directly to res.data, not res.data.receptionist
      setProfile(res.data)
      setEditing(false)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading && !profile) {
    return (
      <ReceptionistLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full" />
        </div>
      </ReceptionistLayout>
    )
  }

  if (!profile && !loading) {
    return (
      <ReceptionistLayout>
        <div className="text-center py-20">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700">Profile Not Found</h2>
          <p className="text-slate-500 font-medium">Please contact system administration.</p>
        </div>
      </ReceptionistLayout>
    )
  }

  return (
    <ReceptionistLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Global Toast Message */}
        {message.text && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 shadow-sm font-bold text-sm animate-in fade-in ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <button 
            onClick={loadProfile} 
            className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white border border-white/20 backdrop-blur-sm shadow-sm z-20"
            title="Refresh Profile"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-inner shrink-0 z-10">
            <User className="w-12 h-12 text-white" />
          </div>
          
          <div className="text-center md:text-left z-10 w-full pt-2">
            <h2 className="font-display font-bold text-3xl tracking-tight mb-2">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-bold rounded-lg shadow-sm capitalize flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {profile?.shift?.replace('_', ' ') || 'Full Day'} Shift
              </span>
              <span className={`px-3 py-1 border text-sm font-bold rounded-lg shadow-sm flex items-center gap-1.5 uppercase tracking-wider ${profile?.isActive ? 'bg-emerald-500/30 border-emerald-400/50 text-emerald-50' : 'bg-rose-500/30 border-rose-400/50 text-rose-50'}`}>
                {profile?.isActive ? 'Active Staff' : 'Inactive'}
              </span>
              <span className="px-3 py-1 bg-black/20 border border-black/10 text-teal-50 text-sm font-bold rounded-lg">
                ID: {profile?.receptionistId}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Professional Info */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h3 className="font-display font-bold text-slate-800 text-lg mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Briefcase className="w-5 h-5 text-teal-600" /> Professional Details
            </h3>
            <div className="space-y-5">
              <InfoRow icon={User} label="Full Legal Name" value={`${profile?.firstName} ${profile?.lastName}`} />
              <InfoRow icon={GraduationCap} label="Highest Qualification" value={profile?.qualification || 'Not specified'} />
              <InfoRow icon={Calendar} label="Date of Joining" value={profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not specified'} />
              <InfoRow icon={Clock} label="Assigned Shift" value={profile?.shift?.replace('_', ' ') || 'Full Day'} className="capitalize" />
            </div>
          </div>

          {/* Contact Info (Editable) */}
          <div className={`bg-white rounded-3xl border ${editing ? 'border-teal-400 ring-4 ring-teal-50' : 'border-slate-200'} p-6 sm:p-8 shadow-sm transition-all`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" /> Contact Information
              </h3>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing(false)} className="px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving} className="bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-sm">
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Phone Number</label>
                  <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Street Address</label>
                  <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">City</label>
                    <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Pincode</label>
                    <input type="text" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none" />
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
        <p className={`text-sm font-semibold text-slate-800 truncate ${className}`}>{value}</p>
      </div>
    </div>
  )
}