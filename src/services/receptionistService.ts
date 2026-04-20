// src/services/receptionistService.ts

import api from '@/lib/axios'

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export interface ReceptionistProfile {
  receptionistId: string
  firstName: string
  lastName: string
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  pincode: string
  qualification: string
  joiningDate: string
  shift: 'morning' | 'afternoon' | 'full_day'
  isActive: boolean
}

export interface Student {
  _id: string
  admissionNumber: string
  firstName: string
  lastName: string
  class: string
  section: string
  rollNumber: string
  phone: string
  fatherName?: string
  motherName?: string
  parents?: {
    fatherName?: string
    motherName?: string
    guardianName?: string
    phone?: string
    email?: string
    occupation?: string
    address?: string
  }
  email?: string
  address?: string
  city?: string
  pincode?: string
  dateOfBirth?: string
  gender?: string
  guardianPhone?: string
  bloodGroup?: string
  category?: string
  religion?: string
  aadharNumber?: string
  admissionDate?: string
  isActive: boolean
}

export interface StudentDetail extends Student {
  parent?: {
    fullName: string
    phone: string
    email: string
  }
}

export interface Parent {
  _id: string
  parentId: string
  firstName: string
  lastName: string
  phone: string
  email: string
  relation: string
  children: string[]
  address?: string
  city?: string
  pincode?: string
  occupation?: string
}

export interface DashboardStats {
  totalStudents: number
  totalParents: number
  studentsByClass: { _id: string; count: number }[]
  recentRegistrations: number
}

export interface AttendanceRecord {
  admissionNumber: string
  fullName: string
  rollNumber: string
  totalDays: number
  presentDays: number
  absentDays: number
  percentage: number
  lowAttendance: boolean
}

export interface CertificateData {
  type: string
  certificateNo: string
  issueDate: string
  studentName: string
  admissionNumber: string
  fatherName: string
  sonDaughterOf: string
  class: string
  section: string
  rollNumber: string
  dateOfBirth: string
  purpose: string
  characterRemarks?: string
  schoolName: string
  schoolAddress: string
}

// ══════════════════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════════════════

export const getProfile = async () => {
  const { data } = await api.get('/receptionist/profile')
  return data
}

export const updateProfile = async (payload: Partial<ReceptionistProfile>) => {
  const { data } = await api.patch('/receptionist/profile', payload)
  return data
}

// ══════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ══════════════════════════════════════════════════════════════

export const getDashboardStats = async () => {
  const { data } = await api.get('/receptionist/stats')
  return data
}

// ══════════════════════════════════════════════════════════════
// STUDENTS
// ══════════════════════════════════════════════════════════════

export const getAllStudents = async (params?: {
  class?: string
  section?: string
  search?: string
  page?: number
  limit?: number
}) => {
  const { data } = await api.get('/receptionist/students', { params })
  return data
}

export const getStudentDetails = async (admissionNumber: string) => {
  const { data } = await api.get(`/receptionist/students/${admissionNumber}`)
  return data
}

export const registerStudent = async (payload: any) => {
  const { data } = await api.post('/receptionist/students', payload)
  return data
}

export const updateStudent = async (admissionNumber: string, payload: any) => {
  const { data } = await api.patch(`/receptionist/students/${admissionNumber}`, payload)
  return data
}

// ══════════════════════════════════════════════════════════════
// PARENTS
// ══════════════════════════════════════════════════════════════

export const getAllParents = async (params?: {
  search?: string
  page?: number
  limit?: number
}) => {
  const { data } = await api.get('/receptionist/parents', { params })
  return data
}

export const registerParent = async (payload: any) => {
  const { data } = await api.post('/receptionist/parents', payload)
  return data
}

export const linkChildToParent = async (parentId: string, childAdmissionNumber: string) => {
  const { data } = await api.post(`/receptionist/parents/${parentId}/link-child`, { childAdmissionNumber })
  return data
}

// ══════════════════════════════════════════════════════════════
// ATTENDANCE (READ-ONLY)
// ══════════════════════════════════════════════════════════════

export const getAttendance = async (params: {
  class: string
  section?: string
  month?: string
  year?: string
}) => {
  const { data } = await api.get('/receptionist/attendance', { params })
  return data
}

// ══════════════════════════════════════════════════════════════
// CERTIFICATES
// ══════════════════════════════════════════════════════════════

export const generateBonafideCertificate = async (admissionNumber: string, purpose?: string) => {
  const { data } = await api.post('/receptionist/certificates/bonafide', { admissionNumber, purpose })
  return data
}

export const generateCharacterCertificate = async (admissionNumber: string, remarks?: string) => {
  const { data } = await api.post('/receptionist/certificates/character', { admissionNumber, remarks })
  return data
}

// ══════════════════════════════════════════════════════════════
// LEAVE REQUESTS
// ══════════════════════════════════════════════════════════════

export interface LeaveRequest {
  _id: string
  requestorId: string
  requestorName: string
  requestorRole: 'teacher' | 'staff' | 'receptionist'
  department?: string
  leaveType: 'casual' | 'sick' | 'earned' | 'other'
  fromDate: string
  toDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export interface LeaveRequestInput {
  leaveType: 'casual' | 'sick' | 'earned' | 'other'
  fromDate: string
  toDate: string
  reason: string
}

export const submitLeaveRequest = async (data: LeaveRequestInput): Promise<{ message: string; leaveRequest: LeaveRequest }> => {
  const response = await api.post('/receptionist/leave-requests', data)
  return response.data
}

export const getMyLeaveRequests = async (): Promise<LeaveRequest[]> => {
  const { data } = await api.get('/receptionist/leave-requests')
  return data
}
