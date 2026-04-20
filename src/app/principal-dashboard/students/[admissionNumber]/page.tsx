// src/app/principal-dashboard/students/[admissionNumber]/page.tsx

'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, User, Phone, Mail, MapPin, Calendar,
  BookOpen, CalendarCheck, Award, TrendingUp,
  CheckCircle, XCircle, Clock
} from 'lucide-react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import * as principalService from '@/services/principalService'

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const admissionNumber = params.admissionNumber as string
  
  const [student, setStudent] = useState<principalService.StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'results'>('info')

  useEffect(() => {
    fetchStudentDetail()
  }, [admissionNumber])

  const fetchStudentDetail = async () => {
    try {
      const res = await principalService.getStudentDetail(admissionNumber)
      if (res.success) {
        setStudent(res.data)
      }
    } catch (err) {
      console.error('Error fetching student:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PrincipalLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      </PrincipalLayout>
    )
  }

  if (!student) {
    return (
      <PrincipalLayout>
        <div className="text-center py-12">
          <p className="text-slate-500">Student not found</p>
          <button onClick={() => router.back()} className="mt-4 text-indigo-600 hover:underline font-semibold">
            Go Back
          </button>
        </div>
      </PrincipalLayout>
    )
  }

  return (
    <PrincipalLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()}
            className="p-2 hover:bg-slate-200 rounded-xl transition bg-slate-100 text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-800">
              {student.firstName} {student.lastName}
            </h2>
            <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{student.admissionNumber}</span>
              <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Class {student.currentClass}-{student.currentSection}</span>
            </p>
          </div>
        </div>

        {/* Profile Card (Hero) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-24"></div>
          <div className="px-6 sm:px-10 pb-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-white p-1 rounded-2xl shadow-md shrink-0">
                <div className="w-full h-full bg-indigo-100 rounded-xl flex items-center justify-center">
                  <User className="w-10 h-10 text-indigo-600" />
                </div>
              </div>
            </div>
            
            {/* Info Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-8">
              <InfoItem icon={Award} label="Roll Number" value={student.rollNumber} />
              <InfoItem icon={User} label="Gender" value={student.gender} />
              <InfoItem icon={Calendar} label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-'} />
              <InfoItem icon={Calendar} label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '-'} />
              <InfoItem icon={Phone} label="Student Phone" value={student.phone || '-'} />
              <InfoItem icon={Mail} label="Student Email" value={student.email || '-'} className="sm:col-span-2 lg:col-span-3" />
              <InfoItem icon={MapPin} label="Address" value={student.address ? `${student.address}, ${student.city || ''}` : '-'} className="sm:col-span-2 lg:col-span-4" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} label="Overview & Parents" icon={User} />
          <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} label="Attendance Records" icon={CalendarCheck} />
          <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} label="Academic Results" icon={TrendingUp} />
        </div>

        {/* Tab Content: Overview & Parents */}
        {activeTab === 'info' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Parent Information
              </h3>
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <InfoItem icon={User} label="Father's Name" value={student.parents?.fatherName || '-'} />
                  <InfoItem icon={Phone} label="Father's Contact" value={student.parents?.phone || '-'} />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <InfoItem icon={User} label="Mother's Name" value={student.parents?.motherName || '-'} />
                  {/* Assuming mother doesn't have a separate phone field in standard schema, fallback to main phone */}
                  <InfoItem icon={Phone} label="Alternate Contact" value={student.phone || '-'} /> 
                </div>
              </div>
            </div>
            
            {/* Quick Stats Summary on Info Tab */}
            <div className="space-y-6">
               <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 shadow-sm">
                  <h3 className="font-semibold text-indigo-900 mb-4">Quick Snapshot</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm">
                      <div className="text-3xl font-display font-bold text-indigo-600 mb-1">
                        {student.attendance && student.attendance.length > 0 
                          ? Math.round(student.attendance.reduce((sum: number, a: any) => sum + a.percentage, 0) / student.attendance.length) + '%' 
                          : 'N/A'}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Attendance</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm">
                      <div className="text-3xl font-display font-bold text-purple-600 mb-1">
                        {student.results && student.results.length > 0 ? `${student.results[student.results.length - 1].percentage}%` : 'N/A'}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Exam Score</div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Tab Content: Attendance */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {student.attendance && student.attendance.length > 0 ? (
              student.attendance
                // Sort by most recent month first
                .sort((a: any, b: any) => {
                  if (a.year !== b.year) return b.year - a.year;
                  return b.month - a.month;
                })
                .map((att: any, idx: number) => {
                  const monthName = new Date(att.year, att.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  
                  return (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Month Summary Header */}
                    <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                          <Calendar className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">{monthName}</h3>
                      </div>
                      
                      <div className="flex items-center gap-6 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                        <div className="text-center">
                          <div className="text-sm font-bold text-green-600 flex items-center justify-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> {att.presentDays}
                          </div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Present</div>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="text-center">
                          <div className="text-sm font-bold text-red-600 flex items-center justify-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> {att.absentDays}
                          </div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Absent</div>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="text-center">
                          <div className={`text-sm font-bold flex items-center justify-center ${att.percentage >= 75 ? 'text-indigo-600' : 'text-orange-600'}`}>
                            {att.percentage}%
                          </div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Rate</div>
                        </div>
                      </div>
                    </div>

                    {/* Daily Calendar Grid */}
                    <div className="p-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        Daily Breakdown
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {att.records?.length > 0 ? (
                          att.records
                            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((record: any, rIdx: number) => {
                              const d = new Date(record.date);
                              const dayNum = d.getDate();
                              const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
                              
                              let bg = 'bg-slate-50 text-slate-500 border-slate-200';
                              if (record.status === 'present') bg = 'bg-green-50 text-green-700 border-green-200';
                              if (record.status === 'absent') bg = 'bg-red-50 text-red-700 border-red-200';
                              if (record.status === 'late') bg = 'bg-amber-50 text-amber-700 border-amber-200';

                              return (
                                <div key={rIdx} className={`border px-3 py-2.5 rounded-xl flex flex-col items-center justify-center min-w-[64px] shadow-sm hover:-translate-y-0.5 transition-transform cursor-default ${bg}`} title={record.remarks || record.status}>
                                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">{dayStr}</span>
                                  <span className="text-xl font-display font-bold leading-none mb-1.5">{dayNum}</span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                    record.status === 'present' ? 'bg-green-100 text-green-800' :
                                    record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                    record.status === 'late' ? 'bg-amber-100 text-amber-800' :
                                    'bg-slate-200 text-slate-700'
                                  }`}>
                                    {record.status.charAt(0)}
                                  </span>
                                </div>
                              );
                            })
                        ) : (
                          <div className="w-full text-center py-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <span className="text-sm font-medium text-slate-500">No daily records logged for this month.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )})
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <CalendarCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No Attendance Data</h3>
                <p className="text-slate-500 mt-1">This student has no recorded attendance yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Results */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            {student.results && student.results.length > 0 ? (
              student.results
                // Sort newest exams first based on declaredOn date
                .sort((a: any, b: any) => new Date(b.declaredOn).getTime() - new Date(a.declaredOn).getTime())
                .map((result: any, idx: number) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  {/* Exam Header */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                        <Award className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg capitalize">{result.examType.replace('_', ' ')} Exam</h3>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">Session: {result.session} • Declared: {new Date(result.declaredOn).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {result.rank && (
                        <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 font-bold text-sm flex items-center gap-1.5 shadow-sm">
                          <Award className="w-4 h-4" /> Rank {result.rank}
                        </div>
                      )}
                      <div className={`px-4 py-1.5 rounded-lg font-bold text-sm shadow-sm border ${
                        result.result === 'pass' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {result.percentage}% • {result.result.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Marks Table */}
                  <div className="p-6">
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr className="text-left text-slate-500 font-semibold uppercase tracking-wider text-xs">
                            <th className="px-4 py-3">Subject</th>
                            <th className="px-4 py-3 text-center">Max Marks</th>
                            <th className="px-4 py-3 text-center">Obtained</th>
                            <th className="px-4 py-3 text-center">Grade</th>
                            <th className="px-4 py-3 text-right">Performance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {result.subjects.map((sub: any, sIdx: number) => {
                            const pct = Math.round((sub.marksObtained / sub.maxMarks) * 100);
                            return (
                            <tr key={sIdx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-semibold text-slate-700">{sub.subject}</td>
                              <td className="px-4 py-3 text-center font-medium text-slate-500">{sub.maxMarks}</td>
                              <td className="px-4 py-3 text-center font-bold text-slate-800">{sub.marksObtained}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  sub.grade.includes('A') ? 'bg-green-100 text-green-800' :
                                  sub.grade.includes('B') ? 'bg-blue-100 text-blue-800' :
                                  sub.grade.includes('C') ? 'bg-amber-100 text-amber-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {sub.grade || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${pct >= 33 ? 'bg-indigo-500' : 'bg-red-500'}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className={`font-bold w-9 ${pct >= 33 ? 'text-indigo-600' : 'text-red-600'}`}>{pct}%</span>
                                </div>
                              </td>
                            </tr>
                          )})}
                        </tbody>
                        <tfoot className="border-t border-slate-200 bg-slate-50">
                          <tr className="font-bold">
                            <td className="px-4 py-3 text-slate-800">Grand Total</td>
                            <td className="px-4 py-3 text-center text-slate-600">{result.totalMarks}</td>
                            <td className="px-4 py-3 text-center text-slate-800 text-base">{result.totalObtained}</td>
                            <td className="px-4 py-3"></td>
                            <td className="px-4 py-3 text-right text-indigo-700 text-base">{result.percentage}%</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <TrendingUp className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No Examination Results</h3>
                <p className="text-slate-500 mt-1">This student has no recorded exam results yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PrincipalLayout>
  )
}

function InfoItem({ icon: Icon, label, value, className = '' }: { icon: React.ElementType; label: string; value: string, className?: string }) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
        <div className="text-sm font-bold text-slate-700 mt-0.5">{value}</div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, label, icon: Icon }: { active: boolean; onClick: () => void; label: string; icon: React.ElementType }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
        active 
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:text-indigo-600'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}