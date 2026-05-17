'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calendar, Save, Clock } from 'lucide-react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import PageHeader from '@/components/ui/PageHeader'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useToast } from '@/components/ui/Toast'
import { getClasses } from '@/services/admin/academicService'
import { getClassSubjectMappings } from '@/services/admin/classSubjectService'
import {
  getClassTimetable,
  saveClassTimetable,
  type PeriodPayload,
  type TimetablePayload,
} from '@/services/principalService'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const createDefaultPeriods = (): PeriodPayload[] =>
  Array.from({ length: 8 }, (_, index) => ({
    periodNumber: index + 1,
    startTime: '',
    endTime: '',
    subjectId: '',
    teacherId: '',
  }))

export default function PrincipalTimetablePage() {
  const { handleError } = useErrorHandler()
  const { showSuccess } = useToast()

  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [classMapping, setClassMapping] = useState<Record<string, any> | null>(null)
  const [periods, setPeriods] = useState<PeriodPayload[]>(createDefaultPeriods())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const selectedClassLabel = useMemo(() => {
    const found = classes.find((item) => item?._id === selectedClass)
    return found?.displayName || found?.className || found?.name || ''
  }, [classes, selectedClass])

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getClasses()
        setClasses(res?.data?.data || res?.data || [])
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
        const [mappingRes, timetableRes] = await Promise.all([
          getClassSubjectMappings(selectedClass),
          getClassTimetable(selectedClass),
        ])

        const mappingData = mappingRes?.data?.data || mappingRes?.data || null
        setClassMapping(mappingData)

        const timetableData = timetableRes?.data?.data || timetableRes?.data || null
        if (Array.isArray(timetableData?.periods)) {
          setPeriods(timetableData.periods)
        } else {
          const daySchedule = Array.isArray(timetableData?.schedule)
            ? timetableData.schedule.find((day: any) => day?.day === selectedDay)
            : null

          if (Array.isArray(daySchedule?.periods)) {
            setPeriods(daySchedule.periods)
          } else {
            setPeriods(createDefaultPeriods())
          }
        }
      } catch (error) {
        handleError(error, 'Fetch class timetable')
      } finally {
        setLoading(false)
      }
    }

    fetchClassData()
  }, [selectedClass])

  const handleSaveTimetable = async () => {
    if (!selectedClass) return

    setSaving(true)
    try {
      const payload: TimetablePayload = {
        classId: selectedClass,
        dayOfWeek: selectedDay,
        periods,
      }
      await saveClassTimetable(payload)
      showSuccess('Timetable saved successfully.')
    } catch (error) {
      handleError(error, 'Save class timetable')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PrincipalLayout>
      <PageHeader
        title="Timetable Builder"
        subtitle="Configure class-wise timetable slots with mapped teachers and subjects."
        breadcrumbs={[
          { label: 'Principal Dashboard', href: '/principal-dashboard' },
          { label: 'Timetable Builder' },
        ]}
      />

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 w-full">
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
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.displayName || classItem.className || classItem.name}
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

          <button
            type="button"
            onClick={handleSaveTimetable}
            disabled={!selectedClass || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Timetable'}
          </button>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          {selectedClassLabel
            ? `Loaded class: ${selectedClassLabel}${loading ? ' (loading...)' : ''}`
            : 'Choose a class to load mappings and timetable.'}
          {classMapping ? ' Mappings loaded.' : ''}
        </div>

        <div className="mt-8 text-center text-slate-600">Select a class to load the grid</div>
      </div>
    </PrincipalLayout>
  )
}
