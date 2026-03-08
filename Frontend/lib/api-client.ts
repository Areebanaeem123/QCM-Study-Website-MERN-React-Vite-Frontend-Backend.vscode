/**
 * API Client for communicating with FastAPI backend
 * Handles authentication tokens, request/response interception, and error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://127.0.0.1:8000/api/v1"

interface ApiResponse<T> {
  data?: T
  detail?: string
  message?: string
  error?: string
}

interface ApiError {
  status: number
  message: string
  detail?: string
}

export class ApiClient {
  // Public endpoints that don't require authentication
  static publicEndpoints = ["/auth/login", "/auth/register", "/auth/refresh"]

  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // Merge custom headers if provided
    if (options.headers && typeof options.headers === 'object') {
      const customHeaders = options.headers as Record<string, string>
      Object.assign(headers, customHeaders)
    }

    // Add authorization token if available (but NOT for public endpoints)
    const isPublicEndpoint = this.publicEndpoints.some(pub => endpoint.startsWith(pub))
    if (!isPublicEndpoint) {
      const token = this.getAccessToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    try {
      console.log(`[API] ${options.method || 'GET'} ${url}`, { headers, body: options.body })
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      // Handle unauthorized - but NOT for public endpoints (they have real 401 errors to show)
      if (response.status === 401) {
        const isPublicEndpoint = ApiClient.publicEndpoints.some(pub => endpoint.startsWith(pub))
        const refreshToken = this.getRefreshToken()
        
        if (!isPublicEndpoint && refreshToken) {
          // Only try to refresh for protected endpoints
          const newToken = await this.refreshAccessToken(refreshToken)
          if (newToken) {
            headers["Authorization"] = `Bearer ${newToken}`
            return this.request<T>(endpoint, {
              ...options,
              headers: {
                "Content-Type": "application/json",
                ...options.headers,
                ...headers,
              },
            })
          }
        }
        // Clear auth on token refresh failure or for public endpoints
        this.clearTokens()
        
        // For public endpoints, let the error propagate naturally
        if (!isPublicEndpoint) {
          throw new Error("Session expired. Please login again.")
        }
      }

      // Handle 204 No Content response (e.g., DELETE endpoints)
      if (response.status === 204) {
        return undefined as any
      }

      let data: any = {}
      try {
        const text = await response.text()
        console.log(`[API] Response (${response.status}): ${text.substring(0, 200)}`)
        if (text) {
          data = JSON.parse(text)
        }
      } catch (parseError) {
        console.error("Failed to parse response:", { 
          status: response.status, 
          url,
          parseError: parseError instanceof Error ? parseError.message : String(parseError)
        })
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Invalid response format`)
        }
      }

      if (!response.ok) {
        // Handle Pydantic validation errors (422)
        let errorMessage = "An error occurred"
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            errorMessage = data.detail.map((e: any) => e.msg || e.detail || JSON.stringify(e)).join(", ")
          } else {
            errorMessage = data.detail
          }
        } else if (data.message) {
          errorMessage = data.message
        } else if (data.error) {
          errorMessage = data.error
        }
        
        const errorObj = {
          status: response.status,
          message: errorMessage,
          detail: data.detail || data,
        } as ApiError
        console.error("API Error Response:", { status: response.status, url, errorObj, fullResponse: data })
        throw errorObj
      }

      return data as T
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`[API] Request Error for ${url}:`, {
        error: errorMsg,
        type: error instanceof Error ? error.name : typeof error,
        fullError: error,
      })
      if (error instanceof Error) {
        throw {
          status: 0,
          message: error.message,
        } as ApiError
      }
      // If it's already an ApiError or similar, throw it
      throw error
    }
  }

  static async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    })
  }

  static async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  static async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  static async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    })
  }

  // Token management
  static setAccessToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || "qcm_study_auth_token",
        token
      )
    }
  }

  static setRefreshToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || "qcm_study_refresh_token",
        token
      )
    }
  }

  static getAccessToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(
      process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || "qcm_study_auth_token"
    )
  }

  static getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(
      process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || "qcm_study_refresh_token"
    )
  }

  static clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(
        process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || "qcm_study_auth_token"
      )
      localStorage.removeItem(
        process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || "qcm_study_refresh_token"
      )
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  private static async refreshAccessToken(refreshToken: string): Promise<string | null> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        return null
      }

      const data = (await response.json()) as { access_token: string }
      this.setAccessToken(data.access_token)
      return data.access_token
    } catch {
      return null
    }
  }
}
