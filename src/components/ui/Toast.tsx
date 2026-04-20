'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════
// Toast Types
// ═══════════════════════════════════════════════════════════════════════════════

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  details?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (type: ToastType, message: string, details?: string, duration?: number) => void
  showSuccess: (message: string, details?: string) => void
  showError: (message: string, details?: string) => void
  showWarning: (message: string, details?: string) => void
  showInfo: (message: string, details?: string) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

// ═══════════════════════════════════════════════════════════════════════════════
// Toast Context
// ═══════════════════════════════════════════════════════════════════════════════

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// ═══════════════════════════════════════════════════════════════════════════════
// Toast Provider
// ═══════════════════════════════════════════════════════════════════════════════

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((
    type: ToastType,
    message: string,
    details?: string,
    duration: number = 5000
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
    
    // Log error details to console for debugging
    if (type === 'error' && details) {
      console.error('[Toast Error]:', message, '\nDetails:', details)
    }
    
    setToasts(prev => [...prev, { id, type, message, details, duration }])
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }, [removeToast])

  const showSuccess = useCallback((message: string, details?: string) => {
    showToast('success', message, details, 4000)
  }, [showToast])

  const showError = useCallback((message: string, details?: string) => {
    showToast('error', message, details, 6000)
  }, [showToast])

  const showWarning = useCallback((message: string, details?: string) => {
    showToast('warning', message, details, 5000)
  }, [showToast])

  const showInfo = useCallback((message: string, details?: string) => {
    showToast('info', message, details, 4000)
  }, [showToast])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{
      toasts,
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      removeToast,
      clearAll
    }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Toast Container & Individual Toast Component
// ═══════════════════════════════════════════════════════════════════════════════

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [showDetails, setShowDetails] = useState(false)

  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      detailsColor: 'text-green-700',
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
      detailsColor: 'text-red-700',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-800',
      detailsColor: 'text-amber-700',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      detailsColor: 'text-blue-700',
    },
  }[toast.type]

  const Icon = config.icon

  return (
    <div
      className={`
        ${config.bg} ${config.border} border rounded-xl p-4 shadow-lg
        pointer-events-auto animate-slide-in-right
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${config.textColor}`}>{toast.message}</p>
          {toast.details && (
            <>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className={`text-xs ${config.detailsColor} underline mt-1 hover:opacity-80`}
              >
                {showDetails ? 'Hide details' : 'Show details'}
              </button>
              {showDetails && (
                <p className={`text-xs ${config.detailsColor} mt-2 font-mono bg-white/50 p-2 rounded break-all`}>
                  {toast.details}
                </p>
              )}
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className={`${config.textColor} hover:opacity-70 transition flex-shrink-0`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CSS for animation (add to globals.css)
// ═══════════════════════════════════════════════════════════════════════════════
// @keyframes slide-in-right {
//   from { transform: translateX(100%); opacity: 0; }
//   to { transform: translateX(0); opacity: 1; }
// }
// .animate-slide-in-right {
//   animation: slide-in-right 0.3s ease-out;
// }
