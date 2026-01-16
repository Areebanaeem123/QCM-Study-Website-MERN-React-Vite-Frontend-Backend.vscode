"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle, BookOpen } from "lucide-react"

// Dummy questions
const dummyQuestions = [
  {
    id: 1,
    question: "L'artère carotide approvisionne principalement quelle région du corps ?",
    options: [
      { id: "a", text: "Artère carotide" },
      { id: "b", text: "Artère fémorale" },
      { id: "c", text: "Artère brachiale" },
      { id: "d", text: "Artère poplitée" },
    ],
    correctAnswer: "a",
    category: "Médecine",
    subject: "Anatomie",
    explanation:
      "L'artère carotide est le principal vaisseau sanguin qui approvisionne le cerveau. Elle monte dans le cou et se divise en artère carotide interne (cerveau) et externe (face).",
    reference: "Gray's Anatomy",
  },
  {
    id: 2,
    question: "Quel nerf innerve principalement le muscle quadriceps fémoral ?",
    options: [
      { id: "a", text: "Nerf sciatique" },
      { id: "b", text: "Nerf fémoral" },
      { id: "c", text: "Nerf obturateur" },
      { id: "d", text: "Nerf tibial" },
    ],
    correctAnswer: "b",
    category: "Médecine",
    subject: "Anatomie",
    explanation:
      "Le nerf fémoral (L2-L4) innerve le muscle quadriceps fémoral, permettant l'extension du genou. C'est le principal nerf moteur de la loge antérieure de la cuisse.",
    reference: "Netter's Atlas",
  },
  {
    id: 3,
    question: "Quelle enzyme catalyse la première réaction de la glycolyse ?",
    options: [
      { id: "a", text: "Phosphofructokinase" },
      { id: "b", text: "Hexokinase" },
      { id: "c", text: "Pyruvate kinase" },
      { id: "d", text: "Aldolase" },
    ],
    correctAnswer: "b",
    category: "Médecine",
    subject: "Biochimie",
    explanation:
      "L'hexokinase catalyse la phosphorylation du glucose en glucose-6-phosphate, première étape de la glycolyse. Cette réaction est irréversible et consomme un ATP.",
    reference: "Lehninger Biochemistry",
  },
  {
    id: 4,
    question: "Le coronaire supprime le niveau de quel organe ?",
    options: [
      { id: "a", text: "Cœur" },
      { id: "b", text: "Poumons" },
      { id: "c", text: "Foie" },
      { id: "d", text: "Reins" },
    ],
    correctAnswer: "a",
    category: "Médecine",
    subject: "Physiologie",
    explanation:
      "Les artères coronaires sont les vaisseaux qui irriguent le muscle cardiaque (myocarde). Elles naissent de l'aorte juste au-dessus de la valve aortique.",
    reference: "Guyton Physiology",
  },
  {
    id: 5,
    question: "Quel est le principal site de production de l'érythropoïétine ?",
    options: [
      { id: "a", text: "Foie" },
      { id: "b", text: "Rate" },
      { id: "c", text: "Reins" },
      { id: "d", text: "Moelle osseuse" },
    ],
    correctAnswer: "c",
    category: "Médecine",
    subject: "Physiologie",
    explanation:
      "L'érythropoïétine (EPO) est principalement produite par les reins (90%) en réponse à l'hypoxie. Elle stimule la production de globules rouges dans la moelle osseuse.",
    reference: "Harrison's Principles",
  },
]

