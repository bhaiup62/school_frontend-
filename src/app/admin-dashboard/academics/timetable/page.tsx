'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getClasses, saveClassTimetable, getClassTimetable } from '@/services/admin/academicService' // from academicService.ts
import { getClassSubjectMappings } from '@/services/admin/classSubjectService'
import { useErrorHandler } from '@/hooks/useErrorHandler'
 // Remove this line// Adjust if your toast import is different
import { Calendar, Save, Clock, AlertTriangle } from 'lucide-react'

export default function AdminTimetablePage() {
  const { handleError } = useErrorHandler()

  // ── State ──
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [availableSections, setAvailableSections] = useState<any[]>([])
  const [selectedDay, setSelectedDay] = useState<string>('Monday')
  const [classMapping, setClassMapping] = useState<any>(null)
  
  const [periods, setPeriods] = useState<any[]>(
    Array.from({ length: 8 }, (_, i) => ({
      periodNumber: i + 1,
      startTime: '',
      endTime: '',
      subjectId: '',
      teacherId: ''
    }))
  )
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // ── Fetch Classes on Mount ──
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getClasses()
        console.log('RAW CLASSES RESPONSE:', res)
        const classesArray = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        console.log('EXTRACTED ARRAY:', classesArray)
        setClasses(classesArray)
      } catch (error: any) {
        console.error('CLASSES API ERROR:', error?.response?.data || error?.message || error)
        handleError(error)
      }
    }
    fetchClasses()
  }, [])

  // ── Fetch Mapping & Existing Timetable when Class/Day changes ──
  useEffect(() => {
    if (!selectedClass || !selectedSection) return

    const loadData = async () => {
      setLoading(true)
      try {
        // 1. Get the allowed Subjects & Teachers
        const mappingRes = await getClassSubjectMappings(selectedClass, selectedSection)
        const rawData = mappingRes.data || mappingRes
        const dataArray = Array.isArray(rawData) ? rawData : [rawData]
        const normalizedSubjects: any[] = []

        dataArray.forEach((doc) => {
          if (!doc) return

          if (Array.isArray(doc.subjects)) {
            doc.subjects.forEach((sub: any) => {
              normalizedSubjects.push({
                subjectId: sub.subject?._id || sub.subjectId?._id || sub.subjectId || sub.subject || '',
                subjectName: sub.subject?.subjectName || sub.subjectId?.subjectName || 'Unknown Subject',
                teachers: Array.isArray(sub.teachers) ? sub.teachers : (sub.teacher ? [sub.teacher] : []),
              })
            })
          } else if (doc.subjectId || doc.subject) {
            normalizedSubjects.push({
              subjectId: doc.subjectId?._id || doc.subjectId || doc.subject?._id || doc.subject || '',
              subjectName: doc.subjectId?.subjectName || doc.subject?.subjectName || 'Unknown Subject',
              teachers: Array.isArray(doc.teachers) ? doc.teachers : (doc.teacher ? [doc.teacher] : []),
            })
          }
        })

        setClassMapping(normalizedSubjects)

        // 2. Pre-fill the grid if a timetable already exists
        const timetableRes = await getClassTimetable(selectedClass, selectedSection)
        const timetables = timetableRes.data || []
        
        const dayTimetable = timetables.find((t: any) => t.dayOfWeek === selectedDay)
        
        if (dayTimetable && dayTimetable.periods) {
          // Merge existing periods into the 8-period grid
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
          // Reset grid if no timetable for this day
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

  // ── Grid Handlers ──
  const handlePeriodChange = (index: number, field: string, value: string) => {
    const updated = [...periods]
    updated[index][field] = value
    
    // If the subject changes, clear the teacherId so they are forced to pick a valid teacher
    if (field === 'subjectId') {
      updated[index]['teacherId'] = ''
    }
    
    setPeriods(updated)
  }

  // ── Save Logic ──
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
      
      alert(`Timetable for ${selectedDay} saved successfully!`) // Changed to alert
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.status === 400) {
        alert(error.response.data.message || 'Validation Error') // Changed to alert
      } else {
        handleError(error)
      }
    } finally {
      setSaving(false)
    }
  }
  // ── Dynamic Helper to get Teachers for a Selected Subject ──
  const getTeachersForSubject = (subjectId: string) => {
    if (!classMapping || !Array.isArray(classMapping)) return [];
    const mappedItem = classMapping.find((item: any) => item.subjectId === subjectId);
    return mappedItem ? mappedItem.teachers : [];
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-600" /> Class Timetable Builder
            </h1>
            <p className="text-slate-500 text-sm mt-1">Map subjects and teachers for the weekly schedule.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select 
              value={selectedClass} 
              onChange={e => {
                const value = e.target.value
                setSelectedClass(value)
                const selectedClassObj = classes.find(c => c._id === value)
                setAvailableSections(selectedClassObj?.sections || [])
                setSelectedSection('')
                setClassMapping(null)
              }}
              className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 outline-none flex-1 md:w-48"
            >
              <option value="">-- Select Class --</option>
              {Array.isArray(classes) && classes.map(c => (
                <option key={c._id} value={c._id}>{c.className}</option>
              ))}
            </select>

            <select 
              value={selectedSection} 
              onChange={e => setSelectedSection(e.target.value)}
              disabled={!selectedClass}
              className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 outline-none flex-1 md:w-40 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">-- Select Section --</option>
              {availableSections.map((s: any, idx: number) => (
                <option key={s.sectionName || idx} value={s.sectionName}>{s.sectionName}</option>
              ))}
            </select>

            <select 
              value={selectedDay} 
              onChange={e => setSelectedDay(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 outline-none flex-1 md:w-40"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Validation Warning */}
        {selectedClass && selectedSection && !classMapping && !loading && (
           <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
             <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
             <div>
               <h3 className="font-bold text-sm">No Subjects Mapped</h3>
               <p className="text-xs mt-1">This class does not have any subjects or teachers assigned to it in the Class-Subject Mapping module. Please map them first.</p>
             </div>
           </div>
        )}

        {/* The Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4">Period</th>
                  <th className="p-4">Time Slot</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Teacher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 relative">
                {loading && (
                  <tr>
                    <td colSpan={4} className="h-64 text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                    </td>
                  </tr>
                )}
                
                {!loading && periods.map((period, i) => {
                  // Get available teachers dynamically for THIS row's selected subject
                  const availableTeachers = getTeachersForSubject(period.subjectId)

                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-700 w-24">
                        Period {period.periodNumber}
                      </td>
                      
                      <td className="p-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <input type="time" value={period.startTime} onChange={e => handlePeriodChange(i, 'startTime', e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:border-indigo-500 outline-none w-28" />
                        <span className="text-slate-400">-</span>
                        <input type="time" value={period.endTime} onChange={e => handlePeriodChange(i, 'endTime', e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:border-indigo-500 outline-none w-28" />
                      </td>

                      <td className="p-4 w-64">
                        <select 
                          value={period.subjectId} 
                          onChange={e => handlePeriodChange(i, 'subjectId', e.target.value)}
                          disabled={!classMapping || classMapping.length === 0}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                        >
                          <option value="">- Subject -</option>
                          {Array.isArray(classMapping) && classMapping.map((item: any, idx: number) => <option key={idx} value={item.subjectId}>{item.subjectName}</option>)}
                        </select>
                      </td>

                      <td className="p-4 w-64">
                        <select 
                          value={period.teacherId} 
                          onChange={e => handlePeriodChange(i, 'teacherId', e.target.value)}
                          disabled={!period.subjectId || availableTeachers.length === 0}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                        >
                          <option value="">- Teacher -</option>
                          {availableTeachers.map((t: any, idx: number) => (
                            <option key={idx} value={t._id}>
                              {t.firstName} {t.lastName}
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
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving & Validating...' : `Save Timetable for ${selectedDay}`}
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
