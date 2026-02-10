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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export default function AdminMcqsPage() {
  const [search, setSearch] = useState("")

  // Données fictives des QCM
  const mcqs = [
    { id: "MCQ101", question: "Quelle est la capitale de la France ?", subject: "Géographie", lesson: "Europe" },
    { id: "MCQ102", question: "Quel organe pompe le sang ?", subject: "Biologie", lesson: "Corps humain" },
    { id: "MCQ103", question: "Combien font 2 + 2 ?", subject: "Mathématiques", lesson: "Bases" },
  ]

  const filteredMcqs = mcqs.filter(
    (mcq) =>
      mcq.question.toLowerCase().includes(search.toLowerCase()) ||
      mcq.id.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold">Gestion des QCM</h2>
        <p className="text-muted-foreground">
          Visualisez, filtrez et gérez tous les QCM du système.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par question ou ID..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filtrer par matière" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bio">Biologie</SelectItem>
            <SelectItem value="math">Mathématiques</SelectItem>
            <SelectItem value="geo">Géographie</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filtrer par leçon" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lesson1">Leçon 1</SelectItem>
            <SelectItem value="lesson2">Leçon 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Matière</TableHead>
              <TableHead>Leçon</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMcqs.map((mcq) => (
              <TableRow key={mcq.id}>
                <TableCell>{mcq.id}</TableCell>
                <TableCell className="max-w-xs truncate">{mcq.question}</TableCell>
                <TableCell>{mcq.subject}</TableCell>
                <TableCell>{mcq.lesson}</TableCell>
                <TableCell className="text-right space-x-2">
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
