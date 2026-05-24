import api from '@/lib/axios'

// --- EXAM MASTER ---
export const createExam = async (data: any) => {
  const response = await api.post('/admin/exams', data)
  return response.data
}

export const getActiveExams = async () => {
  const response = await api.get('/admin/exams')
  return response.data
}

export const updateExamStatus = async (examId: string, status: string) => {
  const response = await api.patch(`/admin/exams/${examId}/status`, { status })
  return response.data
}

// --- EXAM SCHEDULE ---
export const upsertClassSchedule = async (data: any) => {
  const response = await api.post('/admin/exams/schedule', data)
  return response.data
}

export const getClassSchedule = async (examId: string, classId: string) => {
  const response = await api.get(`/admin/exams/schedule/${examId}/${classId}`)
  return response.data
}

// --- EXAM MARKS ---
export const getMarksEntrySheet = async (params: { examId: string, classId: string, section: string, subjectId: string }) => {
  const response = await api.get('/admin/exams/marks', { params })
  return response.data
}

export const bulkSaveMarks = async (data: any) => {
  const response = await api.post('/admin/exams/marks', data)
  return response.data
}