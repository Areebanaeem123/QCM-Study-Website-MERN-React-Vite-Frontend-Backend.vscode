"use client"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, GraduationCap, ShoppingBasket } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useBasket } from "@/lib/basket-context"

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/#about", label: "À Propos" },
  { href: "/#contact", label: "Contact" },
  { href: "/universities", label: "Universités" },
  { href: "/question-banks", label: "Banques de questions" },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { totalItems } = useBasket()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.jpeg" //  your logo file
              alt="QCM Study Logo"
              width="140" // adjust size if needed
              height="60"
              priority
              className="object-contain"
            />
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons & Basket */}
          <div className="hidden md:flex md:items-center md:gap-3">
            <Link href="/panier" className="relative mr-2 text-muted-foreground hover:text-primary transition-colors">
              <ShoppingBasket className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Link>
            <Button variant="ghost" asChild>
              <Link href="/connexion">Connexion</Link>
            </Button>
            <Button asChild>
              <Link href="/inscription">S'inscrire</Link>
            </Button>
          </div>

          {/* Mobile Menu Button & Basket */}
          <div className="flex items-center gap-4 md:hidden">
            <Link href="/panier" className="relative text-muted-foreground hover:text-primary transition-colors">
              <ShoppingBasket className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-96 pb-4" : "max-h-0",
          )}
        >
          <div className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button variant="ghost" asChild className="justify-start">
                <Link href="/connexion" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>
              </Button>
              <Button asChild className="justify-start">
                <Link href="/inscription" onClick={() => setMobileMenuOpen(false)}>S'inscrire</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
