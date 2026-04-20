// src/services/studentService.ts

import api from '@/lib/axios'

// ── Profile ──────────────────────────────────────────────

export const getProfile = async () => {
  const { data } = await api.get('/student/profile')
  return data
}

export const updateProfile = async (payload: {
  phone?: string
  email?: string
  address?: string
  pincode?: string
}) => {
  const { data } = await api.patch('/student/profile', payload)
  return data
}

// ── Results ──────────────────────────────────────────────

export const getResults = async (params?: {
  examType?: string
  session?: string
}) => {
  const { data } = await api.get('/student/results', { params })
  return data
}

// ── Attendance ───────────────────────────────────────────

export const getAttendance = async (params?: {
  month?: number
  year?: number
}) => {
  const { data } = await api.get('/student/attendance', { params })
  return data
}

// ── Notices ──────────────────────────────────────────────

export const getNotices = async () => {
  const { data } = await api.get('/student/notices')
  return data
}

// ── Timetable ────────────────────────────────────────────

export const getTimetable = async () => {
  const { data } = await api.get('/student/timetable')
  return data
}


// ── Events ──────────────────────────────────────────────

export const getEvents = async (params?: { page?: number; limit?: number }) => {
  const { data } = await api.get('/student/events', { params })
  return data
}