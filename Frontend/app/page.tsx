import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesCarousel } from "@/components/features-carousel"
import { UniversitySelector } from "@/components/university-selector"
import { WelcomeSection } from "@/components/welcome-section"
import { WhyChooseUs } from "@/components/why-choose-us"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturesCarousel />
      <UniversitySelector />
      <WelcomeSection />
      <WhyChooseUs />
      <Footer />
    </main>
  )
}
