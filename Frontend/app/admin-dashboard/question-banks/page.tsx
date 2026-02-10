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

export default function AdminQuestionBanksPage() {
  const [search, setSearch] = useState("")

  const banks = [
    { id: "QB101", name: "Bases de la biologie", mcqs: 120 },
    { id: "QB102", name: "Fondamentaux de la physique", mcqs: 95 },
    { id: "QB103", name: "Éléments essentiels de mathématiques", mcqs: 150 },
  ]

  const filteredBanks = banks.filter(
    (bank) =>
      bank.name.toLowerCase().includes(search.toLowerCase()) ||
      bank.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestion des banques de questions</h2>
        <p className="text-muted-foreground">
          Visualisez, modifiez et gérez les banques de questions et leurs QCM.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher des banques de questions..."
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
              <TableHead>Nom de la banque</TableHead>
              <TableHead># de QCM</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBanks.map((bank) => (
              <TableRow key={bank.id}>
                <TableCell>{bank.id}</TableCell>
                <TableCell className="font-medium">{bank.name}</TableCell>
                <TableCell>{bank.mcqs}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline">Voir les QCM</Button>
                  <Button size="sm">Modifier la banque</Button>
                  <Button size="sm" variant="destructive">Supprimer la banque</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
