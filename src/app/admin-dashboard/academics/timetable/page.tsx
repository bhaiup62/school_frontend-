'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getClasses, saveClassTimetable, getClassTimetable } from '@/services/admin/academicService'
import { getClassSubjectMappings } from '@/services/admin/classSubjectService'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useToast } from '@/components/ui/ToastProvider'
import { Calendar, Save, Clock, AlertTriangle, LayoutGrid, Edit3 } from 'lucide-react'

const formatTeacherName = (t: any) => {
  if (!t) return 'Unknown'
  const name = t.name || t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Unknown Teacher'
  const id = t.employeeId || t.teacherId || ''
  return id ? `${name} (${id})` : name
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AdminTimetablePage() {
  const { handleError } = useErrorHandler()
  const toast = useToast()

  // ── View Mode ──
  const [viewMode, setViewMode] = useState<'weekly' | 'builder'>('weekly')

  // ── State ──
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  
  const [availableSections, setAvailableSections] = useState<any[]>([])
  const [selectedSection, setSelectedSection] = useState<string>('')
  
  const [selectedDay, setSelectedDay] = useState<string>('Monday')
  const [classMapping, setClassMapping] = useState<any[]>([])
  
  const [fullTimetable, setFullTimetable] = useState<any[]>([]) // Stores the whole week
  const [periods, setPeriods] = useState<any[]>(
    Array.from({ length: 8 }, (_, i) => ({
      periodNumber: i + 1, startTime: '', endTime: '', subjectId: '', teacherId: ''
    }))
  )
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // ── 1. Fetch Classes on Mount ──
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getClasses()
        const classesArray = res.data?.data || res.data || res
        setClasses(Array.isArray(classesArray) ? classesArray : [])
      } catch (error: any) {
        handleError(error)
      }
    }
    fetchClasses()
  }, [])

  // ── 2. Handle Class Selection ──
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedClass(val)
    setSelectedSection('') 
    setClassMapping([]) 
    setFullTimetable([])
    
    const selectedObj = classes.find(c => String(c._id) === String(val))
    setAvailableSections(selectedObj?.sections || [])
  }

  // ── 3. Fetch Mapping & Timetable ──
  useEffect(() => {
    if (!selectedClass || !selectedSection) {
      setClassMapping([])
      setFullTimetable([])
      return
    }

    const loadData = async () => {
      setLoading(true)
      try {
        // A. Subjects Mapped to Class
        const mappingRes = await getClassSubjectMappings(selectedClass)
        const rawData = mappingRes.data?.data || mappingRes.data || mappingRes
        const dataArray = Array.isArray(rawData) ? rawData : []
        
        const normalizedSubjects: any[] = []
        dataArray.forEach((doc: any) => {
          if (!doc) return
          normalizedSubjects.push({
            subjectId: doc.subjectId?._id || doc.subjectId || '',
            subjectName: doc.subjectId?.subjectName || 'Unknown Subject',
            teachers: Array.isArray(doc.teachers) ? doc.teachers : []
          })
        })
        setClassMapping(normalizedSubjects)

        // B. Fetch Entire Weekly Timetable
        const timetableRes = await getClassTimetable(selectedClass, selectedSection)
        const timetables = timetableRes.data?.data || timetableRes.data || []
        
        // Save the full week for the View Grid
        setFullTimetable(timetables)
        
        // Populate the Builder Grid for the currently selected Day
        const dayTimetable = timetables.find((t: any) => String(t.dayOfWeek) === String(selectedDay) && String(t.section) === String(selectedSection))
        
        if (dayTimetable && dayTimetable.periods) {
          const newPeriods = Array.from({ length: 8 }, (_, i) => {
            const existing = dayTimetable.periods.find((p: any) => p.periodNumber === i + 1)
            return existing ? {
              periodNumber: existing.periodNumber,
              startTime: existing.startTime || '',
              endTime: existing.endTime || '',
              subjectId: existing.subjectId?._id || existing.subjectId || '',
              teacherId: existing.teacherId?._id || existing.teacherId || ''
            } : { periodNumber: i + 1, startTime: '', endTime: '', subjectId: '', teacherId: '' }
          })
          setPeriods(newPeriods)
        } else {
          setPeriods(Array.from({ length: 8 }, (_, i) => ({
            periodNumber: i + 1, startTime: '', endTime: '', subjectId: '', teacherId: ''
          })))
        }
      } catch (error) {
        handleError(error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedClass, selectedSection, selectedDay])

  // ── 4. Builder Grid Handlers ──
  const handlePeriodChange = (index: number, field: string, value: string) => {
    const updated = [...periods]
    updated[index][field] = value
    if (field === 'subjectId') updated[index]['teacherId'] = ''
    setPeriods(updated)
  }

  // ── 5. Save Logic ──
  const handleSave = async () => {
    setSaving(true)
    try {
      const validPeriods = periods.filter(p => p.subjectId && p.teacherId)
      
      await saveClassTimetable({
        classId: selectedClass,
        section: selectedSection,
        dayOfWeek: selectedDay,
        periods: validPeriods
      })
      
      toast.success(`Timetable for ${selectedDay} saved successfully!`)
      
      // Auto-switch to weekly view so they can see their work!
      setViewMode('weekly')
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.status === 400) {
        toast.error(error.response.data.message || 'Validation Error')
      } else {
        handleError(error)
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Helpers ──
  const getTeachersForSubject = (subjectId: string) => {
    if (!classMapping || classMapping.length === 0) return [];
    const mappedItem = classMapping.find((item: any) => String(item.subjectId) === String(subjectId));
    return mappedItem ? mappedItem.teachers : [];
  }

  const getSubjectName = (subjectId: string) => {
    const subject = classMapping.find((item: any) => String(item.subjectId) === String(subjectId));
    return subject ? subject.subjectName : '-';
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-600" /> Class Timetable
            </h1>
            <p className="text-slate-500 text-sm mt-1">View the weekly schedule or build a new one.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            
            {/* ── MODE TOGGLE ── */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
              <button 
                onClick={() => setViewMode('weekly')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'weekly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid className="w-4 h-4" /> View Week
              </button>
              <button 
                onClick={() => setViewMode('builder')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'builder' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Edit3 className="w-4 h-4" /> Builder
              </button>
            </div>

            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select 
                value={selectedClass} 
                onChange={handleClassChange}
                className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 outline-none flex-1 w-full sm:w-40"
              >
                <option value="">-- Select Class --</option>
                {Array.isArray(classes) && classes.map((c, idx) => (
                  <option key={idx} value={c._id}>{c.className}</option>
                ))}
              </select>

              <select 
                value={selectedSection} 
                onChange={e => setSelectedSection(e.target.value)}
                disabled={!selectedClass || availableSections.length === 0}
                className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 outline-none flex-1 w-full sm:w-32 disabled:bg-slate-50"
              >
                <option value="">-- Section --</option>
                {availableSections.map((s, idx) => {
                  const secValue = s?.sectionName || s?.name || (typeof s === 'string' ? s : '')
                  if (!secValue) return null
                  return <option key={idx} value={secValue}>Sec {secValue}</option>
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Validation Warning */}
        {selectedClass && selectedSection && classMapping.length === 0 && !loading && (
           <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
             <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
             <div>
               <h3 className="font-bold text-sm">No Subjects Mapped</h3>
               <p className="text-xs mt-1">This class does not have any subjects mapped. Please assign them in the Class-Subject Mapping module first.</p>
             </div>
           </div>
        )}

        {/* ── LOADING SPINNER ── */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 h-64 flex items-center justify-center shadow-sm">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        )}

        {/* ── WEEKLY VIEW MODE ── */}
        {!loading && viewMode === 'weekly' && selectedClass && selectedSection && classMapping.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap table-fixed">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4 w-32 border-r border-slate-200">Day</th>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                      <th key={p} className="p-4 w-40 text-center border-r border-slate-100 last:border-r-0">Period {p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayData = fullTimetable.find((t: any) => String(t.dayOfWeek) === day && String(t.section) === String(selectedSection))
                    
                    return (
                      <tr key={day} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-700 border-r border-slate-200 bg-slate-50/50">
                          {day}
                        </td>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(periodNum => {
                          const periodInfo = dayData?.periods?.find((p: any) => p.periodNumber === periodNum)
                          
                          if (periodInfo && periodInfo.subjectId) {
                            return (
                              <td key={periodNum} className="p-3 text-center border-r border-slate-100 last:border-r-0 align-top">
                                <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-2 h-full flex flex-col justify-center">
                                  <p className="font-bold text-indigo-700 text-xs truncate" title={getSubjectName(periodInfo.subjectId)}>
                                    {getSubjectName(periodInfo.subjectId)}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5" title={periodInfo.teacherName}>
                                    {periodInfo.teacherName || 'Unknown Teacher'}
                                  </p>
                                  <p className="text-[9px] text-slate-400 mt-1">
                                    {periodInfo.startTime} - {periodInfo.endTime}
                                  </p>
                                </div>
                              </td>
                            )
                          }
                          
                          return (
                            <td key={periodNum} className="p-4 text-center border-r border-slate-100 last:border-r-0">
                              <span className="text-slate-300">-</span>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BUILDER MODE ── */}
        {!loading && viewMode === 'builder' && selectedClass && selectedSection && classMapping.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-500" /> Edit Schedule
              </h2>
              <select 
                value={selectedDay} 
                onChange={e => setSelectedDay(e.target.value)}
                className="border border-slate-300 rounded-xl px-4 py-2 text-sm font-bold focus:border-indigo-500 outline-none w-48 shadow-sm"
              >
                {DAYS_OF_WEEK.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4 w-24">Period</th>
                    <th className="p-4 w-72">Time Slot</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 relative">
                  {periods.map((period, i) => {
                    const availableTeachers = getTeachersForSubject(period.subjectId)

                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-4 font-bold text-slate-700">
                          {period.periodNumber}
                        </td>
                        
                        <td className="p-4 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                          <input type="time" value={period.startTime} onChange={e => handlePeriodChange(i, 'startTime', e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:border-indigo-500 outline-none w-28 bg-white" />
                          <span className="text-slate-400">-</span>
                          <input type="time" value={period.endTime} onChange={e => handlePeriodChange(i, 'endTime', e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:border-indigo-500 outline-none w-28 bg-white" />
                        </td>

                        <td className="p-4 w-64">
                          <select 
                            value={period.subjectId} 
                            onChange={e => handlePeriodChange(i, 'subjectId', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white"
                          >
                            <option value="">- Select Subject -</option>
                            {Array.isArray(classMapping) && classMapping.map((item: any, idx: number) => <option key={idx} value={item.subjectId}>{item.subjectName}</option>)}
                          </select>
                        </td>

                        <td className="p-4 w-64">
                          <select 
                            value={period.teacherId} 
                            onChange={e => handlePeriodChange(i, 'teacherId', e.target.value)}
                            disabled={!period.subjectId || availableTeachers.length === 0}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
                          >
                            <option value="">- Select Teacher -</option>
                            {availableTeachers.map((t: any, idx: number) => (
                              <option key={idx} value={t._id}>
                                {formatTeacherName(t)}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={saving || !selectedClass || !selectedSection}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : `Save ${selectedDay}`}
              </button>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}