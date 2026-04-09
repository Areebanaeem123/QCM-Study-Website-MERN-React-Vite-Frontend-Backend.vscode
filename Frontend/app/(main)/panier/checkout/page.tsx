"use client"

import { useState, useEffect } from "react"
import { useBasket } from "@/lib/basket-context"
import { useCurrentUser } from "@/lib/auth-hooks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ShieldCheck, Info, CreditCard, CheckCircle2, Loader2, ArrowLeft, Tag, Trash2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { PaymentService } from "@/lib/payment-service"
import { MockPaymentService } from "@/lib/mock-payment-service"
import Link from "next/link"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { StripePaymentForm } from "@/components/checkout/stripe-payment-form"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder")



// Main checkout page
export default function CheckoutPage() {
  const { items, totalPrice, originalPrice, discountAmount, voucher, applyVoucher, removeVoucher, clearBasket, paymentMethod, setPaymentMethod } = useBasket()
  const { user, isLoading: authLoading } = useCurrentUser()
  const router = useRouter()

  const [step, setStep] = useState<"review" | "terms" | "voucher" | "payment" | "success">("review")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voucherCode, setVoucherCode] = useState("")
  const [applyingVoucher, setApplyingVoucher] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

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

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setError("Please enter a voucher code")
      return
    }

    setApplyingVoucher(true)
    setError(null)

    try {
      // Real API call
      const result = await PaymentService.validateVoucher(
        voucherCode,
        originalPrice,
        items.map(item => ({
          id: item.id,
          type: item.type,
          title: item.title,
          price: item.price
        }))
      )

      if (result.valid) {
        applyVoucher(
          {
            code: voucherCode.toUpperCase(),
            valid: true
          },
          result.discount_amount
        )
        setVoucherCode("")
        setError(null)
      } else {
        setError(result.message || "Invalid voucher code")
      }
    } catch (err: any) {
      setError(err.message || "Failed to validate voucher")
    } finally {
      setApplyingVoucher(false)
    }
  }

  const handleCreatePaymentIntent = async () => {
    if (!acceptTerms) {
      setError("You must accept the terms to proceed")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Real API call
      const response = await PaymentService.createPaymentIntent({
        items: items.map(item => ({
          id: item.id,
          type: item.type,
          title: item.title,
          price: item.price,
          currency: item.currency
        })),
        payment_method: paymentMethod || "card",
        accept_terms: true,
        voucher_code: voucher?.code
      })

      setPaymentIntentId(response.payment_intent_id)
      setClientSecret(response.client_secret)
      setTransactionId(response.transaction_id)
      setStep("payment")
    } catch (err: any) {
      setError(err.message || "Failed to create payment intent")
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentMethodId: string) => {
    if (!paymentIntentId || !transactionId) return

    setLoading(true)
    setError(null)

    try {
      // Real API call
      const response = await PaymentService.confirmPayment({
        payment_intent_id: paymentIntentId,
        transaction_id: transactionId
      })

      if (response.status === "completed") {
        setStep("success")
        clearBasket()
      } else {
        setError("Payment confirmation failed")
      }
    } catch (err: any) {
      setError(err.message || "Failed to confirm payment")
    } finally {
      setLoading(false)
    }
  }

  const handleTestPayment = async () => {
    if (!paymentIntentId || !transactionId) return

    setLoading(true)
    setError(null)

    try {
      // COMMENTED OUT: Real API call
      // const response = await PaymentService.confirmPayment({...})

      // MOCK: Using mock payment confirmation
      const response = await MockPaymentService.confirmPayment({
        payment_intent_id: paymentIntentId,
        transaction_id: transactionId
      })

      if (response.status === "completed") {
        setStep("success")
        clearBasket()
      } else {
        setError("Payment confirmation failed")
      }
    } catch (err: any) {
      setError(err.message || "Failed to confirm payment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      {/* Steps Indicator */}
      <div className="mb-12 flex justify-center items-center gap-2 md:gap-4">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-semibold text-sm ${step !== "success" ? "border-primary bg-primary text-primary-foreground" : "border-primary bg-primary text-primary-foreground"}`}>
          1
        </div>
        <div className="h-px w-4 md:w-8 bg-muted"></div>

        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-semibold text-sm ${["voucher", "terms", "payment", "success"].includes(step) ? "border-primary bg-primary text-primary-foreground" : "border-muted text-muted-foreground"}`}>
          2
        </div>
        <div className="h-px w-4 md:w-8 bg-muted"></div>

        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-semibold text-sm ${step === "success" ? "border-primary bg-primary text-primary-foreground" : "border-muted text-muted-foreground"}`}>
          3
        </div>
      </div>

      {/* Review Step */}
      {step === "review" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Vérifiez votre commande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center p-4 rounded-lg bg-muted">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground capitalize">{item.type.replace("_", " ")}</p>
                  </div>
                  <p className="font-semibold">{item.price.toFixed(2)} {item.currency}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-border p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span>{originalPrice.toFixed(2)} DT</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Réduction</span>
                  <span>-{discountAmount.toFixed(2)} DT</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{totalPrice.toFixed(2)} DT</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" asChild>
              <Link href="/panier">Retour</Link>
            </Button>
            <Button onClick={() => setStep("voucher")}>
              Continuer
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Voucher Step */}
      {step === "voucher" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-6 w-6" />
              Code de réduction (optionnel)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {voucher ? (
              <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-700">Code appliqué: {voucher.code}</p>
                    <p className="text-sm text-green-600">Réduction: {discountAmount.toFixed(2)} DT</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVoucher()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Entrez votre code de réduction"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    disabled={applyingVoucher}
                  />
                  <Button
                    onClick={handleApplyVoucher}
                    disabled={applyingVoucher || !voucherCode.trim()}
                  >
                    {applyingVoucher ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Appliquer"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive font-medium">
                {error}
              </div>
            )}

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{originalPrice.toFixed(2)} DT</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction</span>
                  <span>-{discountAmount.toFixed(2)} DT</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{totalPrice.toFixed(2)} DT</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep("review")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button onClick={() => setStep("terms")}>
              Continuer
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Terms Step */}
      {step === "terms" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Conditions d'utilisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted p-4 space-y-3 text-sm max-h-64 overflow-y-auto">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p><strong>Utilisation personnelle:</strong> Votre compte est strictement personnel. Toute transmission à un tiers peut entraîner l'exclusion sans remboursement.</p>
              </div>
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p><strong>Propriété intellectuelle:</strong> Tous les contenus sont protégés. Toute reproduction ou diffusion non autorisée est interdite.</p>
              </div>
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p><strong>Responsabilité:</strong> L'éditeur n'est pas responsable des interruptions de service ou pannes techniques.</p>
              </div>
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p><strong>Paiement sécurisé:</strong> Tous les paiements sont traités de manière sécurisée via Stripe.</p>
              </div>
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p><strong>Indépendance:</strong> QCM-STUDY est indépendant des universités suisses.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm leading-relaxed">
                J'ai lu et j'accepte les conditions générales d'utilisation ci-dessus et je souhaite procéder au paiement.
              </label>
            </div>

            {error && (
              <div className="text-sm text-destructive font-medium">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep("voucher")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button disabled={!acceptTerms || loading} onClick={handleCreatePaymentIntent}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Continuer vers le paiement"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Payment Step */}
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
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{originalPrice.toFixed(2)} DT</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span>-{discountAmount.toFixed(2)} DT</span>
                  </div>
                )}
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total à payer</span>
                <span className="text-primary">{totalPrice.toFixed(2)} DT</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Méthode de paiement</h4>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-4 rounded-md border cursor-pointer hover:bg-muted transition">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod("card" as any)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">Carte bancaire</span>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-md border cursor-pointer hover:bg-muted transition opacity-50 pointer-events-none">
                  <input
                    type="radio"
                    name="payment"
                    value="apple_pay"
                    disabled
                    className="w-4 h-4"
                  />
                  <span className="font-medium">Apple Pay</span>
                  <span className="text-xs text-muted-foreground ml-auto">(Bientôt)</span>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-md border cursor-pointer hover:bg-muted transition opacity-50 pointer-events-none">
                  <input
                    type="radio"
                    name="payment"
                    value="google_pay"
                    disabled
                    className="w-4 h-4"
                  />
                  <span className="font-medium">Google Pay</span>
                  <span className="text-xs text-muted-foreground ml-auto">(Bientôt)</span>
                </label>
              </div>
            </div>

            {paymentMethod === "card" && (
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  amount={totalPrice}
                  isLoading={loading}
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onError={(msg) => setError(msg)}
                />
              </Elements>
            )}

            {error && (
              <div className="text-sm text-destructive font-medium text-center">
                {error}
              </div>
            )}

            <Button variant="ghost" className="w-full" onClick={() => setStep("terms")} disabled={loading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Paiement 100% sécurisé par Stripe
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Step */}
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
                Votre commande a été validée avec succès. Un email de confirmation a été envoyé à {user?.email}.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Vos packs et examens sont désormais disponibles dans votre tableau de bord.
              </p>
            </div>

            <Button asChild className="mx-auto w-full max-w-xs">
              <Link href="/tableau-de-bord">Accéder au tableau de bord</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
