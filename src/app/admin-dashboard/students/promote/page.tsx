'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { getAllStudents, bulkPromoteStudents } from '@/services/admin/studentService'
import { getClasses, getAllSessions } from '@/services/admin/academicService'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useToast } from '@/components/ui/ToastProvider'
import { ArrowLeft, Users, ArrowRight, CheckSquare, Square, Save } from 'lucide-react'

export default function BulkPromotionPage() {
  const { handleError } = useErrorHandler()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [fetchingRoster, setFetchingRoster] = useState(false)
  const [promoting, setPromoting] = useState(false)

  // Master Data
  const [sessions, setSessions] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])

  // Source State (Left Side)
  const [sourceSession, setSourceSession] = useState('')
  const [sourceClass, setSourceClass] = useState('')
  const [sourceSection, setSourceSection] = useState('')
  const [sourceSectionsList, setSourceSectionsList] = useState<any[]>([])
  
  // Roster Data
  const [roster, setRoster] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Target State (Right Side)
  const [targetSession, setTargetSession] = useState('')
  const [targetClass, setTargetClass] = useState('')
  const [targetSection, setTargetSection] = useState('')
  const [targetSectionsList, setTargetSectionsList] = useState<any[]>([])

  // ── 1. Fetch Master Data ──
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [sessRes, classRes] = await Promise.all([
          getAllSessions(),
          getClasses()
        ])
        
        const sessionData = sessRes.data?.data || sessRes.data || []
        setSessions(Array.isArray(sessionData) ? sessionData : [])
        
        const classData = classRes.data?.data || classRes.data || []
        setClasses(Array.isArray(classData) ? classData : [])
        
      } catch (error) {
        handleError(error)
      } finally {
        setLoading(false)
      }
    }
    fetchMasterData()
  }, [])

  // ── 2. Handle Cascading Dropdowns ──
  useEffect(() => {
    const cls = classes.find(c => String(c.className) === String(sourceClass))
    setSourceSectionsList(cls?.sections || [])
    setSourceSection('')
    setRoster([])
  }, [sourceClass, classes])

  useEffect(() => {
    const cls = classes.find(c => String(c.className) === String(targetClass))
    setTargetSectionsList(cls?.sections || [])
    setTargetSection('')
  }, [targetClass, classes])

  // ── 3. Fetch Roster ──
  const fetchRoster = async () => {
    if (!sourceSession || !sourceClass || !sourceSection) {
      toast.error("Please select Session, Class, and Section first.")
      return
    }

    setFetchingRoster(true)
    try {
      // Pass pagination limit high enough to get the whole section
      const res = await getAllStudents({
        session: sourceSession,
        class: sourceClass,
        section: sourceSection,
        isActive: 'true',
        limit: 200 
      })
      
      const students = res.data || []
      setRoster(students)
      // Auto-select all students by default
      setSelectedIds(students.map((s: any) => s._id))
      
      if (students.length === 0) {
        toast.error("No active students found in this section.")
      }
    } catch (error) {
      handleError(error)
    } finally {
      setFetchingRoster(false)
    }
  }

  // ── 4. Toggle Selection ──
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // ── 5. Execute Promotion ──
  const handlePromote = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one student to promote.")
      return
    }
    if (!targetSession || !targetClass || !targetSection) {
      toast.error("Please completely select the Target Destination.")
      return
    }
    
    if (!window.confirm(`Are you sure you want to promote ${selectedIds.length} students to ${targetClass}-${targetSection}? This will archive their current year.`)) return

    setPromoting(true)
    try {
      await bulkPromoteStudents({
        studentIds: selectedIds,
        targetSession,
        targetClass,
        targetSection
      })
      
      toast.success("Students Promoted Successfully!")
      setRoster([])
      setSelectedIds([])
      setSourceSection('') // Reset to force refresh
    } catch (error) {
      handleError(error)
    } finally {
      setPromoting(false)
    }
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <Link href="/admin-dashboard/students" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> Academic Bulk Promotion
          </h1>
          <p className="text-slate-500 text-sm mt-1">Move students to the next academic year. Their current data will be archived into their academic history.</p>
        </div>

        {/* ── THE SPLIT SCREEN ENGINE ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start">
          
          {/* LEFT: SOURCE */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-black text-slate-800 uppercase text-xs tracking-wider border-b border-slate-100 pb-3">1. Select Source (Current Year)</h2>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Academic Session</label>
              <select value={sourceSession} onChange={e => setSourceSession(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 outline-none bg-slate-50">
                <option value="">- Select Session -</option>
                {sessions.map(s => <option key={s._id} value={s.sessionName}>{s.sessionName}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Class</label>
                <select value={sourceClass} onChange={e => setSourceClass(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 outline-none bg-slate-50">
                  <option value="">- Class -</option>
                  {classes.map(c => <option key={c._id} value={c.className}>{c.className}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Section</label>
                <select value={sourceSection} onChange={e => setSourceSection(e.target.value)} disabled={!sourceClass} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 outline-none bg-slate-50 disabled:opacity-50">
                  <option value="">- Sec -</option>
                  {sourceSectionsList.map((s, idx) => {
                    const secVal = s.sectionName || s.name || s
                    return <option key={idx} value={secVal}>{secVal}</option>
                  })}
                </select>
              </div>
            </div>

            <button 
              onClick={fetchRoster}
              disabled={fetchingRoster || !sourceSession || !sourceClass || !sourceSection}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors mt-2 disabled:opacity-50"
            >
              {fetchingRoster ? 'Loading...' : 'Fetch Students'}
            </button>
          </div>

          {/* MIDDLE: ARROW */}
          <div className="hidden md:flex flex-col items-center justify-center h-full pt-10 text-slate-300">
             <ArrowRight className="w-8 h-8" />
          </div>

          {/* RIGHT: TARGET */}
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
            <h2 className="font-black text-indigo-900 uppercase text-xs tracking-wider border-b border-indigo-200 pb-3">2. Select Destination (Next Year)</h2>
            
            <div>
              <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-1">Target Session</label>
              <select value={targetSession} onChange={e => setTargetSession(e.target.value)} className="w-full border border-indigo-200 rounded-xl px-4 py-2.5 text-sm font-bold text-indigo-900 focus:border-indigo-500 outline-none bg-white">
                <option value="">- Select Session -</option>
                {sessions.map(s => <option key={s._id} value={s.sessionName}>{s.sessionName}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-1">Target Class</label>
                <select value={targetClass} onChange={e => setTargetClass(e.target.value)} className="w-full border border-indigo-200 rounded-xl px-4 py-2.5 text-sm font-bold text-indigo-900 focus:border-indigo-500 outline-none bg-white">
                  <option value="">- Class -</option>
                  {classes.map(c => <option key={c._id} value={c.className}>{c.className}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-1">Target Section</label>
                <select value={targetSection} onChange={e => setTargetSection(e.target.value)} disabled={!targetClass} className="w-full border border-indigo-200 rounded-xl px-4 py-2.5 text-sm font-bold text-indigo-900 focus:border-indigo-500 outline-none bg-white disabled:opacity-50">
                  <option value="">- Sec -</option>
                  {targetSectionsList.map((s, idx) => {
                    const secVal = s.sectionName || s.name || s
                    return <option key={idx} value={secVal}>{secVal}</option>
                  })}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* ── THE ROSTER LIST ── */}
        {roster.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-sm">
                Students Ready for Promotion ({selectedIds.length} Selected)
              </h2>
              <p className="text-xs text-slate-500 font-medium">Uncheck students who are failing or repeating the year.</p>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="p-4 w-16 text-center">Select</th>
                    <th className="p-4 w-32">Roll No</th>
                    <th className="p-4 w-48">Admission No</th>
                    <th className="p-4">Student Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roster.map((student) => {
                    const isSelected = selectedIds.includes(student._id)
                    return (
                      <tr key={student._id} onClick={() => toggleSelection(student._id)} className={`cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}>
                        <td className="p-4 text-center">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-indigo-600 mx-auto" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300 mx-auto" />
                          )}
                        </td>
                        <td className="p-4 font-bold text-slate-500">{student.rollNumber || '-'}</td>
                        <td className="p-4 font-semibold text-slate-700">{student.admissionNumber}</td>
                        <td className="p-4 font-bold text-slate-900">{student.firstName} {student.lastName}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={handlePromote}
                disabled={promoting || selectedIds.length === 0}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
              >
                <Save className="w-4 h-4" />
                {promoting ? 'Promoting Students...' : `Promote ${selectedIds.length} Students`}
              </button>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}