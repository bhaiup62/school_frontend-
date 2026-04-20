// src/services/principalService.ts

import api from '@/lib/axios'

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export interface PrincipalProfile {
  principalId: string
  firstName: string
  lastName: string
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  pincode: string
  qualification: string
  experience: number
  specialization: string
  joiningDate: string
  isActive: boolean
  gender?: string
  dateOfBirth?: string
  joinDate?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface DashboardStats {
  overview: {
    totalStudents: number
    totalTeachers: number
    totalParents: number
    totalReceptionists: number
    classTeachersCount: number
  }
  studentsByClass: { class: string; count: number }[]
  studentsByGender: { gender: string; count: number }[]
  todayAttendance: {
    present: number
    absent: number
    totalMarked: number
    percentage: number
  }
}

export interface ClassSummary {
  class: string
  totalStudents: number
  sections: {
    section: string
    count: number
    male: number
    female: number
    classTeacher: string
  }[]
}

export interface RecentActivity {
  recentStudents: {
    id: string
    name: string
    class: string
    addedOn: string
  }[]
  recentTeachers: {
    id: string
    name: string
    subject: string
    addedOn: string
  }[]
}

export interface Student {
  _id: string
  admissionNumber: string
  firstName: string
  lastName: string
  class: string
  section: string
  rollNumber: string
  gender: string
  phone: string
  email?: string
  parents?: {
    fatherName?: string
    motherName?: string
    phone?: string
  }
  createdAt: string
}

export interface StudentDetail extends Student {
  dateOfBirth?: string
  address?: string
  city?: string
  admissionDate?: string
  attendance?: {
    month: number
    year: number
    totalDays: number
    presentDays: number
    absentDays: number
    percentage: number
  }[]
  results?: {
    examType: string
    session: string
    totalMarks: number
    totalObtained: number
    percentage: number
    rank: number
    result: string
    subjects: { subject: string; maxMarks: number; marksObtained: number }[]
    declaredOn: string
  }[]
}

export interface Teacher {
  _id: string
  teacherId: string
  firstName: string
  lastName: string
  fullName: string
  subjects: string[]
  subject: string
  phone: string
  email: string
  qualification: string
  experience?: number
  joiningDate: string
  isClassTeacher: boolean
  currentClassTeacherOf?: { class: string; section: string }
  assignedClass: string
  assignedSection: string
  studentCount?: number
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

export interface ParentDetail extends Parent {
  childrenDetails: {
    admissionNumber: string
    firstName: string
    lastName: string
    class: string
    section: string
    rollNumber: string
  }[]
}

export interface TodayAttendance {
  date: string
  summary: {
    totalPresent: number
    totalAbsent: number
    totalLate: number
    totalMarked: number
    percentage: number
  }
  byClass: {
    class: string
    section: string
    present: number
    absent: number
    late: number
    total: number
    percentage: number
  }[]
  pendingClasses: { class: string; section: string }[]
}

export interface ClassAttendance {
  class: string
  section: string
  month: number
  year: number
  classTeacher?: { id: string; name: string }
  summary: {
    totalStudents: number
    dailyPresent: number
    dailyAbsent: number
    dailyLate: number
    dailyPercentage: number
  }
  students: {
    admissionNumber: string
    name: string
    rollNumber: string
    totalDays: number
    presentDays: number
    absentDays: number
    percentage: number
    dailyStatus: string
  }[]
}

export interface ClassResults {
  class: string
  section: string
  examType: string
  summary: {
    totalStudents: number
    resultsEntered: number
    passCount: number
    failCount: number
    avgPercentage: number
    passPercentage: number
  }
  students: {
    admissionNumber: string
    name: string
    rollNumber: string
    result?: {
      totalMarks: number
      totalObtained: number
      percentage: number
      rank: number
      result: string
      subjects: { subject: string; maxMarks: number; marksObtained: number }[]
    }
  }[]
}

export interface Notice {
  _id: string
  title: string
  content: string
  tag: string
  priority: string
  targetClass: string
  targetSection: string
  targetAudience: string
  targetDisplay?: string
  postedBy: string
  postedById: string
  postedByRole: string
  status: 'pending' | 'approved' | 'rejected'
  isDeleted: boolean
  deletedBy?: string
  deletedByRole?: string
  deletedAt?: string
  isActive: boolean
  approvedBy?: string
  approvedAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export interface CertificateRequest {
  _id: string
  type: 'bonafide' | 'character' | 'transfer' | 'migration'
  studentId: string
  studentName: string
  class: string
  section: string
  requestedBy: string
  requestedByRole: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  certificateNumber?: string
  createdAt: string
}

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
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

// ══════════════════════════════════════════════════════════════
// API CALLS - DASHBOARD
// ══════════════════════════════════════════════════════════════

export const getProfile = async (): Promise<{ success: boolean; data: PrincipalProfile }> => {
  const res = await api.get('/principal/profile')
  return res.data
}

export const getDashboardStats = async (): Promise<{ success: boolean; data: DashboardStats }> => {
  const res = await api.get('/principal/dashboard/stats')
  return res.data
}

export const getClassSummary = async (): Promise<{ success: boolean; data: ClassSummary[] }> => {
  const res = await api.get('/principal/dashboard/class-summary')
  return res.data
}

export const getRecentActivity = async (): Promise<{ success: boolean; data: RecentActivity }> => {
  const res = await api.get('/principal/dashboard/recent-activity')
  return res.data
}

// ══════════════════════════════════════════════════════════════
// API CALLS - STUDENTS
// ══════════════════════════════════════════════════════════════

export const getAllStudents = async (params?: {
  class?: string
  section?: string
  search?: string
  gender?: string
  page?: number
  limit?: number
}): Promise<{ success: boolean; data: Student[]; pagination: Pagination }> => {
  const res = await api.get('/principal/students', { params })
  return res.data
}

export const getStudentDetail = async (admissionNumber: string): Promise<{ success: boolean; data: StudentDetail }> => {
  const res = await api.get(`/principal/students/${admissionNumber}`)
  return res.data
}

export const getStudentAttendance = async (admissionNumber: string): Promise<{
  success: boolean
  data: {
    student: { admissionNumber: string; name: string; class: string; section: string }
    attendance: StudentDetail['attendance']
    summary: { totalDays: number; presentDays: number; absentDays: number; overallPercentage: number }
  }
}> => {
  const res = await api.get(`/principal/students/${admissionNumber}/attendance`)
  return res.data
}

export const getStudentResults = async (admissionNumber: string): Promise<{
  success: boolean
  data: {
    student: { admissionNumber: string; name: string; class: string; section: string }
    results: StudentDetail['results']
  }
}> => {
  const res = await api.get(`/principal/students/${admissionNumber}/results`)
  return res.data
}

export const getToppers = async (params?: { examType?: string; limit?: number }): Promise<{
  success: boolean
  data: {
    class: string
    toppers: { admissionNumber: string; name: string; section: string; percentage: number; rank: number }[]
  }[]
}> => {
  const res = await api.get('/principal/students/toppers', { params })
  return res.data
}

export const getLowAttendanceStudents = async (params?: { threshold?: number }): Promise<{
  success: boolean
  data: {
    threshold: number
    count: number
    students: {
      admissionNumber: string
      name: string
      class: string
      section: string
      attendancePercentage: number
      totalDays: number
      presentDays: number
      absentDays: number
    }[]
  }
}> => {
  const res = await api.get('/principal/students/low-attendance', { params })
  return res.data
}

// ══════════════════════════════════════════════════════════════
// API CALLS - TEACHERS
// ══════════════════════════════════════════════════════════════

export const getAllTeachers = async (params?: {
  subject?: string
  isClassTeacher?: string
  search?: string
  page?: number
  limit?: number
}): Promise<{ success: boolean; data: Teacher[]; pagination: Pagination }> => {
  const res = await api.get('/principal/teachers', { params })
  return res.data
}

export const getTeacherDetail = async (teacherId: string): Promise<{ success: boolean; data: Teacher }> => {
  const res = await api.get(`/principal/teachers/${teacherId}`)
  return res.data
}

export const getClassTeachers = async (): Promise<{
  success: boolean
  data: {
    teacherId: string
    name: string
    phone: string
    email: string
    assignedClass: string
    assignedSection: string
    studentCount: number
  }[]
}> => {
  const res = await api.get('/principal/teachers/class/all/all') // Gets all class teachers
  return res.data
}

export const assignClassTeacher = async (teacherId: string, data: { class: string; section: string }): Promise<{
  success: boolean
  message: string
  data: { teacherId: string; name: string; assignedClass: string; assignedSection: string }
}> => {
  const res = await api.post(`/principal/teachers/${teacherId}/assign-class`, data)
  return res.data
}

export const removeClassTeacher = async (teacherId: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.post(`/principal/teachers/${teacherId}/remove-class`)
  return res.data
}

// ══════════════════════════════════════════════════════════════
// API CALLS - PARENTS
// ══════════════════════════════════════════════════════════════

export const getAllParents = async (params?: {
  search?: string
  page?: number
  limit?: number
}): Promise<{ success: boolean; data: Parent[]; pagination: Pagination }> => {
  const res = await api.get('/principal/parents', { params })
  return res.data
}

export const getParentDetail = async (parentId: string): Promise<{ success: boolean; data: ParentDetail }> => {
  const res = await api.get(`/principal/parents/${parentId}`)
  return res.data
}

export const getTeachersBySubject = async (subject: string): Promise<{
  success: boolean
  data: {
    teacherId: string
    name: string
    subjects: string[]
    phone: string
    email: string
    isClassTeacher: boolean
    assignedClass: string
    assignedSection: string
  }[]
}> => {
  const res = await api.get(`/principal/teachers/subject/${subject}`)
  return res.data
}

export const getUnassignedClasses = async (): Promise<{
  success: boolean
  data: { class: string; section: string; studentCount: number }[]
}> => {
  const res = await api.get('/principal/teachers/unassigned-classes')
  return res.data
}

// ══════════════════════════════════════════════════════════════
// API CALLS - ATTENDANCE
// ══════════════════════════════════════════════════════════════

export const getTodayAttendance = async (params?: { date?: string }): Promise<{ success: boolean; data: TodayAttendance }> => {
  const res = await api.get('/principal/attendance/today', { params })
  return res.data
}

export const getClassAttendance = async (
  cls: string,
  section: string,
  params?: { date?: string }
): Promise<{ success: boolean; data: ClassAttendance }> => {
  const res = await api.get(`/principal/attendance/class/${cls}/${section}`, { params })
  return res.data
}

export const getMonthlyReport = async (params?: { month?: number; year?: number }): Promise<{
  success: boolean
  data: {
    month: number
    year: number
    schoolSummary: { totalStudents: number; avgAttendance: number }
    classwiseReport: {
      class: string
      section: string
      totalStudents: number
      totalDays: number
      avgPresentDays: number
      avgAbsentDays: number
      avgPercentage: number
    }[]
  }
}> => {
  const res = await api.get('/principal/attendance/monthly-report', { params })
  return res.data
}

export const getAbsentToday = async (params?: { date?: string }): Promise<{
  success: boolean
  data: {
    date: string
    count: number
    students: {
      admissionNumber: string
      name: string
      class: string
      section: string
      phone: string
      parentName: string
      parentPhone: string
    }[]
  }
}> => {
  const res = await api.get('/principal/attendance/absent-today', { params })
  return res.data
}

// ══════════════════════════════════════════════════════════════
// API CALLS - RESULTS
// ══════════════════════════════════════════════════════════════

export const getClassResults = async (
  cls: string,
  section: string,
  params?: { examType?: string; session?: string }
): Promise<{ success: boolean; data: ClassResults }> => {
  const res = await api.get(`/principal/results/class/${cls}/${section}`, { params })
  return res.data
}

export const getResultAnalysis = async (params?: { examType?: string }): Promise<{
  success: boolean
  data: {
    examType: string
    schoolSummary: { totalExamined: number; totalPassed: number; totalFailed: number; passPercentage: number }
    byClass: {
      class: string
      totalStudents: number
      passCount: number
      failCount: number
      passPercentage: number
      avgPercentage: number
    }[]
    bySubject: { subject: string; totalStudents: number; avgMarks: number; maxMarks: number; avgPercentage: number }[]
  }
}> => {
  const res = await api.get('/principal/results/analysis', { params })
  return res.data
}

export const getAllToppers = async (params?: { examType?: string; topN?: number }): Promise<{
  success: boolean
  data: {
    examType: string
    schoolToppers: { admissionNumber: string; name: string; class: string; section: string; percentage: number }[]
    classWise: {
      class: string
      toppers: {
        admissionNumber: string
        name: string
        section: string
        percentage: number
        totalObtained: number
        totalMarks: number
      }[]
    }[]
  }
}> => {
  const res = await api.get('/principal/results/toppers', { params })
  return res.data
}

export const getFailedStudents = async (params?: { examType?: string }): Promise<{
  success: boolean
  data: {
    examType: string
    count: number
    students: {
      admissionNumber: string
      name: string
      class: string
      section: string
      percentage: number
      totalObtained: number
      totalMarks: number
      phone: string
      parentPhone: string
    }[]
  }
}> => {
  const res = await api.get('/principal/results/failed-students', { params })
  return res.data
}

// ══════════════════════════════════════════════════════════════
// API CALLS - NOTICES
// ══════════════════════════════════════════════════════════════

export const getAllNotices = async (params?: {
  type?: string
  status?: string
  priority?: string
  showDeleted?: string
  page?: number
  limit?: number
}): Promise<{ success: boolean; data: Notice[]; pendingCount?: number; pagination: Pagination }> => {
  const res = await api.get('/principal/notices', { params })
  return res.data
}

export const getPendingNotices = async (): Promise<{ success: boolean; data: Notice[]; count: number }> => {
  const res = await api.get('/principal/notices/pending')
  return res.data
}

export const getNoticeDetail = async (noticeId: string): Promise<{ 
  success: boolean
  data: Notice & { creatorDetails?: any }
}> => {
  const res = await api.get(`/principal/notices/${noticeId}`)
  return res.data
}

export const createNotice = async (data: {
  title: string
  content: string
  type?: string
  priority?: string
  targetAudience?: string
  targetClass?: string
  targetSection?: string
  targetClasses?: string[]
  publishDate?: string
  expiryDate?: string
}): Promise<{ success: boolean; message: string; data: Notice }> => {
  const res = await api.post('/principal/notices', data)
  return res.data
}

export const updateNotice = async (
  noticeId: string,
  data: Partial<{
    title: string
    content: string
    type: string
    priority: string
    targetAudience: string
    targetClass: string
    targetSection: string
    targetClasses: string[]
    expiryDate: string
  }>
): Promise<{ success: boolean; message: string; data: Notice }> => {
  const res = await api.put(`/principal/notices/${noticeId}`, data)
  return res.data
}

export const deleteNotice = async (noticeId: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.delete(`/principal/notices/${noticeId}`)
  return res.data
}

export const restoreNotice = async (noticeId: string): Promise<{ success: boolean; message: string; data: Notice }> => {
  const res = await api.patch(`/principal/notices/${noticeId}/restore`)
  return res.data
}

export const approveNotice = async (noticeId: string): Promise<{ success: boolean; message: string; data: Notice }> => {
  const res = await api.patch(`/principal/notices/${noticeId}/approve`)
  return res.data
}

export const rejectNotice = async (noticeId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.patch(`/principal/notices/${noticeId}/reject`, { reason })
  return res.data
}

// ══════════════════════════════════════════════════════════════
// API CALLS - APPROVALS
// ══════════════════════════════════════════════════════════════

export const getApprovalsSummary = async (): Promise<{
  success: boolean
  data: {
    pendingCounts: { certificates: number; leaves: number; total: number }
    recentPending: { certificates: CertificateRequest[]; leaves: LeaveRequest[] }
  }
}> => {
  const res = await api.get('/principal/approvals/summary')
  return res.data
}

export const getCertificateRequests = async (params?: {
  status?: string
  type?: string
  page?: number
  limit?: number
}): Promise<{ success: boolean; data: CertificateRequest[]; pendingCount: number; pagination: Pagination }> => {
  const res = await api.get('/principal/approvals/certificates', { params })
  return res.data
}

export const approveCertificate = async (requestId: string): Promise<{
  success: boolean
  message: string
  data: { certificateNumber: string; type: string; studentName: string }
}> => {
  const res = await api.patch(`/principal/approvals/certificates/${requestId}/approve`)
  return res.data
}

export const rejectCertificate = async (requestId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.patch(`/principal/approvals/certificates/${requestId}/reject`, { reason })
  return res.data
}

export const getLeaveRequests = async (params?: {
  status?: string
  page?: number
  limit?: number
}): Promise<{ success: boolean; data: LeaveRequest[]; pendingCount: number; pagination: Pagination }> => {
  const res = await api.get('/principal/approvals/leaves', { params })
  return res.data
}

export const approveLeave = async (requestId: string): Promise<{ success: boolean; message: string; data: LeaveRequest }> => {
  const res = await api.patch(`/principal/approvals/leaves/${requestId}/approve`)
  return res.data
}

export const rejectLeave = async (requestId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.patch(`/principal/approvals/leaves/${requestId}/reject`, { reason })
  return res.data
}

// Convenience aliases for pending approvals
export const getPendingCertificates = async () => getCertificateRequests({ status: 'pending' })
export const getPendingLeaves = async () => getLeaveRequests({ status: 'pending' })

// ══════════════════════════════════════════════════════════════
// API CALLS - REPORTS
// ══════════════════════════════════════════════════════════════

export const getSchoolSummaryReport = async (): Promise<{
  success: boolean
  data: {
    generatedAt: string
    overview: {
      totalStudents: number
      totalTeachers: number
      totalParents: number
      classTeachersCount: number
      studentGenderRatio: { male: number; female: number; malePercentage: number; femalePercentage: number }
    }
    studentsByClass: { class: string; total: number; male: number; female: number }[]
    teachersBySubject: { subject: string; count: number }[]
  }
}> => {
  const res = await api.get('/principal/reports/school-summary')
  return res.data
}

export const getStudentReport = async (params?: {
  class?: string
  section?: string
  gender?: string
}): Promise<{
  success: boolean
  data: {
    filters: { class?: string; section?: string; gender?: string }
    totalCount: number
    generatedAt: string
    students: {
      sno: number
      admissionNumber: string
      name: string
      class: string
      section: string
      rollNumber: string
      gender: string
      dateOfBirth: string
      phone: string
      email: string
      address: string
      fatherName: string
      motherName: string
      parentPhone: string
      admissionDate: string
    }[]
  }
}> => {
  const res = await api.get('/principal/reports/students', { params })
  return res.data
}

export const getTeacherReport = async (params?: {
  subject?: string
  isClassTeacher?: string
}): Promise<{
  success: boolean
  data: {
    filters: { subject?: string; isClassTeacher?: string }
    totalCount: number
    generatedAt: string
    teachers: {
      sno: number
      teacherId: string
      name: string
      subject: string
      phone: string
      email: string
      qualification: string
      experience: string
      isClassTeacher: string
      assignedClass: string
      joiningDate: string
    }[]
  }
}> => {
  const res = await api.get('/principal/reports/teachers', { params })
  return res.data
}

export const getAttendanceReport = async (params?: {
  class?: string
  section?: string
  month?: number
  year?: number
}): Promise<{
  success: boolean
  data: {
    period: { month: number; year: number }
    filters: { class?: string; section?: string }
    summary: { totalStudents: number; avgAttendance: number; below75Count: number; above90Count: number }
    generatedAt: string
    students: {
      sno: number
      admissionNumber: string
      name: string
      class: string
      section: string
      rollNumber: string
      totalDays: number
      presentDays: number
      absentDays: number
      percentage: number
    }[]
  }
}> => {
  const res = await api.get('/principal/reports/attendance', { params })
  return res.data
}

export const getResultsReport = async (params?: {
  class?: string
  section?: string
  examType?: string
}): Promise<{
  success: boolean
  data: {
    examType: string
    filters: { class?: string; section?: string }
    summary: {
      totalStudents: number
      resultsEntered: number
      passCount: number
      failCount: number
      passPercentage: number
      avgPercentage: number
    }
    generatedAt: string
    students: {
      sno: number
      admissionNumber: string
      name: string
      class: string
      section: string
      rollNumber: string
      totalMarks: number
      marksObtained: number
      percentage: number
      rank: string
      result: string
    }[]
  }
}> => {
  const res = await api.get('/principal/reports/results', { params })
  return res.data
}

// ══════════════════════════════════════════════════════════════
// TYPES - DISCIPLINE
// ══════════════════════════════════════════════════════════════

// Valid categories - must match backend DISCIPLINE_CATEGORIES
export const DISCIPLINE_CATEGORIES = [
  'misconduct',
  'bullying',
  'vandalism',
  'cheating',
  'truancy',
  'violence',
  'substance',
  'harassment',
  'other',
] as const

export type DisciplineCategory = (typeof DISCIPLINE_CATEGORIES)[number]

export interface DisciplinaryRecord {
  _id: string
  recordId: string
  student: {
    _id: string
    admissionNumber: string
    firstName: string
    lastName: string
    class: string
    section: string
  }
  reportedBy: {
    role: 'teacher' | 'receptionist' | 'principal'
    name: string
    id: string
  }
  incidentDate: string
  incidentType: 'minor' | 'moderate' | 'severe' | 'critical'
  category: DisciplineCategory
  description: string
  location?: string
  witnesses?: string[]
  actionTaken?: 'warning' | 'detention' | 'suspension' | 'rustication' | 'counseling' | 'parent_meeting' | 'other'
  actionDetails?: string
  suspensionDays?: number
  principalRemarks?: string
  parentNotified: boolean
  status: 'reported' | 'under_review' | 'action_taken' | 'resolved' | 'escalated'
  reviewedBy?: { name: string; date: string }
  createdAt: string
  updatedAt: string
}

export interface DisciplineSummary {
  totalRecords: number
  pendingReview: number
  byIncidentType: { type: string; count: number }[]
  byStatus: { status: string; count: number }[]
  recentRecords: DisciplinaryRecord[]
}

// ══════════════════════════════════════════════════════════════
// TYPES - CURRICULUM
// ══════════════════════════════════════════════════════════════

export interface SyllabusProgress {
  _id: string
  progressId: string
  teacher: {
    _id: string
    teacherId: string
    firstName: string
    lastName: string
  }
  class: string
  section: string
  subject: string
  academicYear: string
  totalChapters: number
  completedChapters: number
  completionPercentage: number
  chapters: {
    chapterNumber: number
    chapterName: string
    status: 'not_started' | 'in_progress' | 'completed'
    startDate?: string
    completionDate?: string
    remarks?: string
  }[]
  expectedCompletionDate?: string
  actualCompletionDate?: string
  principalRemarks?: string
  status: 'on_track' | 'behind_schedule' | 'ahead' | 'completed' | 'not_started'
  lastUpdated: string
  createdAt: string
}

export interface CurriculumSummary {
  totalClasses: number
  totalSubjects: number
  avgCompletion: number
  onTrack: number
  behindSchedule: number
  completed: number
  byClass: { class: string; avgCompletion: number; status: string }[]
  laggingClasses: SyllabusProgress[]
}

// ══════════════════════════════════════════════════════════════
// TYPES - COMPLAINTS
// ══════════════════════════════════════════════════════════════

export interface Complaint {
  _id: string
  ticketNumber: string
  
  // ALIGNED WITH NEW DB SCHEMA
  raisedByRole: string
  raisedByName: string
  
  category: string
  subject: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed' | 'rejected'
  
  assignedToName?: string
  
  comments: {
    authorName: string
    authorRole: string
    message: string
    createdAt: string
  }[]
  
  resolution?: {
    summary: string
    resolvedByName: string
    resolvedDate: string
  }
  
  relatedStudent?: {
    name: string
    class: string
  }
  
  createdAt: string
  updatedAt: string
}

export interface ComplaintsSummary {
  totalComplaints: number
  openCount: number
  inProgressCount: number
  resolvedCount: number
  byCategory: { category: string; count: number }[]
  byPriority: { priority: string; count: number }[]
  recentComplaints: Complaint[]
}

// ══════════════════════════════════════════════════════════════
// TYPES - EVENTS
// ══════════════════════════════════════════════════════════════

export interface SchoolEvent {
  _id: string
  eventId: string
  title: string
  description: string
  eventType: 'cultural' | 'sports' | 'academic' | 'holiday' | 'ptm' | 'exam' | 'competition' | 'field_trip' | 'other'
  startDate: string
  endDate?: string
  startTime?: string
  endTime?: string
  venue?: string
  targetAudience: 'all' | 'students' | 'teachers' | 'parents' | 'specific_classes'
  targetClasses?: string[]
  isPTM: boolean
  ptmDetails?: {
    classes: string[]
    agenda: string
    timings: { class: string; time: string }[]
  }
  organizer: {
    name: string
    role: string
    id: string
  }
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'cancelled' | 'completed'
  approvedBy?: { name: string; date: string }
  rejectionReason?: string
  budget?: number
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

export interface CalendarEvent {
  _id: string
  eventId: string
  title: string
  eventType: string
  startTime?: string
  endTime?: string
  venue?: string
  priority?: string
  isPTM?: boolean
}

// ══════════════════════════════════════════════════════════════
// TYPES - FINANCE
// ══════════════════════════════════════════════════════════════

export interface FeeRecord {
  _id: string
  student: {
    _id: string
    admissionNumber: string
    firstName: string
    lastName: string
    class: string
    section: string
  }
  academicYear: string
  feeType: 'tuition' | 'admission' | 'exam' | 'transport' | 'library' | 'lab' | 'sports' | 'other'
  totalAmount: number
  paidAmount: number
  dueAmount: number
  dueDate: string
  status: 'paid' | 'partial' | 'pending' | 'overdue'
  payments: {
    amount: number
    date: string
    receiptNumber: string
    mode: string
  }[]
  lateFee?: number
  restrictReportCard: boolean
  lastReminder?: string
  createdAt: string
}

export interface FinanceSummary {
  totalStudents: number
  defaultersCount: number
  totalCollection: number
  pendingAmount: number
  restrictedCount: number
  collectionByMonth: { month: string; amount: number }[]
  defaultersByClass: { class: string; count: number }[]
}

export interface Defaulter {
  student: {
    admissionNumber: string
    name: string
    class: string
    section: string
    parentPhone: string
  }
  totalDue: number
  overdueBy: number
  lastPayment?: string
  restrictReportCard: boolean
}

// ══════════════════════════════════════════════════════════════
// API CALLS - DISCIPLINE
// ══════════════════════════════════════════════════════════════

export const getDisciplineRecords = async (params?: {
  incidentType?: string
  status?: string
  class?: string
  page?: number
  limit?: number
}): Promise<{ success: boolean; data: DisciplinaryRecord[]; pagination: Pagination }> => {
  const res = await api.get('/principal/discipline', { params })
  return res.data
}

export const getDisciplineSummary = async (): Promise<{ success: boolean; data: DisciplineSummary }> => {
  const res = await api.get('/principal/discipline/summary')
  return res.data
}

export const getStudentDisciplineRecords = async (admissionNumber: string): Promise<{ success: boolean; data: DisciplinaryRecord[] }> => {
  const res = await api.get(`/principal/discipline/student/${admissionNumber}`)
  return res.data
}

export const getDisciplineRecordDetail = async (id: string): Promise<{ success: boolean; data: DisciplinaryRecord }> => {
  const res = await api.get(`/principal/discipline/${id}`)
  return res.data
}

export const createDisciplineRecord = async (data: {
  studentAdmissionNumber: string
  incidentDate: string
  incidentType: string
  category: DisciplineCategory
  description: string
  location?: string
  witnesses?: string[]
  actionTaken?: string
  actionDetails?: string
  suspensionDays?: number
  principalRemarks?: string
  parentNotified?: boolean
}): Promise<{ success: boolean; message: string; data: DisciplinaryRecord }> => {
  const res = await api.post('/principal/discipline', data)
  return res.data
}

export const reviewDisciplineRecord = async (id: string, data: {
  actionTaken?: string
  actionDetails?: string
  suspensionDays?: number
  principalRemarks?: string
  parentNotified?: boolean
  status?: string
}): Promise<{ success: boolean; message: string; data: DisciplinaryRecord }> => {
  const res = await api.put(`/principal/discipline/${id}/review`, data)
  return res.data
}

// ══════════════════════════════════════════════════════════════
// API CALLS - CURRICULUM
// ══════════════════════════════════════════════════════════════

export const getCurriculumProgress = async (params?: {
  class?: string
  subject?: string
  status?: string
  page?: number
  limit?: number
}): Promise<{ success: boolean; data: SyllabusProgress[]; pagination: Pagination }> => {
  const res = await api.get('/principal/curriculum', { params })
  return res.data
}

export const getCurriculumSummary = async (): Promise<{ success: boolean; data: CurriculumSummary }> => {
  const res = await api.get('/principal/curriculum/summary')
  return res.data
}

export const getTeacherCurriculumProgress = async (teacherId: string): Promise<{ success: boolean; data: SyllabusProgress[] }> => {
  const res = await api.get(`/principal/curriculum/teacher/${teacherId}`)
  return res.data
}

export const getCurriculumProgressDetail = async (id: string): Promise<{ success: boolean; data: SyllabusProgress }> => {
  const res = await api.get(`/principal/curriculum/${id}`)
  return res.data
}

export const reviewCurriculumProgress = async (id: string, data: {
  principalRemarks?: string
  status?: string
}): Promise<{ success: boolean; message: string; data: SyllabusProgress }> => {
  const res = await api.put(`/principal/curriculum/${id}/review`, data)
  return res.data
}

// ══════════════════════════════════════════════════════════════
// API CALLS - COMPLAINTS
// ══════════════════════════════════════════════════════════════

export const getComplaints = async (params?: {
  category?: string
  status?: string
  priority?: string
  page?: number
  limit?: number
}): Promise<{ success: boolean; data: Complaint[]; pagination: Pagination }> => {
  const res = await api.get('/principal/complaints', { params })
  return res.data
}

export const getComplaintsSummary = async (): Promise<{ success: boolean; data: ComplaintsSummary }> => {
  const res = await api.get('/principal/complaints/summary')
  return res.data
}

export const getComplaintDetail = async (id: string): Promise<{ success: boolean; data: Complaint }> => {
  const res = await api.get(`/principal/complaints/${id}`)
  return res.data
}

export const updateComplaint = async (id: string, data: {
  status?: string
  priority?: string
  assignedTo?: { name: string; role: string }
}): Promise<{ success: boolean; message: string; data: Complaint }> => {
  const res = await api.put(`/principal/complaints/${id}/update`, data)
  return res.data
}

// FIX #1: Backend expects { resolution }, not { resolutionSummary }
export const resolveComplaint = async (id: string, data: {
  resolution: string
}): Promise<{ success: boolean; message: string; data: Complaint }> => {
  const res = await api.put(`/principal/complaints/${id}/resolve`, data)
  return res.data
}

export const addComplaintComment = async (id: string, data: {
  message: string
}): Promise<{ success: boolean; message: string; data: Complaint }> => {
  const res = await api.post(`/principal/complaints/${id}/comment`, data)
  return res.data
}

// ══════════════════════════════════════════════════════════════
// API CALLS - EVENTS
// ══════════════════════════════════════════════════════════════

export const getEvents = async (params?: {
  eventType?: string
  status?: string
  month?: number
  year?: number
  page?: number
  limit?: number
}, signal?: AbortSignal): Promise<{ success: boolean; data: SchoolEvent[]; pagination: Pagination }> => {
  const res = await api.get('/principal/events', { params, signal })
  return res.data
}

export const getCalendar = async (params?: {
  month?: number
  year?: number
}, signal?: AbortSignal): Promise<{ success: boolean; data: CalendarEvent[] }> => {
  const res = await api.get('/principal/events/calendar', { params, signal })
  return res.data
}

export const getPendingEvents = async (signal?: AbortSignal): Promise<{ success: boolean; data: SchoolEvent[] }> => {
  const res = await api.get('/principal/events/pending', { signal })
  return res.data
}

export const getEventDetail = async (id: string): Promise<{ success: boolean; data: SchoolEvent }> => {
  const res = await api.get(`/principal/events/${id}`)
  return res.data
}

export const createEvent = async (data: {
  title: string
  description: string
  eventType: string
  startDate: string
  endDate?: string
  startTime?: string
  endTime?: string
  venue?: string
  targetAudience?: string
  targetClasses?: string[]
  budget?: number
}): Promise<{ success: boolean; message: string; data: SchoolEvent }> => {
  const res = await api.post('/principal/events', data)
  return res.data
}

export const createPTM = async (data: {
  title: string
  description?: string
  startDate: string
  classes: string[]
  agenda: string
  timings?: { class: string; time: string }[]
  venue?: string
}): Promise<{ success: boolean; message: string; data: SchoolEvent }> => {
  const res = await api.post('/principal/events/ptm', data)
  return res.data
}

export const updateEvent = async (id: string, data: Partial<{
  title: string
  description: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  venue: string
  budget: number
}>): Promise<{ success: boolean; message: string; data: SchoolEvent }> => {
  const res = await api.put(`/principal/events/${id}`, data)
  return res.data
}

export const approveEvent = async (id: string): Promise<{ success: boolean; message: string; data: SchoolEvent }> => {
  const res = await api.put(`/principal/events/${id}/approve`)
  return res.data
}

export const rejectEvent = async (id: string, reason: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.put(`/principal/events/${id}/reject`, { reason })
  return res.data
}

export const cancelEvent = async (id: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.delete(`/principal/events/${id}`)
  return res.data
}

// ══════════════════════════════════════════════════════════════
// API CALLS - FINANCE
// ══════════════════════════════════════════════════════════════

export const getFinanceSummary = async (): Promise<{ success: boolean; data: FinanceSummary }> => {
  const res = await api.get('/principal/finance/summary')
  return res.data
}

export const getDefaulters = async (params?: {
  class?: string
  minAmount?: number
  page?: number
  limit?: number
}): Promise<{ success: boolean; data: Defaulter[]; pagination: Pagination }> => {
  const res = await api.get('/principal/finance/defaulters', { params })
  return res.data
}

export const getStudentFees = async (admissionNumber: string): Promise<{ success: boolean; data: FeeRecord[] }> => {
  const res = await api.get(`/principal/finance/student/${admissionNumber}`)
  return res.data
}

export const getCollectionReport = async (params?: {
  startDate?: string
  endDate?: string
}): Promise<{ success: boolean; data: { totalCollection: number; byFeeType: { type: string; amount: number }[]; byMonth: { month: string; amount: number }[] } }> => {
  const res = await api.get('/principal/finance/collection-report', { params })
  return res.data
}

export const getClassWiseSummary = async (): Promise<{ success: boolean; data: { class: string; totalStudents: number; paidCount: number; pendingCount: number; defaultersCount: number; totalDue: number }[] }> => {
  const res = await api.get('/principal/finance/class-wise')
  return res.data
}

export const toggleReportCardRestriction = async (id: string, restrict: boolean): Promise<{ success: boolean; message: string }> => {
  const res = await api.put(`/principal/finance/${id}/restrict`, { restrict })
  return res.data
}

export const bulkRestrictReportCards = async (studentIds: string[], restrict: boolean): Promise<{ success: boolean; message: string; affectedCount: number }> => {
  const res = await api.put('/principal/finance/bulk-restrict', { studentIds, restrict })
  return res.data
}
