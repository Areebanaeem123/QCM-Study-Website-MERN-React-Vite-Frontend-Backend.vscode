/**
 * Admin Management Service
 * Handles admin operations for users, MCQs, packs, etc.
 */

import { ApiClient } from "./api-client"

export interface User {
  id: string
  name: string
  email: string
  role: number
  role_name: string
  packs: number
  is_blocked: boolean
  created_at: string
  university?: string
  academic_year?: string
}

export interface UsersListResponse {
  total: number
  skip: number
  limit: number
  items: User[]
}

export interface PurchasedItem {
  purchase_id: string
  pack_id: string
  title: string
  type: string
  gifted: boolean
  purchase_date: string
}

export interface UserDetail extends User {
  civility?: string
  date_of_birth?: string
  country?: string
  phone_number?: string
  address?: string
  last_login?: string
  registration_ip?: string
  purchased_items?: PurchasedItem[]
}

export interface GrantPackResponse {
  id: string
  user_id: string
  pack_id: string
  message: string
}

export interface ChangeRoleResponse {
  id: string
  role: number
  role_name: string
  message: string
}

export interface ChangeStatusResponse {
  id: string
  is_blocked: boolean
  message: string
}

export interface Pack {
  id: string
  name: string
  price: number
  currency: string
  description?: string
  is_active?: boolean
}

export interface University {
  id: string
  name: string
  is_displayed: boolean
  created_at: string
  updated_at?: string
  created_by: string
  creator_name?: string
}

export interface UniversitiesListResponse {
  items: University[]
  total?: number
}

export interface CreateUniversityRequest {
  name: string
  is_displayed: boolean
}

export interface UpdateUniversityRequest {
  name?: string
  is_displayed?: boolean
}

export interface AdminFeedback {
  review_id: string
  student_id: string
  student_name: string
  item_id: string
  item_title: string
  rating: number
  comment: string
  created_at: string
  type: "Pack" | "Examen Blanc"
}

export interface Subject {
  id: string
  name: string
  university_id: string
  created_at: string
  created_by: string
  creator_name?: string
}

export interface SubjectsListResponse {
  items: Subject[]
  total?: number
}

export interface CreateSubjectRequest {
  name: string
  university_id: string
}

export interface UpdateSubjectRequest {
  name?: string
  university_id?: string
}

export interface Lesson {
  id: string
  name: string
  university_id: string
  subject_id: string
  created_at: string
  created_by: string
  creator_name?: string
}

export interface LessonsListResponse {
  items: Lesson[]
  total?: number
}

export interface CreateLessonRequest {
  name: string
  university_id: string
  subject_id: string
}

export interface UpdateLessonRequest {
  name?: string
}

export interface MCQOption {
  id?: string
  option_text: string
  is_correct: boolean
  explanation?: string
}

export interface MCQ {
  id: string
  university_id: string
  subject_id: string
  lesson_id: string
  question_type_id: string
  title: string
  question_text: string
  status: "draft" | "pending" | "approved" | "rejected"
  created_at: string
  created_by: string
  creator_name?: string
  university_name?: string
  subject_name?: string
  lesson_name?: string
  question_type_name?: string
  options: MCQOption[]
}

export interface QuestionType {
  id: string
  name: string
  number_of_options: number
  answer_mode: "single_correct" | "true_false_per_option"
  partial_credit: number | null
  created_at: string
  created_by: string
  creator_name?: string
}

export interface CreateQuestionTypeRequest {
  name: string
  number_of_options: number
  answer_mode: "single_correct" | "true_false_per_option"
  partial_credit?: number | null
}

export interface UpdateQuestionTypeRequest {
  name?: string
  number_of_options?: number
  answer_mode?: "single_correct" | "true_false_per_option"
  partial_credit?: number | null
}

export interface CreateMCQRequest {
  university_id: string
  subject_id: string
  lesson_id: string
  question_type_id: string
  title: string
  question_text: string
  options: MCQOption[]
  status?: "draft" | "pending" | "approved"
}

export interface UpdateMCQRequest {
  title?: string
  question_text?: string
  question_type_id?: string
  status?: string
  options?: MCQOption[]
}

