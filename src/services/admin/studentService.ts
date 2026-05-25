import api from '@/lib/axios'

export const getAllStudents = async (params?: { 
  class?: string; 
  section?: string; 
  session?: string; 
  isActive?: string; 
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/admin/students', { params })
  return response.data
}

export const getStudentProfile = async (id: string) => {
  const response = await api.get(`/admin/students/${id}`)
  return response.data
}

export const updateStudentProfile = async (id: string, data: any) => {
  const response = await api.patch(`/admin/students/${id}`, data)
  return response.data
}

export const deactivateStudent = async (id: string) => {
  const response = await api.patch(`/admin/students/${id}/status`)
  return response.data
}
export const bulkPromoteStudents = async (data: any) => {
  const response = await api.post('/admin/students/bulk-promote', data)
  return response.data
}