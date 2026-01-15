"use client"

import Link from "next/link"
import { GraduationCap, Mail, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer id="contact" className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-foreground" />
              </div>
              <span className="text-xl font-bold text-background">QCM-Study</span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">Des QCM pour réussir ta 1ère année de médecine</p>
          </div>

          {/* Informations */}
          <div>
            <h4 className="font-semibold text-background mb-4">Informations</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-background/70 hover:text-background text-sm flex items-center gap-2 transition-colors"
                >
                  Comment utiliser la plateforme ?
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-background/70 hover:text-background text-sm flex items-center gap-2 transition-colors"
                >
                  Méthodes de paiement
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-background/70 hover:text-background text-sm flex items-center gap-2 transition-colors"
                >
                  Conditions générales d'utilisation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-background/70 hover:text-background text-sm flex items-center gap-2 transition-colors"
                >
                  Conditions générales de vente
                </Link>
              </li>
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h4 className="font-semibold text-background mb-4">Aide</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-background/70 hover:text-background text-sm flex items-center gap-2 transition-colors"
                >
                  Formulaire de contact
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <a
                  href="mailto:infos@qcm-study.ch"
                  className="text-background/70 hover:text-background text-sm flex items-center gap-2 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  infos@qcm-study.ch
                </a>
              </li>
            </ul>
          </div>

          {/* Mon compte */}
          <div>
            <h4 className="font-semibold text-background mb-4">Mon compte</h4>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-background/30 text-background hover:bg-background/10 hover:text-background"
              >
                Se connecter
              </Button>
              <Button className="w-full justify-start bg-background text-foreground hover:bg-background/90">
                Acheter des packs QCM
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-background/50 text-sm">© {new Date().getFullYear()} QCM-Study. Tous droits réservés.</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-background/50 hover:text-background text-sm transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="#" className="text-background/50 hover:text-background text-sm transition-colors">
                Mentions légales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
