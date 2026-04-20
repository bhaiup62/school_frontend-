import api from '@/lib/axios'

const BASE_URL = '/admin/admissions'

const toQueryString = (params: Record<string, string | undefined>): string => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, value)
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export interface SessionPayload {
  sessionName: string
  startDate: string | Date
  endDate: string | Date
}

export const createSession = async (payload: SessionPayload) => {
  const { data } = await api.post(`${BASE_URL}/setup/sessions`, payload)
  return data
}

export const getSessions = async () => {
  const { data } = await api.get(`${BASE_URL}/setup/sessions`)
  return data
}

export interface ToggleSessionStatusPayload {
  field: 'isCurrentSession' | 'isAdmissionOpen'
}

export const toggleSessionStatus = async (
  id: string,
  field: ToggleSessionStatusPayload['field']
) => {
  const { data } = await api.patch(`${BASE_URL}/setup/sessions/${id}/status`, { field })
  return data
}

export interface ClassPayload {
  className: string
  totalCapacity: number
  minimumAgeCutoffDate: string | Date
  applicationFeeAmount: number
}

export const createClass = async (payload: ClassPayload) => {
  const { data } = await api.post(`${BASE_URL}/setup/classes`, payload)
  return data
}

export const getClasses = async () => {
  const { data } = await api.get(`${BASE_URL}/setup/classes`)
  return data
}

export interface UpdateClassPayload {
  totalCapacity?: number
  applicationFeeAmount?: number
}

export const updateClass = async (id: string, payload: UpdateClassPayload) => {
  const { data } = await api.patch(`${BASE_URL}/setup/classes/${id}`, payload)
  return data
}

export interface EnquiryPayload {
  parentName: string
  phone: string
  email?: string
  classInterestedIn: string
  leadSource?: 'Website' | 'Facebook' | 'Walk-in' | 'Phone' | 'Other'
}

export const createEnquiry = async (payload: EnquiryPayload) => {
  const { data } = await api.post(`${BASE_URL}/enquiries`, payload)
  return data
}

export interface EnquiryFilters {
  status?: 'New' | 'Contacted' | 'Converted' | 'Dead'
  classInterestedIn?: string
}

export const getEnquiries = async (filters: EnquiryFilters = {}) => {
  const query = toQueryString({
    status: filters.status,
    classInterestedIn: filters.classInterestedIn,
  })
  const { data } = await api.get(`${BASE_URL}/enquiries${query}`)
  return data
}

export interface UpdateEnquiryStatusPayload {
  status: 'New' | 'Contacted' | 'Converted' | 'Dead'
  followUpDate?: string | Date
}

export const updateEnquiryStatus = async (id: string, payload: UpdateEnquiryStatusPayload) => {
  const { data } = await api.patch(`${BASE_URL}/enquiries/${id}/status`, payload)
  return data
}

export const deleteEnquiry = async (id: string) => {
  const { data } = await api.delete(`${BASE_URL}/enquiries/${id}`)
  return data
}

export interface ApplicationPayload {
  academicSession: string
  appliedClass: string
  childData: {
    firstName: string
    lastName: string
    dob: string | Date
    gender: 'Male' | 'Female' | 'Other'
    bloodGroup?: string
  }
  parentData: {
    fatherName: string
    motherName: string
    phone: string
    email?: string
    occupation?: string
    annualIncome?: number
  }
  payment?: {
    status?: 'Pending' | 'Paid' | 'Failed'
    transactionId?: string
    amount?: number
  }
  documents?: Array<{
    documentType?: string
    fileUrl?: string
    status?: 'Pending' | 'Verified' | 'Rejected'
  }>
  assessment?: {
    interviewDate?: string | Date
    testScore?: number
  }
}

export const createApplication = async (payload: ApplicationPayload) => {
  const { data } = await api.post(`${BASE_URL}/applications`, payload)
  return data
}

export interface ApplicationFilters {
  pipelineStatus?:
    | 'Draft'
    | 'Submitted'
    | 'Document Verified'
    | 'Test Scheduled'
    | 'Offered'
    | 'Waitlisted'
    | 'Rejected'
    | 'Admitted'
  appliedClass?: string
  academicSession?: string
}

export const getApplications = async (filters: ApplicationFilters = {}) => {
  const query = toQueryString({
    pipelineStatus: filters.pipelineStatus,
    appliedClass: filters.appliedClass,
    academicSession: filters.academicSession,
  })
  const { data } = await api.get(`${BASE_URL}/applications${query}`)
  return data
}

export const getApplicationById = async (id: string) => {
  const { data } = await api.get(`${BASE_URL}/applications/${id}`)
  return data
}

export interface UpdateDocumentStatusPayload {
  status: 'Verified' | 'Rejected'
  documentIndex?: number
  documentType?: string
}

export const updateDocumentStatus = async (id: string, payload: UpdateDocumentStatusPayload) => {
  const { data } = await api.patch(`${BASE_URL}/applications/${id}/documents`, payload)
  return data
}

export interface UpdatePaymentPayload {
  transactionId: string
}

export const updatePayment = async (id: string, payload: UpdatePaymentPayload) => {
  const { data } = await api.patch(`${BASE_URL}/applications/${id}/payment`, payload)
  return data
}

export interface ScheduleTestPayload {
  interviewDate: string | Date
}

export const scheduleTest = async (id: string, payload: ScheduleTestPayload) => {
  const { data } = await api.patch(`${BASE_URL}/tests/${id}/schedule`, payload)
  return data
}

export interface UpdateTestScorePayload {
  testScore: number
}

export const updateTestScore = async (id: string, payload: UpdateTestScorePayload) => {
  const { data } = await api.patch(`${BASE_URL}/tests/${id}/score`, payload)
  return data
}

export const getScheduledTests = async () => {
  const { data } = await api.get(`${BASE_URL}/tests`)
  return data
}

export interface UpdateOfferStatusPayload {
  action: 'Offer' | 'Waitlist' | 'Reject'
}

export const updateOfferStatus = async (id: string, payload: UpdateOfferStatusPayload) => {
  const { data } = await api.patch(`${BASE_URL}/offers/${id}/status`, payload)
  return data
}

export const confirmAdmission = async (id: string) => {
  const { data } = await api.post(`${BASE_URL}/offers/${id}/confirm`)
  return data
}