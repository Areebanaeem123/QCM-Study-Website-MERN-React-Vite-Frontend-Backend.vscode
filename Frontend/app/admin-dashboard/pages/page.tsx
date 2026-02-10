"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPagesPage() {
  const [aboutContent, setAboutContent] = useState(
    "Ceci est le contenu de la page À propos..."
  )
  const [conceptContent, setConceptContent] = useState(
    "Ceci est le contenu de la page Concept..."
  )

  const handleSave = (page: "about" | "concept") => {
    if (page === "about") {
      alert("Page À propos sauvegardée !")
    } else {
      alert("Page Concept sauvegardée !")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pages CMS</h2>
        <p className="text-muted-foreground">
          Modifiez les pages statiques comme À propos et Concept.
        </p>
      </div>

      <Tabs defaultValue="about" className="space-y-4">
        <TabsList>
          <TabsTrigger value="about">À propos</TabsTrigger>
          <TabsTrigger value="concept">Page Concept</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <Textarea
            className="w-full h-48"
            value={aboutContent}
            onChange={(e) => setAboutContent(e.target.value)}
          />
          <Button className="mt-2" onClick={() => handleSave("about")}>
            Sauvegarder À propos
          </Button>
        </TabsContent>

        <TabsContent value="concept">
          <Textarea
            className="w-full h-48"
            value={conceptContent}
            onChange={(e) => setConceptContent(e.target.value)}
          />
          <Button className="mt-2" onClick={() => handleSave("concept")}>
            Sauvegarder Concept
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
