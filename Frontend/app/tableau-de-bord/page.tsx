"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Trophy, Target, TrendingUp, Play, Package, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useCurrentUser } from "@/lib/auth-hooks"
import { DashboardService, StudentDashboardStats } from "@/lib/dashboard-service"
export default function DashboardPage() {
  const { user } = useCurrentUser()
  const [stats, setStats] = useState<StudentDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await DashboardService.getStudentStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const purchasedPacks = stats?.purchased_packs || []
  const recentActivity = stats?.recent_activity || []
  const categoryPerformance = stats?.category_performance || []

  return (
    <div className="space-y-6" suppressHydrationWarning>
        {/* Welcome */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div suppressHydrationWarning>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl" suppressHydrationWarning>Bienvenue, {user?.first_name || "Étudiant"} !</h1>
            <p className="text-muted-foreground" suppressHydrationWarning>Voici un aperçu de votre progression</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/tableau-de-bord/commencer-qcm">
                <Play className="mr-2 h-4 w-4" />
                <span suppressHydrationWarning>Commencer un QCM</span>
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/packs">
                <Package className="mr-2 h-4 w-4" />
                <span suppressHydrationWarning>Voir les Packs</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div suppressHydrationWarning>
                <p className="text-sm text-muted-foreground" suppressHydrationWarning>QCM Complétés</p>
                <p className="text-2xl font-bold text-foreground" suppressHydrationWarning>{stats?.completed_mcqs || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div suppressHydrationWarning>
                <p className="text-sm text-muted-foreground" suppressHydrationWarning>Score Moyen</p>
                <p className="text-2xl font-bold text-foreground" suppressHydrationWarning>{stats?.average_score || 0}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div suppressHydrationWarning>
                <p className="text-sm text-muted-foreground" suppressHydrationWarning>Classement</p>
                <p className="text-2xl font-bold text-foreground" suppressHydrationWarning>#{stats?.rank || "0"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div suppressHydrationWarning>
                <p className="text-sm text-muted-foreground" suppressHydrationWarning>Progression</p>
                <p className="text-2xl font-bold text-foreground" suppressHydrationWarning>+{stats?.progression || 0}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Performance Overview */}
          <Card>
            <CardHeader suppressHydrationWarning>
              <CardTitle className="text-foreground" suppressHydrationWarning>Aperçu des Performances</CardTitle>
              <CardDescription suppressHydrationWarning>Vos scores par catégorie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryPerformance.map((cat) => (
                <div key={cat.name} className="space-y-2" suppressHydrationWarning>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground" suppressHydrationWarning>{cat.name}</span>
                    <span className="font-medium text-foreground" suppressHydrationWarning>{cat.score}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${cat.color}`} style={{ width: `${cat.score}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader suppressHydrationWarning>
              <CardTitle className="text-foreground" suppressHydrationWarning>Activité Récente</CardTitle>
              <CardDescription suppressHydrationWarning>Vos derniers QCM et examens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0" suppressHydrationWarning>
                    <div suppressHydrationWarning>
                      <p className="font-medium text-foreground" suppressHydrationWarning>{activity.type}</p>
                      <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                        {new Date(activity.timestamp).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div
                      className="rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary"
                      suppressHydrationWarning
                    >
                      Détails
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-4 text-muted-foreground">Aucune activité récente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchased Packs */}
        <Card>
          <CardHeader suppressHydrationWarning>
            <CardTitle className="text-foreground" suppressHydrationWarning>Mes Packs Achetés</CardTitle>
            <CardDescription suppressHydrationWarning>Suivez votre progression dans chaque pack</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {purchasedPacks.map((pack) => (
                <div key={pack.id} className="rounded-lg border border-border p-4" suppressHydrationWarning>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground" suppressHydrationWarning>{pack.name}</h3>
                    <span className="text-sm text-muted-foreground" suppressHydrationWarning>
                      {pack.completed_qcm}/{pack.total_qcm} QCM
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <Progress value={pack.progress} className="h-2" />
                    <p className="text-right text-sm text-muted-foreground" suppressHydrationWarning>{pack.progress}% complété</p>
                  </div>
                  <Button className="mt-3 w-full" size="sm" asChild>
                    <Link href={`/tableau-de-bord/commencer-qcm?pack=${pack.id}`}>
                      <span suppressHydrationWarning>Continuer</span>
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
