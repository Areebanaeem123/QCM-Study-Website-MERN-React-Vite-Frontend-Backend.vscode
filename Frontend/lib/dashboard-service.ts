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
}
