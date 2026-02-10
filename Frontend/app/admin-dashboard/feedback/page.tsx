"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function AdminFeedbackPage() {
  const [search, setSearch] = useState("")

  const feedbacks = [
    { id: "FB101", student: "Alice Martin", type: "Pack", item: "Biology Basics", rating: 5, comment: "Très utile !" },
    { id: "FB102", student: "John Doe", type: "Examen Blanc", item: "Physics Mock 1", rating: 4, comment: "Bon contenu." },
    { id: "FB103", student: "Emma Clark", type: "Pack", item: "Math Essentials", rating: 3, comment: "Moyen." },
  ]

  const filteredFeedbacks = feedbacks.filter(
    (f) =>
      f.student.toLowerCase().includes(search.toLowerCase()) ||
      f.item.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Avis des étudiants</h2>
        <p className="text-muted-foreground">Consultez les avis et évaluations laissés par les étudiants.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par étudiant ou élément..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Étudiant</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Élément</TableHead>
              <TableHead>Évaluation</TableHead>
              <TableHead>Commentaire</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFeedbacks.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.id}</TableCell>
                <TableCell className="font-medium">{f.student}</TableCell>
                <TableCell>{f.type}</TableCell>
                <TableCell>{f.item}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{f.rating} ⭐</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{f.comment}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm">Voir</Button>
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
