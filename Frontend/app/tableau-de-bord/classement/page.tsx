"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Medal, Award, Filter, User as UserIcon } from "lucide-react"
import { DashboardService, Ranking, StorePack } from "@/lib/dashboard-service"
import { AdminService } from "@/lib/admin-service"
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
    {rankings.length === 0 ? (
      <div className="text-center py-10 text-muted-foreground">
        Aucun résultat trouvé pour ce classement.
      </div>
    ) : (
      rankings.map((user) => {
        // Create an avatar initials from name (e.g., "John Doe" -> "JD")
        const initials = user.name.split(' ').map((n) => n[0]).join('').substring(0,2) || 'U'
        return (
          <div
            key={`${user.rank}-${user.email}`}
            className={`flex items-center gap-4 rounded-lg p-3 transition-colors ${user.is_me ? "bg-primary/10 border border-primary/20" : user.rank <= 3 ? "bg-muted/50" : ""}`}
          >
            <div className="flex h-10 w-10 items-center justify-center">
              {getRankIcon(user.rank) || (
                <span className="text-lg font-bold text-muted-foreground">#{user.rank}</span>
              )}
            </div>
            <Avatar className={user.is_me ? "ring-2 ring-primary" : ""}>
              <AvatarImage src={`/diverse-group-avatars.png?height=40&width=40&query=avatar ${user.name}`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className={`font-medium ${user.is_me ? "text-primary font-bold" : "text-foreground"}`}>
                {user.name} {user.is_me && "(Moi)"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{user.score}%</p>
              <p className="text-xs text-muted-foreground" suppressHydrationWarning >Score Moyen</p>
            </div>
          </div>
        )
      })
    )}
  </div>
)

export default function RankingsPage() {
  const { user } = useCurrentUser()
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [subjects, setSubjects] = useState<{id: string, name: string}[]>([])
  const [mockExams, setMockExams] = useState<StorePack[]>([])
  
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<"global" | "mock_exam" | "subject">("global")
  const [selectedId, setSelectedId] = useState<string>("all")

  // Load supporting data (subjects, exams)
  useEffect(() => {
    async function loadFilters() {
      try {
        const [subjs, packs] = await Promise.all([
          DashboardService.getSubjects(),
          DashboardService.getAvailablePacks()
        ])
        setSubjects(subjs)
        setMockExams(packs.filter(p => p.type === 'mock_exam'))
      } catch (err) {
        console.error("Failed to load ranking filters", err)
      }
    }
    loadFilters()
  }, [])

  // Load rankings whenever filter changes
  useEffect(() => {
    async function loadRankings() {
      try {
        setLoading(true)
        let data: Ranking[] = []
        
        if (filterType === "global") {
          data = await DashboardService.getRankings()
        } else if (filterType === "mock_exam") {
          data = await DashboardService.getRankings(undefined, selectedId === "all" ? undefined : selectedId)
        } else if (filterType === "subject") {
          data = await DashboardService.getRankings(undefined, undefined, selectedId === "all" ? undefined : selectedId)
        }
        
        setRankings(data)
      } catch (err) {
        console.error("Failed to load rankings", err)
      } finally {
        setLoading(false)
      }
    }
    loadRankings()
  }, [filterType, selectedId])

  const myRank = rankings.find((r) => r.is_me)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Classement</h1>
        <p className="text-muted-foreground" suppressHydrationWarning >Comparez vos performances réelles tout en préservant votre anonymat</p>
      </div>

      {/* Filters Corner */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filtrer par :
            </div>
            
            <Select value={filterType} onValueChange={(val: any) => {
              setFilterType(val)
              setSelectedId("all")
            }}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Classement Général</SelectItem>
                <SelectItem value="mock_exam">Examens Blancs</SelectItem>
                <SelectItem value="subject">Par Matière</SelectItem>
              </SelectContent>
            </Select>

            {filterType !== "global" && (
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder={filterType === "mock_exam" ? "Choisir un examen" : "Choisir une matière"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous / Toutes</SelectItem>
                  {filterType === "mock_exam" ? (
                    mockExams.map(ex => (
                      <SelectItem key={ex.id} value={ex.id}>{ex.title}</SelectItem>
                    ))
                  ) : (
                    subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* My Rank Summary */}
      {myRank && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-lg">
              #{myRank.rank}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                Votre Position <Badge variant="outline" className="border-primary/30 text-primary">Réel</Badge>
              </h3>
              <p className="text-muted-foreground" suppressHydrationWarning>
                Vous êtes dans le top {Math.round((myRank.rank / (rankings.length || 1)) * 100)}% des participants.
              </p>
            </div>
            <div className="text-right">
               <p className="text-2xl font-black text-primary">{myRank.score}%</p>
               <p className="text-xs text-muted-foreground">Score Moyen</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Tableau des Leaders
          </CardTitle>
          <CardDescription>
            {filterType === "global" ? "Classement basé sur l'ensemble de vos sessions." : 
             filterType === "mock_exam" ? "Performance sur les examens blancs officiels." : 
             "Excellence académique par matière."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex flex-col items-center py-20 gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Calcul des rangs...</p>
             </div>
          ) : (
            <RankingList rankings={rankings} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}