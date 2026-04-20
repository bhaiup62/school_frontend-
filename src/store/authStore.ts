// src/store/authStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id:              string
  admissionNumber: string
  role:            'student' | 'parent' | 'admin' | 'teacher' | 'receptionist' | 'principal'
}

interface AuthState {
  token:           string | null
  user:            User | null
  isAuthenticated: boolean
  setAuth:         (token: string, user: User) => void
  clearAuth:       () => void
}

const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

const removeCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token:           null,
      user:            null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        localStorage.setItem('token', token)
        setCookie('token', token)
        set({ token, user, isAuthenticated: true })
      },

      clearAuth: () => {
        localStorage.removeItem('token')
        removeCookie('token')
        set({ token: null, user: null, isAuthenticated: false })
      },
    }),
    { name: 'auth-storage' }
  )
)