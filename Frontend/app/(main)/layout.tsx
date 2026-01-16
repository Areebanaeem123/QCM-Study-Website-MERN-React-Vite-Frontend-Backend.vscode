import type React from "react"
import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col" suppressHydrationWarning>
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={null}>{children}</Suspense>
      </main>
      <Footer />
    </div>
  )
}
