"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, Filter, BookOpen, Play } from "lucide-react"

// Dummy data for question categories
const questionCategories = [
  {
    id: "anatomie",
    name: "Anatomie",
    subcategories: [
      { id: "anat-1", name: "Système nerveux", count: 450 },
      { id: "anat-2", name: "Système cardiovasculaire", count: 380 },
      { id: "anat-3", name: "Système digestif", count: 320 },
      { id: "anat-4", name: "Système musculosquelettique", count: 290 },
    ],
    totalQuestions: 1440,
  },
  {
    id: "biochimie",
    name: "Biochimie",
    subcategories: [
      { id: "bio-1", name: "Métabolisme glucidique", count: 280 },
      { id: "bio-2", name: "Métabolisme lipidique", count: 250 },
      { id: "bio-3", name: "Métabolisme protéique", count: 220 },
      { id: "bio-4", name: "Enzymologie", count: 180 },
    ],
    totalQuestions: 930,
  },
  {
    id: "pharmacologie",
    name: "Pharmacologie",
    subcategories: [
      { id: "pharma-1", name: "Pharmacocinétique", count: 200 },
      { id: "pharma-2", name: "Pharmacodynamie", count: 180 },
      { id: "pharma-3", name: "Classes médicamenteuses", count: 350 },
      { id: "pharma-4", name: "Effets indésirables", count: 150 },
    ],
    totalQuestions: 880,
  },
  {
    id: "physiologie",
    name: "Physiologie",
    subcategories: [
      { id: "physio-1", name: "Physiologie cardiaque", count: 180 },
      { id: "physio-2", name: "Physiologie respiratoire", count: 160 },
      { id: "physio-3", name: "Physiologie rénale", count: 140 },
      { id: "physio-4", name: "Physiologie digestive", count: 130 },
    ],
    totalQuestions: 610,
  },
]

export default function QuestionBankPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const toggleSubcategory = (subcategoryId: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategoryId) ? prev.filter((id) => id !== subcategoryId) : [...prev, subcategoryId],
    )
  }

  const totalSelectedQuestions = questionCategories
    .filter((cat) => selectedCategories.includes(cat.id))
    .reduce((total, cat) => {
      const subcatTotal = cat.subcategories
        .filter((sub) => selectedSubcategories.includes(sub.id))
        .reduce((sum, sub) => sum + sub.count, 0)
      return total + (subcatTotal || cat.totalQuestions)
    }, 0)

  return (
    <div className="py-12" suppressHydrationWarning>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Banque de Questions</h1>
          <p className="mt-2 text-muted-foreground">
            Sélectionnez les catégories et sous-catégories pour créer votre QCM personnalisé
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Filter className="h-5 w-5" />
                  Filtres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Rechercher..." className="pl-10" />
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <Label>Difficulté</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="easy">Facile</SelectItem>
                      <SelectItem value="medium">Intermédiaire</SelectItem>
                      <SelectItem value="hard">Difficile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question Count */}
                <div className="space-y-2">
                  <Label>Nombre de questions</Label>
                  <Select defaultValue="20">
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 questions</SelectItem>
                      <SelectItem value="20">20 questions</SelectItem>
                      <SelectItem value="30">30 questions</SelectItem>
                      <SelectItem value="50">50 questions</SelectItem>
                      <SelectItem value="100">100 questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Timer Mode */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="timer" />
                  <Label htmlFor="timer">Mode chronométré</Label>
                </div>

                {/* Summary */}
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Questions disponibles</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalSelectedQuestions > 0
                      ? totalSelectedQuestions.toLocaleString()
                      : "Sélectionnez des catégories"}
                  </p>
                </div>

                <Button className="w-full" disabled={selectedCategories.length === 0}>
                  <Play className="mr-2 h-4 w-4" />
                  Commencer le QCM
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2 space-y-4">
            {questionCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <div>
                        <CardTitle className="text-lg text-foreground">{category.name}</CardTitle>
                        <CardDescription>{category.totalQuestions} questions disponibles</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <BookOpen className="mr-1 h-3 w-3" />
                      {category.totalQuestions}
                    </Badge>
                  </div>
                </CardHeader>
                {selectedCategories.includes(category.id) && (
                  <CardContent className="pt-0">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {category.subcategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={sub.id}
                              checked={selectedSubcategories.includes(sub.id)}
                              onCheckedChange={() => toggleSubcategory(sub.id)}
                            />
                            <Label htmlFor={sub.id} className="cursor-pointer text-foreground">
                              {sub.name}
                            </Label>
                          </div>
                          <span className="text-sm text-muted-foreground">{sub.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
