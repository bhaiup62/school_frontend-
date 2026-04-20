'use client'
import { useEffect, useState, useCallback } from 'react'
import ParentLayout from '@/components/parent/ParentLayout'
import { getParentProfile } from '@/services/parentService'
import { User, Phone, Mail, MapPin, Briefcase, ShieldCheck, Users, RefreshCw } from 'lucide-react'

export default function ParentProfilePage() {
  const [parent, setParent]   = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(() => {
    setLoading(true)
    getParentProfile()
      .then(res => setParent(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading && !parent) return (
    <ParentLayout>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    </ParentLayout>
  )

  if (!parent && !loading) return (
    <ParentLayout>
      <div className="text-center text-slate-400 py-20 font-medium">Profile not found. Please contact administration.</div>
    </ParentLayout>
  )

  return (
    <ParentLayout>
      <div className="space-y-6 max-w-4xl mx-auto">

        {/* Hero Header with Refresh */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative flex flex-col md:flex-row items-center md:items-start gap-6">
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
          
          <div className="text-center md:text-left z-10 w-full pt-2">
            <h2 className="font-display font-bold text-3xl tracking-tight mb-2">{parent?.firstName} {parent?.lastName}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold rounded-lg shadow-sm capitalize flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> {parent?.relation || 'Guardian'}
              </span>
              <span className="px-3 py-1 bg-black/20 border border-black/10 text-emerald-50 text-sm font-semibold rounded-lg">
                ID: {parent?.parentId}
              </span>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Personal Info */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <User className="w-5 h-5 text-emerald-600" /> Personal Details
            </h3>
            <div className="space-y-5">
              <InfoRow icon={User} label="Full Name" value={`${parent?.firstName} ${parent?.lastName}`} />
              <InfoRow icon={Briefcase} label="Occupation" value={parent?.occupation || '—'} />
              <InfoRow icon={ShieldCheck} label="Relationship to Student" value={parent?.relation} />
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Phone className="w-5 h-5 text-emerald-600" /> Contact Information
            </h3>
            <div className="space-y-5">
              <InfoRow icon={Phone} label="Primary Phone" value={parent?.phone || '—'} />
              <InfoRow icon={Mail} label="Email Address" value={parent?.email || '—'} className="lowercase" />
              <InfoRow icon={MapPin} label="Home Address" value={parent?.address ? `${parent.address}, ${parent.city} — ${parent.pincode}` : '—'} />
            </div>
          </div>

          {/* Linked Children Full Width */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" /> Linked Children
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                {parent?.children?.length || 0} Registered
              </span>
            </div>
            
            {parent?.children?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {parent.children.map((c: string) => (
                  <div key={c} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 hover:bg-emerald-50 hover:border-emerald-200 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                      <User className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 tracking-wide">
                      {c}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 font-medium">
                No children are currently linked to this account.
              </div>
            )}
          </div>

        </div>
      </div>
    </ParentLayout>
  )
}

// Helper Component for consistent rows
function InfoRow({ icon: Icon, label, value, className = '' }: { icon: any, label: string, value: string, className?: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
        <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-sm font-semibold text-slate-800 truncate capitalize ${className}`}>{value || '—'}</p>
      </div>
    </div>
  )
}