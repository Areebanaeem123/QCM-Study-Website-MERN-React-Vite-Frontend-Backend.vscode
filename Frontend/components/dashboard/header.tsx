"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

import { useCurrentUser, useLogout } from "@/lib/auth-hooks"

export function DashboardHeader() {
  const { user, isLoading } = useCurrentUser()
  const logout = useLogout()

  const initials = user 
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() 
    : "AD"

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6" suppressHydrationWarning>
      <div className="flex items-center gap-4 md:ml-0 ml-12" suppressHydrationWarning>
        {/* Search bar removed */}
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell removed */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profile_picture || "/student-avatar.png"} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden font-medium md:inline-block" suppressHydrationWarning>
                {isLoading ? "Chargement..." : user ? `${user.first_name} ${user.last_name}` : "Alex Dupont"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" suppressHydrationWarning>
            <DropdownMenuLabel suppressHydrationWarning>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/tableau-de-bord/profil" suppressHydrationWarning>Profil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/tableau-de-bord/mes-packs" suppressHydrationWarning>Mes Packs</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive" suppressHydrationWarning>
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
