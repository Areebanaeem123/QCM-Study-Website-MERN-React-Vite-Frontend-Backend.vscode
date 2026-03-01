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
}

export interface UsersListResponse {
  total: number
  skip: number
  limit: number
  items: User[]
}

export interface UserDetail extends User {
  civility?: string
  date_of_birth?: string
  country?: string
  phone_number?: string
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

export interface MCQsListResponse {
  total: number
  skip: number
  limit: number
  items: MCQ[]
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
  currency: "CHF" | "GBP" | "USD"
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
  mcqs?: MCQ[]
}

export interface CreatePackRequest {
  title: string
  description?: string
  type: "pack" | "mock_exam"
  price: number
  currency: "CHF" | "GBP" | "USD"
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
  currency?: "CHF" | "GBP" | "USD"
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

export class AdminService {
  /**
   * Get list of users with search and pagination
   */
  static async getUsers(
    search: string = "",
    skip: number = 0,
    limit: number = 20
  ): Promise<UsersListResponse> {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
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
        `/admin/users/${userId}/grant-pack/${packId}`,
        {}
      )
    } catch (error: any) {
      throw new Error(error.message || "Failed to grant pack access")
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
   * Get list of all available packs for granting
   */
  static async getPacks(): Promise<Pack[]> {
    try {
      return await ApiClient.get<Pack[]>(`/admin/packs`)
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch packs")
    }
  }

  /**
   * Get list of all universities
   */
  static async getUniversities(): Promise<University[]> {
    try {
      return await ApiClient.get<University[]>(`/admin/universities`)
    } catch (error: any) {
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

      return await ApiClient.get<PacksListResponse>(
        `/admin/packs?${params.toString()}`
      )
    } catch (error: any) {
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
      console.error("[Admin Service] Failed to create pack:", error)
      throw new Error(error.message || "Failed to create pack")
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

      return await ApiClient.get<PacksListResponse>(
        `/admin/mock-exams?${params.toString()}`
      )
    } catch (error: any) {
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
}