export default function QCMSessionPage() {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([])
  const [showCorrection, setShowCorrection] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes for demo
  const [isFinished, setIsFinished] = useState(false)

  const questions = dummyQuestions
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  // Timer
  useEffect(() => {
    if (isFinished || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsFinished(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isFinished, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

  const toggleFlag = () => {
    setFlaggedQuestions((prev) =>
      prev.includes(currentQuestion.id)
        ? prev.filter((id) => id !== currentQuestion.id)
        : [...prev, currentQuestion.id],
    )
  }

  const goToQuestion = (index: number) => {
    setShowCorrection(false)
    setCurrentQuestionIndex(index)
  }

  const nextQuestion = () => {
    setShowCorrection(false)
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const prevQuestion = () => {
    setShowCorrection(false)
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const validateAnswer = () => {
    setShowCorrection(true)
  }

  const finishExam = useCallback(() => {
    setIsFinished(true)
    // Calculate score
    let correct = 0
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++
    })
    const score = Math.round((correct / questions.length) * 100)
    router.push(`/qcm/resultats?score=${score}&correct=${correct}&total=${questions.length}`)
  }, [answers, questions, router])

  // Auto-finish when time runs out
  useEffect(() => {
    if (timeRemaining <= 0 && !isFinished) {
      finishExam()
    }
  }, [timeRemaining, isFinished, finishExam])

  const selectedAnswer = answers[currentQuestion.id]
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer

  return (
    <div className="min-h-screen bg-muted/30" suppressHydrationWarning>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setShowExitDialog(true)}>
              Quitter
            </Button>
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="secondary">{currentQuestion.category}</Badge>
              <Badge variant="outline">{currentQuestion.subject}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 text-lg font-semibold">
            <Clock className={`h-5 w-5 ${timeRemaining < 60 ? "text-destructive" : "text-primary"}`} />
            <span className={timeRemaining < 60 ? "text-destructive" : "text-foreground"}>
              {formatTime(timeRemaining)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1}/{questions.length}
            </span>
            <Button onClick={finishExam}>Terminer</Button>
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Question Navigator (Sidebar) */}
          <div className="hidden lg:block">
            <Card className="sticky top-24">
              <CardContent className="p-4">
                <h3 className="mb-4 font-semibold text-foreground">Navigation</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(index)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        currentQuestionIndex === index
                          ? "bg-primary text-primary-foreground"
                          : answers[q.id]
                            ? "bg-green-100 text-green-700"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                      } ${flaggedQuestions.includes(q.id) ? "ring-2 ring-yellow-500" : ""}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-primary" />
                    <span className="text-foreground">Question actuelle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-green-100" />
                    <span className="text-foreground">Répondue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted ring-2 ring-yellow-500" />
                    <span className="text-foreground">Marquée</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="p-6">
                {/* Question Header */}
                <div className="mb-6 flex items-start justify-between">
                  <Badge variant="secondary" className="text-xs">
                    Question {currentQuestionIndex + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFlag}
                    className={
                      flaggedQuestions.includes(currentQuestion.id) ? "text-yellow-500" : "text-muted-foreground"
                    }
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    {flaggedQuestions.includes(currentQuestion.id) ? "Marquée" : "Marquer"}
                  </Button>
                </div>

                {/* Question Text */}
                <h2 className="mb-6 text-xl font-semibold text-foreground">{currentQuestion.question}</h2>

                {/* Options */}
                <RadioGroup value={selectedAnswer || ""} onValueChange={handleAnswer} className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    let optionClass = "border-border"
                    if (showCorrection) {
                      if (option.id === currentQuestion.correctAnswer) {
                        optionClass = "border-green-500 bg-green-50"
                      } else if (option.id === selectedAnswer && option.id !== currentQuestion.correctAnswer) {
                        optionClass = "border-red-500 bg-red-50"
                      }
                    } else if (selectedAnswer === option.id) {
                      optionClass = "border-primary bg-primary/5"
                    }

                    return (
                      <div
                        key={option.id}
                        className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${optionClass}`}
                      >
                        <RadioGroupItem value={option.id} id={option.id} disabled={showCorrection} />
                        <Label htmlFor={option.id} className="flex-1 cursor-pointer text-foreground">
                          <span className="mr-2 font-medium uppercase">{option.id}.</span>
                          {option.text}
                        </Label>
                        {showCorrection && option.id === currentQuestion.correctAnswer && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {showCorrection &&
                          option.id === selectedAnswer &&
                          option.id !== currentQuestion.correctAnswer && <XCircle className="h-5 w-5 text-red-500" />}
                      </div>
                    )
                  })}
                </RadioGroup>

                {/* Correction */}
                {showCorrection && (
                  <div
                    className={`mt-6 rounded-lg p-4 ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                        {isCorrect ? "Bonne réponse !" : "Mauvaise réponse"}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-foreground">Explication</h4>
                        <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>Référence: {currentQuestion.reference}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="bg-transparent"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Précédent
                  </Button>

                  <div className="flex gap-3">
                    {!showCorrection && selectedAnswer && (
                      <Button onClick={validateAnswer} variant="secondary">
                        Valider
                      </Button>
                    )}
                    {showCorrection && currentQuestionIndex < questions.length - 1 && (
                      <Button onClick={nextQuestion}>
                        Suivant
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                    {showCorrection && currentQuestionIndex === questions.length - 1 && (
                      <Button onClick={finishExam}>Terminer l'examen</Button>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="bg-transparent"
                  >
                    Suivant
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Exit Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter l'examen ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir quitter ? Votre progression sera perdue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/tableau-de-bord")}>Quitter</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
