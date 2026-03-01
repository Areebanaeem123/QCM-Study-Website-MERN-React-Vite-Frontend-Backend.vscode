"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Loader2,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
} from "lucide-react"
import {
  AdminService,
  QuestionType,
  CreateQuestionTypeRequest,
  UpdateQuestionTypeRequest,
} from "@/lib/admin-service"

export default function AdminQuestionTypesPage() {
  // List states
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)

  // Form states
  const [formName, setFormName] = useState("")
  const [formNumberOfOptions, setFormNumberOfOptions] = useState("")
  const [formAnswerMode, setFormAnswerMode] = useState<
    "single_correct" | "true_false_per_option"
  >("single_correct")
  const [formPartialCredit, setFormPartialCredit] = useState("")

  // Action states
  const [editingType, setEditingType] = useState<QuestionType | null>(null)
  const [deletingType, setDeletingType] = useState<QuestionType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load question types
  const loadQuestionTypes = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")
      const data = await AdminService.getQuestionTypes()
      setQuestionTypes(data)
    } catch (err: any) {
      setError(err.message || "Failed to load question types")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load on mount
  useEffect(() => {
    loadQuestionTypes()
  }, [loadQuestionTypes])

  // Filtered question types based on search
  const filteredTypes = questionTypes.filter((type) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Reset form
  const resetForm = () => {
    setFormName("")
    setFormNumberOfOptions("")
    setFormAnswerMode("single_correct")
    setFormPartialCredit("")
    setEditingType(null)
  }

  // Open edit dialog
  const openEditDialog = (type: QuestionType) => {
    setEditingType(type)
    setFormName(type.name)
    setFormNumberOfOptions(type.number_of_options.toString())
    setFormAnswerMode(type.answer_mode)
    setFormPartialCredit(
      type.partial_credit !== null ? type.partial_credit.toString() : ""
    )
    setEditDialogOpen(true)
  }

  // Handle add question type
  const handleAddQuestionType = async () => {
    // Validation
    if (!formName.trim()) {
      setError("Type name is required")
      return
    }
    if (!formNumberOfOptions || parseInt(formNumberOfOptions) < 1) {
      setError("Number of options must be at least 1")
      return
    }
    if (
      formAnswerMode === "true_false_per_option" &&
      (!formPartialCredit || parseFloat(formPartialCredit) < 0)
    ) {
      setError(
        "Partial credit is required for 'Assess each option' mode and must be >= 0"
      )
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      const request: CreateQuestionTypeRequest = {
        name: formName.trim(),
        number_of_options: parseInt(formNumberOfOptions),
        answer_mode: formAnswerMode,
        partial_credit:
          formAnswerMode === "true_false_per_option"
            ? parseFloat(formPartialCredit)
            : null,
      }

      const newType = await AdminService.createQuestionType(request)
      setQuestionTypes([newType, ...questionTypes])
      
      setAddDialogOpen(false)
      resetForm()
    } catch (err: any) {
      setError(err.message || "Failed to create question type")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit question type
  const handleEditQuestionType = async () => {
    if (!editingType) return

    // Validation
    if (!formName.trim()) {
      setError("Type name is required")
      return
    }
    if (!formNumberOfOptions || parseInt(formNumberOfOptions) < 1) {
      setError("Number of options must be at least 1")
      return
    }
    if (
      formAnswerMode === "true_false_per_option" &&
      (!formPartialCredit || parseFloat(formPartialCredit) < 0)
    ) {
      setError(
        "Partial credit is required for 'Assess each option' mode and must be >= 0"
      )
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      const request: UpdateQuestionTypeRequest = {
        name: formName.trim(),
        number_of_options: parseInt(formNumberOfOptions),
        answer_mode: formAnswerMode,
        partial_credit:
          formAnswerMode === "true_false_per_option"
            ? parseFloat(formPartialCredit)
            : null,
      }

      const updatedType = await AdminService.updateQuestionType(
        editingType.id,
        request
      )
      setQuestionTypes(
        questionTypes.map((t) => (t.id === editingType.id ? updatedType : t))
      )
      
      setEditDialogOpen(false)
      resetForm()
    } catch (err: any) {
      setError(err.message || "Failed to update question type")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete question type
  const handleDeleteQuestionType = async () => {
    if (!deletingType) return

    try {
      setIsSubmitting(true)
      setError("")

      await AdminService.deleteQuestionType(deletingType.id)
      setQuestionTypes(questionTypes.filter((t) => t.id !== deletingType.id))
      
      setDeleteAlertOpen(false)
      setDeletingType(null)
    } catch (err: any) {
      setError(err.message || "Failed to delete question type")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAnswerModeLabel = (mode: string) => {
    return mode === "single_correct" ? "Select Answer" : "Assess Each Option"
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold">Types de Questions</h2>
        <p className="text-muted-foreground">
          Gérez les types de questions disponibles pour les QCM.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Management Section */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Gestion des Types</h3>
          <Button
            onClick={() => {
              resetForm()
              setAddDialogOpen(true)
            }}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau Type
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Rechercher par nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Question Types Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Nom du Type</TableHead>
                  <TableHead className="w-1/4">Nombre d'Options</TableHead>
                  <TableHead className="w-1/4">Mode de Réponse</TableHead>
                  <TableHead className="w-1/4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? "Aucun type ne correspond à votre recherche."
                          : "Aucun type trouvé. Créez votre premier type."}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>{type.number_of_options}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getAnswerModeLabel(type.answer_mode)}
                        </Badge>
                        {type.partial_credit !== null && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({(type.partial_credit * 100).toFixed(0)}% partial)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(type)}
                          disabled={isSubmitting}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeletingType(type)
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
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={addDialogOpen || editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAddDialogOpen(false)
            setEditDialogOpen(false)
            setError("")
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingType ? "Modifier le Type" : "Ajouter un Nouveau Type"}
            </DialogTitle>
            <DialogDescription>
              Définissez les paramètres du type de question.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Type Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom du Type *
              </label>
              <Input
                placeholder="Ex: QCM simple, QCM complexe, etc."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {/* Number of Options */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre d'Options *
              </label>
              <Input
                type="number"
                min="1"
                placeholder="4, 5, 10, etc."
                value={formNumberOfOptions}
                onChange={(e) => setFormNumberOfOptions(e.target.value)}
              />
            </div>

            {/* Answer Mode */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Mode de Réponse *
              </label>
              <Select
                value={formAnswerMode}
                onValueChange={(value: any) => setFormAnswerMode(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_correct">
                    <div>
                      <div className="font-medium">Choisir la Bonne Réponse</div>
                      <div className="text-xs text-muted-foreground">
                        L'étudiant choisit une réponse correcte = 1 point
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="true_false_per_option">
                    <div>
                      <div className="font-medium">Évaluer Chaque Option</div>
                      <div className="text-xs text-muted-foreground">
                        L'étudiant évalue chaque option V/F
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Partial Credit */}
            {formAnswerMode === "true_false_per_option" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Points pour Réponse Partielle *
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    placeholder="0.25, 0.5, etc."
                    value={formPartialCredit}
                    onChange={(e) => setFormPartialCredit(e.target.value)}
                  />
                  <span className="text-sm text-muted-foreground">
                    (0 à 1)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Points attribués si certaines options sont correctes
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false)
                setEditDialogOpen(false)
                setError("")
                resetForm()
              }}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={
                editingType ? handleEditQuestionType : handleAddQuestionType
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : editingType ? (
                "Mettre à Jour"
              ) : (
                "Créer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le Type de Question ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le type "{deletingType?.name}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuestionType}
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
