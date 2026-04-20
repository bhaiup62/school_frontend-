import api from '@/lib/axios'

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export interface TeacherProfile {
  teacherId: string
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
  department: string
  subjects: string[]
  assignedClasses: string[]          // Frontend expects this
  currentAssignedClasses?: string[]  // New DB schema
  isClassTeacher: boolean
  classTeacherOf: { class: string; section: string } | null          // Frontend expects this
  currentClassTeacherOf?: { class: string; section: string } | null  // New DB schema
  joiningDate: Date
}

export interface Student {
  _id: string
  admissionNumber: string
  firstName: string
  lastName: string
  fullName?: string
  class: string
  section: string
  rollNumber: string
  photo?: string
  phone?: string
  email?: string
  dateOfBirth?: string
  gender?: string
  parents?: {
    fatherName?: string
    motherName?: string
    phone?: string
  }
  attendance?: MonthlyAttendance[]
  results?: ExamResult[]
  classTeacherRemarks?: ClassTeacherRemark[]
}

export interface MonthlyAttendance {
  _id?: string
  month: number
  year: number
  records: AttendanceRecord[]
  totalDays: number
  presentDays: number
  absentDays: number
  percentage: number
}

export interface AttendanceRecord {
  date: string
  status: 'present' | 'absent' | 'late' | 'holiday'
  remarks?: string
}

export interface ExamResult {
  _id?: string
  examName: string
  examType: 'unit_test' | 'half_yearly' | 'annual' | 'pre_board'
  session: string
  subjects: SubjectResult[]
  totalMarks: number
  totalObtained: number
  percentage: number
  rank?: number
  result: 'pass' | 'fail' | 'absent'
  declaredOn?: string
}

export interface SubjectResult {
  subject: string
  maxMarks: number
  marksObtained: number
  grade?: string
  remarks?: string
}

export interface ClassTeacherRemark {
  _id?: string
  remark: string
  addedBy: string
  teacherId: string
  session: string
  date: string
}

export interface Notice {
  _id: string
  title: string
  content: string
  tag: 'general' | 'academic' | 'event' | 'holiday' | 'exam' | 'sports' | 'urgent'
  priority?: string
  targetClass?: string
  targetSection?: string
  postedBy: string
  postedById?: string
  teacherId?: string
  postedByRole?: string
  status?: 'pending' | 'approved' | 'rejected'
  isActive: boolean
  isDeleted?: boolean
  deletedBy?: string
  deletedByRole?: string
  deletedByPrincipal?: boolean
  deletedByTeacher?: boolean
  deletedAt?: string
  isOwn?: boolean
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export interface AttendanceReportStudent {
  admissionNumber: string
  firstName: string
  lastName: string
  fullName?: string
  rollNumber: string
  totalDays: number
  presentDays: number
  absentDays: number
  percentage: number
  lowAttendance: boolean
  monthlyBreakdown?: MonthlyAttendance[]
}

// ══════════════════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════════════════

export const getProfile = async (): Promise<{ success: boolean; data: TeacherProfile }> => {
  const { data } = await api.get('/teacher/profile')
  
  // Map the new DB schema fields to the frontend's expected keys
  if (data && data.data) {
    data.data.assignedClasses = data.data.currentAssignedClasses || data.data.assignedClasses || []
    data.data.classTeacherOf = data.data.currentClassTeacherOf || data.data.classTeacherOf || null
  }
  
  return data
}

export const updateProfile = async (payload: {
  phone?: string
  email?: string
  address?: string
  pincode?: string
}): Promise<{ success: boolean; data: TeacherProfile }> => {
  const { data } = await api.patch('/teacher/profile', payload)
  return data
}

// ══════════════════════════════════════════════════════════════
// STUDENTS
// ══════════════════════════════════════════════════════════════

export const getStudents = async (params?: {
  class?: string
  section?: string
}): Promise<{ success: boolean; data: Student[] }> => {
  const { data } = await api.get('/teacher/students', { params })
  return data
}

export const getStudentDetail = async (
  admissionNumber: string
): Promise<{ success: boolean; data: Student }> => {
  const { data } = await api.get(`/teacher/students/${admissionNumber}`)
  return data
}

// ══════════════════════════════════════════════════════════════
// ATTENDANCE
// ══════════════════════════════════════════════════════════════

export const markAttendance = async (payload: {
  admissionNumber: string
  date: string
  status: 'present' | 'absent' | 'late' | 'holiday'
  remarks?: string
}): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.post('/teacher/attendance', payload)
  return data
}

export const markBulkAttendance = async (payload: {
  class: string
  section: string
  date: string
  records: {
    admissionNumber: string
    status: 'present' | 'absent' | 'late' | 'holiday'
    remarks?: string
  }[]
}): Promise<{ success: boolean; message: string; summary: { success: number; failed: number } }> => {
  const { data } = await api.post('/teacher/attendance/bulk', payload)
  return data
}

export const getAttendanceReport = async (params: {
  class: string
  section?: string
  month?: number
  year?: number
}): Promise<{ success: boolean; data: AttendanceReportStudent[] }> => {
  const { data } = await api.get('/teacher/attendance-report', { params })
  return data
}

// ══════════════════════════════════════════════════════════════
// RESULTS
// ══════════════════════════════════════════════════════════════

