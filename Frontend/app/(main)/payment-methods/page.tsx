"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentMethodsPage() {
  return (
    <div className="container mx-auto max-w-3xl py-10" suppressHydrationWarning>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Méthodes de paiement
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            QCM-Study vous permet de payer vos commandes de packs QCM ou examens
            blancs de différentes façons :
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>
              Cartes bancaires (MasterCard, Visa, American Express et Discover
              Card)
            </li>
            <li>Cartes prépayées Visa et MasterCard</li>
            <li>Virement bancaire</li>
          </ul>

          <p>
            La façon la plus rapide pour payer reste les moyens en ligne mais si
            cela n&apos;est pas possible et que vous souhaitez effectuer un
            virement bancaire, veuillez directement contacter notre secrétariat
            par e-mail à&nbsp;
            <span className="font-medium text-foreground">
              infos@qcm-study.ch
            </span>
            &nbsp;en précisant les packs QCM/examens blancs que vous souhaitez
            acheter.
          </p>

          <p>
            Nous vous donnerons les informations de paiement dans les plus brefs
            délais.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
