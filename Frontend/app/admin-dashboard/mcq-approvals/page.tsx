"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AdminMcqApprovalsPage() {
  const [pendingMcqs, setPendingMcqs] = useState([
    {
      id: "MCQ901",
      question: "Quelle planète est connue sous le nom de planète rouge ?",
      subject: "Astronomie",
      lesson: "Système Solaire",
      author: "Rédacteur Rang 4",
    },
    {
      id: "MCQ902",
      question: "Quelle est la centrale énergétique de la cellule ?",
      subject: "Biologie",
      lesson: "Cellules",
      author: "Rédacteur Rang 5",
    },
  ])

  const handleApprove = (id: string) => {
    setPendingMcqs((prev) => prev.filter((mcq) => mcq.id !== id))
  }

  const handleReject = (id: string) => {
    setPendingMcqs((prev) => prev.filter((mcq) => mcq.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Approbation des QCM</h2>
        <p className="text-muted-foreground">
          Examinez et approuvez les QCM soumis par les rédacteurs.
        </p>
      </div>

      {pendingMcqs.length === 0 ? (
        <p className="text-muted-foreground">Aucun QCM en attente 🎉</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pendingMcqs.map((mcq) => (
            <Card key={mcq.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{mcq.id}</CardTitle>
                  <Badge variant="secondary">{mcq.subject}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-medium">{mcq.question}</p>
                <p className="text-sm text-muted-foreground">
                  Leçon : {mcq.lesson}
                </p>
                <p className="text-sm text-muted-foreground">
                  Soumis par : {mcq.author}
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    Prévisualiser
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(mcq.id)}
                  >
                    Approuver
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(mcq.id)}
                  >
                    Rejeter
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
