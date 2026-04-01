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
import { Play, Clock, BookOpen, Settings, Info, Award } from "lucide-react"
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
  
  // Support all three identifier types from URL
  const packIdFromUrl = searchParams.get("pack")
  const qbIdFromUrl = searchParams.get("question_bank")
  const mockIdFromUrl = searchParams.get("mock_exam")
  
  const initialId = packIdFromUrl || qbIdFromUrl || mockIdFromUrl || ""

  const [availablePacks, setAvailablePacks] = useState<PurchasedPack[]>([])
  const [loading, setLoading] = useState(true)
  const [showNoPacksDialog, setShowNoPacksDialog] = useState(false)

  const [selectedPack, setSelectedPack] = useState(initialId)

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

  const currentPack = availablePacks.find((p) => p.id.toString() === selectedPack)
  const isMockExam = currentPack?.type === 'mock_exam';
  const displaySubjects = currentPack?.subjects || []

  // Auto-select and enforce settings
  useEffect(() => {
    if (initialId) {
      setSelectedPack(initialId)
    }
  }, [initialId])

  // Enforce Mock Exam settings
  useEffect(() => {
    if (isMockExam && currentPack) {
      setMode("exam");
      setTimerEnabled(true);
      setQuestionCount(currentPack.total_qcm.toString());
      setSelectedCategories([]); // Reset categories to "all" for mock exams
    }
  }, [isMockExam, currentPack])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  // Function to build the correct query string for the session page
  const getSessionUrl = () => {
    if (!currentPack) return "#";
    
    let paramName = "pack";
    if (currentPack.type === 'question_bank') paramName = "question_bank";
    else if (currentPack.type === 'mock_exam') paramName = "mock_exam";
    
    return `/qcm/session?${paramName}=${selectedPack}&questions=${questionCount}&mode=${mode}&timer=${timerEnabled}&name=${encodeURIComponent(currentPack.name)}`;
  }

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
        <p className="text-muted-foreground" suppressHydrationWarning>Configurez votre session de QCM personnalisé</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BookOpen className="h-5 w-5 text-primary" suppressHydrationWarning />
                Sélection du Contenu
              </CardTitle>
              <CardDescription>Choisissez le pack, la banque de questions ou l'examen sur lequel vous souhaitez vous entraîner</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedPack} onValueChange={setSelectedPack}>
                <SelectTrigger className="w-full" suppressHydrationWarning>
                  <SelectValue placeholder="Sélectionner un contenu" />
                </SelectTrigger>
                <SelectContent>
                  {availablePacks.map((pack) => (
                    <SelectItem key={pack.id} value={pack.id.toString()}>
                      {pack.type === 'question_bank' ? '📚 ' : pack.type === 'mock_exam' ? '🎓 ' : '📦 '}
                      {pack.name} ({pack.total_qcm} QCM)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {isMockExam ? (
            /* Mock Exam Info Card - Replaces settings and categories */
            <Card className="border-primary bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Award className="h-5 w-5" />
                  Configuration d'Examen Blanc
                </CardTitle>
                <CardDescription className="text-primary/70">
                  Cet examen est configuré pour simuler les conditions réelles du concours.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg bg-background p-4 border border-primary/20">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Règles de l'examen :</p>
                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                      <li>Toutes les questions ({currentPack.total_qcm}) sont incluses.</li>
                      <li>Le chronomètre est activé (1 min / question).</li>
                      <li>Mode Examen : Corrections disponibles à la fin uniquement.</li>
                      <li>Une fois commencé, le temps continue de s'écouler.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Category Selection - Only for non-mock exams */}
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

              {/* Settings - Only for non-mock exams */}
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
            </>
          )}
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
                  <span className="text-muted-foreground">Contenu</span>
                  <span className="font-medium text-foreground">
                    {selectedPack ? availablePacks.find((p) => p.id.toString() === selectedPack)?.name : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium text-foreground capitalize">
                    {currentPack?.type.replace('_', ' ') || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Catégories</span>
                  <span className="font-medium text-foreground">
                    {isMockExam ? "Toutes" : (selectedCategories.length > 0 ? selectedCategories.length : "Toutes")}
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
                    href={getSessionUrl()}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {isMockExam ? "Lancer l'Examen" : "Commencer le QCM"}
                  </Link>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Commencer
                  </>
                )}
              </Button>

              <AlertDialog open={showNoPacksDialog} onOpenChange={setShowNoPacksDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Aucun contenu acheté</AlertDialogTitle>
                    <AlertDialogDescription>
                      Vous n'avez acheté aucun pack ou banque de questions pour continuer. Veuillez d'abord effectuer un achat pour accéder aux sessions d'entraînement.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setShowNoPacksDialog(false)}>Fermer</AlertDialogCancel>
                    <AlertDialogAction onClick={() => router.push("/tableau-de-bord/mes-packs")}>
                      Voir la boutique
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
