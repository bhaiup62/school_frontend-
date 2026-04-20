// src/app/principal-dashboard/profile/page.tsx

'use client'
import { useEffect, useState } from 'react'
import { User, Mail, Phone, Calendar, Building, Shield, Award, Clock, MapPin, RefreshCw, Edit, Settings } from 'lucide-react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import * as principalService from '@/services/principalService'

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600" />
      <User className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  </div>
)

export default function ProfilePage() {
  const [profile, setProfile] = useState<principalService.PrincipalProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await principalService.getProfile()
      if (res.success) setProfile(res.data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PrincipalLayout>
        <LoadingSpinner />
      </PrincipalLayout>
    )
  }

  if (!profile) {
    return (
      <PrincipalLayout>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16 text-slate-400">
          <User className="w-16 h-16 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">Failed to load profile</p>
          <button onClick={fetchProfile} className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition">
            Try Again
          </button>
        </div>
      </PrincipalLayout>
    )
  }

  return (
    <PrincipalLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header - Gradient Style */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-5xl font-bold shadow-xl">
              {(profile.fullName || profile.firstName || 'P').charAt(0)}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-bold">{profile.fullName || `${profile.firstName} ${profile.lastName}`}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <div className="px-3 py-1 bg-white/20 backdrop-blur rounded-lg text-sm font-medium flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Principal</span>
                </div>
                <div className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1.5 ${
                  profile.status === 'active' ? 'bg-emerald-400/20 text-emerald-100' : 'bg-red-400/20 text-red-100'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${profile.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                  {profile.status === 'active' ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="text-indigo-100 text-sm mt-2">{profile.principalId}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchProfile}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-500" />
                Contact Information
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <InfoRow icon={Mail} label="Email" value={profile.email} color="blue" />
              <InfoRow icon={Phone} label="Phone" value={profile.phone || 'Not set'} color="green" />
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" />
                Personal Information
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <InfoRow icon={User} label="Gender" value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'Not set'} color="purple" />
              <InfoRow icon={Calendar} label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'} color="amber" />
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-500" />
              Employment Details
            </h3>
          </div>
          <div className="p-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoRow icon={Building} label="Department" value="Administration" color="indigo" />
              <InfoRow icon={Award} label="Qualification" value={profile.qualification || 'Not set'} color="amber" />
              <InfoRow icon={Clock} label="Join Date" value={profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'} color="green" />
              <InfoRow icon={Shield} label="Status" value={
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  profile.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {profile.status?.toUpperCase() || 'ACTIVE'}
                </span>
              } color="blue" />
            </div>
          </div>
        </div>

        {/* Address */}
        {profile.address && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-500" />
                Address
              </h3>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/25">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-slate-700 font-medium">
                    {profile.address}
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                    {profile.city && profile.city}
                    {profile.pincode && ` - ${profile.pincode}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-2xl border border-indigo-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-4 border-b border-indigo-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-500" />
              Account Information
            </h3>
          </div>
          <div className="p-5">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Account Created</div>
                  <div className="text-sm font-semibold text-slate-700">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Last Updated</div>
                  <div className="text-sm font-semibold text-slate-700">{profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrincipalLayout>
  )
}

function InfoRow({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-indigo-500 shadow-blue-500/25',
    green: 'from-green-500 to-emerald-500 shadow-green-500/25',
    purple: 'from-purple-500 to-pink-500 shadow-purple-500/25',
    amber: 'from-amber-500 to-orange-500 shadow-amber-500/25',
    indigo: 'from-indigo-500 to-purple-500 shadow-indigo-500/25',
    red: 'from-red-500 to-rose-500 shadow-red-500/25',
  }
  return (
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center flex-shrink-0 shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</div>
        <div className="text-sm font-semibold text-slate-700 mt-0.5">{value}</div>
      </div>
    </div>
  )
}
