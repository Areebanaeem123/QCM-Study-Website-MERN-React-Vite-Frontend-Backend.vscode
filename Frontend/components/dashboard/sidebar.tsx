"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GraduationCap, LayoutDashboard, Package, Play, Trophy, User, LogOut, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const sidebarLinks = [
  {
    href: "/tableau-de-bord",
    label: "Tableau de bord",
    icon: LayoutDashboard,
  },
  {
    href: "/tableau-de-bord/mes-packs",
    label: "Mes Packs",
    icon: Package,
  },
  {
    href: "/tableau-de-bord/commencer-qcm",
    label: "Commencer QCM",
    icon: Play,
  },
  {
    href: "/tableau-de-bord/classement",
    label: "Classement",
    icon: Trophy,
  },
  {
    href: "/tableau-de-bord/profil",
    label: "Profil",
    icon: User,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4" suppressHydrationWarning>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-foreground">
            <GraduationCap className="h-5 w-5 text-sidebar" />
          </div>
          <span className="text-xl font-bold" suppressHydrationWarning>QCM Study</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
                suppressHydrationWarning
              >
                <link.icon className="h-5 w-5" />
                <span suppressHydrationWarning>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border p-4" suppressHydrationWarning>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
            suppressHydrationWarning
          >
            <LogOut className="h-5 w-5" />
            <span suppressHydrationWarning>Déconnexion</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
