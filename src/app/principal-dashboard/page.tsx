// src/app/principal-dashboard/page.tsx

'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users, UserCheck, UsersRound, CalendarCheck,
  TrendingUp, TrendingDown, AlertTriangle, Award,
  Clock, ChevronRight, Building2, LayoutDashboard,
  RefreshCw, Megaphone, BookOpen, BarChart3
} from 'lucide-react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import * as principalService from '@/services/principalService'

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600" />
      <LayoutDashboard className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  </div>
)

export default function PrincipalDashboardPage() {
  const [stats, setStats] = useState<principalService.DashboardStats | null>(null)
  const [classSummary, setClassSummary] = useState<principalService.ClassSummary[]>([])
  const [recentActivity, setRecentActivity] = useState<principalService.RecentActivity | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, classRes, activityRes] = await Promise.all([
        principalService.getDashboardStats(),
        principalService.getClassSummary(),
        principalService.getRecentActivity(),
      ])
      if (statsRes.success) setStats(statsRes.data)
      if (classRes.success) setClassSummary(classRes.data)
      if (activityRes.success) setRecentActivity(activityRes.data)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
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

  return (
    <PrincipalLayout>
      <div className="space-y-6">
        {/* Header - Gradient Style */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <LayoutDashboard className="w-7 h-7" />
                Welcome, Principal
              </h2>
              <p className="text-indigo-100 mt-1">Here's an overview of Saraswati Public School today</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setLoading(true); fetchDashboardData() }}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="px-4 py-2 bg-white/10 rounded-xl text-sm font-medium">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={Users}
            label="Total Students"
            value={stats?.overview.totalStudents || 0}
            color="blue"
          />
          <StatCard
            icon={UserCheck}
            label="Total Teachers"
            value={stats?.overview.totalTeachers || 0}
            color="green"
          />
          <StatCard
            icon={UsersRound}
            label="Total Parents"
            value={stats?.overview.totalParents || 0}
            color="purple"
          />
          <StatCard
            icon={Building2}
            label="Class Teachers"
            value={stats?.overview.classTeachersCount || 0}
            color="amber"
          />
          <StatCard
            icon={CalendarCheck}
            label="Today's Attendance"
            value={`${stats?.todayAttendance.percentage || 0}%`}
            subtext={`${stats?.todayAttendance.present || 0}/${stats?.todayAttendance.totalMarked || 0} present`}
            color="teal"
          />
        </div>

        {/* Attendance & Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Attendance Summary */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-indigo-500" />
                  Today's Attendance
                </h3>
                <Link href="/principal-dashboard/attendance"
                  className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition">
                  View Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="text-3xl font-bold text-green-600">{stats?.todayAttendance.present || 0}</div>
                  <div className="text-sm font-medium text-green-700 mt-1">Present</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
                  <div className="text-3xl font-bold text-red-600">{stats?.todayAttendance.absent || 0}</div>
                  <div className="text-sm font-medium text-red-700 mt-1">Absent</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <div className="text-3xl font-bold text-indigo-600">{stats?.todayAttendance.percentage || 0}%</div>
                  <div className="text-sm font-medium text-indigo-700 mt-1">Rate</div>
                </div>
              </div>
              {/* Gender Distribution */}
              <div className="flex gap-4">
                {stats?.studentsByGender.map(g => (
                  <div key={g.gender} className={`flex-1 p-4 rounded-xl border ${
                    g.gender === 'male' ? 'bg-blue-50/50 border-blue-100' : 'bg-pink-50/50 border-pink-100'
                  }`}>
                    <div className={`text-xl font-bold ${g.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}`}>{g.count}</div>
                    <div className={`text-sm font-medium ${g.gender === 'male' ? 'text-blue-700' : 'text-pink-700'} capitalize`}>{g.gender} Students</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Quick Actions
              </h3>
            </div>
            <div className="p-4 space-y-2">
              <QuickActionLink href="/principal-dashboard/students" icon={Users} label="View All Students" color="blue" />
              <QuickActionLink href="/principal-dashboard/teachers" icon={UserCheck} label="View All Teachers" color="green" />
              <QuickActionLink href="/principal-dashboard/attendance" icon={CalendarCheck} label="Check Attendance" color="amber" />
              <QuickActionLink href="/principal-dashboard/results" icon={Award} label="View Results" color="purple" />
              <QuickActionLink href="/principal-dashboard/approvals" icon={AlertTriangle} label="Pending Approvals" color="red" />
              <QuickActionLink href="/principal-dashboard/notices" icon={Megaphone} label="Create Notice" color="indigo" />
            </div>
          </div>
        </div>

        {/* Class Summary & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Class Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  Students by Class
                </h3>
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold">
                  {classSummary.length} Classes
                </span>
              </div>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                {classSummary.map(cs => (
                  <div key={cs.class} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                        {cs.class}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Class {cs.class}</span>
                        <span className="text-xs text-slate-400 block">
                          {cs.sections.length} sections
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-indigo-600">{cs.totalStudents}</span>
                      <span className="text-xs text-slate-400">students</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  Recent Activity
                </h3>
                <span className="px-2.5 py-1 bg-green-100 text-green-600 rounded-lg text-xs font-semibold">
                  Last 7 days
                </span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {/* Recent Students */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> New Students
                </h4>
                <div className="space-y-2">
                  {recentActivity?.recentStudents.slice(0, 3).map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                          <span className="text-xs text-slate-400 ml-2">Class {s.class}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 bg-white px-2 py-1 rounded-lg">
                        <Clock className="w-3 h-3" />
                        {new Date(s.addedOn).toLocaleDateString()}
                      </div>
                    </div>
                  )) || <p className="text-sm text-slate-400 text-center py-4">No recent students</p>}
                </div>
              </div>
              {/* Recent Teachers */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5" /> New Teachers
                </h4>
                <div className="space-y-2">
                  {recentActivity?.recentTeachers.slice(0, 3).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl border border-green-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-700">{t.name}</span>
                          <span className="text-xs text-slate-400 ml-2">{t.subject}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 bg-white px-2 py-1 rounded-lg">
                        <Clock className="w-3 h-3" />
                        {new Date(t.addedOn).toLocaleDateString()}
                      </div>
                    </div>
                  )) || <p className="text-sm text-slate-400 text-center py-4">No recent teachers</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Students by Class Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Students Distribution by Class
            </h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {stats?.studentsByClass.map(c => (
                <div key={c.class} className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 hover:shadow-md transition">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {c.class}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-indigo-600">{c.count}</div>
                    <div className="text-xs text-slate-500">students</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.4);
        }
      `}</style>
    </PrincipalLayout>
  )
}

function StatCard({ icon: Icon, label, value, subtext, color }: {
  icon: React.ElementType
  label: string
  value: string | number
  subtext?: string
  color: 'blue' | 'green' | 'purple' | 'amber' | 'teal'
}) {
  const colors = {
    blue: 'from-blue-500 to-indigo-500 shadow-blue-500/25',
    green: 'from-green-500 to-emerald-500 shadow-green-500/25',
    purple: 'from-purple-500 to-pink-500 shadow-purple-500/25',
    amber: 'from-amber-500 to-orange-500 shadow-amber-500/25',
    teal: 'from-teal-500 to-cyan-500 shadow-teal-500/25',
  }
  const bgColors = {
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-green-50 border-green-100',
    purple: 'bg-purple-50 border-purple-100',
    amber: 'bg-amber-50 border-amber-100',
    teal: 'bg-teal-50 border-teal-100',
  }
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all`}>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-4 shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
      <div className="text-sm font-medium text-slate-500 mt-1">{label}</div>
      {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
    </div>
  )
}

function QuickActionLink({ href, icon: Icon, label, color }: {
  href: string
  icon: React.ElementType
  label: string
  color: 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'indigo'
}) {
  const iconColors = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-500',
    amber: 'from-amber-500 to-orange-500',
    purple: 'from-purple-500 to-pink-500',
    red: 'from-red-500 to-rose-500',
    indigo: 'from-indigo-500 to-purple-500',
  }
  return (
    <Link href={href}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition group">
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${iconColors[color]} flex items-center justify-center shadow-sm`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 flex-1">{label}</span>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition" />
    </Link>
  )
}
