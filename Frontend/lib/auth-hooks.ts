/**
 * Protected Route Hook
 * Use this to protect routes that require authentication
 */

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "./auth-service"

/**
 * Hook to protect routes - redirects to login if not authenticated
 */
export function useProtectedRoute() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const isAuth = AuthService.isAuthenticated()
    setIsAuthenticated(isAuth)

    if (!isAuth) {
      router.push("/connexion")
    }
  }, [router])

  return isAuthenticated
}

/**
 * Hook to require admin role
 */
export function useRequireAdmin() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (!AuthService.isAuthenticated()) {
          router.push("/connexion")
          return
        }

        const user = await AuthService.getCurrentUser()
        const isAdminUser = user.rank === 6

        if (!isAdminUser) {
          router.push("/tableau-de-bord")
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push("/connexion")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [router])

  return { isAdmin, isLoading }
}

import { useAuth } from "@/context/AuthContext"

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  return useAuth()
}

/**
 * Logout hook
 */
export function useLogout() {
  const router = useRouter()

  const logout = () => {
    AuthService.logout()
    router.push("/connexion")
  }

  return logout
}
