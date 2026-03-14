"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { AdminService, University } from "@/lib/admin-service"
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

export default function UniversitiesPage() {
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
  const [formIsDisplayed, setFormIsDisplayed] = useState(true)
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null)
  const [deletingUniversity, setDeletingUniversity] = useState<University | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load universities on mount
  useEffect(() => {
    loadUniversities()
  }, [])

  const loadUniversities = async () => {
    try {
      setIsLoading(true)
      setError("")
      const data = await AdminService.getUniversities()
      setUniversities(data)
    } catch (err: any) {
      setError(err.message || "Échec du chargement des universités")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUniversity = async () => {
    if (!formName.trim()) {
      setError("Le nom de l'université est requis")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")
      const newUniversity = await AdminService.createUniversity({
        name: formName,
        is_displayed: formIsDisplayed,
      })
      setUniversities([newUniversity, ...universities])
      setFormName("")
      setFormIsDisplayed(true)
      setAddDialogOpen(false)
    } catch (err: any) {
      setError(err.message || "Échec de l'ajout de l'université")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditUniversity = async () => {
    if (!editingUniversity) return
    if (!formName.trim()) {
      setError("Le nom de l'université est requis")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")
      const updatedUniversity = await AdminService.updateUniversity(
        editingUniversity.id,
        {
          name: formName,
          is_displayed: formIsDisplayed,
        }
      )
      setUniversities(
        universities.map((u) =>
          u.id === editingUniversity.id ? updatedUniversity : u
        )
      )
      setFormName("")
      setFormIsDisplayed(true)
      setEditingUniversity(null)
      setEditDialogOpen(false)
    } catch (err: any) {
      setError(err.message || "Échec de la mise à jour de l'université")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUniversity = async () => {
    if (!deletingUniversity) return

    try {
      setIsSubmitting(true)
      setError("")
      await AdminService.deleteUniversity(deletingUniversity.id)
      setUniversities(universities.filter((u) => u.id !== deletingUniversity.id))
      setDeleteAlertOpen(false)
      setDeletingUniversity(null)
    } catch (err: any) {
      setError(err.message || "Échec de la suppression de l'université")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (university: University) => {
    setEditingUniversity(university)
    setFormName(university.name)
    setFormIsDisplayed(university.is_displayed)
    setEditDialogOpen(true)
  }

  const openDeleteAlert = (university: University) => {
    setDeletingUniversity(university)
    setDeleteAlertOpen(true)
  }

  const filteredUniversities = universities.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Gestion des universités</h2>
        <p className="text-muted-foreground">
          Gérez les universités qui peuvent être liées aux sujets et aux leçons. Seuls les administrateurs peuvent accéder à cette page.
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
          placeholder="Rechercher les universités..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:flex-1"
        />
        <Button
          onClick={() => {
            setFormName("")
            setFormIsDisplayed(true)
            setEditingUniversity(null)
            setAddDialogOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter une université
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Universities Table */}
      {!isLoading && (
        <div className="rounded-lg border bg-background overflow-x-auto">
          {filteredUniversities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Affichée</TableHead>
                  <TableHead>Créée par</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUniversities.map((university) => (
                  <TableRow key={university.id}>
                    <TableCell className="font-medium">{university.name}</TableCell>
                    <TableCell>
                      <Badge variant={university.is_displayed ? "default" : "secondary"}>
                        {university.is_displayed ? "Visible" : "Cachée"}
                      </Badge>
                    </TableCell>
                    <TableCell>{university.creator_name || "Inconnu"}</TableCell>
                    <TableCell>
                      {new Date(university.created_at).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(university)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteAlert(university)}
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
              Aucune université trouvée. Créez votre première université pour commencer.
            </div>
          )}
        </div>
      )}

      {/* Add University Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle université</DialogTitle>
            <DialogDescription>
              Créez une nouvelle université qui peut être liée aux sujets et aux leçons.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom de l'université</label>
              <Input
                placeholder="ex. Université Harvard"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_displayed"
                checked={formIsDisplayed}
                onCheckedChange={(checked) => setFormIsDisplayed(checked as boolean)}
              />
              <label
                htmlFor="is_displayed"
                className="text-sm font-medium cursor-pointer"
              >
                Afficher cette université sur le frontend
              </label>
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
              onClick={handleAddUniversity}
              disabled={isSubmitting || !formName.trim()}
            >
              <span className={isSubmitting ? '' : 'hidden'}>
                <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
              </span>
              Ajouter une université
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit University Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'université</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de l'université.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom de l'université</label>
              <Input
                placeholder="ex. Université Harvard"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit_is_displayed"
                checked={formIsDisplayed}
                onCheckedChange={(checked) => setFormIsDisplayed(checked as boolean)}
              />
              <label
                htmlFor="edit_is_displayed"
                className="text-sm font-medium cursor-pointer"
              >
                Afficher cette université sur le frontend
              </label>
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
              onClick={handleEditUniversity}
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
            <AlertDialogTitle>Supprimer l'université</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong className="text-foreground">{deletingUniversity?.name}</strong> ?
              <br />
              <br />
              Cette action ne peut pas être annulée. Tous les sujets, les leçons et autres contenus
              liés à cette université seront également supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUniversity}
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
