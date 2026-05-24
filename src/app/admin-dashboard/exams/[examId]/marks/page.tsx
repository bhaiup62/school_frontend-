'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { getActiveExams, getClassSchedule, getMarksEntrySheet, bulkSaveMarks } from '@/services/admin/examService'
import { getClasses } from '@/services/admin/academicService'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useToast } from '@/components/ui/ToastProvider'
import { ArrowLeft, CheckCircle2, Save, Users, AlertTriangle, FileSpreadsheet } from 'lucide-react'

export default function ExamMarksPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.examId as string

  const { handleError } = useErrorHandler()
  const toast = useToast()

  // ── State ──
  const [examDetails, setExamDetails] = useState<any>(null)
  
  // Cascading Dropdown States
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  
  const [availableSections, setAvailableSections] = useState<any[]>([])
  const [selectedSection, setSelectedSection] = useState<string>('')
  
  const [scheduledSubjects, setScheduledSubjects] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  
  // Grid Data
  const [studentsData, setStudentsData] = useState<any[]>([])
  
  // Loading States
  const [loading, setLoading] = useState(true)
  const [gridLoading, setGridLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // ── 1. Fetch Exam & Master Classes on Mount ──
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [examRes, classesRes] = await Promise.all([
          getActiveExams(),
          getClasses()
        ])
        
        // Find current exam
        const examsArray = examRes.data?.data || examRes.data || examRes
        const currentExam = examsArray.find((e: any) => String(e._id) === examId)
        
        if (!currentExam) {
          toast.error("Exam not found.")
          router.push('/admin-dashboard/exams')
          return
        }
        
        setExamDetails(currentExam)

        // Find classes that are part of this exam AND have sections
        const masterClasses = classesRes.data?.data || classesRes.data || classesRes
        const examClassIds = currentExam.classes.map((c: any) => String(c._id || c))
        
        const validClasses = masterClasses.filter((c: any) => examClassIds.includes(String(c._id)))
        setClasses(validClasses)
        
      } catch (error: any) {
        handleError(error)
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [examId, router])

  // ── 2. Handle Class Selection (Fetch Sections & Scheduled Subjects) ──
  useEffect(() => {
    if (!selectedClass) {
      setAvailableSections([])
      setScheduledSubjects([])
      setSelectedSection('')
      setSelectedSubject('')
      return
    }

    const fetchClassDetails = async () => {
      // Set Sections
      const classObj = classes.find(c => String(c._id) === String(selectedClass))
      setAvailableSections(classObj?.sections || [])
      setSelectedSection('')

      // Fetch Subjects that were actually scheduled in the Date Sheet!
      try {
        const scheduleRes = await getClassSchedule(examId, selectedClass)
        const schedules = scheduleRes.data?.data || scheduleRes.data || []
        setScheduledSubjects(schedules)
        setSelectedSubject('')
      } catch (error) {
        handleError(error)
      }
    }

    fetchClassDetails()
  }, [selectedClass, classes, examId])

  // ── 3. Fetch Grid Data when everything is selected ──
  useEffect(() => {
    if (!selectedClass || !selectedSection || !selectedSubject) {
      setStudentsData([])
      return
    }

    const fetchMarksSheet = async () => {
      setGridLoading(true)
      try {
        const res = await getMarksEntrySheet({
          examId,
          classId: selectedClass,
          section: selectedSection,
          subjectId: selectedSubject
        })
        
        const sheetData = res.data?.data || res.data || []
        
        // Flatten the data for our Excel Grid
        const formattedGrid = sheetData.map((row: any) => ({
          studentId: row.student._id,
          rollNumber: row.student.rollNumber || '-',
          name: `${row.student.firstName} ${row.student.lastName}`,
          theoryMarksObtained: row.marks?.theoryMarksObtained ?? '',
          practicalMarksObtained: row.marks?.practicalMarksObtained ?? '',
          isAbsent: row.marks?.isAbsent || false,
          remarks: row.marks?.remarks || ''
        }))
        
        setStudentsData(formattedGrid)
      } catch (error) {
        handleError(error)
      } finally {
        setGridLoading(false)
      }
    }

    fetchMarksSheet()
  }, [selectedClass, selectedSection, selectedSubject, examId])

  // ── Helpers ──
  const activeSubjectData = scheduledSubjects.find(s => String(s.subjectId?._id || s.subjectId) === String(selectedSubject))

  const handleGridChange = (index: number, field: string, value: any) => {
    const updated = [...studentsData]
    updated[index][field] = value
    
    // If marked absent, clear the marks
    if (field === 'isAbsent' && value === true) {
      updated[index].theoryMarksObtained = ''
      updated[index].practicalMarksObtained = ''
    }
    
    setStudentsData(updated)
  }

  // ── Save Logic ──
  const handleSave = async () => {
    setSaving(true)
    try {
      // Format payload for backend (convert empty strings to nulls)
      const payloadMarks = studentsData.map(s => ({
        studentId: s.studentId,
        theoryMarksObtained: s.theoryMarksObtained === '' ? null : Number(s.theoryMarksObtained),
        practicalMarksObtained: s.practicalMarksObtained === '' ? null : Number(s.practicalMarksObtained),
        isAbsent: s.isAbsent,
        remarks: s.remarks
      }))

      await bulkSaveMarks({
        examId,
        classId: selectedClass,
        subjectId: selectedSubject,
        marksData: payloadMarks
      })

      toast.success("Marks saved successfully!")
    } catch (error) {
      handleError(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
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
              <CheckCircle2 className="w-6 h-6 text-emerald-600" /> Marks Entry Terminal
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">{examDetails?.name}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <select 
              value={selectedClass} 
              onChange={e => setSelectedClass(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 outline-none w-full sm:w-40"
            >
              <option value="">-- Class --</option>
              {classes.map((c: any) => (
                <option key={c._id} value={c._id}>{c.className}</option>
              ))}
            </select>

            <select 
              value={selectedSection} 
              onChange={e => setSelectedSection(e.target.value)}
              disabled={!selectedClass || availableSections.length === 0}
              className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 outline-none w-full sm:w-32 disabled:bg-slate-50"
            >
              <option value="">-- Sec --</option>
              {availableSections.map((s: any, idx) => {
                const secValue = s?.sectionName || s?.name || (typeof s === 'string' ? s : '')
                if (!secValue) return null
                return <option key={idx} value={secValue}>{secValue}</option>
              })}
            </select>

            <select 
              value={selectedSubject} 
              onChange={e => setSelectedSubject(e.target.value)}
              disabled={!selectedSection || scheduledSubjects.length === 0}
              className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-indigo-500 outline-none w-full sm:w-48 disabled:bg-slate-50"
            >
              <option value="">-- Subject --</option>
              {scheduledSubjects.map((s: any) => (
                <option key={s.subjectId?._id} value={s.subjectId?._id}>
                  {s.subjectId?.subjectName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Validation / Info Bars */}
        {selectedSection && scheduledSubjects.length === 0 && !gridLoading && (
           <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
             <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
             <div>
               <h3 className="font-bold text-sm">No Subjects Scheduled</h3>
               <p className="text-xs mt-1">You must use the Scheduler to assign a Date Sheet to this class before entering marks.</p>
             </div>
           </div>
        )}

        {/* ── THE EXCEL GRID ── */}
        {selectedClass && selectedSection && selectedSubject && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Grid Header Info */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> 
                {activeSubjectData?.subjectId?.subjectName} Marks
              </h2>
              <div className="flex gap-4 text-xs font-bold">
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100">Max Marks: {activeSubjectData?.maxMarks}</span>
                <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-lg border border-rose-100">Pass Marks: {activeSubjectData?.passMarks}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4 w-20 text-center">Roll No</th>
                    <th className="p-4 w-64">Student Name</th>
                    <th className="p-4 w-32 text-center">Theory</th>
                    {activeSubjectData?.subjectId?.hasPractical && (
                      <th className="p-4 w-32 text-center">Practical</th>
                    )}
                    <th className="p-4 w-24 text-center">Absent</th>
                    <th className="p-4">Remarks (Optional)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 relative">
                  {gridLoading ? (
                    <tr>
                      <td colSpan={6} className="h-64 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                      </td>
                    </tr>
                  ) : studentsData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="h-48 text-center text-slate-500">
                        <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold">No students found</p>
                        <p className="text-xs mt-1">There are no students enrolled in this section.</p>
                      </td>
                    </tr>
                  ) : (
                    studentsData.map((student, i) => {
                      const isExceeding = Number(student.theoryMarksObtained) > (activeSubjectData?.maxMarks || 100)

                      return (
                        <tr key={student.studentId} className={`hover:bg-slate-50 transition-colors ${student.isAbsent ? 'bg-rose-50/50 hover:bg-rose-50' : ''}`}>
                          <td className="p-4 text-center font-bold text-slate-500">
                            {student.rollNumber}
                          </td>
                          <td className="p-4 font-bold text-slate-800">
                            {student.name}
                          </td>
                          
                          <td className="p-4 text-center">
                             <input 
                               type="number" 
                               min="0"
                               max={activeSubjectData?.maxMarks}
                               value={student.theoryMarksObtained} 
                               onChange={e => handleGridChange(i, 'theoryMarksObtained', e.target.value)} 
                               disabled={student.isAbsent}
                               className={`border rounded-lg px-3 py-2 text-sm text-center outline-none w-24 transition-colors disabled:opacity-50 disabled:bg-slate-100 ${
                                 isExceeding 
                                   ? 'border-rose-500 text-rose-600 focus:ring-2 focus:ring-rose-200 bg-rose-50' 
                                   : 'border-slate-200 focus:border-indigo-500 bg-white'
                               }`} 
                               placeholder="-"
                             />
                          </td>

                          {activeSubjectData?.subjectId?.hasPractical && (
                            <td className="p-4 text-center">
                               <input 
                                 type="number" 
                                 min="0"
                                 value={student.practicalMarksObtained} 
                                 onChange={e => handleGridChange(i, 'practicalMarksObtained', e.target.value)} 
                                 disabled={student.isAbsent}
                                 className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-center focus:border-indigo-500 outline-none w-24 bg-white disabled:opacity-50 disabled:bg-slate-100" 
                                 placeholder="-"
                               />
                            </td>
                          )}

                          <td className="p-4 text-center">
                            <label className="inline-flex items-center justify-center w-full h-full cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={student.isAbsent}
                                onChange={e => handleGridChange(i, 'isAbsent', e.target.checked)}
                                className="w-5 h-5 text-rose-500 rounded border-slate-300 focus:ring-rose-500"
                              />
                            </label>
                          </td>

                          <td className="p-4">
                             <input 
                               type="text" 
                               value={student.remarks} 
                               onChange={e => handleGridChange(i, 'remarks', e.target.value)} 
                               className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none w-full bg-white max-w-xs" 
                               placeholder="e.g. Excellent"
                             />
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {!gridLoading && studentsData.length > 0 && (
              <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={saving || studentsData.some(s => Number(s.theoryMarksObtained) > (activeSubjectData?.maxMarks || 100))}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Marks'}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </AdminLayout>
  )
}