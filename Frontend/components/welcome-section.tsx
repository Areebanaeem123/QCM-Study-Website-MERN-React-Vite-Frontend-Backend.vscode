"use client"

import { motion } from "framer-motion"
import { Stethoscope, GraduationCap, Brain } from "lucide-react"

export function WelcomeSection() {
  return (
    <section id="about" className="py-16 md:py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 p-8 md:p-12">
              <div className="h-full rounded-2xl bg-card border border-border flex items-center justify-center relative overflow-hidden">
                {/* Decorative Icons */}
                <div className="absolute top-8 left-8 w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute bottom-8 right-8 w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="w-12 h-12 text-primary" />
                </div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
              Bienvenue !
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p className="text-pretty">
                La 1ère année de médecine est très compétitive ! Pour assurer leur réussite, les étudiants ont besoin de
                s'entraîner un maximum avec des QCM.
              </p>
              <p className="text-pretty">
                Partant de ce constat, de jeunes médecins fraîchement diplômés de l'Université de Genève ont fondé
                QCM-Study dont l'objectif principal est de driller les étudiants à répondre aux QCM de la manière la
                plus efficace et de les aider à préparer leurs examens.
              </p>
            </div>

            {/* Founder Badge */}
            <div className="mt-8 inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Fondé par des médecins</div>
                <div className="text-sm text-muted-foreground">Diplômés de l'Université de Genève</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
