"use client"

import type React from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { useRequireAdmin } from "@/lib/auth-hooks"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useRequireAdmin()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-muted/30" suppressHydrationWarning>
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b border-border bg-background px-4 md:px-6" suppressHydrationWarning>
          <div className="flex items-center gap-3">
            <span className="font-medium" suppressHydrationWarning>Admin Erick</span>
            <img src="/student-avatar.png" alt="Admin Avatar" className="h-8 w-8 rounded-full" />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
