"use client"

import { useEffect, useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar, Line } from "react-chartjs-2"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AdminService, DashboardStats, StudentRanking, PackResponse } from "@/lib/admin-service"
import { Users, Package, FileText, Activity, Trophy, Search, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [rankings, setRankings] = useState<StudentRanking[]>([])
  const [packs, setPacks] = useState<PackResponse[]>([])
  const [selectedPackId, setSelectedPackId] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch Stats
        try {
          const statsData = await AdminService.getDashboardStats()
          setStats(statsData)
        } catch (error) {
          console.error("Failed to fetch dashboard stats", error)
        }

        // Fetch Packs
        try {
          const packsData = await AdminService.getPacks()
          setPacks(packsData) // It's an array now
        } catch (error) {
          console.error("Failed to fetch packs", error)
        }
        
        // Fetch Rankings
        try {
          const rankingsData = await AdminService.getRankings()
          setRankings(rankingsData)
        } catch (error) {
          console.error("Failed to fetch rankings", error)
        }
      } catch (error) {
        console.error("Unexpected error in fetchData", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handlePackChange = async (packId: string) => {
    setSelectedPackId(packId)
    setIsLoading(true)
    try {
      const data = await AdminService.getRankings(packId === "all" ? undefined : packId)
      setRankings(data)
    } catch (error) {
      console.error("Failed to fetch filtered rankings", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement des statistiques...</p>
      </div>
    )
  }

  const salesData = {
    labels: stats?.sales_over_time.map(s => s.date) || [],
    datasets: [
      {
        label: "Ventes quotidiennes",
        data: stats?.sales_over_time.map(s => s.count) || [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.3,
        fill: true,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Statistiques & Classements</h2>
          <p className="text-muted-foreground">Vue d'ensemble de l'activité de la plateforme.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
          <Activity className="h-4 w-4 animate-pulse" />
          <span className="text-sm font-semibold">{stats?.total_online_users || 0} utilisateurs en ligne</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Étudiants" value={stats?.total_students || 0} icon={Users} color="bg-blue-500" />
        <StatCard title="Packs Vendus" value={stats?.total_packs_sold || 0} icon={Package} color="bg-green-500" />
        <StatCard title="QCM Créés" value={stats?.total_mcqs_created || 0} icon={FileText} color="bg-yellow-500" />
        <StatCard title="Sessions Actives" value={stats?.active_sessions || 0} icon={Activity} color="bg-purple-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tendances des Ventes (30 jours)</CardTitle>
            <CardDescription>Volume de packs achetés par jour.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Line 
              data={salesData} 
              options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} 
            />
          </CardContent>
        </Card>

        {/* Student Leaderboard */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Classement des Étudiants</CardTitle>
              <CardDescription>Basé sur l'activité et les scores.</CardDescription>
            </div>
            <div className="w-[180px]">
              <Select value={selectedPackId} onValueChange={handlePackChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par Pack" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les packs</SelectItem>
                  {packs.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rang</TableHead>
                    <TableHead>Étudiant</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.map((r) => (
                    <TableRow key={r.email}>
                      <TableCell>
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted font-bold text-xs">
                          {r.rank <= 3 ? (
                            r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : "🥉"
                          ) : r.rank}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {r.score} pts
                      </TableCell>
                    </TableRow>
                  ))}
                  {rankings.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-sm">
                        Aucun résultat pour ce filtre.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          </div>
          <div className={`${color} p-3 rounded-lg text-white`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
