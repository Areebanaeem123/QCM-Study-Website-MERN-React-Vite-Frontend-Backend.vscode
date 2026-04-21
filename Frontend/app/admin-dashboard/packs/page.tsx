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
import { AdminService, PackResponse, University, Subject, Lesson, MCQ, PackPurchaser, PackReview, User } from "@/lib/admin-service"
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle, X, ChevronLeft, ChevronRight, BarChart3, Eye, Star, User as UserIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPacksPage() {
  const router = useRouter()
  const [packs, setPacks] = useState<PackResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [packType, setPackType] = useState<"pack" | "mock_exam" | "">("")
  const [selectedUniversityId, setSelectedUniversityId] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingPack, setEditingPack] = useState<PackResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 10
  
  // Stats and Demo state
  const [selectedPackStats, setSelectedPackStats] = useState<PackResponse | null>(null)
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false)
  const [purchasers, setPurchasers] = useState<PackPurchaser[]>([])
  const [reviews, setReviews] = useState<PackReview[]>([])
  const [loadingStats, setLoadingStats] = useState(false)
  const [demoPack, setDemoPack] = useState<PackResponse | null>(null)
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [userSearchResults, setUserSearchResults] = useState<User[]>([])
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "pack" as "pack" | "mock_exam",
    university_id: "",
    price: 0,
    currency: "CHF" as "CHF" | "GBP" | "USD" | "EUR" | "TND",
    start_datetime: "",
    expiry_datetime: "",
    display_before_start: false,
    time_limit_minutes: null as number | null,
    is_published: false,
    image_url: "" as string,
    mcq_ids: [] as string[],
  })

  // MCQ selection state
  const [universities, setUniversities] = useState<University[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [availableMCQs, setAvailableMCQs] = useState<MCQ[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [selectedLessonId, setSelectedLessonId] = useState("")

  // Load packs
  useEffect(() => {
    loadPacks()
    loadUniversities()
  }, [search, packType, selectedUniversityId, currentPage])

  const loadPacks = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await AdminService.getPacks(
        packType || undefined,
        selectedUniversityId || undefined,
        search || undefined,
        currentPage * itemsPerPage,
        itemsPerPage
      )
      setPacks(response.items)
    } catch (err: any) {
      setError(err.message || "Échec du chargement des packs")
    } finally {
      setLoading(false)
    }
  }

  const loadUniversities = async () => {
    try {
      const response = await AdminService.getUniversities()
      setUniversities(response)
    } catch (err: any) {
      console.error("Échec du chargement des universités")
      setUniversities([])
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
      console.error("Échec du chargement des matières")
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
      console.error("Échec du chargement des leçons")
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
    // Convert from "2026-03-01T12:30" to ISO 8601 with UTC timezone "2026-03-01T12:30:00Z"
    // Input format from datetime-local is "YYYY-MM-DDTHH:mm"
    let result = dateTimeStr
    // Check if we need to add seconds (format is HH:mm)
    const parts = result.split("T")
    if (parts[1] && parts[1].split(":").length === 2) {
      // Add seconds
      result = result + ":00"
    }
    // Add timezone if not present
    if (!result.endsWith("Z") && !result.includes("+")) {
      result = result + "Z"
    }
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.university_id || formData.mcq_ids.length === 0) {
      setError("Veuillez remplir tous les champs obligatoires et sélectionner au moins un QCM")
      return
    }

    // Validate datetime fields
    if (!formData.start_datetime || !formData.expiry_datetime) {
      setError("Veuillez remplir les dates de début et d'expiration")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      // Format datetime values for API
      const packData = {
        ...formData,
        start_datetime: formatDateTimeForAPI(formData.start_datetime),
        expiry_datetime: formatDateTimeForAPI(formData.expiry_datetime),
      }

      if (editingPack) {
        await AdminService.updatePack(editingPack.id, packData)
      } else {
        await AdminService.createPack(packData)
      }

      resetForm()
      setIsCreateDialogOpen(false)
      await loadPacks()
    } catch (err: any) {
      setError(err.message || "Échec de l'enregistrement du pack")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (pack: PackResponse) => {
    setEditingPack(pack)
    setFormData({
      title: pack.title,
      description: pack.description || "",
      type: pack.type,
      university_id: pack.university_id,
      price: pack.price,
      currency: pack.currency,
      start_datetime: pack.start_datetime,
      expiry_datetime: pack.expiry_datetime,
      display_before_start: pack.display_before_start,
      time_limit_minutes: pack.time_limit_minutes,
      is_published: pack.is_published,
      image_url: pack.image_url || "",
      mcq_ids: pack.mcqs?.map((m) => m.id) || [],
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce pack ?")) return

    try {
      await AdminService.deletePack(id)
      await loadPacks()
    } catch (err: any) {
      setError(err.message || "Échec de la suppression du pack")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "pack",
      university_id: "",
      price: 0,
      currency: "CHF", // Can be any of the union types, starting with default
      start_datetime: "",
      expiry_datetime: "",
      display_before_start: false,
      time_limit_minutes: null,
      is_published: false,
      image_url: "",
      mcq_ids: [],
    })
    setEditingPack(null)
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

  const handleViewStats = async (pack: PackResponse) => {
    setSelectedPackStats(pack)
    setIsStatsDialogOpen(true)
    setLoadingStats(true)
    try {
      const purchasersData = await AdminService.getPackPurchasers(pack.id)
      const reviewsData = await AdminService.getPackReviews(pack.id)
      setPurchasers(purchasersData)
      setReviews(reviewsData)
    } catch (err: any) {
      console.error("Échec du chargement des statistiques du pack", err)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleGiftPack = async (userId: string, packId: string) => {
    try {
      await AdminService.grantPackToUser(userId, packId)
      // Reload purchasers to show update
      const updated = await AdminService.getPackPurchasers(packId)
      setPurchasers(updated)
    } catch (err: any) {
      alert(err.message || "Échec de l'attribution du pack")
    }
  }

  const handleRevokePack = async (userId: string, packId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir révoquer ce pack ?")) return
    try {
      await AdminService.revokePackFromUser(userId, packId)
      // Reload purchasers to show update
      const updated = await AdminService.getPackPurchasers(packId)
      setPurchasers(updated)
    } catch (err: any) {
      alert(err.message || "Échec de la révocation du pack")
    }
  }

  const handleUserSearch = async () => {
    if (!userSearchQuery.trim()) return
    setIsSearchingUsers(true)
    try {
      const response = await AdminService.getUsers(userSearchQuery, "alphabetical", 0, 5)
      setUserSearchResults(response.items)
    } catch (err: any) {
      console.error("Échec de la recherche d'utilisateurs", err)
    } finally {
      setIsSearchingUsers(false)
    }
  }

  const filteredPacks = packs || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {packType === "mock_exam" ? "Examens Blancs" : "Packs"}
          </h2>
          <p className="text-muted-foreground">
            Créez et gérez les packs d'apprentissage et les examens blancs
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Pack
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingPack ? "Modifier le pack" : "Créer un nouveau pack"}</DialogTitle>
              <DialogDescription>
                Créez un pack ou un examen blanc en regroupant des QCM
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
                  placeholder="ex. Biologie 101"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez ce pack"
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
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as "pack" | "mock_exam" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pack">Pack</SelectItem>
                      <SelectItem value="mock_exam">Examen Blanc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                  <Label htmlFor="price">Prix *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Devise *</Label>
                  <Select value={formData.currency} onValueChange={(value) =>
                    setFormData({ ...formData, currency: value as "CHF" | "GBP" | "USD" | "EUR" | "TND" })
                  }>
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

                <div>
                  <Label htmlFor="startDate">Date de Début *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="expiryDate">Date d'Expiration *</Label>
                  <Input
                    id="expiryDate"
                    type="datetime-local"
                    value={formData.expiry_datetime}
                    onChange={(e) => setFormData({ ...formData, expiry_datetime: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="timeLimit">Limite de Temps (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="0"
                    value={formData.time_limit_minutes || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        time_limit_minutes: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="Laissez vide pour illimité"
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
                      <Label className="text-sm">QCM Disponibles</Label>
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
                      <Label className="text-sm">QCM Sélectionnés ({formData.mcq_ids.length})</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.mcq_ids.map((mcqId) => {
                          const mcq = availableMCQs.find((m) => m.id === mcqId) ||
                            packs
                              .flatMap((p) => p.mcqs || [])
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
                  ) : editingPack ? (
                    "Mettre à jour le pack"
                  ) : (
                    "Créer le pack"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2">
        <Button
          variant={packType === "" ? "default" : "outline"}
          onClick={() => {
            setPackType("")
            setCurrentPage(0)
          }}
        >
          Tous
        </Button>
        <Button
          variant={packType === "pack" ? "default" : "outline"}
          onClick={() => {
            setPackType("pack")
            setCurrentPage(0)
          }}
        >
          Packs
        </Button>
        <Button
          variant={packType === "mock_exam" ? "default" : "outline"}
          onClick={() => {
            setPackType("mock_exam")
            setCurrentPage(0)
          }}
        >
          Examens Blancs
        </Button>
      </div>

      {/* University Filter */}
      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium text-muted-foreground">Filtrer par université :</label>
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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher des packs..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setCurrentPage(0)
          }}
        />
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
                  <TableHead>Dates</TableHead>
                  <TableHead>Université</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Ventes/Note</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Aucun pack trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPacks.map((pack) => (
                    <TableRow key={pack.id}>
                      <TableCell>
                        <img
                          src={pack.image_url || "https://via.placeholder.com/50?text=No+Image"}
                          alt={pack.title}
                          className="h-12 w-12 rounded object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement
                            img.src = "https://via.placeholder.com/50?text=No+Image"
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{pack.title}</div>
                        <Badge variant={pack.type === "pack" ? "default" : "secondary"} className="text-[10px] h-4 mt-1">
                          {pack.type === "pack" ? "Pack" : "Examen Blanc"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="text-muted-foreground">Du: {new Date(pack.start_datetime).toLocaleDateString()}</div>
                        <div className="text-destructive">Au: {new Date(pack.expiry_datetime).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>{pack.university_name || pack.university_id}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {pack.academic_sessions?.length ? (
                            pack.academic_sessions.map((session, idx) => (
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
                        <div className="font-semibold">{pack.price} {pack.currency}</div>
                        <div className="text-xs text-muted-foreground">{pack.mcqs?.length || 0} QCM</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-sm">
                            <UserIcon className="h-3 w-3 text-blue-500" />
                            <span>{pack.sales_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span>{pack.average_rating || 0}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={pack.is_published ? "default" : "secondary"}>
                          {pack.is_published ? "Publié" : "Brouillon"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            title="Voir les statistiques"
                            onClick={() => handleViewStats(pack)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            title="Mode Démo"
                            onClick={() => setDemoPack(pack)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            title="Modifier"
                            onClick={() => handleEdit(pack)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            title="Supprimer"
                            onClick={() => handleDelete(pack.id)}
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
          {filteredPacks.length > 0 && (
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
                  disabled={filteredPacks.length < itemsPerPage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      {/* Stats Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Statistiques du pack: {selectedPackStats?.title}</DialogTitle>
            <DialogDescription>
              Acheteurs, évaluations et performances du pack
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="purchasers" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="purchasers">Étudiants ({purchasers.length})</TabsTrigger>
              <TabsTrigger value="reviews">Évaluations ({reviews.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="purchasers" className="flex-1 overflow-y-auto mt-4 space-y-6">
              {/* User Search for Gifting */}
              <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Offrir ce pack à un étudiant
                </h4>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Chercher par nom ou email..." 
                      className="pl-9"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUserSearch()}
                    />
                  </div>
                  <Button onClick={handleUserSearch} disabled={isSearchingUsers}>
                    {isSearchingUsers ? <Loader2 className="h-4 w-4 animate-spin" /> : "Chercher"}
                  </Button>
                </div>

                {userSearchResults.length > 0 && (
                  <div className="mt-4 border rounded-md bg-background divide-y">
                    {userSearchResults.map((u) => (
                      <div key={u.id} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            handleGiftPack(u.id, selectedPackStats!.id)
                            setUserSearchQuery("")
                            setUserSearchResults([])
                          }}
                        >
                          Offrir
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {loadingStats ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date d'achat</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchasers.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-4">Aucun acheteur</TableCell></TableRow>
                    ) : (
                      purchasers.map((p) => (
                        <TableRow key={p.student_id}>
                          <TableCell>{p.first_name} {p.last_name}</TableCell>
                          <TableCell>{p.email}</TableCell>
                          <TableCell>{new Date(p.purchased_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={p.gifted ? "secondary" : "outline"}>
                              {p.gifted ? "Cadeau" : "Achat"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleRevokePack(p.student_id, selectedPackStats!.id)}
                            >
                              Révoquer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="flex-1 overflow-y-auto mt-4">
              {loadingStats ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
              ) : (
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">Aucune évaluation pour le moment</div>
                  ) : (
                    reviews.map((r, i) => (
                      <div key={i} className="border rounded-md p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{r.student_name}</div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, idx) => (
                              <Star 
                                key={idx} 
                                className={`h-4 w-4 ${idx < r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm italic">"{r.comment || 'Aucun commentaire'}"</p>
                        <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Demo Mode Overlay */}
      {demoPack && (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur pb-4 border-b">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setDemoPack(null)}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Mode Démo: {demoPack.title}</h1>
                  <p className="text-muted-foreground">{demoPack.university_name} • {demoPack.mcqs?.length || 0} Questions</p>
                </div>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-1">Aperçu Étudiant</Badge>
            </div>

            <div className="space-y-6">
              {demoPack.mcqs?.map((mcq, index) => (
                <div key={mcq.id} className="border rounded-lg p-6 space-y-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Question {index + 1}</Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/admin-dashboard/mcqs?search=${encodeURIComponent(mcq.title)}`)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" /> Modifier le QCM
                    </Button>
                  </div>
                  <h3 className="text-xl font-semibold">{mcq.title}</h3>
                  <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: mcq.question_text }} />
                  <div className="grid gap-2 pt-2">
                    {/* Placeholder for options if needed in demo */}
                    <div className="text-sm italic text-muted-foreground p-3 border border-dashed rounded bg-background">
                      Les options et les réponses sont masquées dans la vue en liste du mode démo. Utilisez "Modifier" pour voir tous les détails.
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {demoPack.mcqs?.length === 0 && (
              <div className="text-center py-20 border border-dashed rounded-lg">
                <p className="text-muted-foreground">Ce pack ne contient aucune question.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
