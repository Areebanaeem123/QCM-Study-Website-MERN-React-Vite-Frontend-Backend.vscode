import { BookOpen, BarChart3, Trophy, Clock, Users, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: BookOpen,
    title: "Questions Vérifiées",
    description: "Plus de 50 000 QCM validés par des professionnels de santé et mis à jour régulièrement.",
  },
  {
    icon: BarChart3,
    title: "Analyses Détaillées",
    description: "Suivez votre progression avec des statistiques complètes et identifiez vos points faibles.",
  },
  {
    icon: Trophy,
    title: "Classement National",
    description: "Comparez vos performances avec les autres étudiants et motivez-vous à progresser.",
  },
  {
    icon: Clock,
    title: "Examens Chronométrés",
    description: "Entraînez-vous dans les conditions réelles avec nos examens blancs chronométrés.",
  },
  {
    icon: Users,
    title: "Communauté Active",
    description: "Rejoignez notre forum pour échanger avec d'autres étudiants et poser vos questions.",
  },
  {
    icon: Shield,
    title: "Corrections Détaillées",
    description: "Chaque question est accompagnée d'une explication complète pour comprendre vos erreurs.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30" suppressHydrationWarning >
      <div className="container mx-auto px-4" suppressHydrationWarning>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Tout ce dont vous avez besoin pour réussir
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            QCM Study vous offre tous les outils nécessaires pour préparer efficacement vos examens médicaux.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/50 bg-card hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4 text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
