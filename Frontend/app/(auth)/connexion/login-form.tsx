"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { AuthService } from "@/lib/auth-service"
import { useToast } from "@/components/ui/use-toast"

export default function LoginForm() {
  const { toast } = useToast()
  const router = useRouter()
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
      // Call backend login endpoint
      const response = await AuthService.login({
        email: formData.email,
        password: formData.password,
      })

      try {
        // Extract user rank from JWT token without additional API call
        const token = response.access_token
        
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload)
        const userRank = payload.rank

        // Set loading to false before navigation to improve perceived snappiness
        setIsLoading(false)

        // Redirect based on user role
        if (userRank === 6) {
          toast({
            title: "Connexion réussie",
            description: "Chargement de l'administration...",
          })
          router.push("/admin-dashboard")
        } else {
          toast({
            title: "Connexion réussie",
            description: "Chargement du tableau de bord...",
          })
          router.push("/tableau-de-bord")
        }
      } catch (tokenError) {
        console.error("Token parsing error:", tokenError)
        setIsLoading(false)
        toast({
          title: "Connexion réussie",
        })
        router.push("/tableau-de-bord")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setIsLoading(false)
      toast({
        variant: "destructive",
        title: "Échec de la connexion",
        description: error instanceof Error ? error.message : "Email ou mot de passe incorrect",
      })
      if (error instanceof Error) {
        setErrors({
          general: error.message || "Email ou mot de passe incorrect",
        })
      } else {
        setErrors({
          general: "Email ou mot de passe incorrect",
        })
      }
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
