"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { AuthService, UserResponse } from "@/lib/auth-service"

interface AuthContextType {
  user: UserResponse | null
  isLoading: boolean
  error: string | null
  refreshUser: () => Promise<void>
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
      setError(err.message || "Failed to fetch user")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const refreshUser = async () => {
    setIsLoading(true)
    await fetchUser()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, error, refreshUser }}>
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
