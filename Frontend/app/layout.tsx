import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "QCM Study - Maîtrisez Vos Examens Médicaux",
  description:
    "Plateforme de préparation aux examens médicaux avec QCM, examens blancs et analyses de performance pour les étudiants en médecine.",
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#7a1f1f",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
