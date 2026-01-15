"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { GraduationCap, ArrowLeft, User, Mail, Lock, Phone, MapPin, Building, Calendar, BookOpen } from "lucide-react"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    civility: "",
    firstName: "",
    surname: "",
    dateOfBirth: "",
    fullAddress: "",
    postalCode: "",
    country: "",
    city: "",
    phoneNumber: "",
    diploma: "",
    oldSchool: "",
    university: "",
    yearOfStudy: "",
    email: "",
    password: "",
    howFoundUs: "",
    acceptTerms: false,
    notARobot: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  const universities = [
    "Université de Genève (UNIGE)",
    "Université de Lausanne (UNIL)",
    "Université de Fribourg (UNIFR)",
    "Université de Berne (UNIBE)",
    "Université de Zurich (UZH)",
    "Université de Bâle (UNIBAS)",
    "ETH Zurich",
    "EPFL Lausanne",
    "Autre",
  ]

  const yearsOfStudy = [
    "1ère année",
    "2ème année",
    "3ème année",
    "4ème année",
    "5ème année",
    "6ème année",
    "Master",
    "Doctorat",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background py-8 px-4">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto relative">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Retour à l'accueil
        </Link>

        <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                <GraduationCap className="w-9 h-9 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Créer un compte</CardTitle>
            <CardDescription className="text-muted-foreground">
              Rejoignez QCM-Study et commencez à réviser efficacement
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                  <User className="w-5 h-5 text-primary" />
                  Informations personnelles
                </h3>

                {/* Civility */}
                <div className="space-y-2">
                  <Label htmlFor="civility" className="text-foreground font-medium">
                    Civilité <span className="text-destructive">*</span>
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("civility", value)}>
                    <SelectTrigger className="h-12 bg-background border-border">
                      <SelectValue placeholder="Sélectionnez votre civilité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mr">Monsieur</SelectItem>
                      <SelectItem value="mme">Madame</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* First Name & Surname */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-foreground font-medium">
                      Prénom <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Votre prénom"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="h-12 bg-background border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surname" className="text-foreground font-medium">
                      Nom <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="surname"
                      placeholder="Votre nom"
                      value={formData.surname}
                      onChange={(e) => handleInputChange("surname", e.target.value)}
                      className="h-12 bg-background border-border"
                      required
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-foreground font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Date de naissance <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className="h-12 bg-background border-border"
                    required
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Adresse
                </h3>

                {/* Full Address */}
                <div className="space-y-2">
                  <Label htmlFor="fullAddress" className="text-foreground font-medium">
                    Adresse complète <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullAddress"
                    placeholder="Rue et numéro"
                    value={formData.fullAddress}
                    onChange={(e) => handleInputChange("fullAddress", e.target.value)}
                    className="h-12 bg-background border-border"
                    required
                  />
                </div>

                {/* Postal Code & City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-foreground font-medium">
                      Code postal <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="postalCode"
                      placeholder="1200"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      className="h-12 bg-background border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-foreground font-medium">
                      Ville <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="city"
                      placeholder="Genève"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="h-12 bg-background border-border"
                      required
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-foreground font-medium">
                    Pays <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="country"
                    placeholder="Suisse"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className="h-12 bg-background border-border"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-foreground font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Numéro de téléphone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+41 79 123 45 67"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="h-12 bg-background border-border"
                    required
                  />
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Informations académiques
                </h3>

                {/* Diploma */}
                <div className="space-y-2">
                  <Label htmlFor="diploma" className="text-foreground font-medium">
                    Diplôme <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="diploma"
                    placeholder="Maturité gymnasiale, Baccalauréat..."
                    value={formData.diploma}
                    onChange={(e) => handleInputChange("diploma", e.target.value)}
                    className="h-12 bg-background border-border"
                    required
                  />
                </div>

                {/* Old School */}
                <div className="space-y-2">
                  <Label htmlFor="oldSchool" className="text-foreground font-medium">
                    Ancien établissement <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="oldSchool"
                    placeholder="Nom de votre ancienne école"
                    value={formData.oldSchool}
                    onChange={(e) => handleInputChange("oldSchool", e.target.value)}
                    className="h-12 bg-background border-border"
                    required
                  />
                </div>

                {/* University */}
                <div className="space-y-2">
                  <Label htmlFor="university" className="text-foreground font-medium flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    Université <span className="text-destructive">*</span>
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("university", value)}>
                    <SelectTrigger className="h-12 bg-background border-border">
                      <SelectValue placeholder="Sélectionnez votre université" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((uni) => (
                        <SelectItem key={uni} value={uni.toLowerCase().replace(/\s+/g, "-")}>
                          {uni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year of Study */}
                <div className="space-y-2">
                  <Label htmlFor="yearOfStudy" className="text-foreground font-medium">
                    Année d'étude <span className="text-destructive">*</span>
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("yearOfStudy", value)}>
                    <SelectTrigger className="h-12 bg-background border-border">
                      <SelectValue placeholder="Sélectionnez votre année" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearsOfStudy.map((year) => (
                        <SelectItem key={year} value={year.toLowerCase().replace(/\s+/g, "-")}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Account Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Informations de compte
                </h3>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Adresse e-mail <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10 h-12 bg-background border-border"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">
                    Mot de passe <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 8 caractères"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10 h-12 bg-background border-border"
                      required
                      minLength={8}
                    />
                  </div>
                </div>
              </div>

              {/* How Did You Find Us */}
              <div className="space-y-2">
                <Label htmlFor="howFoundUs" className="text-foreground font-medium">
                  Comment avez-vous découvert QCM-Study ?
                </Label>
                <Textarea
                  id="howFoundUs"
                  placeholder="Réseaux sociaux, recommandation d'un ami, recherche Google..."
                  value={formData.howFoundUs}
                  onChange={(e) => handleInputChange("howFoundUs", e.target.value)}
                  className="bg-background border-border min-h-[100px] resize-none"
                />
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-4 pt-4 border-t border-border">
                {/* Accept Terms Checkbox */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                    className="mt-1"
                  />
                  <Label htmlFor="acceptTerms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    J'accepte les{" "}
                    <Link href="/terms" className="text-primary hover:underline font-medium">
                      conditions générales d'utilisation
                    </Link>{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                </div>

                {/* Not a Robot Checkbox */}
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                  <Checkbox
                    id="notARobot"
                    checked={formData.notARobot}
                    onCheckedChange={(checked) => handleInputChange("notARobot", checked as boolean)}
                  />
                  <Label htmlFor="notARobot" className="text-sm text-foreground cursor-pointer font-medium">
                    Je ne suis pas un robot <span className="text-destructive">*</span>
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg"
                disabled={isLoading || !formData.acceptTerms || !formData.notARobot}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Création du compte...
                  </span>
                ) : (
                  "Créer mon compte"
                )}
              </Button>

              {/* Already have account */}
              <p className="text-center text-muted-foreground">
                Vous avez déjà un compte ?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Se connecter
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
