"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Wallet, FileText, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

const features = [
  {
    icon: Wallet,
    title: "Des QCM dès 10 CHF",
    description: "Faites le point sur votre niveau avec nos packs abordables",
  },
  {
    icon: FileText,
    title: "Similaires aux examens",
    description: "Des QCM sur les concepts clés qui sont similaires aux examens !",
  },
  {
    icon: Target,
    title: "Corrections détaillées",
    description: "Des corrections détaillées avec chaque QCM pour mieux comprendre",
  },
]

export function FeaturesCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % features.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const next = () => setCurrent((prev) => (prev + 1) % features.length)
  const prev = () => setCurrent((prev) => (prev - 1 + features.length) % features.length)

  return (
    <section id="features" className="py-16 md:py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">Pourquoi nous choisir ?</h2>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-3xl p-8 md:p-12 shadow-lg border border-border"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  {(() => {
                    const Icon = features[current].icon
                    return <Icon className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                  })()}
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{features[current].title}</h3>
                  <p className="text-lg text-muted-foreground">{features[current].description}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="outline" size="icon" onClick={prev} className="rounded-full w-12 h-12 bg-transparent">
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex gap-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    current === index ? "bg-primary w-8" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>

            <Button variant="outline" size="icon" onClick={next} className="rounded-full w-12 h-12 bg-transparent">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
