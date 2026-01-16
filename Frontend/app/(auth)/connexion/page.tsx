"use client"
import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.email) {
      newErrors.email = "L'email est requis"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Format d'email invalide"
    }
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      // Simulate login
      await new Promise((resolve) => setTimeout(resolve, 1500))
      router.push("/tableau-de-bord/classement")
    } catch (error) {
      console.error("Login error:", error)
      setErrors({ general: "Une erreur s'est produite lors de la connexion" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center" suppressHydrationWarning>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground" suppressHydrationWarning >Connexion</CardTitle>
          <CardDescription>Accédez à votre espace étudiant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? "border-destructive" : ""}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit(e as any)
                  }
                }}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" suppressHydrationWarning>Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={errors.password ? "border-destructive" : ""}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit(e as any)
                    }
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="flex justify-end">
              <Link href="/mot-de-passe-oublie" className="text-sm text-primary hover:underline" suppressHydrationWarning>
                Mot de passe oublié ?
              </Link>
            </div>

            {errors.general && (
              <p className="text-sm text-destructive text-center">{errors.general}</p>
            )}

            <Button 
              onClick={handleSubmit} 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" suppressHydrationWarning/>
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="text-primary hover:underline" suppressHydrationWarning>
              S'inscrire
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}