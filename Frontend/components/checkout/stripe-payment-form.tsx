"use client"

import { useState } from "react"
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck } from "lucide-react"

interface StripePaymentFormProps {
  amount: number
  isLoading: boolean
  clientSecret: string | null
  onSuccess: (paymentMethodId: string) => void
  onError: (error: string) => void
  handleTestPayment?: () => void
}

export function StripePaymentForm({
  amount,
  isLoading: parentLoading,
  clientSecret,
  onSuccess,
  onError
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      if (!clientSecret) onError("Payment initialization failed. Please try again.")
      return
    }

    setProcessing(true)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setProcessing(false)
      return
    }

    // Use confirmCardPayment to actually charge the card
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    })

    if (error) {
      onError(error.message || "An error occurred with your card.")
      setProcessing(false)
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Payment succeeded on Stripe, now notify our backend
      onSuccess(paymentIntent.payment_method as string || "pm_authorized")
    } else {
      onError("Payment status: " + (paymentIntent?.status || "unknown"))
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-foreground">
          Détails de la carte
        </label>
        <div className="rounded-md border bg-background px-3 py-3 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Button
          type="submit"
          disabled={!stripe || processing || parentLoading}
          className="w-full"
          size="lg"
        >
          <span className="flex items-center justify-center gap-2">
            {processing || parentLoading ? (
              <span key="loading" className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Traitement en cours...
              </span>
            ) : (
              <span key="idle">
                Payer {(amount).toFixed(2)} DT
              </span>
            )}
          </span>
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          Paiement 100% sécurisé par Stripe
        </div>
      </div>
    </form>
  )
}
