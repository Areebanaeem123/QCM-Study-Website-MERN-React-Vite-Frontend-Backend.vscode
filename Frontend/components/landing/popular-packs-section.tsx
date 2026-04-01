"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react"
import { DashboardService, StorePack } from "@/lib/dashboard-service"

export function PopularPacksSection() {
  const [packs, setPacks] = useState<StorePack[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const data = await DashboardService.getAvailablePacks()
        // Sort by newest and take the first 2 as "Popular"
        const sortedData = [...data].sort((a, b) => {
          // If we have created_at, use it, otherwise keep order
          return 0 
        }).slice(0, 2)
        setPacks(sortedData)
      } catch (error) {
        console.error("Failed to fetch popular packs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPacks()
  }, [])

  return (
    <section className="py-16 md:py-24" suppressHydrationWarning>
      <div className="container mx-auto px-4" suppressHydrationWarning>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Packs QCM Populaires</h2>
            <p className="mt-2 text-muted-foreground">Choisissez le pack qui correspond à votre spécialité</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/packs">
              Voir tous les packs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-10 flex min-h-[300px] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : packs.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {packs.map((pack, index) => {
              const isPopular = index === 0; // Highlighting the first one as popular
              return (
                <Card
                  key={pack.id}
                  className={`relative border-border/50 ${isPopular ? "border-primary shadow-md" : ""}`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-4 bg-primary text-primary-foreground">Populaire</Badge>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground">{pack.title}</CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {pack.mcqs?.length || 0} QCMs
                      </span>
                    </div>
                    <CardDescription className="text-muted-foreground line-clamp-2">
                      {pack.description || "Idéal pour les étudiants avec les fondamentaux de la matière."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {/* Derived features from MCQs subjects or static generic features */}
                      <li className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Accès complet aux questions
                      </li>
                      <li className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Suivi de progression détaillé
                      </li>
                      <li className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Mode examen chronométré
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-foreground">{pack.price}{pack.currency === "CHF" ? "CHF" : "€"}</span>
                      <span className="text-sm text-muted-foreground">/an</span>
                    </div>
                    <Button asChild>
                      <Link href={`/packs/${pack.id}`}>Acheter le Pack</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="mt-10 text-center text-muted-foreground">
            Aucun pack disponible pour le moment.
          </div>
        )}
      </div>
    </section>
  )
}
