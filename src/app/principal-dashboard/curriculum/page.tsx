'use client'
import { useEffect, useReducer, useCallback, useRef } from 'react'
import PrincipalLayout from '@/components/principal/PrincipalLayout'
import { BookOpen, AlertTriangle, Edit2, ChevronLeft, ChevronRight, X, CheckCircle, TrendingUp, TrendingDown, Filter, RefreshCw } from 'lucide-react'
import * as principalService from '@/services/principalService'
import { AxiosError } from 'axios'

const STATUS_OPTIONS = ['on_track', 'behind_schedule', 'ahead', 'completed', 'not_started']

// ═══════════════════════════════════════════════════════════════════════════
// FIX #3: Dynamic Master Data Hook (replaces hardcoded CLASSES/SUBJECTS)
// In production, this fetches from /api/principal/master-data or similar
// ═══════════════════════════════════════════════════════════════════════════
interface MasterData {
  classes: string[]
  subjects: string[]
  loading: boolean
}

function useMasterData(): MasterData {
  // TODO: Replace with actual API call when backend endpoint exists
  // Example: const { data, isLoading } = useSWR('/api/principal/master-data', fetcher)
  // For now, return static data but architecture is ready for dynamic fetch
  return {
    classes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    subjects: ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science', 'Physics', 'Chemistry', 'Biology'],
    loading: false,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FIX #4: Consolidated State with useReducer (replaces 9 useState calls)
// ═══════════════════════════════════════════════════════════════════════════
interface TableState {
  loading: boolean
  saving: boolean
  progressList: principalService.SyllabusProgress[]
  summary: principalService.CurriculumSummary | null
  pagination: { page: number; pages: number; total: number }
  filters: { class: string; subject: string; status: string }
  selectedProgress: principalService.SyllabusProgress | null
  showModal: boolean
  reviewForm: { principalRemarks: string; status: string }
  message: { type: 'success' | 'error' | ''; text: string }
}

type TableAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_DATA'; payload: { progressList: principalService.SyllabusProgress[]; pagination: { pages: number; total: number } } }
  | { type: 'SET_SUMMARY'; payload: principalService.CurriculumSummary | null }
  | { type: 'SET_FILTER'; payload: Partial<TableState['filters']> }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'OPEN_MODAL'; payload: principalService.SyllabusProgress }
  | { type: 'CLOSE_MODAL' }
  | { type: 'UPDATE_REVIEW_FORM'; payload: Partial<TableState['reviewForm']> }
  | { type: 'SET_MESSAGE'; payload: TableState['message'] }
  | { type: 'OPTIMISTIC_UPDATE'; payload: { id: string; updates: Partial<principalService.SyllabusProgress> } }
  | { type: 'REVERT_OPTIMISTIC'; payload: { id: string; original: principalService.SyllabusProgress } }

const initialState: TableState = {
  loading: true,
  saving: false,
  progressList: [],
  summary: null,
  pagination: { page: 1, pages: 1, total: 0 },
  filters: { class: '', subject: '', status: '' },
  selectedProgress: null,
  showModal: false,
  reviewForm: { principalRemarks: '', status: '' },
  message: { type: '', text: '' },
}

function tableReducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_SAVING':
      return { ...state, saving: action.payload }
    case 'SET_DATA':
      return {
        ...state,
        progressList: action.payload.progressList,
        pagination: { ...state.pagination, pages: action.payload.pagination.pages, total: action.payload.pagination.total },
        loading: false,
      }
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload }
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.payload }, pagination: { ...state.pagination, page: 1 } }
    case 'SET_PAGE':
      return { ...state, pagination: { ...state.pagination, page: action.payload } }
    case 'OPEN_MODAL':
      return {
        ...state,
        selectedProgress: action.payload,
        reviewForm: { principalRemarks: action.payload.principalRemarks || '', status: action.payload.status },
        showModal: true,
      }
    case 'CLOSE_MODAL':
      return { ...state, showModal: false, selectedProgress: null }
    case 'UPDATE_REVIEW_FORM':
      return { ...state, reviewForm: { ...state.reviewForm, ...action.payload } }
    case 'SET_MESSAGE':
      return { ...state, message: action.payload }
    case 'OPTIMISTIC_UPDATE':
      return {
        ...state,
        progressList: state.progressList.map(p =>
          p._id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
        showModal: false,
        saving: false,
      }
    case 'REVERT_OPTIMISTIC':
      return {
        ...state,
        progressList: state.progressList.map(p =>
          p._id === action.payload.id ? action.payload.original : p
        ),
      }
    default:
      return state
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FIX #5: Typed Error Extraction (replaces catch(error: any))
// ═══════════════════════════════════════════════════════════════════════════
interface ApiErrorResponse {
  message?: string
  error?: string
}

function extractErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined
    return data?.message || data?.error || error.message || fallback
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600" />
      <BookOpen className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  </div>
)

