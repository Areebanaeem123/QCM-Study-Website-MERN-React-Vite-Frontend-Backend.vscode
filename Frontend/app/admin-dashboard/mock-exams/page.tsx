"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

export default function AdminMockExamsPage() {
  const [search, setSearch] = useState("")

  const exams = [
    { id: "EX101", name: "Physics Mock 1", sold: 150, students: 140, reviews: 12, status: "Active" },
    { id: "EX102", name: "Biology Mock 2", sold: 90, students: 85, reviews: 5, status: "Active" },
    { id: "EX103", name: "Math Mock 1", sold: 60, students: 55, reviews: 3, status: "Inactive" },
  ]

  const filteredExams = exams.filter(
    (exam) =>
      exam.name.toLowerCase().includes(search.toLowerCase()) ||
      exam.id.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestion des examens blancs</h2>
        <p className="text-muted-foreground">
          Gérez les examens blancs, l'accès des étudiants et les avis.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un examen blanc..."
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
              <TableHead>Nom de l'examen</TableHead>
              <TableHead>Ventes</TableHead>
              <TableHead>Étudiants inscrits</TableHead>
              <TableHead>Avis</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell>{exam.id}</TableCell>
                <TableCell className="font-medium">{exam.name}</TableCell>
                <TableCell>{exam.sold}</TableCell>
                <TableCell>{exam.students}</TableCell>
                <TableCell>{exam.reviews}</TableCell>
                <TableCell>
                  <Badge variant={exam.status === "Active" ? "default" : "secondary"}>
                    {exam.status === "Active" ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline">Voir les acheteurs</Button>
                  <Button size="sm" variant="destructive">Révoquer l'accès</Button>
                  <Button size="sm">Aperçu</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
