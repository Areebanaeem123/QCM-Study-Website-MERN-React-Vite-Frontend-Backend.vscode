"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
import { DashboardService } from "@/lib/dashboard-service"



export default function QCMSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const packId = searchParams.get("pack")
  const questionBankId = searchParams.get("question_bank")
  const mockExamId = searchParams.get("mock_exam")
  const questionCount = parseInt(searchParams.get("questions") || "20")
  const timerEnabled = searchParams.get("timer") === "true"

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([])
  const [showCorrection, setShowCorrection] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(300) 
  const [isFinished, setIsFinished] = useState(false)

  // Fetch Questions
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true)
        const data = await DashboardService.getSessionQuestions({
          pack_id: packId || undefined,
          question_bank_id: questionBankId || undefined,
          mock_exam_id: mockExamId || undefined
        })
        
        // Take only the requested amount
        const sliced = data.slice(0, questionCount)
        setQuestions(sliced)
        
        // Adjust timer if enabled
        if (timerEnabled) {
          setTimeRemaining(sliced.length * 60)
        } else {
          setTimeRemaining(3600 * 2) // 2 hours default for practice
        }
      } catch (err: any) {
        console.error("Failed to load questions", err)
        setError(err.message || "Impossible de charger les questions")
      } finally {
        setLoading(false)
      }
    }
    loadQuestions()
  }, [packId, questionBankId, mockExamId, questionCount, timerEnabled])

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  // Timer
  useEffect(() => {
    if (isFinished || timeRemaining <= 0 || loading) return

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
  }, [isFinished, timeRemaining, loading])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = (value: string) => {
    if (!currentQuestion) return
    
    const isEvaluate = currentQuestion.question_type?.answer_mode === "true_false_per_option"
    
    if (isEvaluate) {
      const currentAnswers = (answers[currentQuestion.id] as string[]) || []
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter(id => id !== value)
        : [...currentAnswers, value]
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: newAnswers }))
    } else {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
    }
  }

  const toggleFlag = () => {
    if (!currentQuestion) return
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

  const finishExam = useCallback(async () => {
    setIsFinished(true)
    // Calculate score
    let correct = 0
    const processedResponses: any[] = []

    questions.forEach((q) => {
      const isEvaluate = q.question_type?.answer_mode === "true_false_per_option"
      
      if (isEvaluate) {
        const selectedIds = (answers[q.id] as string[]) || []
        const correctIds = q.options.filter((o: any) => o.is_correct).map((o: any) => o.id)
        const incorrectIds = q.options.filter((o: any) => !o.is_correct).map((o: any) => o.id)
        
        // Scoring: (Correct True picks + Correct False picks) / Total Options
        let questionPoints = 0
        q.options.forEach((o: any) => {
          const isSelected = selectedIds.includes(o.id)
          if ((o.is_correct && isSelected) || (!o.is_correct && !isSelected)) {
            questionPoints += (1 / q.options.length)
          }
        })
        
        correct += questionPoints
        processedResponses.push({
          mcq_id: q.id,
          selected_option_ids: selectedIds,
          is_correct: questionPoints === 1.0
        })
      } else {
        const correctOption = q.options.find((o: any) => o.is_correct)
        const isCorrect = answers[q.id] === correctOption?.id
        if (isCorrect) correct += 1
        
        processedResponses.push({
          mcq_id: q.id,
          selected_option_id: answers[q.id] || null,
          is_correct: isCorrect
        })
      }
    })

    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0
    
    // Submit to backend
    try {
      await DashboardService.submitQuizResult({
        pack_id: packId || undefined,
        question_bank_id: questionBankId || undefined,
        mock_exam_id: mockExamId || undefined,
        score: score,
        total_questions: questions.length,
        correct_answers: correct,
        mode: timerEnabled ? "exam" : "practice",
        time_taken: (timerEnabled ? (questions.length * 60) - timeRemaining : 3600*2 - timeRemaining),
        responses: processedResponses
      })
    } catch (err) {
      console.error("Failed to save results:", err)
    }

    router.push(`/qcm/resultats?score=${score}&correct=${correct}&total=${questions.length}`)
  }, [answers, questions, router, packId, questionBankId, mockExamId, timerEnabled, timeRemaining])

  // Auto-finish when time runs out
  useEffect(() => {
    if (timeRemaining <= 0 && !isFinished && !loading && questions.length > 0) {
      finishExam()
    }
  }, [timeRemaining, isFinished, finishExam, loading, questions.length])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Chargement de votre session...</p>
        </div>
      </div>
    )
  }

  if (error || (questions.length === 0 && !loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold">Erreur de chargement</h2>
            <p className="text-muted-foreground">
              {error || "Ce pack ne contient aucune question pour le moment ou vous n'avez pas les droits nécessaires."}
            </p>
            <Button onClick={() => router.push("/tableau-de-bord/commencer-qcm")}>
              Retourner à la sélection
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedAnswer = answers[currentQuestion.id]
  const correctOption = currentQuestion.options.find((o: any) => o.is_correct)
  const isCorrect = selectedAnswer === correctOption?.id

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
              <Badge variant="secondary">{currentQuestion.subject_name || "Général"}</Badge>
              <Badge variant="outline">{currentQuestion.lesson_name || "QCM"}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 text-lg font-semibold">
            <Clock className={`h-5 w-5 ${timeRemaining < 60 ? "text-destructive" : "text-primary"}`} />
            <span className={timeRemaining < 60 ? "text-destructive" : "text-foreground"}>
              {formatTime(timeRemaining)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground mr-4 hidden lg:inline">
              Session d'étude : {searchParams.get("name") || "Entraînement"}
            </span>
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
                <h2 className="mb-6 text-xl font-semibold text-foreground">{currentQuestion.question_text}</h2>

                {/* Options */}
                {currentQuestion.question_type?.answer_mode === "true_false_per_option" ? (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option: any) => {
                      const isSelected = (answers[currentQuestion.id] as string[] || []).includes(option.id)
                      let optionClass = "border-border"
                      if (showCorrection) {
                        if (option.is_correct) {
                          optionClass = "border-green-500 bg-green-50"
                        } else if (isSelected && !option.is_correct) {
                          optionClass = "border-red-500 bg-red-50"
                        }
                      } else if (isSelected) {
                        optionClass = "border-primary bg-primary/5"
                      }

                      return (
                        <div
                          key={option.id}
                          className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${optionClass}`}
                        >
                          <Checkbox 
                            id={option.id} 
                            checked={isSelected}
                            onCheckedChange={() => handleAnswer(option.id)}
                            disabled={showCorrection}
                          />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer text-foreground">
                            {option.option_text}
                          </Label>
                          {showCorrection && (
                            <div className="flex items-center gap-2">
                              {option.is_correct ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">Vrai</Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground border-dashed">Faux</Badge>
                              )}
                              {option.is_correct && <CheckCircle className="h-5 w-5 text-green-500" />}
                              {isSelected && !option.is_correct && <XCircle className="h-5 w-5 text-red-500" />}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <RadioGroup value={selectedAnswer || ""} onValueChange={handleAnswer} className="space-y-3">
                    {currentQuestion.options.map((option: any) => {
                      let optionClass = "border-border"
                      if (showCorrection) {
                        if (option.is_correct) {
                          optionClass = "border-green-500 bg-green-50"
                        } else if (option.id === selectedAnswer && !option.is_correct) {
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
                            {option.option_text}
                          </Label>
                          {showCorrection && option.is_correct && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {showCorrection &&
                            option.id === selectedAnswer &&
                            !option.is_correct && <XCircle className="h-5 w-5 text-red-500" />}
                        </div>
                      )
                    })}
                  </RadioGroup>
                )}

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
                      {correctOption?.explanation && (
                        <div>
                          <h4 className="font-medium text-foreground">Explication</h4>
                          <p className="text-sm text-muted-foreground">{correctOption.explanation}</p>
                        </div>
                      )}
                      {currentQuestion.reference && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span>Référence: {currentQuestion.reference}</span>
                        </div>
                      )}
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
