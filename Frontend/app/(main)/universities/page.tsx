"use client"

import { useState } from "react"
import { Search, University, BookOpen, ClipboardList } from "lucide-react"
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

const universities = [
  "Université de Genève",
  "Université de Lausanne",
  "Université de Zurich",
]

export default function UniversitiesPage() {
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<"mcq" | "exam" | null>(null)

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
          />
        </div>

        {/* University Buttons */}
        <div className="flex flex-wrap gap-4">
          {universities.map((uni) => (
            <Button
              key={uni}
              variant={selectedUniversity === uni ? "default" : "outline"}
              onClick={() => {
                setSelectedUniversity(uni)
                setActiveSection(null)
              }}
            >
              <University className="mr-2 h-4 w-4" />
              {uni}
            </Button>
          ))}
        </div>

        {/* Selected University */}
        {selectedUniversity && (
          <Card>
            <CardContent className="space-y-6 pt-6">
              <h2 className="text-xl font-semibold">
                {selectedUniversity}
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

              {/* Dummy Content */}
              {activeSection === "mcq" && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Packs QCM disponibles</h3>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    <li>Pack QCM – Anatomie (120 questions)</li>
                    <li>Pack QCM – Physiologie (95 questions)</li>
                    <li>Pack QCM – Pathologie (150 questions)</li>
                  </ul>
                </div>
              )}

              {activeSection === "exam" && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Examens blancs disponibles</h3>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    <li>Examen blanc – Semestre 1</li>
                    <li>Examen blanc – Semestre 2</li>
                    <li>Examen final – Simulation complète</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
