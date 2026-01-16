"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsConditionsPage() {
  return (
    <div
      className="container mx-auto max-w-4xl py-10"
      suppressHydrationWarning
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Conditions générales d&apos;utilisation de QCM-STUDY.CH
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 text-muted-foreground text-sm leading-relaxed">
          <section>
            <h3 className="font-semibold text-foreground">Préambule</h3>
            <p>
              Les présentes conditions générales d&apos;utilisation sont conclues
              entre :
            </p>
            <ul className="list-disc pl-6">
              <li>
                le gérant du site internet, ci-après désigné « l’Éditeur »,
              </li>
              <li>
                toute personne souhaitant accéder au site et à ses services,
                ci-après appelé « l’Utilisateur ».
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-foreground">
              Article 1 - Principes
            </h3>
            <p>
              Les présentes conditions générales d&apos;utilisation (CGU) ont
              pour objet l&apos;encadrement juridique de l’utilisation du site
              QCM-STUDY.CH et de ses services. Le site Internet www.qcm-study.ch
              est un service situé en Suisse. Les conditions générales
              d&apos;utilisation doivent être acceptées par tout Utilisateur et
              son accès au site vaut acceptation de ces conditions.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground">
              Article 2 - Évolution et durée des CGU
            </h3>
            <p>
              Les présentes conditions générales d&apos;utilisation sont
              conclues pour une durée indéterminée. Le contrat produit ses effets
              à l&apos;égard de l&apos;Utilisateur à compter du début de
              l’utilisation du service, c&apos;est-à-dire la création d&apos;un
              compte utilisateur. Le site QCM-STUDY se réserve le droit de
              modifier les clauses de ces conditions générales d’utilisation à
              tout moment et sans justification.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground">
              Article 3 - Accès au site
            </h3>
            <p>
              Tout Utilisateur ayant accès à internet peut accéder gratuitement
              et depuis n’importe où au site QCM-STUDY. Les frais supportés par
              l’Utilisateur pour y accéder ne sont pas à la charge de
              l’Éditeur. Le site comprend un espace membre payant réservé aux
              utilisateurs inscrits.
            </p>
            <p>
              Les services réservés aux membres incluent : l&apos;achat de packs
              QCM et d&apos;examens blancs, l&apos;utilisation des QCM en ligne,
              l&apos;obtention des corrections détaillées ainsi que des
              statistiques et classements.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground">
              Article 4 - Utilisation personnelle du compte
            </h3>
            <p>
              Le compte client créé par l&apos;Utilisateur est strictement
              réservé à un usage personnel. Toute transmission à un tiers peut
              entraîner l&apos;exclusion de l&apos;Utilisateur sans
              remboursement.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground">
              Article 5 - Responsabilités
            </h3>
            <p>
              La responsabilité de l&apos;Éditeur ne peut être engagée en cas
              d&apos;interruption, de panne ou de dysfonctionnement empêchant
              l&apos;accès au site ou à ses fonctionnalités.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground">
              Article 6 - Propriété intellectuelle
            </h3>
            <p>
              Tous les contenus proposés sur QCM-STUDY sont protégés par le droit
              de la propriété intellectuelle. Toute reproduction, diffusion ou
              utilisation non autorisée peut entraîner des poursuites
              judiciaires.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground">
              Article 7 - Protection des données personnelles
            </h3>
            <p>
              Les données personnelles collectées ont pour objectif la mise à
              disposition des services, leur amélioration et la sécurité du
              site. Les paiements sont gérés par stripe.com et aucune donnée
              bancaire n&apos;est stockée par QCM-STUDY.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground">
              Article 8 - Lien avec les universités suisses
            </h3>
            <p>
              QCM-STUDY est une structure privée indépendante, sans lien juridique
              ni économique avec les universités suisses.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground">
              Article 9 - Loi applicable
            </h3>
            <p>
              Les présentes conditions générales d&apos;utilisation sont
              soumises au droit suisse. Tout litige relève de la compétence des
              tribunaux suisses.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
