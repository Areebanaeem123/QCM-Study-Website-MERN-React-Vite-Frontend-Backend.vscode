import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { BookOpen, Search, Users, Layers } from "lucide-react"

// Dummy data for question banks
const questionBanks = [
  {
    id: 1,
    title: "Banque de QCM Anatomie",
    description: "Ensemble complet de QCM classés par chapitres d’anatomie.",
    mcqCount: 850,
    participants: 3200,
    price: 29,
    category: "Médecine",
  },
  {
    id: 2,
    title: "Banque de QCM Biochimie",
    description: "QCM couvrant tout le programme de biochimie médicale.",
    mcqCount: 620,
    participants: 2100,
    price: 25,
    category: "Médecine",
  },
  {
    id: 3,
    title: "Banque de QCM Pharmacie",
    description: "Questions à choix multiples pour les étudiants en pharmacie.",
    mcqCount: 540,
    participants: 1800,
    price: 22,
    category: "Pharmacie",
  },
  {
    id: 4,
    title: "Banque de QCM Physiologie",
    description: "Grande base de QCM en physiologie humaine.",
    mcqCount: 710,
    participants: 2600,
    price: 27,
    category: "Médecine",
  },
]

export default function QuestionBanksPage() {
  return (
    <div className="py-12" suppressHydrationWarning>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Banques de QCM</h1>
          <p className="mt-2 text-muted-foreground">
            Accédez à des milliers de QCM classés par matière et révisez à votre rythme
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher une banque de QCM..." className="pl-10" />
          </div>
        </div>

        {/* Question Banks Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {questionBanks.map((bank) => (
            <Card key={bank.id} className="flex flex-col">
              <CardHeader>
                <Badge variant="outline">{bank.category}</Badge>
                <CardTitle className="mt-2 text-foreground">{bank.title}</CardTitle>
                <CardDescription>{bank.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <Layers className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                    <p className="text-sm font-medium text-foreground">{bank.mcqCount}</p>
                    <p className="text-xs text-muted-foreground">QCM</p>
                  </div>
                  <div>
                    <Users className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
                    <p className="text-sm font-medium text-foreground">{bank.participants}</p>
                    <p className="text-xs text-muted-foreground">Étudiants</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-2xl font-bold text-foreground">{bank.price}€</span>
                <Button asChild>
                  <Link href={`/question-banks/${bank.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Accéder
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
