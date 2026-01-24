import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { GoogleTranslateFix } from "@/components/google-translate-fix"
import { Providers } from "@/components/providers"

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
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          <GoogleTranslateFix />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
