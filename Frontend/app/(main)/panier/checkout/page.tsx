"use client"

import { useState, useEffect } from "react"
import { useBasket } from "@/lib/basket-context"
import { useCurrentUser } from "@/lib/auth-hooks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ShieldCheck, Info, CreditCard, CheckCircle2, Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardService } from "@/lib/dashboard-service"
import Link from "next/link"

export default function CheckoutPage() {
  const { items, totalPrice, clearBasket } = useBasket()
  const { user, isLoading: authLoading } = useCurrentUser()
  const router = useRouter()
  
  const [step, setStep] = useState<"terms" | "payment" | "success">("terms")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/connexion?callback=/panier/checkout")
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (items.length === 0 && step !== "success") {
    router.push("/panier")
    return null
  }

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)
    try {
      const basketItems = items.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        price: item.price,
        currency: item.currency
      }))

      const response = await DashboardService.checkoutBasket({
        items: basketItems,
        accept_terms: true,
        payment_method: "simulated"
      })

      if (response.transaction_id) {
        setStep("success")
        clearBasket()
      }
    } catch (err: any) {
      console.error("Checkout error:", err)
      setError("Une erreur est survenue lors de la validation de votre commande. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      {/* Steps Indicator */}
      <div className="mb-8 flex justify-center items-center gap-4">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${step !== "success" ? "border-primary bg-primary text-primary-foreground" : "border-muted text-muted-foreground"}`}>1</div>
        <div className="h-px w-8 bg-muted"></div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${step === "payment" ? "border-primary bg-primary text-primary-foreground" : (step === "success" ? "border-primary bg-primary text-primary-foreground" : "border-muted text-muted-foreground")}`}>2</div>
        <div className="h-px w-8 bg-muted"></div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${step === "success" ? "border-primary bg-primary text-primary-foreground" : "border-muted text-muted-foreground"}`}>3</div>
      </div>

      {step === "terms" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Conditions d&apos;utilisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted p-4 space-y-3 text-sm">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <p><strong>Utilisation personnelle:</strong> Votre compte est strictement personnel. Toute transmission à un tiers peut entraîner l&apos;exclusion sans remboursement.</p>
              </div>
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <p><strong>Propriété intellectuelle:</strong> Tous les contenus sont protégés. Toute reproduction ou diffusion non autorisée est interdite.</p>
              </div>
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <p><strong>Responsabilité:</strong> L&apos;éditeur n&apos;est pas responsable des interruptions de service ou pannes techniques.</p>
              </div>
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <p><strong>Indépendance:</strong> QCM-STUDY est indépendant des universités suisses.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-4">
              <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(checked as boolean)} />
              <label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                J&apos;ai lu et j&apos;accepte les conditions générales d&apos;utilisation ci-dessus et je souhaite procéder au paiement.
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" asChild>
              <Link href="/panier">Retour</Link>
            </Button>
            <Button disabled={!acceptTerms} onClick={() => setStep("payment")}>
              Continuer vers le paiement
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === "payment" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Paiement Sécurisé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border p-4">
              <div className="flex justify-between font-bold text-lg mb-2">
                <span>Total à payer</span>
                <span className="text-primary">{totalPrice} DT</span>
              </div>
              <p className="text-xs text-muted-foreground">La commande sera activée immédiatement après validation.</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Méthode de paiement</h4>
              <div className="flex items-center gap-3 p-4 rounded-md border border-primary bg-primary/5">
                <div className="h-4 w-4 rounded-full border-4 border-primary"></div>
                <span className="font-medium">Stripe (Simulation)</span>
                <div className="ml-auto flex gap-1">
                  <div className="h-5 w-8 rounded bg-muted"></div>
                  <div className="h-5 w-8 rounded bg-muted"></div>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground italic">
                Note: L&apos;intégration réelle de Stripe sera implémentée dans l&apos;étape suivante.
              </p>
            </div>

            {error && (
              <div className="text-sm text-destructive font-medium text-center">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" size="lg" onClick={handleCheckout} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>Valider et Payer {totalPrice} DT</>
              )}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep("terms")} disabled={loading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Changer les options
            </Button>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              Paiement 100% sécurisé
            </div>
          </CardFooter>
        </Card>
      )}

      {step === "success" && (
        <Card className="text-center py-8">
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-6">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Merci pour votre achat !</h2>
              <p className="text-muted-foreground">
                Votre commande a été validée avec succès. Vos packs sont désormais disponibles dans votre tableau de bord.
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-sm inline-block">
              Un email de confirmation avec votre facture vous a été envoyé.
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/tableau-de-bord/mes-packs">Voir mes packs</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Retour à l&apos;accueil</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
