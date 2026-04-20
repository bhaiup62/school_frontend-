// src/lib/axios.ts

import axios from 'axios'
import { logError } from './errorUtils'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// ── Request Interceptor ──────────────────────────────────
// Attach token to every request automatically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    logError(error, 'Request Interceptor')
    return Promise.reject(error)
  }
)

// ── Response Interceptor ─────────────────────────────────
// Handle errors globally — auto logout if token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log or handle abort errors
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    // Log all other errors
    logError(error, 'API Response')

    // Handle 401 globally — auto logout if token expired
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api