'use client'

import { useEffect, useState } from 'react'
import { Calendar, Save, Clock } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import PageHeader from '@/components/ui/PageHeader'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useToast } from '@/components/ui/Toast'
import {
  getClasses,
  saveClassTimetable,
  getClassTimetable,
  type PeriodPayload,
} from '@/services/admin/academicService'
import { getClassSubjectMappings } from '@/services/admin/classSubjectService'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const createDefaultPeriods = (): PeriodPayload[] =>
  Array.from({ length: 8 }, (_, i) => ({
    periodNumber: i + 1,
    startTime: '',
    endTime: '',
    subjectId: '',
    teacherId: '',
  }))

const toId = (value: any): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value._id) return String(value._id)
  return String(value)
}

const extractDayPeriods = (raw: any, day: string): PeriodPayload[] => {
  const defaultPeriods = createDefaultPeriods()
  const rows = Array.isArray(raw) ? raw : [raw]

  const dayRow =
    rows.find((item) => item?.dayOfWeek === day) ||
    rows.find((item) => item?.day === day) ||
    rows
      .flatMap((item) => (Array.isArray(item?.schedule) ? item.schedule : []))
      .find((item) => item?.day === day || item?.dayOfWeek === day)

  if (!Array.isArray(dayRow?.periods)) return defaultPeriods

  for (const item of dayRow.periods) {
    const periodNumber = Number(item?.periodNumber)
    if (!Number.isInteger(periodNumber) || periodNumber < 1 || periodNumber > 8) continue

    defaultPeriods[periodNumber - 1] = {
      periodNumber,
      startTime: item?.startTime || '',
      endTime: item?.endTime || '',
      subjectId: toId(item?.subjectId || item?.subject),
      teacherId: toId(item?.teacherId || item?.teacher),
    }
  }

  return defaultPeriods
}

const normalizeMappingSubjects = (mapping: any): any[] => {
  if (Array.isArray(mapping?.subjects)) return mapping.subjects
  if (!Array.isArray(mapping)) return []

  return mapping.map((item: any) => ({
    subject: item?.subject || item?.subjectId,
    teachers: item?.teachers || [],
  }))
}

export default function AdminTimetablePage() {
  const { handleError } = useErrorHandler()
  const { showSuccess, showError } = useToast()
  const toast = {
    success: showSuccess,
    error: showError,
  }

  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [classMapping, setClassMapping] = useState<any>(null)
  const [periods, setPeriods] = useState<PeriodPayload[]>(createDefaultPeriods())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const mappingSubjects = normalizeMappingSubjects(classMapping)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await getClasses()
        setClasses(response?.data?.data || response?.data || [])
      } catch (error) {
        handleError(error, 'Fetch classes')
      }
    }

    fetchClasses()
  }, [handleError])

  useEffect(() => {
    const fetchClassData = async () => {
      if (!selectedClass) {
        setClassMapping(null)
        setPeriods(createDefaultPeriods())
        return
      }

      setLoading(true)
      try {
        const [mappingResponse, timetableResponse] = await Promise.all([
          getClassSubjectMappings(selectedClass),
          getClassTimetable(selectedClass),
        ])

        const mappingData = mappingResponse?.data?.data || mappingResponse?.data || null
        setClassMapping(mappingData)

        const timetableData = timetableResponse?.data?.data || timetableResponse?.data || []
        setPeriods(extractDayPeriods(timetableData, selectedDay))
      } catch (error) {
        handleError(error, 'Fetch timetable data')
      } finally {
        setLoading(false)
      }
    }

    fetchClassData()
  }, [selectedClass, selectedDay, handleError])

  const handlePeriodChange = (index: number, field: string, value: string) => {
    setPeriods((prev) =>
      prev.map((period, periodIndex) =>
        periodIndex === index ? { ...period, [field]: value } : period
      )
    )
  }

  const getTeachersForSubject = (subjectId: string) => {
    const subjectRow = mappingSubjects.find((item: any) => toId(item?.subject || item?.subjectId) === subjectId)
    const teachers = Array.isArray(subjectRow?.teachers) ? subjectRow.teachers : []
    const uniqueById = new Map<string, any>()

    for (const teacher of teachers) {
      const teacherId = toId(teacher)
      if (!teacherId) continue
      uniqueById.set(teacherId, teacher)
    }

    return Array.from(uniqueById.values())
  }

  const handleSave = async () => {
    if (!selectedClass) return

    setSaving(true)
    try {
      const validPeriods = periods.filter(
        (period) => Boolean(period.subjectId?.trim()) && Boolean(period.teacherId?.trim())
      )

      await saveClassTimetable({
        classId: selectedClass,
        dayOfWeek: selectedDay,
        periods: validPeriods,
      })

      toast.success('Timetable saved successfully')
    } catch (error: any) {
      const status = error?.response?.status
      const message = error?.response?.data?.message

      if ((status === 409 || status === 400) && message) {
        toast.error(message)
      } else {
        handleError(error)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Class Timetable Builder"
        subtitle="Build and manage class-wise schedules for the academic week."
        breadcrumbs={[
          { label: 'Admin Dashboard', href: '/admin-dashboard' },
          { label: 'Academics', href: '/admin-dashboard/academics' },
          { label: 'Timetable Builder' },
        ]}
      />

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-600">
              <Calendar className="h-4 w-4 text-indigo-500" />
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="">Select class</option>
              {classes.map((classItem) => (
                <option key={classItem?._id} value={classItem?._id}>
                  {classItem?.displayName || classItem?.className || classItem?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-600">
              <Clock className="h-4 w-4 text-indigo-500" />
              Day of Week
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500"
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full overflow-hidden rounded-xl border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-600">Period</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-600">Start Time</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-600">End Time</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-600">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-600">Teacher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {periods.map((period, index) => (
                <tr key={`period-${period.periodNumber}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">{index + 1}</td>
                  <td className="px-4 py-3">
                    <input
                      type="time"
                      value={period.startTime}
                      onChange={(e) => handlePeriodChange(index, 'startTime', e.target.value)}
                      disabled={!selectedClass || loading || saving}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="time"
                      value={period.endTime}
                      onChange={(e) => handlePeriodChange(index, 'endTime', e.target.value)}
                      disabled={!selectedClass || loading || saving}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={period.subjectId}
                      onChange={(e) => {
                        handlePeriodChange(index, 'subjectId', e.target.value)
                        handlePeriodChange(index, 'teacherId', '')
                      }}
                      disabled={!selectedClass || loading || saving}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 disabled:opacity-50"
                    >
                      <option value="">Select subject</option>
                      {(mappingSubjects || []).map((item: any) => {
                        const subject = item?.subject || item?.subjectId
                        const subjectId = toId(subject)
                        const subjectName = subject?.subjectName || item?.subjectName || 'Unknown Subject'
                        return (
                          <option key={subjectId} value={subjectId}>
                            {subjectName}
                          </option>
                        )
                      })}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={period.teacherId}
                      onChange={(e) => handlePeriodChange(index, 'teacherId', e.target.value)}
                      disabled={!selectedClass || loading || saving || !period.subjectId}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 disabled:opacity-50"
                    >
                      <option value="">Select teacher</option>
                      {getTeachersForSubject(period.subjectId).map((teacher: any) => {
                        const teacherId = toId(teacher)
                        const fullName = `${teacher?.firstName || ''} ${teacher?.lastName || ''}`.trim()
                        return (
                          <option key={teacherId} value={teacherId}>
                            {fullName || teacher?.name || teacherId}
                          </option>
                        )
                      })}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !selectedClass}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Timetable'}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
