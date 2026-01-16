import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { CheckCircle, Search, Filter } from "lucide-react"

// Dummy data for packs
const packs = [
  {
    id: 1,
    title: "Pack Médecine Essentiel",
    description: "Idéal pour les étudiants en première année avec les fondamentaux de la médecine.",
    qcmCount: 2000,
    category: "Médecine",
    level: "Débutant",
    features: ["Biochimie fondamentale", "Anatomie générale", "Histologie de base"],
    price: 49,
    originalPrice: 69,
    popular: true,
    duration: "12 mois",
  },
  {
    id: 2,
    title: "Pack Pharmacie",
    description: "Spécialisé pour les étudiants en pharmacie avec un focus sur les médicaments.",
    qcmCount: 1500,
    category: "Pharmacie",
    level: "Intermédiaire",
    features: ["Pharmacologie clinique", "Chimie thérapeutique", "Toxicologie"],
    price: 59,
    popular: false,
    duration: "12 mois",
  },
  {
    id: 3,
    title: "Pack PACES Complet",
    description: "Préparation complète pour le concours PACES avec tous les modules.",
    qcmCount: 5000,
    category: "PACES",
    level: "Avancé",
    features: ["UE1 à UE7", "Examens blancs inclus", "Statistiques détaillées"],
    price: 99,
    originalPrice: 149,
    popular: true,
    duration: "12 mois",
  },
  {
    id: 4,
    title: "Pack Anatomie Avancé",
    description: "Approfondissement complet de l'anatomie humaine pour les années supérieures.",
    qcmCount: 1800,
    category: "Médecine",
    level: "Avancé",
    features: ["Anatomie topographique", "Neuroanatomie", "Anatomie clinique"],
    price: 69,
    popular: false,
    duration: "12 mois",
  },
  {
    id: 5,
    title: "Pack Biochimie",
    description: "Maîtrisez la biochimie métabolique et structurale.",
    qcmCount: 1200,
    category: "Médecine",
    level: "Intermédiaire",
    features: ["Métabolisme glucidique", "Métabolisme lipidique", "Biochimie structurale"],
    price: 45,
    popular: false,
    duration: "12 mois",
  },
  {
    id: 6,
    title: "Pack Internat",
    description: "Préparation intensive pour les ECN/EDN.",
    qcmCount: 8000,
    category: "Internat",
    level: "Expert",
    features: ["Tous les items", "Dossiers progressifs", "Conférences de consensus"],
    price: 149,
    originalPrice: 199,
    popular: true,
    duration: "24 mois",
  },
]

const categories = ["Tous", "Médecine", "Pharmacie", "PACES", "Internat"]
const levels = ["Tous", "Débutant", "Intermédiaire", "Avancé", "Expert"]

export default function PacksPage() {
  return (
    <div className="py-12" suppressHydrationWarning>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Packs QCM</h1>
          <p className="mt-2 text-muted-foreground">
            Choisissez le pack qui correspond à votre niveau et votre spécialité
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un pack..." className="pl-10" />
          </div>
          <div className="flex gap-3">
            <Select defaultValue="Tous">
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="Tous">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Packs Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack) => (
            <Card
              key={pack.id}
              className={`relative flex flex-col ${pack.popular ? "border-primary shadow-md" : "border-border"}`}
            >
              {pack.popular && (
                <Badge className="absolute -top-3 left-4 bg-primary text-primary-foreground">Populaire</Badge>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {pack.category}
                    </Badge>
                    <CardTitle className="text-foreground">{pack.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-muted-foreground">{pack.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{pack.qcmCount} QCMs</span>
                  <span>•</span>
                  <span>{pack.level}</span>
                  <span>•</span>
                  <span>{pack.duration}</span>
                </div>
                <ul className="space-y-2">
                  {pack.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{pack.price}€</span>
                  {pack.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">{pack.originalPrice}€</span>
                  )}
                </div>
                <Button asChild>
                  <Link href={`/packs/${pack.id}`}>Voir le pack</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
