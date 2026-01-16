"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Award } from "lucide-react"

// Dummy data
const weeklyRankings = [
  { rank: 1, name: "David Martin", score: 95, exams: 12, avatar: "DM" },
  { rank: 2, name: "Dotat Bernard", score: 92, exams: 10, avatar: "DB" },
  { rank: 3, name: "Alexe Petit", score: 89, exams: 11, avatar: "AP" },
  { rank: 4, name: "Emma Laurent", score: 87, exams: 9, avatar: "EL" },
  { rank: 5, name: "Lucas Moreau", score: 85, exams: 8, avatar: "LM" },
]

const monthlyRankings = [
  { rank: 1, name: "Sophie Dubois", score: 94, exams: 45, avatar: "SD" },
  { rank: 2, name: "Thomas Leroy", score: 91, exams: 42, avatar: "TL" },
  { rank: 3, name: "Marie Roux", score: 88, exams: 40, avatar: "MR" },
  { rank: 4, name: "Pierre Lambert", score: 86, exams: 38, avatar: "PL" },
  { rank: 5, name: "Julie Blanc", score: 84, exams: 35, avatar: "JB" },
]

const allTimeRankings = [
  { rank: 1, name: "Antoine Rousseau", score: 96, exams: 150, avatar: "AR" },
  { rank: 2, name: "Camille Garnier", score: 93, exams: 145, avatar: "CG" },
  { rank: 3, name: "Nicolas Faure", score: 90, exams: 140, avatar: "NF" },
  { rank: 4, name: "Sarah Girard", score: 88, exams: 135, avatar: "SG" },
  { rank: 5, name: "Marc Bonnet", score: 86, exams: 130, avatar: "MB" },
]

const myRank = {
  rank: 42,
  name: "Alex Dupont",
  score: 76,
  exams: 15,
  avatar: "AD",
}

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
const RankingList = ({ rankings }: { rankings: typeof weeklyRankings }) => (
  <div className="space-y-4" suppressHydrationWarning >
    {rankings.map((user) => (
      <div
        key={user.rank}
        className={`flex items-center gap-4 rounded-lg p-3 ${user.rank <= 3 ? "bg-muted/50" : ""}`}
      >
        <div className="flex h-10 w-10 items-center justify-center">
          {getRankIcon(user.rank) || (
            <span className="text-lg font-bold text-muted-foreground">#{user.rank}</span>
          )}
        </div>
        <Avatar>
          <AvatarImage src={`/diverse-group-avatars.png?height=40&width=40&query=avatar ${user.name}`} />
          <AvatarFallback>{user.avatar}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium text-foreground">{user.name}</p>
          <p className="text-sm text-muted-foreground " suppressHydrationWarning >{user.exams} examens</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">{user.score}%</p>
          <p className="text-xs text-muted-foreground" suppressHydrationWarning >Score moyen</p>
        </div>
      </div>
    ))}
  </div>
)

export default function RankingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Classement</h1>
        <p className="text-muted-foreground" suppressHydrationWarning >Comparez vos performances avec les autres étudiants</p>
      </div>

      {/* My Rank Card */}
      <Card className="border-primary bg-primary/5">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            #{myRank.rank}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground" suppressHydrationWarning>Votre Classement</h3>
            <p className="text-muted-foreground" suppressHydrationWarning>
              Score moyen: {myRank.score}% • {myRank.exams} examens
            </p>
          </div>
          <Badge variant="secondary" suppressHydrationWarning>Cette semaine</Badge>
        </CardContent>
      </Card>

      {/* Rankings - FIX 2: Removed forceMount to prevent hydration issues */}
      <Tabs defaultValue="weekly">
        <TabsList>
          <TabsTrigger value="weekly" suppressHydrationWarning>Cette semaine</TabsTrigger>
          <TabsTrigger value="monthly" suppressHydrationWarning>Ce mois</TabsTrigger>
          <TabsTrigger value="all" suppressHydrationWarning>Tout temps</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground" suppressHydrationWarning>Classement Hebdomadaire</CardTitle>
              <CardDescription>Top 50 des meilleurs scores cette semaine</CardDescription>
            </CardHeader>
            <CardContent>
              <RankingList rankings={weeklyRankings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground" suppressHydrationWarning>Classement Mensuel</CardTitle>
              <CardDescription>Top 50 des meilleurs scores ce mois</CardDescription>
            </CardHeader>
            <CardContent>
              <RankingList rankings={monthlyRankings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground" suppressHydrationWarning>Classement Général</CardTitle>
              <CardDescription>Top 50 de tous les temps</CardDescription>
            </CardHeader>
            <CardContent>
              <RankingList rankings={allTimeRankings} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}