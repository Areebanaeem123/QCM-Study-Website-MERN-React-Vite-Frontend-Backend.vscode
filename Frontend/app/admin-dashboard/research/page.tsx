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
import { Search } from "lucide-react"

export default function AdminResearchPage() {
  const [query, setQuery] = useState("")

  const mcqs = [
    { id: "MCQ101", question: "Quelle est la capitale de la France ?", subject: "Géographie" },
    { id: "MCQ102", question: "Quel organe pompe le sang ?", subject: "Biologie" },
    { id: "MCQ103", question: "Combien font 2 + 2 ?", subject: "Mathématiques" },
  ]

  const filteredMcqs = mcqs.filter(
    (mcq) =>
      mcq.question.toLowerCase().includes(query.toLowerCase()) ||
      mcq.id.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Recherche de QCM</h2>
        <p className="text-muted-foreground">
          Recherchez des QCM par mot-clé ou par ID.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher des QCM..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Matière</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMcqs.map((mcq) => (
              <TableRow key={mcq.id}>
                <TableCell>{mcq.id}</TableCell>
                <TableCell className="max-w-xs truncate font-medium">{mcq.question}</TableCell>
                <TableCell>{mcq.subject}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm">Voir</Button>
                  <Button size="sm" variant="outline">Modifier</Button>
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
