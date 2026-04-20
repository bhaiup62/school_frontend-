// src/services/parentService.ts

import api from '@/lib/axios'

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export interface Complaint {
  _id: string
  ticketNumber: string
  category: 'academic' | 'behavioral' | 'facilities' | 'transport' | 'fees' | 'other'
  subject: string
  description: string
  submittedBy: string
  submittedByRole: string
  submittedByName: string
  relatedStudent?: string
  relatedTeacher?: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  assignedTo?: string
  comments: {
    by: string
    byRole: string
    text: string
    createdAt: string
  }[]
  resolvedAt?: string
  resolution?: string
  createdAt: string
  updatedAt: string
}

export interface Event {
  _id: string
  title: string
  description: string
  eventType: string
  date: string
  startTime?: string
  endTime?: string
  venue?: string
  targetAudience: string
  targetClasses: string[]
  status: string
  createdAt: string
}

export interface DisciplinaryRecord {
  _id: string
  studentId: string
  studentName: string
  class: string
  section: string
  incidentDate: string
  incidentType: string
  description: string
  severity: string
  actionTaken?: string
  status: string
  principalRemarks?: string
  createdAt: string
}

// ── Parent Profile ───────────────────────────────────────
export const getParentProfile = async () => {
  const { data } = await api.get('/parent/profile')
  return data
}

// ── Children ─────────────────────────────────────────────
export const getChildren = async () => {
  const { data } = await api.get('/parent/children')
  return data
}

export const getChildProfile = async (admissionNumber: string) => {
  const { data } = await api.get(`/parent/children/${admissionNumber}/profile`)
  return data
}

export const getChildResults = async (admissionNumber: string, params?: { examType?: string; session?: string }) => {
  const { data } = await api.get(`/parent/children/${admissionNumber}/results`, { params })
  return data
}

export const getChildAttendance = async (admissionNumber: string, params?: { month?: number; year?: number }) => {
  const { data } = await api.get(`/parent/children/${admissionNumber}/attendance`, { params })
  return data
}

export const getChildTimetable = async (admissionNumber: string) => {
  const { data } = await api.get(`/parent/children/${admissionNumber}/timetable`)
  return data
}

// ── Notices ──────────────────────────────────────────────
export const getParentNotices = async () => {
  const { data } = await api.get('/parent/notices')
  return data
}

// ══════════════════════════════════════════════════════════════
// COMPLAINTS
// ══════════════════════════════════════════════════════════════

export const submitComplaint = async (payload: {
  category: string
  subject: string
  description: string
  relatedStudent?: string
  relatedTeacher?: string
  priority?: string
}): Promise<{ success: boolean; message: string; data: Complaint }> => {
  const { data } = await api.post('/parent/complaints', payload)
  return data
}

export const getMyComplaints = async (params?: {
  status?: string
  page?: number
  limit?: number
}): Promise<{ success: boolean; data: Complaint[]; pagination: any }> => {
  const { data } = await api.get('/parent/complaints', { params })
  return data
}

export const getComplaintDetail = async (ticketNumber: string): Promise<{ success: boolean; data: Complaint }> => {
  const { data } = await api.get(`/parent/complaints/${ticketNumber}`)
  return data
}

export const addComplaintComment = async (
  ticketNumber: string,
  text: string
): Promise<{ success: boolean; message: string; data: Complaint }> => {
  const { data } = await api.post(`/parent/complaints/${ticketNumber}/comments`, { text })
  return data
}

// ══════════════════════════════════════════════════════════════
// EVENTS (Read-only for parents)
// ══════════════════════════════════════════════════════════════

export const getUpcomingEvents = async (): Promise<{ success: boolean; data: Event[] }> => {
  const { data } = await api.get('/parent/events')
  return data
}

// ══════════════════════════════════════════════════════════════
// DISCIPLINE RECORDS (Read-only for parents)
// ══════════════════════════════════════════════════════════════

export const getChildDisciplineRecords = async (
  admissionNumber: string
): Promise<{ success: boolean; data: DisciplinaryRecord[] }> => {
  const { data } = await api.get(`/parent/children/${admissionNumber}/discipline`)
  return data
}