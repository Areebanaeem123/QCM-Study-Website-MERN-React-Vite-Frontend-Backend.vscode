import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CheckCircle, BookOpen, Clock, Users, Award, ArrowLeft, ShoppingCart } from "lucide-react"

// Dummy pack data
const packDetails = {
  id: 1,
  title: "Pack Médecine Essentiel",
  description:
    "Le Pack Médecine Essentiel est conçu pour les étudiants en première année de médecine. Il couvre les fondamentaux de la médecine avec plus de 2000 QCM validés par des professionnels de santé.",
  qcmCount: 2000,
  category: "Médecine",
  level: "Débutant",
  price: 49,
  originalPrice: 69,
  duration: "12 mois",
  studentsCount: 3500,
  rating: 4.8,
  features: [
    "Biochimie fondamentale - 500 QCM",
    "Anatomie générale - 600 QCM",
    "Histologie de base - 400 QCM",
    "Physiologie - 300 QCM",
    "Embryologie - 200 QCM",
  ],
  includes: [
    "Accès illimité pendant 12 mois",
    "Corrections détaillées pour chaque question",
    "Statistiques de progression",
    "Mode examen chronométré",
    "Accès sur tous vos appareils",
    "Mises à jour régulières du contenu",
  ],
  modules: [
    { name: "Biochimie fondamentale", qcm: 500, description: "Glucides, lipides, protéines, enzymes" },
    { name: "Anatomie générale", qcm: 600, description: "Ostéologie, myologie, système nerveux" },
    { name: "Histologie de base", qcm: 400, description: "Tissus épithéliaux, conjonctifs, musculaires" },
    { name: "Physiologie", qcm: 300, description: "Systèmes cardiovasculaire, respiratoire, digestif" },
    { name: "Embryologie", qcm: 200, description: "Développement embryonnaire, organogenèse" },
  ],
}

export default function PackDetailPage() {
  return (
    <div className="py-12" suppressHydrationWarning>
      <div className="container mx-auto px-4">
        {/* Back button */}
        <Link
          href="/packs"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux packs
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge>{packDetails.category}</Badge>
                <Badge variant="outline">{packDetails.level}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">{packDetails.title}</h1>
              <p className="mt-4 text-lg text-muted-foreground">{packDetails.description}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="flex flex-col items-center p-4">
                  <BookOpen className="h-6 w-6 text-primary mb-2" />
                  <span className="text-2xl font-bold text-foreground">{packDetails.qcmCount}</span>
                  <span className="text-sm text-muted-foreground">QCM</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center p-4">
                  <Clock className="h-6 w-6 text-primary mb-2" />
                  <span className="text-2xl font-bold text-foreground">{packDetails.duration}</span>
                  <span className="text-sm text-muted-foreground">Accès</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center p-4">
                  <Users className="h-6 w-6 text-primary mb-2" />
                  <span className="text-2xl font-bold text-foreground">{packDetails.studentsCount}</span>
                  <span className="text-sm text-muted-foreground">Étudiants</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center p-4">
                  <Award className="h-6 w-6 text-primary mb-2" />
                  <span className="text-2xl font-bold text-foreground">{packDetails.rating}/5</span>
                  <span className="text-sm text-muted-foreground">Note</span>
                </CardContent>
              </Card>
            </div>

            {/* Modules */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Modules inclus</CardTitle>
                <CardDescription>Détail du contenu du pack</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {packDetails.modules.map((module, i) => (
                    <div key={i} className="flex items-start justify-between border-b border-border pb-4 last:border-0">
                      <div>
                        <h4 className="font-medium text-foreground">{module.name}</h4>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                      <Badge variant="secondary">{module.qcm} QCM</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* What's included */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Ce qui est inclus</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-3 md:grid-cols-2">
                  {packDetails.includes.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-foreground">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Purchase Card */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">{packDetails.price}€</span>
                    {packDetails.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">{packDetails.originalPrice}€</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Accès pour {packDetails.duration}</p>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Acheter maintenant
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" size="lg" asChild>
                    <Link href={`/qcm/demo?pack=${packDetails.id}`}>Essayer gratuitement</Link>
                  </Button>
                </div>

                <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Paiement sécurisé
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Accès immédiat après paiement
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Satisfait ou remboursé sous 14 jours
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
