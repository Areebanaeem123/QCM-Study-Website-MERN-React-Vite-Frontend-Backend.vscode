"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Clock, FileText, Search, Users, AlertCircle, ShoppingBasket } from "lucide-react"
import { DashboardService, StoreMockExam } from "@/lib/dashboard-service"
import { Skeleton } from "@/components/ui/skeleton"
import { useBasket } from "@/lib/basket-context"
import { useRouter } from "next/navigation"

export default function ExamsPage() {
  const [exams, setExams] = useState<StoreMockExam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { addItem, isInBasket } = useBasket()
  const router = useRouter()

  useEffect(() => {
    async function fetchExams() {
      try {
        setLoading(true)
        const data = await DashboardService.getAvailableMockExams()
        setExams(data)
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch mock exams:", err)
        setError("Impossible de charger les examens blancs. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }
    fetchExams()
  }, [])

  const handleAddToBasket = (exam: StoreMockExam) => {
    addItem({
      id: exam.id,
      title: exam.title,
      price: exam.price || 0,
      currency: exam.currency || "DT",
      type: "mock_exam",
      image_url: exam.image_url,
    })
    router.push("/panier")
  }

  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Facile":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "Intermédiaire":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "Difficile":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
      case "Expert":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="py-12" suppressHydrationWarning>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Examens Blancs</h1>
          <p className="mt-2 text-muted-foreground">
            Entraînez-vous dans les conditions réelles avec nos examens chronométrés
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un examen..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="mb-8 flex items-center justify-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Exams Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-border pt-4">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-10 w-24" />
                </CardFooter>
              </Card>
            ))
          ) : filteredExams.length > 0 ? (
            filteredExams.map((exam) => (
              <Card key={exam.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline">Examen</Badge>
                    <Badge className={getDifficultyColor("Intermédiaire")}>Intermédiaire</Badge>
                  </div>
                  <CardTitle className="mt-2 text-foreground line-clamp-1">{exam.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{exam.description || "Aucune description disponible."}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <FileText className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                      <p className="text-sm font-medium text-foreground">{exam.total_questions || 0}</p>
                      <p className="text-xs text-muted-foreground">Questions</p>
                    </div>
                    <div>
                      <Clock className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                      <p className="text-sm font-medium text-foreground">2h</p>
                      <p className="text-xs text-muted-foreground">Durée</p>
                    </div>
                    <div>
                      <Users className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                      <p className="text-sm font-medium text-foreground">{exam.total_purchases || 0}</p>
                      <p className="text-xs text-muted-foreground">Inscrits</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t border-border pt-4 gap-2">
                  <span className="text-xl font-bold text-foreground">
                    {exam.price} {exam.currency === "CHF" ? "CHF" : "DT"}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleAddToBasket(exam)} disabled={isInBasket(exam.id)}>
                      <ShoppingBasket className="h-4 w-4" />
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/packs/${exam.id}`}>Détails</Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Aucun examen blanc trouvé.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
