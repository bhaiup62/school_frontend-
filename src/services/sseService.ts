// src/services/sseService.ts
// Server-Sent Events service for real-time updates

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Helper to get token from cookie (works without js-cookie)
function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|; )token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

export type SSEEventType = 'attendance_updated' | 'result_updated' | 'notice_posted' | 'remark_updated' | 'connected'

export interface AttendanceUpdateEvent {
  admissionNumber: string
  month: number
  year: number
  date: string
  status: 'present' | 'absent' | 'late' | 'holiday'
  remarks?: string
  summary: {
    totalDays: number
    presentDays: number
    absentDays: number
    percentage: number
  }
  markedBy: string
}

export interface ResultUpdateEvent {
  admissionNumber: string
  examName: string
  examType: string
  session: string
  percentage: number
  result: 'pass' | 'fail'
  totalMarks: number
  totalObtained: number
  rank?: number | null
  subjects: Array<{
    subject: string
    theoryMarks: number
    practicalMarks?: number
    totalMarks: number
    grade: string
  }>
  enteredBy: string
}

export interface NoticePostedEvent {
  _id: string
  title: string
  tag: string
  message?: string
  content?: string
  targetClass: string
  targetSection: string
  postedBy: string
  teacherId: string
  date: string
  createdAt: string
}

export interface RemarkUpdateEvent {
  admissionNumber: string
  remark: string
  addedBy: string
  date: string
}

export interface SSEEventHandlers {
  onAttendanceUpdate?: (data: AttendanceUpdateEvent) => void
  onResultUpdate?: (data: ResultUpdateEvent) => void
  onNoticePosted?: (data: NoticePostedEvent) => void
  onRemarkUpdate?: (data: RemarkUpdateEvent) => void
  onConnected?: () => void
  onError?: (error: Event) => void
}

class SSEService {
  private eventSource: EventSource | null = null
  private handlers: SSEEventHandlers = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000

  connect(handlers: SSEEventHandlers): void {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      return
    }

    // Don't connect if already connected
    if (this.eventSource?.readyState === EventSource.OPEN) {
      console.log('[SSE] Already connected')
      return
    }

    // Check if we have a token
    const token = getTokenFromCookie()
    if (!token) {
      console.log('[SSE] No auth token, skipping connection')
      return
    }

    this.handlers = handlers

    try {
      // EventSource doesn't support custom headers, so we pass token as query param
      this.eventSource = new EventSource(`${API_BASE}/events?token=${token}`)

      this.eventSource.onopen = () => {
        console.log('[SSE] Connection established')
        this.reconnectAttempts = 0
      }

      this.eventSource.onerror = (error) => {
        console.error('[SSE] Connection error:', error)
        this.handlers.onError?.(error)
        
        // Try to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          console.log(`[SSE] Reconnecting... attempt ${this.reconnectAttempts}`)
          setTimeout(() => this.connect(this.handlers), this.reconnectDelay)
        }
      }

      // Listen for specific events
      this.eventSource.addEventListener('connected', (event) => {
        console.log('[SSE] Server confirmed connection')
        this.handlers.onConnected?.()
      })

      this.eventSource.addEventListener('attendance_updated', (event) => {
        try {
          const data = JSON.parse(event.data) as AttendanceUpdateEvent
          console.log('[SSE] Attendance updated:', data.admissionNumber)
          this.handlers.onAttendanceUpdate?.(data)
        } catch (e) {
          console.error('[SSE] Failed to parse attendance event:', e)
        }
      })

      this.eventSource.addEventListener('result_updated', (event) => {
        try {
          const data = JSON.parse(event.data) as ResultUpdateEvent
          console.log('[SSE] Result updated:', data.admissionNumber, data.examName)
          this.handlers.onResultUpdate?.(data)
        } catch (e) {
          console.error('[SSE] Failed to parse result event:', e)
        }
      })

      this.eventSource.addEventListener('notice_posted', (event) => {
        try {
          const data = JSON.parse(event.data) as NoticePostedEvent
          console.log('[SSE] Notice posted:', data.title)
          this.handlers.onNoticePosted?.(data)
        } catch (e) {
          console.error('[SSE] Failed to parse notice event:', e)
        }
      })

      this.eventSource.addEventListener('remark_updated', (event) => {
        try {
          const data = JSON.parse(event.data) as RemarkUpdateEvent
          console.log('[SSE] Remark updated:', data.admissionNumber)
          this.handlers.onRemarkUpdate?.(data)
        } catch (e) {
          console.error('[SSE] Failed to parse remark event:', e)
        }
      })

      // Also handle generic message event for heartbeat
      this.eventSource.onmessage = (event) => {
        // Heartbeat or untyped messages
        if (event.data === ':heartbeat') {
          console.log('[SSE] Heartbeat received')
        }
      }

    } catch (error) {
      console.error('[SSE] Failed to create EventSource:', error)
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      console.log('[SSE] Disconnecting...')
      this.eventSource.close()
      this.eventSource = null
    }
    this.handlers = {}
    this.reconnectAttempts = 0
  }

  isConnected(): boolean {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      return false
    }
    return this.eventSource?.readyState === EventSource.OPEN
  }
}

// Singleton instance
export const sseService = new SSEService()

// React hook for SSE connection
import { useEffect, useRef } from 'react'

export function useSSE(handlers: SSEEventHandlers, enabled: boolean = true) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!enabled) return

    // Wrap handlers to use ref (prevents reconnect on handler change)
    const wrappedHandlers: SSEEventHandlers = {
      onAttendanceUpdate: (data) => handlersRef.current.onAttendanceUpdate?.(data),
      onResultUpdate: (data) => handlersRef.current.onResultUpdate?.(data),
      onNoticePosted: (data) => handlersRef.current.onNoticePosted?.(data),
      onRemarkUpdate: (data) => handlersRef.current.onRemarkUpdate?.(data),
      onConnected: () => handlersRef.current.onConnected?.(),
      onError: (e) => handlersRef.current.onError?.(e),
    }

    sseService.connect(wrappedHandlers)

    return () => {
      sseService.disconnect()
    }
  }, [enabled])

  return {
    isConnected: sseService.isConnected(),
    disconnect: () => sseService.disconnect(),
  }
}
