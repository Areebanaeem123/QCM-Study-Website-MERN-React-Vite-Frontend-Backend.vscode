"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, Brain, Activity } from "lucide-react"

export default function AdminDashboardPage() {
  // Later these come from API
  const stats = [
    {
      title: "Total des Étudiants",
      value: "1,284",
      icon: Users,
    },
    {
      title: "Packs Vendus",
      value: "3,912",
      icon: Package,
    },
    {
      title: "QCM Créés",
      value: "12,450",
      icon: Brain,
    },
    {
      title: "Sessions Actives",
      value: "87",
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

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
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
