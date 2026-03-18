"use client"

import { useBasket } from "@/lib/basket-context"
import { useCurrentUser } from "@/lib/auth-hooks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, ShoppingBasket, ArrowRight, ShieldCheck, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function BasketPage() {
  const { items, removeItem, clearBasket, totalPrice, totalItems } = useBasket()
  const { user } = useCurrentUser()
  const router = useRouter()

  const handleCheckout = () => {
    if (!user) {
      router.push("/connexion?callback=/panier")
      return
    }
    router.push("/panier/checkout")
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <ShoppingBasket className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold">Votre panier est vide</h1>
        <p className="mb-8 text-muted-foreground">
          Vous n'avez pas encore ajouté de packs ou d'examens à votre panier.
        </p>
        <Button asChild size="lg">
          <Link href="/examens">Découvrir les examens</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold flex items-center gap-2">
        <ShoppingCart className="h-8 w-8 text-primary" />
        Mon Panier ({totalItems})
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-32 w-full sm:w-48 bg-muted">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ShoppingBasket className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {item.type === "pack" ? "Pack de QCM" : "Examen Blanc"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold">
                      {item.price} {item.currency}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={clearBasket} className="text-destructive border-destructive hover:bg-destructive/10">
              Vider le panier
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/examens">Continuer mes achats</Link>
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total ({totalItems} articles)</span>
                <span>{totalPrice} DT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA (0%)</span>
                <span>0 DT</span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{totalPrice} DT</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Procéder au paiement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                Paiement sécurisé et crypté
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
