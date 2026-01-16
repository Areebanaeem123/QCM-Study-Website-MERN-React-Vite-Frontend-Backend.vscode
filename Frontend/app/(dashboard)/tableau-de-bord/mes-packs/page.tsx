import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Play, Calendar } from "lucide-react"

// Dummy data
const purchasedPacks = [
  {
    id: 1,
    name: "Pack Médecine Essentiel",
    description: "Fondamentaux de la médecine pour étudiants de première année",
    progress: 65,
    totalQcm: 2000,
    completedQcm: 1300,
    purchaseDate: "15/01/2026",
    expiryDate: "15/01/2027",
    status: "active",
  },
  {
    id: 2,
    name: "Pack Pharmacie",
    description: "Spécialisé pour les étudiants en pharmacie",
    progress: 30,
    totalQcm: 1500,
    completedQcm: 450,
    purchaseDate: "20/11/2025",
    expiryDate: "20/11/2026",
    status: "active",
  },
]

const purchasedExams = [
  {
    id: 1,
    name: "Examen Blanc PACES #1",
    attempts: 3,
    bestScore: 82,
    lastAttempt: "10/01/2026",
  },
  {
    id: 2,
    name: "Examen Blanc PACES #2",
    attempts: 1,
    bestScore: 75,
    lastAttempt: "12/01/2026",
  },
]

export default function MyPacksPage() {
  return (
    <div className="space-y-6" suppressHydrationWarning >
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Mes Packs & Examens</h1>
        <p className="text-muted-foreground">Gérez vos achats et suivez votre progression</p>
      </div>

      {/* Purchased Packs */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Packs Achetés</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {purchasedPacks.map((pack) => (
            <Card key={pack.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-foreground">{pack.name}</CardTitle>
                    <CardDescription>{pack.description}</CardDescription>
                  </div>
                  <Badge variant={pack.status === "active" ? "default" : "secondary"}>
                    {pack.status === "active" ? "Actif" : "Expiré"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium text-foreground">
                      {pack.completedQcm}/{pack.totalQcm} QCM
                    </span>
                  </div>
                  <Progress value={pack.progress} className="h-2" />
                  <p className="mt-1 text-right text-sm text-muted-foreground">{pack.progress}%</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Acheté le {pack.purchaseDate}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Expire le {pack.expiryDate}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href={`/tableau-de-bord/commencer-qcm?pack=${pack.id}`}>
                    <Play className="mr-2 h-4 w-4" />
                    Continuer
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Purchased Exams */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Examens Blancs Achetés</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {purchasedExams.map((exam) => (
            <Card key={exam.id}>
              <CardHeader>
                <CardTitle className="text-foreground">{exam.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tentatives</span>
                  <span className="font-medium text-foreground">{exam.attempts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Meilleur score</span>
                  <span className="font-medium text-foreground">{exam.bestScore}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dernière tentative</span>
                  <span className="text-foreground">{exam.lastAttempt}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href={`/tableau-de-bord/examen/${exam.id}`}>Repasser l'examen</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <h3 className="text-xl font-semibold text-foreground">Besoin de plus de contenu ?</h3>
          <p className="text-muted-foreground">Découvrez nos autres packs et examens blancs</p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/packs">Voir les Packs</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/examens">Voir les Examens</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
