"use client"

import { useState, useEffect } from "react"
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
import { Search, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { AdminService, MCQ } from "@/lib/admin-service"
import { useCurrentUser, useProtectedRoute } from "@/lib/auth-hooks"
import { useToast } from "@/components/ui/use-toast"

export default function AdminResearchPage() {
  const isAuth = useProtectedRoute()
  const { user } = useCurrentUser()
  const router = useRouter()
  const { toast } = useToast()

  const [query, setQuery] = useState("")
  const [mcqs, setMcqs] = useState<MCQ[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchType, setSearchType] = useState<"keyword" | "id">("keyword")
  const [hasSearched, setHasSearched] = useState(false)

  // Redirect if rank is less than 5
  useEffect(() => {
    if (user && user.rank < 5) {
      toast({
        title: "Accès refusé",
        description: "Vous devez avoir le rang 5 ou plus.",
        variant: "destructive",
      })
      router.push("/admin-dashboard")
    }
  }, [user, router, toast])

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim()) {
       toast({
         title: "Erreur",
         description: "Veuillez entrer un terme de recherche",
         variant: "destructive",
       })
       return
    }

    setIsLoading(true)
    setHasSearched(true)
    
    try {
      const isIdSearch = query.trim().length > 20 && query.includes("-")
      
      let results: MCQ[] = []
      
      if (searchType === "id" || isIdSearch) {
        results = await AdminService.searchMCQs(undefined, query.trim())
      } else {
        results = await AdminService.searchMCQs(query.trim(), undefined)
      }
      
      setMcqs(results)
      
      if (results.length === 0) {
        toast({
          title: "Information",
          description: "Aucun QCM trouvé",
        })
      }
    } catch (error: any) {
      console.error("Search error:", error)
      toast({
        title: "Erreur de recherche",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      })
      setMcqs([])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuth || (user && user.rank < 5)) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Recherche de QCM</h2>
        <p className="text-muted-foreground">
          Recherchez des QCM par mot-clé ou par ID. (Réservé au rang 5+)
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
        <div className="flex gap-2 mb-2 sm:mb-0">
          <Button 
            type="button" 
            variant={searchType === "keyword" ? "default" : "outline"}
            onClick={() => setSearchType("keyword")}
          >
            Mot-clé
          </Button>
          <Button 
            type="button" 
            variant={searchType === "id" ? "default" : "outline"}
            onClick={() => setSearchType("id")}
          >
            ID
          </Button>
        </div>
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchType === "keyword" ? "Rechercher dans le texte ou le titre..." : "Entrer l'ID exact du QCM..."}
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <span>Rechercher</span>
        </Button>
      </form>

      {/* Table */}
      <div className="rounded-lg border bg-background overflow-hidden relative min-h-[200px]">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">ID</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mcqs.length > 0 ? (
              mcqs.map((mcq) => (
                <TableRow key={mcq.id}>
                  <TableCell className="font-mono text-xs">{mcq.id.substring(0, 8)}...</TableCell>
                  <TableCell className="font-medium">{mcq.title}</TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground">{mcq.question_text}</TableCell>
                  <TableCell>{mcq.status || 'draft'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  {hasSearched && !isLoading ? "Aucun QCM trouvé." : "Entrez une recherche pour afficher les résultats."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
