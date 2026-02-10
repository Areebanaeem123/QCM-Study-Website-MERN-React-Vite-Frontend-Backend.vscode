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

export default function AdminPacksPage() {
  const [search, setSearch] = useState("")

  const packs = [
    { id: "PACK101", name: "Anatomie de base", sold: 320, students: 280, status: "Active" },
    { id: "PACK102", name: "Biologie avancée", sold: 210, students: 190, status: "Active" },
    { id: "PACK103", name: "Pack Physique Mock", sold: 95, students: 90, status: "Inactive" },
  ]

  const filteredPacks = packs.filter(
    (pack) =>
      pack.name.toLowerCase().includes(search.toLowerCase()) ||
      pack.id.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestion des packs</h2>
        <p className="text-muted-foreground">
          Gérez les packs d'apprentissage, l'accès et les ventes.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher des packs..."
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
              <TableHead>Nom du pack</TableHead>
              <TableHead>Ventes</TableHead>
              <TableHead>Étudiants inscrits</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPacks.map((pack) => (
              <TableRow key={pack.id}>
                <TableCell>{pack.id}</TableCell>
                <TableCell className="font-medium">{pack.name}</TableCell>
                <TableCell>{pack.sold}</TableCell>
                <TableCell>{pack.students}</TableCell>
                <TableCell>
                  <Badge variant={pack.status === "Active" ? "default" : "secondary"}>
                    {pack.status === "Active" ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline">Voir les acheteurs</Button>
                  <Button size="sm" variant="outline">Offrir l'accès</Button>
                  <Button size="sm" variant="destructive">Révoquer</Button>
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
