"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { ImageUpload } from "@/components/admin/image-upload"
import { AdminService, QuestionBankResponse, University, Subject, Lesson, MCQ } from "@/lib/admin-service"
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle, X, ChevronLeft, ChevronRight } from "lucide-react"

export default function AdminQuestionBanksPage() {
  const router = useRouter()
  const [questionBanks, setQuestionBanks] = useState<QuestionBankResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [selectedUniversityId, setSelectedUniversityId] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingBank, setEditingBank] = useState<QuestionBankResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 10

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    university_id: "",
    price: 0,
    currency: "CHF" as "CHF" | "GBP" | "USD" | "EUR" | "TND",
    start_datetime: "",
    expiry_datetime: "",
    display_before_start: false,
    is_published: false,
    image_url: "",
    mcq_ids: [] as string[],
  })

  // MCQ selection state
  const [universities, setUniversities] = useState<University[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [availableMCQs, setAvailableMCQs] = useState<MCQ[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [selectedLessonId, setSelectedLessonId] = useState("")
  const [selectedMCQForAdd, setSelectedMCQForAdd] = useState("")

  // Load question banks
  useEffect(() => {
    loadQuestionBanks()
    loadUniversities()
  }, [search, selectedUniversityId, currentPage])

  const loadQuestionBanks = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await AdminService.getQuestionBanks(
        selectedUniversityId && selectedUniversityId !== "all" ? selectedUniversityId : undefined,
        search || undefined,
        currentPage * itemsPerPage,
        itemsPerPage
      )
      setQuestionBanks(response.items)
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to load question banks"
      const fullError = err instanceof Error ? err.message : String(err)
      
      // More specific error messages
      if (fullError.includes("404") || fullError.includes("not found")) {
        setError("Backend endpoint not found. Ensure backend is running.")
      } else if (fullError.includes("connect") || fullError.includes("CORS")) {
        setError("Cannot connect to backend. Make sure the backend server is running on http://localhost:8000")
      } else {
        setError(errorMessage)
      }
      
      console.error("[Question Banks] Load error:", {
        message: errorMessage,
        fullError: fullError,
        status: err?.response?.status,
        data: err?.response?.data,
        url: err?.config?.url,
      })
      console.error("Full error object:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadUniversities = async () => {
    try {
      const response = await AdminService.getUniversities()
      setUniversities(response)
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to load universities"
      console.error("[Question Banks] Failed to load universities:", {
        message: errorMessage,
        status: err?.response?.status,
        data: err?.response?.data,
      })
      // Don't show error for universities load, just log it
      console.warn("Universities not available, but form can still be used")
    }
  }

  const loadSubjects = async (universityId: string) => {
    if (!universityId) {
      setSubjects([])
      return
    }
    try {
      const response = await AdminService.getSubjectsByUniversity(universityId)
      setSubjects(response.items)
    } catch (err: any) {
      console.error("Failed to load subjects")
    }
  }

  const loadLessons = async (subjectId: string) => {
    if (!subjectId) {
      setLessons([])
      return
    }
    try {
      const response = await AdminService.getLessonsBySubject(subjectId)
      setLessons(response.items)
    } catch (err: any) {
      console.error("Failed to load lessons")
    }
  }

  const loadMCQs = async (lessonId: string) => {
    if (!lessonId) {
      setAvailableMCQs([])
      return
    }
    try {
      const response = await AdminService.getMCQsByLesson(lessonId, 0, 100)
      setAvailableMCQs(response.items)
    } catch (err: any) {
      console.error("Failed to load MCQs")
    }
  }

  const handleUniversityChange = (universityId: string) => {
    setFormData({ ...formData, university_id: universityId })
    setSelectedSubjectId("")
    setSelectedLessonId("")
    loadSubjects(universityId)
  }

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId)
    setSelectedLessonId("")
    loadLessons(subjectId)
  }

  const handleLessonChange = (lessonId: string) => {
    setSelectedLessonId(lessonId)
    loadMCQs(lessonId)
  }

  const handleAddMCQ = (mcqId: string) => {
    if (!formData.mcq_ids.includes(mcqId)) {
      setFormData({
        ...formData,
        mcq_ids: [...formData.mcq_ids, mcqId],
      })
    }
    // Reset MCQ selection and filters after adding
    setSelectedMCQForAdd("")
    setSelectedLessonId("")
    setSelectedSubjectId("")
  }

  const handleRemoveMCQ = (mcqId: string) => {
    setFormData({
      ...formData,
      mcq_ids: formData.mcq_ids.filter((id) => id !== mcqId),
    })
  }

  // Helper function to format datetime for API
  const formatDateTimeForAPI = (dateTimeStr: string): string => {
    if (!dateTimeStr) return dateTimeStr
    let result = dateTimeStr
    const parts = result.split("T")
    if (parts[1] && parts[1].split(":").length === 2) {
      result = result + ":00"
    }
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.university_id || formData.mcq_ids.length === 0) {
      setError("Veuillez remplir tous les champs obligatoires (titre, université) et sélectionner au moins un QCM")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const submitData = {
        ...formData,
        start_datetime: formatDateTimeForAPI(formData.start_datetime),
        expiry_datetime: formatDateTimeForAPI(formData.expiry_datetime),
      }

      if (editingBank) {
        await AdminService.updateQuestionBank(editingBank.id, submitData)
      } else {
        await AdminService.createQuestionBank(submitData)
      }

      setIsCreateDialogOpen(false)
      setEditingBank(null)
      setFormData({
        title: "",
        description: "",
        university_id: "",
        price: 0,
        currency: "CHF", // Initial state default
        start_datetime: "",
        expiry_datetime: "",
        display_before_start: false,
        is_published: false,
        image_url: "",
        mcq_ids: [],
      })
      setSelectedSubjectId("")
      setSelectedLessonId("")
      loadQuestionBanks()
    } catch (err: any) {
      setError(err.message || "Failed to save question bank")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (bank: QuestionBankResponse) => {
    setEditingBank(bank)
    setFormData({
      title: bank.title || "",
      description: bank.description || "",
      university_id: bank.university_id,
      price: bank.price,
      currency: bank.currency as "CHF" | "GBP" | "USD" | "EUR" | "TND",
      start_datetime: bank.start_datetime?.split(".")[0] || "",
      expiry_datetime: bank.expiry_datetime?.split(".")[0] || "",
      display_before_start: bank.display_before_start,
      is_published: bank.is_published,
      image_url: bank.image_url || "",
      mcq_ids: (bank.mcqs || []).map((m) => m.id),
    })
    handleUniversityChange(bank.university_id)
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (bankId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette banque de questions ?")) return

    try {
      await AdminService.deleteQuestionBank(bankId)
      loadQuestionBanks()
    } catch (err: any) {
      setError(err.message || "Failed to delete question bank")
    }
  }

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false)
    setEditingBank(null)
    setFormData({
      title: "",
      description: "",
      university_id: "",
      price: 0,
      currency: "CHF", // Reset state default
      start_datetime: "",
      expiry_datetime: "",
      display_before_start: false,
      is_published: false,
      image_url: "",
      mcq_ids: [],
    })
    setSelectedSubjectId("")
    setSelectedLessonId("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Banques de Questions</h2>
          <p className="text-muted-foreground">
            Créez et gérez les collections de banques de questions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingBank(null)}>
              <Plus className="mr-2 h-4 w-4" />
              New Question Bank
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBank ? "Modifier la banque de questions" : "Créer une banque de questions"}
              </DialogTitle>
              <DialogDescription>
                {editingBank
                  ? "Mettez à jour les détails de la banque de questions ci-dessous"
                  : "Remplissez les détails pour créer une nouvelle banque de questions"}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="ex. Fondamentaux de la biologie"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Décrivez cette banque de questions..."
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div>
                <Label>Image</Label>
                <ImageUpload
                  onImageUrlChange={(url) =>
                    setFormData({ ...formData, image_url: url })
                  }
                  currentImageUrl={formData.image_url}
                />
              </div>

              {/* University */}
              <div>
                <Label htmlFor="university">Université *</Label>
                <Select
                  value={formData.university_id}
                  onValueChange={handleUniversityChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une université" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price === 0 ? "" : formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    onFocus={(e) => {
                      if (e.target.value === "") {
                        setFormData({ ...formData, price: 0 })
                      }
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Devise</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value: "CHF" | "GBP" | "USD" | "EUR" | "TND") =>
                      setFormData({ ...formData, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CHF">CHF</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="TND">TND</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Availability Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_datetime">Available From</Label>
                  <Input
                    id="start_datetime"
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        start_datetime: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="expiry_datetime">Disponible jusqu'au</Label>
                  <Input
                    id="expiry_datetime"
                    type="datetime-local"
                    value={formData.expiry_datetime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expiry_datetime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Visibility */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="display_before_start"
                  checked={formData.display_before_start}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      display_before_start: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="display_before_start" className="cursor-pointer">
                  Display before start date
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      is_published: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="is_published" className="cursor-pointer">
                  Publish
                </Label>
              </div>

              {/* MCQ Selection */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">Select MCQs *</h4>

                {/* Cascade Select */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={selectedSubjectId}
                      onValueChange={handleSubjectChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="lesson">Lesson</Label>
                    <Select
                      value={selectedLessonId}
                      onValueChange={handleLessonChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lesson" />
                      </SelectTrigger>
                      <SelectContent>
                        {lessons.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="mcq">MCQ</Label>
                    <Select
                      value={selectedMCQForAdd}
                      onValueChange={(mcqId) => {
                        handleAddMCQ(mcqId)
                        setSelectedMCQForAdd("")
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select MCQ" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMCQs.length > 0 ? (
                          availableMCQs.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.title}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-3 text-sm text-muted-foreground">
                            No MCQs available. Select a lesson first.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Selected MCQs */}
                <div>
                  <Label>Selected MCQs ({formData.mcq_ids.length})</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.mcq_ids.map((mcqId) => {
                      const mcq = availableMCQs.find((m) => m.id === mcqId)
                      return (
                        <Badge key={mcqId} variant="secondary">
                          {mcq?.title || mcqId}
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveMCQ(mcqId)}
                          />
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingBank ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search question banks..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={selectedUniversityId || "all"} onValueChange={setSelectedUniversityId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by university" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Universities</SelectItem>
            {universities.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : questionBanks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No question banks found</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>MCQs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionBanks.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium">{bank.title}</TableCell>
                    <TableCell>{bank.university_name || bank.university_id}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {bank.academic_sessions?.length ? (
                          bank.academic_sessions.map((session, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                              {session}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs italic">Aucune</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {bank.price} {bank.currency}
                    </TableCell>
                    <TableCell>{bank.mcqs?.length || 0}</TableCell>
                    <TableCell>
                      <Badge
                        variant={bank.is_published ? "default" : "secondary"}
                      >
                        {bank.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(bank.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(bank)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(bank.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {currentPage + 1}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={questionBanks.length < itemsPerPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
