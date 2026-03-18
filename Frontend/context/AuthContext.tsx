"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { AuthService, UserResponse } from "@/lib/auth-service"

interface AuthContextType {
  user: UserResponse | null
  isLoading: boolean
  error: string | null
  login: (payload: any) => Promise<void>
  register: (payload: any) => Promise<void>
  refreshUser: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      if (!AuthService.isAuthenticated()) {
        setUser(null)
        setIsLoading(false)
        return
      }

      const userData = await AuthService.getCurrentUser()
      setUser(userData)
      setError(null)
    } catch (err: any) {
      console.error("AuthContext fetchUser error:", err)
      // Only clear if it's a real 401/403 or if the token is obviously invalid
      if (err.status === 401 || err.status === 403) {
        setUser(null)
      }
      setError(err.message || "Failed to fetch user")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = async (payload: any) => {
    setIsLoading(true)
    try {
      await AuthService.login(payload)
      await fetchUser()
    } catch (err: any) {
      setIsLoading(false)
      throw err
    }
  }

  const register = async (payload: any) => {
    setIsLoading(true)
    try {
      await AuthService.register(payload)
      await fetchUser()
    } catch (err: any) {
      setIsLoading(false)
      throw err
    }
  }

  const refreshUser = async () => {
    setIsLoading(true)
    await fetchUser()
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
