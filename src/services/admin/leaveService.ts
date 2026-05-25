import api from '@/lib/axios'

export const getLeaveRequests = async (params?: { status?: string, leaveType?: string }) => {
  const response = await api.get('/admin/leaves/requests', { params })
  return response.data
}

export const updateLeaveStatus = async (id: string, status: string, remarks?: string) => {
  const response = await api.patch(`/admin/leaves/requests/${id}/status`, { status, remarks })
  return response.data
}

export const getStaffOnLeaveToday = async () => {
  const response = await api.get('/admin/leaves/today')
  return response.data
}

export const getLeaveBalances = async () => {
  const response = await api.get('/admin/leaves/balances')
  return response.data
}