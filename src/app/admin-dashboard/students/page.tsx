'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { getAllStudents } from '@/services/admin/studentService'
import { getClasses } from '@/services/admin/academicService'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { GraduationCap, Search, Filter, Eye, Users, UserX, TrendingUp } from 'lucide-react'

export default function StudentMasterPage() {
  const { handleError } = useErrorHandler()

  // ── State ──
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  
  // Filters
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    isActive: 'true',
    search: ''
  })
  
  const [searchInput, setSearchInput] = useState('') // Local state for search bar input
  const [availableSections, setAvailableSections] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)

  // ── 1. Fetch Master Classes for Dropdowns ──
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getClasses()
        const classesData = res.data?.data || res.data || res
        setClasses(Array.isArray(classesData) ? classesData : [])
      } catch (error) {
        handleError(error)
      }
    }
    fetchClasses()
  }, [])

  // ── 2. Handle Class Filter Change (Cascading Sections) ──
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setFilters(prev => ({ ...prev, class: val, section: '' }))
    
    // Find class object to populate sections
    const selectedObj = classes.find(c => String(c.className) === String(val))
    setAvailableSections(selectedObj?.sections || [])
  }

  // ── 3. Fetch Students based on Filters ──
  const loadStudents = async () => {
    setLoading(true)
    try {
      const res = await getAllStudents(filters)
      setStudents(res.data || [])
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch when dropdowns change
  useEffect(() => {
    loadStudents()
  }, [filters.class, filters.section, filters.isActive, filters.search])

  // Handle Search Submit (Enter key or Button)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, search: searchInput }))
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-600" /> Student Master
            </h1>
            <p className="text-slate-500 text-sm mt-1">Global directory of all enrolled and alumni students.</p>
          </div>
          
          <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Records</span>
              <p className="text-2xl font-black text-indigo-600">{students.length}</p>
            </div>
            
            <div className="w-px h-10 bg-slate-200 hidden md:block"></div>

            <Link 
              href="/admin-dashboard/students/promote"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
            >
              <TrendingUp className="w-4 h-4" /> Bulk Promote
            </Link>
          </div>
        </div>

        {/* ── Toolbar (Search & Filters) ── */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Name or Admission No..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition-colors"
            />
            <button type="submit" className="hidden" /> {/* Hidden submit to capture Enter key */}
          </form>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase">Filters</span>
            </div>

            <select 
              value={filters.class} 
              onChange={handleClassChange}
              className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 outline-none min-w-[120px]"
            >
              <option value="">All Classes</option>
              {classes.map((c: any) => (
                <option key={c._id} value={c.className}>{c.className}</option>
              ))}
            </select>

            <select 
              value={filters.section} 
              onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
              disabled={!filters.class || availableSections.length === 0}
              className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 outline-none min-w-[110px] disabled:bg-slate-50"
            >
              <option value="">All Sec</option>
              {availableSections.map((s: any, idx) => {
                const secValue = s?.sectionName || s?.name || (typeof s === 'string' ? s : '')
                if (!secValue) return null
                return <option key={idx} value={secValue}>{secValue}</option>
              })}
            </select>

            <select 
              value={filters.isActive} 
              onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
              className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 outline-none min-w-[120px]"
            >
              <option value="">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive / TC</option>
            </select>
          </div>
        </div>

        {/* ── Data Grid ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Class & Roll</th>
                  <th className="p-4">Guardian Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="h-64 text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-64 text-center text-slate-500">
                      <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="font-bold text-lg text-slate-700">No students found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50 transition-colors group">
                      
                      {/* 1. Student Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-200">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium">
                              Admn: {student.admissionNumber}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Class & Roll */}
                      <td className="p-4">
                        <p className="font-bold text-slate-700">
                          Class {student.currentClass} - {student.currentSection}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Roll No: <span className="font-bold text-slate-700">{student.rollNumber || '-'}</span>
                        </p>
                      </td>

                      {/* 3. Guardian */}
                      <td className="p-4">
                        <p className="font-bold text-slate-700">
                          {student.parents?.fatherName || student.parents?.motherName || 'N/A'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {student.phone || student.parents?.fatherPhone || 'No phone'}
                        </p>
                      </td>

                      {/* 4. Status */}
                      <td className="p-4">
                        {student.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
                            <UserX className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>

                      {/* 5. Action */}
                      <td className="p-4 text-center">
                        <Link 
                          href={`/admin-dashboard/students/${student._id}`}
                          className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> Profile
                        </Link>
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