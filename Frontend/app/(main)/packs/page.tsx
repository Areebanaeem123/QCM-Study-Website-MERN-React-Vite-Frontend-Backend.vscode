"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { CheckCircle, Search, Filter, Loader2, ShoppingBasket } from "lucide-react"
import { useState, useEffect } from "react"
import { DashboardService, StorePack } from "@/lib/dashboard-service"
import { useBasket } from "@/lib/basket-context"
import { useRouter } from "next/navigation"

const categories = ["Tous", "Médecine", "Pharmacie", "PACES", "Internat"]
const levels = ["Tous", "Débutant", "Intermédiaire", "Avancé", "Expert"]

export default function PacksPage() {
  const [packs, setPacks] = useState<StorePack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const { addItem, isInBasket } = useBasket()
  const router = useRouter()

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const data = await DashboardService.getAvailablePacks()
        setPacks(data)
      } catch (error) {
        console.error("Failed to fetch packs:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPacks()
  }, [])

  const handleAddToBasket = (pack: StorePack) => {
    addItem({
      id: pack.id,
      title: pack.title,
      price: pack.price,
      currency: pack.currency || "DT",
      type: "pack",
      image_url: pack.image_url,
    })
    router.push("/panier")
  }

  const filteredPacks = packs.filter(pack => {
    const matchesSearch = pack.title.toLowerCase().includes(searchQuery.toLowerCase())
    // For now we don't have category/level in the backend model but we can add them later or filter if they exist
    return matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="py-12" suppressHydrationWarning>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Packs QCM</h1>
          <p className="mt-2 text-muted-foreground">
            Choisissez le pack qui correspond à votre niveau et votre spécialité
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un pack..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select defaultValue="Tous" onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Packs Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPacks.length > 0 ? filteredPacks.map((pack) => (
            <Card
              key={pack.id}
              className="relative flex flex-col border-border"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      Général
                    </Badge>
                    <CardTitle className="text-foreground">{pack.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-muted-foreground">{pack.description || "Aucune description disponible"}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Accès illimité aux QCM
                    </li>
                    <li className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Corrections détaillées
                    </li>
                </ul>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{pack.price} DT</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleAddToBasket(pack)} disabled={isInBasket(pack.id)}>
                    <ShoppingBasket className="h-4 w-4" />
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/packs/${pack.id}`}>Voir le pack</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Aucun pack trouvé.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
