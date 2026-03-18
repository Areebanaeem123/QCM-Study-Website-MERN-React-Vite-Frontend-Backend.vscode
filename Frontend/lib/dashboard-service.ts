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
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  type?: string;
  image_url?: string;
  mcqs?: any[];
  sessions?: any[];
  creator_name?: string;
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
  image_url?: string
  total_questions?: number
  total_purchases?: number
  average_rating?: number
  university_id?: string
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
   * Get a single pack by ID (Added for real data integration)
   */
  static async getPackById(id: string): Promise<StorePack> {
    try {
      return await ApiClient.get<StorePack>(`/packs/${id}`);
    } catch (error: any) {
      console.error(`Failed to fetch pack ${id}:`, error);
      throw new Error(error?.message || "Failed to fetch pack details");
    }
  }

  /**
   * Get available question banks for purchase
   */
  static async getAvailableQuestionBanks(): Promise<StoreQuestionBank[]> {
    try {
      return await ApiClient.get<StoreQuestionBank[]>("/question_banks/")
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

  /**
   * Get questions for a specific session (pack, QB, or mock exam)
   */
  static async getSessionQuestions(params: {
    pack_id?: string;
    question_bank_id?: string;
    mock_exam_id?: string;
  }): Promise<any[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params.pack_id) searchParams.append("pack_id", params.pack_id);
      if (params.question_bank_id) searchParams.append("question_bank_id", params.question_bank_id);
      if (params.mock_exam_id) searchParams.append("mock_exam_id", params.mock_exam_id);
      
      return await ApiClient.get<any[]>(`/session/questions?${searchParams.toString()}`);
    } catch (error: any) {
      console.error("Failed to fetch session questions:", error);
      throw new Error(error?.message || "Failed to fetch questions");
    }
  }

  /**
   * Submit quiz results after completion
   */
  static async submitQuizResult(data: {
    pack_id?: string;
    question_bank_id?: string;
    mock_exam_id?: string;
    score: number;
    total_questions: number;
    correct_answers: number;
    mode: string;
    time_taken: number;
    responses: {
      mcq_id: string;
      selected_option_id: string | null;
      is_correct: boolean;
    }[];
  }): Promise<any> {
    try {
      return await ApiClient.post("/results/submit", data);
    } catch (error: any) {
      console.error("Failed to submit quiz results:", error);
      throw new Error(error?.message || "Failed to submit results");
    }
  }

  static async checkoutBasket(data: { items: any[], accept_terms: boolean, payment_method: string }): Promise<any> {
    try {
      return await ApiClient.post("/basket/checkout", data)
    } catch (error: any) {
      console.error("Failed to checkout basket:", error)
      throw new Error(error?.message || "Failed to process purchase")
    }
  }
}
