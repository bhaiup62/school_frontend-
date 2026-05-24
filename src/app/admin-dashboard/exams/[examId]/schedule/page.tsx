'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { getActiveExams, getClassSchedule, upsertClassSchedule } from '@/services/admin/examService'
import { getClassSubjectMappings } from '@/services/admin/classSubjectService'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useToast } from '@/components/ui/ToastProvider'
import { Calendar, Save, ArrowLeft, Clock, AlertTriangle, BookOpen } from 'lucide-react'

export default function ExamSchedulePage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.examId as string

  const { handleError } = useErrorHandler()
  const toast = useToast()

  // ── State ──
  const [examDetails, setExamDetails] = useState<any>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  
  const [schedules, setSchedules] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [gridLoading, setGridLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // ── 1. Fetch Exam Details & Participating Classes on Mount ──
  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const res = await getActiveExams()
        const examsArray = res.data?.data || res.data || res
        const currentExam = examsArray.find((e: any) => String(e._id) === examId)
        
        if (!currentExam) {
          toast.error("Exam not found.")
          router.push('/admin-dashboard/exams')
          return
        }
        
        setExamDetails(currentExam)
        setClasses(currentExam.classes || [])
      } catch (error: any) {
        handleError(error)
      } finally {
        setLoading(false)
      }
    }
    fetchExamDetails()
  }, [examId, router])

  // ── 2. Fetch Subjects & Existing Schedule when Class changes ──
  useEffect(() => {
    if (!selectedClass) {
      setSchedules([])
      return
    }

    const loadGridData = async () => {
      setGridLoading(true)
      try {
        // A. Get Mapped Subjects (Using the exact same normalizer from the Timetable!)
        const mappingRes = await getClassSubjectMappings(selectedClass)
        const rawData = mappingRes.data?.data || mappingRes.data || mappingRes
        const dataArray = Array.isArray(rawData) ? rawData : []
        
        const normalizedSubjects: any[] = []
        dataArray.forEach((doc: any) => {
          if (!doc) return
          const subId = doc.subjectId?._id || doc.subjectId
          if (subId) {
             normalizedSubjects.push({
               subjectId: subId,
               subjectName: doc.subjectId?.subjectName || 'Unknown Subject',
             })
          }
        })

        // B. Get Existing Saved Schedule for this Class
        const scheduleRes = await getClassSchedule(examId, selectedClass)
        const existingSchedules = scheduleRes.data?.data || scheduleRes.data || []

        // C. Merge them to build the Grid
        const mergedGrid = normalizedSubjects.map(sub => {
          // Find if we already saved a date for this subject
          const existing = existingSchedules.find((s: any) => 
             String(s.subjectId?._id || s.subjectId) === String(sub.subjectId)
          )
          
          return {
            subjectId: sub.subjectId,
            subjectName: sub.subjectName,
            // Format ISO date to YYYY-MM-DD for the <input type="date">
            examDate: existing?.examDate ? new Date(existing.examDate).toISOString().split('T')[0] : '',
            startTime: existing?.startTime || '09:00',
            endTime: existing?.endTime || '12:00',
            maxMarks: existing?.maxMarks || 100,
            passMarks: existing?.passMarks || 33
          }
        })

        setSchedules(mergedGrid)
      } catch (error) {
        handleError(error)
      } finally {
        setGridLoading(false)
      }
    }

    loadGridData()
  }, [selectedClass, examId])

  // ── 3. Grid Handlers ──
  const handleScheduleChange = (index: number, field: string, value: string | number) => {
    const updated = [...schedules]
    updated[index][field] = value
    setSchedules(updated)
  }

  // ── 4. Save Logic ──
  const handleSave = async () => {
    // Validation
    const missingDates = schedules.some(s => !s.examDate)
    if (missingDates) {
      toast.error("Please select an Exam Date for all subjects before saving.")
      return
    }

    setSaving(true)
    try {
      // Clean up payload (remove subjectName as backend only needs subjectId)
      const payloadSchedules = schedules.map(s => ({
        subjectId: s.subjectId,
        examDate: s.examDate,
        startTime: s.startTime,
        endTime: s.endTime,
        maxMarks: Number(s.maxMarks),
        passMarks: Number(s.passMarks)
      }))

      await upsertClassSchedule({
        examId,
        classId: selectedClass,
        schedules: payloadSchedules
      })
      
      toast.success(`Date Sheet saved successfully!`)
    } catch (error: any) {
      handleError(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <AdminLayout><div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div></AdminLayout>
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-2">
          <Link href="/admin-dashboard/exams" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Exam Dashboard
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[10px] font-bold uppercase tracking-wider">
                {examDetails?.type}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-600" /> Exam Date Sheet Builder
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">{examDetails?.name}</p>
          </div>
          
          <div className="w-full md:w-auto">
            <select 
              value={selectedClass} 
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full md:w-64 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 outline-none shadow-sm"
            >
              <option value="">-- Select Class to Schedule --</option>
              {classes.map((c: any) => (
                <option key={c._id} value={c._id}>{c.className}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Validation Warning */}
        {selectedClass && schedules.length === 0 && !gridLoading && (
           <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
             <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
             <div>
               <h3 className="font-bold text-sm">No Subjects Mapped</h3>
               <p className="text-xs mt-1">This class does not have any subjects mapped in the Academic setup. Please map subjects first.</p>
             </div>
           </div>
        )}

        {/* Schedule Grid */}
        {selectedClass && (schedules.length > 0 || gridLoading) && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-indigo-500" /> Assign Dates & Timing
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4 w-48">Subject</th>
                    <th className="p-4 w-48">Exam Date</th>
                    <th className="p-4 w-56">Time Slot</th>
                    <th className="p-4 w-32">Max Marks</th>
                    <th className="p-4 w-32">Pass Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 relative">
                  {gridLoading && (
                    <tr>
                      <td colSpan={5} className="h-48 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                      </td>
                    </tr>
                  )}
                  
                  {!gridLoading && schedules.map((schedule, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4 font-bold text-slate-700">
                        {schedule.subjectName}
                      </td>
                      
                      <td className="p-4">
                         <input 
                           type="date" 
                           value={schedule.examDate} 
                           onChange={e => handleScheduleChange(i, 'examDate', e.target.value)} 
                           className={`border rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none w-full bg-white transition-colors ${!schedule.examDate ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`} 
                         />
                      </td>
                      
                      <td className="p-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                        <input type="time" value={schedule.startTime} onChange={e => handleScheduleChange(i, 'startTime', e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:border-indigo-500 outline-none w-28 bg-white" />
                        <span className="text-slate-400">-</span>
                        <input type="time" value={schedule.endTime} onChange={e => handleScheduleChange(i, 'endTime', e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:border-indigo-500 outline-none w-28 bg-white" />
                      </td>

                      <td className="p-4">
                         <input 
                           type="number" 
                           min="1"
                           value={schedule.maxMarks} 
                           onChange={e => handleScheduleChange(i, 'maxMarks', e.target.value)} 
                           className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none w-24 bg-white" 
                         />
                      </td>

                      <td className="p-4">
                         <input 
                           type="number" 
                           min="1"
                           value={schedule.passMarks} 
                           onChange={e => handleScheduleChange(i, 'passMarks', e.target.value)} 
                           className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none w-24 bg-white" 
                         />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving Date Sheet...' : `Save Date Sheet`}
              </button>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}