"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Trophy, Target, TrendingUp, Play, Package } from "lucide-react"
// Dummy data for purchased packs
const purchasedPacks = [
  { id: 1, name: "Pack Médecine Essentiel", progress: 65, totalQcm: 2000, completedQcm: 1300 },
  { id: 2, name: "Pack Pharmacie", progress: 30, totalQcm: 1500, completedQcm: 450 },
]

// Dummy recent activity
const recentActivity = [
  { type: "QCM", title: "Anatomie - Système nerveux", score: 85, date: "Aujourd'hui" },
  { type: "Examen", title: "Examen Blanc #3", score: 72, date: "Hier" },
  { type: "QCM", title: "Biochimie - Métabolisme", score: 90, date: "Il y a 2 jours" },
]

// Performance by category
const categoryPerformance = [
  { name: "Anatomie", score: 85, color: "bg-green-500" },
  { name: "Biochimie", score: 72, color: "bg-yellow-500" },
  { name: "Pharmacologie", score: 68, color: "bg-orange-500" },
  { name: "Physiologie", score: 78, color: "bg-blue-500" },
]
export default function DashboardPage() {
  return (
    <div className="space-y-6" suppressHydrationWarning>
        {/* Welcome */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div suppressHydrationWarning>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl" suppressHydrationWarning>Bienvenue, Alex !</h1>
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
                <p className="text-2xl font-bold text-foreground" suppressHydrationWarning>1,750</p>
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
                <p className="text-2xl font-bold text-foreground" suppressHydrationWarning>76%</p>
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
                <p className="text-2xl font-bold text-foreground" suppressHydrationWarning>#42</p>
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
                <p className="text-2xl font-bold text-foreground" suppressHydrationWarning>+12%</p>
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
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0" suppressHydrationWarning>
                    <div suppressHydrationWarning>
                      <p className="font-medium text-foreground" suppressHydrationWarning>{activity.title}</p>
                      <p className="text-sm text-muted-foreground" suppressHydrationWarning>{activity.date}</p>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        activity.score >= 80
                          ? "bg-green-100 text-green-700"
                          : activity.score >= 60
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                      suppressHydrationWarning
                    >
                      {activity.score}%
                    </div>
                  </div>
                ))}
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
                      {pack.completedQcm}/{pack.totalQcm} QCM
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
