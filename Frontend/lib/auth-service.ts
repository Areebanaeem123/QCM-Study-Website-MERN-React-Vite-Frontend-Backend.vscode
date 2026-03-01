/**
 * Authentication Service
 * Handles registration, login, and user authentication
 */

import { ApiClient } from "./api-client"

export interface RegisterPayload {
  email: string
  password: string
  confirm_password: string
  first_name?: string
  last_name?: string
  civility?: string
  date_of_birth?: string
  address?: string
  country?: string
  phone_number?: string
  diploma?: string
  former_school?: string
  university?: string
  accepted_terms: boolean
  is_robot_verified: boolean
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  id: string
  email: string
  first_name?: string
  last_name?: string
  access_token: string
  refresh_token: string
  rank?: number
  token_type?: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface UserResponse {
  id: string
  email: string
  first_name?: string
  last_name?: string
  rank: number
  email_verified?: string | null
  created_at: string
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await ApiClient.post<AuthResponse>("/auth/register", payload)
      
      // Store tokens
      if (response.access_token) {
        ApiClient.setAccessToken(response.access_token)
      }
      if (response.refresh_token) {
        ApiClient.setRefreshToken(response.refresh_token)
      }

      return response
    } catch (error: any) {
      throw {
        message: error.message || "Registration failed",
        status: error.status,
        detail: error.detail,
      }
    }
  }

  /**
   * Login with email and password
   */
  static async login(payload: LoginPayload): Promise<TokenResponse> {
    try {
      const response = await ApiClient.post<TokenResponse>("/auth/login", {
        email: payload.email,
        password: payload.password,
      })

      // Store tokens
      ApiClient.setAccessToken(response.access_token)
      if (response.refresh_token) {
        ApiClient.setRefreshToken(response.refresh_token)
      }

      return response
    } catch (error: any) {
      console.error("AuthService login error:", error)
      let errorMessage = "Login failed"
      
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message
        } else if (error.detail) {
          errorMessage = error.detail
        } else if (error.msg) {
          errorMessage = error.msg
        }
      }
      
      throw new Error(errorMessage)
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<UserResponse> {
    try {
      return await ApiClient.get<UserResponse>("/auth/me")
    } catch (error: any) {
      throw {
        message: error.message || "Failed to fetch user",
        status: error.status,
      }
    }
  }

  /**
   * Logout - clear tokens
   */
  static logout(): void {
    ApiClient.clearTokens()
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return ApiClient.isAuthenticated()
  }

  /**
   * Get stored access token
   */
  static getAccessToken(): string | null {
    return ApiClient.getAccessToken()
  }
}
