import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { PopularPacksSection } from "@/components/landing/popular-packs-section"
import { StatsSection } from "@/components/landing/stats-section"
import { AboutSection } from "@/components/landing/about-section"
import { ContactSection } from "@/components/landing/contact-section"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col" suppressHydrationWarning>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <PopularPacksSection />
        <StatsSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
