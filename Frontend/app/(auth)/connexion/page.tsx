"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import LoginForm from "./login-form"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const callback = searchParams.get("callback")
  const signupUrl = callback ? `/inscription?callback=${encodeURIComponent(callback)}` : "/inscription"

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Connexion
          </CardTitle>
          <CardDescription>
            Accédez à votre espace étudiant
          </CardDescription>
        </CardHeader>

        <CardContent>
          <LoginForm />
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href={signupUrl} className="text-primary hover:underline">
              S'inscrire
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
