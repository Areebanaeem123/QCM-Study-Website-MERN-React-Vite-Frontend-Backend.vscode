import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight } from "lucide-react"

const packs = [
  {
    id: 1,
    title: "Pack Médecine Essentiel",
    description: "Idéal pour les étudiants en première année avec les fondamentaux de la médecine.",
    qcmCount: 2000,
    simulations: "Réflexes Simulations",
    features: ["Biochimie fondamentale", "Anatomie générale", "QCM leader Pharmothèques"],
    price: 49,
    popular: true,
  },
  {
    id: 2,
    title: "Pack Pharmacie",
    description: "Spécialisé pour les étudiants en pharmacie avec un focus sur les médicaments.",
    qcmCount: 1500,
    simulations: "Pharmacie",
    features: ["Biochimie des Procaryotes", "Récréation de structures", "Détaillicatat en substitution"],
    price: 59,
    popular: false,
  },
]

export function PopularPacksSection() {
  return (
    <section className="py-16 md:py-24" suppressHydrationWarning>
      <div className="container mx-auto px-4" suppressHydrationWarning>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Packs QCM Populaires</h2>
            <p className="mt-2 text-muted-foreground">Choisissez le pack qui correspond à votre spécialité</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/packs">
              Voir tous les packs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {packs.map((pack) => (
            <Card
              key={pack.id}
              className={`relative border-border/50 ${pack.popular ? "border-primary shadow-md" : ""}`}
            >
              {pack.popular && (
                <Badge className="absolute -top-3 left-4 bg-primary text-primary-foreground">Populaire</Badge>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">{pack.title}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {pack.qcmCount} QCMs | {pack.simulations}
                  </span>
                </div>
                <CardDescription className="text-muted-foreground">{pack.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pack.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-foreground">{pack.price}€</span>
                  <span className="text-sm text-muted-foreground">/an</span>
                </div>
                <Button asChild>
                  <Link href={`/packs/${pack.id}`}>Acheter le Pack</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
