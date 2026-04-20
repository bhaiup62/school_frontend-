// src/services/adminService.ts

import api from '@/lib/axios'

// ── GET /api/admin/dashboard
export const getAdminDashboardStats = async () => {
  const { data } = await api.get('/admin/dashboard')
  return data
}

// ── GET /api/admin/admissions/pipeline
export const getAdmissionPipeline = async () => {
  const { data } = await api.get('/admin/admissions/pipeline')
  return data
}