export default function CurriculumPage() {
  const [state, dispatch] = useReducer(tableReducer, initialState)
  const { loading, saving, progressList, summary, pagination, filters, selectedProgress, showModal, reviewForm, message } = state

  // FIX #3: Dynamic master data
  const masterData = useMasterData()

  // FIX #1: AbortController ref for race condition prevention
  const abortControllerRef = useRef<AbortController | null>(null)

  // ═══════════════════════════════════════════════════════════════════════════
  // FIX #1: Data Loading with AbortController (prevents race conditions)
  // ═══════════════════════════════════════════════════════════════════════════
  const loadData = useCallback(async (signal?: AbortSignal) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const [progressRes, summaryRes] = await Promise.all([
        principalService.getCurriculumProgress({
          class: filters.class || undefined,
          subject: filters.subject || undefined,
          status: filters.status || undefined,
          page: pagination.page,
          limit: 15,
        }),
        principalService.getCurriculumSummary(),
      ])

      // Check if request was aborted before updating state
      if (signal?.aborted) return

      dispatch({
        type: 'SET_DATA',
        payload: {
          progressList: progressRes.data || [],
          pagination: { pages: progressRes.pagination?.pages || 1, total: progressRes.pagination?.total || 0 },
        },
      })
      dispatch({ type: 'SET_SUMMARY', payload: summaryRes.data || null })
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === 'AbortError') return
      if (signal?.aborted) return
      console.error('Error loading curriculum data:', error)
    }
  }, [filters.class, filters.subject, filters.status, pagination.page])

  // FIX #1: useEffect with AbortController
  useEffect(() => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new controller for this request
    const controller = new AbortController()
    abortControllerRef.current = controller

    loadData(controller.signal)

    // Cleanup on unmount or before next effect
    return () => {
      controller.abort()
    }
  }, [loadData])

  // ═══════════════════════════════════════════════════════════════════════════
  // FIX #2: Optimistic UI Update (instant feedback, background API call)
  // ═══════════════════════════════════════════════════════════════════════════
  const handleReview = useCallback(async () => {
    if (!selectedProgress) return

    // Capture original state for potential rollback
    const originalProgress = { ...selectedProgress }
    const optimisticUpdates: Partial<principalService.SyllabusProgress> = {
      principalRemarks: reviewForm.principalRemarks,
      status: reviewForm.status as principalService.SyllabusProgress['status'],
    }

    // Optimistically update UI immediately
    dispatch({ type: 'OPTIMISTIC_UPDATE', payload: { id: selectedProgress._id, updates: optimisticUpdates } })
    dispatch({ type: 'SET_MESSAGE', payload: { type: 'success', text: 'Progress reviewed successfully' } })

    // Perform API call in background
    try {
      await principalService.reviewCurriculumProgress(selectedProgress._id, reviewForm)
      // API succeeded - optimistic update was correct, no action needed
    } catch (error) {
      // API failed - revert optimistic update
      dispatch({ type: 'REVERT_OPTIMISTIC', payload: { id: selectedProgress._id, original: originalProgress } })
      dispatch({ type: 'SET_MESSAGE', payload: { type: 'error', text: extractErrorMessage(error, 'Failed to save review') } })
    }
  }, [selectedProgress, reviewForm])

  const openReviewModal = useCallback(async (progress: principalService.SyllabusProgress) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const res = await principalService.getCurriculumProgressDetail(progress._id)
      if (res.success) {
        dispatch({ type: 'OPEN_MODAL', payload: res.data })
      }
    } catch (error) {
      dispatch({
        type: 'SET_MESSAGE',
        payload: { type: 'error', text: extractErrorMessage(error, 'Failed to load progress detail') },
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' })
  }, [])

  const handleFilterChange = useCallback((key: keyof typeof filters, value: string) => {
    dispatch({ type: 'SET_FILTER', payload: { [key]: value } })
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    dispatch({ type: 'SET_PAGE', payload: newPage })
  }, [])

  const handleRefresh = useCallback(() => {
    // Cancel pending and reload
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller
    loadData(controller.signal)
  }, [loadData])

  const clearMessage = useCallback(() => {
    dispatch({ type: 'SET_MESSAGE', payload: { type: '', text: '' } })
  }, [])

  const getStatusColor = (status: string) => ({
    on_track: 'bg-green-100 text-green-700', behind_schedule: 'bg-red-100 text-red-700',
    ahead: 'bg-blue-100 text-blue-700', completed: 'bg-purple-100 text-purple-700',
    not_started: 'bg-gray-100 text-gray-700'
  }[status] || 'bg-gray-100 text-gray-700')

  const getProgressColor = (pct: number) => pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : pct >= 25 ? 'bg-orange-500' : 'bg-red-500'

  return (
    <PrincipalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <BookOpen className="w-7 h-7" />
                Curriculum & Syllabus Tracking
              </h2>
              <p className="text-indigo-100 mt-1">Monitor syllabus completion across all classes</p>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white self-start"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
            <button onClick={clearMessage} className="ml-auto hover:bg-white/50 rounded-lg p-1 transition"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{summary.avgCompletion?.toFixed(0) || 0}%</div>
                  <div className="text-sm text-slate-500">Avg Completion</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{summary.onTrack || 0}</div>
                  <div className="text-sm text-slate-500">On Track</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{summary.behindSchedule || 0}</div>
                  <div className="text-sm text-slate-500">Behind Schedule</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{summary.completed || 0}</div>
                  <div className="text-sm text-slate-500">Completed</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lagging Classes Alert */}
        {summary?.laggingClasses && summary.laggingClasses.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2 text-lg">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shadow">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              Lagging Classes (Need Attention)
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {summary.laggingClasses.slice(0, 6).map(item => (
                <div key={item._id} className="bg-white rounded-xl p-4 border border-red-100 shadow-sm">
                  <div className="font-semibold text-slate-800">Class {item.class}-{item.section}</div>
                  <div className="text-sm text-slate-600">{item.subject}</div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-2.5 bg-red-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${getProgressColor(item.completionPercentage)}`} style={{ width: `${item.completionPercentage}%` }} />
                    </div>
                    <span className="text-sm font-bold text-red-700">{item.completionPercentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Filter className="w-5 h-5" />
              <span className="font-medium text-sm">Filters:</span>
            </div>
            <select 
              value={filters.class} 
              onChange={e => handleFilterChange('class', e.target.value)} 
              disabled={masterData.loading}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:opacity-50"
            >
              <option value="">All Classes</option>
              {masterData.classes.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
            <select 
              value={filters.subject} 
              onChange={e => handleFilterChange('subject', e.target.value)} 
              disabled={masterData.loading}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:opacity-50"
            >
              <option value="">All Subjects</option>
              {masterData.subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              value={filters.status} 
              onChange={e => handleFilterChange('status', e.target.value)} 
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        {/* Progress Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <LoadingSpinner />
          ) : progressList.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <BookOpen className="w-16 h-16 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No curriculum data found</p>
              <p className="text-sm mt-1">Adjust filters to see results</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-white">Class</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Subject</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Teacher</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Progress</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Status</th>
                    <th className="px-4 py-3 text-center font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {progressList.map(progress => (
                    <tr key={progress._id} className="hover:bg-indigo-50/30 transition">
                      <td className="px-4 py-3 font-semibold text-slate-800">Class {progress.class}-{progress.section}</td>
                      <td className="px-4 py-3 text-slate-600">{progress.subject}</td>
                      <td className="px-4 py-3 text-slate-600">{progress.teacher?.firstName} {progress.teacher?.lastName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[100px] h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${getProgressColor(progress.completionPercentage)}`} style={{ width: `${progress.completionPercentage}%` }} />
                          </div>
                          <span className="text-sm font-bold text-slate-700">{progress.completionPercentage}%</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{progress.completedChapters}/{progress.totalChapters} chapters</div>
                      </td>
                      <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(progress.status || '')}`}>{(progress.status || 'unknown').replace('_', ' ').toUpperCase()}</span></td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => openReviewModal(progress)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-sm text-slate-600">Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handlePageChange(pagination.page - 1)} 
                  disabled={pagination.page === 1} 
                  className="p-2 rounded-lg border border-slate-200 hover:bg-white hover:border-indigo-300 disabled:opacity-50 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handlePageChange(pagination.page + 1)} 
                  disabled={pagination.page === pagination.pages} 
                  className="p-2 rounded-lg border border-slate-200 hover:bg-white hover:border-indigo-300 disabled:opacity-50 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Review Modal */}
        {showModal && selectedProgress && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5" />
                  Review Curriculum Progress
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-white/20 rounded-lg text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Class:</span>
                      <span className="font-semibold text-slate-800">{selectedProgress.class}-{selectedProgress.section}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Subject:</span>
                      <span className="font-semibold text-slate-800">{selectedProgress.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Teacher:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedProgress.teacher
                          ? `${selectedProgress.teacher.firstName} ${selectedProgress.teacher.lastName}`
                          : 'Not Assigned'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Progress:</span>
                      <span className="font-semibold text-slate-800">{selectedProgress.completionPercentage}%</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm font-medium text-slate-600 mb-2">Chapters ({selectedProgress.completedChapters}/{selectedProgress.totalChapters})</div>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 bg-white rounded-lg p-3 border border-indigo-100">
                      {selectedProgress.chapters?.map((ch, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className={`w-2.5 h-2.5 rounded-full ${ch.status === 'completed' ? 'bg-green-500' : ch.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                          <span className="text-slate-700">{ch.chapterNumber}. {ch.chapterName}</span>
                          <span className={`text-xs ml-auto px-2 py-0.5 rounded-full ${ch.status === 'completed' ? 'bg-green-100 text-green-700' : ch.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                            {ch.status.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Status</label>
                    <select 
                      value={reviewForm.status} 
                      onChange={e => dispatch({ type: 'UPDATE_REVIEW_FORM', payload: { status: e.target.value } })} 
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Principal Remarks</label>
                    <textarea 
                      value={reviewForm.principalRemarks} 
                      onChange={e => dispatch({ type: 'UPDATE_REVIEW_FORM', payload: { principalRemarks: e.target.value } })} 
                      rows={4} 
                      placeholder="Your remarks on this curriculum progress..." 
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" 
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                <button onClick={closeModal} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-white transition">Cancel</button>
                <button onClick={handleReview} disabled={saving} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PrincipalLayout>
  )
}
