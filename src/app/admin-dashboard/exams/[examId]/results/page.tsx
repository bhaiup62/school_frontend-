'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { getActiveExams, getClassSchedule, getMarksEntrySheet, updateExamStatus } from '@/services/admin/examService'
import { getClasses } from '@/services/admin/academicService'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useToast } from '@/components/ui/ToastProvider'
import { ArrowLeft, Trophy, Printer, AlertTriangle, Send } from 'lucide-react'

// ── Grading Engine ──
const getGrade = (percentage: number) => {
  if (percentage >= 91) return 'A1'
  if (percentage >= 81) return 'A2'
  if (percentage >= 71) return 'B1'
  if (percentage >= 61) return 'B2'
  if (percentage >= 51) return 'C1'
  if (percentage >= 41) return 'C2'
  if (percentage >= 33) return 'D'
  return 'E'
}

export default function ExamResultsPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.examId as string

  const { handleError } = useErrorHandler()
  const toast = useToast()

  // ── State ──
  const [examDetails, setExamDetails] = useState<any>(null)
  
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  
  const [availableSections, setAvailableSections] = useState<any[]>([])
  const [selectedSection, setSelectedSection] = useState<string>('')
  
  // Results Data
  const [scheduledSubjects, setScheduledSubjects] = useState<any[]>([])
  const [resultsData, setResultsData] = useState<any[]>([])
  const [hasMissingMarks, setHasMissingMarks] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const [gridLoading, setGridLoading] = useState(false)

  // ── 1. Fetch Exam & Master Classes on Mount ──
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [examRes, classesRes] = await Promise.all([
          getActiveExams(),
          getClasses()
        ])
        
        const examsArray = examRes.data?.data || examRes.data || examRes
        const currentExam = examsArray.find((e: any) => String(e._id) === examId)
        
        if (!currentExam) {
          toast.error("Exam not found.")
          router.push('/admin-dashboard/exams')
          return
        }
        setExamDetails(currentExam)

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

  // ── 2. Handle Class Selection ──
  useEffect(() => {
    if (!selectedClass) {
      setAvailableSections([])
      setSelectedSection('')
      return
    }
    const classObj = classes.find(c => String(c._id) === String(selectedClass))
    setAvailableSections(classObj?.sections || [])
    setSelectedSection('')
    setResultsData([])
  }, [selectedClass, classes])

  // ── 3. The Result Aggregation Engine ──
  const generateResults = async () => {
    if (!selectedClass || !selectedSection) return
    
    setGridLoading(true)
    setHasMissingMarks(false)
    try {
      // A. Get the Date Sheet (so we know Max Marks & Pass Marks)
      const scheduleRes = await getClassSchedule(examId, selectedClass)
      const subjects = scheduleRes.data?.data || scheduleRes.data || []
      setScheduledSubjects(subjects)

      if (subjects.length === 0) {
        toast.error("No subjects scheduled for this class.")
        setGridLoading(false)
        return
      }

      // B. Fetch marks for ALL subjects concurrently
      const marksPromises = subjects.map((sub: any) => 
        getMarksEntrySheet({
          examId, 
          classId: selectedClass, 
          section: selectedSection, 
          subjectId: sub.subjectId._id
        })
      )
      
      const marksResponses = await Promise.all(marksPromises)

      // C. Aggregate data per student
      const studentMap: Record<string, any> = {}
      let missingDataFlag = false

      marksResponses.forEach((res, index) => {
        const subjectData = subjects[index]
        const maxMarks = subjectData.maxMarks || 100
        const passMarks = subjectData.passMarks || 33
        const subId = subjectData.subjectId._id

        const sheetData = res.data?.data || res.data || []

        sheetData.forEach((row: any) => {
          const sId = row.student._id
          
          // Initialize student in map if not exists
          if (!studentMap[sId]) {
            studentMap[sId] = {
              student: row.student,
              subjectScores: {},
              totalMarksObtained: 0,
              maxTotal: 0,
              hasFailedSubject: false
            }
          }

          const marks = row.marks
          
          if (!marks || (marks.theoryMarksObtained === null && !marks.isAbsent)) {
            // Marks not entered yet!
            studentMap[sId].subjectScores[subId] = { display: 'N/A', isFail: false, isAbsent: false }
            missingDataFlag = true
          } else {
            // Calculate marks
            const theory = marks.theoryMarksObtained || 0
            const practical = marks.practicalMarksObtained || 0
            const subjectTotal = theory + practical
            const isAbsent = marks.isAbsent || false

            const isFail = isAbsent || subjectTotal < passMarks
            if (isFail) studentMap[sId].hasFailedSubject = true

            studentMap[sId].subjectScores[subId] = {
              display: isAbsent ? 'AB' : subjectTotal,
              isFail,
              isAbsent
            }

            studentMap[sId].totalMarksObtained += isAbsent ? 0 : subjectTotal
            studentMap[sId].maxTotal += maxMarks
          }
        })
      })

      // D. Final Calculations (Percentage, Grade, Pass/Fail)
      const finalResults = Object.values(studentMap).map(s => {
        const percentage = s.maxTotal > 0 ? (s.totalMarksObtained / s.maxTotal) * 100 : 0
        return {
          ...s,
          percentage: percentage.toFixed(1),
          grade: missingDataFlag ? 'N/A' : (s.hasFailedSubject ? 'E' : getGrade(percentage)),
          resultStatus: missingDataFlag ? 'Pending' : (s.hasFailedSubject ? 'Fail' : 'Pass')
        }
      })

      // Sort by Roll Number
      finalResults.sort((a, b) => Number(a.student.rollNumber) - Number(b.student.rollNumber))
      
      setResultsData(finalResults)
      setHasMissingMarks(missingDataFlag)

    } catch (error) {
      handleError(error)
    } finally {
      setGridLoading(false)
    }
  }

  // ── 4. Publish Results Action ──
  const handlePublish = async () => {
    if (hasMissingMarks) {
      toast.error("Cannot publish results! Some subject marks are missing.")
      return
    }
    
    if (!window.confirm("Are you sure you want to publish these results? Parents will be able to see them.")) return

    try {
      await updateExamStatus(examId, 'Results Published')
      toast.success("Results Published Successfully!")
      setExamDetails((prev: any) => ({ ...prev, status: 'Results Published' }))
    } catch (error) {
      handleError(error)
    }
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header (Hidden when printing) */}
        <div className="print:hidden flex items-center justify-between mb-2">
          <Link href="/admin-dashboard/exams" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Exam Dashboard
          </Link>
        </div>

        <div className="print:hidden bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${examDetails?.status === 'Results Published' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                {examDetails?.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" /> Result Publisher
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

            <button 
              onClick={generateResults}
              disabled={!selectedClass || !selectedSection || gridLoading}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            >
              Generate Sheet
            </button>
          </div>
        </div>

        {/* Warnings */}
        {hasMissingMarks && !gridLoading && resultsData.length > 0 && (
           <div className="print:hidden bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
             <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
             <div>
               <h3 className="font-bold text-sm">Incomplete Marks Detected</h3>
               <p className="text-xs mt-1">Some subjects have missing marks (marked as N/A). You cannot publish results until all teachers have finished marks entry.</p>
             </div>
           </div>
        )}

        {/* ── THE MASTER RESULT GRID ── */}
        {resultsData.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 print:shadow-none print:border-none print:m-0">
            
            <div className="hidden print:block text-center mb-6">
              <h1 className="text-2xl font-bold uppercase">{examDetails?.name} - Final Result Sheet</h1>
              <h2 className="text-lg font-semibold mt-1">Class: {classes.find(c => c._id === selectedClass)?.className} | Section: {selectedSection}</h2>
            </div>

            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-center text-sm whitespace-nowrap border-collapse">
                <thead className="bg-slate-800 text-white font-bold uppercase text-[10px] tracking-wider print:bg-slate-200 print:text-black">
                  <tr>
                    <th className="p-3 border border-slate-700 print:border-slate-300 w-16">Roll</th>
                    <th className="p-3 border border-slate-700 print:border-slate-300 text-left w-48">Student Name</th>
                    
                    {/* Dynamic Subject Headers */}
                    {scheduledSubjects.map(sub => (
                      <th key={sub.subjectId._id} className="p-3 border border-slate-700 print:border-slate-300">
                        {sub.subjectId.subjectCode}
                        <div className="text-[8px] text-slate-400 print:text-slate-600 font-medium mt-0.5">({sub.maxMarks})</div>
                      </th>
                    ))}
                    
                    <th className="p-3 border border-slate-700 print:border-slate-300 bg-slate-700 print:bg-slate-300">Total</th>
                    <th className="p-3 border border-slate-700 print:border-slate-300 bg-slate-700 print:bg-slate-300">%</th>
                    <th className="p-3 border border-slate-700 print:border-slate-300 bg-slate-700 print:bg-slate-300">Grade</th>
                    <th className="p-3 border border-slate-700 print:border-slate-300 bg-slate-700 print:bg-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resultsData.map(row => (
                    <tr key={row.student._id} className={`hover:bg-slate-50 transition-colors ${row.resultStatus === 'Fail' ? 'bg-rose-50/30' : ''}`}>
                      <td className="p-3 border border-slate-200 font-bold text-slate-500">
                        {row.student.rollNumber}
                      </td>
                      <td className="p-3 border border-slate-200 font-bold text-slate-800 text-left">
                        {row.student.firstName} {row.student.lastName}
                      </td>
                      
                      {/* Dynamic Subject Scores */}
                      {scheduledSubjects.map(sub => {
                        const scoreData = row.subjectScores[sub.subjectId._id]
                        return (
                          <td key={sub.subjectId._id} className={`p-3 border border-slate-200 font-semibold ${scoreData?.isFail ? 'text-rose-600 bg-rose-50/50' : 'text-slate-700'} ${scoreData?.display === 'N/A' ? 'text-amber-500 bg-amber-50/50' : ''}`}>
                            {scoreData?.display || '-'}
                          </td>
                        )
                      })}

                      <td className="p-3 border border-slate-200 font-bold text-indigo-700 bg-slate-50 print:bg-transparent">
                        {row.totalMarksObtained} <span className="text-xs text-slate-400">/ {row.maxTotal}</span>
                      </td>
                      <td className="p-3 border border-slate-200 font-bold text-slate-800 bg-slate-50 print:bg-transparent">
                        {row.percentage}%
                      </td>
                      <td className={`p-3 border border-slate-200 font-bold bg-slate-50 print:bg-transparent ${row.grade === 'E' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {row.grade}
                      </td>
                      <td className="p-3 border border-slate-200 bg-slate-50 print:bg-transparent">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                          row.resultStatus === 'Pass' ? 'bg-emerald-100 text-emerald-700' : 
                          row.resultStatus === 'Fail' ? 'bg-rose-100 text-rose-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {row.resultStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="print:hidden p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print Sheet
              </button>
              
              <button 
                onClick={handlePublish}
                disabled={hasMissingMarks || examDetails?.status === 'Results Published'}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-purple-600/20"
              >
                <Send className="w-4 h-4" />
                {examDetails?.status === 'Results Published' ? 'Already Published' : 'Publish Results'}
              </button>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}