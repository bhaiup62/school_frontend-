'use client'
import { useEffect, useState, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getAdminDashboardStats } from '@/services/adminService'
import { 
  Users, GraduationCap, Wallet, Activity, 
  ShieldAlert, Server, RefreshCw, ChevronRight, 
  Database, UserCheck
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAdminDashboardStats()
      setData(res.data)
    } catch (err) {
      console.error('Failed to load admin dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  if (loading && !data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin border-t-violet-600" />
            <Activity className="w-6 h-6 text-violet-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      </AdminLayout>
    )
  }

  const { stats, alerts } = data || {}

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* ── Hero Overview ── */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden border border-slate-700">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <p className="text-violet-300 text-xs font-bold uppercase tracking-widest">System Online</p>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
                Global Command Center
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-xl">
                Real-time overview of school infrastructure, user metrics, and financial health.
              </p>
            </div>
            
            <button 
              onClick={loadDashboard} 
              className="p-3.5 bg-violet-600 hover:bg-violet-500 rounded-xl transition-all text-white font-bold border border-violet-500 shadow-lg shadow-violet-600/20 flex items-center justify-center shrink-0 w-fit md:mt-0 mt-4 z-20"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── Core Metrics Cards ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Students Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 border border-blue-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <p className="text-3xl font-display font-bold text-slate-900">{stats?.totalStudents || 0}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Active Students</p>
            </div>
          </div>

          {/* Staff Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 border border-emerald-200">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-3xl font-display font-bold text-slate-900">{stats?.totalStaff || 0}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total Staff & Faculty</p>
            </div>
          </div>

          {/* Parents Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4 border border-amber-200">
                <UserCheck className="w-6 h-6" />
              </div>
              <p className="text-3xl font-display font-bold text-slate-900">{stats?.totalParents || 0}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Registered Parents</p>
            </div>
          </div>

          {/* Revenue Mock Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-violet-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-4 border border-violet-200">
                <Wallet className="w-6 h-6" />
              </div>
              <p className="text-3xl font-display font-bold text-slate-900">
                ₹{(stats?.monthlyRevenue || 0).toLocaleString()}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Monthly Revenue</p>
            </div>
          </div>
        </div>

        {/* ── Lower Section Grid ── */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Infrastructure Health */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
                <Server className="w-5 h-5 text-violet-500" /> Infrastructure
              </h3>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-600">Database Load</span>
                  <span className="text-sm font-bold text-emerald-600">Healthy</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-600">Storage Usage</span>
                  <span className="text-sm font-bold text-blue-600">45%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div className="mt-auto p-4 bg-violet-50 rounded-2xl border border-violet-100 flex items-center gap-4">
                <Database className="w-8 h-8 text-violet-500" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Uptime: {stats?.systemHealth || 100}%</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Last backup: 4 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Alerts */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" /> Active Security & System Alerts
              </h3>
              <Link href="/admin-dashboard/logs" className="text-xs font-bold text-violet-600 hover:text-violet-800 uppercase tracking-wider flex items-center gap-1 bg-violet-50 px-3 py-1.5 rounded-lg transition-colors border border-violet-100">
                View All Logs <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="p-0">
              <div className="divide-y divide-slate-100">
                {alerts?.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No active alerts. System is running perfectly.</div>
                ) : (
                  alerts?.map((alert: any) => (
                    <div key={alert.id} className="p-5 hover:bg-slate-50 transition-colors flex gap-4">
                      <div className="shrink-0 mt-0.5">
                        {alert.type === 'critical' && <div className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-50" />}
                        {alert.type === 'warning' && <div className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-50" />}
                        {alert.type === 'info' && <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-50" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${
                          alert.type === 'critical' ? 'text-rose-700' :
                          alert.type === 'warning' ? 'text-amber-700' : 'text-blue-700'
                        }`}>
                          {alert.message}
                        </p>
                        <p className="text-xs font-medium text-slate-400 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  )
}