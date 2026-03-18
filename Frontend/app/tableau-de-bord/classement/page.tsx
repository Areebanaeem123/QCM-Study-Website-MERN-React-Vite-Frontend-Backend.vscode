"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Award } from "lucide-react"
import { DashboardService, Ranking } from "@/lib/dashboard-service"
import { useCurrentUser } from "@/lib/auth-hooks"

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />
    default:
      return null
  }
}

// Component to render ranking list
const RankingList = ({ rankings }: { rankings: Ranking[] }) => (
  <div className="space-y-4" suppressHydrationWarning >
    {rankings.map((user) => {
       // Create an avatar initials from name (e.g., "John Doe" -> "JD")
       const initials = user.name.split(' ').map((n) => n[0]).join('').substring(0,2) || 'U'
       return (
      <div
        key={`${user.rank}-${user.email}`}
        className={`flex items-center gap-4 rounded-lg p-3 ${user.rank <= 3 ? "bg-muted/50" : ""}`}
      >
        <div className="flex h-10 w-10 items-center justify-center">
          {getRankIcon(user.rank) || (
            <span className="text-lg font-bold text-muted-foreground">#{user.rank}</span>
          )}
        </div>
        <Avatar>
          <AvatarImage src={`/diverse-group-avatars.png?height=40&width=40&query=avatar ${user.name}`} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium text-foreground">{user.name}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">{user.score}%</p>
          <p className="text-xs text-muted-foreground" suppressHydrationWarning >Score</p>
        </div>
      </div>
      )
    })}
  </div>
)

export default function RankingsPage() {
  const { user } = useCurrentUser()
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRankings() {
      try {
        const data = await DashboardService.getRankings()
        setRankings(data)
      } catch (err) {
        console.error("Failed to load rankings", err)
      } finally {
        setLoading(false)
      }
    }
    loadRankings()
  }, [])

  // Currently, we don't have separate time-period endpoints, so we reuse the same data.
  // We can calculate myRank by finding the current user in the rankings list
  const myRank = rankings.find((r) => r.email === user?.email) || {
    rank: 0,
    score: 0,
    name: user?.first_name || "Moi"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Classement</h1>
        <p className="text-muted-foreground" suppressHydrationWarning >Comparez vos performances avec les autres étudiants</p>
      </div>

      {/* My Rank Card */}
      {myRank.rank > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              #{myRank.rank}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground" suppressHydrationWarning>Votre Classement</h3>
              <p className="text-muted-foreground" suppressHydrationWarning>
                Score: {myRank.score}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rankings */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="weekly" suppressHydrationWarning>Cette semaine</TabsTrigger>
          <TabsTrigger value="monthly" suppressHydrationWarning>Ce mois</TabsTrigger>
          <TabsTrigger value="all" suppressHydrationWarning>Tout temps</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground" suppressHydrationWarning>Classement Hebdomadaire</CardTitle>
              <CardDescription>Top des meilleurs scores (Basé sur le général pour le moment)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <p>Chargement...</p> : <RankingList rankings={rankings} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground" suppressHydrationWarning>Classement Mensuel</CardTitle>
              <CardDescription>Top des meilleurs scores (Basé sur le général pour le moment)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <p>Chargement...</p> : <RankingList rankings={rankings} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground" suppressHydrationWarning>Classement Général</CardTitle>
              <CardDescription>Top de tous les temps</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <p>Chargement...</p> : <RankingList rankings={rankings} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}