"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Play, Calendar, BookOpen, ShoppingCart } from "lucide-react"
import { DashboardService, PurchasedPack, StudentDashboardStats, StorePack, StoreQuestionBank, StoreMockExam } from "@/lib/dashboard-service"
import { useCurrentUser } from "@/lib/auth-hooks"

// Fallback dummy exams since StudentDashboardStats doesn't include purchased exams currently
const purchasedExams = [
  {
    id: 1,
    name: "Examen Blanc PACES #1",
    attempts: 3,
    bestScore: 82,
    lastAttempt: "10/01/2026",
  },
]

export default function MyPacksPage() {
  const { user } = useCurrentUser()
  const [stats, setStats] = useState<StudentDashboardStats | null>(null)
  
  const [availablePacks, setAvailablePacks] = useState<StorePack[]>([])
  const [availableQBs, setAvailableQBs] = useState<StoreQuestionBank[]>([])
  const [availableExams, setAvailableExams] = useState<StoreMockExam[]>([])
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      // 1. Load student stats first (most important for "Packs Achetés")
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

  return (
    <div className="space-y-8" suppressHydrationWarning >
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Mes Packs & Examens</h1>
        <p className="text-muted-foreground">Gérez vos achats et suivez votre progression</p>
      </div>

      {/* Purchased Packs */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Packs Achetés</h2>
        {!stats && loading ? (
          <p>Chargement de vos packs...</p>
        ) : stats?.purchased_packs?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-8 text-center mt-4">
              <BookOpen className="h-12 w-12 text-muted-foreground opacity-20" />
              <h3 className="text-xl font-semibold text-foreground">Aucun pack acheté</h3>
              <p className="text-muted-foreground">Vous n'avez pas encore acheté de packs.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {stats?.purchased_packs?.map((pack) => (
              <Card key={pack.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-foreground">{pack.name}</CardTitle>
                      <CardDescription>Votre pack d'entraînement</CardDescription>
                    </div>
                    <Badge variant="default">
                      Actif
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium text-foreground">
                        {pack.completed_qcm}/{pack.total_qcm} QCM
                      </span>
                    </div>
                    <Progress value={pack.progress || 0} className="h-2" />
                    <p className="mt-1 text-right text-sm text-muted-foreground">{pack.progress || 0}%</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href={`/tableau-de-bord/commencer-qcm?pack=${pack.id}`}>
                      <Play className="mr-2 h-4 w-4" />
                      Continuer
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Boutique / Available items */}
      <div className="pt-8 border-t border-border">
        <h2 className="mb-2 text-2xl font-bold text-foreground">Boutique Étudiante</h2>
        <p className="mb-6 text-muted-foreground">Découvrez et achetez nos packs, banques de questions et examens blancs.</p>
        
        {/* Packs */}
        <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Packs Disponibles</h3>
            {loading && availablePacks.length === 0 ? <p className="text-sm text-muted-foreground">Chargement des packs disponibles...</p> : availablePacks.length === 0 ? <p className="text-sm text-muted-foreground">Aucun pack disponible pour le moment.</p> : (
                <div className="grid gap-4 md:grid-cols-3">
                    {availablePacks.map(p => (
                        <Card key={p.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{p.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="font-bold text-lg">{p.price} {p.currency}</p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="secondary"><ShoppingCart className="mr-2 h-4 w-4"/> Acheter</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>

        {/* Question Banks */}
        <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Banques de Questions</h3>
            {loading && availableQBs.length === 0 ? <p className="text-sm text-muted-foreground">Chargement des banques de questions...</p> : availableQBs.length === 0 ? <p className="text-sm text-muted-foreground">Aucune banque de questions disponible.</p> : (
                <div className="grid gap-4 md:grid-cols-3">
                    {availableQBs.map(qb => (
                        <Card key={qb.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{qb.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="font-bold text-lg">{qb.price} {qb.currency}</p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="secondary"><ShoppingCart className="mr-2 h-4 w-4"/> Acheter</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>

        {/* Mock Exams */}
        <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Examens Blancs</h3>
            {loading && availableExams.length === 0 ? <p className="text-sm text-muted-foreground">Chargement des examens blancs...</p> : availableExams.length === 0 ? <p className="text-sm text-muted-foreground">Aucun examen blanc disponible.</p> : (
                <div className="grid gap-4 md:grid-cols-3">
                    {availableExams.map(ex => (
                        <Card key={ex.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{ex.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="font-bold text-lg">{ex.price ? ex.price + ' ' + ex.currency : 'Gratuit ou Non défini'}</p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="secondary"><ShoppingCart className="mr-2 h-4 w-4"/> Acheter</Button>
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
