import { apiClient } from "./api-client"

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface UserResponse {
  id: string
  name: string | null
  email: string
  rank: number
  created_at: string
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", {
    email,
    password,
  })
  apiClient.setTokens(response.access_token, response.refresh_token)
  return response
}

export async function register(
  name: string,
  email: string,
  password: string,
  rank: number = 1
): Promise<UserResponse> {
  return apiClient.post<UserResponse>("/auth/register", {
    name,
    email,
    password,
    rank,
  })
}

export async function getCurrentUser(): Promise<UserResponse> {
  return apiClient.get<UserResponse>("/auth/me")
}

export function logout() {
  apiClient.clearTokens()
  if (typeof window !== "undefined") {
    window.location.href = "/connexion"
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("access_token")
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}



