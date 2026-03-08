import { ApiClient } from "./api-client"

export interface SessionItem {
  id?: string
  pack_id?: string
  mock_exam_id?: string
  question_bank_id?: string
}

export interface SessionResponse {
  id: string
  name: string
  start_date: string
  expiry_date: string
  created_by: string
  created_at: string
  session_items: SessionItem[]
}

export interface CreateSessionRequest {
  name: string
  start_date: string
  expiry_date: string
  session_items: SessionItem[]
}

export interface UpdateSessionRequest {
  name?: string
  start_date?: string
  expiry_date?: string
  session_items?: SessionItem[]
}

export class SessionService {
  /**
   * Get all sessions
   */
  static async getSessions(): Promise<SessionResponse[]> {
    try {
      return await ApiClient.get<SessionResponse[]>(`/session/`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch sessions")
    }
  }

  /**
   * Create a new session
   */
  static async createSession(data: CreateSessionRequest): Promise<SessionResponse> {
    try {
      return await ApiClient.post<SessionResponse>(`/session/`, data)
    } catch (error: any) {
      throw new Error(error.message || "Failed to create session")
    }
  }

  /**
   * Update a session
   */
  static async updateSession(sessionId: string, data: UpdateSessionRequest): Promise<SessionResponse> {
    try {
      return await ApiClient.put<SessionResponse>(`/session/${sessionId}`, data)
    } catch (error: any) {
      throw new Error(error.message || "Failed to update session")
    }
  }

  /**
   * Delete a session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      await ApiClient.delete(`/session/${sessionId}`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete session")
    }
  }
}
