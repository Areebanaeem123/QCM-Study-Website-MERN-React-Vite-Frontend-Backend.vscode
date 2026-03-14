/**
 * Dashboard Service
 * Handles fetching admin dashboard statistics
 */

import { ApiClient } from "./api-client"

export interface DashboardStats {
  total_students: number
  total_packs_sold: number
  total_mcqs_created: number
  active_sessions: number
}

export interface RecentActivity {
  id: string
  user_name: string
  type: string
  timestamp: string
}

export interface DashboardSubject {
  id: string
  name: string
}

export interface PurchasedPack {
  id: string
  name: string
  type: string
  progress: number
  total_qcm: number
  completed_qcm: number
  subjects: DashboardSubject[]
}

export interface StudentDashboardStats {
  completed_mcqs: number
  average_score: number
  rank: number
  progression: number
  recent_activity: RecentActivity[]
  purchased_packs: PurchasedPack[]
  category_performance: { name: string; score: number; color: string }[]
}

export interface Ranking {
  name: string
  email: string
  score: number
  rank: number
}

export interface StorePack {
  id: string
  title: string
  description?: string
  price: number
  currency: string
}

export interface StoreQuestionBank {
  id: string
  title: string
  description?: string
  price: number
  currency: string
}

export interface StoreMockExam {
  id: string
  title: string
  description?: string
  price?: number
  currency?: string
}

export class DashboardService {
  /**
   * Get dashboard statistics
   * Only accessible by admin users (rank=6)
   */
  static async getStats(): Promise<DashboardStats> {
    try {
      const stats = await ApiClient.get<DashboardStats>("/dashboard/stats")
      return stats
    } catch (error: any) {
      console.error("Failed to fetch dashboard stats:", error)
      throw new Error(error?.message || "Failed to fetch dashboard statistics")
    }
  }

  /**
   * Get student dashboard statistics
   */
  static async getStudentStats(): Promise<StudentDashboardStats> {
    try {
      return await ApiClient.get<StudentDashboardStats>("/dashboard/student/stats")
    } catch (error: any) {
      console.error("Failed to fetch student dashboard stats:", error)
      throw new Error(error?.message || "Failed to fetch student statistics")
    }
  }

  /**
   * Get global or pack-specific student rankings
   */
  static async getRankings(packId?: string, mockExamId?: string): Promise<Ranking[]> {
    try {
      const params = new URLSearchParams()
      if (packId) params.append("pack_id", packId)
      if (mockExamId) params.append("mock_exam_id", mockExamId)
      
      const queryString = params.toString()
      const endpoint = queryString ? `/dashboard/rankings?${queryString}` : "/dashboard/rankings"
      
      return await ApiClient.get<Ranking[]>(endpoint)
    } catch (error: any) {
      console.error("Failed to fetch rankings:", error)
      throw new Error(error?.message || "Failed to fetch student rankings")
    }
  }

  /**
   * Get available packs for purchase
   */
  static async getAvailablePacks(): Promise<StorePack[]> {
    try {
      return await ApiClient.get<StorePack[]>("/packs/")
    } catch (error: any) {
      console.error("Failed to fetch available packs:", error)
      return []
    }
  }

  /**
   * Get available question banks for purchase
   */
  static async getAvailableQuestionBanks(): Promise<StoreQuestionBank[]> {
    try {
      return await ApiClient.get<StoreQuestionBank[]>("/question_bank_router/")
    } catch (error: any) {
      console.error("Failed to fetch available question banks:", error)
      return []
    }
  }

  /**
   * Get available mock exams for purchase
   */
  static async getAvailableMockExams(): Promise<StoreMockExam[]> {
    try {
      return await ApiClient.get<StoreMockExam[]>("/mock_exams_admin/")
    } catch (error: any) {
      console.error("Failed to fetch available mock exams:", error)
      return []
    }
  }
}
