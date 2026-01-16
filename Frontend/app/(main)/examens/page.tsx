import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Clock, FileText, Search, Users } from "lucide-react"
//mock exams page 
// Dummy data for exams
const exams = [
  {
    id: 1,
    title: "Examen Blanc PACES #1",
    description: "Simulation complète du concours PACES avec correction détaillée.",
    questionCount: 120,
    duration: "3h",
    difficulty: "Difficile",
    participants: 2500,
    price: 19,
    category: "PACES",
  },
  {
    id: 2,
    title: "Examen Blanc PACES #2",
    description: "Deuxième simulation du concours avec nouveaux sujets.",
    questionCount: 120,
    duration: "3h",
    difficulty: "Difficile",
    participants: 2100,
    price: 19,
    category: "PACES",
  },
  {
    id: 3,
    title: "Examen Blanc Pharmacie",
    description: "Évaluation complète pour les étudiants en pharmacie.",
    questionCount: 100,
    duration: "2h30",
    difficulty: "Intermédiaire",
    participants: 1200,
    price: 15,
    category: "Pharmacie",
  },
  {
    id: 4,
    title: "Examen ECN Blanc #1",
    description: "Dossiers progressifs type ECN avec correction commentée.",
    questionCount: 3,
    duration: "3h",
    difficulty: "Expert",
    participants: 3200,
    price: 25,
    category: "Internat",
  },
  {
    id: 5,
    title: "QCM Anatomie - Évaluation",
    description: "Test d'évaluation complet en anatomie.",
    questionCount: 60,
    duration: "1h30",
    difficulty: "Intermédiaire",
    participants: 4500,
    price: 12,
    category: "Médecine",
  },
  {
    id: 6,
    title: "Examen Blanc Biochimie",
    description: "Évaluation approfondie en biochimie métabolique.",
    questionCount: 80,
    duration: "2h",
    difficulty: "Intermédiaire",
    participants: 1800,
    price: 14,
    category: "Médecine",
  },
]

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Facile":
      return "bg-green-100 text-green-700"
    case "Intermédiaire":
      return "bg-yellow-100 text-yellow-700"
    case "Difficile":
      return "bg-orange-100 text-orange-700"
    case "Expert":
      return "bg-red-100 text-red-700"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export default function ExamsPage() {
  return (
    <div className="py-12" suppressHydrationWarning>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Examens Blancs</h1>
          <p className="mt-2 text-muted-foreground">
            Entraînez-vous dans les conditions réelles avec nos examens chronométrés
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un examen..." className="pl-10" />
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline">{exam.category}</Badge>
                  <Badge className={getDifficultyColor(exam.difficulty)}>{exam.difficulty}</Badge>
                </div>
                <CardTitle className="mt-2 text-foreground">{exam.title}</CardTitle>
                <CardDescription>{exam.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <FileText className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                    <p className="text-sm font-medium text-foreground">{exam.questionCount}</p>
                    <p className="text-xs text-muted-foreground">Questions</p>
                  </div>
                  <div>
                    <Clock className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                    <p className="text-sm font-medium text-foreground">{exam.duration}</p>
                    <p className="text-xs text-muted-foreground">Durée</p>
                  </div>
                  <div>
                    <Users className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                    <p className="text-sm font-medium text-foreground">{exam.participants}</p>
                    <p className="text-xs text-muted-foreground">Participants</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-2xl font-bold text-foreground">{exam.price}€</span>
                <Button asChild>
                  <Link href={`/examens/${exam.id}`}>Voir détails</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
