"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function AdminActivityPage() {
  const [search, setSearch] = useState("")

  const activities = [
    { id: "ACT101", user: "Alice Martin", type: "Connexion", date: "2026-02-01 09:12" },
    { id: "ACT102", user: "John Doe", type: "Achat de Pack", date: "2026-02-02 14:45" },
    { id: "ACT103", user: "Emma Clark", type: "Inscription", date: "2026-02-03 11:30" },
    { id: "ACT104", user: "Alex Dupont", type: "Connexion", date: "2026-02-04 08:20" },
  ]

  const filteredActivities = activities.filter(
    (act) =>
      act.user.toLowerCase().includes(search.toLowerCase()) ||
      act.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Activité récente</h2>
        <p className="text-muted-foreground">Suivez les connexions récentes, inscriptions et achats.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher une activité..."
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
              <TableHead>Utilisateur</TableHead>
              <TableHead>Type d'activité</TableHead>
              <TableHead>Date & Heure</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.map((act) => (
              <TableRow key={act.id}>
                <TableCell>{act.id}</TableCell>
                <TableCell className="font-medium">{act.user}</TableCell>
                <TableCell>{act.type}</TableCell>
                <TableCell>{act.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
