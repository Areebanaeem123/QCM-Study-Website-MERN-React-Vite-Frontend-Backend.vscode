"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react"

const countries = [
  "France",
  "Belgique",
  "Suisse",
  "Canada",
  "Maroc",
  "Tunisie",
  "Algérie",
  "Sénégal",
  "Côte d'Ivoire",
  "Autre",
]

const diplomas = [
  "Baccalauréat",
  "PACES/PASS",
  "L1 Médecine",
  "L2 Médecine",
  "L3 Médecine",
  "M1 Médecine",
  "M2 Médecine",
  "Internat",
  "Pharmacie",
  "Autre",
]

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [formData, setFormData] = useState({
    civility: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    address: "",
    country: "",
    phone: "",
    diploma: "",
    formerSchool: "",
    university: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.civility) newErrors.civility = "La civilité est requise"
    if (!formData.firstName) newErrors.firstName = "Le prénom est requis"
    if (!formData.lastName) newErrors.lastName = "Le nom est requis"
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "La date de naissance est requise"
    if (!formData.address) newErrors.address = "L'adresse est requise"
    if (!formData.country) newErrors.country = "Le pays est requis"
    if (!formData.phone) newErrors.phone = "Le téléphone est requis"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.diploma) newErrors.diploma = "Le diplôme est requis"
    if (!formData.formerSchool) newErrors.formerSchool = "L'école d'origine est requise"
    if (!formData.university) newErrors.university = "L'université est requise"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email) {
      newErrors.email = "L'email est requis"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Format d'email invalide"
    }
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis"
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères"
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Vous devez accepter les conditions d'utilisation"
    }
    if (!captchaVerified) {
      newErrors.captcha = "Veuillez vérifier que vous n'êtes pas un robot"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep3()) return

    setIsLoading(true)
    setErrors({})

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim()
      const { register } = await import("@/lib/auth-fastapi")
      
      await register(fullName, formData.email, formData.password, 1)
      
      // Registration successful
      router.push("/inscription/confirmation")
    } catch (error: any) {
      console.error("Registration error:", error)
      setErrors({
        general: error.message || "Une erreur s'est produite lors de l'inscription",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4" suppressHydrationWarning >
      <div className="space-y-2">
        <Label htmlFor="civility">Civilité *</Label>
        <Select value={formData.civility} onValueChange={(value) => setFormData({ ...formData, civility: value })}>
          <SelectTrigger className={errors.civility ? "border-destructive" : ""}>
            <SelectValue placeholder="Sélectionner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="M.">M.</SelectItem>
            <SelectItem value="Mme">Mme</SelectItem>
            <SelectItem value="Mlle">Mlle</SelectItem>
          </SelectContent>
        </Select>
        {errors.civility && <p className="text-sm text-destructive">{errors.civility}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom *</Label>
          <Input
            id="firstName"
            placeholder="Jean"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className={errors.firstName ? "border-destructive" : ""}
          />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom *</Label>
          <Input
            id="lastName"
            placeholder="Dupont"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className={errors.lastName ? "border-destructive" : ""}
          />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date de naissance *</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          className={errors.dateOfBirth ? "border-destructive" : ""}
        />
        {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse complète *</Label>
        <Input
          id="address"
          placeholder="123 Rue de la Médecine, 75001 Paris"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className={errors.address ? "border-destructive" : ""}
        />
        {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="country">Pays *</Label>
          <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
            <SelectTrigger className={errors.country ? "border-destructive" : ""}>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="diploma">Diplôme actuel *</Label>
        <Select value={formData.diploma} onValueChange={(value) => setFormData({ ...formData, diploma: value })}>
          <SelectTrigger className={errors.diploma ? "border-destructive" : ""}>
            <SelectValue placeholder="Sélectionner votre diplôme" />
          </SelectTrigger>
          <SelectContent>
            {diplomas.map((diploma) => (
              <SelectItem key={diploma} value={diploma}>
                {diploma}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.diploma && <p className="text-sm text-destructive">{errors.diploma}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="formerSchool">École d'origine *</Label>
        <Input
          id="formerSchool"
          placeholder="Lycée Victor Hugo"
          value={formData.formerSchool}
          onChange={(e) => setFormData({ ...formData, formerSchool: e.target.value })}
          className={errors.formerSchool ? "border-destructive" : ""}
        />
        {errors.formerSchool && <p className="text-sm text-destructive">{errors.formerSchool}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="university">Université actuelle *</Label>
        <Input
          id="university"
          placeholder="Université Paris Descartes"
          value={formData.university}
          onChange={(e) => setFormData({ ...formData, university: e.target.value })}
          className={errors.university ? "border-destructive" : ""}
        />
        {errors.university && <p className="text-sm text-destructive">{errors.university}</p>}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Adresse email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="votre@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={errors.password ? "border-destructive" : ""}
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
        <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={errors.confirmPassword ? "border-destructive" : ""}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
      </div>

      {/* Captcha simulation */}
      <div className="space-y-2">
        <div
          className={`flex items-center gap-3 rounded-lg border p-4 ${errors.captcha ? "border-destructive" : "border-border"}`}
        >
          <Checkbox
            id="captcha"
            checked={captchaVerified}
            onCheckedChange={(checked) => setCaptchaVerified(checked as boolean)}
          />
          <Label htmlFor="captcha" className="cursor-pointer">
            Je ne suis pas un robot
          </Label>
        </div>
        {errors.captcha && <p className="text-sm text-destructive">{errors.captcha}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
            Je certifie avoir lu et accepté les{" "}
            <Link href="/conditions" className="text-primary hover:underline">
              conditions d'utilisation
            </Link>{" "}
            et la{" "}
            <Link href="/confidentialite" className="text-primary hover:underline">
              politique de confidentialité
            </Link>
          </Label>
        </div>
        {errors.acceptTerms && <p className="text-sm text-destructive">{errors.acceptTerms}</p>}
      </div>
    </div>
  )

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">Créer un compte</CardTitle>
          <CardDescription>Rejoignez QCM Study et commencez votre préparation</CardDescription>

          {/* Progress Steps */}
          <div className="mt-6 flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? <CheckCircle className="h-4 w-4" /> : s}
                </div>
                {s < 3 && <div className={`mx-2 h-0.5 w-8 ${step > s ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-8 text-xs text-muted-foreground">
            <span className={step >= 1 ? "text-primary" : ""}>Informations</span>
            <span className={step >= 2 ? "text-primary" : ""}>Études</span>
            <span className={step >= 3 ? "text-primary" : ""}>Compte</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {errors.general && (
              <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-3">
                <p className="text-sm text-destructive text-center">{errors.general}</p>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  Précédent
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={handleNextStep} className="flex-1">
                  Suivant
                </Button>
              ) : (
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    "Créer mon compte"
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}