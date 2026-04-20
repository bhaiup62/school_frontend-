// src/app/principal-dashboard/attendance/page.tsx

'use client'
import React, { useEffect, useState } from 'react'
import { CalendarCheck, AlertCircle, TrendingUp, Users, RefreshCw, Filter, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import * as principalService from '@/services/principalService'

const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const SECTIONS = ['A', 'B', 'C', 'D', 'E']

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600" />
      <CalendarCheck className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  </div>
)

// Tab Button Component
function TabButton({ active, onClick, icon: Icon, label, badge }: {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200'
          : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
          active ? 'bg-white/25 text-white' : 'bg-indigo-100 text-indigo-700'
        }`}>
          {badge}
        </span>
      )}
    </button>
  )
}

export default function AttendancePage() {
  const [todayAttendance, setTodayAttendance] = useState<principalService.TodayAttendance | null>(null)
  const [absentToday, setAbsentToday] = useState<any | null>(null)
  const [classAttendance, setClassAttendance] = useState<principalService.ClassAttendance | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'today' | 'absent' | 'classwise'>('today')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  
  // State for expandable student rows
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)

  // Helper to get local date string
  const getLocalDateString = () => {
    const today = new Date();
    return new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  useEffect(() => {
    if (activeTab === 'today') {
      fetchTodayAttendance()
    } else if (activeTab === 'absent') {
      fetchAbsentToday()
    }
  }, [activeTab, selectedDate])

  useEffect(() => {
    if (activeTab === 'classwise' && selectedClass && selectedSection) {
      fetchClassAttendance()
    }
  }, [selectedClass, selectedSection, activeTab, selectedDate])

  const fetchTodayAttendance = async () => {
    setLoading(true)
    try {
      const res = await principalService.getTodayAttendance({ date: selectedDate })
      if (res.success) {
        setTodayAttendance(res.data)
      }
    } catch (err) {
      console.error('Error fetching attendance:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAbsentToday = async () => {
    setLoading(true)
    try {
      const res = await principalService.getAbsentToday({ date: selectedDate })
      if (res.success) {
        setAbsentToday(res.data)
      }
    } catch (err) {
      console.error('Error fetching absent students:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchClassAttendance = async () => {
    setLoading(true)
    setExpandedStudent(null) // Reset expanded row on fetch
    try {
      const res = await principalService.getClassAttendance(selectedClass, selectedSection, { date: selectedDate })
      if (res.success) {
        setClassAttendance(res.data)
      }
    } catch (err) {
      console.error('Error fetching class attendance:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    if (activeTab === 'today') fetchTodayAttendance()
    else if (activeTab === 'absent') fetchAbsentToday()
    else if (selectedClass && selectedSection) fetchClassAttendance()
  }

  const toggleExpand = (admissionNumber: string) => {
    if (expandedStudent === admissionNumber) {
      setExpandedStudent(null)
    } else {
      setExpandedStudent(admissionNumber)
    }
  }

  return (
    <PrincipalLayout>
      <div className="space-y-6">
        {/* Header - Gradient Style */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <CalendarCheck className="w-7 h-7" />
                Attendance Management
              </h2>
              <p className="text-indigo-100 mt-1">Monitor and track school-wide attendance</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm font-medium text-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex flex-wrap gap-2">
          <TabButton 
            active={activeTab === 'today'} 
            onClick={() => setActiveTab('today')} 
            icon={CalendarCheck} 
            label="Today's Overview" 
          />
          <TabButton 
            active={activeTab === 'absent'} 
            onClick={() => setActiveTab('absent')} 
            icon={XCircle} 
            label="Absent Today"
            badge={absentToday?.count}
          />
          <TabButton 
            active={activeTab === 'classwise'} 
            onClick={() => setActiveTab('classwise')} 
            icon={Users} 
            label="Class-wise" 
          />
        </div>

        {/* Today's Overview Tab */}
        {activeTab === 'today' && (
          loading ? (
            <LoadingSpinner />
          ) : todayAttendance ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard icon={CheckCircle} label="Total Present" value={todayAttendance.summary.totalPresent} color="green" />
                <SummaryCard icon={XCircle} label="Total Absent" value={todayAttendance.summary.totalAbsent} color="red" />
                <SummaryCard icon={Clock} label="Total Late" value={todayAttendance.summary.totalLate} color="amber" />
                <SummaryCard icon={TrendingUp} label="Attendance Rate" value={`${todayAttendance.summary.percentage}%`} color="indigo" />
              </div>

              {/* Pending Classes */}
              {todayAttendance.pendingClasses.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Pending Attendance ({todayAttendance.pendingClasses.length} classes)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {todayAttendance.pendingClasses.map(c => (
                      <span key={`${c.class}-${c.section}`} className="px-3 py-1.5 bg-white border border-amber-200 text-amber-700 rounded-lg text-sm font-medium shadow-sm">
                        Class {c.class}-{c.section}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* By Class Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-5 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    Attendance by Class
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Class</th>
                        <th className="text-center px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Present</th>
                        <th className="text-center px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Absent</th>
                        <th className="text-center px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Late</th>
                        <th className="text-center px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                        <th className="text-center px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {todayAttendance.byClass.map(c => (
                        <tr key={`${c.class}-${c.section}`} className="hover:bg-indigo-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold border border-indigo-100">
                              {c.class}-{c.section}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-green-600 font-bold">{c.present}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-red-600 font-bold">{c.absent}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-amber-600 font-bold">{c.late}</span>
                          </td>
                          <td className="px-6 py-4 text-center text-slate-600 font-medium">{c.total}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    c.percentage >= 90 ? 'bg-green-500' :
                                    c.percentage >= 75 ? 'bg-amber-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${c.percentage}%` }}
                                />
                              </div>
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                                c.percentage >= 90 ? 'bg-green-100 text-green-700' :
                                c.percentage >= 75 ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {c.percentage}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16 text-slate-400">
              <CalendarCheck className="w-16 h-16 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No attendance data available</p>
              <p className="text-sm mt-1">Attendance will appear here once marked</p>
            </div>
          )
        )}

        {/* Absent Today Tab */}
        {activeTab === 'absent' && (
          loading ? (
            <LoadingSpinner />
          ) : absentToday ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-rose-50 px-6 py-5 border-b border-red-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-red-800 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Absent Students Today
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-semibold shadow-sm">
                      {absentToday.date}
                    </span>
                    <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm">
                      {absentToday.count} students
                    </span>
                  </div>
                </div>
              </div>
              {absentToday.students.length === 0 ? (
                <div className="text-center py-16">
                  <CheckCircle className="w-16 h-16 mx-auto mb-3 text-green-400" />
                  <p className="text-lg font-medium text-green-600">All students present today! 🎉</p>
                  <p className="text-sm text-slate-400 mt-1">No absent students to display</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Class</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Parent</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Parent Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {absentToday.students.map((s: any) => (
                        <tr key={s.admissionNumber} className="hover:bg-red-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-sm shrink-0">
                                {s.name?.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800">{s.name}</div>
                                <div className="text-xs text-slate-400 mt-0.5">{s.admissionNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
                              Class {s.class}-{s.section}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600">{s.phone || '-'}</td>
                          <td className="px-6 py-4 font-medium text-slate-600">{s.parentName || '-'}</td>
                          <td className="px-6 py-4 font-medium text-slate-600">{s.parentPhone || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16 text-slate-400">
              <XCircle className="w-16 h-16 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No data available</p>
            </div>
          )
        )}

        {/* Class-wise Tab */}
        {activeTab === 'classwise' && (
          <div className="space-y-4">
            {/* Class Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-slate-600">
                  <Filter className="w-5 h-5" />
                  <span className="font-medium text-sm">Select Class:</span>
                </div>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium"
                >
                  <option value="">Select Class</option>
                  {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <select
                  value={selectedSection}
                  onChange={e => setSelectedSection(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium"
                >
                  <option value="">Select Section</option>
                  {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>
              </div>
            </div>

            {!selectedClass || !selectedSection ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 text-center py-16 text-slate-400">
                <Users className="w-16 h-16 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">Select a class and section</p>
                <p className="text-sm mt-1">Choose from the dropdown above to view attendance</p>
              </div>
            ) : loading ? (
              <LoadingSpinner />
            ) : classAttendance ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-5 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <CalendarCheck className="w-5 h-5 text-indigo-500" />
                        Class {classAttendance.class}-{classAttendance.section}
                      </h3>
                      {classAttendance.classTeacher && (
                        <p className="text-sm font-medium text-slate-500 mt-1">Class Teacher: {classAttendance.classTeacher.name}</p>
                      )}
                    </div>
                    <div className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl text-sm font-bold shadow-sm">
                      {new Date(classAttendance.year, classAttendance.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                
                {/* Summary */}
                <div className="p-5 border-b border-slate-100 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</p>
                      <p className="text-2xl font-display font-bold text-slate-800 mt-1">{classAttendance.summary.totalStudents}</p>
                    </div>
                    <div className="rounded-xl border border-green-100 bg-green-50 p-4 shadow-sm">
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Present Today</p>
                      <p className="text-2xl font-display font-bold text-green-800 mt-1">{classAttendance.summary.dailyPresent}</p>
                    </div>
                    <div className="rounded-xl border border-red-100 bg-red-50 p-4 shadow-sm">
                      <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Absent Today</p>
                      <p className="text-2xl font-display font-bold text-red-800 mt-1">{classAttendance.summary.dailyAbsent}</p>
                    </div>
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm">
                      <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Daily Rate</p>
                      <p className="text-2xl font-display font-bold text-indigo-800 mt-1">{classAttendance.summary.dailyPercentage}%</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-center px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Roll</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                        <th className="text-center px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Daily Status</th>
                        <th className="text-center px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Present</th>
                        <th className="text-center px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Absent</th>
                        <th className="text-center px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                        <th className="text-center px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Monthly Rate</th>
                        <th className="text-right px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {classAttendance.students.map(s => (
                        <React.Fragment key={s.admissionNumber}>
                          <tr 
                            onClick={() => toggleExpand(s.admissionNumber)}
                            className="cursor-pointer hover:bg-indigo-50/50 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                                  {s.rollNumber}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                  {s.name?.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{s.name}</div>
                                  <div className="text-xs text-slate-400 mt-0.5">{s.admissionNumber}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                s.dailyStatus === 'present' ? 'bg-green-100 text-green-700 border border-green-200' : 
                                s.dailyStatus === 'absent' ? 'bg-red-100 text-red-700 border border-red-200' : 
                                s.dailyStatus === 'late' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                                'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {s.dailyStatus === 'Not Marked' ? s.dailyStatus : s.dailyStatus.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-green-600 font-bold">{s.presentDays}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-red-600 font-bold">{s.absentDays}</span>
                            </td>
                            <td className="px-6 py-4 text-center font-medium text-slate-600">{s.totalDays}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                s.percentage >= 90 ? 'bg-green-100 text-green-700' :
                                s.percentage >= 75 ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {s.percentage}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="p-2 rounded-lg text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                                {expandedStudent === s.admissionNumber ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </td>
                          </tr>

                          {/* Expandable Daily Breakdown Row */}
                          {expandedStudent === s.admissionNumber && (
                            <tr className="bg-slate-50 border-t border-slate-100 shadow-inner">
                              <td colSpan={8} className="px-6 py-6">
                                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-indigo-600" />
                                  Daily Attendance Breakdown ({new Date(classAttendance.year, classAttendance.month - 1).toLocaleDateString('en-US', { month: 'long' })})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {(s as any).monthlyBreakdown?.[0]?.records?.length > 0 ? (
                                    (s as any).monthlyBreakdown[0].records
                                      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                      .map((record: any, idx: number) => {
                                        const d = new Date(record.date);
                                        const dayNum = d.getDate();
                                        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
                                        
                                        let bg = 'bg-white text-slate-600 border-slate-200';
                                        if (record.status === 'present') bg = 'bg-green-50 text-green-700 border-green-200';
                                        if (record.status === 'absent') bg = 'bg-red-50 text-red-700 border-red-200';
                                        if (record.status === 'late') bg = 'bg-orange-50 text-orange-700 border-orange-200';

                                        return (
                                          <div key={idx} className={`border px-3 py-2 rounded-xl flex flex-col items-center justify-center min-w-[64px] shadow-sm hover:shadow-md transition-shadow cursor-default ${bg}`} title={record.remarks || record.status}>
                                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5">{dayStr}</span>
                                            <span className="text-lg font-bold leading-none mb-1">{dayNum}</span>
                                            <span className="text-[10px] font-bold uppercase">{record.status.charAt(0)}</span>
                                          </div>
                                        );
                                      })
                                  ) : (
                                    <span className="text-sm text-slate-500 italic bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                                      No daily records logged for this month yet.
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16 text-slate-400">
                <CalendarCheck className="w-16 h-16 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">No attendance data for this class</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PrincipalLayout>
  )
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    green: 'from-green-500 to-emerald-500 shadow-green-500/25',
    red: 'from-red-500 to-rose-500 shadow-red-500/25',
    amber: 'from-amber-500 to-orange-500 shadow-amber-500/25',
    indigo: 'from-indigo-500 to-purple-500 shadow-indigo-500/25',
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-display font-bold text-slate-800">{value}</div>
      <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-2">{label}</div>
    </div>
  )
}