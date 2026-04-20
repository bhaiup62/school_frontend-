'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { getAdmissionPipeline } from '@/services/adminService'// Make sure path matches your setup
import { 
  ClipboardList, Users, UserCheck, UserMinus, 
  Settings, ToggleRight, CalendarDays, TrendingUp,
  PhoneCall, FileText, Plus, Building2, ChevronRight
} from 'lucide-react'

export default function AdminAdmissionsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAdmissionPipeline()
        setData(res.data)
      } catch (err) {
        console.error('Failed to load admission pipeline', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Admissions Hub</h1>
            <p className="text-slate-500 text-sm mt-1">Manage rules, track leads, and process enrollments.</p>
          </div>
          <Link 
            href="/admin-dashboard/admissions/settings"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-violet-600/20"
          >
            <Settings className="w-4 h-4" /> Global Admission Rules
          </Link>
        </div>

        {/* ── Quick Access Modules ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin-dashboard/admissions/enquiries" className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><PhoneCall className="w-5 h-5"/></div>
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-1">Lead CRM <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors"/></h3>
              <p className="text-xs text-slate-500 mt-0.5">Track prospective parents</p>
            </div>
          </Link>
          
          <Link href="/admin-dashboard/admissions/applications" className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-violet-300 hover:shadow-md transition-all flex flex-col items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform"><FileText className="w-5 h-5"/></div>
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-1">App Pipeline <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-violet-600 transition-colors"/></h3>
              <p className="text-xs text-slate-500 mt-0.5">Review & admit students</p>
            </div>
          </Link>

          <Link href="/admin-dashboard/admissions/applications/new" className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Plus className="w-5 h-5"/></div>
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-1">New Admission <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors"/></h3>
              <p className="text-xs text-slate-500 mt-0.5">Start application wizard</p>
            </div>
          </Link>

          <Link href="/admin-dashboard/admissions/settings" className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all flex flex-col items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Building2 className="w-5 h-5"/></div>
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-1">Seat Matrix <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-amber-600 transition-colors"/></h3>
              <p className="text-xs text-slate-500 mt-0.5">Configure class capacities</p>
            </div>
          </Link>
        </div>

        {/* ── Configuration & Global Status ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center border border-violet-100">
              <CalendarDays className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Admission Session</p>
              <h2 className="text-xl font-display font-bold text-slate-800">{data?.config?.currentSession || '2026-2027'}</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
              <ToggleRight className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Admissions Open</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm font-bold text-slate-600">
              Capacity: {data?.stats?.total} / {data?.config?.totalCapacity || 1500}
            </div>
          </div>
        </div>

        {/* ── Pipeline Stats ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Enrolled', value: data?.stats?.total || 0, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
            { label: 'Active Students', value: data?.stats?.active || 0, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { label: 'Inactive / Alumni', value: data?.stats?.inactive || 0, icon: UserMinus, color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' },
            { label: 'New (Last 30 Days)', value: data?.stats?.last30Days || 0, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.bg} ${stat.border}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Recent Pipeline Table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-display font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-violet-500" /> Recent Admission Entries
            </h3>
            <Link href="/admin-dashboard/admissions/applications" className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Student ID</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Name</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Class</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Date Admitted</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.recent?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">
                      No recent admissions found.
                    </td>
                  </tr>
                ) : (
                  data?.recent?.map((student: any) => (
                    <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-violet-600">{student.admissionNumber}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {student.currentClass}-{student.currentSection}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        {student.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}