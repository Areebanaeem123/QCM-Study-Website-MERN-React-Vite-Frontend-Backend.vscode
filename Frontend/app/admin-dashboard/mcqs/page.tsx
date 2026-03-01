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
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  Subscript,
  Superscript,
  Smile,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react"
import {
  AdminService,
  MCQ,
  University,
  Subject,
  Lesson,
  QuestionType,
  MCQOption,
  MCQsListResponse,
} from "@/lib/admin-service"

interface FormOption extends MCQOption {
  tempId?: string
}

const ITEMS_PER_PAGE = 20

export default function AdminMcqsPage() {
  // MCQ List states
  const [mcqsData, setMcqsData] = useState<MCQsListResponse | null>(null)
  const [universities, setUniversities] = useState<University[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTitle, setSearchTitle] = useState("")
  const [searchContent, setSearchContent] = useState("")
  const [currentPage, setCurrentPage] = useState(0)

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)

  // Form states
  const [formTitle, setFormTitle] = useState("")
  const [formQuestionText, setFormQuestionText] = useState("")
  const [formUniversityId, setFormUniversityId] = useState("")
  const [formSubjectId, setFormSubjectId] = useState("")
  const [formLessonId, setFormLessonId] = useState("")
  const [formQuestionTypeId, setFormQuestionTypeId] = useState("")
  const [formOptions, setFormOptions] = useState<FormOption[]>([
    { tempId: "1", option_text: "", is_correct: false, explanation: "" },
  ])
  const [editingMCQ, setEditingMCQ] = useState<MCQ | null>(null)
  const [deletingMCQ, setDeletingMCQ] = useState<MCQ | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Textarea ref for formatting
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load MCQs with pagination and search
  const loadMCQs = useCallback(async (page: number = 0) => {
    try {
      setIsLoading(true)
      setError("")

      const searchQuery = searchTitle || searchContent

      const data = await AdminService.getMCQs(
        undefined,
        undefined,
        undefined,
        searchQuery,
        page * ITEMS_PER_PAGE,
        ITEMS_PER_PAGE
      )

      setMcqsData(data)
      setCurrentPage(page)
    } catch (err: any) {
      setError(err.message || "Failed to load MCQs")
      setMcqsData(null)
    } finally {
      setIsLoading(false)
    }
  }, [searchTitle, searchContent])

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
        setError(err.message || "Failed to load data")
      }
    }

    loadStaticData()
    loadMCQs(0)
  }, [loadMCQs])

  // Handle search with debounce
  const handleSearchChange = useCallback(() => {
    setCurrentPage(0)
    loadMCQs(0)
  }, [loadMCQs])

  // Filter subjects based on selected university
  const filteredSubjects = formUniversityId
    ? subjects.filter((s) => s.university_id === formUniversityId)
    : []

  // Filter lessons based on selected subject
  const filteredLessons = formSubjectId
    ? lessons.filter((l) => l.subject_id === formSubjectId)
    : []

  // Formatting functions
  const insertFormatting = (before: string, after: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formQuestionText.substring(start, end)
    const beforeSelection = formQuestionText.substring(0, start)
    const afterSelection = formQuestionText.substring(end)

    const newText = beforeSelection + before + selectedText + after + afterSelection
    setFormQuestionText(newText)

    // Restore cursor position after formatting
    setTimeout(() => {
      if (textarea) {
        const newCursorPos = start + before.length + selectedText.length
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const handleBold = () => insertFormatting("**", "**")
  const handleItalic = () => insertFormatting("*", "*")
  const handleUnderline = () => insertFormatting("__", "__")
  const handleSuperscript = () => insertFormatting("^", "")
  const handleSubscript = () => insertFormatting("_", "")
  const handleEmoji = () => insertFormatting("😊 ", "")

  const handleAddOption = () => {
    const newOption: FormOption = {
      tempId: `${Date.now()}`,
      option_text: "",
      is_correct: false,
      explanation: "",
    }
    setFormOptions([...formOptions, newOption])
  }

  const handleRemoveOption = (tempId?: string) => {
    if (formOptions.length <= 1) {
      setError("At least one option is required")
      return
    }
    setFormOptions(formOptions.filter((opt) => opt.tempId !== tempId))
  }

  const handleOptionChange = (
    tempId: string | undefined,
    field: keyof FormOption,
    value: any
  ) => {
    setFormOptions(
      formOptions.map((opt) =>
        opt.tempId === tempId ? { ...opt, [field]: value } : opt
      )
    )
  }

  const handleAddMCQ = async (status: "draft" | "pending" = "draft") => {
    // Validation
    if (!formTitle.trim()) {
      setError("Question title is required")
      return
    }
    if (!formQuestionText.trim()) {
      setError("Question text is required")
      return
    }
    if (!formUniversityId) {
      setError("University selection is required")
      return
    }
    if (!formSubjectId) {
      setError("Subject selection is required")
      return
    }
    if (!formLessonId) {
      setError("Lesson selection is required")
      return
    }
    if (!formQuestionTypeId) {
      setError("Question type selection is required")
      return
    }
    if (formOptions.length === 0) {
      setError("At least one option is required")
      return
    }

    const hasAnswers = formOptions.some((opt) => opt.is_correct)
    if (!hasAnswers) {
      setError("At least one option must be marked as correct")
      return
    }

    const hasEmptyOption = formOptions.some((opt) => !opt.option_text.trim())
    if (hasEmptyOption) {
      setError("All options must have text")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      const optionsToSend = formOptions.map((opt) => ({
        option_text: opt.option_text,
        is_correct: opt.is_correct,
        explanation: opt.explanation || undefined,
      }))

      await AdminService.createMCQ({
        title: formTitle,
        question_text: formQuestionText,
        university_id: formUniversityId,
        subject_id: formSubjectId,
        lesson_id: formLessonId,
        question_type_id: formQuestionTypeId,
        options: optionsToSend,
        status: status,
      })

      // Reset form and reload
      setFormTitle("")
      setFormQuestionText("")
      setFormUniversityId("")
      setFormSubjectId("")
      setFormLessonId("")
      setFormQuestionTypeId("")
      setFormOptions([
        { tempId: "1", option_text: "", is_correct: false, explanation: "" },
      ])
      setAddDialogOpen(false)
      
      // Reload data
      setCurrentPage(0)
      await loadMCQs(0)
    } catch (err: any) {
      setError(err.message || "Failed to add MCQ")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditMCQ = async (status: "draft" | "pending" = "draft") => {
    if (!editingMCQ) return

    // Validation
    if (!formTitle.trim()) {
      setError("Question title is required")
      return
    }
    if (!formQuestionText.trim()) {
      setError("Question text is required")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      const optionsToSend = formOptions.map((opt) => ({
        option_text: opt.option_text,
        is_correct: opt.is_correct,
        explanation: opt.explanation || undefined,
      }))

      await AdminService.updateMCQ(editingMCQ.id, {
        title: formTitle,
        question_text: formQuestionText,
        question_type_id: formQuestionTypeId,
        options: optionsToSend,
        status: status,
      })

      setFormTitle("")
      setFormQuestionText("")
      setFormUniversityId("")
      setFormSubjectId("")
      setFormLessonId("")
      setFormQuestionTypeId("")
      setFormOptions([
        { tempId: "1", option_text: "", is_correct: false, explanation: "" },
      ])
      setEditingMCQ(null)
      setEditDialogOpen(false)
      
      // Reload data
      await loadMCQs(currentPage)
    } catch (err: any) {
      setError(err.message || "Failed to update MCQ")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMCQ = async () => {
    if (!deletingMCQ) return

    try {
      setIsSubmitting(true)
      setError("")
      await AdminService.deleteMCQ(deletingMCQ.id)
      setDeleteAlertOpen(false)
      setDeletingMCQ(null)
      
      // Reload data
      await loadMCQs(currentPage)
    } catch (err: any) {
      setError(err.message || "Failed to delete MCQ")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (mcq: MCQ) => {
    setEditingMCQ(mcq)
    setFormTitle(mcq.title)
    setFormQuestionText(mcq.question_text)
    setFormUniversityId(mcq.university_id)
    setFormSubjectId(mcq.subject_id)
    setFormLessonId(mcq.lesson_id)
    setFormQuestionTypeId(mcq.question_type_id)
    setFormOptions(
      mcq.options.map((opt, idx) => ({
        ...opt,
        tempId: `${idx}`,
      }))
    )
    setEditDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      pending: "outline",
      approved: "default",
      rejected: "destructive",
    }
    const labels: Record<string, string> = {
      draft: "Brouillon",
      pending: "En attente",
      approved: "Approuvé",
      rejected: "Rejeté",
    }
    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    )
  }

  const totalPages = mcqsData ? Math.ceil(mcqsData.total / ITEMS_PER_PAGE) : 0
  const mcqs = mcqsData?.items || []

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold">Gestion des QCM</h2>
        <p className="text-muted-foreground">
          Créez, modifiez et gérez les questions à choix multiples.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Add MCQ Section */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Gestion des QCM</h3>
          <Button
            onClick={() => {
              setAddDialogOpen(true)
              setEditingMCQ(null)
              setFormTitle("")
              setFormQuestionText("")
              setFormUniversityId("")
              setFormSubjectId("")
              setFormLessonId("")
              setFormQuestionTypeId("")
              setFormOptions([
                {
                  tempId: "1",
                  option_text: "",
                  is_correct: false,
                  explanation: "",
                },
              ])
              setError("")
            }}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau QCM
          </Button>
        </div>

        {/* Search Section */}
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Search by Title */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre..."
                className="pl-9"
                value={searchTitle}
                onChange={(e) => {
                  setSearchTitle(e.target.value)
                  handleSearchChange()
                }}
              />
            </div>

            {/* Search by Content */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par contenu de question..."
                className="pl-9"
                value={searchContent}
                onChange={(e) => {
                  setSearchContent(e.target.value)
                  handleSearchChange()
                }}
              />
            </div>
          </div>
          
          {/* Search Info */}
          {(searchTitle || searchContent) && mcqsData && (
            <p className="text-sm text-muted-foreground">
              {mcqsData.total} QCM trouvé(s)
            </p>
          )}
        </div>

        {/* MCQs Table */}
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
                    <TableHead className="w-1/4">Titre</TableHead>
                    <TableHead className="w-1/4 max-w-xs">Question</TableHead>
                    <TableHead className="w-1/6">Statut</TableHead>
                    <TableHead className="w-1/6">Créé par</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mcqs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">
                          {searchTitle || searchContent
                            ? "Aucun QCM ne correspond à votre recherche."
                            : "Aucun QCM trouvé. Créez votre premier QCM."}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    mcqs.map((mcq) => (
                      <TableRow key={mcq.id}>
                        <TableCell className="font-medium">{mcq.title}</TableCell>
                        <TableCell className="max-w-xs truncate text-sm">
                          {mcq.question_text}
                        </TableCell>
                        <TableCell>{getStatusBadge(mcq.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {mcq.creator_name}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(mcq)}
                            disabled={isSubmitting}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setDeletingMCQ(mcq)
                              setDeleteAlertOpen(true)
                            }}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage + 1} sur {totalPages} ({mcqsData?.total || 0} QCM au total)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadMCQs(currentPage - 1)}
                    disabled={currentPage === 0 || isLoading}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadMCQs(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1 || isLoading}
                    className="gap-2"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit MCQ Dialog */}
      <Dialog open={addDialogOpen || editDialogOpen} onOpenChange={(open) => {
        setAddDialogOpen(open)
        setEditDialogOpen(open)
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMCQ ? "Modifier le QCM" : "Ajouter un nouveau QCM"}
            </DialogTitle>
            <DialogDescription>
              Remplissez tous les champs pour créer un QCM.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* University Select */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Université *
              </label>
              <Select value={formUniversityId} onValueChange={setFormUniversityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une université" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((uni) => (
                    <SelectItem key={uni.id} value={uni.id}>
                      {uni.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Select */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Matière *
              </label>
              <Select value={formSubjectId} onValueChange={setFormSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une matière" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubjects.map((subj) => (
                    <SelectItem key={subj.id} value={subj.id}>
                      {subj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lesson Select */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Leçon *
              </label>
              <Select value={formLessonId} onValueChange={setFormLessonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une leçon" />
                </SelectTrigger>
                <SelectContent>
                  {filteredLessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question Type Select */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Type de question *
              </label>
              <Select
                value={formQuestionTypeId}
                onValueChange={setFormQuestionTypeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Titre de la question *
              </label>
              <Input
                placeholder="Entrez le titre de la question"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Texte de la question *
              </label>
              <div className="border rounded-lg overflow-hidden">
                {/* Formatting toolbar */}
                <div className="flex gap-1 p-2 border-b bg-muted">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    title="Gras (Ctrl+B)"
                    onClick={handleBold}
                    type="button"
                  >
                    <Bold className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    title="Italique (Ctrl+I)"
                    onClick={handleItalic}
                    type="button"
                  >
                    <Italic className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    title="Souligné"
                    onClick={handleUnderline}
                    type="button"
                  >
                    <Underline className="h-3 w-3" />
                  </Button>
                  <div className="w-px bg-border" />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    title="Exposant (x^2)"
                    onClick={handleSuperscript}
                    type="button"
                  >
                    <Superscript className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    title="Indice (x_2)"
                    onClick={handleSubscript}
                    type="button"
                  >
                    <Subscript className="h-3 w-3" />
                  </Button>
                  <div className="w-px bg-border" />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    title="Insérer un emoji"
                    onClick={handleEmoji}
                    type="button"
                  >
                    <Smile className="h-3 w-3" />
                  </Button>
                </div>
                <Textarea
                  ref={textareaRef}
                  placeholder="Entrez le texte de la question"
                  className="rounded-none border-0 min-h-24"
                  value={formQuestionText}
                  onChange={(e) => setFormQuestionText(e.target.value)}
                />
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Options *
              </label>
              <div className="space-y-3">
                {formOptions.map((option, idx) => (
                  <div key={option.tempId} className="border rounded-lg p-3">
                    <div className="flex gap-2 mb-2">
                      <div className="flex items-center">
                        <Checkbox
                          id={`correct-${option.tempId}`}
                          checked={option.is_correct}
                          onCheckedChange={(checked) =>
                            handleOptionChange(
                              option.tempId,
                              "is_correct",
                              checked
                            )
                          }
                        />
                        <label
                          htmlFor={`correct-${option.tempId}`}
                          className="ml-2 text-sm font-medium"
                        >
                          Correcte
                        </label>
                      </div>
                      {formOptions.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-auto"
                          onClick={() => handleRemoveOption(option.tempId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <Input
                      placeholder={`Option ${idx + 1}`}
                      className="mb-2"
                      value={option.option_text}
                      onChange={(e) =>
                        handleOptionChange(
                          option.tempId,
                          "option_text",
                          e.target.value
                        )
                      }
                    />

                    <Textarea
                      placeholder="Explication (optionnel)"
                      className="min-h-16 text-sm"
                      value={option.explanation || ""}
                      onChange={(e) =>
                        handleOptionChange(
                          option.tempId,
                          "explanation",
                          e.target.value
                        )
                      }
                    />
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full mt-3"
                onClick={handleAddOption}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une option
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false)
                setEditDialogOpen(false)
              }}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                editingMCQ ? handleEditMCQ("draft") : handleAddMCQ("draft")
              }}
              disabled={isSubmitting}
              variant="outline"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer comme brouillon"
              )}
            </Button>
            <Button
              onClick={() => {
                if (editingMCQ) {
                  handleEditMCQ("pending")
                } else {
                  handleAddMCQ("pending")
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Envoi...
                </>
              ) : (
                "Soumettre pour approbation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le QCM ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le QCM "{deletingMCQ?.title}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMCQ}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
