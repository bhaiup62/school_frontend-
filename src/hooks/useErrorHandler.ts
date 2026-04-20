'use client'

import { useCallback } from 'react'
import { useToast } from '@/components/ui/Toast'
import { formatError, isAbortError, shouldShowError } from '@/lib/errorUtils'

// ═══════════════════════════════════════════════════════════════════════════════
// useErrorHandler Hook
// Provides a consistent way to handle errors across components
// ═══════════════════════════════════════════════════════════════════════════════

export function useErrorHandler() {
  const { showError, showWarning, showSuccess, showInfo } = useToast()

  /**
   * Handle any error with user-friendly toast
   * Automatically formats error and shows appropriate message
   */
  const handleError = useCallback((error: unknown, context?: string) => {
    // Skip abort errors (from cancelled requests)
    if (!shouldShowError(error)) return

    const formatted = formatError(error)
    
    // Log for debugging
    console.error(`[${context || 'Error'}]`, formatted.debugMessage)

    // Show user-friendly message with debug info available
    showError(formatted.userMessage, formatted.debugMessage)
  }, [showError])

  /**
   * Wrap an async function with automatic error handling
   * Returns a new function that catches errors automatically
   */
  const withErrorHandling = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: string
  ) => {
    return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | undefined> => {
      try {
        return await fn(...args)
      } catch (error) {
        handleError(error, context)
        return undefined
      }
    }
  }, [handleError])

  /**
   * Execute async operation with loading state management
   */
  const executeWithToast = useCallback(async <T,>(
    operation: () => Promise<T>,
    options?: {
      loadingMessage?: string
      successMessage?: string
      errorContext?: string
    }
  ): Promise<T | undefined> => {
    try {
      const result = await operation()
      if (options?.successMessage) {
        showSuccess(options.successMessage)
      }
      return result
    } catch (error) {
      if (!shouldShowError(error)) return undefined
      
      const formatted = formatError(error)
      showError(formatted.userMessage, formatted.debugMessage)
      return undefined
    }
  }, [showSuccess, showError])

  return {
    handleError,
    withErrorHandling,
    executeWithToast,
    showError,
    showWarning,
    showSuccess,
    showInfo,
    // Re-export utilities
    isAbortError,
    shouldShowError,
    formatError,
  }
}

export default useErrorHandler
