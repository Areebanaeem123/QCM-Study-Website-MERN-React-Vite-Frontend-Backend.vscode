"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Play, Clock, BookOpen, Settings } from "lucide-react"
import { DashboardService, PurchasedPack } from "@/lib/dashboard-service"
import { useProtectedRoute } from "@/lib/auth-hooks"
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
import { useRouter } from "next/navigation"

export default function StartQCMPage() {
  useProtectedRoute()
  const searchParams = useSearchParams()
  const router = useRouter()
  const packIdFromUrl = searchParams.get("pack")

  const [availablePacks, setAvailablePacks] = useState<PurchasedPack[]>([])
  const [loading, setLoading] = useState(true)
  const [showNoPacksDialog, setShowNoPacksDialog] = useState(false)

  const [selectedPack, setSelectedPack] = useState(packIdFromUrl || "")

  // Auto-select pack if provided in URL
  useEffect(() => {
    if (packIdFromUrl) {
      setSelectedPack(packIdFromUrl)
    }
  }, [packIdFromUrl])

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [questionCount, setQuestionCount] = useState("20")
  const [mode, setMode] = useState("practice")
  const [timerEnabled, setTimerEnabled] = useState(false)

  useEffect(() => {
    async function fetchPacks() {
      try {
        const stats = await DashboardService.getStudentStats()
        setAvailablePacks(stats.purchased_packs || [])
      } catch (err) {
        console.error("Failed to load student packs", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPacks()
  }, [])

  // No hardcoded categories here anymore - using pack subjects

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const currentPack = availablePacks.find((p) => p.id.toString() === selectedPack)
  const displaySubjects = currentPack?.subjects || []

  // Can start if a pack is selected. If they haven't purchased any, allow clicking to show the popup.
  const canStart = availablePacks.length === 0 || (selectedPack !== "" && availablePacks.length > 0)

  const handleStartClick = (e: React.MouseEvent) => {
    if (availablePacks.length === 0) {
      e.preventDefault()
      setShowNoPacksDialog(true)
    }
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl" suppressHydrationWarning>Commencer un QCM</h1>
        <p className="text-muted-foreground" suppressHydrationWarning>Configurez votre session de QCM</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pack Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BookOpen className="h-5 w-5 text-primary" suppressHydrationWarning />
                Sélection du Pack
              </CardTitle>
              <CardDescription>Choisissez le pack sur lequel vous souhaitez vous entraîner</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedPack} onValueChange={setSelectedPack}>
                <SelectTrigger className="w-full" suppressHydrationWarning>
                  <SelectValue placeholder="Sélectionner un pack" />
                </SelectTrigger>
                <SelectContent>
                  {availablePacks.map((pack) => (
                    <SelectItem key={pack.id} value={pack.id.toString()}>
                      {pack.name} ({pack.total_qcm} QCM)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Category Selection */}
          {selectedPack && displaySubjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground" suppressHydrationWarning>Catégories</CardTitle>
                <CardDescription>Sélectionnez les catégories à inclure (optionnel)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {displaySubjects.map((cat) => (
                    <div
                      key={cat.id}
                      className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                        selectedCategories.includes(cat.id) ? "border-primary bg-primary/5" : "border-border"
                      }`}
                      onClick={() => toggleCategory(cat.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedCategories.includes(cat.id)}
                          onCheckedChange={() => toggleCategory(cat.id)}
                        />
                        <span className="text-foreground">{cat.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground" suppressHydrationWarning>
                <Settings className="h-5 w-5 text-primary" suppressHydrationWarning/>
                Paramètres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6" suppressHydrationWarning>
              {/* Mode */}
              <div className="space-y-3">
                <Label>Mode</Label>
                <RadioGroup value={mode} onValueChange={setMode} className="grid gap-3 sm:grid-cols-2">
                  <div
                    className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer ${mode === "practice" ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <RadioGroupItem value="practice" id="practice" />
                    <div>
                      <Label htmlFor="practice" className="cursor-pointer font-medium text-foreground" suppressHydrationWarning>
                        Mode Entraînement
                      </Label>
                      <p className="text-sm text-muted-foreground" suppressHydrationWarning>Voir les corrections après chaque question</p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer ${mode === "exam" ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <RadioGroupItem value="exam" id="exam" />
                    <div>
                      <Label htmlFor="exam" className="cursor-pointer font-medium text-foreground">
                        Mode Examen
                      </Label>
                      <p className="text-sm text-muted-foreground" suppressHydrationWarning>Corrections à la fin uniquement</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Question Count */}
              <div className="space-y-2">
                <Label>Nombre de questions</Label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 questions</SelectItem>
                    <SelectItem value="20">20 questions</SelectItem>
                    <SelectItem value="30">30 questions</SelectItem>
                    <SelectItem value="50">50 questions</SelectItem>
                    <SelectItem value="100">100 questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Timer */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="timer"
                  checked={timerEnabled}
                  onCheckedChange={(checked) => setTimerEnabled(checked as boolean)}
                />
                <div>
                  <Label htmlFor="timer" className="cursor-pointer text-foreground">
                    Activer le chronomètre
                  </Label>
                  <p className="text-sm text-muted-foreground">1 minute par question</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-foreground">Résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pack</span>
                  <span className="font-medium text-foreground">
                    {selectedPack ? availablePacks.find((p) => p.id.toString() === selectedPack)?.name : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Catégories</span>
                  <span className="font-medium text-foreground">
                    {selectedCategories.length > 0 ? selectedCategories.length : "Toutes"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-medium text-foreground">{questionCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="font-medium text-foreground">{mode === "practice" ? "Entraînement" : "Examen"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Chronomètre</span>
                  <span className="font-medium text-foreground">{timerEnabled ? "Activé" : "Désactivé"}</span>
                </div>
              </div>

              {timerEnabled && (
                <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Durée estimée: {Number.parseInt(questionCount)} min
                    </p>
                    <p className="text-xs text-muted-foreground">1 minute par question</p>
                  </div>
                </div>
              )}

              <Button 
                className="w-full" 
                size="lg" 
                disabled={!canStart} 
                asChild={availablePacks.length > 0}
                onClick={handleStartClick}
              >
                {availablePacks.length > 0 ? (
                  <Link
                    href={`/qcm/session?pack=${selectedPack}&questions=${questionCount}&mode=${mode}&timer=${timerEnabled}`}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Commencer le QCM
                  </Link>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Commencer le QCM
                  </>
                )}
              </Button>

              <AlertDialog open={showNoPacksDialog} onOpenChange={setShowNoPacksDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Aucun pack acheté</AlertDialogTitle>
                    <AlertDialogDescription>
                      Vous n'avez acheté aucun pack pour continuer avec les QCM. Veuillez d'abord acheter un pack pour accéder aux sessions d'entraînement.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setShowNoPacksDialog(false)}>Fermer</AlertDialogCancel>
                    <AlertDialogAction onClick={() => router.push("/packs")}>
                      Voir les packs
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
