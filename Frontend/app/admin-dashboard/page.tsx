"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, Brain, Activity, AlertCircle } from "lucide-react"
import { DashboardService, type DashboardStats } from "@/lib/dashboard-service"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await DashboardService.getStats()
        setStats(data)
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des statistiques")
        console.error("Dashboard stats error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total des Étudiants",
      value: stats?.total_students ?? 0,
      icon: Users,
    },
    {
      title: "Packs Vendus",
      value: stats?.total_packs_sold ?? 0,
      icon: Package,
    },
    {
      title: "QCM Créés",
      value: stats?.total_mcqs_created ?? 0,
      icon: Brain,
    },
    {
      title: "Sessions Actives",
      value: stats?.active_sessions ?? 0,
      icon: Activity,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-4xl font-bold tracking-tight">Tableau de Bord Admin</h2>
        <p className="text-muted-foreground">
          Aperçu de l'activité et des performances de la plateforme.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Erreur de chargement</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
              ) : (
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder for future charts */}
      <Card>
        <CardHeader>
          <CardTitle>Activité de la Plateforme</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          Graphiques à venir...
        </CardContent>
      </Card>
    </div>
  )
}
