import api from '@/lib/axios'

export interface PeriodPayload {
  periodNumber: number
  startTime: string
  endTime: string
  subjectId: string
  teacherId: string
}

export interface TimetablePayload {
  classId: string
  dayOfWeek: string
  periods: PeriodPayload[]
}

// SESSION MANAGEMENT
export const createSession = async (data: any) =>
  api.post('/admin/academics/sessions', data)

export const getAllSessions = async () =>
  api.get('/admin/academics/sessions')

export const getSessionById = async (id: string) =>
  api.get(`/admin/academics/sessions/${id}`)

export const updateSessionStatus = async (id: string, status: string) =>
  api.patch(`/admin/academics/sessions/${id}/status`, { status })

export const addTermToSession = async (id: string, term: any) =>
  api.post(`/admin/academics/sessions/${id}/terms`, { term })

export const toggleAdmissionStatus = async (id: string) =>
  api.patch(`/admin/academics/sessions/${id}/admissions`)

// CALENDAR MANAGEMENT
export const createCalendarEvent = async (data: any) =>
  api.post('/admin/academics/calendar/events', data)

export const getEventsBySession = async (sessionId: string) =>
  api.get(`/admin/academics/calendar/events/session/${sessionId}`)

export const deleteCalendarEvent = async (id: string) =>
  api.delete(`/admin/academics/calendar/events/${id}`)

export const rolloverSession = async (data: { oldSessionId: string, newSessionId: string }) =>
  api.post('/admin/academics/sessions/rollover', data)

export const getClasses = async () =>
  api.get('/admin/admissions/setup/classes')

export const saveClassTimetable = async (payload: TimetablePayload) => {
  const { data } = await api.post('/admin/academics/timetable', payload)
  return data
}

export const getClassTimetable = async (classId: string) => {
  const { data } = await api.get(`/admin/academics/timetable/${classId}`)
  return data
}
