"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Users, Layers, Loader2, Star, ShoppingCart } from "lucide-react"
import { ApiClient } from "@/lib/api-client"

interface QuestionBankReview {
  student_id: string
  student_name: string
  rating: number
  comment: string
  created_at: string
}

interface QuestionBankStudent {
  student_id: string
  student_name: string
  purchased_at: string
  gifted: boolean
}

interface QuestionBank {
  id: string
  title: string
  description: string | null
  image_url: string | null
  price: number
  currency: string
  university_id: string
  university_name: string | null
  is_published: boolean
  created_at: string
  created_by: string
  creator_name: string | null
  start_datetime: string | null
  expiry_datetime: string | null
  display_before_start: boolean
  students: QuestionBankStudent[]
  reviews: QuestionBankReview[]
  mcqs: any[]
}

// Dummy data for question banks
const questionBanks = [
  {
    id: 1,
    title: "Banque de QCM Anatomie",
    description: "Ensemble complet de QCM classés par chapitres d’anatomie.",
    mcqCount: 850,
    participants: 3200,
    price: 29,
    category: "Médecine",
  },
  {
    id: 2,
    title: "Banque de QCM Biochimie",
    description: "QCM couvrant tout le programme de biochimie médicale.",
    mcqCount: 620,
    participants: 2100,
    price: 25,
    category: "Médecine",
  },
  {
    id: 3,
    title: "Banque de QCM Pharmacie",
    description: "Questions à choix multiples pour les étudiants en pharmacie.",
    mcqCount: 540,
    participants: 1800,
    price: 22,
    category: "Pharmacie",
  },
  {
    id: 4,
    title: "Banque de QCM Physiologie",
    description: "Grande base de QCM en physiologie humaine.",
    mcqCount: 710,
    participants: 2600,
    price: 27,
    category: "Médecine",
  },
]

export default function QuestionBanksPage() {
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([])
  const [filteredBanks, setFilteredBanks] = useState<QuestionBank[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchQuestionBanks()
  }, [])

  useEffect(() => {
    filterBanks()
  }, [searchQuery, questionBanks])

  const fetchQuestionBanks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await ApiClient.get<QuestionBank[]>("/question_banks/")
      setQuestionBanks(data || [])
    } catch (error: any) {
      console.error("Failed to fetch question banks:", error)
      setError("Impossible de charger les banques de QCM. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const filterBanks = () => {
    const filtered = questionBanks.filter((bank) =>
      bank.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bank.description && bank.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredBanks(filtered)
  }

  const calculateAverageRating = (reviews: QuestionBankReview[]): number => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }

  return (
    <div className="py-12" suppressHydrationWarning>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Banques de QCM</h1>
          <p className="mt-2 text-muted-foreground">
            Accédez à des milliers de QCM classés par matière et révisez à votre rythme
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher une banque de QCM..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
            <span className="text-muted-foreground">Chargement des banques de QCM...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-center mb-8">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredBanks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? "Aucune banque de QCM trouvée" : "Aucune banque de QCM disponible"}
            </p>
          </div>
        )}

        {/* Question Banks Grid */}
        {!isLoading && !error && filteredBanks.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBanks.map((bank) => {
              const avgRating = calculateAverageRating(bank.reviews)
              return (
                <Card key={bank.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">
                        {bank.price > 0 ? `${bank.price}${bank.currency}` : "Gratuit"}
                      </Badge>
                      {avgRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{avgRating}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-foreground">{bank.title}</CardTitle>
                      {bank.university_name && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 bg-blue-100 text-blue-700 border-blue-200">
                          {bank.university_name}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {bank.description || "Pas de description disponible"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="grid grid-cols-2 gap-4 text-center mb-4">
                      <div>
                        <Layers className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                        <p className="text-sm font-medium text-foreground">{bank.mcqs?.length || 0}</p>
                        <p className="text-xs text-muted-foreground">Questions</p>
                      </div>
                      <div>
                        <Users className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                        <p className="text-sm font-medium text-foreground">{bank.students?.length || 0}</p>
                        <p className="text-xs text-muted-foreground">Étudiants</p>
                      </div>
                    </div>

                    {bank.reviews && bank.reviews.length > 0 && (
                      <div className="text-xs text-muted-foreground text-center">
                        {bank.reviews.length} avis
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="border-t border-border pt-4">
                    <Button className="w-full" onClick={() => {}}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Acheter
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
