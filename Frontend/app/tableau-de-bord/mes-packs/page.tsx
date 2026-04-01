"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Play, Calendar, BookOpen, ShoppingCart, Layers, Award } from "lucide-react"
import { DashboardService, PurchasedPack, StudentDashboardStats, StorePack, StoreQuestionBank, StoreMockExam } from "@/lib/dashboard-service"
import { useCurrentUser } from "@/lib/auth-hooks"

export default function MyPacksPage() {
  const { user } = useCurrentUser()
  const [stats, setStats] = useState<StudentDashboardStats | null>(null)
  
  const [availablePacks, setAvailablePacks] = useState<StorePack[]>([])
  const [availableQBs, setAvailableQBs] = useState<StoreQuestionBank[]>([])
  const [availableExams, setAvailableExams] = useState<StoreMockExam[]>([])
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      // 1. Load student stats first (most important for "Items Achetés")
      try {
        const statsData = await DashboardService.getStudentStats()
        setStats(statsData)
      } catch (err) {
        console.error("Failed to load student stats", err)
      }

      // 2. Load available items in parallel
      try {
        const [packs, qbs, exams] = await Promise.all([
           DashboardService.getAvailablePacks(),
           DashboardService.getAvailableQuestionBanks(),
           DashboardService.getAvailableMockExams()
        ])
        setAvailablePacks(packs)
        setAvailableQBs(qbs)
        setAvailableExams(exams)
      } catch (err) {
        console.error("Failed to load available store items", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const purchasedGroups = useMemo(() => {
    if (!stats?.purchased_packs) return { packs: [], questionBanks: [], mockExams: [] };
    
    return {
      packs: stats.purchased_packs.filter(p => p.type === 'pack'),
      questionBanks: stats.purchased_packs.filter(p => p.type === 'question_bank'),
      mockExams: stats.purchased_packs.filter(p => p.type === 'mock_exam')
    };
  }, [stats]);

  const renderPurchasedItem = (item: PurchasedPack) => {
    // Determine the query param based on type
    let queryParam = `pack=${item.id}`;
    if (item.type === 'question_bank') {
      queryParam = `question_bank=${item.id}`;
    } else if (item.type === 'mock_exam') {
      queryParam = `mock_exam=${item.id}`;
    }

    return (
      <Card key={item.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                {item.type === 'pack' && <Layers className="h-5 w-5 text-primary" />}
                {item.type === 'question_bank' && <BookOpen className="h-5 w-5 text-primary" />}
                {item.type === 'mock_exam' && <Award className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <CardTitle className="text-foreground text-lg">{item.name}</CardTitle>
                <CardDescription className="text-xs">
                  {item.type === 'pack' ? 'Pack d\'entraînement' : 
                   item.type === 'question_bank' ? 'Banque de questions' : 'Examen blanc'}
                </CardDescription>
              </div>
            </div>
            <Badge variant="default" className="text-[10px] h-5">
              Actif
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground text-xs">Progression</span>
              <span className="font-medium text-foreground text-xs">
                {item.completed_qcm}/{item.total_qcm} QCM
              </span>
            </div>
            <Progress value={item.progress || 0} className="h-1.5" />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="sm" asChild>
            <Link href={`/tableau-de-bord/commencer-qcm?${queryParam}`}>
              <Play className="mr-2 h-4 w-4" />
              Continuer
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-10" suppressHydrationWarning >
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Mes QCM & Examens</h1>
        <p className="text-muted-foreground">Accédez à votre contenu et suivez votre progression</p>
      </div>

      {/* Mes Packs */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" /> Mes Packs
        </h2>
        {purchasedGroups.packs.length === 0 && !loading ? (
          <div className="text-sm text-muted-foreground bg-muted/30 p-8 rounded-xl border border-dashed text-center">
            Vous n'avez pas encore acheté de packs.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {purchasedGroups.packs.map(renderPurchasedItem)}
          </div>
        )}
      </div>

      {/* Mes Banques de Questions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" /> Mes Banques de Questions
        </h2>
        {purchasedGroups.questionBanks.length === 0 && !loading ? (
          <div className="text-sm text-muted-foreground bg-muted/30 p-8 rounded-xl border border-dashed text-center">
            Vous n'avez pas encore acheté de banques de questions.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {purchasedGroups.questionBanks.map(renderPurchasedItem)}
          </div>
        )}
      </div>

      {/* Mes Examens Blancs */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" /> Mes Examens Blancs
        </h2>
        {purchasedGroups.mockExams.length === 0 && !loading ? (
          <div className="text-sm text-muted-foreground bg-muted/30 p-8 rounded-xl border border-dashed text-center">
            Vous n'avez pas encore acheté d'examens blancs.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {purchasedGroups.mockExams.map(renderPurchasedItem)}
          </div>
        )}
      </div>

      {/* Boutique / Available items */}
      <div className="pt-10 border-t border-border">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Boutique Étudiante</h2>
          <p className="text-muted-foreground">Complétez votre bibliothèque de ressources pour optimiser vos chances.</p>
        </div>
        
        {/* Available Packs */}
        <div className="mb-10">
            <h3 className="mb-4 text-lg font-semibold flex items-center gap-2"><Layers className="h-5 w-5 text-primary" /> Packs Disponibles</h3>
            {loading && availablePacks.length === 0 ? <p className="text-sm text-muted-foreground">Chargement...</p> : availablePacks.length === 0 ? <p className="text-sm text-muted-foreground">Aucun pack disponible.</p> : (
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {availablePacks.map(p => (
                        <Card key={p.id} className="flex flex-col bg-muted/20">
                            <CardHeader className="p-4">
                                <CardTitle className="text-base">{p.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-4 pt-0">
                                <p className="font-bold text-primary">{p.price} {p.currency}</p>
                            </CardContent>
                            <CardFooter className="p-4 h-full">
                                <Button className="w-full" variant="outline" size="sm">
                                  <ShoppingCart className="mr-2 h-4 w-4"/> Détails
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>

        {/* Available Question Banks */}
        <div className="mb-10">
            <h3 className="mb-4 text-lg font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Banques de Questions</h3>
            {loading && availableQBs.length === 0 ? <p className="text-sm text-muted-foreground">Chargement...</p> : availableQBs.length === 0 ? <p className="text-sm text-muted-foreground">Aucune banque de questions.</p> : (
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {availableQBs.map(qb => (
                        <Card key={qb.id} className="flex flex-col bg-muted/20">
                            <CardHeader className="p-4">
                                <CardTitle className="text-base">{qb.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-4 pt-0">
                                <p className="font-bold text-primary">{qb.price} {qb.currency}</p>
                            </CardContent>
                            <CardFooter className="p-4 h-full">
                                <Button className="w-full" variant="outline" size="sm">
                                  <ShoppingCart className="mr-2 h-4 w-4"/> Détails
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>

        {/* Available Mock Exams */}
        <div className="mb-10">
            <h3 className="mb-4 text-lg font-semibold flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Examens Blancs</h3>
            {loading && availableExams.length === 0 ? <p className="text-sm text-muted-foreground">Chargement...</p> : availableExams.length === 0 ? <p className="text-sm text-muted-foreground">Aucun examen blanc.</p> : (
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {availableExams.map(ex => (
                        <Card key={ex.id} className="flex flex-col bg-muted/20">
                            <CardHeader className="p-4">
                                <CardTitle className="text-base">{ex.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-4 pt-0">
                                <p className="font-bold text-primary">{ex.price ? ex.price + ' ' + ex.currency : 'Gratuit'}</p>
                            </CardContent>
                            <CardFooter className="p-4 h-full">
                                <Button className="w-full" variant="outline" size="sm">
                                  <ShoppingCart className="mr-2 h-4 w-4"/> Détails
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  )
}