export interface DashboardStats {
  total_students: number
  total_packs_sold: number
  total_mcqs_created: number
  active_sessions: number
  total_online_users: number
  sales_over_time: { date: string; count: number }[]
}

export interface StudentRanking {
  name: string
  email: string
  score: number
  rank: number
}

export interface MCQsListResponse {
  total: number
  skip: number
  limit: number
  items: MCQ[]
}

export interface Activity {
  id: string
  user_name: string
  type: string
  timestamp: string
}

export interface PageOut {
  id: number
  title: string
  slug: string
  content: string
  created_at?: string
  updated_at?: string
}

export interface SliderOut {
  id: number
  title: string
  subtitle?: string
  image_url: string
  button_text?: string
  button_link?: string
  is_active: boolean
}

export interface MCQApprovalResponse {
  id: string
  reviewer_id: string
  reviewer_name?: string
  decision: "approved" | "rejected"
  comment?: string
  reviewed_at: string
}

export interface MCQWithApprovalsResponse extends MCQ {
  approvals: MCQApprovalResponse[]
}

// PackResponse is moved below to avoid duplication

export interface PacksListResponse {
  items: PackResponse[]
  total: number
}

export interface PendingMCQsListResponse {
  total: number
  skip: number
  limit: number
  items: MCQWithApprovalsResponse[]
}

export interface MCQApprovalDecision {
  decision: "approved" | "rejected"
  comment?: string
}

export interface PackResponse {
  id: string
  title: string
  description?: string
  type: "pack" | "mock_exam"
  price: number
  currency: "CHF" | "GBP" | "USD" | "EUR" | "TND"
  start_datetime: string
  expiry_datetime: string
  display_before_start: boolean
  time_limit_minutes: number | null
  is_published: boolean
  university_id: string
  university_name?: string
  image_url?: string
  created_by: string
  creator_name?: string
  created_at: string
  updated_at?: string
  sales_count?: number
  average_rating?: number
  mcqs?: MCQ[]
  academic_sessions?: string[]
}

export interface PackPurchaser {
  student_id: string
  first_name: string
  last_name: string
  email: string
  purchased_at: string
  gifted: boolean
}

export interface PackReview {
  student_name: string
  rating: number
  comment?: string
  created_at: string
}

export interface CreatePackRequest {
  title: string
  description?: string
  type: "pack" | "mock_exam"
  price: number
  currency: "CHF" | "GBP" | "USD" | "EUR" | "TND"
  start_datetime: string
  expiry_datetime: string
  display_before_start: boolean
  time_limit_minutes: number | null
  is_published: boolean
  university_id: string
  image_url?: string
  mcq_ids: string[]
}

export interface UpdatePackRequest {
  title?: string
  description?: string
  type?: "pack" | "mock_exam"
  price?: number
  currency?: "CHF" | "GBP" | "USD" | "EUR" | "TND"
  start_datetime?: string
  expiry_datetime?: string
  display_before_start?: boolean
  time_limit_minutes?: number | null
  is_published?: boolean
  mcq_ids?: string[]
}

export interface PacksListResponse {
  total: number
  skip: number
  limit: number
  items: PackResponse[]
}

export interface QuestionBankResponse {
  id: string
  title: string
  description?: string
  price: number
  currency: "CHF" | "GBP" | "USD" | "EUR" | "TND"
  start_datetime: string
  expiry_datetime: string
  display_before_start: boolean
  is_published: boolean
  university_id: string
  university_name?: string
  image_url?: string
  created_by: string
  creator_name?: string
  created_at: string
  updated_at?: string
  mcqs?: MCQ[]
  student_count?: number
  review_count?: number
  average_rating?: number | null
  academic_sessions?: string[]
}

export interface CreateQuestionBankRequest {
  title: string
  description?: string
  price: number
  currency: "CHF" | "GBP" | "USD" | "EUR" | "TND"
  start_datetime: string
  expiry_datetime: string
  display_before_start: boolean
  is_published: boolean
  university_id: string
  image_url?: string
  mcq_ids: string[]
}

