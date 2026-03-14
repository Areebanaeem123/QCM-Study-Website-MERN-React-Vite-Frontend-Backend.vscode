"use client"

import { useState, useEffect } from "react"
import { Search, University, BookOpen, ClipboardList, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ApiClient } from "@/lib/api-client"

interface UniversityData {
  id: string
  name: string
  is_displayed: boolean
}

interface PackData {
  id: string
  title: string
  description: string
  price: number
  currency: string
}

interface MockExamData {
  id: string
  title: string
  description: string
  price: number
  currency: string
  total_questions: number
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<UniversityData[]>([])
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityData | null>(null)
  const [activeSection, setActiveSection] = useState<"mcq" | "exam" | null>(null)

  const [packs, setPacks] = useState<PackData[]>([])
  const [mockExams, setMockExams] = useState<MockExamData[]>([])

  const [isLoadingUniversities, setIsLoadingUniversities] = useState(true)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchUniversities()
  }, [])

  const fetchUniversities = async () => {
    setIsLoadingUniversities(true)
    try {
      const data = await ApiClient.get<UniversityData[]>("/universities/")
      setUniversities(data.filter(u => u.is_displayed))
    } catch (error) {
      console.error("Failed to fetch universities", error)
    } finally {
      setIsLoadingUniversities(false)
    }
  }

  const fetchUniversityDetails = async (universityId: string) => {
    setIsLoadingDetails(true)
    try {
      const [packsData, examsData] = await Promise.all([
        ApiClient.get<PackData[]>(`/packs?university_id=${universityId}`),
        ApiClient.get<MockExamData[]>(`/mock_exams_admin?university_id=${universityId}`)
      ])
      setPacks(packsData)
      setMockExams(examsData)
    } catch (error) {
      console.error("Failed to fetch university details", error)
      setPacks([])
      setMockExams([])
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleUniversityClick = (uni: UniversityData) => {
    setSelectedUniversity(uni)
    setActiveSection(null)
    fetchUniversityDetails(uni.id)
  }

  const filteredUniversities = universities.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Universités
          </h1>
          <p className="mt-2 text-muted-foreground">
            Recherchez votre université et accédez aux ressources disponibles
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une université"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* University Buttons */}
        <div className="flex flex-wrap gap-4">
          {isLoadingUniversities ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Chargement des universités...</span>
            </div>
          ) : filteredUniversities.length > 0 ? (
            filteredUniversities.map((uni) => (
              <Button
                key={uni.id}
                variant={selectedUniversity?.id === uni.id ? "default" : "outline"}
                onClick={() => handleUniversityClick(uni)}
              >
                <University className="mr-2 h-4 w-4" />
                {uni.name}
              </Button>
            ))
          ) : (
            <p className="text-muted-foreground">Aucune université trouvée.</p>
          )}
        </div>

        {/* Selected University */}
        {selectedUniversity && (
          <Card>
            <CardContent className="space-y-6 pt-6">
              <h2 className="text-xl font-semibold">
                {selectedUniversity.name}
              </h2>

              {/* Filters */}
              <div className="grid gap-4 md:grid-cols-3">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Formation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medicine">Médecine</SelectItem>
                    <SelectItem value="dentistry">Dentaire</SelectItem>
                    <SelectItem value="pharmacy">Pharmacie</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut du contenu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nouveau</SelectItem>
                    <SelectItem value="existing">Existant</SelectItem>
                    <SelectItem value="all">Tout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  variant={activeSection === "mcq" ? "default" : "outline"}
                  className="justify-start h-auto p-4"
                  onClick={() => setActiveSection("mcq")}
                >
                  <BookOpen className="mr-3 h-6 w-6" />
                  <div className="text-left">
                    <p className="font-medium">Packs QCM</p>
                    <p className="text-sm text-muted-foreground">
                      Entraînement par questions à choix multiples
                    </p>
                  </div>
                </Button>

                <Button
                  variant={activeSection === "exam" ? "default" : "outline"}
                  className="justify-start h-auto p-4"
                  onClick={() => setActiveSection("exam")}
                >
                  <ClipboardList className="mr-3 h-6 w-6" />
                  <div className="text-left">
                    <p className="font-medium">Examens blancs</p>
                    <p className="text-sm text-muted-foreground">
                      Simulations d’examens disponibles
                    </p>
                  </div>
                </Button>
              </div>

              {/* Dynamic Content */}
              {isLoadingDetails && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Chargement des détails...</span>
                </div>
              )}

              {!isLoadingDetails && activeSection === "mcq" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Packs QCM disponibles</h3>
                  {packs.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {packs.map(pack => (
                        <div key={pack.id} className="border rounded-lg p-4 flex flex-col justify-between">
                          <div>
                            <h4 className="font-semibold">{pack.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{pack.description}</p>
                          </div>
                          <div className="mt-4 pt-4 border-t flex items-center justify-between">
                            <span className="font-medium">{pack.price} {pack.currency}</span>
                            <Button size="sm">Acheter</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucun pack disponible pour cette université.</p>
                  )}
                </div>
              )}

              {!isLoadingDetails && activeSection === "exam" && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Examens blancs disponibles</h3>
                  {mockExams.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {mockExams.map(exam => (
                        <div key={exam.id} className="border rounded-lg p-4 flex flex-col justify-between">
                          <div>
                            <h4 className="font-semibold">{exam.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{exam.description}</p>
                            <span className="text-xs bg-muted px-2 py-1 rounded-full mt-2 inline-block">
                              {exam.total_questions} questions
                            </span>
                          </div>
                          <div className="mt-4 pt-4 border-t flex items-center justify-between">
                            <span className="font-medium">{exam.price} {exam.currency}</span>
                            <Button size="sm">Acheter</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucun examen blanc disponible pour cette université.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