export const enterResult = async (payload: {
  admissionNumber: string
  examName: string
  examType: 'unit_test' | 'half_yearly' | 'annual' | 'pre_board'
  session: string
  subjects: {
    subject: string
    maxMarks: number
    marksObtained: number
    grade?: string
    remarks?: string
  }[]
  rank?: number
  declaredOn?: string
}): Promise<{ success: boolean; message: string; data: ExamResult }> => {
  const { data } = await api.post('/teacher/results', payload)
  return data
}

export const getStudentResults = async (
  admissionNumber: string
): Promise<{ success: boolean; data: ExamResult[] }> => {
  const { data } = await api.get(`/teacher/results/${admissionNumber}`)
  return data
}

// ══════════════════════════════════════════════════════════════
// REMARKS (Class Teacher Only)
// ══════════════════════════════════════════════════════════════

export const addRemark = async (
  admissionNumber: string,
  payload: { remark: string; session?: string }
): Promise<{ success: boolean; message: string; data: ClassTeacherRemark }> => {
  const { data } = await api.patch(`/teacher/students/${admissionNumber}/remark`, payload)
  return data
}

export const getRemarks = async (
  admissionNumber: string
): Promise<{ 
  success: boolean
  data: { 
    student: { admissionNumber: string; fullName: string; class: string; section: string }
    remarks: ClassTeacherRemark[] 
  }
}> => {
  const { data } = await api.get(`/teacher/students/${admissionNumber}/remarks`)
  return data
}

// ══════════════════════════════════════════════════════════════
// NOTICES
// ══════════════════════════════════════════════════════════════

export const getNotices = async (params?: {
  targetClass?: string
  targetSection?: string
  tag?: string
  limit?: number
}): Promise<{ success: boolean; data: Notice[] }> => {
  const { data } = await api.get('/teacher/notices', { params })
  return data
}

export const postNotice = async (payload: {
  title: string
  content: string
  tag?: 'general' | 'academic' | 'event' | 'holiday' | 'exam' | 'sports' | 'urgent'
  targetClass?: string
  targetSection?: string
  expiresAt?: string
}): Promise<{ success: boolean; message: string; data: Notice }> => {
  const { data } = await api.post('/teacher/notices', payload)
  return data
}

export const deleteNotice = async (
  noticeId: string
): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.delete(`/teacher/notices/${noticeId}`)
  return data
}

// ══════════════════════════════════════════════════════════════
// LEAVE REQUESTS
// ══════════════════════════════════════════════════════════════

export interface LeaveRequest {
  _id: string
  requestorId: string
  requestorName: string
  requestorRole: string
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

export const submitLeaveRequest = async (payload: {
  leaveType: string
  fromDate: string
  toDate: string
  reason: string
}): Promise<{ success: boolean; message: string; data: LeaveRequest }> => {
  const { data } = await api.post('/teacher/leave-request', payload)
  return data
}

export const getMyLeaveRequests = async (params?: {
  status?: string
  page?: number
  limit?: number
}): Promise<{ success: boolean; data: LeaveRequest[]; pagination: any }> => {
  const { data } = await api.get('/teacher/leave-requests', { params })
  return data
}

// ══════════════════════════════════════════════════════════════
// COMPLAINTS
// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
// COMPLAINTS
// ══════════════════════════════════════════════════════════════

export interface Complaint {
  _id: string
  ticketNumber: string
  category: 'academic' | 'behavioral' | 'infrastructure' | 'transport' | 'fees' | 'staff' | 'safety' | 'bullying' | 'other'
  subject: string
  description: string
  raisedBy: string
  raisedByRole: string
  raisedByName: string
  relatedStudent?: string
  status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  comments: {
    author: string
    authorRole: string
    authorName: string
    message: string
    createdAt: string
  }[]
  resolution?: {
    summary: string
    resolvedByName: string
    resolvedDate: string
  }
  createdAt: string
  updatedAt: string
}

export const submitComplaint = async (payload: {
  category: string
  subject: string
  description: string
  relatedStudent?: string
  priority?: string
}): Promise<{ success: boolean; message: string; data: Complaint }> => {
  const { data } = await api.post('/teacher/complaints', payload)
  return data
}

export const getMyComplaints = async (params?: {
  status?: string
  page?: number
  limit?: number
}): Promise<{ success: boolean; data: Complaint[]; pagination: any }> => {
  const { data } = await api.get('/teacher/complaints', { params })
  return data
}

export const getComplaintDetail = async (ticketNumber: string): Promise<{ success: boolean; data: Complaint }> => {
  const { data } = await api.get(`/teacher/complaints/${ticketNumber}`)
  return data
}

export const addComplaintComment = async (
  ticketNumber: string,
  text: string
): Promise<{ success: boolean; message: string; data: Complaint }> => {
  const { data } = await api.post(`/teacher/complaints/${ticketNumber}/comments`, { text })
  return data
}

// ══════════════════════════════════════════════════════════════
// EVENTS (Read-only for teachers)
// ══════════════════════════════════════════════════════════════

export interface Event {
  _id: string
  title: string
  description: string
  eventType: string
  date: string
  startTime?: string
  endTime?: string
  venue?: string
  targetAudience: string
  targetClasses: string[]
  status: string
  createdAt: string
}

export const getUpcomingEvents = async (): Promise<{ success: boolean; data: Event[] }> => {
  const { data } = await api.get('/teacher/events')
  return data
}
export const getEvents = async (): Promise<{ success: boolean; data: any[] }> => {
  const { data } = await api.get('/teacher/events')
  return data
}