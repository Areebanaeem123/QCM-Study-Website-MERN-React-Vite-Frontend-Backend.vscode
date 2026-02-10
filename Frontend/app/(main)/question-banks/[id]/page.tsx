import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Layers, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Dummy question bank data
const bank = {
  id: 1,
  title: "Banque de QCM Anatomie",
  description: "Révisez tous les chapitres d’anatomie avec une grande base de QCM.",
  mcqCount: 850,
  category: "Médecine",
}

// Dummy MCQs
const mcqs = [
  { id: 1, question: "Quel os forme le front du crâne ?", subject: "Anatomie", lesson: "Crâne" },
  { id: 2, question: "Quelle structure passe dans le foramen magnum ?", subject: "Anatomie", lesson: "Base du crâne" },
  { id: 3, question: "Combien de vertèbres cervicales existe-t-il ?", subject: "Anatomie", lesson: "Colonne vertébrale" },
  { id: 4, question: "Quel muscle est responsable de la flexion du bras ?", subject: "Anatomie", lesson: "Membre supérieur" },
]

export default function QuestionBankDetails() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4">

        {/* Back Button */}
        <Link href="/question-banks" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux banques
        </Link>

        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-2">{bank.category}</Badge>
          <h1 className="text-3xl font-bold text-foreground">{bank.title}</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">{bank.description}</p>

          <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              {bank.mcqCount} QCM disponibles
            </div>
          </div>

          <div className="mt-6">
            <Button size="lg">
              <BookOpen className="mr-2 h-5 w-5" />
              Commencer l’entraînement
            </Button>
          </div>
        </div>

        {/* MCQ List Preview */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Aperçu des questions</h2>

          {mcqs.map((mcq) => (
            <Card key={mcq.id}>
              <CardContent className="p-4">
                <p className="font-medium text-foreground">{mcq.question}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="secondary">{mcq.subject}</Badge>
                  <Badge variant="outline">{mcq.lesson}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  )
}
