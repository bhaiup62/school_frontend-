import api from '@/lib/axios'

// --- SUBJECT MANAGEMENT ---
export const createSubject = async (data: any) =>
  api.post('/admin/academics/subjects', data)

export const getSubjectsBySession = async (sessionId: string) =>
  api.get(`/admin/academics/subjects/session/${sessionId}`)

export const updateSubject = async (id: string, data: any) =>
  api.patch(`/admin/academics/subjects/${id}`, data)

export const toggleSubjectStatus = async (id: string) =>
  api.patch(`/admin/academics/subjects/${id}/toggle`)

// --- CLASS MANAGEMENT ---
export const createClass = async (data: any) =>
  api.post('/admin/academics/classes', data)

export const getClassesBySession = async (sessionId: string) =>
  api.get(`/admin/academics/classes/session/${sessionId}`)

export const getClassById = async (id: string) =>
  api.get(`/admin/academics/classes/${id}`)

export const addSectionToClass = async (classId: string, sectionData: any) =>
  api.post(`/admin/academics/classes/${classId}/sections`, sectionData)

export const assignClassTeacher = async (
  classId: string,
  sectionName: string,
  teacherId: string
) => api.patch(`/admin/academics/classes/${classId}/sections/${sectionName}/teacher`, { teacherId })

export const assignSubjectToClass = async (classId: string, data: any) =>
  api.post(`/admin/academics/classes/${classId}/subjects`, data)

export const getSubjectsForClass = async (classId: string) =>
  api.get(`/admin/academics/classes/${classId}/subjects`)

export const getClassSubjectMappings = async (classId: string) =>
  api.get(`/admin/academics/classes/${classId}/subjects`)

export const removeSubjectFromClass = async (mappingId: string) =>
  api.delete(`/admin/academics/mappings/${mappingId}`)

export const getAcademicsTeachers = async () =>
  api.get('/admin/academics/teachers/list')

export const updateSubjectMapping = async (mappingId: string, data: any) =>
  api.patch(`/admin/academics/mappings/${mappingId}`, data)
