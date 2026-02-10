"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// 🔹 Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function AdminStatisticsPage() {
  // Example datasets
  const studentData = {
    labels: ["Jan", "Fév", "Mar", "Avr", "Mai"],
    datasets: [
      {
        label: "Étudiants Inscrits",
        data: [50, 75, 150, 100, 200],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
      },
    ],
  }

  const packsData = {
    labels: ["Pack A", "Pack B", "Pack C", "Pack D"],
    datasets: [
      {
        label: "Packs Vendus",
        data: [120, 80, 150, 200],
        backgroundColor: "rgba(16, 185, 129, 0.7)",
      },
    ],
  }

  const mcqData = {
    labels: ["Mathématiques", "Physique", "Chimie", "Biologie"],
    datasets: [
      {
        label: "QCM Créés",
        data: [100, 80, 60, 120],
        backgroundColor: "rgba(234, 179, 8, 0.7)",
      },
    ],
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tableau de Bord des Statistiques</h2>

      {/* Students Enrolled */}
      <Card>
        <CardHeader>
          <CardTitle>Étudiants Inscrits</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={studentData} />
        </CardContent>
      </Card>

      {/* Packs Sold */}
      <Card>
        <CardHeader>
          <CardTitle>Packs Vendus</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={packsData} />
        </CardContent>
      </Card>

      {/* MCQs Created */}
      <Card>
        <CardHeader>
          <CardTitle>QCM Créés</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={mcqData} />
        </CardContent>
      </Card>
    </div>
  )
}
