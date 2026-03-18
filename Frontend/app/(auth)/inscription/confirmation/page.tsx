"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const callback = searchParams.get("callback")
  const loginUrl = callback ? `/connexion?callback=${encodeURIComponent(callback)}` : "/connexion"

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground mt-4">Inscription réussie !</CardTitle>
          <CardDescription>Votre compte a été créé avec succès</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-3 rounded-lg bg-muted p-4">
            <Mail className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Un email de confirmation a été envoyé à votre adresse email. Veuillez cliquer sur le lien pour activer
              votre compte.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Si vous ne recevez pas l'email dans les prochaines minutes, vérifiez votre dossier spam ou{" "}
            <button className="text-primary hover:underline">cliquez ici pour renvoyer l'email</button>.
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button asChild className="w-full">
            <Link href={loginUrl}>
              {callback ? "Se connecter et continuer" : "Aller à la connexion"}
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full bg-transparent">
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
