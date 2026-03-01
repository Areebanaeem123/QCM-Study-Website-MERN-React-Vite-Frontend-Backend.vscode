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

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "pack" as "pack" | "mock_exam",
    university_id: "",
    price: 0,
    currency: "CHF" as "CHF" | "GBP" | "USD",
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
      setError(err.message || "Failed to load packs")
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
      setError("Please fill in all required fields and select at least one MCQ")
      return
    }

    // Validate datetime fields
    if (!formData.start_datetime || !formData.expiry_datetime) {
      setError("Please fill in both start and expiry dates")
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
      setError(err.message || "Failed to save pack")
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
    if (!confirm("Are you sure you want to delete this pack?")) return

    try {
      await AdminService.deletePack(id)
      await loadPacks()
    } catch (err: any) {
      setError(err.message || "Failed to delete pack")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "pack",
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

  const filteredPacks = packs || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {packType === "mock_exam" ? "Mock Exams" : "Packs"}
          </h2>
          <p className="text-muted-foreground">
            Create and manage learning packs and mock exams
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              New Pack
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingPack ? "Edit Pack" : "Create New Pack"}</DialogTitle>
              <DialogDescription>
                Create a pack or mock exam by grouping MCQs together
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
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Biology 101"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this pack"
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
                      <SelectItem value="mock_exam">Mock Exam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="university">University *</Label>
                  <Select value={formData.university_id} onValueChange={handleUniversityChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select university" />
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
                  <Label htmlFor="price">Price *</Label>
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
                  <Label htmlFor="currency">Currency *</Label>
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
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    type="datetime-local"
                    value={formData.expiry_datetime}
                    onChange={(e) => setFormData({ ...formData, expiry_datetime: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
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
                    placeholder="Leave empty for unlimited"
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
                  <Label htmlFor="displayBefore">Display Before Start Date</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="publish"
                    checked={formData.is_published}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_published: checked as boolean })
                    }
                  />
                  <Label htmlFor="publish">Publish Immediately</Label>
                </div>
              </div>

              <div>
                <Label>Select MCQs *</Label>
                <div className="border rounded-md p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subjectSelect" className="text-sm">
                        Subject
                      </Label>
                      <Select value={selectedSubjectId} onValueChange={handleSubjectChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
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
                        Lesson
                      </Label>
                      <Select value={selectedLessonId} onValueChange={handleLessonChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lesson" />
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
                      <Label className="text-sm">Available MCQs</Label>
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
                      <Label className="text-sm">Selected MCQs ({formData.mcq_ids.length})</Label>
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
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingPack ? (
                    "Update Pack"
                  ) : (
                    "Create Pack"
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
          All
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
          Mock Exams
        </Button>
      </div>

      {/* University Filter */}
      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium text-muted-foreground">Filter by University:</label>
        <Select value={selectedUniversityId} onValueChange={(value) => {
          setSelectedUniversityId(value)
          setCurrentPage(0)
        }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Universities" />
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
          placeholder="Search packs..."
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
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>MCQs</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No packs found
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
                      <TableCell className="font-medium">{pack.title}</TableCell>
                      <TableCell>
                        <Badge variant={pack.type === "pack" ? "default" : "secondary"}>
                          {pack.type === "pack" ? "Pack" : "Mock Exam"}
                        </Badge>
                      </TableCell>
                      <TableCell>{pack.university_name || pack.university_id}</TableCell>
                      <TableCell>
                        {pack.price} {pack.currency}
                      </TableCell>
                      <TableCell>{pack.mcqs?.length || 0}</TableCell>
                      <TableCell>
                        <Badge variant={pack.is_published ? "default" : "secondary"}>
                          {pack.is_published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(pack)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
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
    </div>
  )
}
