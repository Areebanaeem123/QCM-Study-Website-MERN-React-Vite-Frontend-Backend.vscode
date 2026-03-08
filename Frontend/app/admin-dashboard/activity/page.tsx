"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Loader2, User, UserPlus, ShoppingCart, LogIn } from "lucide-react"
import { AdminService, Activity as ActivityItem } from "@/lib/admin-service"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await AdminService.getRecentActivity()
        setActivities(data)
      } catch (error) {
        console.error("Failed to fetch activity", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchActivity()
  }, [])

  const filteredActivities = activities.filter(
    (act) =>
      act.user_name.toLowerCase().includes(search.toLowerCase()) ||
      act.type.toLowerCase().includes(search.toLowerCase())
  )

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "Connexion": return <LogIn className="h-4 w-4 text-blue-500" />
      case "Inscription": return <UserPlus className="h-4 w-4 text-green-500" />
      case "Achat de Pack": return <ShoppingCart className="h-4 w-4 text-purple-500" />
      default: return <User className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Connexion": return <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Connexion</Badge>
      case "Inscription": return <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50">Inscription</Badge>
      case "Achat de Pack": return <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-50">Achat de Pack</Badge>
      default: return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Activité récente</h2>
        <p className="text-muted-foreground">Suivez les connexions récentes, inscriptions et achats en temps réel.</p>
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
      <div className="rounded-lg border bg-background relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Détails</TableHead>
              <TableHead className="text-right">Date & Heure</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.map((act) => (
              <TableRow key={act.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getActivityIcon(act.type)}
                    {getTypeBadge(act.type)}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{act.user_name}</TableCell>
                <TableCell>
                   <span className="text-sm text-muted-foreground">
                     {act.type === "Connexion" ? "S'est connecté à la plateforme" : 
                      act.type === "Inscription" ? "Nouveau compte créé" : 
                      "A acheté un pack de révisions"}
                   </span>
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  {format(new Date(act.timestamp), "dd MMMM yyyy HH:mm", { locale: fr })}
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filteredActivities.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  Aucune activité trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
