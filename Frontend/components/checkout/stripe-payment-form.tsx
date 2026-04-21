"use client"

import { useState, useEffect } from "react"
import { useStripe, useElements, PaymentElement, PaymentRequestButtonElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react"

interface StripePaymentFormProps {
  amount: number
  isLoading: boolean
  clientSecret: string | null
  paymentMethod: string
  onSuccess: (paymentMethodId: string) => void
  onError: (error: string) => void
  handleTestPayment?: () => void
}

export function StripePaymentForm({
  amount,
  isLoading: parentLoading,
  clientSecret,
  paymentMethod,
  onSuccess,
  onError
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [paymentRequest, setPaymentRequest] = useState<any>(null)
  const [canMakePayment, setCanMakePayment] = useState(false)

  useEffect(() => {
    if (stripe && amount > 0) {
      const pr = stripe.paymentRequest({
        country: "CH", // Use appropriate country code
        currency: "eur",
        total: {
          label: "QCM Study Purchase",
          amount: Math.round(amount * 100),
        },
        requestPayerName: true,
        requestPayerEmail: true,
      })

      // Check the availability of the Payment Request API.
      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr)
          setCanMakePayment(true)
        }
      })

      pr.on("paymentmethod", async (ev) => {
        if (!clientSecret) {
          ev.complete("fail")
          return
        }

        // Confirm the PaymentIntent without any other form of input.
        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        )

        if (confirmError) {
          // Report to the browser that the payment failed, regardless of the
          // reason. The API will show a generic error message to the customer.
          ev.complete("fail")
          onError(confirmError.message || "Payment failed.")
        } else {
          // Report to the browser that the confirmation was successful, prompting
          // it to close the browser payment method collection interface.
          ev.complete("success")
          // Check if the PaymentIntent requires any actions and if so let Stripe.js
          // handle the flow. If using an API version prior to 2019-02-11,
          // `/v1/payment_intents/confirm` responds with `requires_source_action`.
          if (paymentIntent.status === "requires_action") {
            // Let Stripe.js handle the rest of the payment flow.
            const { error } = await stripe.confirmCardPayment(clientSecret)
            if (error) {
              onError(error.message || "Payment failed.")
            } else {
              onSuccess(paymentIntent.payment_method as string || "pm_authorized")
            }
          } else {
            // The payment has succeeded.
            onSuccess(paymentIntent.payment_method as string || "pm_authorized")
          }
        }
      })
    }
  }, [stripe, amount, clientSecret, onSuccess, onError])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      if (!clientSecret) onError("Payment initialization failed. Please try again.")
      return
    }

    setProcessing(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    })

    if (error) {
      onError(error.message || "An error occurred with your payment.")
      setProcessing(false)
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent.payment_method as string || "pm_authorized")
    } else {
      console.log("Payment status: " + (paymentIntent?.status || "processing"))
      setProcessing(false)
    }
  }

  // Determine if we should show the dedicated wallet button
  const showWalletButton = (paymentMethod === 'apple_pay' || paymentMethod === 'google_pay') && canMakePayment

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <label className="mb-6 block text-base font-semibold text-foreground">
          {paymentMethod === 'card' ? 'Détails de la Carte' : 
           paymentMethod === 'apple_pay' ? 'Payer avec Apple Pay' :
           paymentMethod === 'google_pay' ? 'Payer avec Google Pay' :
           (paymentMethod || 'card').replace('_', ' ')}
        </label>
        
        <div className="min-h-[120px] flex flex-col justify-center">
          {showWalletButton ? (
            <div className="space-y-4">
              <PaymentRequestButtonElement options={{ paymentRequest }} />
              <p className="text-xs text-center text-muted-foreground">
                Cliquez sur le bouton ci-dessus pour finaliser votre achat de manière sécurisée.
              </p>
            </div>
          ) : (paymentMethod === 'apple_pay' || paymentMethod === 'google_pay') ? (
            <div className="flex flex-col items-center justify-center p-4 border border-dashed rounded-md bg-muted/30">
              <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
              <p className="text-sm font-medium text-center">
                {paymentMethod === 'apple_pay' ? 'Apple Pay' : 'Google Pay'} n'est pas disponible sur cet appareil ou navigateur.
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Veuillez utiliser une carte de crédit standard.
              </p>
            </div>
          ) : (
            <PaymentElement 
              options={{
                layout: "tabs",
                paymentMethodOrder: ['card']
              }}
            />
          )}
        </div>
      </div>

      {!showWalletButton && (paymentMethod === 'card' || !(canMakePayment && (paymentMethod === 'apple_pay' || paymentMethod === 'google_pay'))) && (
        <div className="space-y-4">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!stripe || processing || parentLoading}
            className="w-full h-12 text-base font-bold shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
            size="lg"
          >
            <span className="flex items-center justify-center gap-2">
              {processing || parentLoading ? (
                <span key="loading" className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Traitement en cours...
                </span>
              ) : (
                <span key="idle">
                  Payer {(amount).toFixed(2)} €
                </span>
              )}
            </span>
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            Paiement 100% sécurisé et encrypté par Stripe
          </div>
        </div>
      )}
      
      {showWalletButton && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          Paiement 100% sécurisé par Stripe
        </div>
      )}
    </div>
  )
}
