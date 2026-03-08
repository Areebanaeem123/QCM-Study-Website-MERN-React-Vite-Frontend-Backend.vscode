"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Loader2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminService, AdminFeedback } from "@/lib/admin-service"
import { useProtectedRoute, useCurrentUser } from "@/lib/auth-hooks"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function AdminFeedbackPage() {
  const isAuth = useProtectedRoute()
  const { user } = useCurrentUser()
  const router = useRouter()
  
  const [search, setSearch] = useState("")
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Rank protection
    if (user && user.rank < 5) {
      toast.error("Accès refusé. Vous devez être au moins Rank 5.")
      router.push("/admin-dashboard")
      return
    }

    const fetchFeedbacks = async () => {
      setIsLoading(true)
      try {
        const [pFeedback, mFeedback] = await Promise.all([
          AdminService.getPackFeedback(),
          AdminService.getMockExamFeedback()
        ])
        
        // Combine and sort by date
        const combined = [...pFeedback, ...mFeedback].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        
        setFeedbacks(combined)
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch feedback", err)
        setError("Impossible de charger les avis. Veuillez réessayer.")
        toast.error("Erreur lors du chargement des avis")
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuth && user && user.rank >= 5) {
      fetchFeedbacks()
    }
  }, [isAuth, user, router])

  const filteredFeedbacks = feedbacks.filter(
    (f) =>
      f.student_name.toLowerCase().includes(search.toLowerCase()) ||
      f.item_title.toLowerCase().includes(search.toLowerCase()) ||
      f.comment.toLowerCase().includes(search.toLowerCase())
  )

  if (!isAuth || (user && user.rank < 5)) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Avis des étudiants</h2>
        <p className="text-muted-foreground">Consultez les avis et évaluations laissés par les étudiants sur les packs et examens blancs.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par étudiant, élément ou commentaire..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="ml-auto underline">
            Réessayer
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-background overflow-hidden relative min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Étudiant</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Élément</TableHead>
              <TableHead>Évaluation</TableHead>
              <TableHead>Commentaire</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map((f) => (
                <TableRow key={f.review_id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(f.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                  </TableCell>
                  <TableCell className="font-medium">{f.student_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{f.type === "Pack" ? "Pack" : "Examen Blanc"}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={f.item_title}>
                    {f.item_title}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{f.rating}</span>
                      <span className="text-yellow-500">⭐</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-pre-wrap text-sm text-muted-foreground">
                    {f.comment || <span className="italic">Aucun commentaire</span>}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  {isLoading ? "Chargement..." : "Aucun avis trouvé."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
