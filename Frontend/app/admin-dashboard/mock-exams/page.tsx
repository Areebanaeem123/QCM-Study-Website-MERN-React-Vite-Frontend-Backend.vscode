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
import { AdminService, PackResponse, University, Subject, Lesson, MCQ } from "@/lib/admin-service"
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle, X, ChevronLeft, ChevronRight } from "lucide-react"

export default function AdminMockExamsPage() {
  const router = useRouter()
  const [mockExams, setMockExams] = useState<PackResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [selectedUniversityId, setSelectedUniversityId] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<PackResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 10

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "mock_exam" as "pack" | "mock_exam",
    university_id: "",
    price: 0,
    currency: "CHF" as "CHF" | "GBP" | "USD",
    start_datetime: "",
    expiry_datetime: "",
    display_before_start: false,
    time_limit_minutes: null as number | null,
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

  // Load mock exams
  useEffect(() => {
    loadMockExams()
    loadUniversities()
  }, [search, selectedUniversityId, currentPage])

  const loadMockExams = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await AdminService.getMockExams(
        selectedUniversityId || undefined,
        search || undefined,
        currentPage * itemsPerPage,
        itemsPerPage
      )
      setMockExams(response.items)
    } catch (err: any) {
      setError(err.message || "Échec du chargement des examens blancs")
    } finally {
      setLoading(false)
    }
  }

  const loadUniversities = async () => {
    try {
      const response = await AdminService.getUniversities()
      setUniversities(response)
    } catch (err: any) {
      console.error("Failed to load universities")
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
      console.error("Échec du chargement des QCM")
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
    // Convert from "2026-03-01T12:30" to "2026-03-01T12:30:00"
    if (dateTimeStr.includes("T") && !dateTimeStr.includes(":00")) {
      return dateTimeStr + ":00"
    }
    return dateTimeStr
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.university_id || formData.mcq_ids.length === 0 || !formData.time_limit_minutes) {
      setError("Veuillez remplir tous les champs obligatoires (titre, université, limite de temps) et sélectionner au moins un QCM")
      return
    }

    // Validate datetime fields
    if (!formData.start_datetime || !formData.expiry_datetime) {
      setError("Veuillez remplir les deux dates de début et d'expiration")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      // Format datetime values for API
      const examData = {
        ...formData,
        start_datetime: formatDateTimeForAPI(formData.start_datetime),
        expiry_datetime: formatDateTimeForAPI(formData.expiry_datetime),
      }

      if (editingExam) {
        await AdminService.updateMockExam(editingExam.id, examData)
      } else {
        await AdminService.createMockExam(examData)
      }

      resetForm()
      setIsCreateDialogOpen(false)
      await loadMockExams()
    } catch (err: any) {
      setError(err.message || "Échec de l'enregistrement de l'examen blanc")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (exam: PackResponse) => {
    setEditingExam(exam)
    setFormData({
      title: exam.title,
      description: exam.description || "",
      type: exam.type,
      university_id: exam.university_id,
      price: exam.price,
      currency: exam.currency,
      start_datetime: exam.start_datetime,
      expiry_datetime: exam.expiry_datetime,
      display_before_start: exam.display_before_start,
      time_limit_minutes: exam.time_limit_minutes,
      is_published: exam.is_published,
      image_url: exam.image_url || "",
      mcq_ids: exam.mcqs?.map((m) => m.id) || [],
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet examen blanc ?")) return

    try {
      await AdminService.deleteMockExam(id)
      await loadMockExams()
    } catch (err: any) {
      setError(err.message || "Échec de la suppression de l'examen blanc")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "mock_exam",
      university_id: "",
      price: 0,
      currency: "CHF",
      start_datetime: "",
      expiry_datetime: "",
      display_before_start: false,
      time_limit_minutes: null,
      is_published: false,
      image_url: "",
      mcq_ids: [],
    })
    setEditingExam(null)
    setSelectedSubjectId("")
    setSelectedLessonId("")
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open)
    if (!open) {
      resetForm()
      setError("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Examens Blancs</h2>
          <p className="text-muted-foreground">
            Créer et gérer les examens blancs pour les étudiants
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel Examen Blanc
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingExam ? "Modifier l'examen blanc" : "Créer un nouvel examen blanc"}</DialogTitle>
              <DialogDescription>
                Créez un examen blanc en regroupant des QCM avec une limite de temps
              </DialogDescription>
            </DialogHeader>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-4 space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ex. Examen Blanc Final de Physique"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez cet examen blanc"
                  rows={3}
                />
              </div>

              <div>
                <ImageUpload
                  currentImageUrl={formData.image_url}
                  onImageUrlChange={(url) => setFormData({ ...formData, image_url: url })}
                  maxSize={5}
                  allowedFormats={["jpg", "jpeg", "png", "gif", "webp"]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="university">Université *</Label>
                  <Select value={formData.university_id} onValueChange={handleUniversityChange}>
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

                <div>
                  <Label htmlFor="timeLimit">Limite de temps (minutes) *</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    value={formData.time_limit_minutes || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        time_limit_minutes: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="e.g., 180"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="price">Prix *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Devise *</Label>
                  <Select value={formData.currency} onValueChange={(value) =>
                    setFormData({ ...formData, currency: value as "CHF" | "GBP" | "USD" })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CHF">CHF</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startDate">Date de début *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="expiryDate">Date d'expiration *</Label>
                  <Input
                    id="expiryDate"
                    type="datetime-local"
                    value={formData.expiry_datetime}
                    onChange={(e) => setFormData({ ...formData, expiry_datetime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="displayBefore"
                    checked={formData.display_before_start}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, display_before_start: checked as boolean })
                    }
                  />
                  <Label htmlFor="displayBefore">Afficher avant la date de début</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="publish"
                    checked={formData.is_published}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_published: checked as boolean })
                    }
                  />
                  <Label htmlFor="publish">Publier immédiatement</Label>
                </div>
              </div>

              <div>
                <Label>Sélectionner des QCM *</Label>
                <div className="border rounded-md p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subjectSelect" className="text-sm">
                        Matière
                      </Label>
                      <Select value={selectedSubjectId} onValueChange={handleSubjectChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une matière" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="lessonSelect" className="text-sm">
                        Leçon
                      </Label>
                      <Select value={selectedLessonId} onValueChange={handleLessonChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une leçon" />
                        </SelectTrigger>
                        <SelectContent>
                          {lessons.map((lesson) => (
                            <SelectItem key={lesson.id} value={lesson.id}>
                              {lesson.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {availableMCQs.length > 0 && (
                    <div>
                      <Label className="text-sm">QCM disponibles</Label>
                      <div className="h-40 border rounded-md p-2 overflow-y-auto">
                        <div className="space-y-1">
                          {availableMCQs.map((mcq) => (
                            <div
                              key={mcq.id}
                              className="flex items-center justify-between p-2 hover:bg-muted rounded"
                            >
                              <label className="text-sm flex-1 cursor-pointer">
                                <input 
                                  type="checkbox"
                                  className="mr-2"
                                  checked={formData.mcq_ids.includes(mcq.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleAddMCQ(mcq.id)
                                    } else {
                                      handleRemoveMCQ(mcq.id)
                                    }
                                  }}
                                />
                                {mcq.title}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.mcq_ids.length > 0 && (
                    <div>
                      <Label className="text-sm">QCM sélectionnés ({formData.mcq_ids.length})</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.mcq_ids.map((mcqId) => {
                          const mcq = availableMCQs.find((m) => m.id === mcqId) ||
                            mockExams
                              .flatMap((e) => e.mcqs || [])
                              .find((m) => m.id === mcqId)
                          return (
                            <Badge key={mcqId} variant="secondary" className="flex items-center gap-1">
                              {mcq?.title || mcqId}
                              <button
                                type="button"
                                onClick={() => handleRemoveMCQ(mcqId)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : editingExam ? (
                    "Mettre à jour l'examen blanc"
                  ) : (
                    "Créer l'examen blanc"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-end flex-wrap">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher des examens blancs..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(0)
            }}
          />
        </div>
        
        {/* University Filter */}
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filtrer par université :</label>
          <Select value={selectedUniversityId} onValueChange={(value) => {
            setSelectedUniversityId(value)
            setCurrentPage(0)
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Toutes les universités" />
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
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="rounded-lg border bg-background overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Université</TableHead>
                  <TableHead>Limite de temps</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>QCM</TableHead>
                  <TableHead>Publié</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(mockExams || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun examen blanc trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  mockExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell>
                        <img
                          src={exam.image_url || "https://via.placeholder.com/50?text=No+Image"}
                          alt={exam.title}
                          className="h-12 w-12 rounded object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement
                            img.src = "https://via.placeholder.com/50?text=No+Image"
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{exam.title}</TableCell>
                      <TableCell>{exam.university_name || exam.university_id}</TableCell>
                      <TableCell>
                        {exam.time_limit_minutes ? `${exam.time_limit_minutes} min` : "Illimité"}
                      </TableCell>
                      <TableCell>
                        {exam.price} {exam.currency}
                      </TableCell>
                      <TableCell>{exam.mcqs?.length || 0}</TableCell>
                      <TableCell>
                        <Badge variant={exam.is_published ? "default" : "secondary"}>
                          {exam.is_published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(exam)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(exam.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {mockExams.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage + 1}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={mockExams.length < itemsPerPage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
