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
import { AdminService, Subject, University } from "@/lib/admin-service"
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

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [universities, setUniversities] = useState<University[]>([])
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
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load subjects and universities on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError("")
      const [subjectsData, universitiesData] = await Promise.all([
        AdminService.getSubjects(),
        AdminService.getUniversities(),
      ])
      setSubjects(subjectsData)
      setUniversities(universitiesData)
    } catch (err: any) {
      setError(err.message || "Échec du chargement des données")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSubject = async () => {
    if (!formName.trim()) {
      setError("Le nom du sujet est requis")
      return
    }
    if (!formUniversityId) {
      setError("La sélection de l'université est requise")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")
      const newSubject = await AdminService.createSubject({
        name: formName,
        university_id: formUniversityId,
      })
      setSubjects([newSubject, ...subjects])
      setFormName("")
      setFormUniversityId("")
      setAddDialogOpen(false)
    } catch (err: any) {
      setError(err.message || "Échec de l'ajout du sujet")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubject = async () => {
    if (!editingSubject) return
    if (!formName.trim()) {
      setError("Le nom du sujet est requis")
      return
    }
    if (!formUniversityId) {
      setError("La sélection de l'université est requise")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")
      const updatedSubject = await AdminService.updateSubject(
        editingSubject.id,
        {
          name: formName,
          university_id: formUniversityId,
        }
      )
      setSubjects(
        subjects.map((s) =>
          s.id === editingSubject.id ? updatedSubject : s
        )
      )
      setFormName("")
      setFormUniversityId("")
      setEditingSubject(null)
      setEditDialogOpen(false)
    } catch (err: any) {
      setError(err.message || "Échec de la mise à jour du sujet")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSubject = async () => {
    if (!deletingSubject) return

    try {
      setIsSubmitting(true)
      setError("")
      await AdminService.deleteSubject(deletingSubject.id)
      setSubjects(subjects.filter((s) => s.id !== deletingSubject.id))
      setDeleteAlertOpen(false)
      setDeletingSubject(null)
    } catch (err: any) {
      setError(err.message || "Échec de la suppression du sujet")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject)
    setFormName(subject.name)
    setFormUniversityId(subject.university_id)
    setEditDialogOpen(true)
  }

  const openDeleteAlert = (subject: Subject) => {
    setDeletingSubject(subject)
    setDeleteAlertOpen(true)
  }

  const getUniversityName = (universityId: string) => {
    return universities.find((u) => u.id === universityId)?.name || "Inconnue"
  }

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Gestion des sujets</h2>
        <p className="text-muted-foreground">
          Gérez les sujets qui peuvent être liés aux leçons et aux MCQs. Seuls les administrateurs peuvent accéder à cette page.
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
          placeholder="Rechercher les sujets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:flex-1"
        />
        <Button
          onClick={() => {
            setFormName("")
            setFormUniversityId("")
            setEditingSubject(null)
            setAddDialogOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un sujet
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Subjects Table */}
      {!isLoading && (
        <div className="rounded-lg border bg-background overflow-x-auto">
          {filteredSubjects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Université</TableHead>
                  <TableHead>Créé par</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getUniversityName(subject.university_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>{subject.creator_name || "Inconnu"}</TableCell>
                    <TableCell>
                      {new Date(subject.created_at).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(subject)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteAlert(subject)}
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
              Aucun sujet trouvé. Créez votre premier sujet pour commencer.
            </div>
          )}
        </div>
      )}

      {/* Add Subject Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau sujet</DialogTitle>
            <DialogDescription>
              Créez un nouveau sujet qui peut être lié aux leçons et aux MCQs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom du sujet</label>
              <Input
                placeholder="ex. Mathématiques"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Université</label>
              <Select value={formUniversityId} onValueChange={setFormUniversityId}>
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
              onClick={handleAddSubject}
              disabled={isSubmitting || !formName.trim() || !formUniversityId}
            >
              <span className={isSubmitting ? '' : 'hidden'}>
                <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
              </span>
              Ajouter un sujet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le sujet</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations du sujet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom du sujet</label>
              <Input
                placeholder="ex. Mathématiques"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Université</label>
              <Select value={formUniversityId} onValueChange={setFormUniversityId}>
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
              onClick={handleEditSubject}
              disabled={isSubmitting || !formName.trim() || !formUniversityId}
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
            <AlertDialogTitle>Supprimer le sujet</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong className="text-foreground">{deletingSubject?.name}</strong> ?
              <br />
              <br />
              Cette action ne peut pas être annulée. Toutes les leçons et les contenus
              liés à ce sujet seront également supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubject}
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
