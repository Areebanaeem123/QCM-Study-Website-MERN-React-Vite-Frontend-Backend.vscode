"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Trophy, RotateCcw, Home, BarChart3 } from "lucide-react"

// Dummy detailed results
const detailedResults = [
  {
    question: "L'artère carotide approvisionne...",
    correct: true,
    yourAnswer: "Artère carotide",
    category: "Anatomie",
  },
  { question: "Quel nerf innerve le quadriceps...", correct: true, yourAnswer: "Nerf fémoral", category: "Anatomie" },
  {
    question: "Quelle enzyme catalyse la glycolyse...",
    correct: false,
    yourAnswer: "Phosphofructokinase",
    correctAnswer: "Hexokinase",
    category: "Biochimie",
  },
  { question: "Le coronaire supprime quel organe...", correct: true, yourAnswer: "Cœur", category: "Physiologie" },
  { question: "Site de production de l'EPO...", correct: true, yourAnswer: "Reins", category: "Physiologie" },
]

function ResultsContent() {
  const searchParams = useSearchParams()
  const score = Number.parseInt(searchParams.get("score") || "80")
  const correct = Number.parseInt(searchParams.get("correct") || "4")
  const total = Number.parseInt(searchParams.get("total") || "5")

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Excellent travail !"
    if (score >= 80) return "Très bien !"
    if (score >= 70) return "Bien !"
    if (score >= 60) return "Assez bien"
    return "Continuez à vous entraîner"
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6" suppressHydrationWarning>
      {/* Score Card */}
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Trophy className={`h-10 w-10 ${getScoreColor(score)}`} />
          </div>
          <CardTitle className="mt-4 text-3xl font-bold text-foreground">{getScoreMessage(score)}</CardTitle>
          <CardDescription>Vous avez terminé le QCM</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center">
            <div className={`text-6xl font-bold ${getScoreColor(score)}`}>{score}%</div>
          </div>

          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-foreground">{correct}</span>
              </div>
              <p className="text-sm text-muted-foreground">Correctes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold text-foreground">{total - correct}</span>
              </div>
              <p className="text-sm text-muted-foreground">Incorrectes</p>
            </div>
          </div>

          <Progress value={score} className="h-3" />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/tableau-de-bord/commencer-qcm">
                <RotateCcw className="mr-2 h-4 w-4" />
                Nouveau QCM
              </Link>
            </Button>
            <Button variant="outline" asChild className="bg-transparent">
              <Link href="/tableau-de-bord">
                <Home className="mr-2 h-4 w-4" />
                Tableau de bord
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="h-5 w-5 text-primary" />
            Détail des réponses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {detailedResults.map((result, i) => (
              <div
                key={i}
                className={`rounded-lg border p-4 ${result.correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {result.correct ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium text-foreground">Question {i + 1}</span>
                      <span className="text-sm text-muted-foreground">• {result.category}</span>
                    </div>
                    <p className="text-sm text-foreground">{result.question}</p>
                    <p className="mt-1 text-sm">
                      <span className="text-muted-foreground">Votre réponse: </span>
                      <span className={result.correct ? "text-green-700" : "text-red-700"}>{result.yourAnswer}</span>
                    </p>
                    {!result.correct && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Bonne réponse: </span>
                        <span className="text-green-700">{result.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Performance par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">Anatomie</span>
                <span className="font-medium text-foreground">100%</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">Biochimie</span>
                <span className="font-medium text-foreground">0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">Physiologie</span>
                <span className="font-medium text-foreground">100%</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <Suspense fallback={<div className="flex justify-center py-12">Chargement...</div>}>
          <ResultsContent />
        </Suspense>
      </div>
    </div>
  )
}
