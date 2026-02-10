"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminSlidersPage() {
  const [title, setTitle] = useState("")
  const [image, setImage] = useState<File | null>(null)

  const [sliders, setSliders] = useState([
    { id: "SL101", title: "Bienvenue sur QCM Study", imageUrl: "/slider1.jpg" },
    { id: "SL102", title: "Boostez votre apprentissage", imageUrl: "/slider2.jpg" },
  ])

  const handleAddSlider = () => {
    if (title && image) {
      const newSlider = {
        id: `SL${Math.floor(Math.random() * 1000)}`,
        title,
        imageUrl: URL.createObjectURL(image),
      }
      setSliders([newSlider, ...sliders])
      setTitle("")
      setImage(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Sliders de la page d'accueil</h2>
        <p className="text-muted-foreground">
          Gérez les sliders de la page d'accueil pour les promotions ou les annonces.
        </p>
      </div>

      {/* Add Slider */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Titre du slider"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && setImage(e.target.files[0])}
        />
        <Button onClick={handleAddSlider}>Ajouter un slider</Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sliders.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.id}</TableCell>
                <TableCell className="font-medium">{s.title}</TableCell>
                <TableCell>
                  <img src={s.imageUrl} alt={s.title} className="h-16 w-auto rounded-md" />
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm">Modifier</Button>
                  <Button size="sm" variant="destructive">Supprimer</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
