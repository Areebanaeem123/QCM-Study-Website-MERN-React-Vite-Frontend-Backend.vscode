import { Heart, BookOpen, TrendingUp } from "lucide-react"

const stats = [
  {
    icon: Heart,
    value: "12 500+",
    label: "Étudiants",
    color: "text-red-500",
  },
  {
    icon: BookOpen,
    value: "50 000",
    label: "QCM Complétés",
    color: "text-primary",
  },
  {
    icon: TrendingUp,
    value: "85%",
    label: "Taux de Réussite",
    color: "text-green-500",
  },
]

export function StatsSection() {
  return (
    <section className="border-y border-border bg-muted/30 py-12" suppressHydrationWarning>
      <div className="container mx-auto px-4" suppressHydrationWarning>
        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-center gap-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
