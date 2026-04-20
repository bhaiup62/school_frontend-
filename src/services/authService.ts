// src/services/authService.ts

import api from '@/lib/axios'

export interface LoginPayload {
  admissionNumber: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: {
      id: string
      admissionNumber: string
      role: string
    }
  }
}

// POST /api/auth/login
export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/auth/login', payload)
  return data
}

// GET /api/auth/me
export const getMe = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

// POST /api/auth/change-password
export const changePassword = async (payload: {
  currentPassword: string
  newPassword: string
}) => {
  const { data } = await api.post('/auth/change-password', payload)
  return data
}

// Logout — just clear local storage
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}