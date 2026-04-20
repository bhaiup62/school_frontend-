// ═══════════════════════════════════════════════════════════════════════════════
// Global Error Utilities
// Centralized error handling for the entire frontend
// ═══════════════════════════════════════════════════════════════════════════════

import axios, { AxiosError } from 'axios'

// ═══════════════════════════════════════════════════════════════════════════════
// Error Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: string
}

export interface FormattedError {
  userMessage: string  // User-friendly message
  debugMessage: string // Technical details for debugging
  status?: number
  isNetworkError: boolean
  isAuthError: boolean
  isValidationError: boolean
  isServerError: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// User-Friendly Error Messages
// ═══════════════════════════════════════════════════════════════════════════════

const USER_FRIENDLY_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You don\'t have permission to perform this action.',
  404: 'The requested resource was not found.',
  408: 'Request timed out. Please check your connection and try again.',
  409: 'A conflict occurred. The data may have been modified by another user.',
  422: 'The provided data is invalid. Please review and correct it.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Oops! Something went wrong on our end. Please try again later.',
  502: 'Server is temporarily unavailable. Please try again shortly.',
  503: 'Service is currently unavailable. Please try again later.',
  504: 'Server took too long to respond. Please try again.',
}

const DEFAULT_ERROR_MESSAGE = 'Oops! Something went wrong. Please try again.'
const NETWORK_ERROR_MESSAGE = 'Unable to connect. Please check your internet connection.'

// ═══════════════════════════════════════════════════════════════════════════════
// Extract Error Message
// Type-safe extraction of error message from various error types
// ═══════════════════════════════════════════════════════════════════════════════

export function extractErrorMessage(error: unknown): string {
  // Axios error
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>
    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      DEFAULT_ERROR_MESSAGE
    )
  }

  // Standard Error
  if (error instanceof Error) {
    return error.message
  }

  // String error
  if (typeof error === 'string') {
    return error
  }

  // Object with message
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }

  return DEFAULT_ERROR_MESSAGE
}

// ═══════════════════════════════════════════════════════════════════════════════
// Format Error
// Converts any error into a structured FormattedError object
// ═══════════════════════════════════════════════════════════════════════════════

export function formatError(error: unknown): FormattedError {
  const debugMessage = extractErrorMessage(error)
  
  // Check if it's an Axios error
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const isNetworkError = !error.response && error.code === 'ERR_NETWORK'
    
    // Network connectivity error
    if (isNetworkError) {
      return {
        userMessage: NETWORK_ERROR_MESSAGE,
        debugMessage: `Network Error: ${error.message}`,
        isNetworkError: true,
        isAuthError: false,
        isValidationError: false,
        isServerError: false,
      }
    }

    // Request was canceled (e.g., AbortController)
    if (axios.isCancel(error)) {
      return {
        userMessage: 'Request was canceled.',
        debugMessage: 'Request canceled by AbortController',
        isNetworkError: false,
        isAuthError: false,
        isValidationError: false,
        isServerError: false,
      }
    }

    // HTTP error responses
    if (status) {
      return {
        userMessage: USER_FRIENDLY_MESSAGES[status] || DEFAULT_ERROR_MESSAGE,
        debugMessage: `HTTP ${status}: ${debugMessage}`,
        status,
        isNetworkError: false,
        isAuthError: status === 401 || status === 403,
        isValidationError: status === 400 || status === 422,
        isServerError: status >= 500,
      }
    }
  }

  // DOMException (e.g., AbortError)
  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      userMessage: 'Request was canceled.',
      debugMessage: 'AbortError: Request aborted',
      isNetworkError: false,
      isAuthError: false,
      isValidationError: false,
      isServerError: false,
    }
  }

  // Generic error
  return {
    userMessage: DEFAULT_ERROR_MESSAGE,
    debugMessage,
    isNetworkError: false,
    isAuthError: false,
    isValidationError: false,
    isServerError: false,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Get User-Friendly Message
// Quick helper to get just the user-facing message
// ═══════════════════════════════════════════════════════════════════════════════

export function getUserFriendlyMessage(error: unknown): string {
  return formatError(error).userMessage
}

// ═══════════════════════════════════════════════════════════════════════════════
// Is Abort Error
// Check if error is from AbortController
// ═══════════════════════════════════════════════════════════════════════════════

export function isAbortError(error: unknown): boolean {
  if (axios.isCancel(error)) return true
  if (error instanceof DOMException && error.name === 'AbortError') return true
  return false
}

// ═══════════════════════════════════════════════════════════════════════════════
// Should Show Error
// Returns false for errors that shouldn't be shown to user (like abort)
// ═══════════════════════════════════════════════════════════════════════════════

export function shouldShowError(error: unknown): boolean {
  return !isAbortError(error)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Log Error
// Centralized error logging (can be extended to send to error tracking service)
// ═══════════════════════════════════════════════════════════════════════════════

export function logError(error: unknown, context?: string): void {
  const formatted = formatError(error)
  
  console.group(`[Error]${context ? ` ${context}` : ''}`)
  console.error('User Message:', formatted.userMessage)
  console.error('Debug Message:', formatted.debugMessage)
  if (formatted.status) console.error('Status:', formatted.status)
  console.error('Original Error:', error)
  console.groupEnd()

  // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, { extra: { context } })
  // }
}
