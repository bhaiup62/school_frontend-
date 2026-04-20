// src/app/principal-dashboard/teachers/page.tsx

'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, UserCheck, Eye, Building2, AlertCircle, Users, GraduationCap, RefreshCw, Phone, Mail, BookOpen, X } from 'lucide-react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import * as principalService from '@/services/principalService'

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<principalService.Teacher[]>([])
  const [unassignedClasses, setUnassignedClasses] = useState<any[]>([])
  const [filters, setFilters] = useState({ search: '', isClassTeacher: '' })
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<principalService.Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'classTeachers' | 'unassigned'>('all')

  // Modal state for assigning class teacher
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<principalService.Teacher | null>(null)
  const [assignForm, setAssignForm] = useState({ class: '', section: '' })
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    if (activeTab === 'all' || activeTab === 'classTeachers') {
      fetchTeachers()
    } else if (activeTab === 'unassigned') {
      fetchUnassignedClasses()
    }
  }, [page, filters, activeTab])

  const fetchTeachers = async () => {
    setLoading(true)
    try {
      const res = await principalService.getAllTeachers({
        ...filters,
        isClassTeacher: activeTab === 'classTeachers' ? 'true' : filters.isClassTeacher,
        page,
        limit: 20,
      })
      if (res.success) {
        setTeachers(res.data)
        setPagination(res.pagination)
      }
    } catch (err) {
      console.error('Error fetching teachers:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnassignedClasses = async () => {
    setLoading(true)
    try {
      const res = await principalService.getUnassignedClasses()
      if (res.success) {
        setUnassignedClasses(res.data)
      }
    } catch (err) {
      console.error('Error fetching unassigned classes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignClassTeacher = async () => {
    if (!selectedTeacher || !assignForm.class || !assignForm.section) return
    setAssigning(true)
    try {
      const res = await principalService.assignClassTeacher(selectedTeacher.teacherId, assignForm)
      if (res.success) {
        setShowAssignModal(false)
        setSelectedTeacher(null)
        setAssignForm({ class: '', section: '' })
        fetchTeachers()
        fetchUnassignedClasses()
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error assigning class teacher')
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveClassTeacher = async (teacherId: string) => {
    if (!confirm('Are you sure you want to remove this class teacher assignment?')) return
    try {
      const res = await principalService.removeClassTeacher(teacherId)
      if (res.success) {
        fetchTeachers()
        fetchUnassignedClasses()
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error removing class teacher')
    }
  }

  const openAssignModal = (teacher: principalService.Teacher) => {
    setSelectedTeacher(teacher)
    setAssignForm({ class: '', section: '' })
    setShowAssignModal(true)
  }

  return (
    <PrincipalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <GraduationCap className="w-7 h-7" />
                Teacher Management
              </h2>
              <p className="text-indigo-100 mt-1">Manage teachers and class teacher assignments</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => activeTab === 'unassigned' ? fetchUnassignedClasses() : fetchTeachers()}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex flex-wrap gap-2">
          <TabButton 
            active={activeTab === 'all'} 
            onClick={() => { setActiveTab('all'); setPage(1) }} 
            icon={Users} 
            label="All Teachers"
            badge={pagination?.total}
          />
          <TabButton 
            active={activeTab === 'classTeachers'} 
            onClick={() => { setActiveTab('classTeachers'); setPage(1) }} 
            icon={UserCheck} 
            label="Class Teachers"
          />
          <TabButton 
            active={activeTab === 'unassigned'} 
            onClick={() => setActiveTab('unassigned')} 
            icon={AlertCircle} 
            label="Unassigned Classes"
            badge={unassignedClasses.length > 0 ? unassignedClasses.length : undefined}
          />
        </div>

        {/* All Teachers / Class Teachers Tab */}
        {(activeTab === 'all' || activeTab === 'classTeachers') && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={filters.search}
                    onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1) }}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
                {activeTab === 'all' && (
                  <select
                    value={filters.isClassTeacher}
                    onChange={e => { setFilters(f => ({ ...f, isClassTeacher: e.target.value })); setPage(1) }}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  >
                    <option value="">All Types</option>
                    <option value="true">✅ Class Teachers Only</option>
                    <option value="false">📋 Non-Class Teachers</option>
                  </select>
                )}
              </div>
            </div>

            {/* Teachers Grid */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                  <p className="text-sm text-slate-500 mt-4">Loading teachers...</p>
                </div>
              </div>
            ) : teachers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16 text-slate-400">
                <Users className="w-16 h-16 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">No teachers found</p>
                <p className="text-sm mt-1">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {teachers.map(t => (
                  <TeacherCard 
                    key={t.teacherId} 
                    teacher={t} 
                    onAssign={() => openAssignModal(t)}
                    onRemove={() => handleRemoveClassTeacher(t.teacherId)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  Page <span className="font-semibold text-slate-700">{pagination.page}</span> of <span className="font-semibold text-slate-700">{pagination.pages}</span>
                  <span className="text-slate-400 ml-2">({pagination.total} teachers)</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Unassigned Classes Tab */}
        {activeTab === 'unassigned' && (
          <div className="space-y-4">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-sm text-amber-700 font-medium">
                Classes that have students but no assigned class teacher
              </p>
            </div>

            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                  <p className="text-sm text-slate-500 mt-4">Loading classes...</p>
                </div>
              </div>
            ) : unassignedClasses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16">
                <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-10 h-10 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-green-600">All classes have assigned class teachers!</p>
                <p className="text-sm text-slate-500 mt-1">Great job keeping everything organized</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {unassignedClasses.map(c => (
                  <div 
                    key={`${c.class}-${c.section}`} 
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    {/* Warning Bar */}
                    <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
                    
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold">
                              ⚠️ Unassigned
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-800">Class {c.class}-{c.section}</h3>
                          <div className="flex items-center gap-2 mt-2 text-slate-500">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">{c.studentCount} students enrolled</span>
                          </div>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl">
                          <AlertCircle className="w-6 h-6 text-amber-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assign Class Teacher Modal */}
      {showAssignModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Assign Class Teacher</h3>
                    <p className="text-indigo-100 text-sm">Assign teacher to a class</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Teacher Info */}
              <div className="flex items-center gap-4 pb-5 mb-5 border-b border-slate-100">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <span className="text-xl font-bold text-white">
                    {(selectedTeacher.fullName || `${selectedTeacher.firstName} ${selectedTeacher.lastName}`).charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{selectedTeacher.fullName || `${selectedTeacher.firstName} ${selectedTeacher.lastName}`}</p>
                  <p className="text-sm text-slate-500">{selectedTeacher.teacherId}</p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Class</label>
                  <select
                    value={assignForm.class}
                    onChange={e => setAssignForm(f => ({ ...f, class: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  >
                    <option value="">Choose a class...</option>
                    {['1','2','3','4','5','6','7','8','9','10','11','12'].map(c => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Section</label>
                  <select
                    value={assignForm.section}
                    onChange={e => setAssignForm(f => ({ ...f, section: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  >
                    <option value="">Choose a section...</option>
                    {['A','B','C','D','E'].map(s => (
                      <option key={s} value={s}>Section {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignClassTeacher}
                  disabled={assigning || !assignForm.class || !assignForm.section}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-indigo-200"
                >
                  {assigning ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Assigning...
                    </span>
                  ) : 'Assign Teacher'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PrincipalLayout>
  )
}

function TeacherCard({ teacher: t, onAssign, onRemove }: { 
  teacher: principalService.Teacher
  onAssign: () => void
  onRemove: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Status Bar */}
      <div className={`h-1 bg-gradient-to-r ${
        t.isClassTeacher ? 'from-green-400 to-emerald-500' : 'from-slate-300 to-slate-400'
      }`} />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
            <span className="text-xl font-bold text-white">
              {(t.fullName || `${t.firstName} ${t.lastName}`).charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 truncate">{t.fullName || `${t.firstName} ${t.lastName}`}</h3>
            <p className="text-xs text-slate-400">{t.teacherId}</p>
            {t.isClassTeacher && (
              <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                <UserCheck className="w-3.5 h-3.5" />
                Class {t.assignedClass}-{t.assignedSection}
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {(t.subject || t.subjects?.length) && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="truncate">{t.subject || t.subjects?.join(', ')}</span>
            </div>
          )}
          {t.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="p-1.5 bg-indigo-100 rounded-lg">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <span>{t.phone}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
          <Link 
            href={`/principal-dashboard/teachers/${t.teacherId}`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition"
          >
            <Eye className="w-4 h-4" />
            View
          </Link>
          {!t.isClassTeacher ? (
            <button
              onClick={onAssign}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-600 bg-green-50 rounded-xl hover:bg-green-100 transition"
            >
              <UserCheck className="w-4 h-4" />
              Assign
            </button>
          ) : (
            <button
              onClick={onRemove}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

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
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active 
          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {badge !== undefined && badge > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          active ? 'bg-white/25 text-white' : 'bg-indigo-100 text-indigo-700'
        }`}>
          {badge}
        </span>
      )}
    </button>
  )
}
