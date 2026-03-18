"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { AuthService } from "@/lib/auth-service"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/AuthContext"

export default function LoginForm() {
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callback") || searchParams.get("callbackUrl")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

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
      // Use the login method from AuthContext which handles token storage and user fetching
      await login({
        email: formData.email,
        password: formData.password,
      })

      // The login() call successfully finished and fetchUser was called internally
      // Now we can rely on redirected logic
      // Note: We need to check the just-updated user state. 
      // Since state updates are async, we might need a small trick or just use the router push 
      // and let the guards handle it, but here we want to be specific about where to go.
      
      toast({
        title: "Connexion réussie",
        description: "Chargement de votre espace...",
      })

      // Redirect will be handled by the fact that the next page will see the authenticated state
      // But we still want to trigger the push here for better UX
      // We can use the callbackUrl if present, or check the rank from a potential fresh fetch
      // But a more robust way is to just push to the dashboard and let the layout/guards handle it
      
      if (callbackUrl) {
        router.push(callbackUrl)
      } else {
        // We'll push to a generic dashboard and let the middleware/guards handle role-specific routing if needed
        // For now, we'll try to guess based on what we know or just go to student dashboard
        router.push("/tableau-de-bord")
      }
      
      // Reset loading state after successful login
      setIsLoading(false)
    } catch (error: any) {
      console.error("Login error:", error)
      setIsLoading(false)
      
      let errorMessage = "Email ou mot de passe incorrect"
      if (error && error.message) {
        errorMessage = error.message
      }
      
      toast({
        variant: "destructive",
        title: "Échec de la connexion",
        description: errorMessage,
      })
      
      setErrors({
        general: errorMessage,
      })
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Adresse email</Label>
        <Input
          id="email"
          type="email"
          placeholder="votre@email.com"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Link
          href="/mot-de-passe-oublie"
          className="text-sm text-primary hover:underline"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      {errors.general && (
        <p className="text-sm text-destructive text-center">
          {errors.general}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connexion en cours...
          </>
        ) : (
          "Se connecter"
        )}
      </Button>
    </form>
  )
}
