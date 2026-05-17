// src/services/admin/staffService.ts
import api from '@/lib/axios'

const BASE_URL = '/admin/staff'

export interface CreateStaffPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: 'Male' | 'Female' | 'Other'
  role: 'teacher' | 'receptionist'
}

// ── POST /api/admin/staff 
// Creates the User login AND the Teacher/Receptionist profile atomically
export const createStaffMember = async (payload: CreateStaffPayload) => {
  const { data } = await api.post(BASE_URL, payload)
  return data
}

// ── GET /api/admin/staff (We will need this for the directory UI!)
export const getStaffMembers = async (role?: string, status?: 'active' | 'inactive') => {
  const queryParams = new URLSearchParams()
  if (role) queryParams.append('role', role)
  if (status) queryParams.append('status', status)
  const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
  const { data } = await api.get(`${BASE_URL}${query}`)
  return data
}
// src/services/admin/staffService.ts

export interface UpdateStaffPayload {
  role: 'teacher' | 'receptionist'
  firstName?: string
  lastName?: string
  phone?: string
  gender?: string
}

// ── PATCH /api/admin/staff/:id
// Updates the staff member's basic information
export const updateStaffMember = async (id: string, payload: UpdateStaffPayload) => {
  const { data } = await api.patch(`${BASE_URL}/${id}`, payload)
  return data
}

// ── PATCH /api/admin/staff/:id/deactivate
// The "Kill Switch" - revokes login access and hides profile
export const deactivateStaffMember = async (id: string, role: 'teacher' | 'receptionist') => {
  const { data } = await api.patch(`${BASE_URL}/${id}/deactivate`, { role })
  return data
}
