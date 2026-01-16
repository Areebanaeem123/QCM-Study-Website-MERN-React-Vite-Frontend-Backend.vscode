import { Target, Award, Users } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24" suppressHydrationWarning>
      <div className="container mx-auto px-4" suppressHydrationWarning >
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              À Propos de QCM Study
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              QCM Study est né de la volonté d'aider les étudiants en médecine à réussir leurs examens. Notre plateforme
              combine technologie moderne et expertise pédagogique pour offrir une expérience d'apprentissage optimale.
            </p>
            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Notre Mission</h3>
                  <p className="text-muted-foreground">
                    Démocratiser l'accès à une préparation de qualité pour tous les étudiants en médecine.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Notre Expertise</h3>
                  <p className="text-muted-foreground">
                    Une équipe de médecins et enseignants passionnés qui créent du contenu de qualité.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Notre Communauté</h3>
                  <p className="text-muted-foreground">
                    Plus de 12 500 étudiants nous font confiance pour leur préparation.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
              <img src="/team-of-medical-professionals-and-educators-workin.jpg" alt="Notre équipe" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
