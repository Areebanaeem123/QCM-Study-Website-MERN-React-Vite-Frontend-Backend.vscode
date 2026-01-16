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
  "University of Geneva",
  "University of Lausanne",
  "University of Zurich",
]

export function UniversitiesSection() {
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(
    null
  )

  return (
    <section  id = "universities" className="py-16 md:py-24" suppressHydrationWarning>
      <div className="container mx-auto px-4 space-y-10">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Universités
          </h2>
          <p className="mt-2 text-muted-foreground">
            Recherchez votre université et accédez aux ressources disponibles
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Type a keyword to search"
            className="pl-10"
          />
        </div>

        {/* University Buttons */}
        <div className="flex flex-wrap gap-4">
          {universities.map((uni) => (
            <Button
              key={uni}
              variant={selectedUniversity === uni ? "default" : "outline"}
              onClick={() => setSelectedUniversity(uni)}
            >
              <University className="mr-2 h-4 w-4" />
              {uni}
            </Button>
          ))}
        </div>

        {/* Selected University Content */}
        {selectedUniversity && (
          <Card>
            <CardContent className="space-y-6 pt-6">
              <h3 className="text-xl font-semibold text-foreground">
                {selectedUniversity}
              </h3>

              {/* Dropdowns */}
              <div className="grid gap-4 md:grid-cols-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="University" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="dentistry">Dentistry</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Material Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="existing">Already</SelectItem>
                    <SelectItem value="all">All material</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Materials */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">MCQ Packs</p>
                    <p className="text-sm text-muted-foreground">
                      Practice QCM packs for this university
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <ClipboardList className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      Examinations
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Available mock exams and assessments
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
