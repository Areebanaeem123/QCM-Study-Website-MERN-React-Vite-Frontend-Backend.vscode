"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Loader2,
  Eye,
  Edit2,
  Check,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  AdminService,
  MCQWithApprovalsResponse,
  PendingMCQsListResponse,
  University,
  Subject,
  Lesson,
  QuestionType,
} from "@/lib/admin-service"

const ITEMS_PER_PAGE = 10

type ViewMode = "list" | "preview" | "edit"

export default function MCQApprovalsPage() {
  // List states
  const [pendingMCQsData, setPendingMCQsData] = useState<PendingMCQsListResponse | null>(null)
  const [universities, setUniversities] = useState<University[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(0)

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedMCQ, setSelectedMCQ] = useState<MCQWithApprovalsResponse | null>(null)

  // Edit form states
  const [formTitle, setFormTitle] = useState("")
  const [formQuestionText, setFormQuestionText] = useState("")
  const [formOptions, setFormOptions] = useState<any[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionComment, setRejectionComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load MCQs with pagination
  const loadPendingMCQs = useCallback(async (page: number = 0) => {
    try {
      setIsLoading(true)
      setError("")

      const data = await AdminService.getPendingMCQs(
        undefined,
        undefined,
        undefined,
        page * ITEMS_PER_PAGE,
        ITEMS_PER_PAGE
      )

      setPendingMCQsData(data)
      setCurrentPage(page)
    } catch (err: any) {
      setError(err.message || "Échec du chargement des QCM en attente")
      setPendingMCQsData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load static data on mount
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [universitiesData, subjectsData, lessonsData, typesData] =
          await Promise.all([
            AdminService.getUniversities(),
            AdminService.getSubjects(),
            AdminService.getLessons(),
            AdminService.getQuestionTypes(),
          ])
        setUniversities(universitiesData)
        setSubjects(subjectsData)
        setLessons(lessonsData)
        setQuestionTypes(typesData)
      } catch (err: any) {
        setError(err.message || "Échec du chargement des données")
      }
    }

    loadStaticData()
    loadPendingMCQs(0)
  }, [loadPendingMCQs])

  // Open preview mode
  const openPreviewMode = (mcq: MCQWithApprovalsResponse) => {
    setSelectedMCQ(mcq)
    setViewMode("preview")
  }

  // Open edit mode
  const openEditMode = (mcq: MCQWithApprovalsResponse) => {
    setSelectedMCQ(mcq)
    setFormTitle(mcq.title)
    setFormQuestionText(mcq.question_text)
    setFormOptions(mcq.options.map((opt) => ({ ...opt })))
    setViewMode("edit")
  }

  // Handle approve
  const handleApprove = async () => {
    if (!selectedMCQ) return

    try {
      setIsSubmitting(true)
      setError("")
      await AdminService.approveMCQ(selectedMCQ.id)
      await loadPendingMCQs(currentPage)
      setViewMode("list")
      setSelectedMCQ(null)
    } catch (err: any) {
      setError(err.message || "Échec de l'approbation du QCM")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle reject
  const handleReject = async () => {
    if (!selectedMCQ) return

    try {
      setIsSubmitting(true)
      setError("")
      await AdminService.rejectMCQ(selectedMCQ.id, rejectionComment)
      await loadPendingMCQs(currentPage)
      setViewMode("list")
      setSelectedMCQ(null)
      setRejectDialogOpen(false)
      setRejectionComment("")
    } catch (err: any) {
      setError(err.message || "Échec du rejet du QCM")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle save and approve (from edit mode)
  const handleSaveAndApprove = async () => {
    if (!selectedMCQ) return

    try {
      setIsSubmitting(true)
      setError("")

      // Update the MCQ
      await AdminService.updateMCQ(selectedMCQ.id, {
        title: formTitle,
        question_text: formQuestionText,
        options: formOptions,
      })

      // Then approve it
      await AdminService.approveMCQ(selectedMCQ.id)

      await loadPendingMCQs(currentPage)
      setViewMode("list")
      setSelectedMCQ(null)
    } catch (err: any) {
      setError(err.message || "Échec de l'enregistrement et de l'approbation du QCM")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle save modifications only (from edit mode)
  const handleSaveModifications = async () => {
    if (!selectedMCQ) return

    try {
      setIsSubmitting(true)
      setError("")

      // Update the MCQ
      await AdminService.updateMCQ(selectedMCQ.id, {
        title: formTitle,
        question_text: formQuestionText,
        options: formOptions,
      })

      // Reload the pending MCQs list
      await loadPendingMCQs(currentPage)
      setViewMode("list")
      setSelectedMCQ(null)
    } catch (err: any) {
      setError(err.message || "Échec de l'enregistrement des modifications")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCreatorName = (mcq: MCQWithApprovalsResponse) => {
    return mcq.creator_name || "Inconnu"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US")
  }

  const totalPages = pendingMCQsData
    ? Math.ceil(pendingMCQsData.total / ITEMS_PER_PAGE)
    : 0
  const mcqs = pendingMCQsData?.items || []

  // Find related data
  const getUniversityName = (id: string) =>
    universities.find((u) => u.id === id)?.name || id
  const getSubjectName = (id: string) =>
    subjects.find((s) => s.id === id)?.name || id
  const getLessonName = (id: string) =>
    lessons.find((l) => l.id === id)?.name || id
  const getQuestionTypeName = (id: string) =>
    questionTypes.find((t) => t.id === id)?.name || id

  // LIST MODE
  if (viewMode === "list") {
    return (
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold">MCQ Approvals</h2>
          <p className="text-muted-foreground">
            Review and approve pending MCQs.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Pending MCQs Table */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-6">
            Queue ({pendingMCQsData?.total || 0} QCM)
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Titre & Créateur</TableHead>
                      <TableHead className="w-1/4">Université</TableHead>
                      <TableHead className="w-1/4">Créé le</TableHead>
                      <TableHead className="w-1/4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mcqs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <p className="text-muted-foreground">
                            Aucun QCM en attente d'approbation.
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      mcqs.map((mcq) => (
                        <TableRow key={mcq.id}>
                          <TableCell>
                            <div className="font-medium">{mcq.title}</div>
                            <div className="text-sm text-muted-foreground">
                              By: {getCreatorName(mcq)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {mcq.university_name || getUniversityName(mcq.university_id)}
                          </TableCell>
                          <TableCell>
                            {formatDate(mcq.created_at)}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openPreviewMode(mcq)}
                              disabled={isSubmitting}
                              className="gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditMode(mcq)}
                              disabled={isSubmitting}
                              className="gap-1"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage + 1} sur {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadPendingMCQs(currentPage - 1)}
                      disabled={currentPage === 0 || isLoading}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadPendingMCQs(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1 || isLoading}
                      className="gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // PREVIEW MODE
  if (viewMode === "preview" && selectedMCQ) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            setViewMode("list")
            setSelectedMCQ(null)
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Retour à la liste
        </button>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-lg border bg-card p-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{selectedMCQ.title}</h2>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-6">
              <div>Université: {selectedMCQ.university_name || getUniversityName(selectedMCQ.university_id)}</div>
              <div>Matière: {selectedMCQ.subject_name || getSubjectName(selectedMCQ.subject_id)}</div>
              <div>Leçon: {selectedMCQ.lesson_name || getLessonName(selectedMCQ.lesson_id)}</div>
              <div>Type: {selectedMCQ.question_type_name || getQuestionTypeName(selectedMCQ.question_type_id)}</div>
              <div>Créé par: {getCreatorName(selectedMCQ)}</div>
              <div>Date: {formatDate(selectedMCQ.created_at)}</div>
            </div>
          </div>

          {/* Question Text */}
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="whitespace-pre-wrap">{selectedMCQ.question_text}</p>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {selectedMCQ.options.map((option, idx) => (
              <div
                key={option.id}
                className={`p-3 border rounded-lg ${
                  option.is_correct ? "bg-green-50 border-green-200" : ""
                }`}
              >
                <div className="flex gap-2">
                  <div className="mt-1">
                    <Checkbox checked={option.is_correct} disabled />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{option.option_text}</p>
                    {option.explanation && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Explanation: {option.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Approval History */}
          {selectedMCQ.approvals && selectedMCQ.approvals.length > 0 && (
            <div className="mb-6 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Historique d'approbation:</p>
              <div className="space-y-1 text-sm">
                {selectedMCQ.approvals.map((approval) => (
                  <div key={approval.id} className="flex justify-between">
                    <span>
                      {approval.reviewer_name} - {approval.decision}
                    </span>
                    <span className="text-muted-foreground">
                      {formatDate(approval.reviewed_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => openEditMode(selectedMCQ)}
                disabled={isSubmitting}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
                disabled={isSubmitting}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="gap-2"
              >
                <span key={isSubmitting ? "loading" : "check"}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </span>
                Approve
              </Button>
            </div>
          </div>
        </div>

        {/* Reject Dialog */}
        <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Rejeter le QCM</AlertDialogTitle>
              <AlertDialogDescription>
                Vous pouvez ajouter un commentaire pour expliquer pourquoi vous rejetez ce QCM.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea
              placeholder="Raison du rejet (optionnel)..."
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
            />
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReject}
                disabled={isSubmitting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmitting && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Rejet en cours...
                  </>
                )}
                {!isSubmitting && "Rejeter"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // EDIT MODE
  if (viewMode === "edit" && selectedMCQ) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            setViewMode("list")
            setSelectedMCQ(null)
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Retour à la liste
        </button>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-6">Éditer le QCM</h3>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Titre</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Texte de la question
              </label>
              <Textarea
                ref={textareaRef}
                value={formQuestionText}
                onChange={(e) => setFormQuestionText(e.target.value)}
                className="min-h-24"
              />
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium mb-2">Options</label>
              <div className="space-y-3">
                {formOptions.map((option, idx) => (
                  <div key={option.id} className="border rounded-lg p-3">
                    <div className="flex gap-2 mb-2">
                      <Checkbox
                        checked={option.is_correct}
                        onCheckedChange={(checked) => {
                          const updated = [...formOptions]
                          updated[idx].is_correct = checked
                          setFormOptions(updated)
                        }}
                      />
                      <span className="text-sm font-medium">Correct</span>
                    </div>
                    <Input
                      className="mb-2"
                      value={option.option_text}
                      onChange={(e) => {
                        const updated = [...formOptions]
                        updated[idx].option_text = e.target.value
                        setFormOptions(updated)
                      }}
                      placeholder="Texte de l'option"
                    />
                    <Textarea
                      value={option.explanation || ""}
                      onChange={(e) => {
                        const updated = [...formOptions]
                        updated[idx].explanation = e.target.value
                        setFormOptions(updated)
                      }}
                      placeholder="Explication (optionnelle)"
                      className="text-sm min-h-16"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setViewMode("list")
                setSelectedMCQ(null)
              }}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSaveModifications}
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Enregistrement...
                  </>
                )}
                {!isSubmitting && "Enregistrer les modifications"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
                disabled={isSubmitting}
              >
                Rejeter
              </Button>
              <Button onClick={handleSaveAndApprove} disabled={isSubmitting}>
                {isSubmitting && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Traitement...
                  </>
                )}
                {!isSubmitting && "Enregistrer et Approuver"}
              </Button>
            </div>
          </div>
        </div>

        {/* Reject Dialog */}
        <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Rejeter le QCM</AlertDialogTitle>
            </AlertDialogHeader>
            <Textarea
              placeholder="Raison du rejet (optionnel)..."
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
            />
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReject}
                disabled={isSubmitting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmitting && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Rejet en cours...
                  </>
                )}
                {!isSubmitting && "Rejeter"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }
}

