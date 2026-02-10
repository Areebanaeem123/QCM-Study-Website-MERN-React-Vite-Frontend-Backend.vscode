"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, User, Package, Play, Trophy, ClipboardCheck, Book, Search, MessageSquare, BarChart2, Clock, FileText, ImageIcon, LogOut, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarLinks = [
  { href: "/admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin-dashboard/users", label: "Users", icon: User },
  { href: "/admin-dashboard/mcqs", label: "MCQs", icon: ClipboardCheck },
  { href: "/admin-dashboard/mcq-approvals", label: "MCQ Approvals", icon: Play },
  { href: "/admin-dashboard/packs", label: "Packs", icon: Package },
  { href: "/admin-dashboard/mock-exams", label: "Mock Exams", icon: Play },
  { href: "/admin-dashboard/question-banks", label: "Question Banks", icon: Book },
  { href: "/admin-dashboard/research", label: "Research", icon: Search },
  { href: "/admin-dashboard/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/admin-dashboard/statistics", label: "Statistics", icon: BarChart2 },
  { href: "/admin-dashboard/activity", label: "Recent Activity", icon: Clock },
  { href: "/admin-dashboard/pages", label: "Pages", icon: FileText },
  { href: "/admin-dashboard/sliders", label: "Sliders", icon: ImageIcon },
]

export function AdminSidebar() {
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
            <LayoutDashboard className="h-5 w-5 text-sidebar" />
          </div>
          <span className="text-l font-bold" suppressHydrationWarning>Admin Dashboard</span>
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
