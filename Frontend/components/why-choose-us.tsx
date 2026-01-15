"use client"

import { motion } from "framer-motion"
import { Coins, Crown, ListChecks, CheckCircle2 } from "lucide-react"

const reasons = [
  {
    icon: Coins,
    title: "Des prix abordables pour des QCM sur les concepts clé !",
    description:
      "Pour seulement 10 CHF, vous accédez à 50 QCM avec correction détaillée et classement dynamique vous permettant de faire le point sur les apprentissages d'un bloc de cours ou d'un système et de comparer votre niveau. Idéal pour savoir ce que vous devez approfondir.",
    highlights: ["50 QCM", "Correction détaillée", "Classement dynamique"],
  },
  {
    icon: Crown,
    title: "Ne payez jamais plus de 300 CHF sur une année !",
    description:
      "Nous récompensons la fidélité de nos étudiants, en permettant un accès libre à tous les packs et examens blancs si vous avez déjà acquis sur le site des packs ou examens blancs pour une valeur totale de 300 CHF.",
    highlights: ["Fidélité récompensée", "Accès illimité", "Économies garanties"],
  },
  {
    icon: ListChecks,
    title: "Un choix à la carte des sujets !",
    description:
      "Ne perdez pas votre temps sur des sujets que vous maitrisez. Ciblez vos points faibles et approfondissez ces sujets. Nos QCM se rapprochent un maximum des questions de l'examen sanctionnel et vous permettent d'être actif dans votre apprentissage.",
    highlights: ["Apprentissage ciblé", "Questions similaires aux examens", "Apprentissage actif"],
  },
]

export function WhyChooseUs() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Pourquoi choisir QCM-Study ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les avantages qui font de QCM-Study la plateforme idéale pour préparer vos examens
          </p>
        </motion.div>

        <div className="space-y-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="bg-card rounded-3xl p-8 md:p-10 border border-border hover:border-primary/20 hover:shadow-xl transition-all">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                  {/* Icon */}
                  <div className="shrink-0">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <reason.icon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">{reason.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-6">{reason.description}</p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-3">
                      {reason.highlights.map((highlight, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-sm font-medium text-primary"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Number */}
                  <div className="hidden lg:flex items-start">
                    <div className="text-8xl font-bold text-muted/50">{index + 1}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
