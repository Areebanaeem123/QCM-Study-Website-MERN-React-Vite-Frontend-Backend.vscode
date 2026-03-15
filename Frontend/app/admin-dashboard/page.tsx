"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Package,
  Brain,
  Activity,
  AlertCircle,
  Globe,
  Clock,
  Trophy,
} from "lucide-react"
import {
  AdminService,
  type DashboardStats,
  type Activity as DashboardActivity,
  type StudentRanking,
} from "@/lib/admin-service"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<DashboardActivity[]>([])
  const [rankings, setRankings] = useState<StudentRanking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const [statsData, activitiesData, rankingsData] = await Promise.all([
          AdminService.getDashboardStats(),
          AdminService.getRecentActivity(),
          AdminService.getRankings(),
        ])
        setStats(statsData)
        setActivities(activitiesData)
        setRankings(rankingsData)
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data")
        console.error("Dashboard error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
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
    {
      title: "Utilisateurs en Ligne",
      value: stats?.total_online_users ?? 0,
      icon: Globe,
    },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
              ) : (
                <div className="text-2xl font-bold">
                  {stat.value.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Activité</TableHead>
                    <TableHead>Temps</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        Aucune activité récente trouvée.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">{activity.user_name}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                            activity.type === "Connexion" && "bg-blue-100 text-blue-700",
                            activity.type === "Inscription" && "bg-green-100 text-green-700",
                            activity.type === "Achat de Pack" && "bg-purple-100 text-purple-700",
                            !["Connexion", "Inscription", "Achat de Pack"].includes(activity.type) && "bg-gray-100 text-gray-700"
                          )}>
                            {activity.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {formatDate(activity.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Top Students */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <CardTitle>Classement des Étudiants</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rang</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        Aucun classement disponible.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rankings.map((student) => (
                      <TableRow key={student.email}>
                        <TableCell className="font-bold text-muted-foreground">#{student.rank}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell className="text-right font-medium">{student.score.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales Trends Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Tendances des ventes (derniers 30 jours)</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex flex-col items-center justify-center text-muted-foreground">
          {stats?.sales_over_time && stats.sales_over_time.length > 0 ? (
            <div className="w-full h-full flex items-end gap-1 px-4">
               {stats.sales_over_time.map((day, idx) => {
                 const maxCount = Math.max(...stats.sales_over_time.map(d => d.count), 1)
                 return (
                   <div 
                    key={idx} 
                    className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-all group relative"
                    style={{ height: `${(day.count / maxCount) * 100}%` }}
                   >
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-[10px] hidden group-hover:block whitespace-nowrap border shadow-sm">
                       {day.date}: {day.count}
                     </div>
                   </div>
                 )
               })}
            </div>
          ) : (
            <>
              <Activity className="h-8 w-8 mb-2 opacity-20" />
              <p>Les graphiques seront visualisés ici une fois les données de vente accumulées.</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
