"use client"

import { useState, useEffect } from "react"
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
import { Loader2, Plus, Trash2, Edit2, AlertCircle } from "lucide-react"
import { AdminService, Lesson, University, Subject } from "@/lib/admin-service"
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

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)

  // Form states
  const [formName, setFormName] = useState("")
  const [formUniversityId, setFormUniversityId] = useState("")
  const [formSubjectId, setFormSubjectId] = useState("")
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError("")
      const [lessonsData, universitiesData, subjectsData] = await Promise.all([
        AdminService.getLessons(),
        AdminService.getUniversities(),
        AdminService.getSubjects(),
      ])
      setLessons(lessonsData)
      setUniversities(universitiesData)
      setSubjects(subjectsData)
    } catch (err: any) {
      setError(err.message || "Échec du chargement des données")
    } finally {
      setIsLoading(false)
    }
  }

  // Filter subjects based on selected university
  const filteredSubjects = formUniversityId
    ? subjects.filter((s) => s.university_id === formUniversityId)
    : []

  const handleAddLesson = async () => {
    if (!formName.trim()) {
      setError("Le nom de la leçon est requis")
      return
    }
    if (!formUniversityId) {
      setError("La sélection de l'université est requise")
      return
    }
    if (!formSubjectId) {
      setError("La sélection du sujet est requise")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")
      const newLesson = await AdminService.createLesson({
        name: formName,
        university_id: formUniversityId,
        subject_id: formSubjectId,
      })
      setLessons([newLesson, ...lessons])
      setFormName("")
      setFormUniversityId("")
      setFormSubjectId("")
      setAddDialogOpen(false)
    } catch (err: any) {
      setError(err.message || "Échec de l'ajout de la leçon")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditLesson = async () => {
    if (!editingLesson) return
    if (!formName.trim()) {
      setError("Le nom de la leçon est requis")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")
      const updatedLesson = await AdminService.updateLesson(
        editingLesson.id,
        {
          name: formName,
        }
      )
      setLessons(
        lessons.map((l) =>
          l.id === editingLesson.id ? updatedLesson : l
        )
      )
      setFormName("")
      setFormUniversityId("")
      setFormSubjectId("")
      setEditingLesson(null)
      setEditDialogOpen(false)
    } catch (err: any) {
      setError(err.message || "Échec de la mise à jour de la leçon")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLesson = async () => {
    if (!deletingLesson) return

    try {
      setIsSubmitting(true)
      setError("")
      await AdminService.deleteLesson(deletingLesson.id)
      setLessons(lessons.filter((l) => l.id !== deletingLesson.id))
      setDeleteAlertOpen(false)
      setDeletingLesson(null)
    } catch (err: any) {
      setError(err.message || "Échec de la suppression de la leçon")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setFormName(lesson.name)
    setFormUniversityId(lesson.university_id)
    setFormSubjectId(lesson.subject_id)
    setEditDialogOpen(true)
  }

  const openDeleteAlert = (lesson: Lesson) => {
    setDeletingLesson(lesson)
    setDeleteAlertOpen(true)
  }

  const getUniversityName = (universityId: string) => {
    return universities.find((u) => u.id === universityId)?.name || "Inconnue"
  }

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.name || "Inconnu"
  }

  const filteredLessons = lessons.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Gestion des leçons</h2>
        <p className="text-muted-foreground">
          Gérez les leçons qui peuvent être liées aux MCQs et aux contenus pédagogiques. Seuls les administrateurs peuvent accéder à cette page.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Rechercher les leçons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:flex-1"
        />
        <Button
          onClick={() => {
            setFormName("")
            setFormUniversityId("")
            setFormSubjectId("")
            setEditingLesson(null)
            setAddDialogOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter une leçon
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Lessons Table */}
      {!isLoading && (
        <div className="rounded-lg border bg-background overflow-x-auto">
          {filteredLessons.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Université</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Créé par</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">{lesson.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getUniversityName(lesson.university_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getSubjectName(lesson.subject_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>{lesson.creator_name || "Inconnu"}</TableCell>
                    <TableCell>
                      {new Date(lesson.created_at).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(lesson)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteAlert(lesson)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Aucune leçon trouvée. Créez votre première leçon pour commencer.
            </div>
          )}
        </div>
      )}

      {/* Add Lesson Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle leçon</DialogTitle>
            <DialogDescription>
              Créez une nouvelle leçon liée à une université et un sujet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Université</label>
              <Select value={formUniversityId} onValueChange={(value) => {
                setFormUniversityId(value)
                setFormSubjectId("") // Reset subject when university changes
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une université" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((university) => (
                    <SelectItem key={university.id} value={university.id}>
                      {university.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formUniversityId && (
              <div>
                <label className="block text-sm font-medium mb-2">Sujet</label>
                <Select value={formSubjectId} onValueChange={setFormSubjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un sujet" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Nom de la leçon</label>
              <Input
                placeholder="ex. Introduction aux Mathématiques"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddLesson}
              disabled={isSubmitting || !formName.trim() || !formUniversityId || !formSubjectId}
            >
              <span className={isSubmitting ? '' : 'hidden'}>
                <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
              </span>
              Ajouter une leçon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la leçon</DialogTitle>
            <DialogDescription>
              Mettez à jour le nom de la leçon.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Université</label>
              <div className="px-3 py-2 rounded-md border border-input bg-muted text-sm">
                {getUniversityName(formUniversityId)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sujet</label>
              <div className="px-3 py-2 rounded-md border border-input bg-muted text-sm">
                {getSubjectName(formSubjectId)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nom de la leçon</label>
              <Input
                placeholder="ex. Introduction aux Mathématiques"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleEditLesson}
              disabled={isSubmitting || !formName.trim()}
            >
              <span className={isSubmitting ? '' : 'hidden'}>
                <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
              </span>
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la leçon</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong className="text-foreground">{deletingLesson?.name}</strong> ?
              <br />
              <br />
              Cette action ne peut pas être annulée. Tous les MCQs et les contenus
              liés à cette leçon seront également supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <span className={isSubmitting ? '' : 'hidden'}>
                <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
              </span>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
