"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CheckCircle, BookOpen, Clock, Users, Award, ArrowLeft, ShoppingCart, Loader2, ShoppingBasket } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { DashboardService, StorePack } from "@/lib/dashboard-service"
import { useBasket } from "@/lib/basket-context"

export default function PackDetailPage() {
  const params = useParams()
  const router = useRouter()
  const packId = params.id as string
  const [pack, setPack] = useState<StorePack | null>(null)
  const [loading, setLoading] = useState(true)
  const { addItem, isInBasket } = useBasket()

  useEffect(() => {
    const fetchPack = async () => {
      try {
        const data = await DashboardService.getPackById(packId)
        setPack(data)
      } catch (error) {
        console.error("Error fetching pack:", error)
      } finally {
        setLoading(false)
      }
    }
    if (packId) fetchPack()
  }, [packId])

  const handleAddToBasket = () => {
    if (pack) {
      addItem({
        id: pack.id,
        title: pack.title,
        price: pack.price,
        currency: pack.currency,
        type: "pack",
        image_url: pack.image_url,
      })
      router.push("/panier")
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!pack) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Contenu non trouvé</h1>
        <Button asChild className="mt-4">
          <Link href="/packs">Retour à l'accueil</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="py-12" suppressHydrationWarning>
      <div className="container mx-auto px-4">
        {/* Back button */}
        <Link
          href={pack.type === "mock_exam" ? "/examens" : "/packs"}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {pack.type === "mock_exam" ? "Retour aux examens" : "Retour aux packs"}
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge>{pack.type === "mock_exam" ? "Examen" : "Pack"}</Badge>
                <Badge variant="outline">Accès illimité</Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">{pack.title}</h1>
              <p className="mt-4 text-lg text-muted-foreground">{pack.description || "Aucune description disponible pour ce pack."}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="flex flex-col items-center p-4">
                  <BookOpen className="h-6 w-6 text-primary mb-2" />
                  <span className="text-2xl font-bold text-foreground">{pack.mcqs?.length || 0}</span>
                  <span className="text-sm text-muted-foreground">QCM inclus</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center p-4">
                  <Clock className="h-6 w-6 text-primary mb-2" />
                  <span className="text-2xl font-bold text-foreground">12 mois</span>
                  <span className="text-sm text-muted-foreground">Accès</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center p-4">
                  <Award className="h-6 w-6 text-primary mb-2" />
                  <span className="text-2xl font-bold text-foreground">4.5/5</span>
                  <span className="text-sm text-muted-foreground">Note moyenne</span>
                </CardContent>
              </Card>
            </div>

            {/* What's included */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Ce qui est inclus</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-3 md:grid-cols-2">
                  <li className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Accès illimité aux questions
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Corrections détaillées
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Statistiques de progression
                  </li>
                  <li className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Mises à jour régulières
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Creator Info */}
            {pack.creator_name && (
              <div className="text-sm text-muted-foreground">
                Créé par <span className="font-medium text-foreground">{pack.creator_name}</span>
              </div>
            )}
          </div>

          {/* Sidebar - Purchase Card */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">{pack.price} DT</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Paiement unique pour un accès à vie</p>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" size="lg" onClick={handleAddToBasket} disabled={isInBasket(pack.id)}>
                    <ShoppingBasket className="mr-2 h-4 w-4" />
                    {isInBasket(pack.id) ? "Déjà au panier" : "Ajouter au panier"}
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" size="lg" asChild>
                    <Link href={`/qcm/demo?pack=${pack.id}`}>Essayer la démo</Link>
                  </Button>
                </div>

                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Paiement sécurisé
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Accès immédiat
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