export interface UpdateQuestionBankRequest {
  title?: string
  description?: string
  price?: number
  currency?: "CHF" | "GBP" | "USD" | "EUR" | "TND"
  start_datetime?: string
  expiry_datetime?: string
  display_before_start?: boolean
  is_published?: boolean
  mcq_ids?: string[]
}

export interface QuestionBanksListResponse {
  total: number
  skip: number
  limit: number
  items: QuestionBankResponse[]
}

export class AdminService {
  /**
   * Get list of users with search and pagination
   */
  static async getUsers(
    search: string = "",
    sortBy: string = "alphabetical",
    skip: number = 0,
    limit: number = 20
  ): Promise<UsersListResponse> {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      params.append("sort_by", sortBy)
      params.append("skip", skip.toString())
      params.append("limit", limit.toString())

      return await ApiClient.get<UsersListResponse>(
        `/admin/users?${params.toString()}`
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch users")
    }
  }

  /**
   * Get user details
   */
  static async getUserDetails(userId: string): Promise<UserDetail> {
    try {
      return await ApiClient.get<UserDetail>(`/admin/users/${userId}`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch user details")
    }
  }

  /**
   * Change user role
   * Valid roles: 1=Student, 2=Writer, 3=Content Manager, 6=Admin
   */
  static async changeUserRole(
    userId: string,
    role: number
  ): Promise<ChangeRoleResponse> {
    try {
      return await ApiClient.put<ChangeRoleResponse>(
        `/admin/users/${userId}/role`,
        { role }
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to change user role")
    }
  }

  /**
   * Grant pack access to user
   */
  static async grantPackToUser(
    userId: string,
    packId: string
  ): Promise<GrantPackResponse> {
    try {
      return await ApiClient.post<GrantPackResponse>(
        `/admin/users/${userId}/grant-pack/${packId}`
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to grant pack access")
    }
  }

  /**
   * Revoke pack access from user
   */
  static async revokePackFromUser(
    userId: string,
    packId: string
  ): Promise<void> {
    try {
      await ApiClient.delete(
        `/admin/users/${userId}/revoke-pack/${packId}`
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to revoke pack access")
    }
  }

  /**
   * Email all students
   */
  static async emailAllStudents(
    subject: string,
    body: string
  ): Promise<{ message: string }> {
    try {
      return await ApiClient.post<{ message: string }>(
        `/admin/users/email-all`,
        { subject, body }
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to dispatch emails")
    }
  }

  /**
   * Block or unblock user
   */
  static async changeUserStatus(
    userId: string,
    isBlocked: boolean
  ): Promise<ChangeStatusResponse> {
    try {
      return await ApiClient.put<ChangeStatusResponse>(
        `/admin/users/${userId}/status`,
        { is_blocked: isBlocked }
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to change user status")
    }
  }


  /**
   * Get list of all universities
   */
  static async getUniversities(): Promise<University[]> {
    try {
      const response = await ApiClient.get<University[]>(`/admin/universities`)
      return Array.isArray(response) ? response : []
    } catch (error: any) {
      console.error("Failed to fetch universities in AdminService:", {
        message: error?.message,
        status: error?.status,
        error
      })
      throw new Error(error.message || "Échec du chargement des universités")
    }
  }

  /**
   * Create a new university
   */
  static async createUniversity(
    data: CreateUniversityRequest
  ): Promise<University> {
    try {
      return await ApiClient.post<University>(`/admin/universities`, data)
    } catch (error: any) {
      throw new Error(error.message || "Échec de la création de l'université")
    }
  }

  /**
   * Update a university
   */
  static async updateUniversity(
    universityId: string,
    data: UpdateUniversityRequest
  ): Promise<University> {
    try {
      return await ApiClient.put<University>(
        `/admin/universities/${universityId}`,
        data
      )
    } catch (error: any) {
      throw new Error(error.message || "Échec de la mise à jour de l'université")
    }
  }

  /**
   * Delete a university
   */
  static async deleteUniversity(universityId: string): Promise<void> {
    try {
      await ApiClient.delete(`/admin/universities/${universityId}`)
    } catch (error: any) {
      throw new Error(error.message || "Échec de la suppression de l'université")
    }
  }

  /**
   * Get list of all subjects
   */
  static async getSubjects(): Promise<Subject[]> {
    try {
      return await ApiClient.get<Subject[]>(`/admin/subjects`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to load subjects")
    }
  }

  /**
   * Get subjects filtered by university
   */
  static async getSubjectsByUniversity(
    universityId: string
  ): Promise<SubjectsListResponse> {
    try {
      const response = await ApiClient.get<Subject[]>(
        `/admin/subjects?university_id=${universityId}`
      )
      return { items: response, total: response.length }
    } catch (error: any) {
      throw new Error(error.message || "Failed to load subjects")
    }
  }

  /**
   * Create a new subject
   */
  static async createSubject(
    data: CreateSubjectRequest
  ): Promise<Subject> {
    try {
      return await ApiClient.post<Subject>(`/admin/subjects`, data)
    } catch (error: any) {
      throw new Error(error.message || "Failed to create subject")
    }
  }

  /**
   * Update a subject
   */
  static async updateSubject(
    subjectId: string,
    data: UpdateSubjectRequest
  ): Promise<Subject> {
    try {
      return await ApiClient.put<Subject>(
        `/admin/subjects/${subjectId}`,
        data
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to update subject")
    }
  }

  /**
   * Delete a subject
   */
  static async deleteSubject(subjectId: string): Promise<void> {
    try {
      await ApiClient.delete(`/admin/subjects/${subjectId}`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete subject")
    }
  }

  /**
   * Get list of all lessons
   */
  static async getLessons(): Promise<Lesson[]> {
    try {
      return await ApiClient.get<Lesson[]>(`/admin/lessons`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to load lessons")
    }
  }

  /**
   * Get lessons filtered by subject
   */
  static async getLessonsBySubject(
    subjectId: string
  ): Promise<LessonsListResponse> {
    try {
      const response = await ApiClient.get<Lesson[]>(
        `/admin/lessons?subject_id=${subjectId}`
      )
      return { items: response, total: response.length }
    } catch (error: any) {
      throw new Error(error.message || "Failed to load lessons")
    }
  }

  /**
   * Create a new lesson
   */
  static async createLesson(
    data: CreateLessonRequest
  ): Promise<Lesson> {
    try {
      return await ApiClient.post<Lesson>(`/admin/lessons`, data)
    } catch (error: any) {
      throw new Error(error.message || "Failed to create lesson")
    }
  }

  /**
   * Update a lesson
   */
  static async updateLesson(
    lessonId: string,
    data: UpdateLessonRequest
  ): Promise<Lesson> {
    try {
      return await ApiClient.put<Lesson>(
        `/admin/lessons/${lessonId}`,
        data
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to update lesson")
    }
  }

  /**
   * Delete a lesson
   */
  static async deleteLesson(lessonId: string): Promise<void> {
    try {
      await ApiClient.delete(`/admin/lessons/${lessonId}`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete lesson")
    }
  }

  /**
   * Get MCQs filtered by lesson
   */
  static async getMCQsByLesson(
    lessonId: string,
    skip: number = 0,
    limit: number = 100
  ): Promise<MCQsListResponse> {
    return this.getMCQs(undefined, undefined, lessonId, undefined, skip, limit)
  }

  /**
   * Get list of all question types
   */
  static async getQuestionTypes(): Promise<QuestionType[]> {
    try {
      return await ApiClient.get<QuestionType[]>(`/admin/question_types`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to load question types")
    }
  }

  /**
   * Create a new question type
   */
  static async createQuestionType(
    data: CreateQuestionTypeRequest
  ): Promise<QuestionType> {
    try {
      return await ApiClient.post<QuestionType>(`/admin/question_types`, data)
    } catch (error: any) {
      throw new Error(error.message || "Failed to create question type")
    }
  }

  /**
   * Update a question type
   */
  static async updateQuestionType(
    id: string,
    data: UpdateQuestionTypeRequest
  ): Promise<QuestionType> {
    try {
      return await ApiClient.put<QuestionType>(
        `/admin/question_types/${id}`,
        data
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to update question type")
    }
  }

  /**
   * Delete a question type
   */
  static async deleteQuestionType(id: string): Promise<void> {
    try {
      await ApiClient.delete(`/admin/question_types/${id}`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete question type")
    }
  }

  /**
   * Get list of all MCQs with optional filtering and pagination
   * Searches in title and question content
   */
  static async getMCQs(
    universityId?: string,
    subjectId?: string,
    lessonId?: string,
    search?: string,
    skip: number = 0,
    limit: number = 20
  ): Promise<MCQsListResponse> {
    try {
      const params = new URLSearchParams()
      if (universityId) params.append("university_id", universityId)
      if (subjectId) params.append("subject_id", subjectId)
      if (lessonId) params.append("lesson_id", lessonId)
      if (search) params.append("search", search)
      params.append("skip", skip.toString())
      params.append("limit", limit.toString())

      return await ApiClient.get<MCQsListResponse>(
        `/admin/mcqs?${params.toString()}`
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to load MCQs")
    }
  }

  /**
   * Get a single MCQ
   */
  static async getMCQ(mcqId: string): Promise<MCQ> {
    try {
      return await ApiClient.get<MCQ>(`/admin/mcqs/${mcqId}`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to load MCQ")
    }
  }

  /**
   * Create a new MCQ
   */
  static async createMCQ(data: CreateMCQRequest): Promise<MCQ> {
    try {
      return await ApiClient.post<MCQ>(`/admin/mcqs`, data)
    } catch (error: any) {
      throw new Error(error.message || "Failed to create MCQ")
    }
  }

  /**
   * Update an MCQ
   */
  static async updateMCQ(
    mcqId: string,
    data: UpdateMCQRequest
  ): Promise<MCQ> {
    try {
      return await ApiClient.put<MCQ>(`/admin/mcqs/${mcqId}`, data)
    } catch (error: any) {
      throw new Error(error.message || "Failed to update MCQ")
    }
  }

  /**
   * Delete an MCQ
   */
  static async deleteMCQ(mcqId: string): Promise<void> {
    try {
      await ApiClient.delete(`/admin/mcqs/${mcqId}`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete MCQ")
    }
  }

  /**
   * Get pending MCQs for approval with pagination
   */
  static async getPendingMCQs(
    universityId?: string,
    subjectId?: string,
    lessonId?: string,
    skip: number = 0,
    limit: number = 20
  ): Promise<PendingMCQsListResponse> {
    try {
      const params = new URLSearchParams()
      if (universityId) params.append("universe_id", universityId)
      if (subjectId) params.append("subject_id", subjectId)
      if (lessonId) params.append("lesson_id", lessonId)
      params.append("skip", skip.toString())
      params.append("limit", limit.toString())

      return await ApiClient.get<PendingMCQsListResponse>(
        `/approvals/pending-mcqs?${params.toString()}`
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch pending MCQs")
    }
  }

  /**
   * Get a single MCQ with approval history
   */
  static async getMCQForApproval(mcqId: string): Promise<MCQWithApprovalsResponse> {
    try {
      return await ApiClient.get<MCQWithApprovalsResponse>(`/approvals/${mcqId}`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch MCQ")
    }
  }

  /**
   * Approve an MCQ
   */
  static async approveMCQ(mcqId: string): Promise<any> {
    try {
      return await ApiClient.put(`/approvals/${mcqId}/approve`, {})
    } catch (error: any) {
      throw new Error(error.message || "Failed to approve MCQ")
    }
  }

  /**
   * Reject an MCQ with optional comment
   */
  static async rejectMCQ(mcqId: string, comment?: string): Promise<any> {
    try {
      const data: MCQApprovalDecision = {
        decision: "rejected",
        comment,
      }
      return await ApiClient.put(`/approvals/${mcqId}/reject`, data)
    } catch (error: any) {
      throw new Error(error.message || "Failed to reject MCQ")
    }
  }

  /**
   * Get approved MCQs with pagination, filtering, and search (rank 5,6 only)
   */
  static async getApprovedMCQs(
    universityId?: string,
    subjectId?: string,
    lessonId?: string,
    search?: string,
    skip: number = 0,
    limit: number = 20
  ): Promise<MCQsListResponse> {
    try {
      const params = new URLSearchParams()
      if (universityId) params.append("university_id", universityId)
      if (subjectId) params.append("subject_id", subjectId)
      if (lessonId) params.append("lesson_id", lessonId)
      if (search) params.append("search", search)
      params.append("skip", skip.toString())
      params.append("limit", limit.toString())

      return await ApiClient.get<MCQsListResponse>(
        `/admin/approved-mcqs?${params.toString()}`
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch approved MCQs")
    }
  }

  /**
   * Get list of packs with pagination and filtering
   */
  static async getPacks(
    packType?: "pack" | "mock_exam",
    universityId?: string,
    search?: string,
    skip: number = 0,
    limit: number = 20
  ): Promise<PacksListResponse> {
    try {
      const params = new URLSearchParams()
      if (packType) params.append("pack_type", packType)
      if (universityId) params.append("university_id", universityId)
      if (search) params.append("search", search)
      params.append("skip", skip.toString())
      params.append("limit", limit.toString())

      const response = await ApiClient.get<any>(
        `/admin/packs?${params.toString()}`
      )
      
      // Ensure we return a valid object structure even if API returns plain array or malformed data
      if (Array.isArray(response)) {
        return { items: response, total: response.length, skip, limit }
      }
      
      return {
        items: Array.isArray(response?.items) ? response.items : [],
        total: response?.total || 0,
        skip: response?.skip || skip,
        limit: response?.limit || limit
      }
    } catch (error: any) {
      console.error("Failed to fetch packs in AdminService:", {
        message: error?.message || "Unknown error",
        status: error?.status,
        detail: error?.detail,
        error: error
      })
      throw new Error(error.message || "Failed to fetch packs")
    }
  }

  /**
   * Get single pack details
   */
  static async getPackDetails(packId: string): Promise<PackResponse> {
    try {
      return await ApiClient.get<PackResponse>(`/admin/packs/${packId}`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch pack details")
    }
  }

  /**
   * Create a new pack
   */
  static async createPack(data: CreatePackRequest): Promise<PackResponse> {
    try {
      console.log("[Admin Service] Creating pack with data:", data)
      return await ApiClient.post<PackResponse>(`/admin/packs`, data)
    } catch (error: any) {
      const errorMessage = error?.message || error?.detail || "Failed to create pack"
      const errorDetails = {
        message: errorMessage,
        status: error?.status,
        fullError: error instanceof Error ? error.message : String(error),
      }
      console.error("[Admin Service] Failed to create pack:", errorDetails)
      throw new Error(errorMessage)
    }
  }

  /**
   * Update an existing pack
   */
  static async updatePack(
    packId: string,
    data: UpdatePackRequest
  ): Promise<PackResponse> {
    try {
      return await ApiClient.put<PackResponse>(`/admin/packs/${packId}`, data)
    } catch (error: any) {
      throw new Error(error.message || "Failed to update pack")
    }
  }

  /**
   * Delete a pack
   */
  static async deletePack(packId: string): Promise<{ message: string }> {
    try {
      return await ApiClient.delete<{ message: string }>(`/admin/packs/${packId}`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete pack")
    }
  }

  /**
   * Get list of students who purchased or were gifted a pack
   */
  static async getPackPurchasers(packId: string): Promise<PackPurchaser[]> {
    try {
      return await ApiClient.get<PackPurchaser[]>(`/admin/packs/${packId}/purchasers`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch pack purchasers")
    }
  }

  /**
   * Get detailed evaluations for a pack
   */
  static async getPackReviews(packId: string): Promise<PackReview[]> {
    try {
      return await ApiClient.get<PackReview[]>(`/admin/packs/${packId}/reviews`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch pack reviews")
    }
  }


  /**
   * Get list of mock exams with pagination and filtering
   */
  static async getMockExams(
    universityId?: string,
    search?: string,
    skip: number = 0,
    limit: number = 20
  ): Promise<PacksListResponse> {
    try {
      const params = new URLSearchParams()
      if (universityId) params.append("university_id", universityId)
      if (search) params.append("search", search)
      params.append("skip", skip.toString())
      params.append("limit", limit.toString())

      const response = await ApiClient.get<any>(
        `/admin/mock-exams?${params.toString()}`
      )
      
      // Handle potential raw array or list response
      if (Array.isArray(response)) {
        return { items: response, total: response.length, skip, limit }
      }
      
      return {
        items: Array.isArray(response?.items) ? response.items : [],
        total: response?.total || 0,
        skip: response?.skip || skip,
        limit: response?.limit || limit
      }
    } catch (error: any) {
      console.error("Failed to fetch mock exams in AdminService:", {
        message: error?.message,
        status: error?.status,
        error
      })
      throw new Error(error.message || "Failed to fetch mock exams")
    }
  }

  /**
   * Get single mock exam details
   */
  static async getMockExamDetails(examId: string): Promise<PackResponse> {
    try {
      return await ApiClient.get<PackResponse>(`/admin/mock-exams/${examId}`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch mock exam details")
    }
  }

  /**
   * Create a new mock exam
   */
  static async createMockExam(
    data: CreatePackRequest
  ): Promise<PackResponse> {
    try {
      return await ApiClient.post<PackResponse>(`/admin/mock-exams`, data)
    } catch (error: any) {
      throw new Error(error.message || "Failed to create mock exam")
    }
  }

  /**
   * Update an existing mock exam
   */
  static async updateMockExam(
    examId: string,
    data: UpdatePackRequest
  ): Promise<PackResponse> {
    try {
      return await ApiClient.put<PackResponse>(`/admin/mock-exams/${examId}`, data)
    } catch (error: any) {
      throw new Error(error.message || "Failed to update mock exam")
    }
  }

  /**
   * Delete a mock exam
   */
  static async deleteMockExam(examId: string): Promise<{ message: string }> {
    try {
      return await ApiClient.delete<{ message: string }>(
        `/admin/mock-exams/${examId}`
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete mock exam")
    }
  }

  /**
   * Get list of question banks with pagination and filtering
   */
  static async getQuestionBanks(
    universityId?: string,
    search?: string,
    skip: number = 0,
    limit: number = 20
  ): Promise<QuestionBanksListResponse> {
    try {
      const params = new URLSearchParams()
      if (universityId) params.append("university_id", universityId)
      if (search) params.append("search", search)
      params.append("skip", skip.toString())
      params.append("limit", limit.toString())

      const response = await ApiClient.get<any>(
        `/admin/question-banks?${params.toString()}`
      )
      
      if (Array.isArray(response)) {
        return { items: response, total: response.length, skip, limit }
      }
      
      return {
        items: Array.isArray(response?.items) ? response.items : [],
        total: response?.total || 0,
        skip: response?.skip || skip,
        limit: response?.limit || limit
      }
    } catch (error: any) {
      console.error("Failed to fetch question banks in AdminService:", {
        message: error?.message,
        status: error?.status,
        error
      })
      throw new Error(error.message || "Failed to fetch question banks")
    }
  }

  /**
   * Get single question bank details
   */
  static async getQuestionBankDetails(
    bankId: string
  ): Promise<QuestionBankResponse> {
    try {
      return await ApiClient.get<QuestionBankResponse>(
        `/admin/question-banks/${bankId}`
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch question bank details")
    }
  }

  /**
   * Create a new question bank
   */
  static async createQuestionBank(
    data: CreateQuestionBankRequest
  ): Promise<QuestionBankResponse> {
    try {
      console.log("[Admin Service] Creating question bank with data:", data)
      return await ApiClient.post<QuestionBankResponse>(
        `/admin/question-banks`,
        data
      )
    } catch (error: any) {
      const errorMessage = error?.message || error?.detail || "Failed to create question bank"
      const errorDetails = {
        message: errorMessage,
        status: error?.status,
        fullError: error instanceof Error ? error.message : String(error),
      }
      console.error("[Admin Service] Failed to create question bank:", errorDetails)
      throw new Error(errorMessage)
    }
  }

  /**
   * Update an existing question bank
   */
  static async updateQuestionBank(
    bankId: string,
    data: UpdateQuestionBankRequest
  ): Promise<QuestionBankResponse> {
    try {
      return await ApiClient.put<QuestionBankResponse>(
        `/admin/question-banks/${bankId}`,
        data
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to update question bank")
    }
  }

  /**
   * Delete a question bank
   */
  static async deleteQuestionBank(
    bankId: string
  ): Promise<{ message: string }> {
    try {
      return await ApiClient.delete<{ message: string }>(
        `/admin/question-banks/${bankId}`
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete question bank")
    }
  }

  /**
   * Search MCQs by keyword or ID (Requires rank >= 5)
   */
  static async searchMCQs(
    keyword?: string,
    mcqId?: string
  ): Promise<MCQ[]> {
    try {
      const params = new URLSearchParams()
      if (keyword) params.append("keyword", keyword)
      if (mcqId) params.append("mcq_id", mcqId)

      return await ApiClient.get<MCQ[]>(
        `/mcq_research?${params.toString()}`
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to search MCQs")
    }
  }

  /**
   * Get all pack feedback
   */
  static async getPackFeedback(): Promise<AdminFeedback[]> {
    try {
      const response = await ApiClient.get<any[]>("/feedback/packs")
      return response.map(r => ({
        review_id: r.review_id,
        student_id: r.student_id,
        student_name: r.student_name,
        item_id: r.pack_id,
        item_title: r.item_title,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        type: "Pack"
      }))
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch pack feedback")
    }
  }

  /**
   * Get all mock exam feedback
   */
  static async getMockExamFeedback(): Promise<AdminFeedback[]> {
    try {
      const response = await ApiClient.get<any[]>("/feedback/mock-exams")
      return response.map(r => ({
        review_id: r.review_id,
        student_id: r.student_id,
        student_name: r.student_name,
        item_id: r.mock_exam_id,
        item_title: r.item_title,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        type: "Examen Blanc"
      }))
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch mock exam feedback")
    }
  }

  /**
   * Get student rankings
   */
  static async getRankings(packId?: string): Promise<StudentRanking[]> {
    try {
      const params = new URLSearchParams()
      if (packId) params.append("pack_id", packId)
      return await ApiClient.get<StudentRanking[]>(`/dashboard/rankings?${params.toString()}`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch rankings")
    }
  }

  /**
   * Get recent activity
   */
  static async getRecentActivity(): Promise<Activity[]> {
    try {
      return await ApiClient.get<Activity[]>("/dashboard/recent-activity")
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch recent activity")
    }
  }

  /**
   * CMS Pages
   */
  static async getPages(): Promise<PageOut[]> {
    try {
      return await ApiClient.get<PageOut[]>("/pages/")
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch pages")
    }
  }

  static async createPage(data: { title: string; slug: string; content: string }): Promise<PageOut> {
    try {
      return await ApiClient.post<PageOut>("/pages/", data)
    } catch (error: any) {
      throw new Error(error.message || "Failed to create page")
    }
  }

  static async updatePage(slug: string, data: { title?: string; content?: string }): Promise<PageOut> {
    try {
      return await ApiClient.put<PageOut>(`/pages/${slug}`, data)
    } catch (error: any) {
      throw new Error(error.message || "Failed to update page")
    }
  }

  /**
   * Sliders
   */
  static async getSliders(): Promise<SliderOut[]> {
    try {
      return await ApiClient.get<SliderOut[]>("/slider/")
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch sliders")
    }
  }

  static async createSlider(data: any): Promise<SliderOut> {
    try {
      return await ApiClient.post<SliderOut>("/slider/", data)
    } catch (error: any) {
      throw new Error(error.message || "Failed to create slider")
    }
  }

  static async updateSlider(id: number, data: any): Promise<SliderOut> {
    try {
      return await ApiClient.put<SliderOut>(`/slider/${id}`, data)
    } catch (error: any) {
      throw new Error(error.message || "Failed to update slider")
    }
  }

  /**
   * Dashboard Statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      return await ApiClient.get<DashboardStats>("/dashboard/stats")
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch dashboard stats")
    }
  }

  static async deleteSlider(id: number): Promise<void> {
    try {
      await ApiClient.delete(`/slider/${id}`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete slider")
    }
  }

  /**
   * Upload an image and return the URL
   */
  static async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      return await ApiClient.request<{ url: string; filename: string }>("/upload/image", {
        method: "POST",
        body: formData
      })
    } catch (error: any) {
      throw new Error(error.message || "Failed to upload image")
    }
  }
}
